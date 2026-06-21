import { Link } from "react-router-dom";
import { PackageCheck } from "lucide-react";

export function CartPanel(): JSX.Element {
  return (
    <section className="rounded-2xl p-8 text-center" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
      <PackageCheck className="mx-auto mb-4" size={32} style={{ color: "var(--teal)" }} />
      <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>장바구니는 이후 결제 단계에서 다시 연결합니다.</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
        현재 스토어는 결제 없는 무료 에셋 설치 흐름을 우선합니다. 설치한 에셋은 라이브러리에서 확인할 수 있습니다.
      </p>
      <Link className="button mt-6 inline-flex" to="/">
        무료 에셋 둘러보기
      </Link>
    </section>
  );
}
