import themeCss from "@quantumaudio/ableton-extension-sdk/theme.css";
import stylesCss from "@quantumaudio/ableton-extension-sdk/styles.css";
import panelBody from "../ui/panel-body.html";

/** Result posted back from the webview when the user applies or cancels. */
export type PanelResult =
  | { action: "apply"; tempo: number }
  | { action: "cancel" };

/**
 * Builds a self-contained HTML document for `context.ui.showModalDialog`.
 * SDK styles are inlined so the data URL works offline inside Live.
 */
export function buildPanelDocument(initialTempo: number): string {
  const tempo = Math.round(clampTempo(initialTempo));
  const body = panelBody
    .replaceAll("{{INITIAL_TEMPO}}", String(tempo));

  return `<!DOCTYPE html>
<html lang="en" class="qa-root" data-qa-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tempo Tap</title>
  <style>${themeCss}\n${stylesCss}\n${PANEL_CSS}</style>
</head>
<body class="panel-body">
  ${body}
  <script>${PANEL_SCRIPT}</script>
</body>
</html>`;
}

/** Wraps HTML for the SDK modal webview (data URL). */
export function panelDataUrl(initialTempo: number): string {
  return `data:text/html,${encodeURIComponent(buildPanelDocument(initialTempo))}`;
}

function clampTempo(value: number): number {
  return Math.min(999, Math.max(20, value));
}

/** Layout helpers — not part of the SDK; safe to edit for your own panels. */
const PANEL_CSS = `
.panel-body {
  margin: 0;
  min-height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 1.25em;
  box-sizing: border-box;
}

.panel {
  width: min(100%, 20rem);
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.panel__header {
  display: flex;
  flex-direction: column;
  gap: 0.35em;
}

.panel__title {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
  color: var(--c-text-primary);
}

.panel__section {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.panel__label {
  font-size: 0.85rem;
  font-weight: 500;
  margin: 0;
  color: var(--c-text-secondary);
}

.panel__readout {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 0.35em;
}

.panel__bpm {
  font-size: 2rem;
  font-variant-numeric: tabular-nums;
  color: var(--c-highlight--primary);
}

.panel__unit {
  color: var(--c-text-secondary);
}

.panel__theme {
  padding-top: 0.5em;
  border-top: 1px solid var(--c-control-border);
}

.panel__footer {
  margin-top: auto;
  padding-top: 0.5em;
}
`;

/**
 * Plain JavaScript for the webview — no bundler inside the panel.
 * Communicates with the extension host via postMessage (macOS / Windows).
 */
const PANEL_SCRIPT = `
(function () {
  const root = document.documentElement;
  const bpmDisplay = document.getElementById("bpm-display");
  const tempoSlider = document.getElementById("tempo-slider");
  const tempoSliderValue = document.getElementById("tempo-slider-value");
  const tapHint = document.getElementById("tap-hint");

  let tapTimes = [];

  function clampTempo(value) {
    return Math.min(999, Math.max(20, Math.round(value)));
  }

  function setTempo(value) {
    const tempo = clampTempo(value);
    bpmDisplay.textContent = String(tempo);
    tempoSlider.value = String(tempo);
    tempoSliderValue.textContent = String(tempo);
    updateSliderFill();
    return tempo;
  }

  function updateSliderFill() {
    const min = Number(tempoSlider.min || 20);
    const max = Number(tempoSlider.max || 999);
    const value = Number(tempoSlider.value);
    const percent = ((value - min) / (max - min)) * 100;
    tempoSlider.style.setProperty("--qa-slider-fill", percent + "%");
  }

  function closeWith(payload) {
    const message = { method: "close_and_send", params: [JSON.stringify(payload)] };
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.live) {
      window.webkit.messageHandlers.live.postMessage(message);
    } else if (window.chrome && window.chrome.webview) {
      window.chrome.webview.postMessage(message);
    }
  }

  function averageTapTempo() {
    if (tapTimes.length < 2) return null;
    const intervals = [];
    for (let i = 1; i < tapTimes.length; i++) {
      intervals.push(tapTimes[i] - tapTimes[i - 1]);
    }
    const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    return 60000 / avgMs;
  }

  tempoSlider.addEventListener("input", function () {
    setTempo(Number(tempoSlider.value));
  });
  updateSliderFill();

  document.getElementById("tap-button").addEventListener("click", function () {
    tapTimes.push(performance.now());
    if (tapTimes.length > 8) tapTimes.shift();
    const estimated = averageTapTempo();
    if (estimated != null) {
      setTempo(estimated);
      tapHint.textContent = "Tapped " + tapTimes.length + " time(s). Keep tapping to refine.";
    } else {
      tapHint.textContent = "Tap again on the next beat…";
    }
  });

  document.getElementById("reset-taps").addEventListener("click", function () {
    tapTimes = [];
    tapHint.textContent = "Tap at least twice on the beat.";
  });

  document.getElementById("theme-dark").addEventListener("click", function () {
    root.setAttribute("data-qa-theme", "dark");
    document.getElementById("theme-dark").setAttribute("aria-pressed", "true");
    document.getElementById("theme-light").setAttribute("aria-pressed", "false");
  });

  document.getElementById("theme-light").addEventListener("click", function () {
    root.setAttribute("data-qa-theme", "light");
    document.getElementById("theme-dark").setAttribute("aria-pressed", "false");
    document.getElementById("theme-light").setAttribute("aria-pressed", "true");
  });

  document.getElementById("cancel-button").addEventListener("click", function () {
    closeWith({ action: "cancel" });
  });

  document.getElementById("apply-button").addEventListener("click", function () {
    closeWith({ action: "apply", tempo: Number(tempoSlider.value) });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeWith({ action: "cancel" });
    if (event.key === "Enter") {
      closeWith({ action: "apply", tempo: Number(tempoSlider.value) });
    }
  });
})();
`;
