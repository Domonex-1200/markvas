import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";
import { getMyAssets, submitAssetForReview, deleteAsset } from "../lib/api";
import type { StoreAsset } from "../types";

export default function DeveloperAssetsPage(): JSX.Element {
  const navigate = useNavigate();
  const token = window.localStorage.getItem("accessToken") ?? "";
  const role  = window.localStorage.getItem("role") ?? "";

  const [assets, setAssets]   = useState<StoreAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    if (!token || (role !== "DEVELOPER" && role !== "ADMIN")) {
      navigate("/");
      return;
    }
    getMyAssets(token)
      .then(setAssets)
      .catch(() => setError("에셋 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [token, role, navigate]);

  async function handleSubmit(id: string) {
    setActionId(id);
    try {
      const updated = await submitAssetForReview(id, token);
      setAssets((prev) => prev.map((a) => a.id === id ? updated : a));
    } catch { alert("제출 실패"); }
    finally  { setActionId(null); }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("이 에셋을 삭제하시겠습니까?")) return;
    setActionId(id);
    try {
      await deleteAsset(id, token);
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } catch { alert("삭제 실패"); }
    finally  { setActionId(null); }
  }

  const typeLabel: Record<string, string> = { THEME: "테마", PLUGIN: "플러그인", TEMPLATE: "템플릿" };
  const statusLabel: Record<string, string> = {
    DRAFT: "초안", IN_REVIEW: "심사중", PUBLISHED: "게시됨", REJECTED: "거절됨",
  };
  const statusColor: Record<string, string> = {
    DRAFT:     "bg-slate-100 text-slate-500",
    IN_REVIEW: "bg-yellow-100 text-yellow-700",
    PUBLISHED: "bg-green-100 text-green-700",
    REJECTED:  "bg-red-100 text-red-700",
  };

  return (
    <main style={{ background: "var(--bg-base)" }}>
      <SiteHeader />
      <section className="hero-dark" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-8">
          <div>
            <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>내 에셋</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>등록한 에셋을 관리합니다.</p>
          </div>
          <Link className="button" to="/developer/assets/new">새 에셋 등록</Link>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {loading && <p style={{ color: "var(--text-muted)" }}>불러오는 중…</p>}
        {error   && <p style={{ color: "#f87171" }}>{error}</p>}
        {!loading && !error && assets.length === 0 && (
          <div className="text-center py-16">
            <p className="mb-4" style={{ color: "var(--text-muted)" }}>등록한 에셋이 없습니다.</p>
            <Link className="button" to="/developer/assets/new">첫 에셋 등록하기</Link>
          </div>
        )}
        {assets.length > 0 && (
          <div className="space-y-3">
            {assets.map((asset) => (
              <article
                key={asset.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl p-4"
                style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>{typeLabel[asset.type] ?? asset.type}</span>
                    <p className="font-bold" style={{ color: "var(--text-primary)" }}>{asset.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusColor[asset.status ?? ""] ?? "bg-slate-100 text-slate-500"}`}>
                      {statusLabel[asset.status ?? ""] ?? asset.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    {asset.metadata?.description ?? "설명 없음"}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    등록일: {new Date(asset.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {asset.status === "DRAFT" && (
                    <button
                      className="button text-sm"
                      disabled={actionId === asset.id}
                      onClick={() => handleSubmit(asset.id)}
                    >
                      심사 제출
                    </button>
                  )}
                  <Link className="button-secondary text-sm" to={`/assets/${asset.id}`}>보기</Link>
                  {(asset.status === "DRAFT" || asset.status === "REJECTED") && (
                    <Link className="button-secondary text-sm" to={`/developer/assets/${asset.id}/edit`}>수정</Link>
                  )}
                  <button
                    className="button-secondary text-sm"
                    style={{ borderColor: "rgba(239,68,68,0.4)", color: "#f87171" }}
                    disabled={actionId === asset.id}
                    onClick={() => handleDelete(asset.id)}
                  >
                    삭제
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
