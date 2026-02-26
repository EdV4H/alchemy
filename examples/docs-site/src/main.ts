import "./main.css";
import { highlightAll } from "./highlight";

// Mobile nav toggle
function initMobileNav(): void {
  const toggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
  const sidebar = document.querySelector<HTMLElement>(".sidebar");
  const backdrop = document.querySelector<HTMLElement>(".sidebar-backdrop");

  if (!toggle || !sidebar) return;

  const close = () => {
    sidebar.classList.remove("open");
    backdrop?.classList.remove("open");
  };

  toggle.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("open");
    backdrop?.classList.toggle("open", isOpen);
  });

  backdrop?.addEventListener("click", close);

  sidebar.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", close);
  });
}

// Active sidebar link
function initActiveSidebarLink(): void {
  const path = window.location.pathname;
  const links = document.querySelectorAll<HTMLAnchorElement>(".sidebar-link");

  for (const link of links) {
    const href = link.getAttribute("href");
    if (!href) continue;

    if (path === href || path === `${href}index.html`) {
      link.classList.add("active");
    }
  }
}

// Copy buttons for code blocks
function initCopyButtons(): void {
  document.querySelectorAll<HTMLElement>(".code-block").forEach((block) => {
    const header = block.querySelector(".code-block-header");
    if (!header) return;

    // Skip if copy button already exists
    if (header.querySelector(".copy-btn")) return;

    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg><span>Copy</span>`;

    btn.addEventListener("click", async () => {
      const pre = block.querySelector("pre");
      const code = pre?.textContent ?? "";
      await navigator.clipboard.writeText(code);

      btn.classList.add("copied");
      const label = btn.querySelector("span");
      if (label) label.textContent = "Copied!";

      setTimeout(() => {
        btn.classList.remove("copied");
        if (label) label.textContent = "Copy";
      }, 2000);
    });

    header.appendChild(btn);
  });
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initActiveSidebarLink();
  highlightAll().then(initCopyButtons);
});
