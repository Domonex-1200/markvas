import Link from "next/link";
import { ArrowLeft, PackageCheck } from "lucide-react";

export default function CartPage(): JSX.Element {
  return (
    <main>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <h1 className="text-xl font-bold">장바구니</h1>
          <Link className="button-secondary" href="/">
            <ArrowLeft size={16} />
            스토어
          </Link>
        </div>
      </header>
      <section className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded border border-line bg-white p-8 text-center shadow-sm">
          <PackageCheck className="mx-auto mb-4 text-accent" size={32} />
          <h2 className="text-xl font-bold">1차 무료 스토어에서는 장바구니를 사용하지 않습니다.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            지금은 모든 공개 에셋을 무료로 설치하는 방식입니다. 에셋 상세 화면에서 바로 설치하거나 찜 목록에 보관해 주세요.
          </p>
          <Link className="button mt-6" href="/">
            무료 에셋 둘러보기
          </Link>
        </div>
      </section>
    </main>
  );
}
