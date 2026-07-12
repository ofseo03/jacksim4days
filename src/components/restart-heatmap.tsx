"use client";

import { useMemo } from "react";
import { addDays, lastNDays, todayISO, formatShort } from "@/lib/dates";
import { buildDayMap } from "@/lib/stats";
import type { Habit } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Restart Heatmap — GitHub 잔디와 달리 '초록 = 완료', '보라 링 = 다시 시작한 날'.
 * 끊긴 날은 비어 보일 뿐, 빨간색 같은 부정 신호를 절대 쓰지 않는다.
 */
export function RestartHeatmap({ habits, weeks = 16 }: { habits: Habit[]; weeks?: number }) {
  const { cells, maxCount } = useMemo(() => {
    const { counts, restarts } = buildDayMap(habits);
    const today = todayISO();
    // 주 단위 정렬: 오늘이 속한 주의 일요일까지 채운다 (월요일 시작)
    const dow = (new Date().getDay() + 6) % 7;
    const end = addDays(today, 6 - dow);
    const days = lastNDays(weeks * 7, end);
    const max = Math.max(1, ...counts.values());
    return {
      maxCount: max,
      cells: days.map((d) => ({
        date: d,
        future: d > today,
        count: counts.get(d) ?? 0,
        restart: restarts.has(d),
      })),
    };
  }, [habits, weeks]);

  const columns = useMemo(() => {
    const cols: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) cols.push(cells.slice(i, i + 7));
    return cols;
  }, [cells]);

  return (
    <div className="overflow-x-auto no-scrollbar">
      <div className="flex gap-1.5" style={{ minWidth: weeks * 18 }}>
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1.5">
            {col.map((cell) => {
              const level = cell.count === 0 ? 0 : Math.ceil((cell.count / maxCount) * 3);
              return (
                <div
                  key={cell.date}
                  title={
                    cell.future
                      ? ""
                      : `${formatShort(cell.date)} · ${
                          cell.restart
                            ? "다시 시작한 날 🌱"
                            : cell.count > 0
                              ? `${cell.count}개 완료`
                              : "쉬어간 날"
                        }`
                  }
                  className={cn(
                    "h-3.5 w-3.5 rounded-[5px] transition-colors duration-300",
                    cell.future && "opacity-0",
                    level === 0 && "bg-surface",
                    level === 1 && "bg-success/35",
                    level === 2 && "bg-success/65",
                    level === 3 && "bg-success",
                    cell.restart && "ring-2 ring-accent ring-offset-1 ring-offset-card"
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[4px] bg-success" /> 완료한 날
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[4px] bg-surface ring-2 ring-accent ring-offset-1 ring-offset-card" />{" "}
          다시 시작한 날
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[4px] bg-surface" /> 쉬어간 날
        </span>
      </div>
    </div>
  );
}
