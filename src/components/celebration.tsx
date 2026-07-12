"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SeedSprout } from "./seed-sprout";

const EASE = [0.22, 1, 0.36, 1] as const;

export interface Celebration {
  title: string;
  message: string;
  isRestart: boolean;
}

/**
 * 습관 완료 시 뜨는 전체 화면 축하 오버레이.
 * '다시 시작'이면 복귀를 축하하는 문구와 배지를 함께 보여준다.
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
            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-success-soft">
              <SeedSprout size={72} />
            </div>
            {celebration.isRestart && (
              <motion.span
                className="mb-3 inline-flex items-center gap-1 rounded-full bg-accent-soft px-4 py-1.5 text-sm font-semibold text-accent-strong"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4, ease: EASE }}
              >
                🌱 다시 시작
              </motion.span>
            )}
            <motion.h2
              className="text-2xl font-bold tracking-tight"
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
