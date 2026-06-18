import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  ChevronDown,
  FileCheck2,
  Package,
  Rocket,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import {
  getAdminDeveloperApplications,
  reviewDeveloperApplication,
  getReviewAssets,
  approveAsset,
  rejectAsset,
  deleteAsset,
  getAppReleases,
  createAppRelease,
  getAllUsers,
  changeUserRole,
  setUserActive,
  getAdminStats,
  type AdminStats,
} from "../lib/api";
import type { AppRelease, DeveloperApplication, StoreAsset, UserProfile } from "../types";

type Section = "overview" | "users" | "applications" | "assets" | "releases";

const NAV: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "overview",      label: "대시보드",      icon: <BarChart3 size={16} /> },
  { id: "users",         label: "사용자 관리",    icon: <Users size={16} /> },
  { id: "applications",  label: "개발자 신청",    icon: <FileCheck2 size={16} /> },
  { id: "assets",        label: "에셋 심사",      icon: <Package size={16} /> },
  { id: "releases",      label: "릴리즈 관리",    icon: <Rocket size={16} /> },
];

export default function AdminPage(): JSX.Element {
  const navigate  = useNavigate();
  const token     = window.localStorage.getItem("accessToken") ?? "";
  const role      = window.localStorage.getItem("role") ?? "";
  const [section, setSection] = useState<Section>("overview");

  useEffect(() => {
    if (!token || role !== "ADMIN") navigate("/");
  }, [token, role, navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-0 px-4 py-6 sm:px-6">

        {/* 사이드바 */}
        <aside className="mr-6 hidden w-52 shrink-0 lg:block">
          <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            <p className="mb-1 px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">관리자 메뉴</p>
            <nav className="flex flex-col gap-0.5">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    section === item.id
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* 모바일 탭 */}
        <div className="mb-4 flex gap-1 overflow-x-auto lg:hidden">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                section === item.id ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* 메인 콘텐츠 */}
        <main className="min-w-0 flex-1">
          <div className="mb-5 flex items-center gap-3">
            <Shield size={20} className="text-blue-600" />
            <div>
              <h1 className="text-xl font-black text-slate-900">{NAV.find(n => n.id === section)?.label}</h1>
              <p className="text-xs text-slate-400">관리자 전용 영역</p>
            </div>
          </div>

          {section === "overview"     && <OverviewSection token={token} onNav={setSection} />}
          {section === "users"        && <UsersSection token={token} />}
          {section === "applications" && <ApplicationsSection token={token} />}
          {section === "assets"       && <AssetsSection token={token} />}
          {section === "releases"     && <ReleasesSection token={token} />}
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 대시보드 개요
// ─────────────────────────────────────────────────────────────────────────────
function OverviewSection({ token, onNav }: { token: string; onNav: (s: Section) => void }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats(token).then(setStats).finally(() => setLoading(false));
  }, [token]);

  const cards = stats ? [
    { label: "전체 사용자",    value: stats.totalUsers,           color: "bg-blue-50 text-blue-700",    nav: "users" as Section },
    { label: "개발자",         value: stats.developers,           color: "bg-violet-50 text-violet-700", nav: "users" as Section },
    { label: "에셋 (게시됨)",  value: stats.publishedAssets,      color: "bg-green-50 text-green-700",  nav: "assets" as Section },
    { label: "심사 대기",      value: stats.inReviewAssets,       color: "bg-yellow-50 text-yellow-700",nav: "assets" as Section },
    { label: "개발자 신청 대기",value: stats.pendingApplications, color: "bg-orange-50 text-orange-700",nav: "applications" as Section },
    { label: "전체 에셋",      value: stats.totalAssets,          color: "bg-slate-50 text-slate-700",  nav: "assets" as Section },
  ] : [];

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <button
              key={card.label}
              onClick={() => onNav(card.nav)}
              className={`rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md`}
            >
              <p className="text-sm font-semibold text-slate-500">{card.label}</p>
              <p className={`mt-2 text-3xl font-black ${card.color.split(" ")[1]}`}>{card.value}</p>
            </button>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 font-bold text-slate-700">빠른 이동</h3>
        <div className="flex flex-wrap gap-2">
          {NAV.filter(n => n.id !== "overview").map(n => (
            <button
              key={n.id}
              onClick={() => onNav(n.id)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
            >
              {n.icon}
              {n.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 사용자 관리
// ─────────────────────────────────────────────────────────────────────────────
function UsersSection({ token }: { token: string }) {
  const [users, setUsers]   = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]   = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [changingId, setChangingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    getAllUsers(token).then(setUsers).finally(() => setLoading(false));
  }, [token]);

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const q = query.trim().toLowerCase();
    const matchQ = !q || u.email.toLowerCase().includes(q) || (u.nickname ?? "").toLowerCase().includes(q);
    return matchRole && matchQ;
  });

  async function handleRoleChange(userId: string, newRole: string) {
    if (!window.confirm(`역할을 ${newRole}(으)로 변경하시겠습니까?`)) return;
    setChangingId(userId);
    try {
      const updated = await changeUserRole(userId, newRole, token);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: updated.role } : u));
    } catch {
      alert("역할 변경에 실패했습니다.");
    } finally {
      setChangingId(null);
    }
  }

  async function handleToggleActive(userId: string, currentlyActive: boolean) {
    const action = currentlyActive ? "비활성화" : "활성화";
    if (!window.confirm(`이 사용자를 ${action}하시겠습니까?`)) return;
    setTogglingId(userId);
    try {
      const updated = await setUserActive(userId, !currentlyActive, token);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: updated.active, deactivatedAt: updated.deactivatedAt } : u));
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? `${action}에 실패했습니다.`);
    } finally {
      setTogglingId(null);
    }
  }

  const roleOptions = ["USER", "DEVELOPER", "ADMIN"];
  const roleColor: Record<string, string> = {
    USER:      "bg-slate-100 text-slate-600",
    DEVELOPER: "bg-violet-100 text-violet-700",
    ADMIN:     "bg-blue-100 text-blue-700",
  };
  const roleLabel: Record<string, string> = { USER: "일반", DEVELOPER: "개발자", ADMIN: "관리자" };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm focus-within:border-blue-400">
          <Search size={15} className="text-slate-400" />
          <input className="flex-1 outline-none placeholder:text-slate-400" placeholder="이메일 또는 닉네임 검색" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="ALL">전체 역할</option>
          {roleOptions.map(r => <option key={r} value={r}>{roleLabel[r]}</option>)}
        </select>
        <span className="text-sm text-slate-400">{filtered.length}명</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState message="사용자가 없습니다." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">사용자</th>
                <th className="px-4 py-3">역할</th>
                <th className="px-4 py-3 hidden sm:table-cell">가입일</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className={`hover:bg-slate-50 ${!u.active ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${u.active ? "bg-slate-200 text-slate-600" : "bg-red-100 text-red-400"}`}>
                        {(u.nickname ?? u.email)[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate font-semibold text-slate-800">{u.nickname ?? "—"}</p>
                          {!u.active && <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-500">비활성</span>}
                        </div>
                        <p className="truncate text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${roleColor[u.role] ?? "bg-slate-100"}`}>
                      {roleLabel[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-slate-400 sm:table-cell">
                    {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {u.role !== "ADMIN" && (
                        <button
                          disabled={togglingId === u.id}
                          onClick={() => void handleToggleActive(u.id, u.active)}
                          className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                            u.active
                              ? "border-red-200 text-red-600 hover:bg-red-50"
                              : "border-green-200 text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {togglingId === u.id ? "처리 중…" : u.active ? "비활성화" : "활성화"}
                        </button>
                      )}
                      <RoleDropdown
                        current={u.role}
                        options={roleOptions}
                        roleLabel={roleLabel}
                        disabled={changingId === u.id || !u.active}
                        onChange={(newRole) => void handleRoleChange(u.id, newRole)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RoleDropdown({ current, options, roleLabel, disabled, onChange }: {
  current: string;
  options: string[];
  roleLabel: Record<string, string>;
  disabled: boolean;
  onChange: (role: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block text-left">
      <button
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50"
      >
        {disabled ? "변경 중…" : "변경"}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-28 rounded-lg border border-slate-200 bg-white shadow-lg">
          {options.filter(r => r !== current).map(r => (
            <button
              key={r}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => { setOpen(false); onChange(r); }}
            >
              {roleLabel[r]}으로 변경
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 개발자 신청
// ─────────────────────────────────────────────────────────────────────────────
function ApplicationsSection({ token }: { token: string }) {
  const [apps, setApps]         = useState<DeveloperApplication[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<"PENDING" | "ALL">("PENDING");
  const [actionId, setActionId] = useState<string | null>(null);
  const [noteMap, setNoteMap]   = useState<Record<string, string>>({});

  useEffect(() => {
    setLoading(true);
    getAdminDeveloperApplications(token, filter === "PENDING" ? "PENDING" : undefined)
      .then(setApps)
      .finally(() => setLoading(false));
  }, [token, filter]);

  async function review(appId: string, approve: boolean) {
    setActionId(appId);
    try {
      const updated = await reviewDeveloperApplication(appId, approve, noteMap[appId] ?? "", token);
      setApps(prev => prev.map(a => a.id === appId ? updated : a).filter(a => filter !== "PENDING" || a.status === "PENDING"));
    } catch { alert("처리에 실패했습니다."); }
    finally { setActionId(null); }
  }

  const statusColor: Record<string, string> = {
    PENDING:  "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };
  const statusLabel: Record<string, string> = { PENDING: "대기", APPROVED: "승인", REJECTED: "거절" };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["PENDING", "ALL"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${filter === f ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            {f === "PENDING" ? "대기 중" : "전체"}
          </button>
        ))}
      </div>

      {loading ? <div className="h-32 animate-pulse rounded-xl bg-slate-200" /> :
       apps.length === 0 ? <EmptyState message={filter === "PENDING" ? "대기 중인 신청이 없습니다." : "신청 내역이 없습니다."} /> : (
        <div className="space-y-3">
          {apps.map(app => (
            <article key={app.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800">{app.userNickname ?? app.userEmail}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusColor[app.status] ?? ""}`}>{statusLabel[app.status] ?? app.status}</span>
                  </div>
                  <p className="text-xs text-slate-400">{app.userEmail}</p>
                  <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{app.reason}</p>
                  <p className="mt-1 text-xs text-slate-400">신청일: {new Date(app.appliedAt).toLocaleDateString("ko-KR")}</p>
                  {app.reviewNote && <p className="mt-1 text-xs text-slate-500">메모: {app.reviewNote}</p>}
                </div>
              </div>
              {app.status === "PENDING" && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <input
                    className="h-9 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
                    placeholder="관리자 메모 (선택)"
                    value={noteMap[app.id] ?? ""}
                    onChange={e => setNoteMap(prev => ({ ...prev, [app.id]: e.target.value }))}
                  />
                  <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50" disabled={actionId === app.id} onClick={() => void review(app.id, true)}>승인</button>
                  <button className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50" disabled={actionId === app.id} onClick={() => void review(app.id, false)}>거절</button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 에셋 심사
// ─────────────────────────────────────────────────────────────────────────────
function AssetsSection({ token }: { token: string }) {
  const [assets, setAssets]     = useState<StoreAsset[]>([]);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("IN_REVIEW");
  const [query, setQuery]       = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    getReviewAssets(token).then(setAssets).finally(() => setLoading(false));
  }, [token]);

  const filtered = assets.filter(a => {
    const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
    const q = query.trim().toLowerCase();
    const matchQ = !q || a.title.toLowerCase().includes(q);
    return matchStatus && matchQ;
  });

  async function handleApprove(id: string) {
    setActionId(id);
    try { const u = await approveAsset(id, token); setAssets(prev => prev.map(a => a.id === id ? u : a)); }
    catch { alert("처리 실패"); } finally { setActionId(null); }
  }
  async function handleReject(id: string) {
    setActionId(id);
    try { const u = await rejectAsset(id, token); setAssets(prev => prev.map(a => a.id === id ? u : a)); }
    catch { alert("처리 실패"); } finally { setActionId(null); }
  }
  async function handleDelete(id: string) {
    if (!window.confirm("이 에셋을 삭제하시겠습니까?")) return;
    setActionId(id);
    try { await deleteAsset(id, token); setAssets(prev => prev.filter(a => a.id !== id)); }
    catch { alert("삭제 실패"); } finally { setActionId(null); }
  }

  const statusOpts = [
    { value: "IN_REVIEW", label: "심사 대기" },
    { value: "PUBLISHED", label: "게시됨" },
    { value: "REJECTED",  label: "거절됨" },
    { value: "DRAFT",     label: "초안" },
    { value: "ALL",       label: "전체" },
  ];
  const statusColor: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-600", IN_REVIEW: "bg-yellow-100 text-yellow-700",
    PUBLISHED: "bg-green-100 text-green-700", REJECTED: "bg-red-100 text-red-700",
  };
  const typeLabel: Record<string, string> = { THEME: "테마", PLUGIN: "플러그인", TEMPLATE: "템플릿" };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm focus-within:border-blue-400">
          <Search size={15} className="text-slate-400" />
          <input className="flex-1 outline-none placeholder:text-slate-400" placeholder="에셋 이름 검색" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {statusOpts.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition ${statusFilter === opt.value ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="text-sm text-slate-400">{filtered.length}개</span>
      </div>

      {loading ? <div className="h-32 animate-pulse rounded-xl bg-slate-200" /> :
       filtered.length === 0 ? <EmptyState message="에셋이 없습니다." /> : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">에셋</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3 hidden sm:table-cell">등록일</th>
                <th className="px-4 py-3 text-right">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(asset => (
                <tr key={asset.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{asset.title}</p>
                    <p className="text-xs text-slate-400">{typeLabel[asset.type] ?? asset.type}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusColor[asset.status ?? ""] ?? "bg-slate-100"}`}>
                      {statusOpts.find(o => o.value === asset.status)?.label ?? asset.status}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-slate-400 sm:table-cell">
                    {new Date(asset.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Link className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50" to={`/assets/${asset.id}`}>보기</Link>
                      {asset.status === "IN_REVIEW" && (
                        <>
                          <button className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50" disabled={actionId === asset.id} onClick={() => void handleApprove(asset.id)}>승인</button>
                          <button className="rounded-lg border border-yellow-300 px-2.5 py-1.5 text-xs font-bold text-yellow-700 hover:bg-yellow-50 disabled:opacity-50" disabled={actionId === asset.id} onClick={() => void handleReject(asset.id)}>거절</button>
                        </>
                      )}
                      <button className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50" disabled={actionId === asset.id} onClick={() => void handleDelete(asset.id)}>삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 릴리즈 관리
// ─────────────────────────────────────────────────────────────────────────────
function ReleasesSection({ token }: { token: string }) {
  const [releases, setReleases]   = useState<AppRelease[]>([]);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg]             = useState("");
  const [version, setVersion]     = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [checksum, setChecksum]   = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");

  useEffect(() => {
    getAppReleases().then(r => setReleases([...r].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()))).finally(() => setLoading(false));
  }, []);

  async function submit() {
    if (!version || !downloadUrl || !checksum || !releaseNotes) { setMsg("모든 필드를 입력해 주세요."); return; }
    setSubmitting(true); setMsg("");
    try {
      const created = await createAppRelease({ version, platform: "windows", channel: "stable", downloadUrl, checksum, releaseNotes }, token);
      setReleases(prev => [created, ...prev]);
      setVersion(""); setDownloadUrl(""); setChecksum(""); setReleaseNotes("");
      setMsg("릴리즈가 등록되었습니다.");
    } catch { setMsg("등록 실패 (버전 중복 또는 권한 오류)"); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 font-bold text-slate-700">새 릴리즈 등록</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <RField label="버전" placeholder="0.2.0" value={version} onChange={setVersion} />
          <RField label="체크섬 (SHA-256)" placeholder="da4268..." value={checksum} onChange={setChecksum} />
          <RField label="다운로드 URL" placeholder="https://..." value={downloadUrl} onChange={setDownloadUrl} className="sm:col-span-2" />
          <label className="block text-sm font-bold sm:col-span-2">
            릴리즈 노트
            <textarea className="mt-1.5 h-24 w-full rounded-lg border border-slate-200 p-3 text-sm font-normal outline-none focus:border-blue-400" placeholder="변경 사항" value={releaseNotes} onChange={e => setReleaseNotes(e.target.value)} />
          </label>
        </div>
        {msg && <p className={`mt-2 text-sm font-semibold ${msg.includes("실패") || msg.includes("입력") ? "text-red-500" : "text-blue-600"}`}>{msg}</p>}
        <button className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50" disabled={submitting} onClick={() => void submit()}>
          {submitting ? "등록 중…" : "릴리즈 등록"}
        </button>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-500">릴리즈 목록 ({releases.length})</h3>
        {loading ? <div className="h-20 animate-pulse rounded-xl bg-slate-200" /> :
         releases.length === 0 ? <EmptyState message="등록된 릴리즈가 없습니다." /> : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">버전</th>
                  <th className="px-4 py-3">플랫폼</th>
                  <th className="px-4 py-3 hidden sm:table-cell">등록일</th>
                  <th className="px-4 py-3">릴리즈 노트</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {releases.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-800">v{r.version}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">{r.platform}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-slate-400 sm:table-cell">{new Date(r.publishedAt).toLocaleDateString("ko-KR")}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate">{r.releaseNotes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function RField({ label, placeholder, value, onChange, className }: {
  label: string; placeholder?: string; value: string; onChange: (v: string) => void; className?: string;
}) {
  return (
    <label className={`block text-sm font-bold ${className ?? ""}`}>
      {label}
      <input className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-400" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
    </label>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center">
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
