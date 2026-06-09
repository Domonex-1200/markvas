# MarkVas & Asset Store System

TypeScript 기반의 포트폴리오용 메모 프로그램 모노레포입니다. 로컬 우선 Electron 마크다운 에디터, NestJS 에셋 스토어 API, Next.js 스토어 웹, Docker 배포와 플러그인 샌드박스 설계를 포함합니다.

## 구조

- `apps/desktop`: Electron + React + Tailwind 데스크톱 앱
- `apps/api`: NestJS + TypeORM + PostgreSQL API
- `apps/store`: Next.js App Router 에셋 스토어
- `packages/shared`: 앱 간 공유 타입
- `docs`: 아키텍처, 보안, 릴리스 문서
- `infra`: Docker 배포 파일

## 실행

```bash
npm install
npm run setup:env
npm run db:up
npm run dev:api
npm run dev:store
npm run dev:desktop
```

환경 변수 구조는 [로컬 환경 설정 문서](docs/environment.md)를 참고하세요.
자세한 설계는 [아키텍처 문서](docs/architecture.md)를 참고하세요.
