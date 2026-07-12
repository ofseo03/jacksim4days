import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@fontsource/noto-serif-kr/600.css";
import "@fontsource/noto-serif-kr/700.css";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { HabitProvider } from "@/lib/store";
import { SyncProvider } from "@/lib/sync";

const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "작심사일 — 오늘도 다시 시작합니다",
  description:
    "작심삼일은 끝이 아닙니다. 연속 기록 대신 다시 시작한 용기를 기록하는 습관 플랫폼, 작심사일.",
  openGraph: {
    title: "작심사일 (作心四日)",
    description: "다시 시작하는 사람이 결국 끝까지 갑니다.",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    title: "작심사일",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0d" },
  ],
};

const themeInit = `
try {
  const t = localStorage.getItem("jaksim4.theme");
  const dark = t === "dark" || ((!t || t === "system") && matchMedia("(prefers-color-scheme: dark)").matches);
  if (dark) document.documentElement.classList.add("dark");
} catch (_) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${pretendard.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <HabitProvider>
            <SyncProvider>{children}</SyncProvider>
          </HabitProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
