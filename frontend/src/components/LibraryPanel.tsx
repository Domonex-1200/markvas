import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { CheckCircle2, Library, PauseCircle, Trash2 } from "lucide-react";
import type { LibraryItem } from "../types";
import { getLibrary, activateLibraryAsset, deactivateLibraryAsset, removeFromLibrary } from "../lib/api";

const TYPE_LABEL: Record<string, string> = {
  THEME: "테마", TEMPLATE: "템플릿", PLUGIN: "플러그인",
};

export function LibraryPanel(): JSX.Element {
  const token = window.localStorage.getItem("accessToken") ?? "";
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setMessage("로그인이 필요합니다."); return; }
    getLibrary(token).then(setItems).catch(() => setMessage("라이브러리를 불러오지 못했습니다."));
  }, [token]);

  async function activate(assetId: string) {
    setBusy(assetId);
    try {
      const updated = await activateLibraryAsset(assetId, token);
      setItems(prev => prev.map(i => i.asset.id === assetId ? { ...i, status: updated.status, activatedAt: updated.activatedAt } : i));
    } catch { /* ignore */ } finally { setBusy(null); }
  }

  async function deactivate(assetId: string) {
    setBusy(assetId);
    try {
      const updated = await deactivateLibraryAsset(assetId, token);
      setItems(prev => prev.map(i => i.asset.id === assetId ? { ...i, status: updated.status } : i));
    } catch { /* ignore */ } finally { setBusy(null); }
  }

  async function remove(assetId: string) {
    if (!confirm("라이브러리에서 삭제하시겠습니까?\n노트 프로그램에 설치된 에셋은 유지되지만 추가 등록은 불가능합니다.")) return;
    setBusy(assetId);
    try {
      await removeFromLibrary(assetId, token);
      setItems(prev => prev.filter(i => i.asset.id !== assetId));
    } catch { /* ignore */ } finally { setBusy(null); }
  }

  if (message) {
    return (
      <p className="rounded-xl p-4 text-sm" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
        {message}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl p-8 text-center text-sm" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
        <Library className="mx-auto mb-3" size={24} style={{ color: "var(--text-muted)" }} />
        라이브러리에 추가된 에셋이 없습니다.
      </div>
    );
  }

  return (
    <section className="grid gap-3">
      {items.map(({ id, asset, status, installedAt }) => {
        const isActive = status === "ACTIVE";
        const isBusy = busy === asset.id;

        return (
          <article key={id} className="rounded-xl p-5" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              {/* 에셋 정보 */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                    {TYPE_LABEL[asset.type] ?? asset.type}
                  </span>
                  {/* 상태 배지 */}
                  {isActive ? (
                    <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
                      style={{ background: "rgba(32,197,188,0.14)", color: "var(--teal)" }}>
                      <CheckCircle2 size={11} />활성
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
                      style={{ background: "rgba(248,169,74,0.14)", color: "#f8a94a" }}>
                      <PauseCircle size={11} />비활성
                    </span>
                  )}
                </div>
                <Link className="mt-1 block text-base font-bold hover:underline" style={{ color: "var(--text-primary)" }} to={`/assets/${asset.id}`}>
                  {asset.title}
                </Link>
                <p className="mt-1.5 text-sm line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                  {asset.metadata?.summary ?? asset.metadata?.description ?? ""}
                </p>
                <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                  추가: {new Date(installedAt).toLocaleDateString("ko-KR")}
                </p>
              </div>

              {/* 액션 버튼 */}
              <div className="flex shrink-0 items-center gap-2">
                {isActive ? (
                  <button
                    className="button-secondary text-sm"
                    disabled={isBusy}
                    onClick={() => void deactivate(asset.id)}
                    type="button"
                  >
                    <PauseCircle size={14} />
                    {isBusy ? "처리 중…" : "비활성화"}
                  </button>
                ) : (
                  <button
                    className="button text-sm"
                    disabled={isBusy}
                    onClick={() => void activate(asset.id)}
                    type="button"
                  >
                    <CheckCircle2 size={14} />
                    {isBusy ? "처리 중…" : "활성화"}
                  </button>
                )}
                <button
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition hover:opacity-80"
                  style={{ background: "rgba(248,113,113,0.12)", color: "#f87171" }}
                  disabled={isBusy}
                  onClick={() => void remove(asset.id)}
                  type="button"
                >
                  <Trash2 size={14} />
                  삭제
                </button>
              </div>
            </div>

            {/* 비활성 안내 */}
            {!isActive && (
              <p className="mt-3 rounded-lg px-3 py-2 text-xs" style={{ background: "rgba(248,169,74,0.08)", color: "#f8a94a", border: "1px solid rgba(248,169,74,0.2)" }}>
                비활성 상태입니다. 활성화하면 노트 프로그램에서 에셋을 설치할 수 있습니다.
              </p>
            )}
          </article>
        );
      })}
    </section>
  );
}
