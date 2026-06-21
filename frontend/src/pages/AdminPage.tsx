import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3, ChevronDown, FileCheck2, Package, Rocket,
  Search, Shield, Users, X, Eye,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { SiteHeader } from "../components/SiteHeader";
import {
  getAdminDeveloperApplications, reviewDeveloperApplication,
  getReviewAssets, approveAsset, rejectAsset, deleteAsset,
  getAppReleases, createAppRelease, getAllUsers, changeUserRole,
  setUserActive, getAdminStats, type AdminStats,
} from "../lib/api";
import type { AppRelease, DeveloperApplication, StoreAsset, UserProfile } from "../types";

type Section = "overview" | "users" | "applications" | "assets" | "releases";

const NAV: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "overview",     label: "대시보드",   icon: <BarChart3 size={16} /> },
  { id: "users",        label: "사용자 관리", icon: <Users size={16} /> },
  { id: "applications", label: "개발자 신청", icon: <FileCheck2 size={16} /> },
  { id: "assets",       label: "에셋 심사",   icon: <Package size={16} /> },
  { id: "releases",     label: "릴리즈 관리", icon: <Rocket size={16} /> },
];

export default function AdminPage(): JSX.Element {
  const navigate = useNavigate();
  const token    = window.localStorage.getItem("accessToken") ?? "";
  const role     = window.localStorage.getItem("role") ?? "";
  const [section, setSection] = useState<Section>("overview");

  useEffect(() => {
    if (!token || role !== "ADMIN") navigate("/");
  }, [token, role, navigate]);

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--bg-base)" }}>
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-0 px-4 py-6 sm:px-6">

        {/* 사이드바 */}
        <aside className="mr-6 hidden w-52 shrink-0 lg:block">
          <div className="sticky top-20 rounded-xl p-2" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
            <p className="mb-1 px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>관리자 메뉴</p>
            <nav className="flex flex-col gap-0.5">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors"
                  style={section === item.id ? { background: "var(--teal)", color: "#000" } : { color: "var(--text-secondary)" }}
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
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors"
              style={section === item.id
                ? { background: "var(--teal)", color: "#000" }
                : { background: "var(--bg-raised)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* 메인 */}
        <main className="min-w-0 flex-1">
          <div className="mb-5 flex items-center gap-3">
            <Shield size={20} style={{ color: "var(--teal)" }} />
            <div>
              <h1 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>{NAV.find(n => n.id === section)?.label}</h1>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>관리자 전용 영역</p>
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

// ─── 대시보드 ─────────────────────────────────────────────────────────────────
function OverviewSection({ token, onNav }: { token: string; onNav: (s: Section) => void }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats(token).then(setStats).finally(() => setLoading(false));
  }, [token]);

  const statCards = stats ? [
    { label: "전체 사용자",      value: stats.totalUsers,          color: "var(--teal)",   nav: "users" as Section },
    { label: "개발자",           value: stats.developers,          color: "var(--purple)", nav: "users" as Section },
    { label: "게시된 에셋",      value: stats.publishedAssets,     color: "#34d399",       nav: "assets" as Section },
    { label: "심사 대기",        value: stats.inReviewAssets,      color: "#fbbf24",       nav: "assets" as Section },
    { label: "개발자 신청 대기", value: stats.pendingApplications, color: "#fb923c",       nav: "applications" as Section },
    { label: "전체 에셋",        value: stats.totalAssets,         color: "var(--text-secondary)", nav: "assets" as Section },
  ] : [];

  const chartData = stats ? [
    { name: "일반", value: stats.totalUsers - stats.developers - stats.admins, fill: "rgba(32,197,188,0.6)" },
    { name: "개발자", value: stats.developers, fill: "rgba(124,92,252,0.7)" },
    { name: "관리자", value: stats.admins,     fill: "rgba(239,68,68,0.6)" },
  ] : [];

  const assetChart = stats ? [
    { name: "게시됨",   value: stats.publishedAssets,                           fill: "#34d399" },
    { name: "심사중",   value: stats.inReviewAssets,                             fill: "#fbbf24" },
    { name: "기타",     value: stats.totalAssets - stats.publishedAssets - stats.inReviewAssets, fill: "rgba(255,255,255,0.2)" },
  ] : [];

  return (
    <div className="space-y-6">
      {/* 스탯 카드 */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl" style={{ background: "var(--bg-raised)" }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {statCards.map((c) => (
            <button
              key={c.label}
              onClick={() => onNav(c.nav)}
              className="rounded-xl p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{c.label}</p>
              <p className="mt-2 text-3xl font-black" style={{ color: c.color }}>{c.value}</p>
            </button>
          ))}
        </div>
      )}

      {/* 차트 */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2">
          <ChartCard title="사용자 분포">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={36}>
                <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-overlay)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-primary)", fontSize: 13 }}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="에셋 현황">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={assetChart} barSize={36}>
                <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-overlay)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-primary)", fontSize: 13 }}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {assetChart.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* 빠른 이동 */}
      <div className="rounded-xl p-5" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
        <h3 className="mb-3 font-bold" style={{ color: "var(--text-secondary)" }}>빠른 이동</h3>
        <div className="flex flex-wrap gap-2">
          {NAV.filter(n => n.id !== "overview").map(n => (
            <button
              key={n.id}
              onClick={() => onNav(n.id)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition"
              style={{ background: "var(--bg-overlay)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
              onMouseEnter={e => { (e.currentTarget).style.borderColor = "var(--teal)"; (e.currentTarget).style.color = "var(--teal)"; }}
              onMouseLeave={e => { (e.currentTarget).style.borderColor = "var(--border)"; (e.currentTarget).style.color = "var(--text-secondary)"; }}
            >
              {n.icon}{n.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
      <h3 className="mb-4 text-sm font-bold" style={{ color: "var(--text-secondary)" }}>{title}</h3>
      {children}
    </div>
  );
}

// ─── 사용자 관리 ──────────────────────────────────────────────────────────────
function UsersSection({ token }: { token: string }) {
  const [users, setUsers]   = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]   = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [changingId, setChangingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => { getAllUsers(token).then(setUsers).finally(() => setLoading(false)); }, [token]);

  const filtered = users.filter(u => {
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    const q = query.trim().toLowerCase();
    return matchRole && (!q || u.email.toLowerCase().includes(q) || (u.nickname ?? "").toLowerCase().includes(q));
  });

  async function handleRoleChange(userId: string, newRole: string) {
    if (!window.confirm(`역할을 ${newRole}(으)로 변경하시겠습니까?`)) return;
    setChangingId(userId);
    try {
      const updated = await changeUserRole(userId, newRole, token);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: updated.role } : u));
    } catch { alert("역할 변경에 실패했습니다."); }
    finally { setChangingId(null); }
  }

  async function handleToggleActive(userId: string, active: boolean) {
    if (!window.confirm(`이 사용자를 ${active ? "비활성화" : "활성화"}하시겠습니까?`)) return;
    setTogglingId(userId);
    try {
      const updated = await setUserActive(userId, !active, token);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: updated.active, deactivatedAt: updated.deactivatedAt } : u));
    } catch (e: unknown) {
      alert((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "실패했습니다.");
    } finally { setTogglingId(null); }
  }

  const roleOptions = ["USER", "DEVELOPER", "ADMIN"];
  const roleLabel: Record<string, string> = { USER: "일반", DEVELOPER: "개발자", ADMIN: "관리자" };
  const roleBadge: Record<string, React.CSSProperties> = {
    USER:      { background: "rgba(32,197,188,0.12)",  color: "var(--teal)" },
    DEVELOPER: { background: "rgba(124,92,252,0.12)", color: "var(--purple)" },
    ADMIN:     { background: "rgba(239,68,68,0.12)",   color: "#f87171" },
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-lg px-3 text-sm" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
          <Search size={15} style={{ color: "var(--text-muted)" }} />
          <input className="flex-1 bg-transparent outline-none" style={{ color: "var(--text-primary)" }} placeholder="이메일·닉네임 검색" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <select className="h-10 rounded-lg px-3 text-sm outline-none" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-secondary)" }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="ALL">전체 역할</option>
          {roleOptions.map(r => <option key={r} value={r}>{roleLabel[r]}</option>)}
        </select>
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>{filtered.length}명</span>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl" style={{ background: "var(--bg-raised)" }} />)}</div>
      ) : filtered.length === 0 ? <EmptyState message="사용자가 없습니다." /> : (
        <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wider" style={{ background: "var(--bg-overlay)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
                <th className="px-4 py-3">사용자</th>
                <th className="px-4 py-3">역할</th>
                <th className="hidden px-4 py-3 sm:table-cell">가입일</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody style={{ background: "var(--bg-raised)" }}>
              {filtered.map(u => (
                <tr key={u.id} className={!u.active ? "opacity-50" : ""} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black" style={{ background: "var(--bg-overlay)", color: "var(--text-secondary)" }}>
                        {(u.nickname ?? u.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{u.nickname ?? "—"}</p>
                          {!u.active && <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>비활성</span>}
                        </div>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={roleBadge[u.role] ?? {}}>{roleLabel[u.role] ?? u.role}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs sm:table-cell" style={{ color: "var(--text-muted)" }}>
                    {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {u.role !== "ADMIN" && (
                        <button disabled={togglingId === u.id} onClick={() => void handleToggleActive(u.id, u.active)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-bold disabled:opacity-50"
                          style={u.active ? { border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" } : { border: "1px solid rgba(52,211,153,0.3)", color: "#34d399" }}>
                          {togglingId === u.id ? "처리 중…" : u.active ? "비활성화" : "활성화"}
                        </button>
                      )}
                      <RoleDropdown current={u.role} options={roleOptions} roleLabel={roleLabel} disabled={changingId === u.id || !u.active} onChange={r => void handleRoleChange(u.id, r)} />
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
  current: string; options: string[]; roleLabel: Record<string, string>; disabled: boolean; onChange: (r: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button disabled={disabled} onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold disabled:opacity-50"
        style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
        {disabled ? "변경 중…" : "변경"}<ChevronDown size={12} />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-28 rounded-lg" style={{ background: "var(--bg-overlay)", border: "1px solid var(--border)" }}>
          {options.filter(r => r !== current).map(r => (
            <button key={r} className="w-full px-3 py-2 text-left text-xs font-semibold" style={{ color: "var(--text-secondary)" }}
              onClick={() => { setOpen(false); onChange(r); }}>
              {roleLabel[r]}으로 변경
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 개발자 신청 ──────────────────────────────────────────────────────────────
function ApplicationsSection({ token }: { token: string }) {
  const [apps, setApps]         = useState<DeveloperApplication[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<"PENDING" | "ALL">("PENDING");
  const [actionId, setActionId] = useState<string | null>(null);
  const [noteMap, setNoteMap]   = useState<Record<string, string>>({});

  useEffect(() => {
    setLoading(true);
    getAdminDeveloperApplications(token, filter === "PENDING" ? "PENDING" : undefined).then(setApps).finally(() => setLoading(false));
  }, [token, filter]);

  async function review(appId: string, approve: boolean) {
    setActionId(appId);
    try {
      const updated = await reviewDeveloperApplication(appId, approve, noteMap[appId] ?? "", token);
      setApps(prev => prev.map(a => a.id === appId ? updated : a).filter(a => filter !== "PENDING" || a.status === "PENDING"));
    } catch { alert("처리에 실패했습니다."); }
    finally { setActionId(null); }
  }

  const statusBadge: Record<string, React.CSSProperties> = {
    PENDING:  { background: "rgba(251,191,36,0.12)", color: "#fbbf24" },
    APPROVED: { background: "rgba(52,211,153,0.12)", color: "#34d399" },
    REJECTED: { background: "rgba(239,68,68,0.12)",  color: "#f87171" },
  };
  const statusLabel: Record<string, string> = { PENDING: "대기", APPROVED: "승인", REJECTED: "거절" };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["PENDING", "ALL"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className="rounded-lg px-4 py-2 text-sm font-bold transition"
            style={filter === f ? { background: "var(--teal)", color: "#000" } : { background: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            {f === "PENDING" ? "대기 중" : "전체"}
          </button>
        ))}
      </div>
      {loading ? <div className="h-32 animate-pulse rounded-xl" style={{ background: "var(--bg-raised)" }} /> :
       apps.length === 0 ? <EmptyState message={filter === "PENDING" ? "대기 중인 신청이 없습니다." : "신청 내역이 없습니다."} /> : (
        <div className="space-y-3">
          {apps.map(app => (
            <article key={app.id} className="rounded-xl p-5" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2">
                <p className="font-bold" style={{ color: "var(--text-primary)" }}>{app.userNickname ?? app.userEmail}</p>
                <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={statusBadge[app.status] ?? {}}>{statusLabel[app.status]}</span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{app.userEmail}</p>
              <p className="mt-2 text-sm whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>{app.reason}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>신청일: {new Date(app.appliedAt).toLocaleDateString("ko-KR")}</p>
              {app.reviewNote && <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>메모: {app.reviewNote}</p>}
              {app.status === "PENDING" && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <input className="h-9 flex-1 rounded-lg px-3 text-sm outline-none" style={{ background: "var(--bg-overlay)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    placeholder="관리자 메모 (선택)" value={noteMap[app.id] ?? ""} onChange={e => setNoteMap(prev => ({ ...prev, [app.id]: e.target.value }))} />
                  <button className="rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-50" style={{ background: "var(--teal)", color: "#000" }} disabled={actionId === app.id} onClick={() => void review(app.id, true)}>승인</button>
                  <button className="rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-50" style={{ border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }} disabled={actionId === app.id} onClick={() => void review(app.id, false)}>거절</button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 에셋 심사 ────────────────────────────────────────────────────────────────
function AssetsSection({ token }: { token: string }) {
  const [assets, setAssets]     = useState<StoreAsset[]>([]);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState("IN_REVIEW");
  const [query, setQuery]       = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [detail, setDetail]     = useState<StoreAsset | null>(null);
  const [rejectTarget, setRejectTarget] = useState<StoreAsset | null>(null);
  const [rejectNote, setRejectNote]     = useState("");

  useEffect(() => { getReviewAssets(token).then(setAssets).finally(() => setLoading(false)); }, [token]);

  const filtered = assets.filter(a => {
    const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
    const q = query.trim().toLowerCase();
    return matchStatus && (!q || a.title.toLowerCase().includes(q));
  });

  async function handleApprove(id: string) {
    setActionId(id);
    try { const u = await approveAsset(id, token); setAssets(prev => prev.map(a => a.id === id ? u : a)); }
    catch { alert("처리 실패"); } finally { setActionId(null); }
  }

  async function handleRejectConfirm() {
    if (!rejectTarget) return;
    setActionId(rejectTarget.id);
    try {
      const u = await rejectAsset(rejectTarget.id, token, rejectNote.trim() || undefined);
      setAssets(prev => prev.map(a => a.id === rejectTarget.id ? u : a));
      setRejectTarget(null);
      setRejectNote("");
    } catch { alert("처리 실패"); } finally { setActionId(null); }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("이 에셋을 삭제하시겠습니까?")) return;
    setActionId(id);
    try { await deleteAsset(id, token); setAssets(prev => prev.filter(a => a.id !== id)); }
    catch { alert("삭제 실패"); } finally { setActionId(null); }
  }

  const statusOpts = [
    { value: "IN_REVIEW", label: "심사 대기" }, { value: "PUBLISHED", label: "게시됨" },
    { value: "REJECTED",  label: "거절됨" },    { value: "DRAFT",     label: "초안" },
    { value: "ALL",       label: "전체" },
  ];
  const statusBadge: Record<string, React.CSSProperties> = {
    DRAFT:     { background: "var(--bg-overlay)",           color: "var(--text-muted)" },
    IN_REVIEW: { background: "rgba(251,191,36,0.12)",       color: "#fbbf24" },
    PUBLISHED: { background: "rgba(52,211,153,0.12)",       color: "#34d399" },
    REJECTED:  { background: "rgba(239,68,68,0.12)",        color: "#f87171" },
  };
  const typeLabel: Record<string, string> = { THEME: "테마", PLUGIN: "플러그인", TEMPLATE: "템플릿" };

  return (
    <div className="space-y-4">
      {/* 거절 사유 모달 */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>에셋 거절</h3>
              <button onClick={() => { setRejectTarget(null); setRejectNote(""); }} style={{ color: "var(--text-muted)" }}><X size={18} /></button>
            </div>
            <p className="mb-4 text-sm" style={{ color: "var(--text-secondary)" }}>
              <span className="font-bold" style={{ color: "var(--text-primary)" }}>"{rejectTarget.title}"</span> 에셋을 거절합니다.
            </p>
            <label className="block text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
              거절 사유 (개발자에게 전달됩니다)
              <textarea
                className="mt-2 h-24 w-full resize-none rounded-xl p-3 text-sm font-normal outline-none"
                style={{ background: "var(--bg-overlay)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                placeholder="거절 사유를 입력하세요 (선택)"
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                autoFocus
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setRejectTarget(null); setRejectNote(""); }}
                className="rounded-lg px-4 py-2 text-sm font-bold" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                취소
              </button>
              <button onClick={() => void handleRejectConfirm()} disabled={actionId === rejectTarget.id}
                className="rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-50" style={{ background: "#f87171", color: "#000" }}>
                {actionId === rejectTarget.id ? "처리 중…" : "거절 확정"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 상세 보기 모달 */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-2xl rounded-2xl" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3">
                <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={statusBadge[detail.status ?? ""] ?? {}}>
                  {statusOpts.find(o => o.value === detail.status)?.label ?? detail.status}
                </span>
                <h3 className="text-lg font-black" style={{ color: "var(--text-primary)" }}>{detail.title}</h3>
              </div>
              <button onClick={() => setDetail(null)} style={{ color: "var(--text-muted)" }}><X size={18} /></button>
            </div>

            <div className="space-y-4 p-6">
              {detail.metadata.media?.coverImageUrl && (
                <img src={detail.metadata.media.coverImageUrl} alt="cover" className="w-full rounded-xl object-cover" style={{ maxHeight: 200 }} />
              )}

              <Row label="유형">{typeLabel[detail.type] ?? detail.type}</Row>
              <Row label="버전">{detail.metadata.version ?? "—"}</Row>
              <Row label="가격">{detail.pricingType === "PAID" && detail.priceCents ? `₩${(detail.priceCents / 100).toLocaleString()}` : "무료"}</Row>
              {detail.tags && detail.tags.length > 0 && (
                <Row label="태그"><div className="flex flex-wrap gap-1">{detail.tags.map(t => <span key={t} className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: "rgba(124,92,252,0.12)", color: "var(--purple)" }}>#{t}</span>)}</div></Row>
              )}

              {detail.metadata.summary && (
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>소개</p>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{detail.metadata.summary}</p>
                </div>
              )}
              {detail.metadata.description && (
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>상세 설명</p>
                  <p className="text-sm leading-6 whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>{detail.metadata.description}</p>
                </div>
              )}
              {detail.metadata.changelog && (
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>변경 내역</p>
                  <pre className="rounded-xl p-3 text-xs leading-5 whitespace-pre-wrap overflow-auto" style={{ background: "var(--bg-overlay)", color: "var(--text-secondary)", maxHeight: 120 }}>{detail.metadata.changelog}</pre>
                </div>
              )}
              {detail.type === "THEME" && (detail.metadata.tokens as { editorCss?: string })?.editorCss && (
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>테마 CSS</p>
                  <pre className="rounded-xl p-3 text-xs font-mono leading-5 overflow-auto" style={{ background: "var(--bg-overlay)", color: "var(--text-secondary)", maxHeight: 200 }}>{(detail.metadata.tokens as { editorCss?: string }).editorCss}</pre>
                </div>
              )}
              {detail.type === "PLUGIN" && (detail.metadata.plugin as { code?: string })?.code && (
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>플러그인 코드</p>
                  <pre className="rounded-xl p-3 text-xs font-mono leading-5 overflow-auto" style={{ background: "var(--bg-overlay)", color: "var(--text-secondary)", maxHeight: 200 }}>{(detail.metadata.plugin as { code?: string }).code}</pre>
                </div>
              )}
              {detail.type === "TEMPLATE" && (detail.metadata.template as { content?: string })?.content && (
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>템플릿 본문</p>
                  <pre className="rounded-xl p-3 text-xs font-mono leading-5 overflow-auto" style={{ background: "var(--bg-overlay)", color: "var(--text-secondary)", maxHeight: 200 }}>{(detail.metadata.template as { content?: string }).content}</pre>
                </div>
              )}

              {detail.status === "IN_REVIEW" && (
                <div className="flex gap-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                  <button onClick={() => { void handleApprove(detail.id); setDetail(null); }} disabled={actionId === detail.id}
                    className="flex-1 rounded-xl py-2.5 text-sm font-bold disabled:opacity-50" style={{ background: "var(--teal)", color: "#000" }}>
                    승인
                  </button>
                  <button onClick={() => { setRejectTarget(detail); setDetail(null); }}
                    className="flex-1 rounded-xl py-2.5 text-sm font-bold" style={{ border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                    거절
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 필터 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-lg px-3 text-sm" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
          <Search size={15} style={{ color: "var(--text-muted)" }} />
          <input className="flex-1 bg-transparent outline-none" style={{ color: "var(--text-primary)" }} placeholder="에셋 이름 검색" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1">
          {statusOpts.map(opt => (
            <button key={opt.value} onClick={() => setStatusFilter(opt.value)} className="rounded-lg px-3 py-2 text-xs font-bold transition"
              style={statusFilter === opt.value ? { background: "var(--teal)", color: "#000" } : { background: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
              {opt.label}
            </button>
          ))}
        </div>
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>{filtered.length}개</span>
      </div>

      {loading ? <div className="h-32 animate-pulse rounded-xl" style={{ background: "var(--bg-raised)" }} /> :
       filtered.length === 0 ? <EmptyState message="에셋이 없습니다." /> : (
        <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wider" style={{ background: "var(--bg-overlay)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
                <th className="px-4 py-3">에셋</th>
                <th className="px-4 py-3">상태</th>
                <th className="hidden px-4 py-3 sm:table-cell">등록일</th>
                <th className="px-4 py-3 text-right">액션</th>
              </tr>
            </thead>
            <tbody style={{ background: "var(--bg-raised)" }}>
              {filtered.map(asset => (
                <tr key={asset.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="px-4 py-3">
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{asset.title}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{typeLabel[asset.type] ?? asset.type}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={statusBadge[asset.status ?? ""] ?? {}}>
                      {statusOpts.find(o => o.value === asset.status)?.label ?? asset.status}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs sm:table-cell" style={{ color: "var(--text-muted)" }}>
                    {new Date(asset.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => setDetail(asset)}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                        style={{ border: "1px solid var(--border)", color: "var(--teal)" }}>
                        <Eye size={12} />상세
                      </button>
                      <Link className="rounded-lg px-2.5 py-1.5 text-xs font-bold" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }} to={`/assets/${asset.id}`}>보기</Link>
                      {asset.status === "IN_REVIEW" && (
                        <>
                          <button onClick={() => void handleApprove(asset.id)} disabled={actionId === asset.id}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-bold disabled:opacity-50" style={{ background: "var(--teal)", color: "#000" }}>
                            승인
                          </button>
                          <button onClick={() => { setRejectTarget(asset); setRejectNote(""); }}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-bold" style={{ border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}>
                            거절
                          </button>
                        </>
                      )}
                      <button onClick={() => void handleDelete(asset.id)} disabled={actionId === asset.id}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-bold disabled:opacity-50" style={{ border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                        삭제
                      </button>
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <dt className="w-16 shrink-0 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</dt>
      <dd className="text-sm" style={{ color: "var(--text-secondary)" }}>{children}</dd>
    </div>
  );
}

// ─── 릴리즈 관리 ──────────────────────────────────────────────────────────────
function ReleasesSection({ token }: { token: string }) {
  const [releases, setReleases]     = useState<AppRelease[]>([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg]               = useState("");
  const [version, setVersion]       = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [checksum, setChecksum]     = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");

  useEffect(() => {
    getAppReleases()
      .then(r => setReleases([...r].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())))
      .finally(() => setLoading(false));
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
      <div className="rounded-xl p-5" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
        <h3 className="mb-4 font-bold" style={{ color: "var(--text-primary)" }}>새 릴리즈 등록</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <RField label="버전" placeholder="0.2.0" value={version} onChange={setVersion} />
          <RField label="체크섬 (SHA-256)" placeholder="da4268..." value={checksum} onChange={setChecksum} />
          <RField label="다운로드 URL" placeholder="https://..." value={downloadUrl} onChange={setDownloadUrl} className="sm:col-span-2" />
          <label className="block text-sm font-bold sm:col-span-2" style={{ color: "var(--text-secondary)" }}>
            릴리즈 노트
            <textarea className="mt-1.5 h-24 w-full resize-y rounded-xl p-3 text-sm font-normal outline-none" style={{ background: "var(--bg-overlay)", border: "1px solid var(--border)", color: "var(--text-primary)" }} placeholder="변경 사항" value={releaseNotes} onChange={e => setReleaseNotes(e.target.value)} />
          </label>
        </div>
        {msg && <p className="mt-2 text-sm font-semibold" style={{ color: msg.includes("실패") || msg.includes("입력") ? "#f87171" : "var(--teal)" }}>{msg}</p>}
        <button className="mt-3 rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-50" style={{ background: "var(--teal)", color: "#000" }} disabled={submitting} onClick={() => void submit()}>
          {submitting ? "등록 중…" : "릴리즈 등록"}
        </button>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold" style={{ color: "var(--text-muted)" }}>릴리즈 목록 ({releases.length})</h3>
        {loading ? <div className="h-20 animate-pulse rounded-xl" style={{ background: "var(--bg-raised)" }} /> :
         releases.length === 0 ? <EmptyState message="등록된 릴리즈가 없습니다." /> : (
          <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-wider" style={{ background: "var(--bg-overlay)", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>
                  <th className="px-4 py-3">버전</th>
                  <th className="px-4 py-3">플랫폼</th>
                  <th className="hidden px-4 py-3 sm:table-cell">등록일</th>
                  <th className="px-4 py-3">릴리즈 노트</th>
                </tr>
              </thead>
              <tbody style={{ background: "var(--bg-raised)" }}>
                {releases.map(r => (
                  <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td className="px-4 py-3 font-bold" style={{ color: "var(--teal)" }}>v{r.version}</td>
                    <td className="px-4 py-3"><span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: "rgba(124,92,252,0.12)", color: "var(--purple)" }}>{r.platform}</span></td>
                    <td className="hidden px-4 py-3 text-xs sm:table-cell" style={{ color: "var(--text-muted)" }}>{new Date(r.publishedAt).toLocaleDateString("ko-KR")}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{r.releaseNotes}</td>
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
    <label className={`block text-sm font-bold ${className ?? ""}`} style={{ color: "var(--text-secondary)" }}>
      {label}
      <input className="mt-1.5 h-10 w-full rounded-lg px-3 text-sm font-normal outline-none" style={{ background: "var(--bg-overlay)", border: "1px solid var(--border)", color: "var(--text-primary)" }} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
    </label>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border-dashed py-16 text-center" style={{ border: "1px dashed var(--border)" }}>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{message}</p>
    </div>
  );
}
