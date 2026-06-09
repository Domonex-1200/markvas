/**
 * 영구 설정 스토리지 추상화 레이어.
 *
 * - 동기 읽기: localStorage (빠름, 앱 세션 내 유효)
 * - 비동기 쓰기: localStorage + electron-store (userData/app-store.json)
 *
 * electron-store 쪽은 앱 재설치 후에도 설정이 복원되도록 하기 위함.
 * 앱 최초 실행 시 syncFromElectronStore()로 electron-store → localStorage를 동기화.
 */

export function storageGet(key: string): string | null {
  return window.localStorage.getItem(key);
}

export function storageSet(key: string, value: string): void {
  window.localStorage.setItem(key, value);
  void window.markdownCanvas.storeSet(key, value).catch(() => undefined);
}

export function storageDelete(key: string): void {
  window.localStorage.removeItem(key);
  void window.markdownCanvas.storeDelete(key).catch(() => undefined);
}

/**
 * 앱 시작 시 한 번 호출.
 * electron-store(userData) → localStorage 방향으로 데이터를 복사한다.
 * 이미 localStorage에 값이 있으면 덮어쓰지 않는다 (세션이 더 신선함).
 */
export async function syncFromElectronStore(): Promise<void> {
  try {
    const stored = await window.markdownCanvas.storeGetAll();
    for (const [key, value] of Object.entries(stored)) {
      if (value === null || value === undefined) continue;
      // localStorage에 이미 값이 있으면 유지 (현재 세션 우선)
      if (window.localStorage.getItem(key) !== null) continue;
      const serialized = typeof value === "string" ? value : JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
    }
  } catch {
    // electron-store 접근 불가 시 localStorage만 사용
  }
}
