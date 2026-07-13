"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PenLine, RefreshCw } from "lucide-react";
import { HEART_STROKE_COUNT, HeartStrokes } from "./heart-strokes";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * 랜딩용 인터랙티브 데모 — 방문자가 직접 하루 한 획씩 그어
 * 4일(4획) 만에 마음 심(心)을 완성해 보는 체험.
 */
export function HeartStrokeDemo() {
  const [strokes, setStrokes] = useState(0);
  const [round, setRound] = useState(1);
  const complete = strokes >= HEART_STROKE_COUNT;

  const handleClick = () => {
    if (complete) {
      setStrokes(0);
      setRound((r) => r + 1);
    } else {
      setStrokes((s) => s + 1);
    }
  };

  return (
    <div className="card-soft mx-auto flex max-w-md flex-col items-center rounded-[2rem] px-8 py-12">
      <div className="relative">
        <HeartStrokes size={180} strokes={strokes} className="text-foreground" />
        <AnimatePresence>
          {complete && (
            <motion.span
              initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: -8 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="absolute -right-4 -top-2 grid h-12 w-12 place-items-center rounded-lg bg-accent font-serif text-sm font-bold leading-tight text-white shadow-[var(--shadow-lift)]"
            >
              四日
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center gap-2.5" aria-hidden>
        {Array.from({ length: HEART_STROKE_COUNT }).map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full transition-colors duration-500 ${
              i < strokes ? "bg-accent" : "bg-line"
            }`}
          />
        ))}
      </div>

      <div className="mt-6 h-12 text-center" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.p
            key={complete ? "done" : strokes}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}
            className={
              complete
                ? "font-serif text-lg font-bold text-accent-strong"
                : "text-sm text-muted"
            }
          >
            {complete
              ? "작심(作心) 완성 — 진짜는 4일부터니까"
              : strokes === 0
                ? "마음 심(心)은 딱 네 획. 하루에 한 획이면 충분합니다."
                : `${strokes}일차 완료 — ${HEART_STROKE_COUNT - strokes}획 남았습니다.`}
          </motion.p>
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={handleClick}
        className={`mt-4 inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-semibold transition-all duration-300 [transition-timing-function:var(--ease-apple)] hover:scale-[1.03] active:scale-[0.97] ${
          complete
            ? "border border-line bg-surface text-foreground"
            : "bg-foreground text-background shadow-[var(--shadow-soft)]"
        }`}
      >
        {complete ? (
          <>
            <RefreshCw size={16} />
            다시 시작하기
          </>
        ) : (
          <>
            <PenLine size={16} />
            {strokes + 1}일차 — 한 획 긋기
          </>
        )}
      </button>

      {round > 1 && (
        <p className="mt-4 text-xs text-faint">
          {round}번째 마음을 쓰는 중 — 다시 시작해도 획은 사라지지 않습니다.
        </p>
      )}
    </div>
  );
}
