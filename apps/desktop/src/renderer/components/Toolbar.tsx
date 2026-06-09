import type { MarkdownDocument } from "@markdown-canvas/shared";
import { FileJson2, FileType2, History, Network, Palette, PanelsTopLeft, Pin, Plug, Settings2, Trash2 } from "lucide-react";

interface ToolbarProps {
  title: string;
  document: MarkdownDocument | null;
  saveStatus: "idle" | "dirty" | "saving" | "saved" | "error";
  isPinned: boolean;
  themeCss: string;
  onThemeChange: (css: string) => void;
  onSyncAssets: () => Promise<void>;
  onManageTemplates: () => Promise<void>;
  onManagePlugins: () => Promise<void>;
  onOpenTrash: () => Promise<void>;
  onTogglePin: () => void;
  onExportPdf: () => Promise<void>;
  onManageSettings: () => void;
  onOpenBackup: () => void;
  onOpenGraph: () => void;
  canManageTemplates: boolean;
}

export function Toolbar({
  title,
  document,
  saveStatus,
  isPinned,
  themeCss,
  onThemeChange,
  onSyncAssets,
  onManageTemplates,
  onManagePlugins,
  onOpenTrash,
  onTogglePin,
  onExportPdf,
  onManageSettings,
  onOpenBackup,
  onOpenGraph,
  canManageTemplates
}: ToolbarProps): JSX.Element {
  return (
    <header className="flex h-14 items-center gap-2 border-b border-line bg-white px-4">
      <h1 className="min-w-0 flex-1 truncate text-base font-bold text-ink" title={title}>{title}</h1>
      <span className="mr-2 shrink-0 text-xs font-semibold text-slate-500">{getSaveStatusLabel(saveStatus)}</span>
      <button className={`icon-button ${isPinned ? "text-accent" : ""}`} title="핀 고정" onClick={onTogglePin} disabled={!document}>
        <Pin size={18} />
      </button>
      <button className="icon-button" title="백업 이력" onClick={onOpenBackup} disabled={!document}>
        <History size={18} />
      </button>
      <button className="icon-button" title="노트 연결 그래프" onClick={onOpenGraph}>
        <Network size={18} />
      </button>
      <button className="icon-button" title="PDF 추출" onClick={onExportPdf} disabled={!document}>
        <FileType2 size={18} />
      </button>
      <button className="icon-button" title="템플릿 관리" onClick={onManageTemplates} disabled={!canManageTemplates}>
        <PanelsTopLeft size={18} />
      </button>
      <button className="icon-button" title="플러그인 관리" onClick={onManagePlugins}>
        <Plug size={18} />
      </button>
      <button className="icon-button" title="휴지통" onClick={onOpenTrash} disabled={!canManageTemplates}>
        <Trash2 size={18} />
      </button>
      <label className="icon-button cursor-pointer" title="테마 CSS 불러오기">
        <Palette size={18} />
        <textarea
          className="sr-only"
          aria-label="테마 CSS"
          value={themeCss}
          onChange={(event) => onThemeChange(event.target.value)}
        />
      </label>
      <button className="icon-button" title="에셋 동기화" onClick={onSyncAssets}>
        <FileJson2 size={18} />
      </button>
      <button className="icon-button" title="워크스페이스 설정" onClick={onManageSettings}>
        <Settings2 size={18} />
      </button>
    </header>
  );
}

function getSaveStatusLabel(status: ToolbarProps["saveStatus"]): string {
  if (status === "dirty") return "저장 대기";
  if (status === "saving") return "저장 중";
  if (status === "saved") return "저장됨";
  if (status === "error") return "저장 실패";
  return "";
}
