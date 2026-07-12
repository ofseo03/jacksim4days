"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Download, Monitor, Moon, RotateCcw, Sparkles, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useHabits } from "@/lib/store";
import { useTheme, type ThemeMode } from "@/lib/theme";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const THEME_OPTIONS: Array<{ value: ThemeMode; label: string; icon: typeof Sun }> = [
  { value: "light", label: "라이트", icon: Sun },
  { value: "dark", label: "다크", icon: Moon },
  { value: "system", label: "시스템", icon: Monitor },
];

export default function SettingsPage() {
  const { state, updateSettings, loadDemoData, resetAll } = useHabits();
  const { mode, setMode } = useTheme();
  const [confirmReset, setConfirmReset] = useState(false);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jaksim4-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">설정</h1>
        <p className="mt-2 text-muted">작심사일을 당신에게 맞게 다듬어보세요.</p>
      </motion.section>

      {/* 테마 */}
      <Card className="p-6">
        <h2 className="font-bold tracking-tight">화면 테마</h2>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border py-4 text-sm font-medium",
                "transition-all duration-300 [transition-timing-function:var(--ease-apple)]",
                "hover:scale-[1.02]",
                mode === value
                  ? "border-accent bg-accent-soft text-accent-strong"
                  : "border-line text-muted hover:border-faint"
              )}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>
      </Card>

      {/* 알림/응원 */}
      <Card className="divide-y divide-line p-0">
        {[
          {
            key: "reminders" as const,
            icon: <Bell size={18} className="text-warning" />,
            title: "하루 한 번 리마인더",
            desc: "부담 주지 않는 시간에, 딱 한 번만 알려드려요.",
          },
          {
            key: "encouragement" as const,
            icon: <Sparkles size={18} className="text-accent" />,
            title: "AI 한 줄 응원",
            desc: "대시보드에서 오늘의 응원을 받아보세요.",
          },
          {
            key: "weeklyReport" as const,
            icon: <Sparkles size={18} className="text-success" />,
            title: "주간 리포트",
            desc: "일주일의 여정을 따뜻한 문장으로 정리해드려요.",
          },
        ].map((row) => (
          <div key={row.key} className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-surface">
              {row.icon}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{row.title}</p>
              <p className="text-sm text-muted">{row.desc}</p>
            </div>
            <Switch
              checked={state.settings[row.key]}
              onChange={(v) => updateSettings({ [row.key]: v })}
              label={row.title}
            />
          </div>
        ))}
      </Card>

      {/* 데이터 */}
      <Card className="p-6">
        <h2 className="font-bold tracking-tight">데이터</h2>
        <p className="mt-1 text-sm text-muted">
          모든 기록은 이 기기의 브라우저에만 저장됩니다.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button size="sm" variant="outline" onClick={exportData}>
            <Download size={15} /> 내보내기 (JSON)
          </Button>
          <Button size="sm" variant="outline" onClick={loadDemoData}>
            데모 데이터 불러오기
          </Button>
          {confirmReset ? (
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                resetAll();
                setConfirmReset(false);
              }}
            >
              모든 기록이 사라져요. 확실한가요?
            </Button>
          ) : (
            <Button size="sm" variant="danger" onClick={() => setConfirmReset(true)}>
              <RotateCcw size={15} /> 전체 초기화
            </Button>
          )}
        </div>
      </Card>

      <p className="pb-4 text-center text-xs text-faint">
        작심사일 (作心四日) · 다시 시작하는 사람이 결국 끝까지 갑니다
      </p>
    </div>
  );
}
