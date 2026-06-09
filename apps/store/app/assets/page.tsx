import Link from "next/link";
import { PackageCheck, UploadCloud } from "lucide-react";
import { AssetFilter } from "../../src/components/AssetFilter";
import { SiteHeader } from "../../src/components/SiteHeader";
import { fallbackAssets } from "../../src/lib/fallback-assets";
import { getAssets } from "../../src/lib/api";

export const revalidate = 60;

export default async function AssetsPage(): Promise<JSX.Element> {
  const loadedAssets = await getAssets().catch(() => fallbackAssets);
  const assets = loadedAssets.length > 0 ? loadedAssets : fallbackAssets;

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <SiteHeader />

      <section className="hero-dark border-b border-white/10 text-white" id="hero-section">

        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_340px] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black">
              <PackageCheck size={16} />
              MarkVas 에셋스토어
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-tight">무료 에셋을 설치하세요.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/72">테마, 템플릿, 플러그인을 MarkVas에 연결합니다.</p>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/10 p-5 shadow-xl shadow-slate-950/20">
            <div className="mb-3 flex items-center gap-2 text-sm font-black">
              <UploadCloud size={16} />
              제작자 등록
            </div>
            <p className="text-sm leading-6 text-white/72">이미지, 설명, 코드를 등록합니다.</p>
            <Link className="button-light mt-4 w-full" href="/developer/assets/new">
              에셋 등록하기
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <AssetFilter assets={assets} />
      </section>
    </main>
  );
}
