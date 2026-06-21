
import { useState } from "react";
import { FileText, PackageCheck, Plug, Search, SwatchBook } from "lucide-react";
import type { StoreAsset } from "../types";
import type { AssetType } from "../types";
import { AssetCard } from "./AssetCard";

type FilterType = AssetType | "ALL";

const categoryItems: Array<{ type: FilterType; label: string; description: string; icon: JSX.Element }> = [
  { type: "ALL",      label: "전체",     description: "모든 무료 에셋",         icon: <PackageCheck size={18} /> },
  { type: "THEME",    label: "테마",     description: "색상과 미리보기 스타일", icon: <SwatchBook size={18} /> },
  { type: "TEMPLATE", label: "템플릿",   description: "반복 노트 구조",         icon: <FileText size={18} /> },
  { type: "PLUGIN",   label: "플러그인", description: "노트 기능 확장",         icon: <Plug size={18} /> }
];

export function AssetFilter({ assets }: { assets: StoreAsset[] }): JSX.Element {
  const [active, setActive] = useState<FilterType>("ALL");
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");

  const allTags = [...new Set(assets.flatMap((a) => a.tags ?? []))].sort();

  const counts: Record<FilterType, number> = {
    ALL:      assets.length,
    THEME:    assets.filter((a) => a.type === "THEME").length,
    TEMPLATE: assets.filter((a) => a.type === "TEMPLATE").length,
    PLUGIN:   assets.filter((a) => a.type === "PLUGIN").length
  };

  const filtered = assets.filter((a) => {
    const matchType  = active === "ALL" || a.type === active;
    const q          = query.trim().toLowerCase();
    const matchQuery = !q || a.title.toLowerCase().includes(q)
      || (a.metadata.description ?? "").toLowerCase().includes(q)
      || (a.metadata.summary ?? "").toLowerCase().includes(q);
    const matchTag   = !activeTag || (a.tags ?? []).includes(activeTag);
    return matchType && matchQuery && matchTag;
  });

  return (
    <>
      {/* 카테고리 탭 */}
      <div className="mb-6 grid gap-3 md:grid-cols-4">
        {categoryItems.map((cat) => (
          <button
            key={cat.type}
            className="rounded-2xl p-4 text-left transition hover:-translate-y-0.5"
            style={{
              background: active === cat.type ? "rgba(32,197,188,0.08)" : "var(--bg-raised)",
              border: `1px solid ${active === cat.type ? "rgba(32,197,188,0.35)" : "var(--border)"}`,
              boxShadow: active === cat.type ? "0 0 0 1px rgba(32,197,188,0.15)" : undefined,
            }}
            onClick={() => setActive(cat.type)}
            type="button"
          >
            <div
              className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
              style={
                active === cat.type
                  ? { background: "var(--teal)", color: "#000" }
                  : { background: "rgba(32,197,188,0.10)", color: "var(--teal)" }
              }
            >
              {cat.icon}
            </div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-black" style={{ color: "var(--text-primary)" }}>{cat.label}</h2>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-black"
                style={{ background: "var(--teal)", color: "#000" }}
              >
                {counts[cat.type]}
              </span>
            </div>
            <p className="mt-2 text-sm leading-5" style={{ color: "var(--text-secondary)" }}>
              {cat.description}
            </p>
          </button>
        ))}
      </div>

      {/* 태그 필터 */}
      {allTags.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            className="rounded-full px-3 py-1 text-xs font-bold transition"
            style={activeTag === ""
              ? { background: "var(--purple)", color: "#fff" }
              : { background: "rgba(124,92,252,0.10)", color: "var(--purple)", border: "1px solid rgba(124,92,252,0.20)" }
            }
            onClick={() => setActiveTag("")}
            type="button"
          >
            전체
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              className="rounded-full px-3 py-1 text-xs font-bold transition"
              style={activeTag === tag
                ? { background: "var(--purple)", color: "#fff" }
                : { background: "rgba(124,92,252,0.10)", color: "var(--purple)", border: "1px solid rgba(124,92,252,0.20)" }
              }
              onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
              type="button"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* 검색 + 제목 */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
            {active === "ALL" ? "무료 에셋" : categoryItems.find((c) => c.type === active)?.label}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {filtered.length}개 결과
          </p>
        </div>
        <div
          className="flex h-11 min-w-72 items-center gap-2 rounded-xl px-3 text-sm focus-within:ring-1"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
          onFocus={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--teal)")}
          onBlur={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
        >
          <Search size={16} />
          <input
            className="flex-1 bg-transparent outline-none"
            style={{ color: "var(--text-primary)" }}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="에셋 검색"
            type="text"
            value={query}
          />
        </div>
      </div>

      {/* 그리드 */}
      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center" style={{ color: "var(--text-muted)" }}>
          <PackageCheck className="mx-auto mb-3 opacity-30" size={40} />
          <p className="font-black">결과가 없습니다</p>
        </div>
      )}
    </>
  );
}
