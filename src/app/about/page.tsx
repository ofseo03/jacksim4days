"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { HanjaSeal } from "@/components/hanja-seal";
import { ThemeToggle } from "@/components/theme-toggle";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: EASE },
};

const VALUES = [
  {
    en: "Restart over Perfection",
    ko: "완벽함보다 다시 시작",
    body: "완벽한 30일보다, 서툴게라도 다시 시작한 4일째가 더 위대합니다.",
  },
  {
    en: "Consistency over Streak",
    ko: "연속보다 꾸준함",
    body: "하루도 빠짐없는 기록이 아니라, 오래도록 곁에 두는 습관을 만듭니다.",
  },
  {
    en: "Small Progress Everyday",
    ko: "매일의 작은 진전",
    body: "눈에 띄지 않는 한 걸음이 모여 삶의 방향을 바꿉니다.",
  },
  {
    en: "Every Restart Matters",
    ko: "모든 재시작은 소중하다",
    body: "다시 시작한 횟수는 실패의 수가 아니라 용기의 수입니다.",
  },
];

export default function AboutPage() {
  return (
    <div className="hero-gradient min-h-dvh">
      <header className="fixed inset-x-0 top-0 z-40">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/onboarding"
              className="hidden h-10 items-center rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-transform duration-300 hover:scale-[1.02] sm:inline-flex"
            >
              시작하기
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-32 pt-36">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={15} /> 홈으로
        </Link>

        <motion.div {...fadeUp}>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-strong">
            About
          </p>
          <div className="mt-8 flex items-end justify-between gap-6">
            <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              작심사일
            </h1>
            <HanjaSeal size="md" className="mb-1 shrink-0 text-faint" />
          </div>
        </motion.div>

        <motion.div {...fadeUp} className="mt-14 space-y-6 text-lg leading-relaxed text-muted">
          <p>
            누구나 결심합니다. 그리고 대부분 3일쯤에 멈춥니다. 우리는 그것을{" "}
            <strong className="text-foreground">실패라고 부르지 않기로 했습니다.</strong>
          </p>
          <p>
            습관 앱들은 오랫동안 &lsquo;연속 기록&rsquo;을 훈장처럼 보여줬습니다. 하지만
            연속 기록은 단 하루의 공백으로 무너지고, 무너진 순간 사람들은 앱과 함께 습관도
            지웁니다. 우리가 잃는 건 기록이 아니라{" "}
            <strong className="text-foreground">다시 시작할 마음</strong>이었습니다.
          </p>
          <p>
            작심사일은 반대로 설계했습니다. 연속이 끊겨도 아무것도 잃지 않습니다. 대신
            돌아올 때마다 <strong className="text-foreground">🌱 다시 시작</strong>이 하나
            늘어납니다. 우리는 완주가 아니라 복귀를 축하합니다. 진짜 변화는 포기하지 않고
            다시 시작하는 <strong className="text-accent">4일째</strong>부터 시작되니까요.
          </p>
        </motion.div>

        <motion.h2
          {...fadeUp}
          className="mt-24 font-serif text-2xl font-bold tracking-tight sm:text-3xl"
        >
          핵심 가치
        </motion.h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.en}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.08 }}
              className="card-soft rounded-3xl p-7"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-strong">
                {v.en}
              </p>
              <h3 className="mt-2 text-lg font-bold">{v.ko}</h3>
              <p className="mt-2 leading-relaxed text-muted">{v.body}</p>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeUp} className="mt-24 rounded-[2rem] bg-surface p-10 text-center">
          <HanjaSeal size="sm" className="mb-6 text-faint" />
          <p className="text-balance font-serif text-xl font-semibold leading-relaxed sm:text-2xl">
            &ldquo;우리는 사용자의 실패를 기록하지 않는다.
            <br />
            우리는 사용자의 <span className="text-accent">다시 시작한 용기</span>를
            기록한다.&rdquo;
          </p>
          <Link
            href="/onboarding"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-8 text-sm font-semibold text-background transition-transform duration-300 hover:scale-[1.02]"
          >
            오늘 시작하기 <ArrowRight size={16} />
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
