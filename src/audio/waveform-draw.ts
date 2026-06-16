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
};

const MIN_LOOP_WIDTH = 0.01;
const FULL_VIEW: WaveformViewRange = { start: 0, end: 1 };

function resolveColor(canvas: HTMLCanvasElement, color: string): string {
  if (!color.startsWith("var(")) return color;
  const match = /--[\w-]+/.exec(color);
  if (!match) return color;
  const resolved = getComputedStyle(canvas).getPropertyValue(match[0]).trim();
  return resolved || color;
}

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

function barColor(
  canvas: HTMLCanvasElement,
  options: WaveformDrawOptions,
  peakIndex: number,
  peakCount: number,
  peak: number,
  inSelection: boolean,
  inLoop: boolean,
): string {
  if (inSelection) {
    return resolveColor(canvas, options.accentColor ?? options.color);
  }
  if (inLoop && options.loopActive) {
    return resolveColor(canvas, options.accentColor ?? "var(--c-waveform-accent)");
  }
  const palette = options.palette ?? "hot";
  if (options.colorGuidance && options.colorGuidance.length > 0 && palette !== "mono") {
    const guidanceIndex = Math.min(
      options.colorGuidance.length - 1,
      Math.floor((peakIndex / peakCount) * options.colorGuidance.length),
    );
    const guidance = options.colorGuidance[guidanceIndex] ?? 0;
    return paletteColor(palette, guidance);
  }
  if (palette === "mono") {
    return paletteColor("mono", peak);
  }
  return resolveColor(canvas, options.color);
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
  const beatsPerBar = timeSignature?.[0] ?? 4;
  const startBeat = startSec / beatSec;
  const endBeat = startBeat + durationSec / beatSec;
  const firstBeat = Math.ceil(startBeat);

  ctx.save();
  for (let beat = firstBeat; beat <= endBeat; beat += 1) {
    const t = (beat * beatSec - startSec) / durationSec;
    if (!isInView(t, viewRange)) continue;
    const x = toScreenX(t, viewRange, width) + 0.5;
    const beatInBar = Math.round(beat - Math.floor(beat / beatsPerBar) * beatsPerBar);
    const isBar = beatInBar === 0 || beat % beatsPerBar === 0;
    ctx.strokeStyle = resolveColor(
      canvas,
      isBar
        ? "color-mix(in oklch, var(--c-text-primary) 75%, var(--c-control-border))"
        : "color-mix(in oklch, var(--c-text-secondary) 65%, transparent)",
    );
    ctx.lineWidth = isBar ? 1.25 : 1;
    ctx.globalAlpha = isBar ? 1 : 0.72;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  ctx.restore();
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
    ? resolveColor(canvas, loopFill)
    : resolveColor(
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
    ctx.strokeStyle = resolveColor(canvas, loopActive ? "var(--c-highlight--primary)" : "var(--c-text-secondary)");
    ctx.lineWidth = 1;
    ctx.globalAlpha = loopActive ? 0.9 : 0.55;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  if (isInView(loopEnd, viewRange)) {
    const x = toScreenX(loopEnd, viewRange, width) + 0.5;
    ctx.strokeStyle = resolveColor(canvas, loopActive ? "var(--c-highlight--primary)" : "var(--c-text-secondary)");
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
    ? resolveColor(canvas, selectionFill)
    : resolveColor(canvas, "var(--c-selection)");
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

  for (let i = 0; i < visibleCount; i++) {
    const peakIndex = startIdx + i;
    const peak = peaks[peakIndex] ?? 0;
    const barHeight = Math.max(1, peak * (height / 2 - 1));
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
    ctx.fillStyle = barColor(
      canvas,
      options,
      peakIndex,
      peaks.length,
      peak,
      Boolean(inSelection),
      Boolean(inLoop),
    );
    ctx.fillRect(x, centerY - barHeight, Math.max(1, barWidth), barHeight * 2);
  }

  if (beatGrid) {
    drawBeatGrid(ctx, canvas, width, height, beatGrid, viewRange);
  }

  if (showPlayhead && playhead !== undefined && isInView(playhead, viewRange)) {
    const x = toScreenX(playhead, viewRange, width);
    ctx.strokeStyle = resolveColor(canvas, "var(--c-text-primary)");
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();
  }
}

export { MIN_LOOP_WIDTH };
