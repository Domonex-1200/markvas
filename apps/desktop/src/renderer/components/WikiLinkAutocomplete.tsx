import { useEffect, useRef } from "react";
import { FileText } from "lucide-react";
import type { IndexedNote } from "../lib/workspace-index";

interface WikiLinkAutocompleteProps {
  notes: IndexedNote[];
  query: string;
  selectedIndex: number;
  style: React.CSSProperties;
  onSelect: (note: IndexedNote) => void;
  onSelectedIndexChange: (index: number) => void;
}

export interface WikiTrigger {
  query: string;
  triggerStart: number;
  caretEnd: number;
}

/** [[를 입력한 위치와 쿼리를 감지한다. null이면 트리거 없음 */
export function detectWikiTrigger(content: string, caretPos: number): WikiTrigger | null {
  const textBefore = content.slice(0, caretPos);
  const lastOpen = textBefore.lastIndexOf("[[");
  if (lastOpen === -1) return null;
  const between = textBefore.slice(lastOpen + 2);
  // 닫힘 ]] 가 이미 있거나, 중첩 [[ 가 있으면 무시
  if (between.includes("]]") || between.includes("[[")) return null;
  return { query: between, triggerStart: lastOpen, caretEnd: caretPos };
}

/** 텍스트영역 커서 픽셀 위치를 계산한다 */
export function getCaretPixelPos(
  ta: HTMLTextAreaElement,
  position: number
): { top: number; left: number } {
  const PROPS = [
    "borderTopWidth","borderRightWidth","borderBottomWidth","borderLeftWidth",
    "paddingTop","paddingRight","paddingBottom","paddingLeft",
    "fontFamily","fontSize","fontWeight","fontStyle","lineHeight",
    "letterSpacing","wordSpacing","tabSize","whiteSpace","wordWrap","overflowWrap",
    "boxSizing","width",
  ] as const;

  const mirror = document.createElement("div");
  const computed = window.getComputedStyle(ta);

  mirror.style.position = "absolute";
  mirror.style.top = "0";
  mirror.style.left = "0";
  mirror.style.visibility = "hidden";
  mirror.style.overflow = "hidden";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.wordWrap = "break-word";

  PROPS.forEach((p) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mirror.style as any)[p] = computed[p];
  });

  // 커서 이전 텍스트 삽입
  const textNode = document.createTextNode(ta.value.slice(0, position));
  mirror.appendChild(textNode);

  const span = document.createElement("span");
  span.textContent = "​";
  mirror.appendChild(span);

  ta.parentElement!.appendChild(mirror);

  const taRect = ta.getBoundingClientRect();
  const spanRect = span.getBoundingClientRect();
  const mirrorRect = mirror.getBoundingClientRect();

  ta.parentElement!.removeChild(mirror);

  return {
    top: spanRect.top - mirrorRect.top + taRect.top - ta.scrollTop + span.offsetHeight + 4,
    left: Math.min(spanRect.left - mirrorRect.left + taRect.left, taRect.right - 240),
  };
}

/** 노트 목록을 쿼리로 필터링 */
export function filterNotesByQuery(notes: IndexedNote[], query: string): IndexedNote[] {
  const q = query.trim().toLowerCase();
  if (!q) return notes.slice(0, 12);
  return notes
    .filter(
      (n) =>
        n.analysis.title.toLowerCase().includes(q) ||
        n.name.toLowerCase().includes(q) ||
        (n.analysis.frontmatter.aliases ?? []).some((a) => a.toLowerCase().includes(q))
    )
    .slice(0, 12);
}

export function WikiLinkAutocomplete({
  notes,
  query,
  selectedIndex,
  style,
  onSelect,
  onSelectedIndexChange,
}: WikiLinkAutocompleteProps): JSX.Element | null {
  const listRef = useRef<HTMLUListElement>(null);

  // 선택 항목이 스크롤 뷰 안에 있도록 조정
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (notes.length === 0) return null;

  return (
    <div
      className="autocomplete-dropdown absolute z-50 w-60 overflow-hidden rounded border border-line bg-white shadow-xl"
      style={style}
    >
      <div className="border-b border-line bg-stone-50 px-3 py-1.5 text-[11px] font-semibold uppercase text-slate-400">
        노트 연결
      </div>
      <ul ref={listRef} className="max-h-56 overflow-auto py-1">
        {notes.map((note, index) => (
          <li key={note.path}>
            <button
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                index === selectedIndex
                  ? "bg-teal-50 text-accent"
                  : "text-ink hover:bg-stone-50"
              }`}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // textarea focus 유지
                onSelect(note);
              }}
              onMouseEnter={() => onSelectedIndexChange(index)}
            >
              <FileText size={14} className="shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1 truncate">
                <span className="block truncate font-semibold">{note.analysis.title}</span>
                <span className="block truncate text-xs text-slate-400">{note.name}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
