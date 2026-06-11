/** `data-qa-theme` on the document root (or a scoped container). */
export const THEME_ATTRIBUTE = "data-qa-theme";

export type ThemeVariant = "light" | "dark";

export type ThemeProviderOptions = {
  /** Initial theme when none is set on the root element. */
  defaultTheme?: ThemeVariant;
};

export type ThemeProvider = {
  readonly root: HTMLElement;
  getTheme: () => ThemeVariant;
  setTheme: (variant: ThemeVariant) => void;
  toggleTheme: () => ThemeVariant;
};

export function getTheme(root: HTMLElement): ThemeVariant {
  return root.getAttribute(THEME_ATTRIBUTE) === "dark" ? "dark" : "light";
}

export function setTheme(root: HTMLElement, variant: ThemeVariant): void {
  root.setAttribute(THEME_ATTRIBUTE, variant);
}

/**
 * Binds light/dark theme switching to a root element.
 * Pair with `@quantumaudio/ableton-extension-sdk/theme.css` in your webview HTML.
 */
export function createThemeProvider(
  root: HTMLElement = document.documentElement,
  options: ThemeProviderOptions = {},
): ThemeProvider {
  const { defaultTheme = "dark" } = options;

  if (!root.hasAttribute(THEME_ATTRIBUTE)) {
    setTheme(root, defaultTheme);
  }

  return {
    root,
    getTheme: () => getTheme(root),
    setTheme: (variant) => setTheme(root, variant),
    toggleTheme: () => {
      const next = getTheme(root) === "light" ? "dark" : "light";
      setTheme(root, next);
      return next;
    },
  };
}
