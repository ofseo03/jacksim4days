export type HabitCategory =
  | "exercise"
  | "diet"
  | "reading"
  | "study"
  | "english"
  | "meditation"
  | "quit"
  | "custom";

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  category: HabitCategory;
  /** 생성일 (YYYY-MM-DD) */
  createdAt: string;
  /** 완료한 날짜들 (YYYY-MM-DD, 정렬 보장 안 함) */
  completions: string[];
  archived?: boolean;
}

export interface Profile {
  name: string;
  goal?: string;
  joinedAt: string;
}

export interface AppSettings {
  reminders: boolean;
  weeklyReport: boolean;
  encouragement: boolean;
}

export interface AppState {
  version: 1;
  onboarded: boolean;
  profile: Profile | null;
  habits: Habit[];
  settings: AppSettings;
}

/** 연속 완료 구간 하나 = 하나의 여정 */
export interface Journey {
  start: string;
  end: string;
  length: number;
  /** 공백 후 다시 시작한 여정인가 (첫 여정은 false) */
  isRestart: boolean;
  /** 직전 여정과의 공백 일수 */
  gapBefore: number;
}

export interface HabitStats {
  journeys: Journey[];
  /** 다시 시작한 횟수 (첫 시작 제외) */
  restartCount: number;
  /** 총 성공한 날 */
  totalDays: number;
  /** 현재 진행 중인 여정 길이 (오늘 또는 어제까지 이어짐, 아니면 0) */
  currentJourney: number;
  /** 가장 길었던 여정 */
  longestJourney: number;
  /** 복귀율: 공백이 생겼을 때 다시 돌아온 비율 (0~1, 공백 없으면 1) */
  recoveryRate: number;
  /** 최근 30일 성공률 (0~1) */
  successRate30: number;
  /** 오늘 완료 여부 */
  doneToday: boolean;
  /** 마지막 완료일 (없으면 null) */
  lastDone: string | null;
}

export const CATEGORY_META: Record<HabitCategory, { label: string; emoji: string }> = {
  exercise: { label: "운동", emoji: "🏃" },
  diet: { label: "다이어트", emoji: "🥗" },
  reading: { label: "독서", emoji: "📖" },
  study: { label: "공부", emoji: "✏️" },
  english: { label: "영어", emoji: "🗣️" },
  meditation: { label: "명상", emoji: "🧘" },
  quit: { label: "금연·절제", emoji: "🚭" },
  custom: { label: "나만의 습관", emoji: "🌱" },
};

export const PRESET_HABITS: Array<{
  name: string;
  emoji: string;
  category: HabitCategory;
  difficulty: "쉬움" | "보통" | "도전";
}> = [
  { name: "아침 스트레칭 5분", emoji: "🧘", category: "exercise", difficulty: "쉬움" },
  { name: "하루 30분 걷기", emoji: "🚶", category: "exercise", difficulty: "보통" },
  { name: "홈트레이닝 20분", emoji: "💪", category: "exercise", difficulty: "도전" },
  { name: "물 8잔 마시기", emoji: "💧", category: "diet", difficulty: "쉬움" },
  { name: "저녁 8시 이후 금식", emoji: "🥗", category: "diet", difficulty: "도전" },
  { name: "자기 전 10쪽 읽기", emoji: "📖", category: "reading", difficulty: "쉬움" },
  { name: "영어 단어 10개 외우기", emoji: "🗣️", category: "english", difficulty: "보통" },
  { name: "영어 회화 15분", emoji: "🎧", category: "english", difficulty: "보통" },
  { name: "아침 명상 5분", emoji: "🌅", category: "meditation", difficulty: "쉬움" },
  { name: "감사 일기 한 줄", emoji: "✍️", category: "study", difficulty: "쉬움" },
  { name: "공부 1시간 집중", emoji: "✏️", category: "study", difficulty: "도전" },
  { name: "금연 하루 버티기", emoji: "🚭", category: "quit", difficulty: "도전" },
];
