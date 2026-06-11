import { computed, ref } from "vue";
import {
  createThemeProvider,
  type ThemeProvider,
  type ThemeVariant,
} from "../theme/provider.js";

export function useTheme(provider: ThemeProvider = createThemeProvider()) {
  const theme = ref<ThemeVariant>(provider.getTheme());

  const isDark = computed(() => theme.value === "dark");

  function toggleTheme(): ThemeVariant {
    theme.value = provider.toggleTheme();
    return theme.value;
  }

  function setTheme(variant: ThemeVariant): void {
    provider.setTheme(variant);
    theme.value = variant;
  }

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    provider,
  };
}
