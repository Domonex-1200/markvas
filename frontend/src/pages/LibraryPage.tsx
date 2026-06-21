import { LibraryPanel } from "../components/LibraryPanel";
import { SiteHeader } from "../components/SiteHeader";

export default function LibraryPage(): JSX.Element {
  return (
    <main>
      <SiteHeader />
      <section className="hero-dark">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <h1 className="text-3xl font-black text-white">내 라이브러리</h1>
          <p className="mt-2 text-sm leading-6 text-white/60">설치 완료된 나의 에셋 목록을 확인합니다.</p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 py-8">
        <LibraryPanel />
      </section>
    </main>
  );
}
