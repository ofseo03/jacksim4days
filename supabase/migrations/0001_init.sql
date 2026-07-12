-- 작심사일 초기 스키마
--
-- 설계 원칙: habit_logs만이 진실(source of truth)이다.
-- 재시작 횟수·복귀율·성공한 날 같은 지표는 절대 컬럼으로 저장하지 않고
-- 아래 뷰/함수로 로그에서 파생시킨다. (오프라인 동기화 시 카운터 불일치 방지)

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  emoji text not null default '🌱',
  category text not null default 'custom',
  created_at timestamptz not null default now(),
  archived_at timestamptz null
);

create table if not exists public.habit_logs (
  habit_id uuid not null references public.habits (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  completed_at timestamptz not null default now(),
  -- 복합 PK: 같은 날 두 번 체크해도 중복이 원천 차단된다 (upsert 멱등)
  primary key (habit_id, log_date)
);

create index if not exists habit_logs_user_date_idx
  on public.habit_logs (user_id, log_date);

-- ---------- RLS ----------

alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

create policy "own habits" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own logs" on public.habit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- 파생 지표 ----------
--
-- 정의 (클라이언트 src/lib/stats.ts와 동일해야 한다):
--   여정(journey)   = 연속된 완료 구간
--   재시작(restart) = 직전 완료일과 2일 이상 벌어진 완료일 (첫 완료는 재시작이 아님)
--   중단(gap)       = 여정과 여정 사이의 공백. 마지막 완료가 어제보다 이전이면
--                     '아직 돌아오지 않은 중단(open gap)' 1건으로 센다.
--   복귀율          = 재시작 횟수 / (재시작 횟수 + open gap)
--                     중단이 한 번도 없으면 1로 정의한다.

create or replace view public.habit_restart_days as
select
  l.habit_id,
  l.user_id,
  l.log_date,
  (lag(l.log_date) over (partition by l.habit_id order by l.log_date)) as prev_date,
  (l.log_date
     - lag(l.log_date) over (partition by l.habit_id order by l.log_date)
   ) > 1 as is_restart
from public.habit_logs l;

create or replace function public.habit_stats(p_habit_id uuid)
returns table (
  total_days bigint,
  restart_count bigint,
  open_gap int,
  recovery_rate numeric,
  last_done date
)
language sql
stable
security invoker
as $$
  with r as (
    select * from public.habit_restart_days where habit_id = p_habit_id
  ),
  agg as (
    select
      count(*) as total_days,
      count(*) filter (where coalesce(is_restart, false)) as restart_count,
      max(log_date) as last_done
    from r
  )
  select
    agg.total_days,
    agg.restart_count,
    case when agg.last_done < current_date - 1 then 1 else 0 end as open_gap,
    case
      when agg.restart_count = 0
       and (agg.last_done is null or agg.last_done >= current_date - 1)
      then 1
      else agg.restart_count::numeric
           / (agg.restart_count
              + case when agg.last_done < current_date - 1 then 1 else 0 end)
    end as recovery_rate,
    agg.last_done
  from agg;
$$;
