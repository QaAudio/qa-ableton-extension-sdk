export type WaveformDrawOptions = {
  peaks: number[];
  width: number;
  height: number;
  color: string;
  accentColor?: string;
  selection?: { start: number; end: number };
  playhead?: number;
  selectionFill?: string;
  showPlayhead?: boolean;
};

function resolveColor(canvas: HTMLCanvasElement, color: string): string {
  if (!color.startsWith("var(")) return color;
  const match = /--[\w-]+/.exec(color);
  if (!match) return color;
  const resolved = getComputedStyle(canvas).getPropertyValue(match[0]).trim();
  return resolved || color;
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
    accentColor,
    selection,
    playhead,
    selectionFill,
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

  const waveColor = resolveColor(canvas, color);
  const accent = resolveColor(canvas, accentColor ?? color);
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
    const inSelection =
      selection &&
      i / peaks.length >= selection.start &&
      i / peaks.length <= selection.end;
    ctx.fillStyle = inSelection ? accent : waveColor;
    ctx.fillRect(x, centerY - barHeight, Math.max(1, barWidth), barHeight * 2);
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
