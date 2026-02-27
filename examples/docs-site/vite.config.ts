import { resolve } from "node:path";
import { defineConfig } from "vite";
import { changelogPlugin } from "./src/vite-plugin-changelog";

export default defineConfig({
  base: "/alchemy/",
  plugins: [changelogPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        "getting-started": resolve(__dirname, "getting-started/index.html"),
        concepts: resolve(__dirname, "concepts/index.html"),
        api: resolve(__dirname, "api/index.html"),
        examples: resolve(__dirname, "examples/index.html"),
        changelog: resolve(__dirname, "changelog/index.html"),
      },
    },
  },
});
