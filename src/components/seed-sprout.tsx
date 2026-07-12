"use client";

import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * 체크 표시 대신 사용하는 '씨앗이 자라는' 애니메이션.
 * animate=true일 때 줄기가 자라고 잎이 펼쳐지며 빛이 켜진다.
 */
export function SeedSprout({
  size = 48,
  animate = true,
  delay = 0,
}: {
  size?: number;
  animate?: boolean;
  delay?: number;
}) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      initial={false}
      aria-hidden
    >
      {/* 빛 */}
      <motion.circle
        cx="32"
        cy="30"
        r="26"
        fill="var(--accent)"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={
          animate
            ? { opacity: [0, 0.18, 0.1], scale: [0.4, 1.15, 1] }
            : { opacity: 0.08, scale: 1 }
        }
        transition={{ duration: 1.2, delay, ease: EASE }}
        style={{ transformOrigin: "32px 30px" }}
      />
      {/* 흙 */}
      <motion.path
        d="M18 50 Q32 44 46 50"
        stroke="var(--warning)"
        strokeWidth="3.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay, ease: EASE }}
      />
      {/* 줄기 */}
      <motion.path
        d="M32 48 C32 40 32 34 32 26"
        stroke="var(--success)"
        strokeWidth="3.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: animate ? 1 : 1 }}
        transition={{ duration: 0.7, delay: delay + 0.25, ease: EASE }}
      />
      {/* 왼쪽 잎 */}
      <motion.path
        d="M32 34 C26 34 21 30 20 24 C27 24 31 28 32 34 Z"
        fill="var(--success)"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55, delay: delay + 0.7, ease: EASE }}
        style={{ transformOrigin: "32px 34px" }}
      />
      {/* 오른쪽 잎 */}
      <motion.path
        d="M32 28 C38 28 43 24 44 18 C37 18 33 22 32 28 Z"
        fill="var(--success)"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55, delay: delay + 0.9, ease: EASE }}
        style={{ transformOrigin: "32px 28px" }}
      />
      {/* 반짝임 */}
      <motion.circle
        cx="45"
        cy="14"
        r="2"
        fill="var(--accent)"
        initial={{ scale: 0, opacity: 0 }}
        animate={animate ? { scale: [0, 1.4, 1], opacity: [0, 1, 0.7] } : { opacity: 0.6, scale: 1 }}
        transition={{ duration: 0.6, delay: delay + 1.15, ease: EASE }}
      />
    </motion.svg>
  );
}
