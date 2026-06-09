import { useEffect, useRef } from "react";
import { FilePlus2, FileText, FolderPlus, Plug, RefreshCcw, Search, Settings2 } from "lucide-react";

export type CommandPaletteItemKind = "command" | "note" | "template" | "plugin";

export interface CommandPaletteItem {
  id: string;
  kind: CommandPaletteItemKind;
  title: string;
  subtitle: string;
  tags?: string[];
  onSelect: () => void | Promise<void>;
}

interface CommandPaletteProps {
  isOpen: boolean;
  query: string;
  items: CommandPaletteItem[];
  selectedIndex: number;
  onQueryChange: (query: string) => void;
  onSelectedIndexChange: (index: number) => void;
  onClose: () => void;
}

export function CommandPalette({
  isOpen,
  query,
  items,
  selectedIndex,
  onQueryChange,
  onSelectedIndexChange,
  onClose
}: CommandPaletteProps): JSX.Element | null {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/25 px-4 pt-[12vh]" onMouseDown={onClose}>
      <section className="mx-auto w-full max-w-2xl rounded border border-line bg-white shadow-xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex h-12 items-center gap-3 border-b border-line px-4">
          <Search size={18} className="text-slate-500" />
          <input
            ref={inputRef}
            className="min-w-0 flex-1 text-sm outline-none"
            placeholder="명령 또는 노트 검색"
            value={query}
            onChange={(event) => {
              onQueryChange(event.target.value);
              onSelectedIndexChange(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                onClose();
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                onSelectedIndexChange(Math.min(selectedIndex + 1, Math.max(items.length - 1, 0)));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                onSelectedIndexChange(Math.max(selectedIndex - 1, 0));
              }
              if (event.key === "Enter" && items[selectedIndex]) {
                event.preventDefault();
                void items[selectedIndex].onSelect();
              }
            }}
          />
        </div>

        <div className="max-h-[52vh] overflow-auto py-2">
          {items.length > 0 ? (
            items.map((item, index) => (
              <button
                key={item.id}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm ${
                  index === selectedIndex ? "bg-teal-50 text-accent" : "hover:bg-stone-50"
                }`}
                onMouseEnter={() => onSelectedIndexChange(index)}
                onClick={() => void item.onSelect()}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-stone-100">
                  <ItemIcon kind={item.kind} title={item.title} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{item.title}</span>
                  <span className="block truncate text-xs text-slate-500">{item.subtitle}</span>
                </span>
                {item.tags?.slice(0, 2).map((tag) => (
                  <span key={tag} className="rounded bg-stone-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                    {tag}
                  </span>
                ))}
              </button>
            ))
          ) : (
            <p className="px-4 py-8 text-center text-sm text-slate-500">실행할 항목이 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function ItemIcon({ kind, title }: { kind: CommandPaletteItemKind; title: string }): JSX.Element {
  if (kind === "note") return <FileText size={17} />;
  if (kind === "template") return <FilePlus2 size={17} />;
  if (kind === "plugin") return <Plug size={17} />;
  if (title.includes("폴더")) return <FolderPlus size={17} />;
  if (title.includes("새로고침")) return <RefreshCcw size={17} />;
  return <Settings2 size={17} />;
}
