-- 프로필(이름·목표)을 계정에 귀속시킨다.
-- 소셜 로그인으로 계정을 오가도 이름/목표가 그 계정을 따라다니게 하기 위함.
-- 유저당 한 행 (user_id PK) — upsert 멱등.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  goal text null,
  joined_at date not null,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "own profile" on public.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
