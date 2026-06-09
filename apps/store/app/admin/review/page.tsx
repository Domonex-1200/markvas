import { AdminReviewPanel } from "../../../src/components/AdminReviewPanel";

export default function AdminReviewPage(): JSX.Element {
  return (
    <main>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold">관리자 심사</h1>
            <p className="mt-1 text-sm text-slate-600">등록된 에셋을 검토하고 게시 상태를 관리합니다.</p>
          </div>
          <a className="button-secondary" href="/">
            스토어
          </a>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-6 py-8">
        <AdminReviewPanel />
      </section>
    </main>
  );
}
