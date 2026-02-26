import { defineConfig } from "vite";

export default defineConfig({
  build: {
    ssr: "src/server/index.ts",
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: "_worker.js",
        format: "esm",
      },
    },
  },
});
