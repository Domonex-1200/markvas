import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Download, MonitorDown, ShieldCheck } from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import { getAppReleases } from "../lib/api";
import type { AppRelease } from "../types";

const FALLBACK_RELEASE: AppRelease = {
  id: "fallback",
  platform: "windows",
  channel: "stable",
  version: "0.1.0",
  downloadUrl: "https://d36v39m4b0nmuu.cloudfront.net/releases/MarkVas-Setup-0.1.0.exe",
  releaseNotes: "MarkVas 첫 번째 공식 릴리즈입니다.",
  checksum: "",
  signature: undefined,
  publishedAt: "2026-06-01T00:00:00Z",
};

export default function DownloadPage(): JSX.Element {
  const [releases, setReleases] = useState<AppRelease[]>([FALLBACK_RELEASE]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    getAppReleases()
      .then((data) => {
        const filtered = data.filter((r) => r.platform === "windows").sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        if (filtered.length > 0) setReleases(filtered);
      })
      .catch(() => { /* fallback already set */ })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <SiteHeader />

      <section className="hero-dark text-white" id="hero-section">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black">
            <MonitorDown size={16} />
            Desktop App
          </div>
          <h1 className="max-w-3xl text-5xl font-black leading-tight">MarkVas 다운로드</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/72">Windows에서 바로 시작하세요.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-6 py-8 md:grid-cols-2">
        {releases.length > 0 && (() => {
          const [latest, ...older] = releases;
          return (
            <>
              <article className="surface-card p-6" key={latest.id}>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-slate-950">Windows 설치 파일</h2>
                    <p className="mt-1 text-sm text-slate-500">v{latest.version} · {latest.channel} · {new Date(latest.publishedAt).toLocaleDateString("ko-KR")}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase text-blue-700">최신</span>
                </div>
                <p className="min-h-10 text-sm leading-6 text-slate-700">{latest.releaseNotes}</p>
                <dl className="mt-4 space-y-2 text-xs text-slate-500">
                  <div>
                    <dt className="font-bold text-slate-700">Checksum (SHA-256)</dt>
                    <dd className="mt-1 break-all rounded-md bg-slate-50 p-2 font-mono">{latest.checksum}</dd>
                  </div>
                  {latest.signature && (
                    <div>
                      <dt className="font-bold text-slate-700">Signature</dt>
                      <dd className="mt-1 break-all rounded-md bg-slate-50 p-2 font-mono">{latest.signature}</dd>
                    </div>
                  )}
                </dl>
                <a className="button mt-5 w-full" href={latest.downloadUrl}>
                  <Download size={16} />
                  Windows 다운로드 (v{latest.version})
                </a>
              </article>

              {older.length > 0 && (
                <div className="col-span-2">
                  <button
                    className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800"
                    onClick={() => setShowHistory((v) => !v)}
                  >
                    {showHistory ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    이전 버전 ({older.length})
                  </button>
                  {showHistory && (
                    <div className="mt-3 space-y-3">
                      {older.map((r) => (
                        <article key={r.id} className="surface-card flex items-center justify-between gap-4 p-4">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800">v{r.version}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{new Date(r.publishedAt).toLocaleDateString("ko-KR")} · {r.channel}</p>
                            <p className="mt-1 truncate text-sm text-slate-600">{r.releaseNotes}</p>
                          </div>
                          <a className="button-secondary shrink-0 text-sm" href={r.downloadUrl}>
                            <Download size={14} />
                            다운로드
                          </a>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          );
        })()}
        {!loading && (
          <aside className="surface-card p-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-blue-700">
              <ShieldCheck size={16} />
              보안 안내
            </div>
            <p className="text-sm leading-6 text-slate-600">배포 파일은 GitHub Releases에 연결됩니다.</p>
          </aside>
        )}
      </section>
    </main>
  );
}
