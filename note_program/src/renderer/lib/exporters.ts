import { renderMarkdownPreview } from "./markdown";

/** PDF 출력용 완전한 HTML 문서를 생성한다 */
function buildPdfDocument(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)}</title>
<style>
  /* ── 기본 리셋 ── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 15px; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", sans-serif;
    color: #1c2430;
    background: #fff;
    line-height: 1.7;
    padding: 0;
  }

  /* ── 레이아웃 ── */
  .page { max-width: 720px; margin: 0 auto; padding: 40px 48px; }

  /* ── 제목 ── */
  h1 { font-size: 2rem; font-weight: 700; margin-bottom: 1.25rem; }
  h2 { font-size: 1.5rem; font-weight: 600; margin: 1.75rem 0 1rem; }
  h3 { font-size: 1.2rem; font-weight: 600; margin: 1.5rem 0 0.75rem; }

  /* ── 단락·목록 ── */
  p, ul, ol, blockquote, pre, table { margin-bottom: 1rem; }
  ul { list-style: disc; padding-left: 1.5rem; }
  ol { list-style: decimal; padding-left: 1.5rem; }

  /* ── 인라인 ── */
  strong { font-weight: 700; }
  em { font-style: italic; }
  del { text-decoration: line-through; }
  mark { background: #fef9c3; padding: 0 2px; border-radius: 2px; }
  code {
    font-family: "JetBrains Mono", "Fira Code", Consolas, monospace;
    font-size: 0.88em;
    background: #f1f5f9;
    border-radius: 4px;
    padding: 0.1em 0.4em;
  }

  /* ── 인용 ── */
  blockquote {
    border-left: 4px solid #2b7a78;
    background: #f0fdfa;
    padding: 0.75rem 1rem;
    color: #374151;
    border-radius: 0 4px 4px 0;
  }

  /* ── 코드 블록 ── */
  pre { border-radius: 6px; overflow: auto; }
  pre.code-plain { background: #1c2430; color: #f8f7f3; padding: 1rem; }
  pre.code-plain code { background: transparent; color: inherit; padding: 0; }
  pre.code-highlighted { background: #f6f8fa; border: 1px solid #d8ddd6; padding: 0; }
  pre.code-highlighted code { display: block; padding: 1rem; background: transparent; }

  /* ── 표 ── */
  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  th, td { border: 1px solid #d8ddd6; padding: 0.5rem 0.75rem; text-align: left; }
  th { background: #f1f5f9; font-weight: 600; }

  /* ── 링크 ── */
  a { color: #2b7a78; text-decoration: underline; }

  /* ── 구분선 ── */
  hr { border: none; border-top: 1px solid #d8ddd6; margin: 1.5rem 0; }

  /* ── 체크리스트 ── */
  ul.task-list { list-style: none; padding-left: 0; }
  ul.task-list li { display: flex; align-items: flex-start; gap: 0.5rem; }
  input[type="checkbox"] { margin-top: 4px; }

  /* ── 이미지 ── */
  img.prose-img { max-width: 100%; border-radius: 4px; border: 1px solid #d8ddd6; margin: 0.75rem 0; }

  /* ── 인쇄 ── */
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    pre { white-space: pre-wrap; }
  }

  /* ── highlight.js (github theme subset) ── */
  .hljs { color: #24292e; }
  .hljs-comment,.hljs-meta { color: #6a737d; }
  .hljs-keyword,.hljs-selector-tag,.hljs-literal { color: #d73a49; font-weight: bold; }
  .hljs-string,.hljs-attr { color: #032f62; }
  .hljs-number { color: #005cc5; }
  .hljs-title,.hljs-section { color: #6f42c1; font-weight: bold; }
  .hljs-type { color: #6f42c1; }
  .hljs-built_in,.hljs-builtin-name { color: #e36209; }
  .hljs-tag { color: #22863a; }
  .hljs-attribute { color: #b31d28; }
  .hljs-variable,.hljs-template-variable { color: #e36209; }
  .hljs-symbol { color: #0366d6; }
  .hljs-emphasis { font-style: italic; }
  .hljs-strong { font-weight: bold; }
</style>
</head>
<body>
<div class="page">${bodyHtml}</div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[c] ?? c
  );
}

/** Electron printToPDF 기반 고품질 PDF 내보내기 */
export async function exportToPdfElectron(
  markdownContent: string,
  documentPath: string,
  title: string
): Promise<void> {
  assertDesktopApi();

  const defaultFilename = title.replace(/\.md$/i, "") + ".pdf";
  const outputPath = await window.markdownCanvas.showPdfSaveDialog(defaultFilename);
  if (!outputPath) return; // 사용자가 취소

  const bodyHtml = renderMarkdownPreview(markdownContent, { basePath: documentPath });
  const fullHtml = buildPdfDocument(title, bodyHtml);

  await window.markdownCanvas.printToPdf(fullHtml, outputPath);
}

/** 레거시 html2pdf 기반 (fallback) */
export async function exportElementToPdf(element: HTMLElement, filename: string): Promise<void> {
  // html2pdf가 있으면 사용, 없으면 Electron 방식으로 redirect
  try {
    const { default: html2pdf } = await import("html2pdf.js");
    await html2pdf()
      .set({
        filename,
        margin: 10,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save(filename);
  } catch {
    // html2pdf 사용 불가 시 무시 (Electron 방식을 App.tsx에서 우선 호출)
  }
}

function assertDesktopApi(): void {
  if (!window.markdownCanvas) {
    throw new Error("Electron preload API가 연결되지 않았습니다.");
  }
}
