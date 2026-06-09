import hljs from "highlight.js/lib/core";
import langBash from "highlight.js/lib/languages/bash";
import langCSS from "highlight.js/lib/languages/css";
import langJSON from "highlight.js/lib/languages/json";
import langJS from "highlight.js/lib/languages/javascript";
import langPython from "highlight.js/lib/languages/python";
import langSQL from "highlight.js/lib/languages/sql";
import langTS from "highlight.js/lib/languages/typescript";
import langXML from "highlight.js/lib/languages/xml";
import langYAML from "highlight.js/lib/languages/yaml";
import langMarkdown from "highlight.js/lib/languages/markdown";
import langRust from "highlight.js/lib/languages/rust";
import langGo from "highlight.js/lib/languages/go";
import langJava from "highlight.js/lib/languages/java";

hljs.registerLanguage("javascript", langJS);
hljs.registerLanguage("js", langJS);
hljs.registerLanguage("typescript", langTS);
hljs.registerLanguage("ts", langTS);
hljs.registerLanguage("python", langPython);
hljs.registerLanguage("py", langPython);
hljs.registerLanguage("css", langCSS);
hljs.registerLanguage("json", langJSON);
hljs.registerLanguage("bash", langBash);
hljs.registerLanguage("sh", langBash);
hljs.registerLanguage("shell", langBash);
hljs.registerLanguage("sql", langSQL);
hljs.registerLanguage("html", langXML);
hljs.registerLanguage("xml", langXML);
hljs.registerLanguage("yaml", langYAML);
hljs.registerLanguage("yml", langYAML);
hljs.registerLanguage("markdown", langMarkdown);
hljs.registerLanguage("md", langMarkdown);
hljs.registerLanguage("rust", langRust);
hljs.registerLanguage("go", langGo);
hljs.registerLanguage("java", langJava);

const escapeMap: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
};

export interface RenderOptions {
  basePath?: string;
}

export function normalizeMarkdownContent(markdown: string): string {
  return markdown
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/&amp;lt;br\s*\/?&amp;gt;/gi, "\n")
    .replace(/&lt;br\s*\/?&gt;/gi, "\n")
    .replace(/<\/?br\s*\/?>/gi, "\n")
    .replace(/^[ \t]*<br\s*\/?>[ \t]*$/gim, "");
}

export function renderMarkdownPreview(markdown: string, options?: RenderOptions): string {
  const counter = { value: 0 };

  // ── 전처리 ──────────────────────────────────────────────────────────────
  // 1) Windows CRLF → LF 정규화 (CRLF를 쓰면 \n{2,} 분리가 실패함)
  // 2) Milkdown 등이 생성하는 HTML <br> 태그를 일반 개행으로 변환
  // 3) 이미 이스케이프된 &lt;br /&gt; 형태도 처리
  const normalized = normalizeMarkdownContent(markdown);

  return collectMarkdownBlocks(normalized)
    .map((part) => (part.kind === "blank" ? renderBlankSpace(part.blankLineCount) : renderBlock(part.content.trim(), counter, options)))
    .join("");
}

export function toggleCheckboxInContent(content: string, checkboxIndex: number): string {
  let currentIndex = 0;
  return content.replace(/^(- \[)([ xX])(\] .*)/gm, (match, open, state, rest) => {
    if (currentIndex === checkboxIndex) {
      currentIndex++;
      const newState = /[xX]/.test(state) ? " " : "x";
      return `${open}${newState}${rest}`;
    }
    currentIndex++;
    return match;
  });
}

