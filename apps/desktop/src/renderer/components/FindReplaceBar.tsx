import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import { ArrowDown, ArrowUp, CaseSensitive, Replace, X } from "lucide-react";

export interface SearchMatch {
  start: number;
  end: number;
}

export function computeSearchMatches(content: string, query: string, caseSensitive: boolean): SearchMatch[] {
  if (!query) return [];
  try {
    const flags = caseSensitive ? "g" : "gi";
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(escapedQuery, flags);
    const matches: SearchMatch[] = [];
    let match: RegExpExecArray | null;
    while ((match = re.exec(content)) !== null) {
      matches.push({ start: match.index, end: match.index + match[0].length });
      if (matches.length >= 1000) break;
    }
    return matches;
  } catch {
    return [];
  }
}

interface FindReplaceBarProps {
  findQuery: string;
  replaceQuery: string;
  isCaseSensitive: boolean;
  isReplaceVisible: boolean;
  matchCount: number;
  currentMatchIndex: number;
  onFindQueryChange: (q: string) => void;
  onReplaceQueryChange: (q: string) => void;
  onCaseSensitiveToggle: () => void;
  onToggleReplace: () => void;
  onNavigateNext: () => void;
  onNavigatePrev: () => void;
  onReplace: () => void;
  onReplaceAll: () => void;
  onClose: () => void;
}

export function FindReplaceBar({
  findQuery,
  replaceQuery,
  isCaseSensitive,
  isReplaceVisible,
  matchCount,
  currentMatchIndex,
  onFindQueryChange,
  onReplaceQueryChange,
  onCaseSensitiveToggle,
  onToggleReplace,
  onNavigateNext,
  onNavigatePrev,
  onReplace,
  onReplaceAll,
  onClose
}: FindReplaceBarProps): JSX.Element {
  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    findInputRef.current?.focus();
    findInputRef.current?.select();
  }, []);

  function handleFindKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();
      if (event.shiftKey) onNavigatePrev();
      else onNavigateNext();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  }

  function handleReplaceKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();
      onReplace();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  }

  const matchLabel = matchCount === 0 ? "결과 없음" : `${currentMatchIndex + 1} / ${matchCount}`;

  return (
    <div className="find-bar-enter border-b border-line bg-stone-50 px-3 py-2">
      {/* Find row */}
      <div className="flex items-center gap-2">
        <button
          className={`grid h-7 w-7 shrink-0 place-items-center rounded border text-xs font-semibold transition ${
            isReplaceVisible ? "border-accent bg-accent text-white" : "border-line bg-white text-slate-500 hover:border-accent hover:text-accent"
          }`}
          title="바꾸기 토글"
          type="button"
          onClick={onToggleReplace}
        >
          <Replace size={13} />
        </button>

        <div className="flex flex-1 items-center gap-1 rounded border border-line bg-white px-2 focus-within:border-accent">
          <input
            ref={findInputRef}
            className="min-w-0 flex-1 py-1 text-sm outline-none"
            placeholder="찾기 (Enter: 다음, Shift+Enter: 이전)"
            value={findQuery}
            onChange={(e) => onFindQueryChange(e.target.value)}
            onKeyDown={handleFindKeyDown}
          />
          <span
            className={`shrink-0 text-xs font-semibold tabular-nums ${
              matchCount === 0 && findQuery ? "text-red-500" : "text-slate-400"
            }`}
          >
            {findQuery ? matchLabel : ""}
          </span>
        </div>

        <button
          className={`grid h-7 w-7 shrink-0 place-items-center rounded border transition ${
            isCaseSensitive ? "border-accent bg-accent text-white" : "border-line bg-white text-slate-500 hover:border-accent hover:text-accent"
          }`}
          title="대소문자 구분"
          type="button"
          onClick={onCaseSensitiveToggle}
        >
          <CaseSensitive size={14} />
        </button>

        <button
          className="grid h-7 w-7 shrink-0 place-items-center rounded border border-line bg-white text-slate-500 transition hover:border-accent hover:text-accent disabled:opacity-30"
          title="이전 (Shift+Enter)"
          type="button"
          disabled={matchCount === 0}
          onClick={onNavigatePrev}
        >
          <ArrowUp size={13} />
        </button>
        <button
          className="grid h-7 w-7 shrink-0 place-items-center rounded border border-line bg-white text-slate-500 transition hover:border-accent hover:text-accent disabled:opacity-30"
          title="다음 (Enter)"
          type="button"
          disabled={matchCount === 0}
          onClick={onNavigateNext}
        >
          <ArrowDown size={13} />
        </button>

        <button
          className="grid h-7 w-7 shrink-0 place-items-center rounded border border-line bg-white text-slate-500 transition hover:border-red-300 hover:text-red-500"
          title="닫기 (Esc)"
          type="button"
          onClick={onClose}
        >
          <X size={13} />
        </button>
      </div>

      {/* Replace row */}
      {isReplaceVisible && (
        <div className="mt-2 flex items-center gap-2 pl-9">
          <div className="flex flex-1 items-center rounded border border-line bg-white px-2 focus-within:border-accent">
            <input
              className="min-w-0 flex-1 py-1 text-sm outline-none"
              placeholder="바꿀 텍스트"
              value={replaceQuery}
              onChange={(e) => onReplaceQueryChange(e.target.value)}
              onKeyDown={handleReplaceKeyDown}
            />
          </div>
          <button
            className="rounded border border-line bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-accent hover:text-accent disabled:opacity-30"
            type="button"
            disabled={matchCount === 0}
            onClick={onReplace}
          >
            바꾸기
          </button>
          <button
            className="rounded border border-line bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-accent hover:text-accent disabled:opacity-30"
            type="button"
            disabled={matchCount === 0}
            onClick={onReplaceAll}
          >
            모두 바꾸기
          </button>
        </div>
      )}
    </div>
  );
}
