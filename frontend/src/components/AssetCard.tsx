import { Link } from "react-router-dom";
import type { StoreAsset } from "../types";
import { ArrowRight, FileText, Plug, SwatchBook } from "lucide-react";
import { AssetCommerceActions } from "./AssetCommerceActions";
import { InstallButton } from "./InstallButton";

const assetTypeLabel: Record<StoreAsset["type"], string> = {
  THEME: "테마",
  TEMPLATE: "템플릿",
  PLUGIN: "플러그인"
};

export function AssetCard({ asset }: { asset: StoreAsset }): JSX.Element {
  const Icon = asset.type === "THEME" ? SwatchBook : asset.type === "TEMPLATE" ? FileText : Plug;
  const imageUrl = asset.metadata.media?.coverImageUrl;

  return (
    <article className="group flex min-h-[360px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-950/10">
      <div className="relative h-36 bg-slate-950">
        {imageUrl ? (
          <img alt="" className="h-full w-full object-cover" src={imageUrl} />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#111827,#1d4ed8)] text-white">
            <Icon size={38} />
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-900">{assetTypeLabel[asset.type]}</span>
          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">무료</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="line-clamp-1 text-lg font-black text-slate-950">{asset.title}</h2>
        <p className="mt-2 min-h-16 flex-1 text-sm leading-6 text-slate-600">
          {asset.metadata.summary ?? asset.metadata.description ?? "무료 에셋입니다."}
        </p>

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