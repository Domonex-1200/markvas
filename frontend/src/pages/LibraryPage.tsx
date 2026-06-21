import { LibraryPanel } from "../components/LibraryPanel";
import { SiteHeader } from "../components/SiteHeader";

export default function LibraryPage(): JSX.Element {
  return (
    <main>
      <SiteHeader />
      <section className="hero-dark">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <h1 className="text-3xl font-black text-white">내 라이브러리</h1>
          <p className="mt-2 text-sm leading-6 text-white/60">에셋을 활성화하면 노트 프로그램에서 설치할 수 있습니다.</p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 py-8">
        <LibraryPanel />
      </section>
    </main>
  );
}
