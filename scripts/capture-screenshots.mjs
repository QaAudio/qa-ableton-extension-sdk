/**
 * Captures README screenshots from the Vue layout gallery.
 * Requires: npm run build:examples && npx playwright install chromium
 */
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(packageRoot, "docs", "screenshots");
const previewPort = 5199;
const previewUrl = `http://127.0.0.1:${previewPort}`;

const layouts = [
  "extension-shell",
  "effect-panel",
  "rename-dialog",
  "project-toolbar",
  "status-chrome",
  "instrument-device",
  "channel-strip",
  "sample-editor",
  "fx-chain",
  "synth-playground",
];

const themes = ["dark", "light"];

function waitForServer(url, timeoutMs = 30_000) {
  const started = Date.now();

  return new Promise((resolve, reject) => {
    const tick = () => {
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });

      request.on("error", retry);

      function retry() {
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for ${url}`));
          return;
        }
        setTimeout(tick, 250);
      }
    };

    tick();
  });
}

function runPreview() {
  const child = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["vite", "preview", "--config", "examples/vue/vite.config.ts", "--host", "127.0.0.1"],
    {
      cwd: packageRoot,
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
    },
  );

  child.stdout?.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr?.on("data", (chunk) => process.stderr.write(chunk));

  return child;
}

async function capture() {
  await fs.mkdir(outDir, { recursive: true });

  let preview = null;
  let startedPreview = false;

  try {
    await waitForServer(previewUrl);
  } catch {
    preview = runPreview();
    startedPreview = true;
    await waitForServer(previewUrl);
  }

  try {

    const browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: { width: 900, height: 640 },
      deviceScaleFactor: 2,
    });

    for (const theme of themes) {
      for (const layout of layouts) {
        const query = new URLSearchParams({
          layout,
          theme,
          screenshot: "1",
        });
        await page.goto(`${previewUrl}/?${query.toString()}`, { waitUntil: "networkidle" });
        await page.waitForTimeout(200);

        const frame = page.locator(".gallery__frame");
        await frame.screenshot({
          path: path.join(outDir, `${layout}-${theme}.png`),
        });
      }
    }

    await browser.close();
    console.log(`Saved ${layouts.length * themes.length} screenshots to ${outDir}`);
  } finally {
    if (startedPreview && preview) {
      preview.kill("SIGTERM");
    }
  }
}

capture().catch((error) => {
  console.error(error);
  process.exit(1);
});
