import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";

function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  let inList = false;

  for (const line of lines) {
    // Skip the top-level title (# Package Name)
    if (/^# /.test(line)) continue;

    if (/^## /.test(line)) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h3>${line.replace(/^## /, "")}</h3>`);
    } else if (/^### /.test(line)) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h4>${line.replace(/^### /, "")}</h4>`);
    } else if (/^- /.test(line)) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${line.replace(/^- /, "")}</li>`);
    } else if (/^\s+- /.test(line)) {
      // Indented list items (sub-items in changelogs)
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${line.replace(/^\s+- /, "")}</li>`);
    } else if (line.trim() === "") {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
    }
  }

  if (inList) {
    html.push("</ul>");
  }

  return html.join("\n");
}

const packages = ["core", "node", "react"] as const;

export function changelogPlugin(): Plugin {
  return {
    name: "vite-plugin-changelog",
    transformIndexHtml: {
      order: "pre",
      handler(html, ctx) {
        if (!ctx.filename.includes("changelog/index.html")) {
          return html;
        }

        let result = html;
        for (const pkg of packages) {
          const placeholder = `<!-- CHANGELOG:${pkg} -->`;
          if (!result.includes(placeholder)) continue;

          try {
            const mdPath = resolve(__dirname, `../../../packages/${pkg}/CHANGELOG.md`);
            const md = readFileSync(mdPath, "utf-8");
            const content = markdownToHtml(md);
            result = result.replace(placeholder, content);
          } catch {
            result = result.replace(placeholder, "<p>No changelog available yet.</p>");
          }
        }

        return result;
      },
    },
  };
}
