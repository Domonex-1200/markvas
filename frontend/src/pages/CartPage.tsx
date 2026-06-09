import { Link } from "react-router-dom";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { CartPanel } from "../components/CartPanel";
import { SiteHeader } from "../components/SiteHeader";

export default function CartPage(): JSX.Element {
  return (
    <main>
      <SiteHeader />
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <h1 className="text-xl font-bold">장바구니</h1>
          <Link className="button-secondary" to="/">
            <ArrowLeft size={16} />
            홈으로
          </Link>
        </div>
      </header>
      <section className="mx-auto max-w-4xl px-6 py-8">
        <CartPanel />
      </section>
    </main>
  );
}
