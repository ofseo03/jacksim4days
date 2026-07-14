import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { NAVER_STATE_COOKIE, type NaverProfile } from "@/lib/naver";

/**
 * 네이버 OAuth 콜백.
 * code → 네이버 토큰 → 프로필 조회 후, Supabase Admin으로 해당 유저를
 * 찾거나 만들고 매직링크 token_hash를 발급해 /auth/confirm으로 넘긴다.
 * (클라이언트가 verifyOtp로 세션을 완성한다)
 */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const fail = (message: string) => {
    const res = NextResponse.redirect(
      `${origin}/profile?auth_error=${encodeURIComponent(message)}`
    );
    res.cookies.delete(NAVER_STATE_COOKIE);
    return res;
  };

  const params = request.nextUrl.searchParams;
  if (params.get("error")) {
    return fail(params.get("error_description") ?? "네이버 로그인이 취소됐어요.");
  }

  const code = params.get("code");
  const state = params.get("state");
  const savedState = request.cookies.get(NAVER_STATE_COOKIE)?.value;
  if (!code || !state || !savedState || state !== savedState) {
    return fail("잘못된 로그인 요청이에요. 다시 시도해주세요.");
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  const admin = getSupabaseAdmin();
  if (!clientId || !clientSecret || !admin) {
    return fail("네이버 로그인이 아직 설정되지 않았어요.");
  }

  try {
    // ---- 1. code → access token ----
    const tokenUrl = new URL("https://nid.naver.com/oauth2.0/token");
    tokenUrl.searchParams.set("grant_type", "authorization_code");
    tokenUrl.searchParams.set("client_id", clientId);
    tokenUrl.searchParams.set("client_secret", clientSecret);
    tokenUrl.searchParams.set("code", code);
    tokenUrl.searchParams.set("state", state);

    const tokenRes = await fetch(tokenUrl, { cache: "no-store" });
    const token = (await tokenRes.json()) as {
      access_token?: string;
      error_description?: string;
    };
    if (!tokenRes.ok || !token.access_token) {
      return fail(token.error_description ?? "네이버 토큰 발급에 실패했어요.");
    }

    // ---- 2. 프로필 조회 ----
    const profileRes = await fetch("https://openapi.naver.com/v1/nid/me", {
      headers: { Authorization: `Bearer ${token.access_token}` },
      cache: "no-store",
    });
    const profileBody = (await profileRes.json()) as {
      resultcode?: string;
      response?: NaverProfile;
    };
    const profile = profileBody.response;
    if (!profileRes.ok || profileBody.resultcode !== "00" || !profile?.id) {
      return fail("네이버 프로필을 가져오지 못했어요.");
    }

    // 이메일 미제공 동의 시에도 계정이 만들어지도록 네이버 ID 기반 주소로 대체
    const email =
      profile.email ?? `naver-${profile.id}@social.jaksim4.invalid`;
    const metadata = {
      provider: "naver",
      naver_id: profile.id,
      name: profile.name ?? profile.nickname ?? null,
      avatar_url: profile.profile_image ?? null,
    };

    // ---- 3. 유저 확보 + 매직링크 token_hash 발급 ----
    let link = await admin.auth.admin.generateLink({ type: "magiclink", email });
    if (link.error) {
      const created = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: metadata,
      });
      if (created.error) return fail("계정 생성에 실패했어요. 잠시 후 다시 시도해주세요.");
      link = await admin.auth.admin.generateLink({ type: "magiclink", email });
    } else if (link.data.user) {
      // 재로그인: 프로필 메타데이터를 최신으로 갱신
      await admin.auth.admin.updateUserById(link.data.user.id, {
        user_metadata: { ...link.data.user.user_metadata, ...metadata },
      });
    }
    const tokenHash = link.data.properties?.hashed_token;
    if (link.error || !tokenHash) {
      return fail("로그인 세션 발급에 실패했어요. 잠시 후 다시 시도해주세요.");
    }

    const confirm = new URL(`${origin}/auth/confirm`);
    confirm.searchParams.set("token_hash", tokenHash);
    confirm.searchParams.set("next", "/profile");
    const res = NextResponse.redirect(confirm);
    res.cookies.delete(NAVER_STATE_COOKIE);
    return res;
  } catch {
    return fail("네이버 로그인 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.");
  }
}
