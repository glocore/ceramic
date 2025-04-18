import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  root: import.meta.dirname,
  build: {
    outDir: path.join(
      import.meta.dirname,
      "..",
      ".vite",
      "renderer",
      "main_window"
    ),
  },
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
  ],
});
