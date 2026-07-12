# 작심사일 (作心四日) 🌱

> 작심삼일은 끝이 아닙니다. 오늘도 다시 시작합니다.

**작심사일**은 연속 기록(Streak)에 집착하지 않고, 언제든 다시 시작할 수 있도록 돕는 습관 플랫폼입니다.

우리는 사용자의 실패를 기록하지 않습니다.
우리는 사용자의 **다시 시작한 용기**를 기록합니다.

## 핵심 가치

- **Restart over Perfection** — 완벽함보다 다시 시작
- **Consistency over Streak** — 연속보다 꾸준함
- **Small Progress Everyday** — 매일의 작은 진전
- **Every Restart Matters** — 모든 재시작은 소중하다

## 기존 습관 앱과 다른 점

| 기존 | 작심사일 |
| --- | --- |
| 🔥 30일 연속 | 🌱 18번 다시 시작 |
| 연속 기록 (Streak) | 복귀율 (Recovery Rate) |
| 실패 | Restart |
| Streak | Restart Journey |

## 주요 기능

- **씨앗이 자라는 완료 애니메이션** — 체크박스 대신 씨앗이 자랍니다
- **Restart Journey** — 끊긴 기록이 아니라 다시 시작한 여정의 타임라인
- **Restart Heatmap / Restart Calendar** — 완료한 날은 초록, 다시 시작한 날은 보랏빛
- **복귀율·재시작 횟수 통계** — 연속 기록 대신 돌아오는 힘을 측정
- **AI 코치** — 매일 한 줄 응원, 상황 인식형 격려, 주간 리포트, 습관 추천
- **온보딩 / 대시보드 / 습관 상세 / 통계 / 프로필 / 설정** 전체 플로우
- 반응형 (모바일 우선) · 다크모드 지원

## 기술 스택

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- TailwindCSS v4 (커스텀 디자인 토큰)
- Framer Motion (Apple 수준의 부드러운 이징)
- Lucide Icons
- Pretendard Variable (셀프호스팅, `next/font/local`) + Noto Serif KR (브랜드 타이포)
- 데이터: 오프라인 우선 — `localStorage`가 즉시 반응하고, Supabase가 설정되면 서버에 동기화
- PWA: 홈 화면 추가 지원 (manifest + 아이콘)

## 시작하기

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

```bash
npm run build   # 프로덕션 빌드
npm run start   # 프로덕션 서버
npm run lint    # ESLint
```

환경 변수 없이도 **로컬 전용 모드**로 완전히 동작합니다. Vercel에 바로 배포 가능.

## Supabase 동기화 켜기 (선택)

1. [supabase.com](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `supabase/migrations/0001_init.sql` 실행
3. **Authentication → Sign In / Up → Allow anonymous sign-ins** 활성화
4. `.env.local`에 키 입력 (`.env.example` 참고):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 동기화 설계

- **`habit_logs`만이 진실**입니다. 재시작 횟수·복귀율·성공한 날은 컬럼으로 저장하지 않고
  로그에서 파생합니다 (SQL 정의: `habit_stats()` 함수, 클라이언트 정의: `src/lib/stats.ts`).
- `(habit_id, log_date)` 복합 PK + upsert라 같은 체크가 중복 전송돼도 멱등입니다.
- 첫 진입 시 **익명 로그인**(`signInAnonymously`)으로 가입 벽 없이 시작하고,
  나중에 이메일/소셜을 연결해도 같은 `user_id`가 유지됩니다.
- 쓰기는 낙관적으로 로컬에 먼저 반영되고 큐(`src/lib/sync-queue.ts`)에 쌓여
  오프라인이어도 유실 없이, 재연결 시 자동으로 서버에 반영됩니다.
- 기존 localStorage 사용자는 첫 로그인 때 기록이 자동으로 서버에 업로드됩니다(양방향 병합).

## 페이지 구성

| 경로 | 설명 |
| --- | --- |
| `/` | 랜딩 — 브랜드 철학과 히어로 |
| `/about` | 소개 — 작심사일의 믿음과 핵심 가치 |
| `/onboarding` | 3단계 온보딩 (철학 → 이름 → 습관 심기) |
| `/dashboard` | 오늘의 습관, 이번 주, 요약 통계, AI 응원 |
| `/habits/[id]` | 습관 상세 — Restart Calendar & Journey |
| `/statistics` | Restart Heatmap, 복귀율, Growth Timeline, 주간 리포트 |
| `/profile` | 프로필과 여정의 훈장(배지) |
| `/settings` | 테마, 알림, 데이터 관리 |

## UX 원칙

사용자가 죄책감을 느끼면 안 됩니다.

- ❌ 기록이 끊어졌어요.
- ⭕ 오늘 다시 시작하면 됩니다.
