import { Download, MonitorDown, ShieldCheck } from "lucide-react";
import { SiteHeader } from "../../src/components/SiteHeader";
import { getAppReleases } from "../../src/lib/api";
import { fallbackReleases } from "../../src/lib/fallback-releases";

export const revalidate = 60;

export default async function DownloadPage(): Promise<JSX.Element> {
  const loadedReleases = await getAppReleases().catch(() => fallbackReleases);
  const sourceReleases = loadedReleases.length > 0 ? loadedReleases : fallbackReleases;
  const releases = sourceReleases.filter((release) => release.platform === "windows");

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
        {releases.map((release) => (
          <article className="surface-card p-6" key={release.id}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-950">Windows 설치 파일</h2>
                <p className="mt-1 text-sm text-slate-500">
                  v{release.version} · {release.channel}
                </p>
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

        <aside className="surface-card p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-black text-blue-700">
            <ShieldCheck size={16} />
            1차 배포 메모
          </div>
          <p className="text-sm leading-6 text-slate-600">배포 파일은 GitHub Releases와 연결합니다.</p>
        </aside>
      </section>
    </main>
  );
}
