import { stepParamValue } from "./useParamDrag.js";
import type { ParamSpec } from "../lib/param.js";

export type UseParamKeyboardOptions = {
  value: () => number;
  spec: ParamSpec;
  onChange: (value: number) => void;
  onCommit?: (value: number) => void;
  disabled?: () => boolean;
  orientation?: "horizontal" | "vertical";
};

/**
 * Keyboard handler factory for `role="slider"` parameter hosts.
 *
 * Arrow keys step the value; Shift halves step size; Home/End jump to min/max;
 * Delete/Backspace reset to `spec.default`.
 */
export function useParamKeyboard(options: UseParamKeyboardOptions) {
  function onKeydown(event: KeyboardEvent): void {
    if (options.disabled?.()) return;

    const fine = event.shiftKey;
    let handled = false;
    let next = options.value();

    switch (event.key) {
      case "ArrowUp":
      case "ArrowRight":
        next = stepParamValue(next, options.spec, 1, fine);
        handled = true;
        break;
      case "ArrowDown":
      case "ArrowLeft":
        next = stepParamValue(next, options.spec, -1, fine);
        handled = true;
        break;
      case "Home":
        next = options.spec.min;
        handled = true;
        break;
      case "End":
        next = options.spec.max;
        handled = true;
        break;
      case "Delete":
      case "Backspace":
        if (options.spec.default !== undefined) {
          next = options.spec.default;
          handled = true;
        }
        break;
      default:
        break;
    }

    if (!handled) return;
    event.preventDefault();
    options.onChange(next);
    options.onCommit?.(next);
  }

  return { onKeydown };
}
