/** 날짜는 항상 로컬 기준 'YYYY-MM-DD' 문자열로 다룬다. */

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** b - a (일 단위) */
export function diffDays(a: string, b: string): number {
  const ms = parseISO(b).getTime() - parseISO(a).getTime();
  return Math.round(ms / 86400000);
}

/** 최근 n일의 ISO 날짜 배열 (오래된 날짜부터, 오늘 포함) */
export function lastNDays(n: number, end: string = todayISO()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDays(end, -i));
  return out;
}

/** 이번 주(월요일 시작) ISO 날짜 배열 */
export function thisWeek(base: string = todayISO()): string[] {
  const d = parseISO(base);
  const dow = (d.getDay() + 6) % 7; // 월=0
  const monday = addDays(base, -dow);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** 해당 월의 달력 그리드 (월요일 시작, null은 빈 칸) */
export function monthGrid(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(toISODate(new Date(year, month, d)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function formatKorean(iso: string): string {
  const d = parseISO(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function formatShort(iso: string): string {
  const d = parseISO(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export const WEEKDAY_KO = ["월", "화", "수", "목", "금", "토", "일"];

export function weekdayKo(iso: string): string {
  return WEEKDAY_KO[(parseISO(iso).getDay() + 6) % 7];
}
