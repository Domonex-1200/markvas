import type { ReactNode } from "react";
import { ChevronDown, ChevronRight, Clock3, Pin, X } from "lucide-react";
import type { IndexedNote } from "../lib/workspace-index";

interface QuickAccessPanelProps {
  pinnedNotes: IndexedNote[];
  recentNotes: IndexedNote[];
  isPinnedCollapsed: boolean;
  isRecentCollapsed: boolean;
  onOpenNote: (path: string) => Promise<void>;
  onTogglePinned: () => void;
  onToggleRecent: () => void;
  onUnpinNote: (path: string) => void;
  onRemoveRecentNote: (path: string) => void;
}

export function QuickAccessPanel({
  pinnedNotes,
  recentNotes,
  isPinnedCollapsed,
  isRecentCollapsed,
  onOpenNote,
  onTogglePinned,
  onToggleRecent,
  onUnpinNote,
  onRemoveRecentNote
}: QuickAccessPanelProps): JSX.Element | null {
  if (pinnedNotes.length === 0 && recentNotes.length === 0) return null;

  return (
    <section className="max-h-72 shrink-0 overflow-auto border-b border-line bg-white p-3">
      {pinnedNotes.length > 0 && (
        <QuickSection count={pinnedNotes.length} icon={<Pin size={13} />} isCollapsed={isPinnedCollapsed} title="핀 고정" onToggle={onTogglePinned}>
          {pinnedNotes.slice(0, 8).map((note) => (
            <QuickNoteButton actionLabel="핀 해제" key={note.path} note={note} onAction={onUnpinNote} onOpenNote={onOpenNote} />
          ))}
        </QuickSection>
      )}
      {recentNotes.length > 0 && (
        <QuickSection count={recentNotes.length} icon={<Clock3 size={13} />} isCollapsed={isRecentCollapsed} title="최근 문서" onToggle={onToggleRecent}>
          {recentNotes.slice(0, 8).map((note) => (
            <QuickNoteButton actionLabel="최근 문서에서 제거" key={note.path} note={note} onAction={onRemoveRecentNote} onOpenNote={onOpenNote} />
          ))}
        </QuickSection>
      )}
    </section>
  );
}

function QuickSection({
  icon,
  title,
  count,
  isCollapsed,
  onToggle,
  children
}: {
  icon: JSX.Element;
  title: string;
  count: number;
  isCollapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="mb-3 last:mb-0">
      <button className="mb-2 flex w-full items-center gap-1 text-left text-xs font-bold text-slate-500" type="button" onClick={onToggle}>
        {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
        {icon}
        <span className="flex-1">{title}</span>
        <span>{count}</span>
      </button>
      {!isCollapsed && <div className="space-y-1">{children}</div>}
    </div>
  );
}

function QuickNoteButton({
  note,
  actionLabel,
  onOpenNote,
  onAction
}: {
  note: IndexedNote;
  actionLabel: string;
  onOpenNote: (path: string) => Promise<void>;
  onAction: (path: string) => void;
}): JSX.Element {
  return (
    <div className="group flex items-center gap-1 rounded hover:bg-stone-50">
      <button className="min-w-0 flex-1 px-2 py-1.5 text-left" title={note.path} onClick={() => void onOpenNote(note.path)}>
        <span className="block truncate text-sm font-semibold">{note.analysis.title}</span>
        <span className="block truncate text-xs text-slate-500">{note.name}</span>
      </button>
      <button
        className="mr-1 hidden h-7 w-7 place-items-center rounded text-slate-400 hover:bg-white hover:text-accent group-hover:grid"
        title={actionLabel}
        type="button"
        onClick={() => onAction(note.path)}
      >
        <X size={14} />
      </button>
    </div>
  );
}
