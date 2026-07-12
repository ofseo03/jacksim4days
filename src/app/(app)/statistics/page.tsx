"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Sprout } from "lucide-react";
import { RestartHeatmap } from "@/components/restart-heatmap";
import { StatTile } from "@/components/stat-tile";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatShort, todayISO } from "@/lib/dates";
import { recommendHabits, weeklyReport } from "@/lib/messages";
import { aggregateStats, computeJourneys } from "@/lib/stats";
import { useHabits } from "@/lib/store";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function StatisticsPage() {
  const { hydrated, state } = useHabits();
  const today = todayISO();
  const agg = useMemo(() => aggregateStats(state.habits, today), [state.habits, today]);

  // Growth Timeline: 모든 습관의 '다시 시작' 이벤트를 시간순으로
  const timeline = useMemo(() => {
    const events: Array<{ date: string; habit: string; emoji: string; gap: number }> = [];
    for (const h of state.habits.filter((x) => !x.archived)) {
      for (const j of computeJourneys(h.completions)) {
        if (j.isRestart) {
          events.push({ date: j.start, habit: h.name, emoji: h.emoji, gap: j.gapBefore });
        }
      }
    }
    return events.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 12);
  }, [state.habits]);

  const recommendations = useMemo(
    () => recommendHabits(state.habits),
    [state.habits]
  );

  if (!hydrated) {
    return <div className="py-32 text-center text-faint">불러오는 중…</div>;
  }

  const daysInMonth = new Date(
    Number(today.slice(0, 4)),
    Number(today.slice(5, 7)),
    0
  ).getDate();
  const elapsed = Number(today.slice(8));
  const monthCapacity = Math.max(1, agg.activeCount * elapsed);
  const monthlyProgress = Math.min(1, agg.monthDone / monthCapacity);

  return (
    <div className="space-y-10">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">통계</h1>
        <p className="mt-2 text-muted">
          연속 기록은 없습니다. 돌아온 힘과 쌓인 날들만 있습니다.
        </p>
      </motion.section>

      {state.habits.filter((h) => !h.archived).length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted">
            아직 데이터가 없어요.{" "}
            <Link href="/dashboard" className="font-semibold text-accent-strong">
              첫 습관을 심으러 가기 →
            </Link>
          </p>
        </Card>
      ) : (
        <>
          {/* 핵심 지표 */}
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile
              index={0}
              label="Restart Count"
              icon={<Sprout size={15} className="text-accent" />}
              value={`🌱 ${agg.totalRestarts}`}
              sub="다시 시작한 총 횟수"
            />
            <StatTile
              index={1}
              label="Recovery Rate"
              value={`${Math.round(agg.recoveryRate * 100)}%`}
              sub="쉼 이후 돌아온 비율"
            />
            <StatTile
              index={2}
              label="총 성공한 날"
              value={`${agg.totalDays}일`}
              sub="모든 습관 합산"
            />
            <StatTile
              index={3}
              label="오늘"
              value={`${agg.doneTodayCount}/${agg.activeCount}`}
              sub="오늘 완료한 습관"
            />
          </section>

          {/* 히트맵 */}
          <section>
            <Card className="p-6">
              <h2 className="font-bold tracking-tight">Restart Heatmap</h2>
              <p className="mb-5 mt-1 text-sm text-muted">
                최근 16주 — 빈 칸은 실패가 아니라 쉼표입니다.
              </p>
              <RestartHeatmap habits={state.habits} />
            </Card>
          </section>

          {/* Monthly Progress + Success Rate */}
          <section className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h2 className="font-bold tracking-tight">Monthly Progress</h2>
              <p className="mt-1 text-sm text-muted">
                이번 달 {elapsed}일 중 {agg.monthDone}회 완료 (총 {daysInMonth}일)
              </p>
              <div className="mt-5">
                <Progress value={monthlyProgress} />
                <p className="mt-2 text-right text-sm font-semibold text-accent-strong">
                  {Math.round(monthlyProgress * 100)}%
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-bold tracking-tight">습관별 Success Rate</h2>
              <p className="mt-1 text-sm text-muted">최근 30일 기준</p>
              <div className="mt-5 space-y-4">
                {agg.perHabit
                  .filter((x) => !x.habit.archived)
                  .map(({ habit, stats }) => (
                    <div key={habit.id}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <Link
                          href={`/habits/${habit.id}`}
                          className="font-medium transition-colors hover:text-accent-strong"
                        >
                          {habit.emoji} {habit.name}
                        </Link>
                        <span className="text-muted">
                          {Math.round(stats.successRate30 * 100)}%
                        </span>
                      </div>
                      <Progress value={stats.successRate30} tone="success" />
                    </div>
                  ))}
              </div>
            </Card>
          </section>

          {/* Growth Timeline */}
          <section>
            <Card className="p-6">
              <h2 className="font-bold tracking-tight">Growth Timeline</h2>
              <p className="mt-1 text-sm text-muted">
                다시 시작한 순간들 — 이것이 당신의 성장 기록입니다.
              </p>
              {timeline.length === 0 ? (
                <p className="mt-8 text-center text-sm text-faint">
                  아직 재시작 기록이 없어요. 그것도 좋은 일입니다.
                </p>
              ) : (
                <ol className="mt-5 space-y-4">
                  {timeline.map((e, i) => (
                    <motion.li
                      key={`${e.date}-${e.habit}`}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.04, ease: EASE }}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft">
                        🌱
                      </span>
                      <span className="font-medium">
                        {e.emoji} {e.habit}
                      </span>
                      <span className="text-muted">
                        {formatShort(e.date)} · {e.gap}일 쉬고 다시 시작
                      </span>
                    </motion.li>
                  ))}
                </ol>
              )}
            </Card>
          </section>

          {/* 주간 리포트 */}
          <section>
            <Card glass className="p-7">
              <h2 className="flex items-center gap-2 font-bold tracking-tight">
                <Sparkles size={17} className="text-accent" /> AI 주간 리포트
              </h2>
              <div className="mt-4 space-y-3 leading-relaxed text-muted">
                {weeklyReport(state.profile?.name, agg).map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </Card>
          </section>

          {/* 습관 추천 */}
          {recommendations.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold tracking-tight">
                이런 습관은 어때요?
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {recommendations.map((r, i) => (
                  <motion.div
                    key={r.name}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.07, ease: EASE }}
                  >
                    <Card className="h-full p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{r.emoji}</span>
                        <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-semibold text-muted">
                          {r.difficulty}
                        </span>
                      </div>
                      <p className="mt-3 font-semibold">{r.name}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">
                        {r.reason}
                      </p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
