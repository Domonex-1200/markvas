import { SiteHeader } from "../components/SiteHeader";
import { WishlistPanel } from "../components/WishlistPanel";

export default function WishlistPage(): JSX.Element {
  return (
    <main>
      <SiteHeader />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <h1 className="text-3xl font-black">찜한 에셋</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">나중에 설치하려고 저장해 둔 에셋 목록입니다.</p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 py-8">
        <WishlistPanel />
      </section>
    </main>
  );
}
