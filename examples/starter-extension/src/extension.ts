/**
 * Starter Ableton Live extension — Tempo Tap panel.
 *
 * Flow:
 * 1. Live calls activate() when the extension loads.
 * 2. We register a command the user can trigger from Live.
 * 3. The command opens a modal webview styled with @quantumaudio/ableton-extension-sdk.
 * 4. The panel returns JSON; we optionally write song.tempo.
 *
 * No Vue — the panel is plain HTML + inlined CSS (see panel-document.ts).
 */
import { initialize, type ActivationContext } from "@ableton-extensions/sdk";
import { panelDataUrl, type PanelResult } from "./panel-document.js";

/** Must be unique. Convention: quantumaudio.<extension>.<action> */
const COMMAND_OPEN_PANEL = "quantumaudio.starter.open-tempo-panel";

export function activate(activation: ActivationContext) {
  const context = initialize(activation, "1.0.0");

  // Register the handler first — context menu actions and other triggers reference this id.
  context.commands.registerCommand(COMMAND_OPEN_PANEL, async () => {
    await openTempoPanel(context);
  });
}

async function openTempoPanel(
  context: ReturnType<typeof initialize>,
): Promise<void> {
  const song = context.application.song;
  const currentTempo = song.tempo;

  // Modal size in pixels — keep narrow; Live webviews are small.
  const raw = await context.ui.showModalDialog(
    panelDataUrl(currentTempo),
    360,
    440,
  );

  if (!raw) {
    return;
  }

  let parsed: PanelResult;
  try {
    parsed = JSON.parse(raw) as PanelResult;
  } catch {
    // User closed without a payload — treat as cancel.
    return;
  }

  if (parsed.action === "cancel") {
    return;
  }

  const tempo = Math.min(999, Math.max(20, Math.round(parsed.tempo)));
  song.tempo = tempo;
}
