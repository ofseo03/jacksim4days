"use client";

import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";

/**
 * 소셜 로그인 상태 스토어.
 * - google/kakao/apple: Supabase OAuth. 익명 세션이면 linkIdentity로 계정을
 *   연결해 기존 데이터(user_id)를 그대로 승계한다.
 * - naver: Supabase 미지원 → /api/auth/naver 커스텀 플로우 (매직링크 토큰으로 세션 발급)
 */

export type SocialProvider = "google" | "naver" | "kakao" | "apple";

export const PROVIDER_LABELS: Record<SocialProvider, string> = {
  google: "구글",
  naver: "네이버",
  kakao: "카카오",
  apple: "애플",
};

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  /** 연결된 소셜 제공자 (없으면 익명/이메일 계정) */
  provider: SocialProvider | null;
  isAnonymous: boolean;
}

export interface AuthSnapshot {
  /** 첫 세션 확인이 끝났는가 (SSR/부팅 중엔 false) */
  loaded: boolean;
  user: AuthUser | null;
  /** OAuth 리다이렉트 등에서 돌아온 마지막 에러 메시지 */
  error: string | null;
}

const SERVER_SNAPSHOT: AuthSnapshot = { loaded: false, user: null, error: null };

let snapshot: AuthSnapshot = SERVER_SNAPSHOT;
let started = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function setSnapshot(patch: Partial<AuthSnapshot>) {
  snapshot = { ...snapshot, ...patch };
  emit();
}

const SUPABASE_PROVIDERS = ["google", "kakao", "apple"] as const;

function toAuthUser(user: User): AuthUser {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const identityProviders = (user.identities ?? []).map((i) => i.provider);

  let provider: SocialProvider | null =
    SUPABASE_PROVIDERS.find((p) => identityProviders.includes(p)) ?? null;
  // 네이버는 커스텀 플로우라 identity가 아닌 user_metadata에 기록된다
  if (!provider && meta.provider === "naver") provider = "naver";

  const name =
    (meta.full_name as string) ??
    (meta.name as string) ??
    (meta.nickname as string) ??
    null;
  const avatarUrl =
    (meta.avatar_url as string) ??
    (meta.picture as string) ??
    (meta.profile_image as string) ??
    null;

  return {
    id: user.id,
    email: user.email ?? null,
    name,
    avatarUrl,
    provider,
    isAnonymous: !!user.is_anonymous,
  };
}

/** OAuth/커스텀 콜백이 URL에 남긴 에러를 읽고 주소창을 정리한다. */
function consumeUrlError(): string | null {
  try {
    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.slice(1));
    const message =
      url.searchParams.get("auth_error") ??
      hash.get("error_description") ??
      hash.get("error");
    if (!message) return null;
    url.searchParams.delete("auth_error");
    url.hash = "";
    window.history.replaceState(null, "", url.toString());
    return message.replace(/\+/g, " ");
  } catch {
    return null;
  }
}

function start() {
  if (started) return;
  started = true;

  const supabase = getSupabase();
  const error = consumeUrlError();
  if (!supabase) {
    snapshot = { loaded: true, user: null, error };
    // subscribe 단계에서 호출되므로 렌더 중 emit 방지를 위해 미룬다
    queueMicrotask(emit);
    return;
  }
  if (error) queueMicrotask(() => setSnapshot({ error }));

  supabase.auth.onAuthStateChange((_event, session) => {
    setSnapshot({
      loaded: true,
      user: session ? toAuthUser(session.user) : null,
    });
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  start();
  return () => listeners.delete(listener);
}

function getSnapshot(): AuthSnapshot {
  return snapshot;
}

function getServerSnapshot(): AuthSnapshot {
  return SERVER_SNAPSHOT;
}

/* ---------- 액션 ---------- */

/**
 * 소셜 로그인 시작 (페이지 리다이렉트 발생).
 * 익명 세션이면 linkIdentity로 현재 계정에 소셜 계정을 연결해
 * 지금까지의 기록을 그대로 가져간다. 이미 다른 계정에 연결된 소셜
 * 계정이면 콜백 에러가 URL로 돌아와 useAuth().error로 노출된다.
 */
export async function signInWithSocial(provider: SocialProvider): Promise<void> {
  setSnapshot({ error: null });

  if (provider === "naver") {
    window.location.href = "/api/auth/naver";
    return;
  }

  const supabase = getSupabase();
  if (!supabase) {
    setSnapshot({ error: "Supabase가 설정되지 않아 로그인할 수 없어요." });
    return;
  }

  const options = { redirectTo: `${window.location.origin}/profile` };
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { error } = session?.user.is_anonymous
    ? await supabase.auth.linkIdentity({ provider, options })
    : await supabase.auth.signInWithOAuth({ provider, options });
  if (error) setSnapshot({ error: error.message });
}

/** 로그아웃 — 이후 데이터 정리는 sync 레이어의 SIGNED_OUT 핸들러가 담당한다. */
export async function signOutUser(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) setSnapshot({ error: error.message });
}

export function clearAuthError(): void {
  setSnapshot({ error: null });
}

/* ---------- React 바인딩 ---------- */

export function useAuth(): AuthSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
