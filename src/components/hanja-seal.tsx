import { cn } from "@/lib/utils";

/**
 * 「作心四日」 2×2 인장 — 브랜드 이미지의 한자 조판을 그대로 웹 타이포로 재현.
 * 세로쓰기 순서(우상→우하→좌상→좌하 아님, 원본 이미지처럼 作心/四日 두 줄)로 배치한다.
 */
export function HanjaSeal({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-2xl gap-x-1.5 gap-y-0.5",
    md: "text-4xl gap-x-2 gap-y-1",
    lg: "text-6xl gap-x-3 gap-y-1.5",
  } as const;

  return (
    <span
      aria-label="작심사일 (作心四日)"
      className={cn(
        "inline-grid grid-cols-2 place-items-center font-serif font-bold leading-none",
        sizes[size],
        className
      )}
    >
      <span aria-hidden>作</span>
      <span aria-hidden>心</span>
      <span aria-hidden>四</span>
      <span aria-hidden>日</span>
    </span>
  );
}
