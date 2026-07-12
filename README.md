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
- Pretendard Variable (셀프호스팅, `next/font/local`)
- 데이터: 브라우저 `localStorage` (개인정보 수집 없음 — Supabase/Prisma로 확장 가능한 스토어 구조)

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

Vercel에 바로 배포할 수 있습니다 (별도 환경 변수 불필요).

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
