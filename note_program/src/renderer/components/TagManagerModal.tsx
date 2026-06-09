import { useState } from "react";
import { Check, Hash, Pencil, Trash2, X } from "lucide-react";
import type { WorkspaceIndex } from "../lib/workspace-index";

interface TagManagerModalProps {
  isOpen: boolean;
  index: WorkspaceIndex | null;
  onClose: () => void;
  onRenameTag: (oldTag: string, newTag: string) => Promise<void>;
  onDeleteTag: (tag: string) => Promise<void>;
}

interface TagRowState {
  editing: boolean;
  draftName: string;
  busy: boolean;
}

export function TagManagerModal({ isOpen, index, onClose, onRenameTag, onDeleteTag }: TagManagerModalProps): JSX.Element | null {
  const [rowStates, setRowStates] = useState<Record<string, TagRowState>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState("");

  if (!isOpen) return null;

  const tags = index?.tags ?? [];

  function getRow(tag: string): TagRowState {
    return rowStates[tag] ?? { editing: false, draftName: tag, busy: false };
  }

  function patchRow(tag: string, patch: Partial<TagRowState>): void {
    setRowStates((prev) => ({ ...prev, [tag]: { ...getRow(tag), ...patch } }));
  }

  async function commitRename(tag: string): Promise<void> {
    const row = getRow(tag);
    const newName = row.draftName.trim();
    if (!newName || newName === tag) {
      patchRow(tag, { editing: false, draftName: tag });
      return;
    }

    patchRow(tag, { busy: true });
    try {
      setGlobalError("");
      await onRenameTag(tag, newName);
      setRowStates((prev) => {
        const next = { ...prev };
        delete next[tag];
        return next;
      });
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      patchRow(tag, { busy: false });
    }
  }

  async function commitDelete(tag: string): Promise<void> {
    patchRow(tag, { busy: true });
    try {
      setGlobalError("");
      await onDeleteTag(tag);
      setDeleteConfirm(null);
      setRowStates((prev) => {
        const next = { ...prev };
        delete next[tag];
        return next;
      });
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      patchRow(tag, { busy: false });
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/25 px-5 py-8">
      <section className="mx-auto flex h-full max-w-lg flex-col overflow-hidden rounded border border-line bg-white shadow-xl">
        <header className="flex h-14 items-center gap-3 border-b border-line px-4">
          <Hash size={18} />
          <h2 className="flex-1 text-sm font-bold">태그 관리</h2>
          <button className="icon-button" title="닫기" type="button" onClick={onClose}>
            <X size={17} />
          </button>
        </header>

        {globalError && <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">{globalError}</div>}

        <div className="min-h-0 flex-1 overflow-auto">
          {tags.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <Hash className="mx-auto text-slate-400" size={28} />
                <p className="mt-3 text-sm font-semibold">태그 없음</p>
                <p className="mt-1 text-sm text-slate-500">노트에 #태그 또는 frontmatter tags를 추가해 보세요.</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-stone-50 text-left text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-4 py-2">태그</th>
                  <th className="w-16 px-4 py-2 text-right">노트 수</th>
                  <th className="w-20 px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {tags.map(({ tag, count }) => {
                  const row = getRow(tag);
                  const isDeleteConfirming = deleteConfirm === tag;

                  return (
                    <tr key={tag} className="border-b border-line last:border-b-0">
                      <td className="px-4 py-2">
                        {row.editing ? (
                          <input
                            autoFocus
                            className="h-7 w-full rounded border border-accent px-2 text-sm outline-none"
                            value={row.draftName}
                            disabled={row.busy}
                            onChange={(e) => patchRow(tag, { draftName: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") void commitRename(tag);
                              if (e.key === "Escape") patchRow(tag, { editing: false, draftName: tag });
                            }}
                          />
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-0.5 text-xs font-semibold text-accent">
                            <Hash size={11} />
                            {tag}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-500">{count}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-end gap-1">
                          {row.editing ? (
                            <button
                              className="grid h-7 w-7 place-items-center rounded text-teal-600 hover:bg-teal-50 disabled:opacity-50"
                              title="변경 확인"
                              type="button"
                              disabled={row.busy}
                              onClick={() => void commitRename(tag)}
                            >
                              <Check size={14} />
                            </button>
                          ) : (
                            <button
                              className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-stone-100 disabled:opacity-50"
                              title="태그 이름 변경"
                              type="button"
                              disabled={row.busy}
                              onClick={() => patchRow(tag, { editing: true, draftName: tag })}
                            >
                              <Pencil size={14} />
                            </button>
                          )}

                          {isDeleteConfirming ? (
                            <button
                              className="rounded bg-red-500 px-2 py-0.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                              type="button"
                              disabled={row.busy}
                              onClick={() => void commitDelete(tag)}
                            >
                              확인
                            </button>
                          ) : (
                            <button
                              className="grid h-7 w-7 place-items-center rounded text-slate-500 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                              title="태그 삭제 (전체 노트에서 제거)"
                              type="button"
                              disabled={row.busy}
                              onClick={() => setDeleteConfirm(tag)}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <footer className="border-t border-line px-4 py-3 text-xs text-slate-500">
          이름 변경/삭제는 워크스페이스의 모든 노트에 즉시 반영됩니다.
        </footer>
      </section>
    </div>
  );
}
