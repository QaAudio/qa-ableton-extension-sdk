import { onUnmounted, ref, type Ref } from "vue";
import {
  clamp,
  denormalize,
  normalize,
  stepFor,
  type ParamSpec,
} from "../lib/param.js";

export type UseParamDragOptions = {
  value: () => number;
  spec: ParamSpec;
  onChange: (value: number) => void;
  onCommit?: (value: number) => void;
  pixelsForFullRange?: number;
  disabled?: () => boolean;
};

/**
 * Vertical drag interaction for parameter controls (knobs, faders, value fields).
 *
 * Drag up increases the value; Shift halves sensitivity. Double-click resets to `spec.default`.
 *
 * @example
 * const { dragging, onPointerdown } = useParamDrag({
 *   value: () => modelValue,
 *   spec: { min: 0, max: 100, default: 50 },
 *   onChange: (v) => emit("update:modelValue", v),
 * });
 */
export function useParamDrag(options: UseParamDragOptions): {
  dragging: Ref<boolean>;
  onPointerdown: (event: PointerEvent) => void;
  onDblclick: (event: MouseEvent) => void;
} {
  const dragging = ref(false);
  const pixelsForFullRange = options.pixelsForFullRange ?? 150;

  let startY = 0;
  let startNorm = 0;
  let activePointerId: number | null = null;

  function isDisabled(): boolean {
    return options.disabled?.() ?? false;
  }

  function applyDelta(deltaY: number, fine: boolean): void {
    const sensitivity = fine ? 0.1 : 1;
    const deltaNorm = (-deltaY / pixelsForFullRange) * sensitivity;
    const nextNorm = clamp(startNorm + deltaNorm, 0, 1);
    const nextValue = denormalize(nextNorm, options.spec);
    options.onChange(nextValue);
  }

  function onPointermove(event: PointerEvent): void {
    if (activePointerId !== event.pointerId) return;
    applyDelta(event.clientY - startY, event.shiftKey);
  }

  function onPointerup(event: PointerEvent): void {
    if (activePointerId !== event.pointerId) return;
    dragging.value = false;
    activePointerId = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("pointermove", onPointermove);
    window.removeEventListener("pointerup", onPointerup);
    options.onCommit?.(options.value());
  }

  function onPointerdown(event: PointerEvent): void {
    if (isDisabled()) return;
    if (event.button !== 0) return;
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    dragging.value = true;
    activePointerId = event.pointerId;
    startY = event.clientY;
    startNorm = normalize(options.value(), options.spec);
    document.body.style.cursor = "ns-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", onPointermove);
    window.addEventListener("pointerup", onPointerup);
  }

  function onDblclick(event: MouseEvent): void {
    if (isDisabled()) return;
    if (options.spec.default === undefined) return;
    event.preventDefault();
    options.onChange(options.spec.default);
    options.onCommit?.(options.spec.default);
  }

  onUnmounted(() => {
    window.removeEventListener("pointermove", onPointermove);
    window.removeEventListener("pointerup", onPointerup);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  });

  return { dragging, onPointerdown, onDblclick };
}

/** Steps a parameter value by `delta` steps (positive = increase). */
export function stepParamValue(
  current: number,
  spec: ParamSpec,
  delta: number,
  fine = false,
): number {
  const step = fine ? stepFor(spec) / 10 : stepFor(spec);
  return clamp(current + delta * step, spec.min, spec.max);
}
