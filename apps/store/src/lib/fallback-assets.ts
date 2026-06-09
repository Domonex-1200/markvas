import type { StoreAsset } from "@markdown-canvas/shared";

export const fallbackAssets: StoreAsset[] = [
  {
    id: "demo-editorial-theme",
    title: "Editorial Focus Theme",
    type: "THEME",
    metadata: {
      version: "1.0.0",
      summary: "긴 글 작성과 미리보기에 어울리는 차분한 편집 테마",
      description: "문서 미리보기와 PDF 출력 화면에 사용할 수 있는 차분한 편집 테마입니다.",
      tokens: {
        colors: {
          paper: "#f8f7f3",
          accent: "#2b7a78",
          ink: "#1c2430"
        },
        editorCss: ".prose-canvas h1 { color: #2b7a78; } .prose-canvas blockquote { border-left: 3px solid #d66a50; padding-left: 16px; }",
        exportCss: "@page { margin: 16mm; }"
      }
    },
    filePath: "/assets/demo-editorial-theme/theme.css",
    authorId: "system",
    pricingType: "FREE",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    createdAt: new Date(0).toISOString()
  },
  {
    id: "demo-decision-log",
    title: "Decision Log Template",
    type: "TEMPLATE",
    metadata: {
      version: "1.0.0",
      summary: "중요한 결정을 기록하고 근거를 남기는 템플릿",
      description: "결정 배경, 선택지, 결정 내용, 결과 확인 항목을 한 번에 정리하는 의사결정 기록 템플릿입니다.",
      template: {
        id: "decision-log",
        title: "의사결정 기록",
        description: "중요한 선택의 맥락과 결과를 남기는 노트",
        content:
          "---\ntitle: {{title}}\ntags: [decision]\ntemplate: decision-log\ncreated: {{date}}\n---\n\n# {{title}}\n\n## 배경\n\n\n## 선택지\n\n- \n\n## 결정\n\n\n## 결과 확인\n\n- [ ] \n"
      }
    },
    filePath: "/assets/demo-decision-log/template.md",
    authorId: "system",
    pricingType: "FREE",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    createdAt: new Date(1).toISOString()
  },
  {
    id: "demo-word-count",
    title: "Word Count Reporter",
    type: "PLUGIN",
    metadata: {
      version: "1.0.0",
      summary: "현재 노트의 단어 수와 글자 수를 확인하는 플러그인",
      description: "현재 열린 노트의 단어 수와 글자 수를 커맨드 팔레트에서 빠르게 확인하는 샘플 플러그인입니다.",
      plugin: {
        id: "word-count-reporter",
        title: "Word Count Reporter",
        version: "1.0.0",
        description: "현재 노트의 단어 수와 글자 수를 알려줍니다.",
        permissions: ["note:read"],
        entryFile: "plugin.js",
        commands: [
          {
            id: "report-current-note",
            title: "현재 노트 통계 보기",
            description: "현재 열린 노트의 단어 수와 글자 수를 표시"
          }
        ],
        code:
          "return function(input) { const content = input.document?.content ?? ''; const words = content.trim() ? content.trim().split(/\\s+/).length : 0; return `현재 노트: ${words} words, ${content.length} chars`; };"
      }
    },
    filePath: "/assets/demo-word-count/plugin.js",
    authorId: "system",
    pricingType: "FREE",
    priceCents: 0,
    currency: "USD",
    status: "PUBLISHED",
    createdAt: new Date(2).toISOString()
  }
];
