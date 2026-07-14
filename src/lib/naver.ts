/** 네이버 OAuth CSRF state 쿠키 이름 (시작/콜백 라우트가 공유) */
export const NAVER_STATE_COOKIE = "naver_oauth_state";

/** openapi.naver.com/v1/nid/me 응답 형태 */
export interface NaverProfile {
  id: string;
  email?: string;
  name?: string;
  nickname?: string;
  profile_image?: string;
}
