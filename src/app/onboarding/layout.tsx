import { AuthGate } from "@/components/auth-gate";

// 온보딩도 로그인 이후 단계다 (랜딩 → 로그인 → 온보딩 → 대시보드)
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGate>{children}</AuthGate>;
}
