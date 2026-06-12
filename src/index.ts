export {
  autofocusPrimaryInput,
  bindEnterSubmits,
  bindEscapeCancels,
  closeWithResult,
  setInputInvalid,
} from "./dialog/dialog-utils.js";
export {
  accentClasses,
  type AccentColor,
  type AccentProp,
} from "./lib/accent.js";
export {
  THEME_ATTRIBUTE,
  type ThemeProvider,
  type ThemeProviderOptions,
  type ThemeVariant,
  createThemeProvider,
  getTheme,
  setTheme,
} from "./theme/index.js";
export {
  clamp,
  denormalize,
  formatDb,
  formatHz,
  formatPercent,
  formatValue,
  normalize,
  sanitizeParamValue,
  snapParamValue,
  specFromProps,
  stepFor,
  type ParamSpec,
  type SanitizeParamOptions,
} from "./lib/param.js";
export {
  decodeWavPeaks,
  fakePeaks,
  peaksFromAudioBuffer,
} from "./audio/peaks.js";
