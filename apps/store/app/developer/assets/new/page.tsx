import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AssetCreateForm } from "../../../../src/components/AssetCreateForm";
import { AuthGuard } from "../../../../src/components/AuthGuard";
import { SiteHeader } from "../../../../src/components/SiteHeader";

export default function NewAssetPage(): JSX.Element {
  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <SiteHeader />
      <AuthGuard>
        <section className="hero-dark text-white" id="hero-section">
          <div className="mx-auto max-w-5xl px-6 py-10">
            <Link className="mb-6 inline-flex items-center gap-2 text-sm font-black text-white/75 transition hover:text-white" href="/assets">
              <ArrowLeft size={16} />
              에셋스토어로 돌아가기
            </Link>
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black">
                <ShieldCheck size={16} />
                인증된 제작자
              </div>
              <h1 className="text-4xl font-black leading-tight">에셋 등록</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/72">테마, 템플릿, 플러그인을 등록합니다.</p>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-5xl px-6 py-8">
          <AssetCreateForm />
        </section>
      </AuthGuard>
    </main>
  );
}
