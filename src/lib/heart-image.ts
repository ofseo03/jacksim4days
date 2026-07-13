import { HEART_STROKE_PATHS, HEART_VIEWBOX } from "@/components/heart-strokes";

/** 공유 이미지는 테마와 무관하게 한지 느낌의 밝은 톤으로 고정한다. */
const PAPER = "#faf7f0";
const INK = "#1b1b1f";
const SUBTLE = "#73737a";
const SEAL = "#7c5cff";

function drawHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  alpha = 1,
  rotateDeg = 0
) {
  const s = size / HEART_VIEWBOX;
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.rotate((rotateDeg * Math.PI) / 180);
  ctx.translate(-size / 2, -size / 2);
  ctx.scale(s, s);
  ctx.globalAlpha = alpha;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  for (const st of HEART_STROKE_PATHS) {
    ctx.lineWidth = st.width;
    ctx.stroke(new Path2D(st.d));
  }
  ctx.restore();
}

function drawSeal(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.rotate((-8 * Math.PI) / 180);
  ctx.fillStyle = SEAL;
  const r = size * 0.18;
  ctx.beginPath();
  ctx.roundRect(-size / 2, -size / 2, size, size, r);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${size * 0.42}px "Noto Serif KR", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("四日", 0, size * 0.03);
  ctx.restore();
}

/** habitId+날짜 기반 결정적 변주 — 같은 心은 항상 같은 표정을 가진다. */
export function heartSeed(key: string): number {
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/**
 * 완성된 心 아카이브를 하나의 먹그림 이미지(1080×1080 PNG)로 그린다.
 * 1개면 큰 心 하나, 여러 개면 최근 16개를 격자로 배치한다.
 */
export async function renderHeartsImage({
  name,
  count,
  seeds,
}: {
  name?: string;
  count: number;
  seeds: number[];
}): Promise<Blob> {
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.load('bold 52px "Noto Serif KR"');
      await document.fonts.ready;
    } catch {
      // 폰트 로드 실패 시 시스템 세리프로 진행
    }
  }

  const W = 1080;
  const H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d context unavailable");

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  const shown = Math.min(count, 16);
  if (shown <= 1) {
    const size = 520;
    const x = (W - size) / 2;
    const y = 160;
    drawHeart(ctx, x, y, size, INK);
    drawSeal(ctx, x + size - 60, y - 10, 110);
  } else {
    const cols = shown <= 4 ? 2 : shown <= 9 ? 3 : 4;
    const rows = Math.ceil(shown / cols);
    const cell = Math.min(560 / rows, 640 / cols);
    const gridW = cols * cell;
    const gridH = rows * cell;
    const ox = (W - gridW) / 2;
    const oy = 140 + (600 - gridH) / 2;
    for (let i = 0; i < shown; i++) {
      const seed = seeds[i] ?? i * 7919;
      const rot = (seed % 13) - 6;
      const alpha = 0.6 + (seed % 5) * 0.1;
      const col = i % cols;
      const row = Math.floor(i / cols);
      drawHeart(ctx, ox + col * cell + cell * 0.1, oy + row * cell + cell * 0.1, cell * 0.8, INK, alpha, rot);
    }
    drawSeal(ctx, ox + gridW - 40, oy - 50, 96);
  }

  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = 'bold 54px "Noto Serif KR", serif';
  const who = name ? `${name}님의 ` : "";
  ctx.fillText(
    count <= 1 ? `${who}첫 번째 마음` : `${who}${count}개의 마음`,
    W / 2,
    866
  );
  ctx.fillStyle = SUBTLE;
  ctx.font = '32px "Noto Serif KR", serif';
  ctx.fillText("作心四日 — 진짜는 4일부터니까", W / 2, 934);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("PNG 인코딩 실패"))),
      "image/png"
    );
  });
}

/** Web Share API가 가능하면 공유하고, 아니면 파일로 내려받는다. */
export async function shareHeartsImage(opts: {
  name?: string;
  count: number;
  seeds: number[];
}): Promise<"shared" | "downloaded"> {
  const blob = await renderHeartsImage(opts);
  const file = new File([blob], "jaksim4days-heart.png", { type: "image/png" });

  if (
    typeof navigator !== "undefined" &&
    "canShare" in navigator &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: "작심사일",
        text: "진짜는 4일부터니까 — 내가 완성한 마음 心",
      });
      return "shared";
    } catch (e) {
      // 사용자가 공유 시트를 닫으면 AbortError — 다운로드로 대신하지 않고 조용히 종료
      if (e instanceof DOMException && e.name === "AbortError") return "shared";
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}
