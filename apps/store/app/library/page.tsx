import { LibraryPanel } from "../../src/components/LibraryPanel";
import { SiteHeader } from "../../src/components/SiteHeader";

export default function LibraryPage(): JSX.Element {
  return (
    <main>
      <SiteHeader />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <h1 className="text-3xl font-black">내 라이브러리</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">설치 권한을 받은 무료 에셋을 확인합니다.</p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 py-8">
        <LibraryPanel />
      </section>
    </main>
  );
}
