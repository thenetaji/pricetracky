import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "build",
    emptyOutDir: true,
    rollupOptions: {},
  },
  server: {
    open: true,
    port: 5173,
  },
  css: {
    postcss: "./postcss.config.js",
  },
});
