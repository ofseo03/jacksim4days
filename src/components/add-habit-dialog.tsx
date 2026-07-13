"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useHabits } from "@/lib/store";
import { CATEGORY_META, type HabitCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const EMOJIS = ["🖌️", "🏃", "📖", "💧", "🧘", "✏️", "🗣️", "🌅", "💪", "🥗", "✍️", "🎧"];

export function AddHabitDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addHabit } = useHabits();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🖌️");
  const [category, setCategory] = useState<HabitCategory>("custom");

  const submit = () => {
    const n = name.trim();
    if (!n) return;
    addHabit({ name: n, emoji, category });
    setName("");
    setEmoji("🖌️");
    setCategory("custom");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="glass w-full max-w-md rounded-[2rem] p-7 shadow-[var(--shadow-lift)]"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.4, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="새 습관 추가"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">새 마음 새기기</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-1 text-sm text-muted">
              작을수록 오래 갑니다. 5분짜리 습관도 충분해요.
            </p>

            <div className="mt-6 space-y-5">
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예) 자기 전 10쪽 읽기"
                maxLength={24}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />

              <div>
                <p className="mb-2 text-sm font-medium text-muted">아이콘</p>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl text-lg",
                        "transition-all duration-300 hover:scale-[1.06]",
                        emoji === e
                          ? "bg-accent-soft ring-2 ring-accent"
                          : "bg-surface hover:bg-line"
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-muted">카테고리</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(CATEGORY_META) as HabitCategory[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm font-medium",
                        "transition-all duration-300",
                        category === c
                          ? "border-accent bg-accent-soft text-accent-strong"
                          : "border-line text-muted hover:border-faint hover:text-foreground"
                      )}
                    >
                      {CATEGORY_META[c].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              variant="accent"
              className="mt-7 w-full"
              disabled={!name.trim()}
              onClick={submit}
            >
              새기기 🖌️
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
