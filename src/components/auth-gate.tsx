"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

/**
 * 로그인 게이트 — 앱 화면(대시보드·습관·통계·프로필·설정·온보딩)을 감싼다.
 * - 소셜 로그인된 유저만 통과. 미로그인/익명 세션은 /login으로 보낸다.
 *   (익명 세션은 뒤에서 유지되므로 로그인 시 linkIdentity로 기록이 승계된다)
 * - Supabase 미설정(로컬 전용 모드)이면 로그인이 불가능하므로 게이트를 끈다.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { loaded, user } = useAuth();
  const router = useRouter();
  const gated = getSupabase() !== null;
  const needsLogin = gated && loaded && (!user || user.isAnonymous);

  useEffect(() => {
    if (needsLogin) router.replace("/login");
  }, [needsLogin, router]);

  if (!gated) return <>{children}</>;
  if (!loaded || needsLogin) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted">
        확인 중…
      </div>
    );
  }
  return <>{children}</>;
}
