import type { TrashEntry } from "@markdown-canvas/shared";
import { FileText, Folder, RotateCcw, Trash2, X } from "lucide-react";

interface TrashModalProps {
  isOpen: boolean;
  entries: TrashEntry[];
  isLoading: boolean;
  onClose: () => void;
  onRestore: (entry: TrashEntry) => Promise<void>;
  onDeletePermanent: (entry: TrashEntry) => Promise<void>;
}

export function TrashModal({ isOpen, entries, isLoading, onClose, onRestore, onDeletePermanent }: TrashModalProps): JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 px-4">
      <section className="flex max-h-[78vh] w-full max-w-3xl flex-col rounded border border-line bg-white shadow-lg">
        <header className="flex h-14 items-center justify-between border-b border-line px-5">
          <div>
            <h2 className="text-base font-bold">휴지통</h2>
            <p className="text-xs text-slate-500">삭제한 노트와 폴더를 복구하거나 영구 삭제할 수 있습니다.</p>
          </div>
          <button className="icon-button" type="button" title="닫기" onClick={onClose}>
            <X size={17} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-auto p-4">
          {isLoading && <div className="rounded border border-line bg-stone-50 p-4 text-sm text-slate-500">휴지통을 불러오는 중입니다.</div>}
          {!isLoading && entries.length === 0 && (
            <div className="rounded border border-line bg-stone-50 p-4 text-sm text-slate-500">휴지통이 비어 있습니다.</div>
          )}
          <div className="space-y-2">
            {entries.map((entry) => (
              <article className="flex items-center gap-3 rounded border border-line bg-white p-3" key={entry.id}>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded bg-teal-50 text-accent">
                  {entry.kind === "folder" ? <Folder size={17} /> : <FileText size={17} />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold">{entry.name}</h3>
                  <p className="truncate text-xs text-slate-500">{entry.originalPath}</p>
                  <p className="mt-1 text-xs text-slate-400">{new Date(entry.deletedAt).toLocaleString()}</p>
                </div>
                <button className="button-secondary" type="button" onClick={() => void onRestore(entry)}>
                  <RotateCcw size={15} />
                  복구
                </button>
                <button className="button-secondary" type="button" onClick={() => void onDeletePermanent(entry)}>
                  <Trash2 size={15} />
                  영구 삭제
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
