import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

interface SampleNote {
  filename: string;
  content: string;
}

const sampleNotes: SampleNote[] = [
  {
    filename: "시작하기.md",
    content: `---
title: MarkVas에 오신 것을 환영합니다
tags: [시작하기, 안내]
---

# MarkVas에 오신 것을 환영합니다

이 워크스페이스는 앱의 주요 기능을 체험할 수 있는 샘플입니다.

## 기본 사용법

- **Ctrl+P** — 명령 팔레트 (모든 기능에 접근)
- **Ctrl+N** — 빠른 노트 만들기
- **Ctrl+B / I / K** — 굵게 / 기울임 / 링크

## 내부 링크 체험하기

아래 링크를 클릭하면 해당 노트로 이동합니다.

- [[마크다운 가이드]] — 문법 치트시트
- [[할 일 목록]] — 체크박스 예시
- [[아이디어]] — 브레인스토밍 노트

## 태그 예시

이 노트의 태그는 #시작하기 와 #안내 입니다.
왼쪽 패널에서 태그를 클릭해 필터링할 수 있습니다.
`,
  },
  {
    filename: "마크다운 가이드.md",
    content: `---
title: 마크다운 문법 가이드
tags: [문법, 참고]
---

# 마크다운 문법 가이드

[[시작하기]] 노트에서 왔나요? 여기서는 지원하는 문법을 확인할 수 있습니다.

## 텍스트 서식

**굵게** · *기울임* · ~~취소선~~ · ==강조== · \`인라인 코드\`

## 제목

# 제목 1
## 제목 2
### 제목 3

## 목록

- 글머리 항목
- 두 번째 항목

1. 번호 항목
2. 두 번째

## 체크리스트

미리보기에서 체크박스를 클릭하면 원문이 바로 업데이트됩니다.

- [x] 샘플 워크스페이스 열기
- [ ] 내부 링크 클릭해보기
- [ ] 새 노트 만들기 (Ctrl+N)
- [ ] 커맨드 팔레트 열기 (Ctrl+P)

## 표

| 기능 | 단축키 |
| --- | --- |
| 명령 팔레트 | Ctrl+P |
| 빠른 노트 | Ctrl+N |
| 굵게 | Ctrl+B |

## 코드 블록

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

## 인용

> 좋은 노트는 생각을 정리하는 가장 빠른 방법입니다.
`,
  },
  {
    filename: "할 일 목록.md",
    content: `---
title: 오늘의 할 일
tags: [할일, 생산성]
---

# 오늘의 할 일

#할일 #생산성

미리보기 패널에서 체크박스를 클릭하면 원문이 자동으로 업데이트됩니다.

## 중요

- [ ] 마크다운 에디터 사용법 익히기
- [ ] [[마크다운 가이드]] 읽기
- [ ] 첫 번째 노트 작성하기

## 오늘 중

- [ ] 워크스페이스 구조 정리
- [ ] 태그 시스템 활용하기
- [ ] 템플릿 만들어보기

## 완료됨

- [x] 앱 설치
- [x] 샘플 워크스페이스 열기
`,
  },
  {
    filename: "아이디어.md",
    content: `---
title: 아이디어 노트
tags: [아이디어, 브레인스토밍]
---

# 아이디어 노트

#아이디어 #브레인스토밍

자유롭게 생각을 적는 공간입니다. [[시작하기]]로 돌아가거나
[[할 일 목록]]에서 작업 항목을 확인할 수 있습니다.

## 프로젝트 아이디어

- 개인 지식 베이스 구축하기
- 독서 노트 체계화
- 회의록 템플릿 만들기

## 메모

> 아이디어는 기록하는 순간 실현 가능성이 생깁니다.

---

*이 노트를 자유롭게 수정하거나 삭제해도 됩니다.*
`,
  },
];

export async function createSampleWorkspace(workspacePath: string): Promise<void> {
  await mkdir(workspacePath, { recursive: true });

  await Promise.all(
    sampleNotes.map((note) =>
      writeFile(path.join(workspacePath, note.filename), note.content, "utf8")
    )
  );
}
