import type { AppRelease } from "@markdown-canvas/shared";

export const fallbackReleases: AppRelease[] = [
  {
    id: "fallback-windows-0.1.0",
    version: "0.1.0",
    platform: "windows",
    channel: "stable",
    downloadUrl: "https://github.com/Domonex-1200/note_project_semi/releases/download/v0.1.0/MarkVas.Setup.0.1.0.exe",
    checksum: "GitHub Releases에서 확인하세요.",
    releaseNotes:
      "Windows 데스크탑 첫 번째 배포입니다. 로컬 Markdown 편집, PDF 출력, 템플릿, 플러그인, 에셋 스토어 동기화 기능을 포함합니다.",
    publishedAt: new Date("2026-06-10").toISOString()
  }
];
