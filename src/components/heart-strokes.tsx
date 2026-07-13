"use client";

import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export const HEART_STROKE_COUNT = 4;

/**
 * 마음 심(心)의 4획 — 필순대로: ① 왼쪽 점, ② 누운 갈고리(卧钩), ③ 가운데 점, ④ 오른쪽 점.
 * 하루의 완료가 한 획이 되어, 4일이면 한 글자가 완성된다.
 */
const STROKES: Array<{ d: string; width: number; duration: number }> = [
  { d: "M23 46 C27 51 29 57 28 64", width: 8, duration: 0.45 },
  {
    d: "M40 30 C33 55 38 80 57 88 C74 94 88 84 91 67 C91.5 64 90 61 87 58.5",
    width: 8.5,
    duration: 0.9,
  },
  { d: "M58 15 C62 23 64 30 63 37", width: 8, duration: 0.45 },
  { d: "M90 23 C96 30 99 38 98 45", width: 8, duration: 0.45 },
];

export function HeartStrokes({
  size = 120,
  strokes = 0,
  animate = true,
  showGuide = true,
  className,
}: {
  size?: number;
  /** 지금까지 그어진 획 수 (0–4) */
  strokes?: number;
  animate?: boolean;
  /** 아직 긋지 않은 획을 옅은 가이드로 표시 */
  showGuide?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden
    >
      {showGuide &&
        STROKES.map((s, i) => (
          <path
            key={`guide-${i}`}
            d={s.d}
            stroke="currentColor"
            strokeWidth={s.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.08}
          />
        ))}
      {STROKES.map((s, i) => (
        <motion.path
          key={i}
          d={s.d}
          stroke="currentColor"
          strokeWidth={s.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: i < strokes ? 1 : 0, opacity: i < strokes ? 1 : 0 }}
          transition={
            animate
              ? { duration: s.duration, ease: EASE, opacity: { duration: 0.12 } }
              : { duration: 0 }
          }
        />
      ))}
    </svg>
  );
}
