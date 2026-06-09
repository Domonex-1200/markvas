import type { AppRelease } from "@markdown-canvas/shared";

export const fallbackReleases: AppRelease[] = [
  {
    id: "fallback-windows-0.1.0",
    version: "0.1.0",
    platform: "windows",
    channel: "stable",
    downloadUrl: "https://github.com/your-org/markvas/releases/download/v0.1.0/MarkVas-Setup-0.1.0.exe",
    checksum: "sha256-dev-windows-placeholder",
    releaseNotes:
      "Windows 데스크탑 미리보기 빌드입니다. 로컬 Markdown 편집, PDF 출력, 템플릿, 플러그인, 스토어 동기화 기반 기능을 포함합니다.",
    publishedAt: new Date(0).toISOString()
  }
];
