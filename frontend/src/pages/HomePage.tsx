import { Link } from "react-router-dom";
import {
  ArrowRight,
  Download,
  FileText,
  Layers3,
  Plug,
  Search,
  Sparkles,
  SwatchBook,
  Zap,
  Shield,
  Globe,
  Star,
} from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";

export default function HomePage(): JSX.Element {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7fb]">
      <SiteHeader />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#060a1a 0%,#0c1232 50%,#111b4a 100%)" }}>
        {/* 배경 glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 top-0 h-[600px] w-[600px] rounded-full opacity-20" style={{ background: "radial-gradient(circle,#3b82f6 0%,transparent 70%)" }} />
          <div className="absolute -right-20 top-20 h-[500px] w-[500px] rounded-full opacity-10" style={{ background: "radial-gradient(circle,#8b5cf6 0%,transparent 70%)" }} />
          <div className="absolute bottom-0 left-1/2 h-[300px] w-[800px] -translate-x-1/2 opacity-10" style={{ background: "radial-gradient(ellipse,#60a5fa 0%,transparent 70%)" }} />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 backdrop-blur-sm">
            <Sparkles size={14} />
            마크다운 기반 노트 + 에셋 스토어
          </div>

          <h1 className="mx-auto max-w-4xl text-5xl font-black leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
            생각을 정리하는{" "}
            <span className="relative inline-block">
              <span className="relative z-10" style={{ backgroundImage: "linear-gradient(90deg,#60a5fa,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                새로운 방식
              </span>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/60">
            MarkVas는 마크다운으로 노트를 작성하고,<br className="hidden sm:block" />
            테마·템플릿·플러그인으로 나만의 환경을 만드는 데스크톱 앱입니다.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-white px-7 text-sm font-black text-slate-900 shadow-lg shadow-white/10 transition hover:bg-blue-50"
              to="/download"
            >
              <Download size={18} />
              무료 다운로드
            </Link>
            <Link
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-7 text-sm font-bold text-white backdrop-blur-sm transition hover:border-white/30 hover:bg-white/12"
              to="/assets"
            >
              에셋 스토어 보기
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* 앱 미리보기 모형 */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl" style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)" }}>
              {/* 윈도우 크롬 */}
              <div className="flex items-center gap-2 border-b border-white/8 bg-[#0d1226] px-5 py-3.5">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                <div className="mx-4 flex-1 rounded-md bg-white/5 px-3 py-1 text-center text-xs text-white/30">
                  MarkVas — My Notes
                </div>
              </div>
              {/* 앱 내부 */}
              <div className="grid min-h-[420px] bg-[#0f1428] md:grid-cols-[200px_1fr_260px]">
                {/* 사이드바 */}
                <aside className="hidden border-r border-white/8 bg-[#0a0e1f] p-4 md:block">
                  <div className="mb-3 flex items-center gap-2 rounded-lg bg-white/6 px-3 py-2 text-xs font-bold text-white/50">
                    <Search size={12} />
                    노트 검색
                  </div>
                  <div className="mb-1 mt-4 px-2 text-[10px] font-black uppercase tracking-wider text-white/25">Workspace</div>
                  {[
                    { icon: FileText, label: "Daily Notes", active: false },
                    { icon: FileText, label: "Product Plan", active: true },
                    { icon: FileText, label: "Projects", active: false },
                    { icon: Plug, label: "플러그인", active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`mb-1 flex items-center gap-2 rounded-md px-3 py-2 text-xs ${item.active ? "bg-blue-600/20 font-bold text-blue-300" : "text-white/50 hover:bg-white/5"}`}
                    >
                      <item.icon size={12} />
                      {item.label}
                    </div>
                  ))}
                </aside>
                {/* 에디터 */}
                <section className="p-6 text-white">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <div className="text-base font-black text-white">Product Plan.md</div>
                      <div className="mt-0.5 text-xs text-white/30">자동 저장됨 · split view</div>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="h-7 w-7 rounded-md border border-white/8 bg-white/6" />
                      <span className="h-7 w-7 rounded-md border border-white/8 bg-white/6" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-5 w-64 rounded bg-white/30" />
                    <div className="h-3 rounded bg-white/12" />
                    <div className="h-3 w-10/12 rounded bg-white/12" />
                    <div className="h-3 w-7/12 rounded bg-white/12" />
                    <div className="mt-5 rounded-lg border border-blue-500/20 bg-blue-500/8 p-4">
                      <div className="mb-2 h-3 w-32 rounded bg-blue-400/40" />
                      <div className="h-2 w-10/12 rounded bg-blue-400/20" />
                      <div className="mt-1.5 h-2 w-7/12 rounded bg-blue-400/20" />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="h-16 rounded-lg border border-white/8 bg-white/5" />
                      <div className="h-16 rounded-lg border border-white/8 bg-white/5" />
                      <div className="h-16 rounded-lg border border-white/8 bg-white/5" />
                    </div>
                  </div>
                </section>
                {/* 미리보기 */}
                <aside className="hidden border-l border-white/8 bg-[#fbfaf7] p-5 text-slate-900 md:block">
                  <div className="mb-4 text-xs font-black uppercase tracking-wider text-blue-600">Preview</div>
                  <div className="mb-3 h-5 w-44 rounded bg-slate-900/70" />
                  <div className="space-y-2">
                    <div className="h-2.5 rounded bg-slate-900/14" />
                    <div className="h-2.5 w-10/12 rounded bg-slate-900/14" />
                    <div className="h-2.5 w-8/12 rounded bg-slate-900/14" />
                  </div>
                  <div className="mt-5 rounded-lg border-l-4 border-blue-600 bg-blue-50 p-3 shadow-sm">
                    <div className="mb-1.5 h-2.5 w-28 rounded bg-blue-300/60" />
                    <div className="h-2 w-full rounded bg-blue-200/50" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-2 w-9/12 rounded bg-slate-900/10" />
                    <div className="h-2 w-full rounded bg-slate-900/10" />
                    <div className="h-2 w-6/12 rounded bg-slate-900/10" />
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGO BAR ─────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-5 text-center text-xs font-bold uppercase tracking-widest text-slate-400">주요 기능</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: FileText, label: "마크다운 편집", sub: "실시간 프리뷰" },
              { icon: SwatchBook, label: "테마 시스템", sub: "스타일 커스터마이징" },
              { icon: Plug, label: "플러그인", sub: "기능 확장" },
              { icon: Layers3, label: "에셋 스토어", sub: "무료 에셋 제공" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-600 text-white">
                  <item.icon size={16} />
                </span>
                <div>
                  <div className="text-sm font-black text-slate-900">{item.label}</div>
                  <div className="text-xs text-slate-500">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES 1 ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
              <FileText size={15} />
              마크다운 에디터
            </div>
            <h2 className="text-4xl font-black leading-tight text-slate-950">
              글쓰기에만<br />집중하세요.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              복잡한 설정 없이 폴더를 열고 바로 작성합니다.
              Split View로 편집과 미리보기를 동시에 확인하세요.
            </p>
            <ul className="mt-6 space-y-3">
              {["실시간 Markdown 미리보기", "폴더 기반 워크스페이스", "자동 저장", "코드 블록 구문 강조"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-700">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link className="button mt-8" to="/download">
              <Download size={16} />
              앱 다운로드
            </Link>
          </div>
          {/* 에디터 목업 */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="ml-3 text-xs font-semibold text-slate-400">notes / readme.md</span>
            </div>
            <div className="grid grid-cols-2">
              <div className="border-r border-slate-100 p-5">
                <div className="space-y-2 font-mono text-xs text-slate-700">
                  <div><span className="text-violet-600"># </span><span className="font-black">프로젝트 계획</span></div>
                  <div className="h-1" />
                  <div><span className="text-slate-400">## </span>목표</div>
                  <div className="h-1" />
                  <div><span className="text-blue-500">- [x] </span>기획 완료</div>
                  <div><span className="text-blue-500">- [x] </span>디자인 완료</div>
                  <div><span className="text-slate-400">- [ ] </span>개발 시작</div>
                  <div className="h-1" />
                  <div><span className="text-slate-400">```js</span></div>
                  <div><span className="text-emerald-600">const</span> <span className="text-blue-600">markvas</span> = <span className="text-amber-600">'awesome'</span></div>
                  <div><span className="text-slate-400">```</span></div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="mb-2 text-base font-black text-slate-900">프로젝트 계획</h3>
                <h4 className="mb-1.5 text-sm font-bold text-slate-700">목표</h4>
                <ul className="space-y-1 text-xs text-slate-600">
                  <li className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span>기획 완료</li>
                  <li className="flex items-center gap-1.5"><span className="text-emerald-500">✓</span>디자인 완료</li>
                  <li className="flex items-center gap-1.5"><span className="text-slate-300">○</span>개발 시작</li>
                </ul>
                <div className="mt-3 rounded-md bg-slate-900 px-3 py-2">
                  <code className="text-xs"><span className="text-blue-400">const</span> <span className="text-white">markvas</span> = <span className="text-amber-400">'awesome'</span></code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES 2 ───────────────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* 에셋 스토어 목업 */}
            <div className="order-2 lg:order-1">
              <div className="grid gap-3">
                {[
                  { type: "THEME", icon: SwatchBook, name: "Dark Void Theme", desc: "눈이 편안한 다크 테마", color: "bg-violet-100 text-violet-700", badge: "테마" },
                  { type: "TEMPLATE", icon: FileText, name: "Weekly Review", desc: "주간 회고와 계획 템플릿", color: "bg-emerald-100 text-emerald-700", badge: "템플릿" },
                  { type: "PLUGIN", icon: Plug, name: "TOC Generator", desc: "목차 자동 생성 플러그인", color: "bg-amber-100 text-amber-700", badge: "플러그인" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md">
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${item.color}`}>
                      <item.icon size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">{item.name}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">{item.badge}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
                      <Star size={12} className="fill-blue-600" />
                      무료
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 text-sm font-black text-violet-700">
                <Layers3 size={15} />
                에셋 스토어
              </div>
              <h2 className="text-4xl font-black leading-tight text-slate-950">
                테마, 템플릿, 플러그인으로<br />나만의 환경.
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                무료 에셋을 다운로드하고 앱에 바로 적용하세요.
                테마로 색상을 바꾸고, 템플릿으로 빠르게 시작하고,
                플러그인으로 기능을 확장합니다.
              </p>
              <Link className="button mt-8" to="/assets">
                에셋 스토어 가기
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUE PROPS ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-black text-slate-950">왜 MarkVas인가요?</h2>
          <p className="mt-3 text-slate-500">복잡하지 않게, 필요한 것만.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Zap,
              color: "bg-amber-100 text-amber-700",
              title: "빠른 시작",
              desc: "설치 후 폴더를 열면 바로 작성할 수 있습니다. 계정 없이도 로컬에서 동작합니다.",
            },
            {
              icon: Shield,
              color: "bg-emerald-100 text-emerald-700",
              title: "로컬 우선",
              desc: "파일은 내 컴퓨터에 저장됩니다. 클라우드 의존 없이 오프라인에서도 사용합니다.",
            },
            {
              icon: Layers3,
              color: "bg-blue-100 text-blue-700",
              title: "무한 확장",
              desc: "테마·템플릿·플러그인으로 원하는 기능을 추가하세요. 모두 무료로 제공됩니다.",
            },
            {
              icon: Globe,
              color: "bg-violet-100 text-violet-700",
              title: "Markdown 표준",
              desc: "업계 표준 마크다운 문법을 그대로 사용합니다. 다른 도구와 호환됩니다.",
            },
            {
              icon: SwatchBook,
              color: "bg-rose-100 text-rose-700",
              title: "테마 시스템",
              desc: "어두운 테마, 밝은 테마, 노션 스타일까지. 취향에 맞게 에디터를 꾸며보세요.",
            },
            {
              icon: Sparkles,
              color: "bg-teal-100 text-teal-700",
              title: "지속 업데이트",
              desc: "새 에셋과 기능이 계속 추가됩니다. 무료 계정으로 업데이트를 받아보세요.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <span className={`mb-4 grid h-11 w-11 place-items-center rounded-xl ${item.color}`}>
                <item.icon size={20} />
              </span>
              <h3 className="text-base font-black text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-black text-slate-950">3단계로 시작</h2>
          <p className="mt-3 text-slate-500">설치부터 에셋 적용까지 5분이면 충분합니다.</p>
          <div className="relative mt-12 grid gap-6 sm:grid-cols-3">
            {/* 연결선 */}
            <div className="absolute left-1/4 right-1/4 top-6 hidden h-px bg-slate-200 sm:block" />
            {[
              { step: "01", title: "앱 다운로드", desc: "Windows 설치 파일을 받아 설치하세요. 1분이면 완료됩니다.", icon: Download },
              { step: "02", title: "에셋 선택", desc: "에셋 스토어에서 원하는 테마, 템플릿, 플러그인을 골라 등록하세요.", icon: Layers3 },
              { step: "03", title: "앱에서 사용", desc: "앱에 로그인하면 에셋이 자동으로 동기화됩니다.", icon: Zap },
            ].map((step) => (
              <article key={step.step} className="relative flex flex-col items-center text-center">
                <div className="relative mb-4 grid h-14 w-14 place-items-center rounded-2xl border-2 border-blue-100 bg-blue-50 text-blue-700">
                  <step.icon size={22} />
                  <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-blue-600 text-[10px] font-black text-white">{step.step}</span>
                </div>
                <h3 className="mb-2 font-black text-slate-950">{step.title}</h3>
                <p className="text-sm leading-6 text-slate-500">{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20" style={{ background: "linear-gradient(135deg,#060a1a 0%,#0c1232 60%,#1a1060 100%)" }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full opacity-15" style={{ background: "radial-gradient(circle,#3b82f6 0%,transparent 70%)" }} />
          <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle,#8b5cf6 0%,transparent 70%)" }} />
        </div>
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-4xl font-black text-white">지금 바로 시작하세요</h2>
          <p className="mt-4 leading-7 text-white/60">
            무료로 다운로드하고, 무료 에셋으로 바로 사용하세요.<br />
            계정을 만들면 에셋을 앱에 동기화할 수 있습니다.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-white px-7 text-sm font-black text-slate-900 shadow-lg transition hover:bg-blue-50"
              to="/download"
            >
              <Download size={18} />
              무료 다운로드
            </Link>
            <Link
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-7 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/15"
              to="/register"
            >
              무료 회원가입
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-slate-400">
          © 2026 MarkVas. 학습 목적 프로젝트입니다.
        </div>
      </footer>
    </main>
  );
}
