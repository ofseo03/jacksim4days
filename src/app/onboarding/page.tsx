"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Plus, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SeedSprout } from "@/components/seed-sprout";
import { Logo } from "@/components/logo";
import { todayISO } from "@/lib/dates";
import { useHabits } from "@/lib/store";
import { PRESET_HABITS, type Habit } from "@/lib/types";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

type Picked = { name: string; emoji: string; category: Habit["category"] };

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding } = useHabits();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [picked, setPicked] = useState<Picked[]>([]);
  const [customName, setCustomName] = useState("");

  const canNext = useMemo(() => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return picked.length > 0;
    return true;
  }, [step, name, picked]);

  const togglePreset = (p: Picked) => {
    setPicked((prev) =>
      prev.some((x) => x.name === p.name)
        ? prev.filter((x) => x.name !== p.name)
        : prev.length >= 5
          ? prev
          : [...prev, p]
    );
  };

  const addCustom = () => {
    const n = customName.trim();
    if (!n || picked.length >= 5) return;
    if (!picked.some((x) => x.name === n)) {
      setPicked((prev) => [...prev, { name: n, emoji: "🌱", category: "custom" }]);
    }
    setCustomName("");
  };

  const finish = () => {
    const today = todayISO();
    const habits: Habit[] = picked.map((p, i) => ({
      id: `h_${Date.now().toString(36)}_${i}`,
      name: p.name,
      emoji: p.emoji,
      category: p.category,
      createdAt: today,
      completions: [],
    }));
    completeOnboarding(
      { name: name.trim(), goal: goal.trim() || undefined, joinedAt: today },
      habits
    );
    setStep(3);
    setTimeout(() => router.push("/dashboard"), 2200);
  };

  return (
    <div className="hero-gradient flex min-h-dvh flex-col">
      <header className="flex h-16 items-center justify-between px-6">
        <Logo />
        {step < 3 && (
          <span className="text-sm text-faint">{step + 1} / 3</span>
        )}
      </header>

      {/* 진행 바 */}
      <div className="mx-auto w-full max-w-md px-6">
        <div className="h-1 overflow-hidden rounded-full bg-surface">
          <motion.div
            className="h-full rounded-full bg-accent"
            animate={{ width: `${((step + 1) / 3) * 100}%` }}
            transition={{ duration: 0.6, ease: EASE }}
          />
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="s0"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="text-center"
            >
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-success-soft">
                <SeedSprout size={72} />
              </div>
              <h1 className="text-balance font-serif text-3xl font-bold leading-snug tracking-tight">
                환영합니다.
                <br />
                여기서는 실패가 없습니다.
              </h1>
              <p className="mt-5 leading-relaxed text-muted">
                작심사일은 연속 기록을 세지 않습니다.
                <br />
                며칠을 쉬었더라도, 돌아온 오늘을 축하합니다.
                <br />
                당신이 기록할 것은 단 하나 —{" "}
                <strong className="text-foreground">다시 시작한 용기</strong>입니다.
              </p>
              <Button size="lg" className="mt-10 w-full" onClick={() => setStep(1)}>
                좋아요, 시작할게요 <ArrowRight size={18} />
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <h1 className="font-serif text-3xl font-bold tracking-tight">
                어떻게 불러드릴까요?
              </h1>
              <p className="mt-3 text-muted">응원을 건넬 때 사용할 이름이에요.</p>
              <div className="mt-8 space-y-4">
                <Input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름 또는 별명"
                  maxLength={12}
                  onKeyDown={(e) => e.key === "Enter" && canNext && setStep(2)}
                />
                <Input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="이루고 싶은 것 (선택)"
                  maxLength={30}
                />
              </div>
              <div className="mt-10 flex gap-3">
                <Button variant="ghost" onClick={() => setStep(0)}>
                  <ArrowLeft size={16} /> 이전
                </Button>
                <Button className="flex-1" disabled={!canNext} onClick={() => setStep(2)}>
                  다음 <ArrowRight size={16} />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <h1 className="font-serif text-3xl font-bold tracking-tight">
                무엇부터 시작해볼까요?
              </h1>
              <p className="mt-3 text-muted">
                1~5개를 고르세요. 작을수록 좋습니다. 언제든 바꿀 수 있어요.
              </p>

              <div className="mt-7 flex max-h-[42vh] flex-wrap gap-2.5 overflow-y-auto no-scrollbar">
                {PRESET_HABITS.map((p) => {
                  const on = picked.some((x) => x.name === p.name);
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() =>
                        togglePreset({ name: p.name, emoji: p.emoji, category: p.category })
                      }
                      className={cn(
                        "flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium",
                        "transition-all duration-300 [transition-timing-function:var(--ease-apple)]",
                        "hover:scale-[1.02] active:scale-[0.98]",
                        on
                          ? "border-accent bg-accent-soft text-accent-strong"
                          : "border-line bg-card text-foreground hover:border-faint"
                      )}
                    >
                      <span>{p.emoji}</span>
                      {p.name}
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px]",
                          p.difficulty === "쉬움" && "bg-success-soft text-success",
                          p.difficulty === "보통" && "bg-warning-soft text-warning",
                          p.difficulty === "도전" && "bg-accent-soft text-accent-strong"
                        )}
                      >
                        {p.difficulty}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex gap-2">
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="직접 입력하기"
                  maxLength={24}
                  onKeyDown={(e) => e.key === "Enter" && addCustom()}
                />
                <Button variant="secondary" onClick={addCustom} aria-label="습관 추가">
                  <Plus size={18} />
                </Button>
              </div>

              <p className="mt-4 flex items-center gap-1.5 text-sm text-muted">
                <Sprout size={14} className="text-success" />
                {picked.length > 0
                  ? `${picked.length}개 선택 — 좋은 시작이에요.`
                  : "가장 쉬워 보이는 것부터 골라보세요."}
              </p>

              <div className="mt-8 flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} /> 이전
                </Button>
                <Button variant="accent" className="flex-1" disabled={!canNext} onClick={finish}>
                  심기 완료 🌱
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="s3"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="text-center"
            >
              <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-success-soft">
                <SeedSprout size={88} />
              </div>
              <h1 className="font-serif text-3xl font-bold tracking-tight">
                {name.trim()}님의 씨앗을 심었습니다
              </h1>
              <p className="mt-4 leading-relaxed text-muted">
                오늘이 당신의 작심사일입니다.
                <br />
                대시보드로 이동할게요…
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
