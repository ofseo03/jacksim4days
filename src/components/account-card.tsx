"use client";

import { LogOut, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SocialLoginButtons } from "@/components/social-login-buttons";
import {
  clearAuthError,
  signOutUser,
  useAuth,
  PROVIDER_LABELS,
} from "@/lib/auth";
import { useSyncStatus } from "@/lib/sync";

/**
 * 계정 카드.
 * - 익명(또는 미로그인): 소셜 로그인 버튼 4종 — 로그인하면 지금까지의 기록이
 *   계정에 연결된다 (익명 세션은 linkIdentity로 승계).
 * - 로그인됨: 연결된 제공자·이메일 표시 + 로그아웃.
 */
export function AccountCard() {
  const { loaded, user, error } = useAuth();
  const sync = useSyncStatus();

  if (!loaded) return null;
  // Supabase 미설정(로컬 전용 모드)이면 로그인 자체가 불가능하므로 숨긴다
  if (sync.mode === "disabled" && !user) return null;

  const signedIn = user && !user.isAnonymous;

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
          <div className="mt-4">
            <SocialLoginButtons layout="grid" />
          </div>
        </>
      )}
    </Card>
  );
}
