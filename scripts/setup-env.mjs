import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const force = process.argv.includes("--force");

const infraEnvPath = join(root, "infra", ".env");
const apiEnvPath = join(root, "apps", "api", ".env");

const infraEnv = force ? {} : readEnv(infraEnvPath);
const apiEnv = force ? {} : readEnv(apiEnvPath);

const postgresPassword =
  infraEnv.POSTGRES_PASSWORD ?? extractPostgresPassword(apiEnv.DATABASE_URL) ?? randomSecret(18);
const accessSecret = infraEnv.JWT_ACCESS_SECRET ?? apiEnv.JWT_ACCESS_SECRET ?? randomSecret(48);
const refreshSecret = infraEnv.JWT_REFRESH_SECRET ?? apiEnv.JWT_REFRESH_SECRET ?? randomSecret(48);

writeEnv(
  infraEnvPath,
  {
    POSTGRES_PASSWORD: postgresPassword,
    JWT_ACCESS_SECRET: accessSecret,
    JWT_REFRESH_SECRET: refreshSecret
  },
  "Docker Compose"
);

writeEnv(
  apiEnvPath,
  {
    NODE_ENV: apiEnv.NODE_ENV ?? "development",
    PORT: apiEnv.PORT ?? "3001",
    DATABASE_URL: `postgres://postgres:${postgresPassword}@127.0.0.1:5432/markdown_canvas`,
    JWT_ACCESS_SECRET: accessSecret,
    JWT_REFRESH_SECRET: refreshSecret,
    JWT_ACCESS_TTL: apiEnv.JWT_ACCESS_TTL ?? "900s",
    JWT_REFRESH_TTL: apiEnv.JWT_REFRESH_TTL ?? "30d"
  },
  "NestJS API"
);

console.log("");
console.log("Local environment files are ready.");
console.log("Run `npm run db:up` next, then `npm run dev:api`.");

function randomSecret(bytes) {
  return randomBytes(bytes).toString("base64url");
}

function readEnv(path) {
  if (!existsSync(path)) return {};

  return readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .reduce((values, line) => {
      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) return values;
      values[line.slice(0, separatorIndex)] = line.slice(separatorIndex + 1);
      return values;
    }, {});
}

function writeEnv(path, values, label) {
  mkdirSync(dirname(path), { recursive: true });
  const content = `${Object.entries(values)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n")}
`;

  writeFileSync(path, content, "utf8");
  console.log(`${force ? "Regenerated" : "Synced"} ${label} env: ${path}`);
}

function extractPostgresPassword(databaseUrl) {
  if (!databaseUrl) return undefined;
  try {
    return new URL(databaseUrl).password || undefined;
  } catch {
    return undefined;
  }
}
