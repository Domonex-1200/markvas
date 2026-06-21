import { SiteHeader } from "../components/SiteHeader";
import { AssetCreateForm } from "../components/AssetCreateForm";

export default function DeveloperNewAssetPage(): JSX.Element {
  return (
    <main style={{ background: "var(--bg-base)" }}>
      <SiteHeader />
      <section className="hero-dark" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="mx-auto max-w-3xl px-6 py-8">
          <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>에셋 등록</h1>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>테마, 템플릿, 플러그인을 스토어에 등록합니다.</p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-6 py-8">
        <AssetCreateForm />
      </section>
    </main>
  );
}
