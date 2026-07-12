"use client";

import { useEffect, type ReactNode } from "react";
import { getSupabase } from "./supabase";
import {
  enqueue,
  flush,
  habitToRow,
  setSyncMode,
  setSyncUser,
  getSyncSnapshot,
  getSyncServerSnapshot,
  syncStatusStore,
  type SyncOp,
} from "./sync-queue";
import { ensureUuidIds, getStoreState, hydrateStore, mergeServerHabits } from "./store";
import type { Habit, HabitCategory } from "./types";
import { useSyncExternalStore } from "react";

let started = false;

/**
 * 부팅 시 1회:
 * 1. 익명 로그인(세션 없으면) — 회원가입 벽 없이 바로 시작, 나중에 계정 연결 가능
 * 2. 구버전 로컬 ID → UUID 마이그레이션
 * 3. 서버 상태 pull & 로컬 병합 (완료 기록은 합집합)
 * 4. 로컬에만 있는 습관/기록을 서버로 push (멱등 upsert)
 */
async function initSync(): Promise<void> {
  // 병합 전에 로컬 상태가 반드시 로드되어 있어야 한다 (빈 상태 덮어쓰기 방지)
  hydrateStore();

  const supabase = getSupabase();
  if (!supabase) {
    setSyncMode("disabled");
    return;
  }
  setSyncMode("connecting");

  try {
    let {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      session = data.session;
    }
    if (!session) throw new Error("세션을 만들지 못했습니다");
    setSyncUser(session.user.id);

    // 로컬 정리: 서버 push 전에 ID를 uuid로 통일
    ensureUuidIds();

    // ---- pull ----
    const [{ data: habitRows, error: hErr }, { data: logRows, error: lErr }] =
      await Promise.all([
        supabase
          .from("habits")
          .select("id,name,emoji,category,created_at,archived_at"),
        supabase.from("habit_logs").select("habit_id,log_date"),
      ]);
    if (hErr) throw hErr;
    if (lErr) throw lErr;

    const logsByHabit = new Map<string, string[]>();
    for (const row of logRows ?? []) {
      const list = logsByHabit.get(row.habit_id) ?? [];
      list.push(row.log_date);
      logsByHabit.set(row.habit_id, list);
    }
    const serverHabits: Habit[] = (habitRows ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      emoji: r.emoji,
      category: r.category as HabitCategory,
      createdAt: String(r.created_at).slice(0, 10),
      archived: r.archived_at != null,
      completions: logsByHabit.get(r.id) ?? [],
    }));

    // ---- merge (로컬 ← 서버) ----
    mergeServerHabits(serverHabits);

    // ---- push (서버 ← 로컬 전용분) ----
    const serverIds = new Set(serverHabits.map((h) => h.id));
    const serverLogs = new Set(
      (logRows ?? []).map((r) => `${r.habit_id}|${r.log_date}`)
    );
    const ops: SyncOp[] = [];
    for (const h of getStoreState().habits) {
      if (!serverIds.has(h.id)) {
        ops.push({ t: "habit_upsert", habit: habitToRow(h) });
      }
      for (const d of h.completions) {
        if (!serverLogs.has(`${h.id}|${d}`)) {
          ops.push({ t: "log_upsert", habitId: h.id, date: d });
        }
      }
    }
    if (ops.length > 0) enqueue(...ops);

    setSyncMode("online");
    void flush();
  } catch (e) {
    const offline = typeof navigator !== "undefined" && !navigator.onLine;
    setSyncMode(offline ? "offline" : "error", e instanceof Error ? e.message : String(e));
  }
}

/** 재연결·주기 flush를 관장하는 클라이언트 프로바이더 */
export function SyncProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (started) return;
    started = true;
    void initSync();

    const onOnline = () => {
      setSyncMode("connecting");
      void initSync().then(() => flush());
    };
    window.addEventListener("online", onOnline);
    const interval = setInterval(() => void flush(), 30_000);
    return () => {
      window.removeEventListener("online", onOnline);
      clearInterval(interval);
    };
  }, []);

  return <>{children}</>;
}

export function useSyncStatus() {
  return useSyncExternalStore(
    syncStatusStore.subscribe,
    getSyncSnapshot,
    getSyncServerSnapshot
  );
}
