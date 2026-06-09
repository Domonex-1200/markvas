"use client";

import { useState } from "react";
import { FileText, PackageCheck, Plug, Search, SwatchBook } from "lucide-react";
import type { StoreAsset } from "@markdown-canvas/shared";
import type { AssetType } from "@markdown-canvas/shared";
import { AssetCard } from "./AssetCard";

type FilterType = AssetType | "ALL";

const categoryItems: Array<{ type: FilterType; label: string; description: string; icon: JSX.Element }> = [
  { type: "ALL", label: "전체", description: "모든 무료 에셋", icon: <PackageCheck size={18} /> },
  { type: "THEME", label: "테마", description: "색상과 미리보기 스타일", icon: <SwatchBook size={18} /> },
  { type: "TEMPLATE", label: "템플릿", description: "반복 노트 구조", icon: <FileText size={18} /> },
  { type: "PLUGIN", label: "플러그인", description: "노트 기능 확장", icon: <Plug size={18} /> }
];

export function AssetFilter({ assets }: { assets: StoreAsset[] }): JSX.Element {
  const [active, setActive] = useState<FilterType>("ALL");
  const [query, setQuery] = useState("");

  const counts: Record<FilterType, number> = {
    ALL: assets.length,
    THEME: assets.filter((a) => a.type === "THEME").length,
    TEMPLATE: assets.filter((a) => a.type === "TEMPLATE").length,
    PLUGIN: assets.filter((a) => a.type === "PLUGIN").length
  };

  const filtered = assets.filter((a) => {
    const matchType = active === "ALL" || a.type === active;
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q ||
      a.title.toLowerCase().includes(q) ||
      (a.metadata.description ?? "").toLowerCase().includes(q) ||
      (a.metadata.summary ?? "").toLowerCase().includes(q);
    return matchType && matchQuery;
  });

  return (
    <>
      <div className="mb-6 grid gap-3 md:grid-cols-4">
        {categoryItems.map((cat) => (
          <button
            className={`surface-card p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 ${active === cat.type ? "border-blue-400 bg-blue-50" : ""}`}
            key={cat.type}
            onClick={() => setActive(cat.type)}
            type="button"
          >
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-md ${active === cat.type ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700"}`}>
              {cat.icon}
            </div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-black text-slate-950">{cat.label}</h2>
              <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">{counts[cat.type]}</span>
            </div>
            <p className="mt-2 text-sm leading-5 text-slate-600">{cat.description}</p>
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-950">
            {active === "ALL" ? "무료 에셋" : categoryItems.find((c) => c.type === active)?.label}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{filtered.length}개 결과</p>
        </div>
        <div className="flex h-11 min-w-72 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-500 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400">
          <Search size={16} />
          <input
            className="flex-1 bg-transparent outline-none placeholder:text-slate-400"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="에셋 검색"
            type="text"
            value={query}
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-slate-400">
          <PackageCheck className="mx-auto mb-3 opacity-30" size={40} />
          <p className="font-black">결과가 없습니다</p>
        </div>
      )}
    </>
  );
}
