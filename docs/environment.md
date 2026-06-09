# Local Environment Setup

## 원칙

실제 비밀값은 Git에 올리지 않습니다.

- `.env.example`: 공유 가능한 예시 파일
- `.env`: 내 PC에서만 쓰는 실제 비밀값
- `npm run setup:env`: 실제 `.env` 파일 자동 생성 및 동기화

## 생성되는 파일

`npm run setup:env`는 두 파일을 만듭니다.

- `infra/.env`: Docker Compose가 읽는 DB/JWT 값
- `apps/api/.env`: NestJS API가 읽는 DB/JWT 값

두 파일의 JWT secret은 반드시 같아야 하며, DB password도 서로 맞아야 합니다. 스크립트가 이 값을 자동으로 맞춥니다.

## 처음 실행

```bash
npm install
npm run setup:env
npm run db:up
npm run dev:api
```

## 비밀값을 새로 발급하고 싶을 때

```bash
npm run setup:env -- --force
```

이미 DB 볼륨이 만들어진 뒤 `POSTGRES_PASSWORD`를 바꾸면 기존 DB 컨테이너와 비밀번호가 맞지 않을 수 있습니다. 개발 DB를 완전히 초기화하려면 아래 명령으로 볼륨까지 삭제한 뒤 다시 켭니다.

```bash
docker compose --env-file infra/.env -f infra/docker-compose.yml down -v
npm run db:up
```
