"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthGrid, todayISO, WEEKDAY_KO } from "@/lib/dates";
import { cn } from "@/lib/utils";

/**
 * Restart Calendar — 완료(초록), 다시 시작(보라 링)을 표시하는 월 달력.
 */
export function RestartCalendar({
  completions,
  restarts,
}: {
  completions: Set<string>;
  restarts: Set<string>;
}) {
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const today = todayISO();
  const cells = monthGrid(ym.y, ym.m);

  const move = (delta: number) => {
    setYm(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-semibold">
          {ym.y}년 {ym.m + 1}월
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="이전 달"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="다음 달"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_KO.map((w) => (
          <div key={w} className="pb-2 text-xs font-medium text-faint">
            {w}
          </div>
        ))}
        {cells.map((date, i) =>
          date === null ? (
            <div key={`e${i}`} />
          ) : (
            <div key={date} className="flex justify-center py-0.5">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm",
                  "transition-colors duration-300",
                  completions.has(date)
                    ? "bg-success font-semibold text-white"
                    : date === today
                      ? "bg-surface font-semibold"
                      : date > today
                        ? "text-faint"
                        : "text-muted",
                  restarts.has(date) && "ring-2 ring-accent ring-offset-2 ring-offset-card"
                )}
              >
                {Number(date.slice(8))}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
