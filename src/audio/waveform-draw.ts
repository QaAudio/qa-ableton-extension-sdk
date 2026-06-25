import { resolveCanvasColor } from "../lib/canvas-color.js";

export type WaveformPalette = "hot" | "cold" | "mono";

export type WaveformSelection = { start: number; end: number };

export type WaveformViewRange = { start: number; end: number };

export type BeatGridOptions = {
  bpm: number;
  durationSec: number;
  timeSignature?: [number, number];
  startSec?: number;
};

export type WaveformLoopRegion = { start: number; end: number };

export type WaveformDrawOptions = {
  peaks: number[];
  width: number;
  height: number;
  color: string;
  accentColor?: string;
  palette?: WaveformPalette;
  colorGuidance?: number[];
  selection?: WaveformSelection;
  loopRegion?: WaveformLoopRegion;
  loopActive?: boolean;
  beatGrid?: BeatGridOptions;
  playhead?: number;
  selectionFill?: string;
  loopFill?: string;
  showPlayhead?: boolean;
  viewRange?: WaveformViewRange;
  /** Vertical peak amplitude multiplier (default 1). */
  peakScale?: number;
};

const MIN_LOOP_WIDTH = 0.01;
const FULL_VIEW: WaveformViewRange = { start: 0, end: 1 };

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function normalizeViewRange(viewRange?: WaveformViewRange): WaveformViewRange {
  if (!viewRange) return FULL_VIEW;
  const start = clamp01(viewRange.start);
  const end = clamp01(viewRange.end);
  if (end <= start) return FULL_VIEW;
  return { start, end };
}

function toScreenX(normalized: number, viewRange: WaveformViewRange, width: number): number {
  const span = viewRange.end - viewRange.start;
  if (span <= 0) return 0;
  return ((normalized - viewRange.start) / span) * width;
}

function isInView(normalized: number, viewRange: WaveformViewRange): boolean {
  return normalized >= viewRange.start && normalized <= viewRange.end;
}

/**
 * Maps a normalized key in `[0, 1]` to a palette color.
 */
export function paletteColor(palette: WaveformPalette, t: number): string {
  const x = clamp01(t);
  switch (palette) {
    case "hot":
      return `hsl(${15 + x * 45}, 95%, ${52 + x * 28}%)`;
    case "cold":
      return `hsl(${225 - x * 45}, 90%, ${48 + x * 30}%)`;
    case "mono":
      return `hsl(0, 0%, ${38 + x * 48}%)`;
  }
}

function barColorResolved(
  ctx: {
    baseColor: string;
    accentColor: string;
    loopAccentColor: string;
    palette: WaveformPalette;
    colorGuidance?: number[];
  },
  peakIndex: number,
  peakCount: number,
  peak: number,
  inSelection: boolean,
  inLoop: boolean,
  loopActive: boolean,
): string {
  if (inSelection) return ctx.accentColor;
  if (inLoop && loopActive) return ctx.loopAccentColor;
  const palette = ctx.palette;
  if (ctx.colorGuidance && ctx.colorGuidance.length > 0 && palette !== "mono") {
    const guidanceIndex = Math.min(
      ctx.colorGuidance.length - 1,
      Math.floor((peakIndex / peakCount) * ctx.colorGuidance.length),
    );
    const guidance = ctx.colorGuidance[guidanceIndex] ?? 0;
    return paletteColor(palette, guidance);
  }
  if (palette === "mono") {
    return paletteColor("mono", peak);
  }
  return ctx.baseColor;
}

const BEAT_GRID_SUBDIVISIONS = 4;

type BeatGridMarkKind = "quarter" | "beat" | "bar";

function beatGridMarkStyle(
  canvas: HTMLCanvasElement,
  kind: BeatGridMarkKind,
): { span: number; width: number; color: string; alpha: number } {
  switch (kind) {
    case "bar":
      return {
        span: 0.2,
        width: 1,
        color: "var(--c-text-primary)",
        alpha: 0.55,
      };
    case "beat":
      return {
        span: 0.15,
        width: 0.5,
        color: "var(--c-text-primary)",
        alpha: 0.75,
      };
    case "quarter":
      return {
        span: 0.15,
        width: 0.5,
        color: "var(--c-text-secondary)",
        alpha: 0.55,
      };
  }
}

