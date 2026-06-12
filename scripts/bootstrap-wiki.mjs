import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const token = execSync("gh auth token", { encoding: "utf8" }).trim();
const owner = "QaAudio";
const repo = "qa-ableton-extension-sdk";
const base = `https://github.com/${owner}/${repo}`;

async function savePage(title, markdown) {
  const getRes = await fetch(`${base}/wiki/_new`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "text/html" },
    redirect: "follow",
  });
  const html = await getRes.text();
  if (getRes.url.includes("/login")) {
    throw new Error("GitHub token cannot access wiki editor (redirected to login).");
  }

  const authMatch = html.match(/name="authenticity_token" value="([^"]+)"/);
  const utf8Match = html.match(/name="utf8" value="([^"]+)"/);
  if (!authMatch) {
    throw new Error(`Could not parse authenticity_token (status ${getRes.status}).`);
  }

  const body = new URLSearchParams({
    utf8: utf8Match?.[1] ?? "✓",
    authenticity_token: authMatch[1],
    "page[title]": title,
    "page[body]": markdown,
    "page[format]": "markdown",
    "page[parent_name]": "",
    commit: "Save Page",
  });

  const postRes = await fetch(`${base}/wiki`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "text/html",
    },
    body,
    redirect: "manual",
  });

  const location = postRes.headers.get("location");
  console.log(`Saved ${title}: HTTP ${postRes.status}${location ? ` → ${location}` : ""}`);
  if (postRes.status >= 400) {
    const text = await postRes.text();
    const titleMatch = text.match(/<title>([^<]+)<\/title>/);
    throw new Error(
      `Failed to save ${title}: HTTP ${postRes.status} ${titleMatch?.[1] ?? ""}\n${text.slice(0, 800)}`,
    );
  }
}

const home = readFileSync(path.join(root, "docs/wiki/Home.md"), "utf8");
const quick = readFileSync(path.join(root, "docs/wiki/Quick-Start.md"), "utf8");
const plainHtml = readFileSync(path.join(root, "docs/wiki/Plain-HTML-Webview.md"), "utf8");

await savePage("Home", home);
await savePage("Quick-Start", quick);
await savePage("Plain-HTML-Webview", plainHtml);
console.log("Wiki bootstrap complete.");
