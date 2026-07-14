import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 서버 전용 Supabase Admin 클라이언트 (service role).
 * 네이버처럼 Supabase가 직접 지원하지 않는 제공자의 유저 생성/세션 발급에 쓴다.
 * 절대 클라이언트 번들에 import하지 말 것.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
