export type AccentColor = "red" | "blue" | "green" | "purple";

export type AccentProp = boolean | AccentColor;

const ACCENT_COLOR_CLASS: Record<AccentColor, string> = {
  red: "qa-accent-red",
  blue: "qa-accent-blue",
  green: "qa-accent-green",
  purple: "qa-accent-purple",
};

/**
 * Maps an accent prop to root CSS classes for direct application on a control.
 *
 * @example
 * accentClasses(true) // ["qa-accent"]
 * accentClasses("red") // ["qa-accent-red"]
 */
export function accentClasses(accent?: AccentProp): string[] {
  if (!accent) {
    return [];
  }
  if (accent === true) {
    return ["qa-accent"];
  }
  return [ACCENT_COLOR_CLASS[accent]];
}
