import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Download,
  FileText,
  FolderTree,
  Layers3,
  PackageCheck,
  Plug,
  Search,
  Sparkles,
  SwatchBook,
  UserRound
} from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";

export default function HomePage(): JSX.Element {
  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <SiteHeader />

      <section className="hero-dark overflow-hidden text-white" id="hero-section">
        <div className="mx-auto max-w-5xl px-6 pb-12 pt-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-white">
            <Sparkles size={15} />
            마크다운 기반 메모
          </div>
          <h1 className="whitespace-nowrap text-5xl font-black leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            메모와 에셋을 한 곳에서.
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-white/70">
            Markdown으로 쓰고, 에셋으로 확장합니다.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link className="button-light" to="/download">
              <Download size={17} />
              앱 다운로드
            </Link>
            <Link className="button-dark" to="/assets">
              무료 에셋 보기
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="mt-12">
            <AppPreview />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-10 md:grid-cols-3">
          <FeatureTile icon={<FolderTree size={20} />} title="로컬 워크스페이스" text="폴더를 열고 바로 작성합니다." />
          <FeatureTile icon={<BookOpenCheck size={20} />} title="Markdown 작성" text="편집과 미리보기를 함께 봅니다." />
          <FeatureTile icon={<Layers3 size={20} />} title="에셋 확장" text="테마와 템플릿을 설치합니다." />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 py-12 lg:grid-cols-2">
        <PreviewPanel
          icon={<Download size={18} />}
          label="Download"
          title="데스크톱 앱 다운로드"
          text="Windows 앱을 설치하고 바로 시작합니다."
          href="/download"
          action="다운로드 페이지로"
        >
          <DownloadPreview />
        </PreviewPanel>
        <PreviewPanel
          icon={<PackageCheck size={18} />}
          label="Asset Store"
          title="무료 에셋스토어"
          text="무료 테마와 템플릿을 둘러봅니다."
          href="/assets"
          action="에셋스토어로"
        >
          <StorePreview />
        </PreviewPanel>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[360px_1fr]">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
              <UserRound size={16} />
              로그인 후 이용
            </div>
            <h2 className="text-3xl font-black leading-tight text-slate-950">로그인하면 에셋을 저장하고 동기화합니다.</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">결제 없이 무료 에셋으로 운영합니다.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <FlowStep step="01" title="앱 설치" text="Windows 앱을 설치합니다." />
            <FlowStep step="02" title="에셋 선택" text="필요한 에셋을 고릅니다." />
            <FlowStep step="03" title="앱 동기화" text="앱에서 바로 사용합니다." />
          </div>
        </div>
      </section>
    </main>
  );
}

function AppPreview(): JSX.Element {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-2xl shadow-blue-950/40">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff6b6b]" />
          <span className="h-3 w-3 rounded-full bg-[#f7c948]" />
          <span className="h-3 w-3 rounded-full bg-[#2dd4bf]" />
        </div>
        <div className="text-xs font-black text-white/40">MarkVas</div>
      </div>
      <div className="grid min-h-[380px] md:grid-cols-[200px_1fr_240px]">
        <aside className="hidden border-r border-white/10 bg-[#11172f] p-4 md:block">
          <div className="mb-4 rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm font-black text-white">My_notes</div>
          <PreviewRow icon={<Search size={14} />} text="전체 노트 검색" muted />
          <PreviewRow icon={<FileText size={14} />} text="Daily Notes" />
          <PreviewRow icon={<FileText size={14} />} text="Projects" />
          <PreviewRow icon={<FileText size={14} />} text="Templates" />
          <PreviewRow icon={<Plug size={14} />} text="Plugins" />
        </aside>
        <section className="bg-[#151b34] p-5 text-white">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-lg font-black">Product Plan.md</div>
              <div className="mt-1 text-xs text-white/40">저장됨 · split view</div>
            </div>
            <div className="hidden gap-2 sm:flex">
              <span className="h-8 w-8 rounded-md border border-white/10 bg-white/10" />
              <span className="h-8 w-8 rounded-md border border-white/10 bg-white/10" />
              <span className="h-8 w-8 rounded-md border border-white/10 bg-white/10" />
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#0f1428] p-5">
            <div className="mb-4 h-5 w-64 max-w-full rounded bg-white/35" />
            <div className="space-y-3">
              <div className="h-3 rounded bg-white/16" />
              <div className="h-3 w-11/12 rounded bg-white/16" />
              <div className="h-3 w-8/12 rounded bg-white/16" />
            </div>
            <div className="mt-6 rounded-md border border-blue-300/35 bg-blue-500/12 p-4">
              <div className="mb-3 h-3 w-40 rounded bg-blue-100/55" />
              <div className="h-2 w-10/12 rounded bg-blue-100/30" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="h-20 rounded-md border border-white/10 bg-white/10" />
              <div className="h-20 rounded-md border border-white/10 bg-white/10" />
            </div>
          </div>
        </section>
        <aside className="hidden bg-[#fbfaf7] p-5 text-slate-950 md:block">
          <div className="mb-5 text-sm font-black text-blue-700">Markdown Preview</div>
          <div className="mb-4 h-5 w-52 rounded bg-slate-900/80" />
          <div className="space-y-3">
            <div className="h-3 rounded bg-slate-900/20" />
            <div className="h-3 w-10/12 rounded bg-slate-900/20" />
            <div className="h-3 w-7/12 rounded bg-slate-900/20" />
          </div>
          <div className="mt-7 rounded-md border-l-4 border-blue-600 bg-white p-4 shadow-sm">
            <div className="mb-2 h-3 w-32 rounded bg-blue-200" />
            <div className="h-2 w-10/12 rounded bg-slate-900/15" />
          </div>
        </aside>
      </div>
    </div>
  );
}

