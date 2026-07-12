"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Plus, Sparkles, Sprout, Trophy } from "lucide-react";
import { CelebrationOverlay, type Celebration } from "@/components/celebration";
import { HabitCard } from "@/components/habit-card";
import { StatTile } from "@/components/stat-tile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatKorean, thisWeek, todayISO, weekdayKo } from "@/lib/dates";
import {
  coachMessage,
  completeCheer,
  dailyQuote,
  restartCelebration,
} from "@/lib/messages";
import { aggregateStats } from "@/lib/stats";
import { useHabits } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AddHabitDialog } from "@/components/add-habit-dialog";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function DashboardPage() {
  const { hydrated, state, completeToday, uncompleteToday, loadDemoData } = useHabits();
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const today = todayISO();
  const agg = useMemo(() => aggregateStats(state.habits, today), [state.habits, today]);
  const active = agg.perHabit.filter((x) => !x.habit.archived);
  const week = thisWeek(today);

  if (!hydrated) {
    return <div className="py-32 text-center text-faint">불러오는 중…</div>;
  }

  const handleComplete = (id: string) => {
    const { isRestart } = completeToday(id);
    setCelebration(
      isRestart
        ? {
            isRestart: true,
            title: "다시 시작했습니다",
            message: restartCelebration(),
          }
        : {
            isRestart: false,
            title: "오늘도 해냈어요",
            message: completeCheer(),
          }
    );
  };

  return (
    <div className="space-y-10">
      {/* 인사 + AI 한 줄 응원 */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <p className="flex items-center gap-2 text-sm text-muted">
          <CalendarDays size={14} />
          {formatKorean(today)} {weekdayKo(today)}요일
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          {state.profile?.name
            ? `${state.profile.name}님, 어서 오세요`
            : "어서 오세요"}
        </h1>
        <p className="mt-3 flex items-start gap-2 text-muted">
          <Sparkles size={16} className="mt-1 shrink-0 text-accent" />
          {coachMessage(state.profile?.name, agg)}
        </p>
      </motion.section>

      {/* 오늘의 습관 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">오늘의 습관</h2>
          <Button size="sm" variant="secondary" onClick={() => setAddOpen(true)}>
            <Plus size={15} /> 추가
          </Button>
        </div>

        {active.length === 0 ? (
          <Card className="flex flex-col items-center gap-4 p-12 text-center">
            <span className="text-4xl">🌱</span>
            <p className="font-semibold">아직 심은 씨앗이 없어요</p>
            <p className="text-sm text-muted">
              첫 습관을 심어볼까요? 아주 작게 시작해도 충분합니다.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => setAddOpen(true)}>
                <Plus size={16} /> 첫 습관 심기
              </Button>
              <Button variant="outline" onClick={loadDemoData}>
                데모 데이터 살펴보기
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {active.map(({ habit, stats }, i) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                stats={stats}
                index={i}
                onComplete={() => handleComplete(habit.id)}
                onUncomplete={() => uncompleteToday(habit.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 이번 주 */}
      {active.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold tracking-tight">이번 주</h2>
          <Card className="p-6">
            <div className="grid grid-cols-7 gap-2">
              {week.map((d) => {
                const done = state.habits.filter(
                  (h) => !h.archived && h.completions.includes(d)
                ).length;
                const total = active.length;
                const ratio = total === 0 ? 0 : done / total;
                const isToday = d === today;
                const future = d > today;
                return (
                  <div key={d} className="flex flex-col items-center gap-2">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isToday ? "text-accent-strong" : "text-faint"
                      )}
                    >
                      {weekdayKo(d)}
                    </span>
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold",
                        "transition-colors duration-300",
                        future
                          ? "bg-surface text-faint/50"
                          : ratio === 1
                            ? "bg-success text-white"
                            : ratio > 0
                              ? "bg-success-soft text-success"
                              : "bg-surface text-faint",
                        isToday && "ring-2 ring-accent ring-offset-2 ring-offset-card"
                      )}
                    >
                      {future ? "" : `${done}/${total}`}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>
      )}

      {/* 요약 통계 */}
      {active.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-bold tracking-tight">한눈에 보기</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile
              index={0}
              label="다시 시작"
              icon={<Sprout size={15} className="text-accent" />}
              value={
                <>
                  🌱 {agg.totalRestarts}
                  <span className="ml-1 text-base font-medium text-muted">번</span>
                </>
              }
              sub="돌아온 횟수만큼 강해졌어요"
            />
            <StatTile
              index={1}
              label="총 성공한 날"
              value={`${agg.totalDays}일`}
              sub="차곡차곡 쌓이는 중"
            />
            <StatTile
              index={2}
              label="이번 주 완료"
              value={`${agg.weekDone}회`}
              sub={`이번 달 ${agg.monthDone}회`}
            />
            <StatTile
              index={3}
              label="복귀율"
              value={`${Math.round(agg.recoveryRate * 100)}%`}
              sub="쉬어도 다시 돌아오는 힘"
            />
          </div>
        </section>
      )}

      {/* 가장 오래 유지한 습관 */}
      {agg.longest && (
        <section>
          <Card glass className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning-soft">
              <Trophy size={22} className="text-warning" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted">가장 오래 이어간 여정</p>
              <p className="font-bold">
                {agg.longest.habit.emoji} {agg.longest.habit.name} —{" "}
                {agg.longest.length}일
              </p>
            </div>
            <Link
              href={`/habits/${agg.longest.habit.id}`}
              className="text-sm font-semibold text-accent-strong transition-colors hover:text-accent"
            >
              보기
            </Link>
          </Card>
        </section>
      )}

      {/* 오늘의 문장 */}
      <section>
        <Card className="bg-surface p-8 text-center">
          <p className="text-balance font-serif text-lg font-semibold leading-relaxed">
            &ldquo;{dailyQuote()}&rdquo;
          </p>
          <p className="mt-2 text-xs text-faint">오늘의 문장</p>
        </Card>
      </section>

      <CelebrationOverlay celebration={celebration} onClose={() => setCelebration(null)} />
      <AddHabitDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
