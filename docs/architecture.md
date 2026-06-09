# Architecture

## 목표

MarkVas는 로컬 마크다운 파일을 직접 다루는 Electron 앱을 중심에 둡니다. 에셋 스토어는 선택 기능이며, 테마와 플러그인을 내려받아 로컬 앱에 동기화합니다.

## 시스템 경계

- Desktop: 로컬 파일 시스템 접근, 편집, PDF/PPTX 추출, 플러그인 샌드박스 실행
- API: 유저, JWT, RBAC, 에셋 메타데이터, 설치 이력
- Store Web: SSR/ISR 기반 에셋 탐색, 로그인, 설치 요청, 장바구니/찜/구매, 앱 다운로드 진입점
- Shared: 파일 트리, 에셋, 인증 타입 계약

## 데이터 흐름

1. 사용자가 Electron에서 워크스페이스 폴더를 선택합니다.
2. Main Process가 `fs/promises`로 `.md` 파일과 폴더를 재귀 스캔합니다.
3. Preload가 `contextBridge`로 제한된 IPC API만 Renderer에 공개합니다.
4. Renderer는 파일 트리를 표시하고 선택한 파일의 내용을 편집합니다.
5. 변경 내용은 debounce 후 Main Process를 통해 원본 `.md` 파일에 저장됩니다.
6. Store에서 설치한 에셋은 현재 MVP에서는 API의 `UserAsset` 이력으로 남고, Electron은 시작 또는 수동 동기화 시 다운로드합니다.
7. 상용 마켓플레이스 단계에서는 구매/무료 설치 권한을 `Entitlement`로 분리하고, 데스크탑 동기화는 권한이 있는 에셋 버전만 내려받습니다.

## 보안 기준

- `nodeIntegration: false`
- `contextIsolation: true`
- `sandbox: true`
- 렌더러는 임의 경로 접근 권한을 갖지 않습니다.
- 플러그인 코드는 Node `vm` 기반 제한 컨텍스트에서 실행되며 `require`, `process`, `Buffer`를 사용할 수 없습니다.

## 확장 포인트

- 에디터: 현재 마크다운 원본 저장 구조를 유지하므로 Milkdown/Lexical 기반 블록 에디터로 교체 가능합니다.
- Export: `---` 슬라이드 구분자를 기준으로 Marp 렌더러를 붙이는 구조로 분리되어 있습니다.
- Store: `metadata.tokens`에 디자인 토큰과 CSS를 저장해 파일 다운로드 없이도 테마 프리뷰가 가능합니다.

## Marketplace Expansion

스토어는 최종적으로 다음 축을 가진 제품 마켓플레이스로 확장합니다.

- 허가된 제작자 등록과 에셋 심사
- 무료/유료 에셋 구매
- 장바구니와 찜하기
- 사용자 라이브러리와 설치 권한
- 메모앱 다운로드와 최신 버전 업데이트
- 에셋 버전별 checksum/signature 검증

세부 도메인 모델은 `docs/store-commerce-roadmap.md`를 기준으로 합니다.
