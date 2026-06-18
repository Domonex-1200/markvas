import { useState } from "react";
import type { InstalledAsset } from "@markdown-canvas/shared";
import { X, Trash2, Paintbrush, FileText, Terminal, Play, Download, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  isOpen: boolean;
  installedAssets: InstalledAsset[];
  localAssetIds: Set<string>;
  isLoading: boolean;
  onClose: () => void;
  onInstallLocal: (asset: InstalledAsset) => Promise<void>;
  onDeleteLocal: (assetId: string) => Promise<void>;
  onApplyTheme: (css: string) => void;
  onRunPluginCommand: (assetId: string, commandId: string) => Promise<void>;
}

type Tab = "THEME" | "TEMPLATE" | "PLUGIN";

export function AssetManagerModal({
  isOpen,
  installedAssets,
  localAssetIds,
  isLoading,
  onClose,
  onInstallLocal,
  onDeleteLocal,
  onApplyTheme,
  onRunPluginCommand
}: Props): JSX.Element | null {
  const [activeTab, setActiveTab] = useState<Tab>("THEME");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [runningCmd, setRunningCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const themes = installedAssets.filter((a) => a.asset.type === "THEME");
  const templates = installedAssets.filter((a) => a.asset.type === "TEMPLATE");
  const plugins = installedAssets.filter((a) => a.asset.type === "PLUGIN");

  async function handleInstall(item: InstalledAsset): Promise<void> {
    setBusyId(item.asset.id);
    try { await onInstallLocal(item); } finally { setBusyId(null); }
  }

  async function handleDelete(assetId: string): Promise<void> {
    setBusyId(assetId);
    try { await onDeleteLocal(assetId); } finally { setBusyId(null); }
  }

  async function handleRunCommand(assetId: string, commandId: string): Promise<void> {
    const key = `${assetId}:${commandId}`;
    setRunningCmd(key);
    try { await onRunPluginCommand(assetId, commandId); } finally { setRunningCmd(null); }
  }

  const TAB_META: { tab: Tab; label: string; count: number }[] = [
    { tab: "THEME", label: "테마", count: themes.length },
    { tab: "TEMPLATE", label: "템플릿", count: templates.length },
    { tab: "PLUGIN", label: "플러그인", count: plugins.length }
  ];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 px-4">
      <div className="flex w-full max-w-4xl flex-col rounded border border-line bg-white shadow-xl" style={{ maxHeight: "90vh" }}>
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <h2 className="flex-1 text-base font-bold text-ink">에셋 관리</h2>
          <p className="text-xs text-slate-400">에셋 스토어에서 등록한 에셋을 설치하고 관리합니다</p>
          <button className="icon-button ml-2" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="flex border-b border-line px-5">
          {TAB_META.map(({ tab, label, count }) => (
            <button
              key={tab}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                activeTab === tab ? "border-accent text-accent" : "border-transparent text-slate-500 hover:text-ink"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {label}
              <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-xs font-normal text-slate-500">{count}</span>
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-slate-400">불러오는 중…</p>
          ) : activeTab === "THEME" ? (
            <ThemeSection
              items={themes}
              localAssetIds={localAssetIds}
              busyId={busyId}
              onInstall={handleInstall}
              onDelete={handleDelete}
              onApply={onApplyTheme}
            />
          ) : activeTab === "TEMPLATE" ? (
            <TemplateSection
              items={templates}
              localAssetIds={localAssetIds}
              busyId={busyId}
              onInstall={handleInstall}
              onDelete={handleDelete}
            />
          ) : (
            <PluginSection
              items={plugins}
              localAssetIds={localAssetIds}
              busyId={busyId}
              runningCmd={runningCmd}
              onInstall={handleInstall}
              onDelete={handleDelete}
              onRunCommand={handleRunCommand}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }): JSX.Element {
  return (
    <div className="py-10 text-center">
      <p className="text-sm text-slate-400">{message}</p>
      <p className="mt-1 text-xs text-slate-300">에셋 스토어에서 등록하면 여기에 표시됩니다</p>
    </div>
  );
}

// 버튼 공통 스타일
const BTN = "inline-flex h-7 items-center gap-1.5 rounded border px-2.5 text-xs font-medium transition disabled:opacity-50";
const BTN_PRIMARY = `${BTN} border-accent bg-accent text-white hover:bg-accent/90`;
const BTN_SECONDARY = `${BTN} border-line bg-white text-slate-600 hover:border-slate-300 hover:bg-stone-50`;
const BTN_DANGER = `${BTN} border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50`;
const BADGE_INSTALLED = "inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700";

function AssetActions({
  assetId,
  isInstalled,
  busyId,
  onInstall,
  onDelete,
  children
}: {
  assetId: string;
  isInstalled: boolean;
  busyId: string | null;
  onInstall: () => void;
  onDelete: () => void;
  children?: ReactNode;
}): JSX.Element {
  const isBusy = busyId === assetId;
  return (
    <div className="flex shrink-0 items-center gap-2">
      {isInstalled && (
        <span className={BADGE_INSTALLED}>
          <CheckCircle2 size={11} />
          설치됨
        </span>
      )}
      {children}
      {isInstalled ? (
        <button className={BTN_DANGER} disabled={isBusy} onClick={onDelete}>
          <Trash2 size={12} />
          {isBusy ? "삭제 중…" : "삭제"}
        </button>
      ) : (
        <button className={BTN_PRIMARY} disabled={isBusy} onClick={onInstall}>
          <Download size={12} />
          {isBusy ? "설치 중…" : "설치"}
        </button>
      )}
    </div>
  );
}

function ThemeSection({
  items, localAssetIds, busyId, onInstall, onDelete, onApply
}: {
  items: InstalledAsset[];
  localAssetIds: Set<string>;
  busyId: string | null;
  onInstall: (item: InstalledAsset) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onApply: (css: string) => void;
}): JSX.Element {
  if (items.length === 0) return <EmptyState message="등록된 테마가 없습니다." />;
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const { asset } = item;
        const isInstalled = localAssetIds.has(asset.id);
        const css = asset.metadata?.tokens?.editorCss ?? "";
        return (
          <li key={asset.id} className="flex items-start gap-3 rounded border border-line bg-stone-50 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">{asset.title}</p>
              {asset.metadata?.description && (
                <p className="mt-0.5 text-xs text-slate-500">{asset.metadata.description}</p>
              )}
            </div>
            <AssetActions
              assetId={asset.id}
              isInstalled={isInstalled}
              busyId={busyId}
              onInstall={() => void onInstall(item)}
              onDelete={() => void onDelete(asset.id)}
            >
              {isInstalled && css && (
                <button className={BTN_SECONDARY} onClick={() => onApply(css)}>
                  <Paintbrush size={12} />
                  적용
                </button>
              )}
            </AssetActions>
          </li>
        );
      })}
    </ul>
  );
}

