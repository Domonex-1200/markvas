# MarkVas — 개발 환경 셋업 가이드

> 다른 컴퓨터에서 처음 시작할 때 이 문서를 순서대로 따라하면 됩니다.

---

## 1. 필수 설치 항목

| 도구 | 버전 | 설치 링크 |
|---|---|---|
| **Node.js** | 20.11.0 이상 (LTS) | https://nodejs.org |
| **npm** | 10.0.0 이상 (Node.js 포함) | — |
| **Git** | 최신 | https://git-scm.com |
| **Docker Desktop** | 최신 | https://www.docker.com/products/docker-desktop (API DB용) |
| **VS Code** (선택) | 최신 | https://code.visualstudio.com |

> Windows 사용 시: **PowerShell 7** 또는 **Git Bash** 사용 권장

---

## 2. 프로젝트 클론

```bash
git clone https://github.com/Domonex-1200/note_project_semi.git
cd note_project_semi
```

---

## 3. 의존성 설치

루트에서 한 번만 실행하면 워크스페이스 전체가 설치됩니다.

```bash
npm install
```

> `node_modules`가 루트 + 각 앱 디렉터리에 생성됩니다.

---

## 4. 환경변수 파일 생성

### 4-1. API 서버 (`apps/api/.env`)

```bash
# apps/api/ 폴더 안에 .env 파일 생성
DATABASE_URL=postgresql://mcuser:mcpassword@localhost:5432/markdown_canvas
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=development
```

### 4-2. Next.js 스토어 (`apps/store/.env.local`) — 선택

```bash
# apps/store/ 폴더 안에 .env.local 생성
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

---

## 5. PostgreSQL 데이터베이스 실행 (Docker)

```bash
# 루트 디렉터리에서 실행
npm run db:up
```

정상 실행 확인:

```bash
npm run db:logs
# "database system is ready to accept connections" 메시지 확인
```

> Docker Desktop이 실행 중이어야 합니다.

---

## 6. 각 앱 실행

터미널을 **3개** 열고 각각 실행합니다.

### 터미널 1 — NestJS API 서버

```bash
npm run dev:api
# http://localhost:3001 에서 실행됨
# 첫 실행 시 DB 테이블 자동 생성 (TypeORM synchronize)
```

### 터미널 2 — Next.js 에셋 스토어

```bash
npm run dev:store
# http://localhost:3000 에서 실행됨
```

### 터미널 3 — Electron 데스크톱 앱

```bash
npm run dev:desktop
# Electron 창이 열림
```

---

## 7. 기술 스택 요약

### Desktop (`apps/desktop/`)

| 항목 | 버전 |
|---|---|
| Electron | 33.x |
| React | 18.3.1 |
| TypeScript | 5.6.x |
| Vite / electron-vite | 5.4.x / 2.3.x |
| Tailwind CSS | 3.4.x |
| highlight.js | 11.x |
| lucide-react | 0.468.x |

### API (`apps/api/`)

| 항목 | 버전 |
|---|---|
| NestJS | 10.x |
| TypeORM | 0.3.x |
| PostgreSQL | 15+ (Docker) |
| JWT (Passport) | — |

### Store (`apps/store/`)

| 항목 | 버전 |
|---|---|
| Next.js | 14.x (App Router) |
| Tailwind CSS | 3.x |

---

## 8. 디렉터리 구조

```
note_project_semi/
├── apps/
│   ├── desktop/          ← Electron 데스크톱 앱
│   │   ├── src/
│   │   │   ├── main/     ← Main 프로세스 (파일시스템, IPC, 프로토콜)
│   │   │   ├── preload/  ← Context Bridge API
│   │   │   └── renderer/ ← React UI
│   │   └── out/          ← 빌드 결과물
│   ├── api/              ← NestJS 백엔드
│   │   └── src/
│   │       ├── auth/     ← JWT 인증
│   │       ├── assets/   ← 에셋 스토어 CRUD
│   │       └── releases/ ← 앱 배포 관리
│   └── store/            ← Next.js 프론트엔드
│       ├── app/          ← App Router 페이지
│       └── src/
│           └── components/
├── packages/
│   └── shared/           ← 공용 TypeScript 타입
├── infra/
│   └── docker-compose.yml
└── docs/                 ← 문서 모음
```

---

## 9. 주요 npm 스크립트

| 명령 | 설명 |
|---|---|
| `npm install` | 전체 의존성 설치 |
| `npm run db:up` | PostgreSQL Docker 컨테이너 시작 |
| `npm run db:down` | PostgreSQL 컨테이너 중지 |
| `npm run dev:desktop` | Electron 앱 개발 모드 실행 |
| `npm run dev:api` | NestJS API 서버 실행 |
| `npm run dev:store` | Next.js 스토어 실행 |
| `npm run build` | 전체 워크스페이스 프로덕션 빌드 |
| `npm run check` | 전체 TypeScript 타입 검사 |

---

## 10. 구현된 주요 기능 목록

### 데스크톱 앱

| 기능 | 단축키 |
|---|---|
| 워크스페이스 열기 / 온보딩 | 첫 화면 버튼 |
| 빠른 노트 만들기 | `Ctrl+N` |
| 커맨드 팔레트 | `Ctrl+P` |
| 에디터 내 검색/바꾸기 | `Ctrl+F` |
| 서식 명령 팔레트 | `Ctrl+/` |
| 굵게 / 기울임 / 링크 | `Ctrl+B / I / K` |
| 편집 / 분할 / 미리보기 토글 | 툴바 버튼 |
| `[[내부 링크]]` 이동 | 미리보기에서 클릭 |
| 체크박스 토글 | 미리보기에서 클릭 |
| 이미지 삽입 | 에디터에 드래그 앤 드롭 / `Ctrl+V` 붙여넣기 |
| 코드 하이라이팅 | 미리보기 자동 적용 |
| 파일 다중 선택 | `Shift+클릭` |
| 태그 관리 | 검색 패널 ⚙️ 아이콘 |
| 워크스페이스 설정 | 툴바 ⚙️ 아이콘 |

---

## 11. 트러블슈팅

### `npm install` 실패
```bash
# npm 캐시 초기화 후 재시도
npm cache clean --force
npm install
```

### Electron 앱이 흰 화면
```bash
# Vite dev server가 먼저 실행됐는지 확인
# dev:desktop 실행 전 잠시 대기 후 다시 시도
npm run dev:desktop
```

### DB 연결 오류 (API)
```bash
# Docker가 실행 중인지 확인
docker ps
# 안 되면 db 재시작
npm run db:down && npm run db:up
```

### 포트 충돌
- API: 3001 포트 → `apps/api/.env`에서 `PORT=3002`로 변경
- Store: 3000 포트 → `next.config.mjs`에서 수정

### Windows에서 이미지 경로 오류
- 이미지 경로에 한글/특수문자가 포함된 경우 `assets/` 폴더 아래에 복사 후 삽입 권장
