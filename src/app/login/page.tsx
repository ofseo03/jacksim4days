"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { SocialLoginButtons } from "@/components/social-login-buttons";
import { Card } from "@/components/ui/card";
import { clearAuthError, useAuth } from "@/lib/auth";
import { useHabits } from "@/lib/store";
import { getSupabase } from "@/lib/supabase";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * 로그인 페이지 — 앱 사용의 관문.
 * 로그인이 끝나면 온보딩 여부에 따라 /onboarding 또는 /dashboard로 보낸다.
 * (OAuth·네이버 콜백도 이 페이지로 돌아와 여기서 목적지가 정해진다)
 */
export default function LoginPage() {
  const { loaded, user, error } = useAuth();
  const { hydrated, state } = useHabits();
  const router = useRouter();
  const localOnly = getSupabase() === null;

  const signedIn = loaded && user && !user.isAnonymous;

  useEffect(() => {
    if (signedIn && hydrated) {
      router.replace(state.onboarded ? "/dashboard" : "/onboarding");
    }
  }, [signedIn, hydrated, state.onboarded, router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center text-center">
          <LogoMark className="h-14 w-14 rounded-2xl text-3xl" />
          <h1 className="mt-6 font-serif text-3xl font-bold tracking-tight">
            작심<span className="text-accent">사</span>일
          </h1>
          <p className="mt-3 leading-relaxed text-muted">
            다시 시작하는 사람이 결국 끝까지 갑니다.
            <br />
            로그인하고 여정을 이어가세요.
          </p>
        </div>

        <Card glass className="mt-8 p-6">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-2xl bg-red-500/10 p-3 text-sm text-red-500">
              <span className="flex-1">{error}</span>
              <button type="button" onClick={clearAuthError} aria-label="닫기">
                <X size={16} />
              </button>
            </div>
          )}

          {localOnly ? (
            <div className="text-center">
              <p className="text-sm leading-relaxed text-muted">
                서버가 연결되지 않아 로그인 없이 <strong>로컬 모드</strong>로
                동작합니다. 기록은 이 기기에만 저장돼요.
              </p>
              <Link
                href="/onboarding"
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-foreground font-semibold text-background transition-transform duration-300 hover:scale-[1.02]"
              >
                로컬 모드로 시작하기
              </Link>
            </div>
          ) : signedIn ? (
            <p className="py-4 text-center text-muted">이동 중…</p>
          ) : (
            <>
              <SocialLoginButtons layout="stack" />
              <p className="mt-5 text-center text-xs leading-relaxed text-faint">
                로그인하면 기록이 계정에 안전하게 보관되고
                <br />
                다른 기기에서도 이어서 쓸 수 있어요.
              </p>
            </>
          )}
        </Card>

        <p className="mt-8 text-center text-sm text-muted">
          <Link href="/" className="transition-colors hover:text-foreground">
            ← 처음으로
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
