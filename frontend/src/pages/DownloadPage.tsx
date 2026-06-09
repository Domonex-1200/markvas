import { useEffect, useState } from "react";
import { Download, MonitorDown, ShieldCheck } from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import { getAppReleases } from "../lib/api";
import type { AppRelease } from "../types";

export default function DownloadPage(): JSX.Element {
  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAppReleases()
      .then((data) => setReleases(data.filter((r) => r.platform === "windows")))
      .catch(() => setError("릴리즈 정보를 불러오지 못했습니다. 서버 연결을 확인하세요."))
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
        {loading && (
          <div className="col-span-2 py-20 text-center text-slate-500">불러오는 중...</div>
        )}
        {error && (
          <div className="col-span-2 rounded-lg border border-red-200 bg-red-50 px-6 py-10 text-center text-red-600">
            <p className="font-bold">연결 오류</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}
        {!loading && !error && releases.map((release) => (
          <article className="surface-card p-6" key={release.id}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">Windows 설치 파일</h2>
                <p className="mt-1 text-sm text-slate-500">v{release.version} · {release.channel}</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase text-blue-700">windows</span>
            </div>
            <p className="min-h-20 text-sm leading-6 text-slate-700">{release.releaseNotes}</p>
            <dl className="mt-4 space-y-2 text-xs text-slate-500">
              <div>
                <dt className="font-bold text-slate-700">Checksum</dt>
                <dd className="mt-1 break-all rounded-md bg-slate-50 p-2 font-mono">{release.checksum}</dd>
              </div>
              {release.signature && (
                <div>
                  <dt className="font-bold text-slate-700">Signature</dt>
                  <dd className="mt-1 break-all rounded-md bg-slate-50 p-2 font-mono">{release.signature}</dd>
                </div>
              )}
            </dl>
            <a className="button mt-5 w-full" href={release.downloadUrl}>
              <Download size={16} />
              Windows 다운로드
            </a>
          </article>
        ))}
        {!loading && !error && releases.length === 0 && (
          <div className="col-span-2 py-20 text-center text-slate-500">등록된 릴리즈가 없습니다.</div>
        )}

        {!loading && !error && (
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
