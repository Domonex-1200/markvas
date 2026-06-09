import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";
import {
  getAdminDeveloperApplications,
  reviewDeveloperApplication,
  getReviewAssets,
  approveAsset,
  rejectAsset,
  deleteAsset,
} from "../lib/api";
import type { DeveloperApplication, StoreAsset } from "../types";

type Tab = "applications" | "assets" | "users";

export default function AdminPage(): JSX.Element {
  const navigate = useNavigate();
  const token = window.localStorage.getItem("accessToken") ?? "";
  const role  = window.localStorage.getItem("role") ?? "";

  const [tab, setTab] = useState<Tab>("applications");

  useEffect(() => {
    if (!token || role !== "ADMIN") {
      navigate("/");
    }
  }, [token, role, navigate]);

  return (
    <main>
      <SiteHeader />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <h1 className="text-3xl font-black">관리자 대시보드</h1>
          <p className="mt-1 text-sm text-slate-500">개발자 신청, 에셋 심사, 사용자 관리를 합니다.</p>
        </div>
      </section>

      {/* 탭 */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl gap-0 px-6">
          {(["applications", "assets"] as Tab[]).map((t) => (
            <button
              key={t}
              className={`border-b-2 px-5 py-3 text-sm font-bold transition-colors ${
                tab === t
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
              onClick={() => setTab(t)}
            >
              {t === "applications" ? "개발자 신청" : "에셋 심사"}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {tab === "applications" && <ApplicationsTab token={token} />}
        {tab === "assets"       && <AssetsTab token={token} />}
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 개발자 신청 탭
// ─────────────────────────────────────────────────────────────────────────────
function ApplicationsTab({ token }: { token: string }) {
  const [apps, setApps]     = useState<DeveloperApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [noteMap, setNoteMap]   = useState<Record<string, string>>({});

  useEffect(() => {
    getAdminDeveloperApplications(token, "PENDING")
      .then(setApps)
      .catch(() => setError("신청 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [token]);

  async function review(appId: string, approve: boolean) {
    setActionId(appId);
    try {
      await reviewDeveloperApplication(appId, approve, noteMap[appId] ?? "", token);
      setApps((prev) => prev.filter((a) => a.id !== appId));
    } catch {
      alert("처리에 실패했습니다.");
    } finally {
      setActionId(null);
    }
  }

  if (loading) return <p className="text-slate-500">불러오는 중…</p>;
  if (error)   return <p className="text-red-500">{error}</p>;
  if (apps.length === 0)
    return <p className="text-slate-500">대기 중인 개발자 신청이 없습니다.</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">총 {apps.length}건의 대기 신청이 있습니다.</p>
      {apps.map((app) => (
        <article key={app.id} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-bold">{app.userNickname ?? app.userEmail}</p>
              <p className="text-xs text-slate-400">{app.userEmail}</p>
              <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{app.reason}</p>
              <p className="mt-1 text-xs text-slate-400">
                신청일: {new Date(app.appliedAt).toLocaleDateString("ko-KR")}
              </p>
            </div>
            <StatusBadge status={app.status} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <input
              className="field-input flex-1 text-sm"
              placeholder="관리자 메모 (선택)"
              value={noteMap[app.id] ?? ""}
              onChange={(e) => setNoteMap((prev) => ({ ...prev, [app.id]: e.target.value }))}
            />
            <button
              className="button text-sm"
              disabled={actionId === app.id}
              onClick={() => review(app.id, true)}
            >
              승인
            </button>
            <button
              className="button-secondary border-red-200 text-red-600 hover:bg-red-50 text-sm"
              disabled={actionId === app.id}
              onClick={() => review(app.id, false)}
            >
              거절
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 에셋 심사 탭
// ─────────────────────────────────────────────────────────────────────────────
function AssetsTab({ token }: { token: string }) {
  const [assets, setAssets] = useState<StoreAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    getReviewAssets(token)
      .then(setAssets)
      .catch(() => setError("에셋 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleApprove(id: string) {
    setActionId(id);
    try {
      const updated = await approveAsset(id, token);
      setAssets((prev) => prev.map((a) => a.id === id ? updated : a));
    } catch { alert("처리 실패"); }
    finally  { setActionId(null); }
  }

  async function handleReject(id: string) {
    setActionId(id);
    try {
      const updated = await rejectAsset(id, token);
      setAssets((prev) => prev.map((a) => a.id === id ? updated : a));
    } catch { alert("처리 실패"); }
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

  if (loading) return <p className="text-slate-500">불러오는 중…</p>;
  if (error)   return <p className="text-red-500">{error}</p>;
  if (assets.length === 0)
    return <p className="text-slate-500">에셋이 없습니다.</p>;

  const reviewPending = assets.filter((a) => a.status === "IN_REVIEW");
  const others        = assets.filter((a) => a.status !== "IN_REVIEW");

  return (
    <div className="space-y-6">
      {reviewPending.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-500">심사 대기 ({reviewPending.length})</h3>
          <div className="space-y-3">
            {reviewPending.map((asset) => (
              <AssetRow
                key={asset.id}
                asset={asset}
                disabled={actionId === asset.id}
                onApprove={() => handleApprove(asset.id)}
                onReject={() => handleReject(asset.id)}
                onDelete={() => handleDelete(asset.id)}
              />
            ))}
          </div>
        </div>
      )}
      {others.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-500">전체 에셋 ({others.length})</h3>
          <div className="space-y-3">
            {others.map((asset) => (
              <AssetRow
                key={asset.id}
                asset={asset}
                disabled={actionId === asset.id}
                onApprove={() => handleApprove(asset.id)}
                onReject={() => handleReject(asset.id)}
                onDelete={() => handleDelete(asset.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AssetRow({
  asset,
  disabled,
  onApprove,
  onReject,
  onDelete,
}: {
  asset: StoreAsset;
  disabled: boolean;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}) {
  const typeLabel: Record<string, string> = { THEME: "테마", PLUGIN: "플러그인", TEMPLATE: "템플릿" };
  return (
    <article className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400">{typeLabel[asset.type] ?? asset.type}</span>
          <p className="font-bold truncate">{asset.title}</p>
          <StatusBadge status={asset.status ?? ""} />
        </div>
        <p className="mt-1 text-xs text-slate-400 truncate">
          {asset.metadata?.description ?? "설명 없음"}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {asset.status === "IN_REVIEW" && (
          <>
            <button className="button text-sm" disabled={disabled} onClick={onApprove}>승인</button>
            <button className="button-secondary text-sm border-yellow-300 text-yellow-700 hover:bg-yellow-50" disabled={disabled} onClick={onReject}>거절</button>
          </>
        )}
        <Link className="button-secondary text-sm" to={`/assets/${asset.id}`}>보기</Link>
        <button className="button-secondary text-sm border-red-200 text-red-600 hover:bg-red-50" disabled={disabled} onClick={onDelete}>삭제</button>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING:   "bg-yellow-100 text-yellow-700",
    APPROVED:  "bg-blue-100 text-blue-700",
    REJECTED:  "bg-red-100 text-red-700",
    DRAFT:     "bg-slate-100 text-slate-600",
    IN_REVIEW: "bg-yellow-100 text-yellow-700",
    PUBLISHED: "bg-green-100 text-green-700",
  };
  const label: Record<string, string> = {
    PENDING:   "대기",
    APPROVED:  "승인",
    REJECTED:  "거절",
    DRAFT:     "초안",
    IN_REVIEW: "심사중",
    PUBLISHED: "게시됨",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${map[status] ?? "bg-slate-100 text-slate-500"}`}>
      {label[status] ?? status}
    </span>
  );
}