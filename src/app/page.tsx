"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Flame,
  HeartHandshake,
  RefreshCw,
  Sparkles,
  Sprout,
  TrendingUp,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { SeedSprout } from "@/components/seed-sprout";
import { DAILY_QUOTES } from "@/lib/messages";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: EASE },
};

export default function LandingPage() {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroY = useTransform(scrollY, [0, 500], [0, 80]);

  return (
    <div className="hero-gradient min-h-dvh">
      {/* 헤더 */}
      <header className="fixed inset-x-0 top-0 z-40">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Logo />
          <nav className="flex items-center gap-2">
            <Link
              href="/about"
              className="rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors duration-300 hover:text-foreground"
            >
              소개
            </Link>
            <ThemeToggle />
            <Link
              href="/onboarding"
              className="hidden h-10 items-center rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-transform duration-300 hover:scale-[1.02] sm:inline-flex"
            >
              시작하기
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <motion.section
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          className="text-lg font-medium text-muted sm:text-xl"
        >
          작심삼일은 끝이 아닙니다.
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
          className="mt-6 text-6xl font-bold tracking-tighter sm:text-8xl md:text-9xl"
        >
          작심<span className="text-accent">사</span>일
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
          className="mt-8 text-xl font-medium sm:text-2xl"
        >
          오늘도 다시 시작합니다.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
          className="mt-12"
        >
          <Link
            href="/onboarding"
            className="inline-flex h-14 items-center gap-2 rounded-full bg-foreground px-10 text-base font-semibold text-background shadow-[var(--shadow-lift)] transition-all duration-300 [transition-timing-function:var(--ease-apple)] hover:scale-[1.03] active:scale-[0.98]"
          >
            오늘 시작하기
            <ArrowRight size={18} />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="absolute bottom-10 flex flex-col items-center gap-1 text-faint"
        >
          <span className="text-xs font-medium">스크롤</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* 철학 */}
      <section className="mx-auto max-w-3xl px-6 py-32 text-center">
        <motion.div {...fadeUp}>
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent-soft px-4 py-1.5 text-sm font-semibold text-accent-strong">
            <Sparkles size={14} /> 우리의 믿음
          </span>
          <h2 className="text-balance text-3xl font-bold leading-snug tracking-tight sm:text-5xl sm:leading-snug">
            진짜 변화는
            <br />
            포기하지 않고 다시 시작하는
            <br />
            <span className="text-accent">4일째</span>부터 시작됩니다.
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted">
            우리는 사용자의 실패를 기록하지 않습니다.
            <br />
            우리는 <strong className="text-foreground">다시 시작한 용기</strong>를 기록합니다.
          </p>
        </motion.div>
      </section>

      {/* 비교: 기존 vs 작심사일 */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <motion.h2
          {...fadeUp}
          className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
        >
          우리는 다르게 봅니다
        </motion.h2>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <motion.div
            {...fadeUp}
            className="rounded-3xl border border-line bg-surface/60 p-8"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-faint">
              <Flame size={16} /> 기존 습관 앱
            </p>
            <ul className="mt-6 space-y-4 text-muted">
              <li className="flex items-baseline gap-3">
                <span className="text-2xl">🔥</span>
                <span>
                  <strong className="text-foreground/70">30일 연속</strong> — 하루만 놓쳐도
                  전부 리셋
                </span>
              </li>
              <li>연속 기록(Streak)에 대한 압박</li>
              <li>끊긴 날은 &ldquo;실패&rdquo;로 표시</li>
              <li>돌아와도 0부터 다시</li>
            </ul>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.12 }}
            className="glass rounded-3xl p-8 shadow-[var(--shadow-lift)] ring-1 ring-accent/20"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-accent-strong">
              <Sprout size={16} /> 작심사일
            </p>
            <ul className="mt-6 space-y-4">
              <li className="flex items-baseline gap-3">
                <span className="text-2xl">🌱</span>
                <span>
                  <strong>18번 다시 시작</strong> — 돌아온 횟수가 곧 성장
                </span>
              </li>
              <li>연속 기록 대신 <strong>복귀율</strong></li>
              <li>끊긴 날은 그저 &ldquo;쉬어간 날&rdquo;</li>
              <li>모든 재시작이 Restart Journey의 한 장</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* 기능 */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <motion.h2
          {...fadeUp}
          className="text-center text-3xl font-bold tracking-tight sm:text-4xl"
        >
          다시 시작하도록 설계했습니다
        </motion.h2>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <SeedSprout size={40} animate={false} />,
              title: "씨앗이 자라는 완료",
              body: "체크박스 대신 씨앗이 자랍니다. 오늘의 완료가 하나의 생명이 됩니다.",
            },
            {
              icon: <RefreshCw className="text-accent" size={28} />,
              title: "Restart Journey",
              body: "끊긴 기록이 아니라, 다시 시작한 여정을 타임라인으로 보여줍니다.",
            },
            {
              icon: <TrendingUp className="text-success" size={28} />,
              title: "복귀율 통계",
              body: "연속 기록 대신 돌아오는 힘을 측정합니다. 쉬어도 괜찮습니다.",
            },
            {
              icon: <HeartHandshake className="text-warning" size={28} />,
              title: "죄책감 없는 언어",
              body: "“기록이 끊겼어요” 대신 “오늘 다시 시작하면 됩니다”라고 말합니다.",
            },
            {
              icon: <Sparkles className="text-accent" size={28} />,
              title: "매일 한 줄 응원",
              body: "AI 코치가 상황을 읽고 오늘의 당신에게 필요한 문장을 건넵니다.",
            },
            {
              icon: <Sprout className="text-success" size={28} />,
              title: "Restart Heatmap",
              body: "완료한 날은 초록으로, 다시 시작한 날은 보랏빛으로 빛납니다.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.08 }}
              className="card-soft rounded-3xl p-7 transition-transform duration-300 [transition-timing-function:var(--ease-apple)] hover:scale-[1.02]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface">
                {f.icon}
              </div>
              <h3 className="mt-5 text-lg font-bold tracking-tight">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 감성 문구 */}
      <section className="mx-auto max-w-3xl px-6 py-28 text-center">
        <div className="space-y-10">
          {DAILY_QUOTES.slice(0, 4).map((q, i) => (
            <motion.p
              key={q}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: EASE }}
              className="text-balance text-2xl font-semibold leading-relaxed tracking-tight text-muted sm:text-3xl"
            >
              {i === 1 ? <span className="text-foreground">{q}</span> : q}
            </motion.p>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-32">
        <motion.div
          {...fadeUp}
          className="glass mx-auto max-w-4xl rounded-[2.5rem] px-8 py-20 text-center shadow-[var(--shadow-lift)]"
        >
          <SeedSprout size={64} animate={false} />
          <h2 className="mt-6 text-balance text-3xl font-bold tracking-tight sm:text-5xl">
            오늘이 당신의
            <br />
            작심사일입니다
          </h2>
          <p className="mt-5 text-lg text-muted">
            가입 없이 바로 시작할 수 있습니다. 데이터는 당신의 기기에만 저장됩니다.
          </p>
          <Link
            href="/onboarding"
            className="mt-10 inline-flex h-14 items-center gap-2 rounded-full bg-accent px-10 text-base font-semibold text-white shadow-[0_12px_32px_var(--accent-soft)] transition-all duration-300 [transition-timing-function:var(--ease-apple)] hover:scale-[1.03] hover:bg-accent-strong active:scale-[0.98]"
          >
            오늘 시작하기
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-line px-6 py-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 text-sm text-muted sm:flex-row">
          <Logo />
          <p>作心四日 — 다시 시작하는 사람이 결국 끝까지 갑니다.</p>
          <div className="flex gap-5">
            <Link href="/about" className="transition-colors hover:text-foreground">
              소개
            </Link>
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              대시보드
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
