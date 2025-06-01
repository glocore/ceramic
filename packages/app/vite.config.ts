import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { iconFontPlugin } from "./src/vite-plugin-icon-font";

// https://vite.dev/config/
export default defineConfig({
  root: import.meta.dirname,
  build: {
    outDir: path.join(import.meta.dirname, "../.vite/renderer/main_window"),
  },
  plugins: [
    tsconfigPaths(),
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    iconFontPlugin({
      paths: [
        path.join(import.meta.dirname, "src/routes/ide/-components/fileicons"),
      ],
    }),
  ],
  optimizeDeps: {
    force: true,
    exclude: ["@ceramic/common"],
  },
  define: {
    "import.meta.vitest": undefined,
  },
});
