import { SiteHeader } from "../components/SiteHeader";
import { WishlistPanel } from "../components/WishlistPanel";

export default function WishlistPage(): JSX.Element {
  return (
    <main style={{ background: "var(--bg-base)" }}>
      <SiteHeader />
      <section className="hero-dark">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>찜한 에셋</h1>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>나중에 설치하려고 저장해 둔 에셋 목록입니다.</p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 py-8" style={{ background: "var(--bg-base)" }}>
        <WishlistPanel />
      </section>
    </main>
  );
}
