import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

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
    tsconfigPaths(),
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    force: true,
    exclude: ["@ceramic/common"],
  },
  define: {
    "import.meta.vitest": undefined,
  },
});
