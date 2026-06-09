import { AdminReviewPanel } from "../components/AdminReviewPanel";
import { SiteHeader } from "../components/SiteHeader";

export default function AdminReviewPage(): JSX.Element {
  return (
    <main>
      <SiteHeader />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <h1 className="text-3xl font-black">에셋 심사</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">제출된 에셋을 검토하고 승인 또는 거절합니다.</p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 py-8">
        <AdminReviewPanel />
      </section>
    </main>
  );
}
