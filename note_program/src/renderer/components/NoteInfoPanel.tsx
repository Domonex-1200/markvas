import type { NoteAnalysis } from "@markdown-canvas/shared";
import { CornerDownLeft, Hash, Link2, ScrollText } from "lucide-react";
import type { IndexedNote } from "../lib/workspace-index";

interface NoteInfoPanelProps {
  analysis: NoteAnalysis | null;
  backlinks: IndexedNote[];
  onOpenNote: (path: string) => Promise<void>;
  width?: number;
}

export function NoteInfoPanel({ analysis, backlinks, onOpenNote, width = 288 }: NoteInfoPanelProps): JSX.Element {
  return (
    <aside className="hidden shrink-0 border-l border-line bg-white xl:flex xl:flex-col" style={{ width }}>
      <div className="flex h-14 items-center border-b border-line px-4">
        <h2 className="text-sm font-semibold">노트 정보</h2>
      </div>
      {!analysis ? (
        <div className="p-4 text-sm leading-6 text-slate-500">노트를 선택하면 태그, 링크, 메타데이터를 분석합니다.</div>
      ) : (
        <div className="min-h-0 flex-1 space-y-5 overflow-auto p-4">
          <section>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
              <ScrollText size={14} />
              Summary
            </div>
            <h3 className="break-words text-sm font-bold">{analysis.title}</h3>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded border border-line p-2">
                <dt className="text-slate-500">Words</dt>
                <dd className="mt-1 font-semibold">{analysis.wordCount}</dd>
              </div>
              <div className="rounded border border-line p-2">
                <dt className="text-slate-500">Chars</dt>
                <dd className="mt-1 font-semibold">{analysis.characterCount}</dd>
              </div>
            </dl>
          </section>

          <section>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
              <Hash size={14} />
              Tags
            </div>
            {analysis.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysis.tags.map((tag) => (
                  <span key={tag} className="rounded bg-teal-50 px-2 py-1 text-xs font-semibold text-accent">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">태그 없음</p>
            )}
          </section>

          <section>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
              <Link2 size={14} />
              Links
            </div>
            {analysis.links.length > 0 ? (
              <ul className="space-y-2">
                {analysis.links.map((link) => (
                  <li key={`${link.kind}:${link.target}:${link.label}`} className="rounded border border-line p-2 text-xs">
                    <p className="truncate font-semibold">{link.label}</p>
                    <p className="mt-1 truncate text-slate-500">{link.target}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">링크 없음</p>
            )}
          </section>

          <section>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
              <CornerDownLeft size={14} />
              Backlinks
            </div>
            {backlinks.length > 0 ? (
              <ul className="space-y-2">
                {backlinks.map((note) => (
                  <li key={note.path}>
                    <button
                      className="w-full rounded border border-line p-2 text-left text-xs hover:border-accent hover:bg-teal-50"
                      onClick={() => void onOpenNote(note.path)}
                    >
                      <p className="truncate font-semibold">{note.analysis.title}</p>
                      <p className="mt-1 truncate text-slate-500">{note.name}</p>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">이 노트를 참조하는 문서 없음</p>
            )}
          </section>
        </div>
      )}
    </aside>
  );
}
