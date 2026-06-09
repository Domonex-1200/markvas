import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      rollupOptions: {
        output: {
          format: "cjs",
          entryFileNames: "[name].js"
        }
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    server: {
      host: "127.0.0.1",
      port: 5317,
      strictPort: true
    },
    resolve: {
      alias: {
        "@renderer": path.resolve("src/renderer"),
        "@markdown-canvas/shared": path.resolve("../../packages/shared/src/index.ts")
      }
    },
    plugins: [react()]
  }
});
