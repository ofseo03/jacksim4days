"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatKorean, todayISO } from "@/lib/dates";
import { aggregateStats } from "@/lib/stats";
import { useHabits } from "@/lib/store";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

interface BadgeDef {
  emoji: string;
  title: string;
  desc: string;
  earned: (a: ReturnType<typeof aggregateStats>) => boolean;
}

const BADGES: BadgeDef[] = [
  {
    emoji: "🖌️",
    title: "첫 획",
    desc: "첫 습관을 완료했어요",
    earned: (a) => a.totalDays >= 1,
  },
  {
    emoji: "🔄",
    title: "돌아온 사람",
    desc: "처음으로 다시 시작했어요",
    earned: (a) => a.totalRestarts >= 1,
  },
  {
    emoji: "💪",
    title: "다시 시작 마스터",
    desc: "5번 이상 다시 시작했어요",
    earned: (a) => a.totalRestarts >= 5,
  },
  {
    emoji: "心",
    title: "작심사일",
    desc: "4일을 이어 心 한 글자를 완성했어요",
    earned: (a) => a.perHabit.some((x) => x.stats.longestJourney >= 4),
  },
  {
    emoji: "✨",
    title: "꾸준함의 증명",
    desc: "총 30일을 채웠어요",
    earned: (a) => a.totalDays >= 30,
  },
  {
    emoji: "🧭",
    title: "복귀의 달인",
    desc: "복귀율 80% 이상",
    earned: (a) => a.totalRestarts >= 2 && a.recoveryRate >= 0.8,
  },
];

export default function ProfilePage() {
  const { hydrated, state, setProfile } = useHabits();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");

  const startEdit = () => {
    setName(state.profile?.name ?? "");
    setGoal(state.profile?.goal ?? "");
    setEditing(true);
  };

  const today = todayISO();
  const agg = useMemo(() => aggregateStats(state.habits, today), [state.habits, today]);

  if (!hydrated) {
    return <div className="py-32 text-center text-faint">불러오는 중…</div>;
  }

  const save = () => {
    setProfile({
      name: name.trim() || "익명의 도전자",
      goal: goal.trim() || undefined,
      joinedAt: state.profile?.joinedAt ?? today,
    });
    setEditing(false);
  };

  const earnedBadges = BADGES.filter((b) => b.earned(agg));

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* 프로필 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <Card glass className="p-8 text-center">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft font-serif text-4xl font-bold ${
              agg.totalRestarts >= 5
                ? "text-accent-strong"
                : agg.totalDays >= 1
                  ? "text-foreground"
                  : "text-faint"
            }`}
          >
            心
          </div>

          {editing ? (
            <div className="mx-auto mt-6 max-w-xs space-y-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름"
                maxLength={12}
              />
              <Input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="이루고 싶은 것"
                maxLength={30}
              />
              <Button size="sm" className="w-full" onClick={save}>
                <Check size={15} /> 저장
              </Button>
            </div>
          ) : (
            <>
              <h1 className="mt-5 font-serif text-2xl font-bold tracking-tight">
                {state.profile?.name ?? "익명의 도전자"}
              </h1>
              {state.profile?.goal && (
                <p className="mt-1 text-muted">&ldquo;{state.profile.goal}&rdquo;</p>
              )}
              <p className="mt-2 text-xs text-faint">
                {state.profile?.joinedAt
                  ? `${formatKorean(state.profile.joinedAt)}부터 함께`
                  : "아직 여정 전"}
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="mt-4"
                onClick={startEdit}
              >
                <Pencil size={14} /> 수정
              </Button>
            </>
          )}

          <div className="mt-7 grid grid-cols-3 divide-x divide-line border-t border-line pt-6">
            <div>
              <p className="text-2xl font-bold">{agg.totalRestarts}</p>
              <p className="mt-1 text-xs text-muted">다시 시작</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{agg.totalDays}</p>
              <p className="mt-1 text-xs text-muted">성공한 날</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{Math.round(agg.recoveryRate * 100)}%</p>
              <p className="mt-1 text-xs text-muted">복귀율</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 배지 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">여정의 훈장</h2>
          <Badge tone="accent">
            {earnedBadges.length} / {BADGES.length}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {BADGES.map((b, i) => {
            const earned = b.earned(agg);
            return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
              >
                <Card
                  className={cn(
                    "h-full p-5 text-center transition-opacity duration-300",
                    !earned && "opacity-45"
                  )}
                >
                  <span className={cn("text-3xl", !earned && "grayscale")}>{b.emoji}</span>
                  <p className="mt-2 text-sm font-bold">{b.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{b.desc}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 진행 중인 습관 */}
      <section>
        <h2 className="mb-4 text-lg font-bold tracking-tight">진행 중인 습관</h2>
        {agg.activeCount === 0 ? (
          <Card className="p-8 text-center text-sm text-muted">
            아직 진행 중인 습관이 없어요.
          </Card>
        ) : (
          <Card className="divide-y divide-line p-0">
            {agg.perHabit
              .filter((x) => !x.habit.archived)
              .map(({ habit, stats }) => (
                <div key={habit.id} className="flex items-center gap-3 p-5">
                  <span className="text-xl">{habit.emoji}</span>
                  <span className="flex-1 font-medium">{habit.name}</span>
                  <span className="text-sm text-muted">
                    {stats.currentJourney > 0
                      ? `${stats.currentJourney}일째`
                      : "다시 시작 대기 중"}
                  </span>
                </div>
              ))}
          </Card>
        )}
      </section>
    </div>
  );
}
