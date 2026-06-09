import { Hash, Search, Settings2 } from "lucide-react";
import type { IndexedNote, WorkspaceIndex } from "../lib/workspace-index";

interface WorkspaceSearchPanelProps {
  index: WorkspaceIndex | null;
  results: IndexedNote[];
  query: string;
  selectedTag: string | null;
  onQueryChange: (query: string) => void;
  onTagChange: (tag: string | null) => void;
  onOpenNote: (path: string) => Promise<void>;
  onManageTags: () => void;
}

export function WorkspaceSearchPanel({
  index,
  results,
  query,
  selectedTag,
  onQueryChange,
  onTagChange,
  onOpenNote,
  onManageTags
}: WorkspaceSearchPanelProps): JSX.Element {
  return (
    <section className="shrink-0 border-b border-line bg-white p-3">
      <div className="flex h-9 items-center gap-2 rounded border border-line px-2">
        <Search size={15} />
        <input
          className="min-w-0 flex-1 text-sm outline-none"
          placeholder="전체 노트 검색"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      {index && (
        <div className="mt-3 space-y-3">
          <div className="flex max-h-20 flex-wrap gap-1 overflow-auto">
            <button
              className={`rounded px-2 py-1 text-xs font-semibold ${selectedTag === null ? "bg-ink text-white" : "bg-stone-100 text-slate-600"}`}
              onClick={() => onTagChange(null)}
            >
              전체 {index.notes.length}
            </button>
            {index.tags.length > 0 && (
              <button
                className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded text-slate-400 hover:bg-stone-100 hover:text-slate-600"
                title="태그 관리"
                type="button"
                onClick={onManageTags}
              >
                <Settings2 size={13} />
              </button>
            )}
            {index.tags.map(({ tag, count }) => (
              <button
                key={tag}
                className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${
                  selectedTag === tag ? "bg-accent text-white" : "bg-teal-50 text-accent"
                }`}
                onClick={() => onTagChange(tag)}
              >
                <Hash size={11} />
                {tag} {count}
              </button>
            ))}
          </div>

          {(query || selectedTag) && (
            <div className="max-h-48 overflow-auto rounded border border-line">
              {results.length > 0 ? (
                results.slice(0, 20).map((note) => (
                  <button
                    key={note.path}
                    className="block w-full border-b border-line px-3 py-2 text-left text-sm last:border-b-0 hover:bg-stone-50"
                    onClick={() => void onOpenNote(note.path)}
                  >
                    <span className="block truncate font-semibold">{note.analysis.title}</span>
                    <span className="block truncate text-xs text-slate-500">{relativeLabel(note)}</span>
                  </button>
                ))
              ) : (
                <p className="p-3 text-sm text-slate-500">검색 결과 없음</p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function relativeLabel(note: IndexedNote): string {
  return `${note.name} · ${note.analysis.wordCount} words`;
}