function drawBeatGridTick(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  x: number,
  direction: "up" | "down",
  height: number,
  kind: BeatGridMarkKind,
): void {
  const { span, width: lineWidth, color, alpha } = beatGridMarkStyle(canvas, kind);
  const tickHeight = (height / 3) * span;

  const gap = direction === "up" ? 0 : tickHeight;
  const topEnd = gap + tickHeight;
  const bottomStart = height - gap - tickHeight;

  ctx.save();
  ctx.strokeStyle = resolveCanvasColor(canvas, color);
  ctx.lineWidth = lineWidth;
  ctx.globalAlpha = alpha;
  ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.moveTo(x, gap);
  ctx.lineTo(x, topEnd);
  ctx.moveTo(x, bottomStart);
  ctx.lineTo(x, height - gap);
  ctx.stroke();
  ctx.restore();
}

function drawBeatGrid(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  beatGrid: BeatGridOptions,
  viewRange: WaveformViewRange,
): void {
  const { bpm, durationSec, timeSignature, startSec = 0 } = beatGrid;
  if (!Number.isFinite(bpm) || bpm <= 0 || !Number.isFinite(durationSec) || durationSec <= 0) {
    return;
  }

  const beatSec = 60 / bpm;
  const quarterSec = beatSec / BEAT_GRID_SUBDIVISIONS;
  const beatsPerBar = timeSignature?.[0] ?? 4;
  const clipEndSec = startSec + durationSec;
  const firstQuarter = Math.ceil(startSec / quarterSec);
  const lastQuarter = Math.floor(clipEndSec / quarterSec);
  const viewSpan = viewRange.end - viewRange.start;
  const visibleDurationSec = durationSec * viewSpan;
  const pixelsPerQuarter =
    visibleDurationSec > 0 ? (width / visibleDurationSec) * quarterSec : width;
  const showQuarters = pixelsPerQuarter >= 5;

  for (let quarterIndex = firstQuarter; quarterIndex <= lastQuarter; quarterIndex += 1) {
    const timeSec = quarterIndex * quarterSec;
    const t = (timeSec - startSec) / durationSec;
    if (!isInView(t, viewRange)) continue;

    const quarterInBeat =
      ((quarterIndex % BEAT_GRID_SUBDIVISIONS) + BEAT_GRID_SUBDIVISIONS) %
      BEAT_GRID_SUBDIVISIONS;
    const isOnBeat = quarterInBeat === 0;
    const beatNumber = Math.round(timeSec / beatSec);
    const isBar = isOnBeat && beatNumber % beatsPerBar === 0;

    let kind: BeatGridMarkKind;
    if (isBar) {
      kind = "bar";
    } else if (isOnBeat) {
      kind = "beat";
    } else if (showQuarters) {
      kind = "quarter";
    } else {
      continue;
    }

    const x = Math.round(toScreenX(t, viewRange, width)) + 0.5;
    drawBeatGridTick(ctx, canvas, x, "up", height, kind);
    drawBeatGridTick(ctx, canvas, x, "down", height, kind);
  }
}