function PreviewRow({ icon, text, muted = false }: { icon: JSX.Element; text: string; muted?: boolean }): JSX.Element {
  return (
    <div className={`mb-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm ${muted ? "bg-white/10 text-white/50" : "text-white/80 hover:bg-white/10"}`}>
      {icon}
      {text}
    </div>
  );
}

function FeatureTile({ icon, title, text }: { icon: JSX.Element; title: string; text: string }): JSX.Element {
  return (
    <article className="surface-card p-5">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-blue-700">{icon}</div>
      <h2 className="text-base font-black text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}

function PreviewPanel({
  icon,
  label,
  title,
  text,
  href,
  action,
  children
}: {
  icon: JSX.Element;
  label: string;
  title: string;
  text: string;
  href: string;
  action: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <article className="surface-card p-6">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
        {icon}
        {label}
      </div>
      <h2 className="text-2xl font-black text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
      <div className="my-5">{children}</div>
      <Link className="button-secondary" to={href}>
        {action}
        <ArrowRight size={16} />
      </Link>
    </article>
  );
}

function DownloadPreview(): JSX.Element {
  return (
    <div className="rounded-lg border border-slate-200 bg-[#f7f9fc] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-black">Windows 설치 파일</div>
          <div className="mt-1 text-xs text-slate-500">v0.1.0 · stable</div>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">windows</span>
      </div>
      <div className="rounded-md bg-white p-3 text-xs font-semibold text-slate-500">sha256-dev-windows-placeholder</div>
      <div className="mt-3 flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-black text-white">
        <Download size={15} />
        Windows 다운로드
      </div>
    </div>
  );
}

function StorePreview(): JSX.Element {
  const items = [
    { icon: <SwatchBook size={15} />, title: "테마", subtitle: "편집기 색상과 미리보기 스타일" },
    { icon: <FileText size={15} />, title: "템플릿", subtitle: "반복 노트 구조 저장" },
    { icon: <Plug size={15} />, title: "플러그인", subtitle: "노트 기능 확장" }
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-[#f7f9fc] p-4">
      <div className="space-y-2">
        {items.map((item) => (
          <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2" key={item.title}>
            <span className="grid h-8 w-8 place-items-center rounded-md bg-blue-50 text-blue-700">{item.icon}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-black">{item.title}</div>
              <div className="text-xs text-slate-500">{item.subtitle}</div>
            </div>
            <CheckCircle2 size={16} className="text-blue-600" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowStep({ step, title, text }: { step: string; title: string; text: string }): JSX.Element {
  return (
    <article className="rounded-lg border border-slate-200 bg-[#f7f9fc] p-5">
      <div className="mb-4 text-sm font-black text-blue-700">{step}</div>
      <h3 className="font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}