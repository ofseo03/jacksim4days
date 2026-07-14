"use client";

import { useMemo, useSyncExternalStore, type ReactNode } from "react";
import { todayISO } from "./dates";
import { demoCompletions, willBeRestart } from "./stats";
import { enqueue, habitToRow } from "./sync-queue";
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

/** 서버(uuid pk)와 그대로 호환되도록 습관 ID는 UUID를 쓴다. */
function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(16)}-0000-4000-8000-${Math.random()
    .toString(16)
    .slice(2, 14)
    .padEnd(12, "0")}`;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  enqueue({ t: "habit_upsert", habit: habitToRow(habit) });
  return habit;
}

function removeHabit(id: string) {
  setState((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) }));
  enqueue({ t: "habit_delete", id });
}

function archiveHabit(id: string, archived: boolean) {
  let changed: Habit | undefined;
  setState((s) => ({
    ...s,
    habits: s.habits.map((h) => {
      if (h.id !== id) return h;
      changed = { ...h, archived };
      return changed;
    }),
  }));
  if (changed) enqueue({ t: "habit_upsert", habit: habitToRow(changed) });
}

function completeToday(id: string): CompleteResult {
  const today = todayISO();
  let isRestart = false;
  let added = false;
  setState((s) => {
    const habits = s.habits.map((h) => {
      if (h.id !== id || h.completions.includes(today)) return h;
      isRestart = willBeRestart(h, today);
      added = true;
      return { ...h, completions: [...h.completions, today] };
    });
    return { ...s, habits };
  });
  if (added) enqueue({ t: "log_upsert", habitId: id, date: today });
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
  enqueue({ t: "log_delete", habitId: id, date: today });
}

function setProfile(profile: Profile) {
  setState((s) => ({ ...s, profile }));
}

function updateSettings(patch: Partial<AppSettings>) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
}

function completeOnboarding(profile: Profile, habits: Habit[]) {
  // 온보딩에서 만든 습관은 uuid가 아닐 수 있으므로 서버 호환 ID로 재발급한다.
  const withIds = habits.map((h) => (UUID_RE.test(h.id) ? h : { ...h, id: newId() }));
  setState((s) => ({
    ...s,
    onboarded: true,
    profile,
    habits: [...s.habits, ...withIds],
  }));
  enqueue(...withIds.map((h) => ({ t: "habit_upsert" as const, habit: habitToRow(h) })));
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
  const removed = snapshot.state.habits;
  setState((s) => ({
    ...s,
    onboarded: true,
    profile: s.profile ?? { name: "체험자", joinedAt: today, goal: "다시 시작하는 연습" },
    habits: demo,
  }));
  enqueue(
    ...removed.map((h) => ({ t: "habit_delete" as const, id: h.id })),
    ...demo.map((h) => ({ t: "habit_upsert" as const, habit: habitToRow(h) })),
    ...demo.flatMap((h) =>
      h.completions.map((d) => ({ t: "log_upsert" as const, habitId: h.id, date: d }))
    )
  );
}

function resetAll() {
  const removed = snapshot.state.habits;
  snapshot = { hydrated: true, state: DEFAULT_STATE };
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  emit();
  // 서버 기록도 함께 삭제 — 남겨두면 다음 부팅 때 다시 내려와 초기화가 무효가 된다
  enqueue(...removed.map((h) => ({ t: "habit_delete" as const, id: h.id })));
}

function demoStart(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ---------- 동기화(리컨실) 전용 내부 API — sync.ts에서만 사용 ---------- */

export function getStoreState(): AppState {
  return snapshot.state;
}

/** 동기화가 스토어보다 먼저 돌 때를 대비해 명시적으로 하이드레이션을 보장한다. */
export function hydrateStore(): void {
  hydrate();
}

/**
 * 구버전 로컬 ID(h_...)를 서버 호환 UUID로 재발급한다.
 * localStorage 마이그레이션 1회용 — 이미 uuid면 건드리지 않는다.
 */
export function ensureUuidIds(): void {
  const needs = snapshot.state.habits.some((h) => !UUID_RE.test(h.id));
  if (!needs) return;
  setState((s) => ({
    ...s,
    habits: s.habits.map((h) => (UUID_RE.test(h.id) ? h : { ...h, id: newId() })),
  }));
}

/**
 * 서버 상태를 로컬에 병합한다.
 * - 서버에만 있는 습관 → 로컬에 추가
 * - 양쪽에 있는 습관 → 메타는 로컬 우선, 완료 기록은 합집합
 * 로컬에만 있는 데이터는 건드리지 않는다 (호출측이 서버로 push).
 */
export function mergeServerHabits(server: Habit[]): void {
  setState((s) => {
    const byId = new Map(s.habits.map((h) => [h.id, h]));
    const merged = s.habits.map((local) => {
      const remote = server.find((r) => r.id === local.id);
      if (!remote) return local;
      const union = [...new Set([...local.completions, ...remote.completions])].sort();
      return { ...local, completions: union };
    });
    const newOnes = server.filter((r) => !byId.has(r.id));
    return {
      ...s,
      onboarded: s.onboarded || newOnes.length > 0,
      habits: [...merged, ...newOnes],
    };
  });
}

/**
 * 로컬 습관을 서버 상태로 통째로 교체한다.
 * 다른 계정으로 로그인(계정 전환)했을 때 사용 — 이전 계정의 로컬 기록을
 * 새 계정으로 밀어 올리지 않고, 로그인한 계정의 데이터만 보이게 한다.
 */
export function replaceServerHabits(server: Habit[]): void {
  setState((s) => ({
    ...s,
    onboarded: s.onboarded || server.length > 0,
    habits: server,
  }));
}

/**
 * 로그아웃 시 로컬 습관만 비운다 (설정·테마는 기기 설정이므로 유지).
 * resetAll과 달리 서버 삭제 op를 만들지 않는다 — 데이터는 계정에 남는다.
 */
export function clearHabitsOnSignOut(): void {
  setState((s) => ({ ...s, profile: null, habits: [] }));
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
