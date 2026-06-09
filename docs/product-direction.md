# Product Direction

## 방향

이 프로젝트는 Notion식 서버 중심 블록 DB보다 Obsidian식 로컬 우선 마크다운 워크스페이스에 가깝게 발전시킨다.

## 지켜야 할 원칙

- 원본 노트는 항상 사람이 읽을 수 있는 `.md` 파일로 유지한다.
- 앱 전용 데이터는 가능한 한 frontmatter, 사이드카 JSON, 에셋 metadata처럼 분리 가능한 구조에 둔다.
- 에디터, 테마, 내보내기, 플러그인은 모두 같은 노트 분석 모델을 바라본다.
- 플러그인은 파일 시스템 전체 권한을 갖지 않고, 앱이 허용한 노트 컨텍스트와 명령만 사용한다.

## 노트 양식

커스텀 가능한 노트 양식은 YAML 스타일 frontmatter를 기본 확장점으로 둔다.

```md
---
title: Project Memo
tags: [project, idea]
template: meeting-note
---

# Project Memo

본문...
```

이 구조는 나중에 다음 기능으로 확장하기 쉽다.

- 템플릿 스토어
- 테마별 PDF 출력 양식
- 플러그인용 노트 메타데이터
- 태그/백링크/그래프 뷰
- 커스텀 export schema

## 템플릿 확장 방식

워크스페이스 템플릿은 `.markdown-canvas/templates/*.md`에 저장한다. 이 폴더는 파일 트리와 검색 인덱스에서는 숨기지만, 실제 내용은 마크다운 파일로 남긴다.

템플릿의 표시 이름과 설명은 `.markdown-canvas/templates/manifest.json`에 둔다. 본문과 메타데이터를 분리해 두면 사용자가 마크다운 본문을 직접 고쳐도 앱 표시 정보가 안정적으로 유지되고, 나중에 스토어 에셋 manifest와 같은 구조로 확장하기 쉽다.

템플릿은 다음 placeholder를 지원한다.

- `{{title}}`
- `{{date}}`
- `{{datetime}}`

스토어에서 설치한 `TEMPLATE` 에셋도 같은 템플릿 모델로 읽는다. 따라서 기본 템플릿, 워크스페이스 템플릿, 설치형 템플릿은 새 노트 생성 화면에서 동일하게 취급한다.

데스크탑 앱의 템플릿 관리 화면은 워크스페이스 템플릿만 수정한다. 스토어에서 설치된 템플릿은 원본 에셋 무결성을 위해 읽기 전용으로 취급한다.

## 다음 우선순위

1. 전체 검색
2. 태그 필터
3. 백링크 인덱스
4. `Ctrl+P` 빠른 열기
5. 템플릿 생성/적용
6. 플러그인 manifest와 권한 모델

`Ctrl+P` 커맨드 팔레트는 노트 열기, 새 노트/폴더 생성, 템플릿 실행, PDF 출력, 에셋 동기화 같은 앱 명령을 한 표면에서 실행한다. 이후 플러그인 manifest에 등록된 명령도 같은 팔레트에 주입한다.

## 플러그인 manifest

플러그인은 에셋 metadata의 `plugin` 필드로 앱에 자신을 설명한다.

```json
{
  "id": "word-count-reporter",
  "title": "Word Count Reporter",
  "version": "1.0.0",
  "permissions": ["note:read"],
  "entryFile": "plugin.js",
  "commands": [
    {
      "id": "report-current-note",
      "title": "현재 노트 통계 보기"
    }
  ]
}
```

설치된 플러그인 명령은 `Ctrl+P` 커맨드 팔레트에 자동으로 나타난다. 실행 시 앱은 manifest 권한에 맞는 현재 노트와 워크스페이스 컨텍스트만 전달한다.
