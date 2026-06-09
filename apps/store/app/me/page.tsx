import { InstalledAssetsPanel } from "../../src/components/InstalledAssetsPanel";

export default function MyAssetsPage(): JSX.Element {
  return (
    <main>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <h1 className="text-xl font-bold">내 에셋</h1>
          <a className="button-secondary" href="/">
            스토어
          </a>
        </div>
      </header>
      <section className="mx-auto max-w-4xl px-6 py-8">
        <InstalledAssetsPanel />
      </section>
    </main>
  );
}
