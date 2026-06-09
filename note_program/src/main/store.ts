/**
 * 경량 JSON 파일 기반 앱 설정 저장소.
 * electron-store v10은 ESM-only라 main 프로세스 번들 충돌 가능성이 있으므로
 * node:fs/promises 기반 자체 구현을 사용합니다.
 * 저장 위치: {userData}/app-store.json
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { app } from "electron";

let storeData: Record<string, unknown> = {};
let storePath = "";

export async function initStore(): Promise<void> {
  storePath = path.join(app.getPath("userData"), "app-store.json");
  try {
    const raw = await readFile(storePath, "utf8");
    storeData = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    storeData = {};
  }
}

async function persistStore(): Promise<void> {
  try {
    await mkdir(path.dirname(storePath), { recursive: true });
    await writeFile(storePath, JSON.stringify(storeData, null, 2), "utf8");
  } catch {
    /* 저장 실패 시 다음 기회에 재시도 — 앱 동작에는 영향 없음 */
  }
}

export function storeGetAll(): Record<string, unknown> {
  return { ...storeData };
}

export async function storeSet(key: string, value: unknown): Promise<void> {
  storeData[key] = value;
  await persistStore();
}

export async function storeDelete(key: string): Promise<void> {
  delete storeData[key];
  await persistStore();
}