function TemplateSection({
  items, localAssetIds, busyId, onInstall, onDelete
}: {
  items: InstalledAsset[];
  localAssetIds: Set<string>;
  busyId: string | null;
  onInstall: (item: InstalledAsset) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}): JSX.Element {
  const [expanded, setExpanded] = useState<string | null>(null);
  if (items.length === 0) return <EmptyState message="등록된 커스텀 템플릿이 없습니다." />;
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const { asset } = item;
        const isInstalled = localAssetIds.has(asset.id);
        const content = asset.metadata?.template?.content ?? "";
        const isExpanded = expanded === asset.id;
        return (
          <li key={asset.id} className="rounded border border-line bg-stone-50 p-4">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{asset.title}</p>
                {asset.metadata?.description && (
                  <p className="mt-0.5 text-xs text-slate-500">{asset.metadata.description}</p>
                )}
              </div>
              <AssetActions
                assetId={asset.id}
                isInstalled={isInstalled}
                busyId={busyId}
                onInstall={() => void onInstall(item)}
                onDelete={() => void onDelete(asset.id)}
              >
                {content && (
                  <button className={BTN_SECONDARY} onClick={() => setExpanded(isExpanded ? null : asset.id)}>
                    <FileText size={12} />
                    {isExpanded ? "접기" : "미리보기"}
                  </button>
                )}
              </AssetActions>
            </div>
            {isExpanded && content && (
              <pre className="mt-3 max-h-48 overflow-auto rounded border border-line bg-white p-3 text-xs text-slate-600 whitespace-pre-wrap">
                {content}
              </pre>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function PluginSection({
  items, localAssetIds, busyId, runningCmd, onInstall, onDelete, onRunCommand
}: {
  items: InstalledAsset[];
  localAssetIds: Set<string>;
  busyId: string | null;
  runningCmd: string | null;
  onInstall: (item: InstalledAsset) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRunCommand: (assetId: string, commandId: string) => Promise<void>;
}): JSX.Element {
  if (items.length === 0) return <EmptyState message="등록된 플러그인이 없습니다." />;
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const { asset } = item;
        const isInstalled = localAssetIds.has(asset.id);
        const commands: Array<{ id: string; title: string; description?: string }> =
          asset.metadata?.plugin?.commands ?? [];
        return (
          <li key={asset.id} className="rounded border border-line bg-stone-50 p-4">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{asset.title}</p>
                {asset.metadata?.description && (
                  <p className="mt-0.5 text-xs text-slate-500">{asset.metadata.description}</p>
                )}
              </div>
              <AssetActions
                assetId={asset.id}
                isInstalled={isInstalled}
                busyId={busyId}
                onInstall={() => void onInstall(item)}
                onDelete={() => void onDelete(asset.id)}
              />
            </div>
            {isInstalled && commands.length > 0 && (
              <ul className="mt-3 flex flex-col gap-2">
                {commands.map((cmd) => {
                  const key = `${asset.id}:${cmd.id}`;
                  return (
                    <li key={cmd.id} className="flex items-center gap-3 rounded border border-line bg-white px-3 py-2">
                      <Terminal size={13} className="shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-ink">{cmd.title}</p>
                        {cmd.description && (
                          <p className="mt-0.5 text-xs text-slate-400">{cmd.description}</p>
                        )}
                      </div>
                      <button
                        className={`${BTN_SECONDARY} shrink-0`}
                        disabled={runningCmd === key}
                        onClick={() => void onRunCommand(asset.id, cmd.id)}
                      >
                        <Play size={11} />
                        {runningCmd === key ? "실행 중…" : "실행"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
