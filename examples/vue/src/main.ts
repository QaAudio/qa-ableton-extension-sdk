import { createApp } from "vue";
import { createThemeProvider } from "@quantumaudio/ableton-extension-sdk";
import "@quantumaudio/ableton-extension-sdk/styles.css";
import App from "./App.vue";
import "./gallery.css";

const params = new URLSearchParams(window.location.search);
const provider = createThemeProvider(document.documentElement, {
  defaultTheme: params.get("theme") === "light" ? "light" : "dark",
});

if (params.get("theme") === "light" || params.get("theme") === "dark") {
  provider.setTheme(params.get("theme") as "light" | "dark");
}

createApp(App, {
  initialLayout: params.get("layout") ?? "extension-shell",
  screenshotMode: params.has("screenshot"),
}).mount("#app");