function drawLoopRegion(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  loopRegion: WaveformLoopRegion,
  loopActive: boolean,
  viewRange: WaveformViewRange,
  loopFill?: string,
): void {
  const clipStart = Math.max(clamp01(loopRegion.start), viewRange.start);
  const clipEnd = Math.min(clamp01(loopRegion.end), viewRange.end);
  if (clipEnd <= clipStart) return;

  const startX = toScreenX(clipStart, viewRange, width);
  const endX = toScreenX(clipEnd, viewRange, width);
  if (endX <= startX) return;

  ctx.save();
  ctx.fillStyle = loopFill
    ? resolveCanvasColor(canvas, loopFill)
    : resolveCanvasColor(
        canvas,
        loopActive
          ? "color-mix(in oklch, var(--c-highlight--primary) 22%, transparent)"
          : "color-mix(in oklch, var(--c-text-secondary) 12%, transparent)",
      );
  ctx.fillRect(startX, 0, endX - startX, height);

  const loopStart = clamp01(loopRegion.start);
  const loopEnd = clamp01(loopRegion.end);
  if (isInView(loopStart, viewRange)) {
    const x = toScreenX(loopStart, viewRange, width) + 0.5;
    ctx.strokeStyle = resolveCanvasColor(canvas, loopActive ? "var(--c-highlight--primary)" : "var(--c-text-secondary)");
    ctx.lineWidth = 1;
    ctx.globalAlpha = loopActive ? 0.9 : 0.55;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  if (isInView(loopEnd, viewRange)) {
    const x = toScreenX(loopEnd, viewRange, width) + 0.5;
    ctx.strokeStyle = resolveCanvasColor(canvas, loopActive ? "var(--c-highlight--primary)" : "var(--c-text-secondary)");
    ctx.lineWidth = 1;
    ctx.globalAlpha = loopActive ? 0.9 : 0.55;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draws a mirrored bar waveform onto a canvas context.
 */
export function drawWaveform(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  options: WaveformDrawOptions,
): void {
  const {
    peaks,
    width,
    height,
    color,
    selection,
    loopRegion,
    loopActive = false,
    beatGrid,
    playhead,
    selectionFill,
    loopFill,
    showPlayhead = true,
    viewRange: rawViewRange,
    peakScale = 1,
  } = options;

  const viewRange = normalizeViewRange(rawViewRange);

  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  if (peaks.length === 0) return;

  if (loopRegion) {
    drawLoopRegion(ctx, canvas, width, height, loopRegion, loopActive, viewRange, loopFill);
  }

  const selFill = selectionFill
    ? resolveCanvasColor(canvas, selectionFill)
    : resolveCanvasColor(canvas, "var(--c-selection)");
  const centerY = height / 2;

  if (selection) {
    const clipStart = Math.max(selection.start, viewRange.start);
    const clipEnd = Math.min(selection.end, viewRange.end);
    if (clipEnd > clipStart) {
      const startX = toScreenX(clipStart, viewRange, width);
      const endX = toScreenX(clipEnd, viewRange, width);
      ctx.fillStyle = selFill;
      ctx.fillRect(startX, 0, endX - startX, height);
    }
  }

  const startIdx = Math.floor(viewRange.start * peaks.length);
  const endIdx = Math.min(peaks.length, Math.ceil(viewRange.end * peaks.length));
  const visibleCount = Math.max(1, endIdx - startIdx);
  const barWidth = width / visibleCount;
  const palette = options.palette ?? "hot";
  const barCtx = {
    baseColor: resolveCanvasColor(canvas, color),
    accentColor: resolveCanvasColor(canvas, options.accentColor ?? color),
    loopAccentColor: resolveCanvasColor(canvas, options.accentColor ?? "var(--c-waveform-accent)"),
    palette,
    colorGuidance: options.colorGuidance,
  };
  const needsPerBarColor =
    Boolean(selection) ||
    (Boolean(loopRegion) && loopActive) ||
    (options.colorGuidance?.length ?? 0) > 0 ||
    palette === "mono";

  if (!needsPerBarColor) {
    ctx.fillStyle = barCtx.baseColor;
    for (let i = 0; i < visibleCount; i++) {
      const peakIndex = startIdx + i;
      const peak = peaks[peakIndex] ?? 0;
      const barHeight = Math.max(1, peak * peakScale * (height / 2 - 1));
      const x = i * barWidth;
      ctx.fillRect(x, centerY - barHeight, Math.max(1, barWidth), barHeight * 2);
    }
  } else {
    let currentColor = "";
    for (let i = 0; i < visibleCount; i++) {
      const peakIndex = startIdx + i;
      const peak = peaks[peakIndex] ?? 0;
      const barHeight = Math.max(1, peak * peakScale * (height / 2 - 1));
      const x = i * barWidth;
      const normalized = peakIndex / peaks.length;
      const inSelection =
        selection &&
        normalized >= selection.start &&
        normalized <= selection.end;
      const inLoop =
        loopRegion &&
        normalized >= clamp01(loopRegion.start) &&
        normalized <= clamp01(loopRegion.end);
      const nextColor = barColorResolved(
        barCtx,
        peakIndex,
        peaks.length,
        peak,
        Boolean(inSelection),
        Boolean(inLoop),
        loopActive,
      );
      if (nextColor !== currentColor) {
        ctx.fillStyle = nextColor;
        currentColor = nextColor;
      }
      ctx.fillRect(x, centerY - barHeight, Math.max(1, barWidth), barHeight * 2);
    }
  }

  if (beatGrid) {
    drawBeatGrid(ctx, canvas, width, height, beatGrid, viewRange);
  }

  if (showPlayhead && playhead !== undefined && isInView(playhead, viewRange)) {
    const x = toScreenX(playhead, viewRange, width);
    ctx.strokeStyle = resolveCanvasColor(canvas, "var(--c-text-primary)");
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();
  }
}

export { MIN_LOOP_WIDTH };
