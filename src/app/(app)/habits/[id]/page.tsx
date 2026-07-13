"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Check,
  PenLine,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  buildCelebration,
  CelebrationOverlay,
  type Celebration,
} from "@/components/celebration";
import { HeartArchive } from "@/components/heart-archive";
import { RestartCalendar } from "@/components/restart-calendar";
import { StatTile } from "@/components/stat-tile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatKorean, formatShort, todayISO } from "@/lib/dates";
import { habitComment } from "@/lib/messages";
import { computeStats } from "@/lib/stats";
import { useHabits } from "@/lib/store";
import { CATEGORY_META } from "@/lib/types";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function HabitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { hydrated, state, completeToday, uncompleteToday, archiveHabit, removeHabit } =
    useHabits();
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const habit = state.habits.find((h) => h.id === id);
  const today = todayISO();
  const stats = useMemo(
    () => (habit ? computeStats(habit, today) : null),
    [habit, today]
  );

  if (!hydrated) {
    return <div className="py-32 text-center text-faint">불러오는 중…</div>;
  }

  if (!habit || !stats) {
    return (
      <div className="py-32 text-center">
        <p className="text-muted">습관을 찾을 수 없어요.</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center gap-1.5 font-semibold text-accent-strong"
        >
          <ArrowLeft size={16} /> 대시보드로
        </Link>
      </div>
    );
  }

  const completions = new Set(habit.completions);
  const restarts = new Set(
    stats.journeys.filter((j) => j.isRestart).map((j) => j.start)
  );

  const handleComplete = () => {
    const prevJourney = stats.currentJourney;
    const { isRestart } = completeToday(habit.id);
    setCelebration(buildCelebration(isRestart, isRestart ? 1 : prevJourney + 1));
  };

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft size={15} /> 대시보드
      </Link>

      {/* 헤더 */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-surface text-3xl">
            {habit.emoji}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
                {habit.name}
              </h1>
              {habit.archived && <Badge>보관됨</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted">
              {CATEGORY_META[habit.category].label} · {formatKorean(habit.createdAt)}부터
            </p>
          </div>
        </div>

        <Button
          size="lg"
          variant={stats.doneToday ? "secondary" : "accent"}
          onClick={stats.doneToday ? () => uncompleteToday(habit.id) : handleComplete}
        >
          {stats.doneToday ? (
            <>
              <Check size={18} /> 오늘 완료됨
            </>
          ) : (
            <>
              <PenLine size={18} /> 오늘의 한 획
            </>
          )}
        </Button>
      </motion.section>

      {/* 코멘트 */}
      <Card glass className="flex items-start gap-3 p-6">
        <Sparkles size={18} className="mt-0.5 shrink-0 text-accent" />
        <p className="leading-relaxed">{habitComment(stats)}</p>
      </Card>

      {/* 통계 타일 */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          index={0}
          label="다시 시작"
          icon={<RefreshCw size={15} className="text-accent" />}
          value={`${stats.restartCount}번`}
          sub="첫 시작은 세지 않아요"
        />
        <StatTile index={1} label="현재 여정" value={`${stats.currentJourney}일`} sub={stats.currentJourney >= 4 ? "작심사일 달성!" : "차근차근"} />
        <StatTile index={2} label="총 성공한 날" value={`${stats.totalDays}일`} sub={`가장 긴 여정 ${stats.longestJourney}일`} />
        <StatTile
          index={3}
          label="복귀율"
          value={`${Math.round(stats.recoveryRate * 100)}%`}
          sub="돌아오는 힘"
        />
      </section>

      {/* 이 습관의 먹그림 */}
      <section>
        <HeartArchive
          habits={[habit]}
          name={state.profile?.name}
          title="이 습관의 먹그림"
          shareHeading={`${habit.emoji} ${habit.name}`}
        />
      </section>

      {/* 달력 + 여정 */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-2 font-bold tracking-tight">Restart Calendar</h2>
          <RestartCalendar completions={completions} restarts={restarts} />
        </Card>

        <Card className="p-6">
          <h2 className="font-bold tracking-tight">Restart Journey</h2>
          <p className="mt-1 text-sm text-muted">
            끊긴 기록이 아니라, 이어온 여정입니다.
          </p>
          {stats.journeys.length === 0 ? (
            <p className="mt-8 text-center text-sm text-faint">
              첫 완료와 함께 여정이 시작됩니다.
            </p>
          ) : (
            <ol className="mt-5 max-h-80 space-y-0 overflow-y-auto no-scrollbar">
              {[...stats.journeys].reverse().map((j, idx) => {
                const n = stats.journeys.length - idx;
                const ongoing = idx === 0 && stats.currentJourney > 0;
                return (
                  <li key={j.start} className="relative flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <span
                        className={
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold " +
                          (ongoing
                            ? "bg-accent text-white"
                            : j.isRestart
                              ? "bg-accent-soft text-accent-strong"
                              : "bg-surface text-muted")
                        }
                      >
                        {n}
                      </span>
                      <span className="mt-1 w-px flex-1 bg-line last:hidden" />
                    </div>
                    <div className="pb-1">
                      <p className="text-sm font-semibold">
                        {j.isRestart ? `${n - 1}번째 다시 시작` : "첫 시작"}
                        {ongoing && (
                          <span className="ml-2 text-xs font-medium text-accent-strong">
                            진행 중
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {formatShort(j.start)} ~ {ongoing ? "오늘" : formatShort(j.end)} ·{" "}
                        {j.length}일
                        {j.isRestart && j.gapBefore > 0 && (
                          <span className="text-faint"> · {j.gapBefore}일 쉬고 복귀</span>
                        )}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Card>
      </section>

      {/* 관리 */}
      <section>
        <Card className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            잠시 쉬고 싶다면 보관해두세요. 기록은 사라지지 않습니다.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => archiveHabit(habit.id, !habit.archived)}
            >
              {habit.archived ? (
                <>
                  <ArchiveRestore size={15} /> 다시 진행하기
                </>
              ) : (
                <>
                  <Archive size={15} /> 보관하기
                </>
              )}
            </Button>
            {confirmDelete ? (
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  removeHabit(habit.id);
                  router.push("/dashboard");
                }}
              >
                정말 삭제할까요?
              </Button>
            ) : (
              <Button size="sm" variant="danger" onClick={() => setConfirmDelete(true)}>
                <Trash2 size={15} /> 삭제
              </Button>
            )}
          </div>
        </Card>
      </section>

      <CelebrationOverlay celebration={celebration} onClose={() => setCelebration(null)} />
    </div>
  );
}
