"use client";

import { useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "system";

const KEY = "jaksim4.theme";

interface ThemeSnapshot {
  hydrated: boolean;
  mode: ThemeMode;
  isDark: boolean;
}

const SERVER_SNAPSHOT: ThemeSnapshot = { hydrated: false, mode: "system", isDark: false };

let snapshot: ThemeSnapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function resolveIsDark(mode: ThemeMode): boolean {
  return (
    mode === "dark" ||
    (mode === "system" && matchMedia("(prefers-color-scheme: dark)").matches)
  );
}

function apply(mode: ThemeMode) {
  const isDark = resolveIsDark(mode);
  document.documentElement.classList.toggle("dark", isDark);
  snapshot = { hydrated: true, mode, isDark };
  emit();
}

function hydrate() {
  if (snapshot.hydrated) return;
  const saved = localStorage.getItem(KEY) as ThemeMode | null;
  const mode = saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
  apply(mode);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  hydrate();
  return () => listeners.delete(listener);
}

function getSnapshot(): ThemeSnapshot {
  return snapshot;
}

function getServerSnapshot(): ThemeSnapshot {
  return SERVER_SNAPSHOT;
}

export function setThemeMode(mode: ThemeMode) {
  localStorage.setItem(KEY, mode);
  apply(mode);
}

export function useTheme() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(
    () => ({
      hydrated: snap.hydrated,
      mode: snap.mode,
      isDark: snap.isDark,
      setMode: setThemeMode,
    }),
    [snap]
  );
}

/** OS 테마 변경을 시스템 모드일 때 실시간 반영 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (snapshot.mode === "system") apply("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return <>{children}</>;
}
