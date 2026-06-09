import type { InstalledPlugin } from "@markdown-canvas/shared";
import { Plug, ShieldCheck, TerminalSquare, X } from "lucide-react";

interface PluginManagerModalProps {
  isOpen: boolean;
  plugins: InstalledPlugin[];
  onClose: () => void;
  onRunCommand: (plugin: InstalledPlugin, commandId: string) => Promise<void>;
}

export function PluginManagerModal({ isOpen, plugins, onClose, onRunCommand }: PluginManagerModalProps): JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/25 px-5 py-8">
      <section className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded border border-line bg-white shadow-xl">
        <header className="flex h-14 items-center gap-3 border-b border-line px-4">
          <Plug size={18} />
          <h2 className="min-w-0 flex-1 text-sm font-bold">플러그인 관리</h2>
          <button className="icon-button" title="닫기" type="button" onClick={onClose}>
            <X size={17} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {plugins.length > 0 ? (
            <div className="grid gap-3">
              {plugins.map((plugin) => (
                <article key={plugin.id} className="rounded border border-line bg-white p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-teal-50 text-accent">
                      <Plug size={19} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold">{plugin.title}</h3>
                        <span className="rounded bg-stone-100 px-2 py-1 text-[11px] font-semibold text-slate-600">v{plugin.version}</span>
                      </div>
                      {plugin.description && <p className="mt-2 text-sm leading-6 text-slate-600">{plugin.description}</p>}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <section>
                      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                        <ShieldCheck size={14} />
                        권한
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {plugin.permissions.length > 0 ? (
                          plugin.permissions.map((permission) => (
                            <span key={permission} className="rounded bg-stone-100 px-2 py-1 text-xs font-semibold text-slate-600">
                              {permission}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500">요청 권한 없음</span>
                        )}
                      </div>
                    </section>

                    <section>
                      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                        <TerminalSquare size={14} />
                        명령
                      </div>
                      <div className="grid gap-2">
                        {plugin.commands.map((command) => (
                          <button
                            key={command.id}
                            className="rounded border border-line px-3 py-2 text-left text-sm hover:border-accent hover:text-accent"
                            onClick={() => void onRunCommand(plugin, command.id)}
                          >
                            <span className="block font-semibold">{command.title}</span>
                            {command.description && <span className="mt-1 block text-xs text-slate-500">{command.description}</span>}
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid h-full place-items-center text-center">
              <div>
                <Plug className="mx-auto text-slate-400" size={28} />
                <p className="mt-3 text-sm font-semibold">설치된 플러그인이 없습니다.</p>
                <p className="mt-2 text-sm text-slate-500">스토어에서 플러그인을 설치한 뒤 에셋 동기화를 실행하세요.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
