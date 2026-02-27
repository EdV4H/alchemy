import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vite";
import { changelogPlugin } from "./src/vite-plugin-changelog";

function versionPlugin(): Plugin {
  const pkg = JSON.parse(
    readFileSync(resolve(__dirname, "../../packages/core/package.json"), "utf-8"),
  );
  return {
    name: "vite-plugin-version",
    transformIndexHtml(html) {
      return html.replaceAll("__ALCHEMY_VERSION__", pkg.version as string);
    },
  };
}

export default defineConfig({
  base: "/alchemy/",
  plugins: [versionPlugin(), changelogPlugin()],
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
