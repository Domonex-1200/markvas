import { Link } from "react-router-dom";
import type { StoreAsset } from "../types";
import { ArrowRight, FileText, Plug, Star, SwatchBook } from "lucide-react";
import { AssetCommerceActions } from "./AssetCommerceActions";
import { InstallButton } from "./InstallButton";

const assetTypeLabel: Record<StoreAsset["type"], string> = {
  THEME: "테마",
  TEMPLATE: "템플릿",
  PLUGIN: "플러그인"
};

const typeAccent: Record<StoreAsset["type"], { bg: string; color: string; iconBg: string }> = {
  THEME:    { bg: "rgba(124,92,252,0.12)", color: "#7c5cfc", iconBg: "rgba(124,92,252,0.18)" },
  TEMPLATE: { bg: "rgba(32,197,188,0.10)", color: "#20c5bc", iconBg: "rgba(32,197,188,0.18)" },
  PLUGIN:   { bg: "rgba(248,169,74,0.10)", color: "#f8a94a", iconBg: "rgba(248,169,74,0.18)" },
};

export function AssetCard({ asset }: { asset: StoreAsset }): JSX.Element {
  const Icon = asset.type === "THEME" ? SwatchBook : asset.type === "TEMPLATE" ? FileText : Plug;
  const imageUrl = asset.metadata.media?.coverImageUrl;
  const accent = typeAccent[asset.type];

  return (
    <article
      className="group flex min-h-[360px] flex-col overflow-hidden rounded-xl transition hover:-translate-y-1 hover:shadow-2xl"
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
    >
      {/* 커버 이미지 */}
      <div className="relative h-36" style={{ background: "var(--bg-overlay)" }}>
        {imageUrl ? (
          <img alt="" className="h-full w-full object-cover" src={imageUrl} />
        ) : (
          <div
            className="flex h-full items-center justify-center"
            style={{ background: `linear-gradient(135deg, var(--bg-overlay), ${accent.iconBg})` }}
          >
            <Icon size={38} style={{ color: accent.color, opacity: 0.7 }} />
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <span
            className="rounded-full px-3 py-1 text-xs font-black"
            style={{ background: accent.bg, color: accent.color }}
          >
            {assetTypeLabel[asset.type]}
          </span>
          <span
            className="rounded-full px-3 py-1 text-xs font-black"
            style={{ background: "rgba(32,197,188,0.15)", color: "var(--teal)" }}
          >
            무료
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2
          className="line-clamp-1 text-lg font-black"
          style={{ color: "var(--text-primary)" }}
        >
          {asset.title}
        </h2>
        <p
          className="mt-2 flex-1 text-sm leading-6 line-clamp-3"
          style={{ color: "var(--text-secondary)" }}
        >
          {asset.metadata.summary ?? asset.metadata.description ?? "무료 에셋입니다."}
        </p>
        {/* 평점 */}
        {asset.avgRating != null && asset.avgRating > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <Star size={13} fill="currentColor" style={{ color: "#fbbf24" }} />
            <span className="text-xs font-bold" style={{ color: "#fbbf24" }}>{(asset.avgRating).toFixed(1)}</span>
            {asset.reviewCount != null && asset.reviewCount > 0 && (
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>({asset.reviewCount})</span>
            )}
          </div>
        )}

        <div className="mt-5 grid gap-2">
          <InstallButton assetId={asset.id} />
          <div className="grid grid-cols-2 gap-2">
            <Link className="button-secondary" to={`/assets/${asset.id}`}>
              상세
              <ArrowRight size={16} />
            </Link>
            <AssetCommerceActions assetId={asset.id} />
          </div>
        </div>
      </div>
    </article>
  );
}
