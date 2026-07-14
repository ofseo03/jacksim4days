import { NextResponse, type NextRequest } from "next/server";
import { NAVER_STATE_COOKIE } from "@/lib/naver";

/**
 * 네이버 로그인 시작점.
 * Supabase가 네이버를 기본 지원하지 않아 인가 요청을 직접 만든다.
 * CSRF 방지용 state는 httpOnly 쿠키에 보관하고 콜백에서 대조한다.
 */
export function GET(request: NextRequest) {
  const clientId = process.env.NAVER_CLIENT_ID;
  const origin = request.nextUrl.origin;

  if (!clientId || !process.env.NAVER_CLIENT_SECRET) {
    return NextResponse.redirect(
      `${origin}/profile?auth_error=${encodeURIComponent(
        "네이버 로그인이 아직 설정되지 않았어요. (NAVER_CLIENT_ID/SECRET)"
      )}`
    );
  }

  const state = crypto.randomUUID();
  const authorize = new URL("https://nid.naver.com/oauth2.0/authorize");
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", `${origin}/api/auth/naver/callback`);
  authorize.searchParams.set("state", state);

  const res = NextResponse.redirect(authorize);
  res.cookies.set(NAVER_STATE_COOKIE, state, {
    httpOnly: true,
    secure: origin.startsWith("https"),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
  return res;
}
