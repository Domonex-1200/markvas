import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Package, ShieldCheck } from "lucide-react";
import { getMyAssets, getMyDeveloperApplication } from "../lib/api";

interface Notification {
  id: string;
  type: "asset" | "devapp";
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

const STORAGE_KEY = "markvas_notifications";
const CACHE_KEY   = "markvas_notif_cache";

function loadNotifs(): Notification[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Notification[]; } catch { return []; }
}
function saveNotifs(n: Notification[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(n));
}
function loadCache(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}") as Record<string, string>; } catch { return {}; }
}
function saveCache(c: Record<string, string>): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify(c));
}

function statusLabel(s: string): string {
  return ({ DRAFT: "초안", IN_REVIEW: "심사중", PUBLISHED: "승인됨", REJECTED: "거절됨" })[s] ?? s;
}
function devStatusLabel(s: string): string {
  return ({ PENDING: "검토중", APPROVED: "승인됨", REJECTED: "거절됨" })[s] ?? s;
}

async function pollNotifications(token: string): Promise<Notification[]> {
  const cache = loadCache();
  const existing = loadNotifs();
  const now = new Date().toISOString();
  const generated: Notification[] = [];

  // 에셋 상태 변경 감지
  try {
    const assets = await getMyAssets(token);
    for (const asset of assets) {
      const cacheKey = `asset_${asset.id}`;
      const prev = cache[cacheKey];
      const curr = asset.status ?? "";
      if (prev && prev !== curr) {
        const id = `asset_${asset.id}_${curr}_${Date.now()}`;
        if (!existing.find(n => n.id === id)) {
          generated.push({
            id,
            type: "asset",
            title: "에셋 상태 변경",
            body: `"${asset.title}" 상태가 ${statusLabel(prev)} → ${statusLabel(curr)}으로 변경되었습니다.`,
            timestamp: now,
            read: false,
          });
        }
      }
      cache[cacheKey] = curr;
    }
  } catch { /* ignore */ }

  // 개발자 신청 상태 변경 감지
  try {
    const app = await getMyDeveloperApplication(token);
    if (app) {
      const cacheKey = `devapp_${app.id}`;
      const prev = cache[cacheKey];
      const curr = app.status;
      if (prev && prev !== curr) {
        const id = `devapp_${app.id}_${curr}_${Date.now()}`;
        if (!existing.find(n => n.id === id)) {
          generated.push({
            id,
            type: "devapp",
            title: "개발자 신청 결과",
            body: `개발자 신청이 ${devStatusLabel(curr)}되었습니다.${app.reviewNote ? ` 메모: ${app.reviewNote}` : ""}`,
            timestamp: now,
            read: false,
          });
        }
      }
      if (!prev) cache[cacheKey] = curr;
      else       cache[cacheKey] = curr;
    }
  } catch { /* ignore */ }

  saveCache(cache);
  if (generated.length === 0) return existing;

  const merged = [...generated, ...existing].slice(0, 50);
  saveNotifs(merged);
  return merged;
}

export function NotificationCenter(): JSX.Element {
  const token   = window.localStorage.getItem("accessToken") ?? "";
  const [notifs, setNotifs]   = useState<Notification[]>(loadNotifs);
  const [open, setOpen]       = useState(false);
  const panelRef              = useRef<HTMLDivElement>(null);

  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    if (!token) return;
    pollNotifications(token).then((d) => setNotifs(Array.isArray(d) ? d : [])).catch(() => {});
  }, [token]);

  // 외부 클릭 닫기
  useEffect(() => {
    function onClickOutside(e: MouseEvent): void {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function markAllRead(): void {
    const updated = notifs.map(n => ({ ...n, read: true }));
    setNotifs(updated);
    saveNotifs(updated);
  }

  function markRead(id: string): void {
    const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifs(updated);
    saveNotifs(updated);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        className="relative grid h-8 w-8 place-items-center rounded-md transition"
        style={{ color: "rgba(255,255,255,0.6)" }}
        onMouseEnter={e => { (e.currentTarget).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget).style.color = "#fff"; }}
        onMouseLeave={e => { (e.currentTarget).style.background = "transparent"; (e.currentTarget).style.color = "rgba(255,255,255,0.6)"; }}
        title="알림"
        onClick={() => { setOpen(v => !v); if (!open) markAllRead(); }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black"
            style={{ background: "#f87171", color: "#fff" }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl shadow-2xl"
          style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-hover)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            <span className="text-sm font-black" style={{ color: "var(--text-primary)" }}>알림</span>
            {notifs.length > 0 && (
              <button className="flex items-center gap-1 text-xs font-semibold transition hover:opacity-70" style={{ color: "var(--teal)" }} onClick={markAllRead}>
                <CheckCheck size={12} />
                모두 읽음
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={24} className="mx-auto mb-2 opacity-30" style={{ color: "var(--text-muted)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>알림이 없습니다</p>
              </div>
            ) : (
              notifs.map(n => (
                <button
                  key={n.id}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition"
                  style={{ borderBottom: "1px solid var(--border)", background: n.read ? "transparent" : "rgba(32,197,188,0.05)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  onMouseLeave={e => (e.currentTarget.style.background = n.read ? "transparent" : "rgba(32,197,188,0.05)")}
                  onClick={() => markRead(n.id)}
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={{ background: n.type === "asset" ? "rgba(32,197,188,0.12)" : "rgba(124,92,252,0.12)" }}>
                    {n.type === "asset"
                      ? <Package size={13} style={{ color: "var(--teal)" }} />
                      : <ShieldCheck size={13} style={{ color: "var(--purple)" }} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{n.title}</p>
                    <p className="mt-0.5 text-xs leading-4" style={{ color: "var(--text-secondary)" }}>{n.body}</p>
                    <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {new Date(n.timestamp).toLocaleString("ko-KR")}
                    </p>
                  </div>
                  {!n.read && <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--teal)" }} />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
