# Security

## Electron

`BrowserWindow`는 `sandbox`, `contextIsolation`, `nodeIntegration: false`를 기본값으로 둡니다. 파일 시스템 접근은 Main Process의 IPC handler만 수행합니다.

## IPC

Preload는 다음 API만 노출합니다.

- `pickWorkspace`
- `readWorkspaceTree`
- `readWorkspaceDocuments`
- `readMarkdown`
- `saveMarkdown`
- `createMarkdown`
- `createMarkdownFromTemplate`
- `createFolder`
- `renameEntry`
- `deleteEntry`
- `moveEntry`
- `readTemplates`
- `saveTemplate`
- `deleteTemplate`
- `syncAssets`
- `getLocalThemeCss`
- `readPlugins`
- `runPluginCommand`
- `runPlugin`

Renderer가 직접 `fs`, `child_process`, `net` 같은 Node API를 호출할 수 없게 설계했습니다.

## Plugin Sandbox

외부 플러그인은 앱의 전체 파일 시스템을 수정할 수 없어야 합니다. 현재 구현은 `node:vm`으로 독립 컨텍스트를 만들고 아래 전역을 막습니다.

- `require`
- `process`
- `Buffer`
- `global`
- `module`
- `exports`

플러그인은 `metadata.plugin` manifest로 명령과 권한을 선언합니다.

- `note:read`: 현재 노트 본문 전달 허용
- `note:write`: 향후 노트 수정 명령 허용을 위한 예약 권한
- `workspace:read`: 워크스페이스 경로 전달 허용

커맨드 팔레트에는 manifest에 등록된 명령만 노출합니다. 실행 시 앱은 권한에 맞는 컨텍스트만 샌드박스에 전달합니다.

상용 환경에서는 서명 검증, SHA-256 checksum 검증, worker thread 격리, timeout telemetry를 추가하세요.

## API

- 비밀번호: bcrypt 12 rounds
- Access Token: 짧은 TTL
- Refresh Token: DB에는 hash만 저장
- RBAC: `DEVELOPER`, `ADMIN`만 에셋 생성 가능
- 에셋 디자인 설정: DB `jsonb` metadata에 토큰 형태로 저장
