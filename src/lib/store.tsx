"use client";

import { useMemo, useSyncExternalStore, type ReactNode } from "react";
import { todayISO } from "./dates";
import { demoCompletions, willBeRestart } from "./stats";
import type { AppSettings, AppState, Habit, HabitCategory, Profile } from "./types";

const KEY = "jaksim4.state.v1";

const DEFAULT_STATE: AppState = {
  version: 1,
  onboarded: false,
  profile: null,
  habits: [],
  settings: { reminders: true, weeklyReport: true, encouragement: true },
};

interface Snapshot {
  hydrated: boolean;
  state: AppState;
}

/**
 * localStorage 기반 외부 스토어.
 * useSyncExternalStore로 구독해 SSR(서버 스냅샷)과 클라이언트 상태를 안전하게 잇는다.
 */
const SERVER_SNAPSHOT: Snapshot = { hydrated: false, state: DEFAULT_STATE };

let snapshot: Snapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function hydrate() {
  if (snapshot.hydrated) return;
  let state = DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed && parsed.version === 1) state = parsed;
    }
  } catch {
    // 손상된 데이터는 무시하고 초기 상태로 시작
  }
  snapshot = { hydrated: true, state };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // 구독은 effect 단계에서 일어나므로 여기서 첫 하이드레이션을 수행한다.
  hydrate();
  return () => listeners.delete(listener);
}

function getSnapshot(): Snapshot {
  return snapshot;
}

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

function setState(updater: (s: AppState) => AppState) {
  snapshot = { hydrated: snapshot.hydrated, state: updater(snapshot.state) };
  try {
    localStorage.setItem(KEY, JSON.stringify(snapshot.state));
  } catch {
    // 저장 실패는 조용히 무시 (사파리 프라이빗 모드 등)
  }
  emit();
}

function newId(): string {
  return `h_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export interface CompleteResult {
  isRestart: boolean;
}

/* ---------- 액션 (모듈 레벨, 참조 안정) ---------- */

function addHabit(input: { name: string; emoji: string; category: HabitCategory }): Habit {
  const habit: Habit = {
    id: newId(),
    name: input.name,
    emoji: input.emoji,
    category: input.category,
    createdAt: todayISO(),
    completions: [],
  };
  setState((s) => ({ ...s, habits: [...s.habits, habit] }));
  return habit;
}

function removeHabit(id: string) {
  setState((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) }));
}

function archiveHabit(id: string, archived: boolean) {
  setState((s) => ({
    ...s,
    habits: s.habits.map((h) => (h.id === id ? { ...h, archived } : h)),
  }));
}

function completeToday(id: string): CompleteResult {
  const today = todayISO();
  let isRestart = false;
  setState((s) => {
    const habits = s.habits.map((h) => {
      if (h.id !== id || h.completions.includes(today)) return h;
      isRestart = willBeRestart(h, today);
      return { ...h, completions: [...h.completions, today] };
    });
    return { ...s, habits };
  });
  return { isRestart };
}

function uncompleteToday(id: string) {
  const today = todayISO();
  setState((s) => ({
    ...s,
    habits: s.habits.map((h) =>
      h.id === id ? { ...h, completions: h.completions.filter((d) => d !== today) } : h
    ),
  }));
}

function setProfile(profile: Profile) {
  setState((s) => ({ ...s, profile }));
}

function updateSettings(patch: Partial<AppSettings>) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}

function completeOnboarding(profile: Profile, habits: Habit[]) {
  setState((s) => ({
    ...s,
    onboarded: true,
    profile,
    habits: [...s.habits, ...habits],
  }));
}

function loadDemoData() {
  const today = todayISO();
  const demo: Habit[] = [
    {
      id: newId(),
      name: "하루 30분 걷기",
      emoji: "🚶",
      category: "exercise",
      createdAt: demoStart(92),
      completions: demoCompletions(92, [
        { run: 3, gap: 2 },
        { run: 5, gap: 3 },
        { run: 2, gap: 1 },
        { run: 8, gap: 4 },
        { run: 4, gap: 2 },
        { run: 6, gap: 3 },
        { run: 3, gap: 2 },
        { run: 9, gap: 3 },
        { run: 5, gap: 2 },
        { run: 12, gap: 0 },
      ]),
    },
    {
      id: newId(),
      name: "자기 전 10쪽 읽기",
      emoji: "📖",
      category: "reading",
      createdAt: demoStart(60),
      completions: demoCompletions(60, [
        { run: 4, gap: 3 },
        { run: 3, gap: 2 },
        { run: 7, gap: 5 },
        { run: 2, gap: 2 },
        { run: 10, gap: 3 },
        { run: 6, gap: 2 },
        { run: 8, gap: 0 },
      ]),
    },
    {
      id: newId(),
      name: "아침 명상 5분",
      emoji: "🌅",
      category: "meditation",
      createdAt: demoStart(35),
      completions: demoCompletions(35, [
        { run: 3, gap: 2 },
        { run: 2, gap: 4 },
        { run: 5, gap: 2 },
        { run: 4, gap: 3 },
        { run: 7, gap: 0 },
      ]),
    },
    {
      id: newId(),
      name: "영어 단어 10개 외우기",
      emoji: "🗣️",
      category: "english",
      createdAt: demoStart(21),
      completions: demoCompletions(21, [
        { run: 2, gap: 3 },
        { run: 4, gap: 2 },
        { run: 3, gap: 2 },
        { run: 4, gap: 0 },
      ]),
    },
  ];
  setState((s) => ({
    ...s,
    onboarded: true,
    profile: s.profile ?? { name: "체험자", joinedAt: today, goal: "다시 시작하는 연습" },
    habits: demo,
  }));
}

function resetAll() {
  snapshot = { hydrated: true, state: DEFAULT_STATE };
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  emit();
}

function demoStart(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ---------- React 바인딩 ---------- */

export function HabitProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useHabits() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(
    () => ({
      hydrated: snap.hydrated,
      state: snap.state,
      addHabit,
      removeHabit,
      archiveHabit,
      completeToday,
      uncompleteToday,
      setProfile,
      updateSettings,
      completeOnboarding,
      loadDemoData,
      resetAll,
    }),
    [snap]
  );
}
