"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { addDays, formatShort, todayISO } from "@/lib/dates";
import { heartSeed, shareHeartsImage } from "@/lib/heart-image";
import { computeStats } from "@/lib/stats";
import { useTheme } from "@/lib/theme";
import type { Habit } from "@/lib/types";
import { HEART_STROKE_COUNT, HeartStrokes } from "./heart-strokes";

const EASE = [0.22, 1, 0.36, 1] as const;

interface CompletedHeart {
  key: string;
  emoji: string;
  habitName: string;
  completedOn: string;
  seed: number;
}

interface PartialHeart {
  key: string;
  emoji: string;
  habitName: string;
  strokes: number;
}

/**
 * 먹그림 아카이브 — 4일마다 완성된 心이 한 점씩 쌓인다.
 * 같은 心은 항상 같은 기울기·농도를 가져 시간이 지날수록 그림이 짙어진다.
 * habits는 호출부에서 걸러서 전달한다(전체 아카이브 또는 습관 하나).
 */
export function HeartArchive({
  habits,
  name,
  title = "나의 먹그림",
  shareHeading,
}: {
  habits: Habit[];
  name?: string;
  title?: string;
  /** 공유 이미지 제목 재정의 (예: 습관 상세에서 습관 이름) */
  shareHeading?: string;
}) {
  const today = todayISO();
  const { isDark } = useTheme();
  const [shareState, setShareState] = useState<"idle" | "busy" | "shared" | "downloaded">(
    "idle"
  );

  const { hearts, partials } = useMemo(() => {
    const hearts: CompletedHeart[] = [];
    const partials: PartialHeart[] = [];
    for (const h of habits) {
      const stats = computeStats(h, today);
      for (const j of stats.journeys) {
        const complete = Math.floor(j.length / HEART_STROKE_COUNT);
        for (let k = 1; k <= complete; k++) {
          const completedOn = addDays(j.start, k * HEART_STROKE_COUNT - 1);
          hearts.push({
            key: `${h.id}-${completedOn}`,
            emoji: h.emoji,
            habitName: h.name,
            completedOn,
            seed: heartSeed(`${h.id}-${completedOn}`),
          });
        }
      }
      const remainder = stats.currentJourney % HEART_STROKE_COUNT;
      if (stats.currentJourney > 0 && remainder !== 0) {
        partials.push({
          key: `${h.id}-writing`,
          emoji: h.emoji,
          habitName: h.name,
          strokes: remainder,
        });
      }
    }
    hearts.sort((a, b) => (a.completedOn < b.completedOn ? -1 : 1));
    return { hearts, partials };
  }, [habits, today]);

  const handleShare = async () => {
    if (shareState === "busy") return;
    setShareState("busy");
    try {
      const result = await shareHeartsImage({
        name,
        count: hearts.length,
        seeds: hearts.slice(-16).map((h) => h.seed),
        tone: isDark ? "ink" : "paper",
        heading: shareHeading
          ? `${shareHeading} — ${hearts.length}개의 마음`
          : undefined,
      });
      setShareState(result);
    } catch {
      setShareState("idle");
      return;
    }
    setTimeout(() => setShareState("idle"), 2500);
  };

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-bold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-muted">
            {hearts.length > 0
              ? `${hearts.length}개의 마음이 모였습니다 — 4일마다 心 한 글자가 쌓입니다.`
              : "4일을 이어가면 첫 心이 이곳에 찍힙니다. 진짜는 4일부터니까."}
          </p>
        </div>
        {hearts.length > 0 && (
          <button
            type="button"
            onClick={handleShare}
            disabled={shareState === "busy"}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-semibold transition-transform duration-300 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-60"
          >
            <Share2 size={14} />
            {shareState === "busy"
              ? "그리는 중…"
              : shareState === "shared"
                ? "공유했습니다"
                : shareState === "downloaded"
                  ? "저장했습니다"
                  : "이미지로 공유"}
          </button>
        )}
      </div>

      {hearts.length === 0 && partials.length === 0 ? (
        <div className="mt-6 flex items-center justify-center rounded-2xl bg-surface py-10">
          <HeartStrokes size={72} strokes={0} className="text-foreground" />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-2">
          {hearts.map((h, i) => {
            const rot = (h.seed % 13) - 6;
            const alpha = 0.6 + (h.seed % 5) * 0.1;
            return (
              <motion.div
                key={h.key}
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: Math.min(i, 12) * 0.03, ease: EASE }}
                title={`${h.emoji} ${h.habitName} — ${formatShort(h.completedOn)} 완성`}
                className="relative grid aspect-square place-items-center rounded-xl transition-colors hover:bg-surface"
              >
                <HeartStrokes
                  size={52}
                  strokes={HEART_STROKE_COUNT}
                  animate={false}
                  showGuide={false}
                  className="text-foreground"
                  style={{ transform: `rotate(${rot}deg)`, opacity: alpha }}
                />
                <span className="absolute bottom-0.5 right-1 text-[11px]">{h.emoji}</span>
              </motion.div>
            );
          })}
          {partials.map((p) => (
            <div
              key={p.key}
              title={`${p.emoji} ${p.habitName} — ${p.strokes}/4획 쓰는 중`}
              className="relative grid aspect-square place-items-center rounded-xl border border-dashed border-line"
            >
              <HeartStrokes
                size={52}
                strokes={p.strokes}
                animate={false}
                className="text-foreground"
              />
              <span className="absolute bottom-0.5 right-1 text-[11px]">{p.emoji}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
