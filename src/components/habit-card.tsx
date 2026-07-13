"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, ChevronRight, PenLine, RefreshCw } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import type { Habit, HabitStats } from "@/lib/types";

const EASE = [0.22, 1, 0.36, 1] as const;

export function HabitCard({
  habit,
  stats,
  onComplete,
  onUncomplete,
  index = 0,
}: {
  habit: Habit;
  stats: HabitStats;
  onComplete: () => void;
  onUncomplete: () => void;
  index?: number;
}) {
  const returning = !stats.doneToday && stats.totalDays > 0 && stats.currentJourney === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: EASE }}
    >
      <Card className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface text-2xl">
          {habit.emoji}
        </div>

        <div className="min-w-0 flex-1">
          <Link
            href={`/habits/${habit.id}`}
            className="group flex items-center gap-1 font-semibold tracking-tight"
          >
            <span className="truncate">{habit.name}</span>
            <ChevronRight
              size={15}
              className="shrink-0 text-faint transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
            {stats.restartCount > 0 && (
              <Badge tone="accent">
                <RefreshCw size={12} /> {stats.restartCount}번 다시 시작
              </Badge>
            )}
            {stats.currentJourney > 0 ? (
              <span>{stats.currentJourney}일째 여정 중</span>
            ) : returning ? (
              <span className="text-accent-strong">오늘 다시 시작하면 됩니다</span>
            ) : (
              <span>오늘이 첫날이에요</span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={stats.doneToday ? onUncomplete : onComplete}
          aria-label={stats.doneToday ? "완료 취소" : "오늘 완료"}
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2",
            "transition-all duration-300 [transition-timing-function:var(--ease-apple)]",
            "hover:scale-[1.06] active:scale-[0.94]",
            stats.doneToday
              ? "border-success bg-success text-white shadow-[0_6px_20px_var(--success-soft)]"
              : "border-line bg-transparent text-faint hover:border-success hover:text-success"
          )}
        >
          {stats.doneToday ? <Check size={22} strokeWidth={3} /> : <PenLine size={20} />}
        </button>
      </Card>
    </motion.div>
  );
}
