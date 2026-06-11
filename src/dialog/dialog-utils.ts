/** Helpers for Ableton extension modal webviews. */

export function closeWithResult(result: string): void {
  const message = { method: "close_and_send", params: [result] };

  const webview = (window as Window & {
    chrome?: { webview?: { postMessage: (msg: unknown) => void } };
    webkit?: { messageHandlers?: { live?: { postMessage: (msg: unknown) => void } } };
  }).chrome?.webview;

  if (webview) {
    webview.postMessage(message);
    return;
  }

  const liveHandler = (window as Window & {
    webkit?: { messageHandlers?: { live?: { postMessage: (msg: unknown) => void } } };
  }).webkit?.messageHandlers?.live;

  if (liveHandler) {
    liveHandler.postMessage(message);
  }
}

export function autofocusPrimaryInput(
  root: ParentNode = document,
  selector = "input:not([type=hidden]), textarea, select",
): void {
  const element = root.querySelector<HTMLElement>(selector);
  element?.focus();
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    element.select();
  }
}

export function bindEnterSubmits(
  form: HTMLFormElement,
  onSubmit: () => void,
): () => void {
  const handler = (event: KeyboardEvent) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    onSubmit();
  };

  form.addEventListener("keydown", handler);
  return () => form.removeEventListener("keydown", handler);
}

export function bindEscapeCancels(onCancel: () => void): () => void {
  const handler = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    onCancel();
  };

  document.addEventListener("keydown", handler);
  return () => document.removeEventListener("keydown", handler);
}

export function setInputInvalid(input: HTMLElement, invalid: boolean): void {
  input.classList.toggle("qa-input--invalid", invalid);
  input.setAttribute("aria-invalid", invalid ? "true" : "false");
}
