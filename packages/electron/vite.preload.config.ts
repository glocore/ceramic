import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  define: {
    "import.meta.vitest": "undefined",
  },
});
