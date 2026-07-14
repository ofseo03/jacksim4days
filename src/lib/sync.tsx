"use client";

import { useEffect, type ReactNode } from "react";
import { getSupabase } from "./supabase";
import {
  clearQueue,
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
import {
  clearHabitsOnSignOut,
  ensureUuidIds,
  getStoreState,
  hydrateStore,
  mergeServerHabits,
  replaceServerHabits,
} from "./store";
import type { Habit, HabitCategory } from "./types";
import { useSyncExternalStore } from "react";

let started = false;
/** 현재 동기화 중인 auth 유저. 계정 전환 감지에 쓴다. */
let activeUid: string | null = null;
let initializing = false;

/** 마지막으로 동기화한 유저 ID — 재방문 시 계정 전환 여부를 판별한다. */
const UID_KEY = "jaksim4.sync.uid.v1";

function getStoredUid(): string | null {
  try {
    return localStorage.getItem(UID_KEY);
  } catch {
    return null;
  }
}

function setStoredUid(uid: string | null) {
  try {
    if (uid) localStorage.setItem(UID_KEY, uid);
    else localStorage.removeItem(UID_KEY);
  } catch {
    // ignore
  }
}

/**
 * 부팅/로그인 시:
 * 1. 익명 로그인(세션 없으면) — 회원가입 벽 없이 바로 시작, 나중에 소셜 계정 연결 가능
 * 2. 구버전 로컬 ID → UUID 마이그레이션
 * 3. 계정이 바뀌었으면(다른 소셜 계정으로 로그인) 로컬을 그 계정의 서버 상태로 교체
 *    같은 계정이면 서버 pull & 로컬 병합 후 로컬 전용분을 push (멱등 upsert)
 *
 * 익명 → 소셜 "연결"(linkIdentity)은 user_id가 유지되므로 병합 경로를 타고,
 * 기존 기록이 그대로 소셜 계정의 것이 된다.
 */
async function initSync(): Promise<void> {
  if (initializing) return;
  initializing = true;

  // 병합 전에 로컬 상태가 반드시 로드되어 있어야 한다 (빈 상태 덮어쓰기 방지)
  hydrateStore();

  const supabase = getSupabase();
  if (!supabase) {
    setSyncMode("disabled");
    initializing = false;
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

    const uid = session.user.id;
    const switched = activeUid !== null ? activeUid !== uid : (() => {
      const prev = getStoredUid();
      return prev !== null && prev !== uid;
    })();
    activeUid = uid;
    setSyncUser(uid);
    setStoredUid(uid);

    // 계정이 바뀌었으면 이전 계정용 미전송 op는 폐기한다 (RLS 위반/데이터 섞임 방지)
    if (switched) clearQueue();

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

    if (switched) {
      // ---- 계정 전환: 로그인한 계정의 데이터만 보여준다 ----
      // 이전 계정의 로컬 기록은 그 계정(서버)에 이미 안전하게 남아 있다.
      replaceServerHabits(serverHabits);
    } else {
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
    }

    setSyncMode("online");
    initializing = false;
    void flush();
  } catch (e) {
    initializing = false;
    const offline = typeof navigator !== "undefined" && !navigator.onLine;
    setSyncMode(offline ? "offline" : "error", e instanceof Error ? e.message : String(e));
  }
}

/** 재연결·주기 flush와 로그인/로그아웃에 따른 재동기화를 관장하는 프로바이더 */
export function SyncProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (started) return;
    started = true;
    void initSync();

    // 소셜 로그인/로그아웃에 반응해 계정별 데이터를 다시 맞춘다
    const supabase = getSupabase();
    const sub = supabase?.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        // 기록은 서버(방금 로그아웃한 계정)에 남는다. 기기에서는 비우고
        // 새 익명 세션으로 다시 시작한다.
        activeUid = null;
        setSyncUser(null);
        setStoredUid(null);
        clearQueue();
        clearHabitsOnSignOut();
        void initSync();
      } else if (
        (event === "SIGNED_IN" || event === "USER_UPDATED") &&
        session &&
        session.user.id !== activeUid &&
        !initializing
      ) {
        void initSync();
      }
    });

    const onOnline = () => {
      setSyncMode("connecting");
      void initSync().then(() => flush());
    };
    window.addEventListener("online", onOnline);
    const interval = setInterval(() => void flush(), 30_000);
    return () => {
      window.removeEventListener("online", onOnline);
      clearInterval(interval);
      sub?.data.subscription.unsubscribe();
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
