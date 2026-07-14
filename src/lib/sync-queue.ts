"use client";

import { getSupabase } from "./supabase";
import type { Habit, Profile } from "./types";

/**
 * 오프라인 우선 동기화 큐.
 * - 모든 쓰기는 낙관적으로 로컬에 먼저 반영되고, 여기에 op로 쌓인다.
 * - habit_logs는 (habit_id, log_date) 복합 PK upsert라 중복 전송돼도 멱등.
 * - 실패하면 큐에 남고, online 이벤트/주기 flush에서 재시도한다.
 */

export type SyncOp =
  | { t: "habit_upsert"; habit: HabitRow }
  | { t: "habit_delete"; id: string }
  | { t: "log_upsert"; habitId: string; date: string }
  | { t: "log_delete"; habitId: string; date: string }
  | { t: "profile_upsert"; profile: Profile }
  | { t: "profile_delete" };

export interface HabitRow {
  id: string;
  name: string;
  emoji: string;
  category: string;
  createdAt: string; // YYYY-MM-DD
  archived: boolean;
}

export type SyncMode = "disabled" | "connecting" | "online" | "offline" | "error";

export interface SyncSnapshot {
  mode: SyncMode;
  pending: number;
  error?: string;
}

const QUEUE_KEY = "jaksim4.syncq.v1";
const SERVER_SNAPSHOT: SyncSnapshot = { mode: "disabled", pending: 0 };

let queue: SyncOp[] = [];
let snapshot: SyncSnapshot = SERVER_SNAPSHOT;
let userId: string | null = null;
let flushing = false;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  snapshot = { ...snapshot, pending: queue.length };
  for (const l of listeners) l();
}

function loadQueue() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (raw) queue = JSON.parse(raw) as SyncOp[];
  } catch {
    queue = [];
  }
}

function persistQueue() {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // 저장 실패해도 메모리 큐로 계속 동작
  }
}

export function setSyncMode(mode: SyncMode, error?: string) {
  snapshot = { mode, pending: queue.length, error };
  emit();
}

export function setSyncUser(id: string | null) {
  userId = id;
}

/** 계정 전환/로그아웃 시 이전 계정의 미전송 op를 폐기한다. */
export function clearQueue() {
  loadQueue();
  queue = [];
  persistQueue();
  emit();
}

export function habitToRow(h: Habit): HabitRow {
  return {
    id: h.id,
    name: h.name,
    emoji: h.emoji,
    category: h.category,
    createdAt: h.createdAt,
    archived: !!h.archived,
  };
}

/** 스토어 mutation이 호출한다. Supabase 미설정이면 no-op. */
export function enqueue(...ops: SyncOp[]) {
  if (!getSupabase()) return;
  loadQueue();
  queue.push(...ops);
  persistQueue();
  emit();
  void flush();
}

/** 큐를 순서 보존 배치로 서버에 반영한다. */
export async function flush(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase || !userId || flushing) return;
  loadQueue();
  if (queue.length === 0) return;
  flushing = true;

  try {
    while (queue.length > 0) {
      // 같은 타입의 연속 op를 묶어 한 번에 보낸다 (FK 순서 보존)
      const head = queue[0].t;
      let n = 1;
      while (n < queue.length && queue[n].t === head) n++;
      const batch = queue.slice(0, n);

      if (head === "habit_upsert") {
        const rows = (batch as Extract<SyncOp, { t: "habit_upsert" }>[]).map((op) => ({
          id: op.habit.id,
          user_id: userId,
          name: op.habit.name,
          emoji: op.habit.emoji,
          category: op.habit.category,
          created_at: op.habit.createdAt,
          archived_at: op.habit.archived ? new Date().toISOString() : null,
        }));
        const { error } = await supabase.from("habits").upsert(rows);
        if (error) throw error;
      } else if (head === "log_upsert") {
        const rows = (batch as Extract<SyncOp, { t: "log_upsert" }>[]).map((op) => ({
          habit_id: op.habitId,
          user_id: userId,
          log_date: op.date,
        }));
        const { error } = await supabase.from("habit_logs").upsert(rows);
        if (error) throw error;
      } else if (head === "profile_upsert") {
        // 유저당 한 행 — 배치의 마지막 상태만 반영하면 된다
        const last = (batch as Extract<SyncOp, { t: "profile_upsert" }>[]).at(-1)!;
        const { error } = await supabase.from("profiles").upsert({
          user_id: userId,
          name: last.profile.name,
          goal: last.profile.goal ?? null,
          joined_at: last.profile.joinedAt,
          updated_at: new Date().toISOString(),
        });
        // 0002 마이그레이션 전 배포에는 테이블이 없다 — 큐를 막지 않고 버린다
        if (error && error.code !== "42P01") throw error;
      } else if (head === "profile_delete") {
        const { error } = await supabase
          .from("profiles")
          .delete()
          .eq("user_id", userId);
        if (error && error.code !== "42P01") throw error;
      } else if (head === "log_delete") {
        for (const op of batch as Extract<SyncOp, { t: "log_delete" }>[]) {
          const { error } = await supabase
            .from("habit_logs")
            .delete()
            .eq("habit_id", op.habitId)
            .eq("log_date", op.date);
          if (error) throw error;
        }
      } else {
        for (const op of batch as Extract<SyncOp, { t: "habit_delete" }>[]) {
          const { error } = await supabase.from("habits").delete().eq("id", op.id);
          if (error) throw error;
        }
      }

      queue = queue.slice(n);
      persistQueue();
      emit();
    }
    setSyncMode("online");
  } catch (e) {
    // 남은 op는 큐에 보존 — 재연결/다음 주기에 재시도
    const offline = typeof navigator !== "undefined" && !navigator.onLine;
    setSyncMode(offline ? "offline" : "error", e instanceof Error ? e.message : String(e));
  } finally {
    flushing = false;
  }
}

/* ---------- React 바인딩 ---------- */

function subscribe(listener: () => void) {
  listeners.add(listener);
  loadQueue();
  return () => listeners.delete(listener);
}

export function getSyncSnapshot(): SyncSnapshot {
  return snapshot;
}

export function getSyncServerSnapshot(): SyncSnapshot {
  return SERVER_SNAPSHOT;
}

export const syncStatusStore = { subscribe };
