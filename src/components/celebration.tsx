"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { completeCheer, restartCelebration } from "@/lib/messages";
import { HEART_STROKE_COUNT, HeartStrokes } from "./heart-strokes";

const EASE = [0.22, 1, 0.36, 1] as const;

export interface Celebration {
  title: string;
  message: string;
  isRestart: boolean;
  /** 이번 心에서 오늘까지 그어진 획 수 (1–4) */
  strokes: number;
}

/** 완료 종류(첫 완료/재시작/心 완성)에 맞는 축하 내용을 만든다. */
export function buildCelebration(isRestart: boolean, journeyLength: number): Celebration {
  const strokes = ((journeyLength - 1) % HEART_STROKE_COUNT) + 1;
  if (strokes === HEART_STROKE_COUNT) {
    return {
      isRestart,
      strokes,
      title: "마음 하나가 완성됐습니다",
      message: "4일을 이어 심(心) 한 글자를 모두 썼습니다. 진짜는 4일부터니까.",
    };
  }
  if (isRestart) {
    return { isRestart, strokes, title: "다시 시작했습니다", message: restartCelebration() };
  }
  return { isRestart, strokes, title: "오늘도 해냈어요", message: completeCheer() };
}

/** 이전 획들은 바로 보여주고, 오늘의 획은 잠시 뒤 그어지는 연출. */
function TodayStroke({ strokes }: { strokes: number }) {
  const [drawn, setDrawn] = useState(strokes - 1);
  const complete = strokes >= HEART_STROKE_COUNT;

  useEffect(() => {
    const t = setTimeout(() => setDrawn(strokes), 450);
    return () => clearTimeout(t);
  }, [strokes]);

  return (
    <div className="relative mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-surface">
      <HeartStrokes size={84} strokes={drawn} className="text-foreground" />
      <AnimatePresence>
        {complete && (
          <motion.span
            initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: -8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 1.1, ease: EASE }}
            className="absolute -right-1 -top-1 grid h-9 w-9 place-items-center rounded-md bg-accent font-serif text-[11px] font-bold leading-tight text-white shadow-[var(--shadow-soft)]"
          >
            四日
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * 습관 완료 시 뜨는 전체 화면 축하 오버레이.
 * 오늘의 완료가 心의 한 획으로 그어지고, 4획째에는 四日 낙관이 찍힌다.
 */
export function CelebrationOverlay({
  celebration,
  onClose,
}: {
  celebration: Celebration | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="glass w-full max-w-sm rounded-[2rem] p-10 text-center shadow-[var(--shadow-lift)]"
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.45, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            <TodayStroke strokes={celebration.strokes} />

            <div className="mb-4 flex items-center justify-center gap-2" aria-hidden>
              {Array.from({ length: HEART_STROKE_COUNT }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${
                    i < celebration.strokes ? "bg-accent" : "bg-line"
                  }`}
                />
              ))}
            </div>

            {celebration.isRestart && (
              <motion.span
                className="mb-3 inline-flex items-center gap-1 rounded-full bg-accent-soft px-4 py-1.5 text-sm font-semibold text-accent-strong"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4, ease: EASE }}
              >
                🖌️ 다시 시작
              </motion.span>
            )}
            <motion.h2
              className="font-serif text-2xl font-bold tracking-tight"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4, ease: EASE }}
            >
              {celebration.title}
            </motion.h2>
            <motion.p
              className="mt-3 leading-relaxed text-muted"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4, ease: EASE }}
            >
              {celebration.message}
            </motion.p>
            <motion.button
              className="mt-8 h-12 w-full rounded-full bg-foreground font-semibold text-background transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.4 }}
            >
              고마워요
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
