import type { MarkdownDocument } from "@markdown-canvas/shared";
import { FileJson2, FileType2, History, LogIn, LogOut, Network, Package, PanelsTopLeft, Pin, RefreshCcw, Settings2, Trash2 } from "lucide-react";

interface AuthUser {
  id: string;
  email: string;
  nickname: string | null;
  role: string;
}

interface ToolbarProps {
  title: string;
  document: MarkdownDocument | null;
  saveStatus: "idle" | "dirty" | "saving" | "saved" | "error";
  isPinned: boolean;
  authUser: AuthUser | null;
  onSyncAssets: () => Promise<void>;
  onManageTemplates: () => Promise<void>;
  onManageAssets: () => void;
  onOpenTrash: () => Promise<void>;
  onTogglePin: () => void;
  onExportPdf: () => Promise<void>;
  onManageSettings: () => void;
  onOpenBackup: () => void;
  onOpenGraph: () => void;
  onOpenLogin: () => void;
  onLogout: () => Promise<void>;
  canManageTemplates: boolean;
}

export function Toolbar({
  title,
  document,
  saveStatus,
  isPinned,
  authUser,
  onSyncAssets,
  onManageTemplates,
  onManageAssets,
  onOpenTrash,
  onTogglePin,
  onExportPdf,
  onManageSettings,
  onOpenBackup,
  onOpenGraph,
  onOpenLogin,
  onLogout,
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
      <button className="icon-button" title="에셋 관리" onClick={onManageAssets}>
        <Package size={18} />
      </button>
      <button className="icon-button" title="휴지통" onClick={onOpenTrash} disabled={!canManageTemplates}>
        <Trash2 size={18} />
      </button>
      {authUser ? (
        <>
          <button className="icon-button" title="에셋 동기화" onClick={onSyncAssets}>
            <RefreshCcw size={18} />
          </button>
          <div className="flex items-center gap-1.5 rounded border border-line bg-stone-50 px-2 py-1">
            <div className="grid h-6 w-6 place-items-center rounded-full bg-accent text-xs font-bold text-white">
              {(authUser.nickname ?? authUser.email).slice(0, 1).toUpperCase()}
            </div>
            <span className="max-w-24 truncate text-xs text-slate-600" title={authUser.email}>
              {authUser.nickname ?? authUser.email}
            </span>
            <button className="icon-button h-5 w-5" title="로그아웃" onClick={() => void onLogout()}>
              <LogOut size={14} />
            </button>
          </div>
        </>
      ) : (
        <>
          <button className="icon-button" title="에셋 동기화 (로그인 필요)" onClick={onSyncAssets}>
            <FileJson2 size={18} />
          </button>
          <button className="flex items-center gap-1.5 rounded border border-accent px-2 py-1 text-xs font-semibold text-accent transition hover:bg-accent hover:text-white" title="로그인" onClick={onOpenLogin}>
            <LogIn size={14} />
            로그인
          </button>
        </>
      )}
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
