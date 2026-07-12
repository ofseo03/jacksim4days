"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Cloud,
  CloudOff,
  Download,
  Monitor,
  Moon,
  RefreshCw,
  RotateCcw,
  Smartphone,
  Sparkles,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useHabits } from "@/lib/store";
import { useSyncStatus } from "@/lib/sync";
import { useTheme, type ThemeMode } from "@/lib/theme";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const THEME_OPTIONS: Array<{ value: ThemeMode; label: string; icon: typeof Sun }> = [
  { value: "light", label: "라이트", icon: Sun },
  { value: "dark", label: "다크", icon: Moon },
  { value: "system", label: "시스템", icon: Monitor },
];

const SYNC_LABELS = {
  disabled: {
    icon: CloudOff,
    title: "로컬 전용",
    desc: "기록이 이 기기 브라우저에만 저장됩니다. Supabase 환경 변수를 설정하면 서버 동기화가 켜집니다.",
  },
  connecting: {
    icon: RefreshCw,
    title: "연결 중…",
    desc: "서버와 기록을 맞추고 있어요.",
  },
  online: {
    icon: Cloud,
    title: "동기화 켜짐",
    desc: "익명 계정으로 서버에 안전하게 백업되고 있어요.",
  },
  offline: {
    icon: CloudOff,
    title: "오프라인",
    desc: "지금 기록은 저장돼 있고, 연결되면 자동으로 올라갑니다.",
  },
  error: {
    icon: CloudOff,
    title: "동기화 대기 중",
    desc: "서버 연결에 실패했어요. 기록은 안전하며 자동으로 재시도합니다.",
  },
} as const;

export default function SettingsPage() {
  const { state, updateSettings, loadDemoData, resetAll } = useHabits();
  const { mode, setMode } = useTheme();
  const sync = useSyncStatus();
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
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">설정</h1>
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

      {/* 동기화 상태 */}
      <Card className="flex items-center gap-4 p-6">
        {(() => {
          const meta = SYNC_LABELS[sync.mode];
          const Icon = meta.icon;
          return (
            <>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-surface">
                <Icon
                  size={18}
                  className={cn(
                    sync.mode === "online" && "text-success",
                    sync.mode === "connecting" && "animate-spin text-accent",
                    (sync.mode === "offline" || sync.mode === "error") && "text-warning",
                    sync.mode === "disabled" && "text-muted"
                  )}
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{meta.title}</p>
                <p className="text-sm text-muted">
                  {meta.desc}
                  {sync.pending > 0 && ` (대기 중 ${sync.pending}건)`}
                </p>
              </div>
            </>
          );
        })()}
      </Card>

      {/* 알림/응원 */}
      <Card className="divide-y divide-line p-0">
        {[
          {
            key: "reminders" as const,
            icon: <Bell size={18} className="text-warning" />,
            title: "하루 한 번 리마인더",
            desc: "부담 주지 않는 시간에, 딱 한 번만 알려드려요. iPhone에서는 홈 화면에 추가된 앱에서만 알림이 옵니다.",
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

      {/* 홈 화면 추가 안내 */}
      <Card className="flex items-start gap-4 p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-surface">
          <Smartphone size={18} className="text-accent" />
        </div>
        <div>
          <p className="font-semibold">앱처럼 쓰기 — 홈 화면에 추가</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            iPhone: Safari 공유 버튼 → <strong>홈 화면에 추가</strong>
            <br />
            Android: Chrome 메뉴 → <strong>앱 설치</strong> 또는 홈 화면에 추가
            <br />
            리마인더 알림을 받으려면 이 과정이 필요해요.
          </p>
        </div>
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
