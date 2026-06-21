import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PackageCheck, UploadCloud } from "lucide-react";
import { AssetFilter } from "../components/AssetFilter";
import { SiteHeader } from "../components/SiteHeader";
import { getAssets } from "../lib/api";
import type { StoreAsset } from "../types";

export default function AssetsPage(): JSX.Element {
  const [assets, setAssets] = useState<StoreAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAssets()
      .then(setAssets)
      .catch(() => setError("에셋 목록을 불러오지 못했습니다. 서버 연결을 확인하세요."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <SiteHeader />

      <section className="hero-dark border-b border-white/10 text-white" id="hero-section">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_340px] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black">
              <PackageCheck size={16} />
              MarkVas 에셋 스토어
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-tight">원하는 에셋을 찾아보세요</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/72">테마, 템플릿, 플러그인으로 MarkVas를 확장하세요.</p>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/10 p-5 shadow-xl shadow-slate-950/20">
            <div className="mb-3 flex items-center gap-2 text-sm font-black">
              <UploadCloud size={16} />
              개발자 등록
            </div>
            <p className="text-sm leading-6 text-white/72">테마, 템플릿, 플러그인을 등록합니다.</p>
            <Link className="button-light mt-4 w-full" to="/developer/assets/new">
              에셋 등록하기
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {loading && (
          <div className="py-20 text-center" style={{ color: "var(--text-muted)" }}>불러오는 중...</div>
        )}
        {error && (
          <div className="rounded-xl px-6 py-10 text-center" style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
            <p className="font-bold">연결 오류</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}
        {!loading && !error && <AssetFilter assets={assets} />}
      </section>
    </main>
  );
}
