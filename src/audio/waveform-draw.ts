export type WaveformPalette = "hot" | "cold" | "mono";

export type WaveformSelection = { start: number; end: number };

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
};

const MIN_LOOP_WIDTH = 0.01;

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
  index: number,
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
      Math.floor((index / options.peaks.length) * options.colorGuidance.length),
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
    if (t < 0 || t > 1) continue;
    const x = t * width + 0.5;
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
  loopFill?: string,
): void {
  const startX = clamp01(loopRegion.start) * width;
  const endX = clamp01(loopRegion.end) * width;
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

  ctx.strokeStyle = resolveColor(canvas, loopActive ? "var(--c-highlight--primary)" : "var(--c-text-secondary)");
  ctx.lineWidth = 1;
  ctx.globalAlpha = loopActive ? 0.9 : 0.55;
  ctx.beginPath();
  ctx.moveTo(startX + 0.5, 0);
  ctx.lineTo(startX + 0.5, height);
  ctx.moveTo(endX + 0.5, 0);
  ctx.lineTo(endX + 0.5, height);
  ctx.stroke();
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
  } = options;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  if (peaks.length === 0) return;

  if (loopRegion) {
    drawLoopRegion(ctx, canvas, width, height, loopRegion, loopActive, loopFill);
  }

  const selFill = selectionFill
    ? resolveColor(canvas, selectionFill)
    : resolveColor(canvas, "var(--c-selection)");
  const centerY = height / 2;
  const barWidth = width / peaks.length;

  if (selection) {
    const startX = selection.start * width;
    const endX = selection.end * width;
    ctx.fillStyle = selFill;
    ctx.fillRect(startX, 0, endX - startX, height);
  }

  for (let i = 0; i < peaks.length; i++) {
    const peak = peaks[i] ?? 0;
    const barHeight = Math.max(1, peak * (height / 2 - 1));
    const x = i * barWidth;
    const normalized = i / peaks.length;
    const inSelection =
      selection &&
      normalized >= selection.start &&
      normalized <= selection.end;
    const inLoop =
      loopRegion &&
      normalized >= clamp01(loopRegion.start) &&
      normalized <= clamp01(loopRegion.end);
    ctx.fillStyle = barColor(canvas, options, i, peak, Boolean(inSelection), Boolean(inLoop));
    ctx.fillRect(x, centerY - barHeight, Math.max(1, barWidth), barHeight * 2);
  }

  if (beatGrid) {
    drawBeatGrid(ctx, canvas, width, height, beatGrid);
  }

  if (showPlayhead && playhead !== undefined) {
    const x = playhead * width;
    ctx.strokeStyle = resolveColor(canvas, "var(--c-text-primary)");
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();
  }
}

export { MIN_LOOP_WIDTH };
