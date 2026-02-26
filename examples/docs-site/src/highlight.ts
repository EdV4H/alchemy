import { codeToHtml } from "shiki";

const LANG_MAP: Record<string, string> = {
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  bash: "bash",
  sh: "bash",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
};

export async function highlightAll(): Promise<void> {
  const blocks = document.querySelectorAll<HTMLElement>("pre code[class*='language-']");

  const jobs = Array.from(blocks).map(async (codeEl) => {
    const classMatch = codeEl.className.match(/language-(\w+)/);
    if (!classMatch) return;

    const rawLang = classMatch[1];
    const lang = LANG_MAP[rawLang] ?? rawLang;
    const code = codeEl.textContent ?? "";

    const html = await codeToHtml(code, {
      lang,
      theme: "github-dark-default",
    });

    const wrapper = codeEl.closest(".code-block");
    if (wrapper) {
      const pre = wrapper.querySelector("pre");
      if (pre) {
        pre.outerHTML = html;
      }
    }
  });

  await Promise.all(jobs);
}
