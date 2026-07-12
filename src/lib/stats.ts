import { addDays, diffDays, lastNDays, todayISO } from "./dates";
import type { Habit, HabitStats, Journey } from "./types";

/** 완료 날짜 배열 → 연속 구간(여정) 목록 */
export function computeJourneys(completions: string[]): Journey[] {
  const days = [...new Set(completions)].sort();
  const journeys: Journey[] = [];
  let start: string | null = null;
  let prev: string | null = null;

  for (const day of days) {
    if (start === null) {
      start = day;
    } else if (prev !== null && diffDays(prev, day) > 1) {
      journeys.push(makeJourney(start, prev, journeys));
      start = day;
    }
    prev = day;
  }
  if (start !== null && prev !== null) {
    journeys.push(makeJourney(start, prev, journeys));
  }
  return journeys;
}

function makeJourney(start: string, end: string, before: Journey[]): Journey {
  const last = before[before.length - 1];
  const gapBefore = last ? diffDays(last.end, start) - 1 : 0;
  return {
    start,
    end,
    length: diffDays(start, end) + 1,
    isRestart: before.length > 0,
    gapBefore,
  };
}

export function computeStats(habit: Habit, today: string = todayISO()): HabitStats {
  const journeys = computeJourneys(habit.completions);
  const set = new Set(habit.completions);
  const doneToday = set.has(today);
  const last = journeys[journeys.length - 1] ?? null;
  const lastDone = last ? last.end : null;

  // 현재 여정: 마지막 완료가 오늘이거나 어제면 아직 살아있는 여정으로 본다.
  let currentJourney = 0;
  if (last && diffDays(last.end, today) <= 1) {
    currentJourney = last.length;
  }

  const restartCount = journeys.filter((j) => j.isRestart).length;

  // 복귀율: 발생한 공백 중 실제로 돌아온 비율. 아직 돌아오지 않은 공백은 미회복.
  const closedGaps = restartCount;
  const openGap = last !== null && diffDays(last.end, today) > 1 ? 1 : 0;
  const totalGaps = closedGaps + openGap;
  const recoveryRate = totalGaps === 0 ? 1 : closedGaps / totalGaps;

  const recent = lastNDays(30, today);
  const done30 = recent.filter((d) => set.has(d) && d >= habit.createdAt).length;
  const span = Math.min(30, diffDays(habit.createdAt, today) + 1);
  const successRate30 = span <= 0 ? 0 : done30 / span;

  return {
    journeys,
    restartCount,
    totalDays: set.size,
    currentJourney,
    longestJourney: journeys.reduce((m, j) => Math.max(m, j.length), 0),
    recoveryRate,
    successRate30,
    doneToday,
    lastDone,
  };
}

/** 오늘 완료하면 '다시 시작'이 되는가? (마지막 완료가 2일 이상 전이거나 첫 완료가 아님) */
export function willBeRestart(habit: Habit, today: string = todayISO()): boolean {
  const days = [...habit.completions].sort();
  const last = days[days.length - 1];
  if (!last) return false;
  return diffDays(last, today) > 1;
}

/** 여러 습관 합산 통계 */
export function aggregateStats(habits: Habit[], today: string = todayISO()) {
  const active = habits.filter((h) => !h.archived);
  const all = active.map((h) => ({ habit: h, stats: computeStats(h, today) }));

  const totalRestarts = all.reduce((s, x) => s + x.stats.restartCount, 0);
  const totalDays = all.reduce((s, x) => s + x.stats.totalDays, 0);
  const doneTodayCount = all.filter((x) => x.stats.doneToday).length;

  const week = lastNDays(7, today);
  const weekDone = active.reduce(
    (s, h) => s + week.filter((d) => h.completions.includes(d)).length,
    0
  );

  const month = today.slice(0, 7);
  const monthDone = active.reduce(
    (s, h) => s + h.completions.filter((d) => d.startsWith(month)).length,
    0
  );

  const recovered = all.filter((x) => x.stats.journeys.length > 0);
  const recoveryRate =
    recovered.length === 0
      ? 1
      : recovered.reduce((s, x) => s + x.stats.recoveryRate, 0) / recovered.length;

  const longest = all.reduce<null | { habit: Habit; length: number }>((best, x) => {
    if (x.stats.longestJourney === 0) return best;
    if (!best || x.stats.longestJourney > best.length) {
      return { habit: x.habit, length: x.stats.longestJourney };
    }
    return best;
  }, null);

  return {
    perHabit: all,
    activeCount: active.length,
    doneTodayCount,
    totalRestarts,
    totalDays,
    weekDone,
    monthDone,
    recoveryRate,
    longest,
  };
}

/** 히트맵용: 날짜 → 완료 습관 수, 그리고 그 날짜가 '다시 시작'이었는지 */
export function buildDayMap(habits: Habit[]) {
  const counts = new Map<string, number>();
  const restarts = new Set<string>();
  for (const h of habits.filter((x) => !x.archived)) {
    for (const j of computeJourneys(h.completions)) {
      if (j.isRestart) restarts.add(j.start);
    }
    for (const d of h.completions) {
      counts.set(d, (counts.get(d) ?? 0) + 1);
    }
  }
  return { counts, restarts };
}

/** 데모 시나리오: 끊겼다가 다시 시작하는 패턴을 가진 완료 기록 생성 */
export function demoCompletions(
  daysAgo: number,
  pattern: Array<{ run: number; gap: number }>,
  today: string = todayISO()
): string[] {
  const out: string[] = [];
  let cursor = addDays(today, -daysAgo);
  for (const { run, gap } of pattern) {
    for (let i = 0; i < run; i++) {
      if (cursor <= today) out.push(cursor);
      cursor = addDays(cursor, 1);
    }
    cursor = addDays(cursor, gap);
  }
  return out.filter((d) => d <= today);
}
