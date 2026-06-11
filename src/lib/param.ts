/**
 * Parameter value helpers for music controls (knobs, faders, value fields).
 */

/** Specification for a bounded numeric parameter. */
export type ParamSpec = {
  min: number;
  max: number;
  step?: number;
  default?: number;
  taper?: "linear" | "log";
  bipolar?: boolean;
  unit?: string;
  format?: (value: number) => string;
};

/** Clamps `value` to `[min, max]`. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export type SanitizeParamOptions = {
  /** When true, round to the nearest integer after clamping. */
  integer?: boolean;
};

/**
 * Clamps a parameter value and rejects non-finite input.
 *
 * @example
 * sanitizeParamValue(3.7, 0, 10, { integer: true }); // 4
 * sanitizeParamValue(NaN, 0, 10); // null
 */
export function sanitizeParamValue(
  value: number,
  min: number,
  max: number,
  options?: SanitizeParamOptions,
): number | null {
  if (!Number.isFinite(value)) return null;
  let v = clamp(value, min, max);
  if (options?.integer) v = Math.round(v);
  return v;
}

/**
 * Maps a value to a normalized position in [0, 1].
 *
 * @example
 * normalize(500, { min: 20, max: 20000, taper: "log" });
 */
export function normalize(value: number, spec: ParamSpec): number {
  const v = clamp(value, spec.min, spec.max);
  if (spec.taper === "log" && spec.min > 0 && spec.max > 0) {
    const logMin = Math.log(spec.min);
    const logMax = Math.log(spec.max);
    return (Math.log(v) - logMin) / (logMax - logMin);
  }
  const span = spec.max - spec.min;
  if (span <= 0) return 0;
  return (v - spec.min) / span;
}

/**
 * Maps a normalized position in [0, 1] back to a parameter value.
 *
 * @example
 * denormalize(0.5, { min: 20, max: 20000, taper: "log" });
 */
export function denormalize(n: number, spec: ParamSpec): number {
  const t = clamp(n, 0, 1);
  if (spec.taper === "log" && spec.min > 0 && spec.max > 0) {
    const logMin = Math.log(spec.min);
    const logMax = Math.log(spec.max);
    return Math.exp(logMin + t * (logMax - logMin));
  }
  return spec.min + t * (spec.max - spec.min);
}

/** Default step size: one hundredth of the parameter range. */
export function stepFor(spec: ParamSpec): number {
  if (spec.step !== undefined) return spec.step;
  const span = spec.max - spec.min;
  return span > 0 ? span / 100 : 1;
}

/**
 * Formats a parameter value for display.
 *
 * Uses `spec.format` when provided; otherwise trims to two decimals and appends `spec.unit`.
 */
export function formatValue(value: number, spec: ParamSpec): string {
  if (spec.format) return spec.format(value);
  const rounded = Math.round(value * 100) / 100;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
  return spec.unit ? `${text}${spec.unit}` : text;
}

/** Formats a value as decibels with a sign prefix. */
export function formatDb(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded} dB`;
}

/** Formats a frequency in Hz or kHz. */
export function formatHz(value: number): string {
  if (value >= 1000) {
    const khz = value / 1000;
    const rounded = Math.round(khz * 10) / 10;
    return `${rounded} kHz`;
  }
  return `${Math.round(value)} Hz`;
}

/** Formats a normalized value as a percentage. */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/** Builds a `ParamSpec` from component props (merges defaults). */
export function specFromProps(props: {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  taper?: "linear" | "log";
  bipolar?: boolean;
  unit?: string;
  format?: (value: number) => string;
}): ParamSpec {
  return {
    min: props.min ?? 0,
    max: props.max ?? 1,
    step: props.step,
    default: props.defaultValue,
    taper: props.taper,
    bipolar: props.bipolar,
    unit: props.unit,
    format: props.format,
  };
}
