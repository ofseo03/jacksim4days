"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

/**
 * 네이버 커스텀 로그인의 마지막 단계.
 * 서버가 발급한 매직링크 token_hash를 verifyOtp로 검증해
 * 브라우저에 Supabase 세션을 만든 뒤 원래 페이지로 돌려보낸다.
 */
function ConfirmInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const tokenHash = params.get("token_hash");
    const next = params.get("next") ?? "/login";
    const supabase = getSupabase();

    if (!supabase || !tokenHash) {
      router.replace("/login");
      return;
    }

    void supabase.auth
      .verifyOtp({ type: "magiclink", token_hash: tokenHash })
      .then(({ error }) => {
        if (error) {
          setError(error.message);
          return;
        }
        router.replace(next.startsWith("/") ? next : "/login");
      });
  }, [params, router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      {error ? (
        <>
          <p className="font-semibold">로그인을 완료하지 못했어요</p>
          <p className="text-sm text-muted">{error}</p>
          <button
            type="button"
            className="mt-2 text-sm font-semibold text-accent"
            onClick={() => router.replace("/login")}
          >
            로그인으로 돌아가기
          </button>
        </>
      ) : (
        <p className="text-muted">로그인 처리 중…</p>
      )}
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-muted">
          로그인 처리 중…
        </div>
      }
    >
      <ConfirmInner />
    </Suspense>
  );
}
