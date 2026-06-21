import { useEffect, useState } from "react";
import type { InstalledPlugin } from "@markdown-canvas/shared";
import { Package, Paintbrush, FileText, Plug, Play, ShieldCheck, TerminalSquare, Trash2, X } from "lucide-react";

type AssetType = "THEME" | "TEMPLATE" | "PLUGIN";

interface LocalAsset {
  id: string;
  title: string;
  type: AssetType;
  version?: string;
  description?: string;
  metadata: Record<string, unknown>;
}

interface Props {
  isOpen: boolean;
  plugins: InstalledPlugin[];
  onClose: () => void;
  onRunCommand: (plugin: InstalledPlugin, commandId: string) => Promise<void>;
  onDeleteAsset: (assetId: string) => Promise<void>;
  onApplyTheme: (css: string) => void;
}

const BTN = "inline-flex h-7 items-center gap-1.5 rounded border px-2.5 text-xs font-medium transition disabled:opacity-50";
const BTN_SECONDARY = `${BTN} border-line bg-white text-slate-600 hover:border-slate-300 hover:bg-stone-50`;
const BTN_DANGER = `${BTN} border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50`;

export function PluginManagerModal({ isOpen, plugins, onClose, onRunCommand, onDeleteAsset, onApplyTheme }: Props): JSX.Element | null {
  const [tab, setTab] = useState<AssetType>("PLUGIN");
  const [assets, setAssets] = useState<LocalAsset[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [runningCmd, setRunningCmd] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    window.markdownCanvas?.listLocalAssets?.()
      .then((d) => setAssets(Array.isArray(d) ? d : []))
      .catch(() => setAssets([]));
  }, [isOpen]);

  if (!isOpen) return null;

  const themes = assets.filter((a) => a.type === "THEME");
  const templates = assets.filter((a) => a.type === "TEMPLATE");
  // 플러그인은 로컬 에셋 + InstalledPlugin(명령 정보) 합산
  const pluginAssets = assets.filter((a) => a.type === "PLUGIN");

  const TABS: { key: AssetType; label: string; count: number }[] = [
    { key: "PLUGIN", label: "플러그인", count: pluginAssets.length },
    { key: "THEME", label: "테마", count: themes.length },
    { key: "TEMPLATE", label: "템플릿", count: templates.length },
  ];

  async function handleDelete(id: string): Promise<void> {
    setBusyId(id);
    try {
      await onDeleteAsset(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } finally { setBusyId(null); }
  }

  async function handleRunCmd(plugin: InstalledPlugin, commandId: string): Promise<void> {
    const key = `${plugin.id}:${commandId}`;
    setRunningCmd(key);
    try { await onRunCommand(plugin, commandId); } finally { setRunningCmd(null); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/25 px-5 py-8">
      <section className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded border border-line bg-white shadow-xl">
        <header className="flex h-14 items-center gap-3 border-b border-line px-4">
          <Package size={18} />
          <h2 className="min-w-0 flex-1 text-sm font-bold">설치된 에셋</h2>
          <button className="icon-button" title="닫기" type="button" onClick={onClose}>
            <X size={17} />
          </button>
        </header>

        {/* 탭 */}
        <div className="flex border-b border-line px-4">
          {TABS.map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                tab === key ? "border-accent text-accent" : "border-transparent text-slate-500 hover:text-ink"
              }`}
              onClick={() => setTab(key)}
            >
              {label}
              <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-xs font-normal text-slate-500">{count}</span>
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {tab === "THEME" && (
            themes.length === 0 ? <EmptyState icon={<Paintbrush size={24} />} message="설치된 테마가 없습니다." /> :
            <ul className="grid gap-3">
              {themes.map((a) => {
                const css = (a.metadata.tokens as Record<string, unknown> | undefined)?.editorCss as string | undefined;
                return (
                  <li key={a.id} className="flex items-start gap-3 rounded border border-line bg-stone-50 p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded bg-purple-50 text-purple-600">
                      <Paintbrush size={17} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{a.title}</p>
                      {a.version && <p className="text-xs text-slate-400">v{a.version}</p>}
                      {a.description && <p className="mt-1 text-xs text-slate-500">{a.description}</p>}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {css && (
                        <button className={BTN_SECONDARY} onClick={() => onApplyTheme(css)}>
                          <Paintbrush size={12} />적용
                        </button>
                      )}
                      <button className={BTN_DANGER} disabled={busyId === a.id} onClick={() => void handleDelete(a.id)}>
                        <Trash2 size={12} />{busyId === a.id ? "삭제 중…" : "삭제"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {tab === "TEMPLATE" && (
            templates.length === 0 ? <EmptyState icon={<FileText size={24} />} message="설치된 템플릿이 없습니다." /> :
            <ul className="grid gap-3">
              {templates.map((a) => (
                <li key={a.id} className="flex items-start gap-3 rounded border border-line bg-stone-50 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded bg-teal-50 text-teal-600">
                    <FileText size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{a.title}</p>
                    {a.version && <p className="text-xs text-slate-400">v{a.version}</p>}
                    {a.description && <p className="mt-1 text-xs text-slate-500">{a.description}</p>}
                  </div>
                  <button className={BTN_DANGER} disabled={busyId === a.id} onClick={() => void handleDelete(a.id)}>
                    <Trash2 size={12} />{busyId === a.id ? "삭제 중…" : "삭제"}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {tab === "PLUGIN" && (
            pluginAssets.length === 0 ? <EmptyState icon={<Plug size={24} />} message="설치된 플러그인이 없습니다." /> :
            <ul className="grid gap-3">
              {pluginAssets.map((a) => {
                const pluginInfo = plugins.find((p) => p.id === a.id || (a.metadata.plugin as Record<string,unknown> | undefined)?.id === p.id);
                return (
                  <li key={a.id} className="rounded border border-line bg-stone-50 p-4">
                    <div className="flex items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded bg-orange-50 text-orange-500">
                        <Plug size={17} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink">{a.title}</p>
                        {a.version && <p className="text-xs text-slate-400">v{a.version}</p>}
                        {a.description && <p className="mt-1 text-xs text-slate-500">{a.description}</p>}
                      </div>
                      <button className={BTN_DANGER} disabled={busyId === a.id} onClick={() => void handleDelete(a.id)}>
                        <Trash2 size={12} />{busyId === a.id ? "삭제 중…" : "삭제"}
                      </button>
                    </div>

                    {pluginInfo && (
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <section>
                          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                            <ShieldCheck size={13} />권한
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {pluginInfo.permissions.length > 0 ? pluginInfo.permissions.map((p) => (
                              <span key={p} className="rounded bg-stone-100 px-2 py-1 text-xs font-semibold text-slate-600">{p}</span>
                            )) : <span className="text-xs text-slate-400">요청 권한 없음</span>}
                          </div>
                        </section>
                        <section>
                          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                            <TerminalSquare size={13} />명령
                          </div>
                          <div className="grid gap-2">
                            {pluginInfo.commands.map((cmd) => {
                              const key = `${pluginInfo.id}:${cmd.id}`;
                              return (
                                <button
                                  key={cmd.id}
                                  className="rounded border border-line px-3 py-2 text-left text-sm hover:border-accent hover:text-accent disabled:opacity-50"
                                  disabled={runningCmd === key}
                                  onClick={() => void handleRunCmd(pluginInfo, cmd.id)}
                                >
                                  <span className="flex items-center gap-2">
                                    <Play size={11} className="shrink-0 text-slate-400" />
                                    <span className="font-semibold">{cmd.title}</span>
                                    {runningCmd === key && <span className="text-xs text-slate-400">실행 중…</span>}
                                  </span>
                                  {cmd.description && <span className="mt-0.5 block text-xs text-slate-500">{cmd.description}</span>}
                                </button>
                              );
                            })}
                          </div>
                        </section>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }): JSX.Element {
  return (
    <div className="grid h-full place-items-center text-center">
      <div>
        <span className="mx-auto block text-slate-300">{icon}</span>
        <p className="mt-3 text-sm font-semibold text-slate-500">{message}</p>
        <p className="mt-1 text-xs text-slate-400">스토어에서 에셋을 추가하고 동기화하면 여기에 표시됩니다.</p>
      </div>
    </div>
  );
}