function renderBlock(block: string, checkboxCounter: { value: number }, options?: RenderOptions): string {
  if (block.length === 0) return "";
  if (block.startsWith("### ")) return `<h3>${inline(block.slice(4), options)}</h3>`;
  if (block.startsWith("## ")) return `<h2>${inline(block.slice(3), options)}</h2>`;
  if (block.startsWith("# ")) return `<h1>${inline(block.slice(2), options)}</h1>`;
  if (block === "---") return "<hr />";
  if (block.startsWith("> ")) {
    const quote = block
      .split("\n")
      .map((line) => line.replace(/^> ?/, ""))
      .join("\n");
    return `<blockquote>${inline(quote, options).replace(/\n/g, "<br />")}</blockquote>`;
  }
  if (isTable(block)) return renderTable(block, options);
  if (/^\d+\. /.test(block)) {
    const items = block
      .split("\n")
      .map((line) => `<li>${inline(line.replace(/^\d+\. /, ""), options)}</li>`)
      .join("");
    return `<ol>${items}</ol>`;
  }
  if (/^- \[[ xX]\] /.test(block)) {
    const items = block
      .split("\n")
      .map((line) => {
        const checked = /^- \[[xX]\] /.test(line);
        const label = line.replace(/^- \[[ xX]\] /, "");
        const idx = checkboxCounter.value++;
        return `<li><input type="checkbox"${checked ? " checked" : ""} data-checkbox-index="${idx}" />${inline(label, options)}</li>`;
      })
      .join("");
    return `<ul class="task-list">${items}</ul>`;
  }
  if (block.startsWith("- ")) {
    const items = block
      .split("\n")
      .map((line) => `<li>${inline(line.replace(/^- /, ""), options)}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  }
  if (block.startsWith("```")) {
    return renderCodeBlock(block);
  }
  return `<p>${inline(block, options).replace(/\n/g, "<br />")}</p>`;
}

type MarkdownPart = { kind: "block"; content: string } | { kind: "blank"; blankLineCount: number };

function collectMarkdownBlocks(markdown: string): MarkdownPart[] {
  const parts: MarkdownPart[] = [];
  const lines = markdown.split("\n");
  let blockLines: string[] = [];
  let blankLineCount = 0;
  let isInFence = false;

  function flushBlock(): void {
    if (blockLines.length === 0) return;
    parts.push({ kind: "block", content: blockLines.join("\n") });
    blockLines = [];
  }

  function flushBlankLines(): void {
    if (blankLineCount <= 0) return;
    parts.push({ kind: "blank", blankLineCount });
    blankLineCount = 0;
  }

  for (const line of lines) {
    const isFenceLine = line.trim().startsWith("```");

    if (isInFence) {
      blockLines.push(line);
      if (isFenceLine) {
        isInFence = false;
        flushBlock();
      }
      continue;
    }

    if (isFenceLine) {
      flushBlock();
      flushBlankLines();
      blockLines.push(line);
      isInFence = true;
      continue;
    }

    if (line.trim() === "") {
      flushBlock();
      blankLineCount += 1;
      continue;
    }

    flushBlankLines();
    blockLines.push(line);
  }

  flushBlock();
  return parts;
}

function renderBlankSpace(blankLineCount: number): string {
  const extraBlankLines = Math.max(0, blankLineCount - 1);
  if (extraBlankLines === 0) return "";
  return `<div class="markdown-blank-space" style="height:${extraBlankLines * 1.75}em"></div>`;
}

function renderCodeBlock(block: string): string {
  const firstLineEnd = block.indexOf("\n");
  const langTag = firstLineEnd !== -1 ? block.slice(3, firstLineEnd).trim() : block.slice(3).trim();
  const code = firstLineEnd !== -1
    ? block.slice(firstLineEnd + 1).replace(/\n?```$/, "")
    : "";

  if (langTag && hljs.getLanguage(langTag)) {
    try {
      const highlighted = hljs.highlight(code, { language: langTag, ignoreIllegals: true }).value;
      return `<pre class="code-highlighted"><code class="hljs language-${langTag}">${highlighted}</code></pre>`;
    } catch {
      // fall through to plain
    }
  }

  return `<pre class="code-plain"><code>${escapeHtml(code)}</code></pre>`;
}

function inline(value: string, options?: RenderOptions): string {
  return escapeHtml(value)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt: string, rawSrc: string) => {
      const src = rawSrc.replace(/&amp;/g, "&").replace(/&quot;/g, '"');
      const resolvedSrc = resolveImageSrc(src, options?.basePath);
      return `<img class="prose-img" alt="${alt}" src="${escapeAttribute(resolvedSrc)}" loading="lazy" />`;
    })
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, target: string, label: string | undefined) =>
      renderInternalLink(label?.trim() || target.trim(), target.trim())
    )
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label: string, target: string) => renderMarkdownLink(label, target.trim()))
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/~~(.*?)~~/g, "<del>$1</del>")
    .replace(/==(.*?)==/g, "<mark>$1</mark>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function resolveImageSrc(src: string, basePath?: string): string {
  // External URLs and data URIs pass through unchanged
  if (/^https?:\/\//.test(src) || src.startsWith("data:") || src.startsWith("blob:")) return src;
  // Already an mc-asset URL
  if (src.startsWith("mc-asset://")) return src;

  // Build absolute path from document base path
  let absolutePath: string;
  if (!basePath) {
    absolutePath = src;
  } else {
    // basePath is the document file path; strip filename to get directory
    const docDir = basePath.replace(/[\\/][^\\/]*$/, "");
    const normalized = src.replace(/\//g, "\\");
    absolutePath = `${docDir}\\${normalized}`;
  }

  // Encode as mc-asset:// protocol URL (handled in Electron main process)
  return "mc-asset://" + encodeURIComponent(absolutePath);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => escapeMap[char] ?? char);
}

function escapeAttribute(value: string): string {
  return value.replace(/`/g, "&#096;").replace(/"/g, "&quot;");
}

function renderMarkdownLink(label: string, target: string): string {
  if (isInternalLink(target)) {
    return renderInternalLink(label, target);
  }
  return `<a href="${escapeAttribute(target)}" target="_blank" rel="noreferrer">${label}</a>`;
}

function renderInternalLink(label: string, target: string): string {
  return `<a href="#" data-note-target="${escapeAttribute(target)}">${label}</a>`;
}

function isInternalLink(target: string): boolean {
  return !/^[a-z][a-z0-9+.-]*:/i.test(target) && !target.startsWith("#") && !target.startsWith("mailto:");
}

function isTable(block: string): boolean {
  const lines = block.split("\n");
  const header = lines[0] ?? "";
  const divider = lines[1] ?? "";
  return lines.length >= 2 && header.includes("|") && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(divider);
}

function renderTable(block: string, options?: RenderOptions): string {
  const lines = block.split("\n");
  const headers = splitTableRow(lines[0] ?? "");
  const rows = lines.slice(2).map(splitTableRow);
  return `<table><thead><tr>${headers.map((h) => `<th>${inline(h, options)}</th>`).join("")}</tr></thead><tbody>${rows
    .map((row) => `<tr>${headers.map((_h, i) => `<td>${inline(row[i] ?? "", options)}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}
