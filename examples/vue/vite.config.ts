import path from "node:path";
import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

const examplesRoot = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(examplesRoot, "../..");

export default defineConfig({
  root: examplesRoot,
  build: {
    outDir: path.resolve(examplesRoot, "dist"),
    emptyOutDir: true,
  },
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: "@quantumaudio/ableton-extension-sdk/vue",
        replacement: path.resolve(packageRoot, "src/components/index.ts"),
      },
      {
        find: "@quantumaudio/ableton-extension-sdk/styles.css",
        replacement: path.resolve(packageRoot, "src/styles.css"),
      },
      {
        find: "@quantumaudio/ableton-extension-sdk/theme.css",
        replacement: path.resolve(packageRoot, "src/theme/theme.css"),
      },
      {
        find: "@quantumaudio/ableton-extension-sdk",
        replacement: path.resolve(packageRoot, "src/index.ts"),
      },
    ],
  },
  server: {
    port: 5199,
    strictPort: true,
  },
  preview: {
    port: 5199,
    strictPort: true,
  },
});
