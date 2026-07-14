"use client";

import { useState } from "react";
import { LogOut, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  clearAuthError,
  signInWithSocial,
  signOutUser,
  useAuth,
  PROVIDER_LABELS,
  type SocialProvider,
} from "@/lib/auth";
import { useSyncStatus } from "@/lib/sync";
import { cn } from "@/lib/utils";

/* ---------- 제공자 브랜드 아이콘 ---------- */

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.93-2.91l-3.87-3c-1.07.72-2.44 1.14-4.06 1.14-3.12 0-5.77-2.11-6.71-4.95H1.29v3.1A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.28A7.2 7.2 0 0 1 4.91 12c0-.79.14-1.56.38-2.28v-3.1H1.29a11.99 11.99 0 0 0 0 10.76l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44A11.53 11.53 0 0 0 12 0 11.99 11.99 0 0 0 1.29 6.62l4 3.1C6.23 6.88 8.88 4.77 12 4.77Z"
      />
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path
        fill="currentColor"
        d="M16.27 4v8.53L7.73 4H4v16h3.73v-8.53L16.27 20H20V4h-3.73Z"
      />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path
        fill="currentColor"
        d="M12 3C6.48 3 2 6.51 2 10.84c0 2.78 1.85 5.22 4.64 6.61l-.95 3.52c-.08.31.27.56.54.38l4.2-2.79c.51.06 1.03.1 1.57.1 5.52 0 10-3.51 10-7.82C22 6.51 17.52 3 12 3Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path
        fill="currentColor"
        d="M17.05 12.54c-.03-2.89 2.36-4.27 2.47-4.34-1.35-1.97-3.44-2.24-4.18-2.27-1.78-.18-3.47 1.05-4.37 1.05-.9 0-2.29-1.02-3.77-1-1.94.03-3.72 1.13-4.72 2.86-2.01 3.49-.51 8.66 1.45 11.49.96 1.39 2.1 2.94 3.6 2.88 1.44-.06 1.99-.93 3.73-.93 1.74 0 2.23.93 3.76.9 1.56-.03 2.54-1.41 3.49-2.8 1.1-1.61 1.55-3.17 1.57-3.25-.03-.02-3.01-1.16-3.03-4.59ZM14.17 4.06c.8-.96 1.33-2.3 1.19-3.64-1.14.05-2.53.76-3.35 1.72-.73.85-1.38 2.21-1.2 3.52 1.27.1 2.57-.65 3.36-1.6Z"
      />
    </svg>
  );
}

const PROVIDERS: Array<{
  id: SocialProvider;
  icon: () => React.ReactNode;
  className: string;
}> = [
  {
    id: "google",
    icon: GoogleIcon,
    className:
      "border border-line bg-white text-[#1f1f1f] hover:bg-neutral-50 dark:border-transparent",
  },
  {
    id: "kakao",
    icon: KakaoIcon,
    className: "bg-[#FEE500] text-[#191919] hover:brightness-95",
  },
  {
    id: "naver",
    icon: NaverIcon,
    className: "bg-[#03C75A] text-white hover:brightness-95",
  },
  {
    id: "apple",
    icon: AppleIcon,
    className: "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black",
  },
];

/**
 * 계정 카드.
 * - 익명(또는 미로그인): 소셜 로그인 버튼 4종 — 로그인하면 지금까지의 기록이
 *   계정에 연결된다 (익명 세션은 linkIdentity로 승계).
 * - 로그인됨: 연결된 제공자·이메일 표시 + 로그아웃.
 */
export function AccountCard() {
  const { loaded, user, error } = useAuth();
  const sync = useSyncStatus();
  const [busy, setBusy] = useState<SocialProvider | null>(null);

  if (!loaded) return null;
  // Supabase 미설정(로컬 전용 모드)이면 로그인 자체가 불가능하므로 숨긴다
  if (sync.mode === "disabled" && !user) return null;

  const signedIn = user && !user.isAnonymous;

  const handleSignIn = async (p: SocialProvider) => {
    setBusy(p);
    await signInWithSocial(p);
    // OAuth는 페이지를 떠나므로 보통 여기 도달하지 않는다 (에러 시에만)
    setBusy(null);
  };

  return (
    <Card className="p-6">
      <h2 className="font-bold tracking-tight">계정</h2>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-2xl bg-red-500/10 p-3 text-sm text-red-500">
          <span className="flex-1">{error}</span>
          <button type="button" onClick={clearAuthError} aria-label="닫기">
            <X size={16} />
          </button>
        </div>
      )}

      {signedIn ? (
        <div className="mt-4 flex items-center gap-4">
          {user.avatarUrl ? (
            // Supabase/소셜 프로필 이미지는 도메인이 다양해 next/image 대신 img 사용
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-lg">
              🌱
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">
              {user.name ?? user.email ?? "로그인됨"}
            </p>
            <p className="truncate text-sm text-muted">
              {user.provider ? `${PROVIDER_LABELS[user.provider]} 계정` : "이메일 계정"}
              {user.email ? ` · ${user.email}` : ""}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => void signOutUser()}>
            <LogOut size={14} /> 로그아웃
          </Button>
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted">
            로그인하면 지금까지의 기록이 계정에 안전하게 연결되고, 다른 기기에서도
            이어서 쓸 수 있어요.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PROVIDERS.map(({ id, icon: Icon, className }) => (
              <button
                key={id}
                type="button"
                disabled={busy !== null}
                onClick={() => void handleSignIn(id)}
                className={cn(
                  "flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold",
                  "transition-all duration-300 [transition-timing-function:var(--ease-apple)]",
                  "hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40",
                  className
                )}
              >
                <Icon />
                {busy === id ? "이동 중…" : PROVIDER_LABELS[id]}
              </button>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
