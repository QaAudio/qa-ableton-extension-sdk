const UNRESOLVED_CSS_COLOR = /(?:var\(|color-mix\()/;

let cssColorProbe: HTMLDivElement | null = null;
const PROBE_ID = "qa-canvas-color-probe";

let normalizeProbeCanvas: HTMLCanvasElement | null = null;
let normalizeProbeCtx: CanvasRenderingContext2D | null = null;

const resolvedColorCache = new Map<string, string>();
let themeGeneration = 0;
let themeObserverStarted = false;

/** True when the browser did not reduce the expression to a concrete color. */
function isUnresolvedCssColor(value: string): boolean {
  return UNRESOLVED_CSS_COLOR.test(value.trim());
}

function ensureThemeObserver(): void {
  if (themeObserverStarted || typeof document === "undefined") return;
  themeObserverStarted = true;
  const observer = new MutationObserver(() => {
    themeGeneration += 1;
    resolvedColorCache.clear();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-qa-theme", "class", "style"],
  });
}

function hostCacheKey(host: HTMLElement): string {
  return `${themeGeneration}:${host === document.documentElement ? "root" : host.id || host.className || host.tagName}`;
}

/** Normalize any CSS color string to canvas-safe rgb/hex via a 1×1 canvas. */
export function normalizeCanvasColor(value: string): string | null {
  if (typeof document === "undefined") return null;
  if (!normalizeProbeCanvas) {
    normalizeProbeCanvas = document.createElement("canvas");
    normalizeProbeCanvas.width = normalizeProbeCanvas.height = 1;
    normalizeProbeCtx = normalizeProbeCanvas.getContext("2d");
  }
  const ctx = normalizeProbeCtx;
  if (!ctx) return null;

  const sentinel = "#010101";
  ctx.fillStyle = sentinel;
  try {
    ctx.fillStyle = value;
  } catch {
    return null;
  }
  const out = String(ctx.fillStyle);
  if (out === sentinel && value.toLowerCase() !== sentinel) return null;
  return out;
}

function themeHost(canvas: HTMLCanvasElement): HTMLElement {
  if (canvas.isConnected) {
    let el: Element | null = canvas;
    while (el instanceof HTMLElement) {
      if (getComputedStyle(el).getPropertyValue("--c-input-bg-500").trim()) {
        return el;
      }
      const root = el.getRootNode();
      if (root instanceof ShadowRoot) {
        el = root.host;
      } else {
        el = el.parentElement;
      }
    }
    const root = canvas.getRootNode();
    if (root instanceof ShadowRoot && root.host instanceof HTMLElement) {
      return root.host;
    }
    if (canvas.parentElement) return canvas.parentElement;
  }
  return document.documentElement;
}

function ensureProbe(host: HTMLElement): HTMLDivElement {
  if (!cssColorProbe) {
    cssColorProbe = document.createElement("div");
    cssColorProbe.id = PROBE_ID;
    cssColorProbe.style.display = "none";
    cssColorProbe.style.position = "absolute";
    cssColorProbe.setAttribute("aria-hidden", "true");
  }
  if (!cssColorProbe.isConnected || cssColorProbe.parentElement !== host) {
    host.appendChild(cssColorProbe);
  }
  return cssColorProbe;
}

function computedBackground(host: HTMLElement, color: string): string {
  const probe = ensureProbe(host);
  probe.style.backgroundColor = color;
  return getComputedStyle(probe).backgroundColor.trim();
}

function computedViaStyleSheet(host: HTMLElement, color: string): string {
  ensureProbe(host);
  const style = document.createElement("style");
  style.textContent = `#${PROBE_ID}{background-color:${color}!important}`;
  document.head.appendChild(style);
  const resolved = getComputedStyle(ensureProbe(host)).backgroundColor.trim();
  style.remove();
  return resolved;
}

function resolveVarOnHost(host: HTMLElement, color: string): string | null {
  const match = /^var\(\s*(--[\w-]+)\s*\)$/.exec(color.trim());
  if (!match?.[1]) return null;
  const raw = getComputedStyle(host).getPropertyValue(match[1]).trim();
  return raw || null;
}

const FALLBACK = "#808080";

function resolveUncached(canvas: HTMLCanvasElement, color: string): string {
  const direct = normalizeCanvasColor(color);
  if (direct) return direct;
  if (typeof document === "undefined") return FALLBACK;

  const host = themeHost(canvas);
  const candidates = [
    computedBackground(host, color),
    computedViaStyleSheet(host, color),
    resolveVarOnHost(host, color) ?? "",
  ];

  for (const candidate of candidates) {
    if (!candidate || isUnresolvedCssColor(candidate)) continue;
    const normalized = normalizeCanvasColor(candidate);
    if (normalized) return normalized;
  }

  return FALLBACK;
}

/**
 * Resolve CSS variables, color-mix(), and oklch theme tokens to a canvas-safe color.
 *
 * @example
 * ctx.fillStyle = resolveCanvasColor(canvas, "color-mix(in oklch, var(--c-accent-green) 58%, transparent)");
 */
export function resolveCanvasColor(canvas: HTMLCanvasElement, color: string): string {
  ensureThemeObserver();
  const direct = normalizeCanvasColor(color);
  if (direct) return direct;
  if (typeof document === "undefined") return FALLBACK;

  const host = themeHost(canvas);
  const cacheKey = `${hostCacheKey(host)}\0${color}`;
  const cached = resolvedColorCache.get(cacheKey);
  if (cached) return cached;

  const resolved = resolveUncached(canvas, color);
  resolvedColorCache.set(cacheKey, resolved);
  return resolved;
}

/** Clear resolved-color memo (e.g. after theme switch in tests). */
export function clearCanvasColorCache(): void {
  themeGeneration += 1;
  resolvedColorCache.clear();
}
