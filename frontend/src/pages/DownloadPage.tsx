import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Download, MonitorDown, ShieldCheck } from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import { getAppReleases } from "../lib/api";
import type { AppRelease } from "../types";

const FALLBACK_RELEASE: AppRelease = {
  id: "fallback",
  platform: "windows",
  channel: "stable",
  version: "0.2.0",
  downloadUrl: "https://d36v39m4b0nmuu.cloudfront.net/releases/MarkVas%20Setup%200.2.0.exe",
  releaseNotes: "설치된 에셋 관리 기능 추가 (테마·템플릿·플러그인 통합 관리 및 삭제 지원).",
  checksum: "",
  signature: undefined,
  publishedAt: "2026-06-22T00:00:00Z",
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
    <main className="min-h-screen" style={{ background: "var(--bg-base)" }}>
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
              <article
                className="rounded-2xl p-6"
                key={latest.id}
                style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black" style={{ color: "var(--text-primary)" }}>Windows 설치 파일</h2>
                    <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                      v{latest.version} · {latest.channel} · {new Date(latest.publishedAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-black uppercase"
                    style={{ background: "rgba(32,197,188,0.15)", color: "var(--teal)" }}
                  >
                    최신
                  </span>
                </div>
                <p className="min-h-10 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                  {latest.releaseNotes}
                </p>
                <dl className="mt-4 space-y-2 text-xs" style={{ color: "var(--text-muted)" }}>
                  <div>
                    <dt className="font-bold" style={{ color: "var(--text-secondary)" }}>Checksum (SHA-256)</dt>
                    <dd
                      className="mt-1 break-all rounded-lg p-2 font-mono"
                      style={{ background: "var(--bg-overlay)", color: "var(--text-secondary)" }}
                    >
                      {latest.checksum}
                    </dd>
                  </div>
                  {latest.signature && (
                    <div>
                      <dt className="font-bold" style={{ color: "var(--text-secondary)" }}>Signature</dt>
                      <dd
                        className="mt-1 break-all rounded-lg p-2 font-mono"
                        style={{ background: "var(--bg-overlay)", color: "var(--text-secondary)" }}
                      >
                        {latest.signature}
                      </dd>
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
                    className="flex items-center gap-1.5 text-sm font-bold transition"
                    style={{ color: "var(--text-muted)" }}
                    onClick={() => setShowHistory((v) => !v)}
                  >
                    {showHistory ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    이전 버전 ({older.length})
                  </button>
                  {showHistory && (
                    <div className="mt-3 space-y-3">
                      {older.map((r) => (
                        <article
                          key={r.id}
                          className="flex items-center justify-between gap-4 rounded-xl p-4"
                          style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
                        >
                          <div className="min-w-0">
                            <p className="font-bold" style={{ color: "var(--text-primary)" }}>v{r.version}</p>
                            <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                              {new Date(r.publishedAt).toLocaleDateString("ko-KR")} · {r.channel}
                            </p>
                            <p className="mt-1 truncate text-sm" style={{ color: "var(--text-secondary)" }}>
                              {r.releaseNotes}
                            </p>
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
          <aside
            className="rounded-2xl p-6"
            style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}
          >
            <div className="mb-3 flex items-center gap-2 text-sm font-black" style={{ color: "var(--teal)" }}>
              <ShieldCheck size={16} />
              보안 안내
            </div>
            <p className="text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
              배포 파일은 GitHub Releases에 연결됩니다.
            </p>
          </aside>
        )}
      </section>
    </main>
  );
}
