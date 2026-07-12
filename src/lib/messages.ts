import { parseISO, todayISO } from "./dates";
import type { Habit, HabitStats } from "./types";

/** 날짜 기반 결정적 선택 — 하루 동안 같은 문구가 유지된다. */
function pickByDate<T>(arr: T[], salt = 0, iso: string = todayISO()): T {
  const d = parseISO(iso);
  const seed = d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate() + salt;
  return arr[seed % arr.length];
}

export const DAILY_QUOTES = [
  "작심삼일도 괜찮습니다. 오늘이 당신의 작심사일입니다.",
  "천천히 가도 괜찮습니다. 멈추지만 않으면 됩니다.",
  "다시 시작하는 사람이 결국 끝까지 갑니다.",
  "당신은 실패하지 않았습니다. 잠시 쉬었을 뿐입니다.",
  "완벽한 하루보다, 돌아온 오늘이 더 값집니다.",
  "가장 강한 사람은 넘어지지 않는 사람이 아니라 다시 일어나는 사람입니다.",
  "오늘 한 걸음이면 충분합니다.",
  "습관은 끊기는 게 아니라, 쉼표를 찍는 것입니다.",
];

export const RETURN_GREETINGS = [
  "오늘도 돌아와 주셔서 감사합니다.",
  "다시 시작하는 사람은 강합니다.",
  "한 번 더 시작한 것도 성장입니다.",
  "당신은 포기하지 않았습니다.",
  "오늘도 작심사일입니다.",
];

export const RESTART_CELEBRATIONS = [
  "다시 돌아오셨군요. 그게 진짜 실력입니다. 🌱",
  "쉼표 뒤에 다시 쓰는 문장이 더 단단합니다.",
  "오늘의 다시 시작을 기록했습니다. 당신의 용기에 박수를 보냅니다.",
  "포기하지 않고 돌아온 당신, 이미 어제의 나를 이겼습니다.",
];

export const COMPLETE_CHEERS = [
  "오늘의 씨앗을 심었습니다. 🌱",
  "작지만 확실한 한 걸음이었습니다.",
  "오늘도 해냈습니다. 내일의 내가 고마워할 거예요.",
  "빛이 하나 더 켜졌습니다. ✨",
];

export function dailyQuote(iso?: string): string {
  return pickByDate(DAILY_QUOTES, 0, iso);
}

export function returnGreeting(iso?: string): string {
  return pickByDate(RETURN_GREETINGS, 7, iso);
}

export function restartCelebration(iso?: string): string {
  return pickByDate(RESTART_CELEBRATIONS, 3, iso);
}

export function completeCheer(iso?: string): string {
  return pickByDate(COMPLETE_CHEERS, 11, iso);
}

/** 상황 인식형 한 줄 응원 (AI 코치) */
export function coachMessage(
  name: string | undefined,
  agg: { doneTodayCount: number; activeCount: number; totalRestarts: number }
): string {
  const who = name ? `${name}님, ` : "";
  if (agg.activeCount === 0) {
    return `${who}첫 습관을 심어볼까요? 아주 작게 시작해도 충분합니다.`;
  }
  if (agg.doneTodayCount === 0) {
    return `${who}${returnGreeting()} 오늘의 첫 완료를 기다리고 있어요.`;
  }
  if (agg.doneTodayCount >= agg.activeCount) {
    return `${who}오늘의 습관을 모두 마쳤습니다. 오늘 하루가 당신 편이었네요. ✨`;
  }
  return `${who}좋은 흐름이에요. ${agg.activeCount - agg.doneTodayCount}개만 더 하면 오늘을 가득 채웁니다.`;
}

/** 습관별 코멘트 (상세 페이지) */
export function habitComment(stats: HabitStats): string {
  if (stats.totalDays === 0) {
    return "아직 첫 기록 전입니다. 오늘이 가장 좋은 시작일이에요.";
  }
  if (!stats.doneToday && stats.lastDone && stats.currentJourney === 0) {
    return "잠시 쉬어갔을 뿐입니다. 오늘 다시 시작하면 됩니다.";
  }
  if (stats.currentJourney >= 4) {
    return `${stats.currentJourney}일째 이어지는 여정입니다. 작심사일을 넘었어요!`;
  }
  if (stats.restartCount >= 3) {
    return `${stats.restartCount}번 다시 시작했습니다. 그 횟수만큼 강해졌어요.`;
  }
  return "차곡차곡 쌓이고 있습니다. 오늘도 한 칸 채워볼까요?";
}

/** 주간 리포트 문단 생성 */
export function weeklyReport(
  name: string | undefined,
  agg: {
    weekDone: number;
    totalRestarts: number;
    recoveryRate: number;
    activeCount: number;
  }
): string[] {
  const who = name ? `${name}님` : "당신";
  const lines: string[] = [];
  lines.push(
    `이번 주 ${who}은 총 ${agg.weekDone}번 습관을 완료했습니다. 횟수보다 중요한 건, 이번 주에도 이 자리로 돌아왔다는 사실입니다.`
  );
  if (agg.totalRestarts > 0) {
    lines.push(
      `지금까지 ${agg.totalRestarts}번 다시 시작했습니다. 우리는 이것을 실패의 흔적이 아니라 회복력의 기록이라고 부릅니다.`
    );
  }
  lines.push(
    `현재 복귀율은 ${Math.round(agg.recoveryRate * 100)}%입니다. 잠시 멈추더라도 돌아오는 힘이 ${
      agg.recoveryRate >= 0.7 ? "아주 단단하게" : "조금씩"
    } 자라고 있어요.`
  );
  lines.push("다음 주에도 완벽할 필요는 없습니다. 돌아오기만 하면 됩니다.");
  return lines;
}

/** 습관 추천 (AI 추천) — 현재 습관 카테고리를 보고 겹치지 않는 것을 제안 */
export function recommendHabits(habits: Habit[]): Array<{
  name: string;
  emoji: string;
  reason: string;
  difficulty: "쉬움" | "보통" | "도전";
}> {
  const cats = new Set(habits.map((h) => h.category));
  const pool = [
    {
      name: "아침 물 한 잔",
      emoji: "💧",
      cat: "diet",
      reason: "가장 실패하기 어려운 습관이에요. 성공 경험을 쌓기 좋아요.",
      difficulty: "쉬움" as const,
    },
    {
      name: "자기 전 3분 스트레칭",
      emoji: "🧘",
      cat: "exercise",
      reason: "하루를 부드럽게 마무리하며 몸의 긴장을 풀어줘요.",
      difficulty: "쉬움" as const,
    },
    {
      name: "하루 한 문장 필사",
      emoji: "✍️",
      cat: "reading",
      reason: "독서보다 가볍게, 글과 가까워지는 연습이에요.",
      difficulty: "쉬움" as const,
    },
    {
      name: "점심 후 10분 산책",
      emoji: "🚶",
      cat: "exercise",
      reason: "식후 산책은 컨디션과 집중력을 함께 올려줘요.",
      difficulty: "보통" as const,
    },
    {
      name: "잠들기 전 휴대폰 멀리 두기",
      emoji: "🌙",
      cat: "meditation",
      reason: "수면의 질이 올라가면 모든 습관이 쉬워져요.",
      difficulty: "도전" as const,
    },
  ];
  return pool
    .filter((p) => !cats.has(p.cat as never))
    .slice(0, 3)
    .map(({ name, emoji, reason, difficulty }) => ({ name, emoji, reason, difficulty }));
}
