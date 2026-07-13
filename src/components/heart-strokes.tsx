"use client";

import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export const HEART_STROKE_COUNT = 4;

/**
 * 마음 심(心)의 4획 — 필순대로: ① 왼쪽 점, ② 누운 갈고리(卧钩), ③ 가운데 점, ④ 오른쪽 점.
 * 하루의 완료가 한 획이 되어, 4일이면 한 글자가 완성된다.
 * viewBox 120×120 기준. 캔버스 렌더링(공유 이미지)에서도 같은 경로를 쓴다.
 */
export const HEART_STROKE_PATHS: Array<{ d: string; width: number; duration: number }> = [
  { d: "M23 46 C27 51 29 57 28 64", width: 8, duration: 0.45 },
  {
    d: "M40 30 C33 55 38 80 57 88 C74 94 88 84 91 67 C91.5 64 90 61 87 58.5",
    width: 8.5,
    duration: 0.9,
  },
  { d: "M58 15 C62 23 64 30 63 37", width: 8, duration: 0.45 },
  { d: "M90 23 C96 30 99 38 98 45", width: 8, duration: 0.45 },
];

export const HEART_VIEWBOX = 120;

export function HeartStrokes({
  size = 120,
  strokes = 0,
  animate = true,
  draw = false,
  showGuide = true,
  className,
  style,
}: {
  size?: number;
  /** 지금까지 그어진 획 수 (0–4) */
  strokes?: number;
  animate?: boolean;
  /** 마운트 시 획을 필순대로 이어서 그리는 연출 */
  draw?: boolean;
  /** 아직 긋지 않은 획을 옅은 가이드로 표시 */
  showGuide?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  // draw 모드: 각 획이 앞 획을 이어받도록 누적 딜레이를 계산한다.
  const delays = HEART_STROKE_PATHS.reduce<number[]>((acc, s, i) => {
    acc.push(i === 0 ? 0.2 : acc[i - 1] + HEART_STROKE_PATHS[i - 1].duration * 0.85);
    void s;
    return acc;
  }, []);

  return (
    <svg
      viewBox={`0 0 ${HEART_VIEWBOX} ${HEART_VIEWBOX}`}
      width={size}
      height={size}
      fill="none"
      className={className}
      style={style}
      aria-hidden
    >
      {showGuide &&
        HEART_STROKE_PATHS.map((s, i) => (
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
      {HEART_STROKE_PATHS.map((s, i) => (
        <motion.path
          key={i}
          d={s.d}
          stroke="currentColor"
          strokeWidth={s.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={draw ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: i < strokes ? 1 : 0, opacity: i < strokes ? 1 : 0 }}
          transition={
            draw
              ? { duration: s.duration, delay: delays[i], ease: EASE, opacity: { duration: 0.1, delay: delays[i] } }
              : animate
                ? { duration: s.duration, ease: EASE, opacity: { duration: 0.12 } }
                : { duration: 0 }
          }
        />
      ))}
    </svg>
  );
}
