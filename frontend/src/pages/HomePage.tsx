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
} from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import { useReveal } from "../hooks/useReveal";

/* ── 섹션별 reveal 컨테이너 ───────────────────────────────────────────── */
function Section({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useReveal();
  return (
    <section ref={ref as React.RefObject<HTMLElement>} className={className} style={style}>
      {children}
    </section>
  );
}

export default function HomePage(): JSX.Element {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7fb]">
      <SiteHeader />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#04071a 0%,#090e2e 55%,#0f1a4a 100%)" }}
      >
        {/* 배경 glow orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="glow-animate absolute -left-32 -top-20 h-[680px] w-[680px] rounded-full"
            style={{ background: "radial-gradient(circle,rgba(59,130,246,0.22) 0%,transparent 65%)" }}
          />
          <div
            className="glow-animate-delay absolute -right-16 top-32 h-[500px] w-[500px] rounded-full"
            style={{ background: "radial-gradient(circle,rgba(139,92,246,0.14) 0%,transparent 65%)" }}
          />
          <div
            className="absolute bottom-0 left-1/2 h-64 w-[900px] -translate-x-1/2"
            style={{ background: "radial-gradient(ellipse,rgba(96,165,250,0.08) 0%,transparent 70%)" }}
          />
          {/* 별처럼 보이는 점들 */}
          {[
            { top: "12%", left: "8%", size: 2, delay: "0s" },
            { top: "25%", left: "88%", size: 1.5, delay: "1.2s" },
            { top: "60%", left: "5%", size: 1, delay: "2.1s" },
            { top: "72%", left: "92%", size: 2, delay: "0.6s" },
            { top: "38%", left: "78%", size: 1.5, delay: "1.8s" },
            { top: "85%", left: "22%", size: 1, delay: "0.3s" },
          ].map((star, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                animation: `glow-pulse 4s ease-in-out ${star.delay} infinite`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-28 pt-20 text-center">
          {/* 뱃지 */}
          <div className="animate-fade-in mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-white/5 px-4 py-2 text-sm font-semibold text-blue-300 backdrop-blur-sm">
            <Sparkles size={13} />
            마크다운 노트 앱 — 무료로 시작
          </div>

          {/* 헤드라인 */}
          <h1 className="animate-fade-up delay-100 mx-auto max-w-3xl text-5xl font-black leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
            머릿속 생각을<br />
            <span className="text-gradient">정리하는 공간.</span>
          </h1>

          <p className="animate-fade-up delay-300 mx-auto mt-6 max-w-lg text-lg leading-8 text-white/55">
            복잡한 설정 없이 폴더를 열고 바로 씁니다.<br className="hidden sm:block" />
            테마·템플릿·플러그인으로 취향껏 확장하고요.
          </p>

          {/* CTA 버튼 */}
          <div className="animate-fade-up delay-400 mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              className="group relative inline-flex h-12 items-center gap-2.5 overflow-hidden rounded-xl bg-white px-7 text-sm font-black text-slate-900 shadow-xl shadow-white/10 transition-all hover:scale-[1.03] hover:shadow-2xl"
              to="/download"
            >
              <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-blue-100/50 to-transparent transition-transform duration-500 group-hover:translate-x-[100%]" />
              <Download size={18} />
              무료 다운로드
            </Link>
            <Link
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/6 px-7 text-sm font-bold text-white backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-white/28 hover:bg-white/10"
              to="/assets"
            >
              에셋 구경하기
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* 앱 모형 */}
          <div className="animate-scale-in delay-500 relative mx-auto mt-16 max-w-5xl">
            {/* 뒤에 glow */}
            <div
              className="absolute inset-x-12 -bottom-8 h-16 blur-2xl"
              style={{ background: "linear-gradient(90deg,rgba(59,130,246,0.4),rgba(139,92,246,0.3),rgba(59,130,246,0.4))" }}
            />
            <div
              className="animate-float relative overflow-hidden rounded-2xl"
              style={{ boxShadow: "0 40px 90px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.06)" }}
            >
              {/* 타이틀바 */}
              <div className="flex items-center gap-2 border-b border-white/6 bg-[#0b0f22] px-5 py-3.5">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-sm shadow-red-500/50" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e] shadow-sm shadow-yellow-400/50" />
                <span className="h-3 w-3 rounded-full bg-[#28c840] shadow-sm shadow-green-500/50" />
                <div className="ml-3 flex-1 rounded-md bg-white/5 py-1 text-center text-xs text-white/25">
                  MarkVas — My Notes
                </div>
              </div>
              {/* 3패널 */}
              <div className="grid min-h-[400px] bg-[#0d1228] md:grid-cols-[190px_1fr_250px]">
                {/* 사이드바 */}
                <aside className="hidden border-r border-white/6 bg-[#090c1c] p-4 md:block">
                  <div className="mb-3 flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/30">
                    <Search size={11} />
                    검색
                  </div>
                  <div className="mb-2 mt-4 px-1 text-[9px] font-black uppercase tracking-widest text-white/20">Workspace</div>
                  {[
                    { icon: FileText, label: "Daily Notes", active: false },
                    { icon: FileText, label: "Product Plan.md", active: true },
                    { icon: FileText, label: "아이디어 메모", active: false },
                    { icon: Plug, label: "플러그인", active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`mb-0.5 flex items-center gap-2 rounded-md px-2.5 py-2 text-xs ${item.active ? "bg-blue-600/15 font-bold text-blue-300" : "text-white/35"}`}
                    >
                      <item.icon size={11} />
                      <span className="truncate">{item.label}</span>
                    </div>
                  ))}
                </aside>
                {/* 에디터 */}
                <div className="p-6 text-white">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black text-white">Product Plan.md</div>
                      <div className="mt-0.5 text-xs text-white/25">자동 저장됨</div>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="h-6 w-6 rounded-md bg-white/5 ring-1 ring-white/8" />
                      <span className="h-6 w-6 rounded-md bg-white/5 ring-1 ring-white/8" />
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="h-4 w-56 rounded bg-white/28" />
                    <div className="h-2.5 rounded bg-white/10" />
                    <div className="h-2.5 w-10/12 rounded bg-white/10" />
                    <div className="h-2.5 w-7/12 rounded bg-white/10" />
                    <div className="mt-4 rounded-xl border border-blue-500/18 bg-blue-500/6 p-4">
                      <div className="mb-2 h-2.5 w-36 rounded bg-blue-400/35" />
                      <div className="h-2 w-full rounded bg-blue-400/18" />
                      <div className="mt-1.5 h-2 w-8/12 rounded bg-blue-400/18" />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[0,1,2].map((i) => (
                        <div key={i} className="h-14 rounded-lg bg-white/4 ring-1 ring-white/7" />
                      ))}
                    </div>
                  </div>
                </div>
                {/* 프리뷰 */}
                <aside className="hidden border-l border-white/6 bg-[#f9f8f5] p-5 md:block">
                  <div className="mb-4 text-[10px] font-black uppercase tracking-widest text-blue-600">Preview</div>
                  <div className="mb-3 h-4 w-40 rounded bg-slate-800/65" />
                  <div className="space-y-2">
                    <div className="h-2 rounded bg-slate-800/12" />
                    <div className="h-2 w-10/12 rounded bg-slate-800/12" />
                    <div className="h-2 w-7/12 rounded bg-slate-800/12" />
                  </div>
                  <div className="mt-5 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3">
                    <div className="mb-1.5 h-2 w-24 rounded bg-blue-300/60" />
                    <div className="h-2 w-full rounded bg-blue-200/50" />
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <div className="h-2 rounded bg-slate-800/8" />
                    <div className="h-2 w-9/12 rounded bg-slate-800/8" />
                    <div className="h-2 w-5/12 rounded bg-slate-800/8" />
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <Section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { num: "3+", label: "테마" },
              { num: "3+", label: "템플릿" },
              { num: "2+", label: "플러그인" },
              { num: "무료", label: "모두 무료" },
            ].map((item, i) => (
              <div key={item.label} className={`reveal stagger-${i + 1} text-center`}>
                <div className="text-3xl font-black text-blue-600">{item.num}</div>
                <div className="mt-1 text-sm text-slate-500">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── FEATURE 1: 에디터 ────────────────────────────────────────────── */}
      <Section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <div className="reveal mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
              <FileText size={14} />
              에디터
            </div>
            <h2 className="reveal stagger-1 text-4xl font-black leading-tight text-slate-950">
              쓰는 데만<br />집중할 수 있어요.
            </h2>
            <p className="reveal stagger-2 mt-4 text-base leading-8 text-slate-500">
              폴더 열고 파일 하나 만들면 끝.<br />
              Split View로 마크다운 원문과 프리뷰를 나란히 보면서 씁니다.
            </p>
            <ul className="reveal stagger-3 mt-7 space-y-3.5">
              {[
                "실시간 Markdown 프리뷰",
                "폴더 기반 워크스페이스",
                "자동 저장",
                "코드 블록 구문 강조",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-600 text-white">
                    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                      <path d="M1 4.5l2.5 2.5 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="reveal stagger-4 mt-9">
              <Link className="button" to="/download">
                <Download size={16} />
                앱 다운로드
              </Link>
            </div>
          </div>

          {/* 에디터 카드 목업 */}
          <div className="reveal stagger-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 transition-shadow hover:shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-3 text-xs text-slate-400">readme.md</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-100">
              <div className="p-5">
                <div className="space-y-1 font-mono text-[13px] leading-6 text-slate-700">
                  <div><span className="font-black text-violet-600"># </span>프로젝트 계획</div>
                  <div className="h-1" />
                  <div className="text-slate-500">## 이번 주 목표</div>
                  <div className="h-1" />
                  <div><span className="text-blue-500">- [x] </span>기획서 작성</div>
                  <div><span className="text-blue-500">- [x] </span>디자인 검토</div>
                  <div><span className="text-slate-300">- [ ] </span>개발 시작</div>
                  <div className="h-2" />
                  <div className="text-slate-400">{"`"}```js</div>
                  <div><span className="text-emerald-600">const</span> <span className="text-blue-600">app</span> = <span className="text-amber-500">'markvas'</span></div>
                  <div className="text-slate-400">{"```"}</div>
                </div>
              </div>
              <div className="bg-[#fafaf8] p-5">
                <h3 className="mb-2 text-base font-black text-slate-900">프로젝트 계획</h3>
                <h4 className="mb-2 text-sm font-bold text-slate-600">이번 주 목표</h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded border-2 border-blue-500 bg-blue-500 text-center text-[8px] font-black leading-3 text-white">✓</span>
                    기획서 작성
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded border-2 border-blue-500 bg-blue-500 text-center text-[8px] font-black leading-3 text-white">✓</span>
                    디자인 검토
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded border-2 border-slate-300" />
                    개발 시작
                  </li>
                </ul>
                <div className="mt-3 rounded-lg bg-slate-900 px-3.5 py-2.5">
                  <code className="text-[11px]">
                    <span className="text-blue-400">const </span>
                    <span className="text-white">app </span>
                    <span className="text-white/50">= </span>
                    <span className="text-amber-400">'markvas'</span>
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── FEATURE 2: 에셋 스토어 ──────────────────────────────────────── */}
      <Section className="border-y border-slate-200 bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* 에셋 카드 목업 */}
            <div className="order-2 space-y-3 lg:order-1">
              {[
                {
                  icon: SwatchBook,
                  bg: "bg-violet-100",
                  tc: "text-violet-700",
                  rb: "bg-violet-50 text-violet-600",
                  name: "Dark Void Theme",
                  desc: "눈 안 아픈 다크 테마",
                  badge: "테마",
                  delay: "stagger-1",
                },
                {
                  icon: FileText,
                  bg: "bg-emerald-100",
                  tc: "text-emerald-700",
                  rb: "bg-emerald-50 text-emerald-600",
                  name: "Weekly Review",
                  desc: "한 주를 돌아보는 회고 템플릿",
                  badge: "템플릿",
                  delay: "stagger-2",
                },
                {
                  icon: Plug,
                  bg: "bg-amber-100",
                  tc: "text-amber-700",
                  rb: "bg-amber-50 text-amber-700",
                  name: "TOC Generator",
                  desc: "헤딩 읽어서 목차 자동 생성",
                  badge: "플러그인",
                  delay: "stagger-3",
                },
              ].map((item) => (
                <div
                  key={item.name}
                  className={`reveal ${item.delay} shine-card flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg`}
                >
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${item.bg} ${item.tc}`}>
                    <item.icon size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{item.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${item.rb}`}>{item.badge}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-600">무료</span>
                </div>
              ))}
            </div>

            <div className="order-1 lg:order-2">
              <div className="reveal mb-4 inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 text-sm font-black text-violet-700">
                <Layers3 size={14} />
                에셋 스토어
              </div>
              <h2 className="reveal stagger-1 text-4xl font-black leading-tight text-slate-950">
                내 취향대로<br />바꾸는 재미.
              </h2>
              <p className="reveal stagger-2 mt-4 text-base leading-8 text-slate-500">
                테마 한 번 갈아끼우면 에디터 분위기가 확 달라져요.<br />
                자주 쓰는 문서 구조는 템플릿으로 저장해두고,<br />
                반복 작업은 플러그인에 맡기세요.
              </p>
              <div className="reveal stagger-3 mt-9">
                <Link className="button" to="/assets">
                  에셋 둘러보기
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── VALUE PROPS ──────────────────────────────────────────────────── */}
      <Section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14 text-center">
          <h2 className="reveal text-3xl font-black text-slate-950">
            굳이 MarkVas인 이유
          </h2>
          <p className="reveal stagger-1 mt-3 text-slate-500">
            많은 노트 앱 중에 이걸 쓰는 이유가 있어요.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Zap,
              color: "bg-amber-100 text-amber-700",
              border: "hover:border-amber-200",
              title: "설치하고 바로 써요",
              desc: "회원가입 없이도 로컬에서 바로 작동해요. 폴더 열고 파일 만들면 그게 전부예요.",
            },
            {
              icon: Shield,
              color: "bg-emerald-100 text-emerald-700",
              border: "hover:border-emerald-200",
              title: "파일은 내 것",
              desc: "클라우드에 올라가지 않아요. 내 컴퓨터에 저장되고, 오프라인에서도 잘 돌아가요.",
            },
            {
              icon: Layers3,
              color: "bg-blue-100 text-blue-700",
              border: "hover:border-blue-200",
              title: "다 무료예요",
              desc: "테마, 템플릿, 플러그인 전부 무료로 풀려있어요. 나중에 더 추가될 예정이에요.",
            },
            {
              icon: Globe,
              color: "bg-violet-100 text-violet-700",
              border: "hover:border-violet-200",
              title: "표준 마크다운",
              desc: "특별한 문법 없이 표준 .md 파일 그대로 써요. 다른 앱에서도 그냥 열려요.",
            },
            {
              icon: SwatchBook,
              color: "bg-rose-100 text-rose-700",
              border: "hover:border-rose-200",
              title: "취향 저격 테마",
              desc: "노션 스타일 화이트, 눈이 편한 다크, 문서 느낌 세리프까지. 마음에 드는 걸로 골라요.",
            },
            {
              icon: Sparkles,
              color: "bg-teal-100 text-teal-700",
              border: "hover:border-teal-200",
              title: "계속 업데이트",
              desc: "에셋이랑 기능이 계속 추가될 예정이에요. 지금 받아두면 새 업데이트가 자동으로 생겨요.",
            },
          ].map((item, i) => (
            <article
              key={item.title}
              className={`reveal stagger-${(i % 3) + 1} shine-card group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${item.border}`}
            >
              <span className={`mb-4 grid h-11 w-11 place-items-center rounded-xl ${item.color}`}>
                <item.icon size={20} />
              </span>
              <h3 className="mb-2 text-base font-black text-slate-950">{item.title}</h3>
              <p className="text-sm leading-7 text-slate-500">{item.desc}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <Section className="border-t border-slate-200 bg-white py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="reveal text-3xl font-black text-slate-950">5분이면 충분해요</h2>
          <p className="reveal stagger-1 mt-3 text-slate-500">
            설치부터 에셋 적용까지, 정말 간단해요.
          </p>

          <div className="relative mt-14 grid gap-8 sm:grid-cols-3">
            {/* 연결선 */}
            <div className="absolute left-[20%] right-[20%] top-7 hidden h-px bg-gradient-to-r from-blue-200 via-violet-200 to-blue-200 sm:block" />

            {[
              {
                step: "1",
                icon: Download,
                title: "앱 설치",
                desc: "Windows 설치 파일 받아서 실행하면 바로 시작할 수 있어요.",
                color: "bg-blue-600",
                glow: "shadow-blue-500/40",
              },
              {
                step: "2",
                icon: Layers3,
                title: "에셋 선택",
                desc: "스토어에서 마음에 드는 테마, 템플릿, 플러그인을 골라 등록해요.",
                color: "bg-violet-600",
                glow: "shadow-violet-500/40",
              },
              {
                step: "3",
                icon: Zap,
                title: "바로 사용",
                desc: "앱에서 로그인하면 선택한 에셋이 자동으로 다운로드돼요.",
                color: "bg-emerald-600",
                glow: "shadow-emerald-500/40",
              },
            ].map((step, i) => (
              <article key={step.step} className={`reveal stagger-${i + 1} relative flex flex-col items-center text-center`}>
                <div className={`relative mb-5 grid h-14 w-14 place-items-center rounded-2xl ${step.color} shadow-lg ${step.glow}`}>
                  <step.icon size={22} className="text-white" />
                  <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-black text-slate-800 shadow">
                    {step.step}
                  </span>
                </div>
                <h3 className="mb-2 font-black text-slate-950">{step.title}</h3>
                <p className="text-sm leading-7 text-slate-500">{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <Section
        className="relative overflow-hidden py-28"
        style={{ background: "linear-gradient(135deg,#04071a 0%,#09102e 55%,#160f40 100%)" }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className="glow-animate absolute left-1/3 top-0 h-96 w-96 -translate-x-1/2 rounded-full"
            style={{ background: "radial-gradient(circle,rgba(59,130,246,0.2) 0%,transparent 65%)" }}
          />
          <div
            className="glow-animate-delay absolute right-1/4 bottom-0 h-80 w-80 rounded-full"
            style={{ background: "radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 65%)" }}
          />
        </div>
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="reveal text-4xl font-black text-white">
            지금 한번 써볼까요?
          </h2>
          <p className="reveal stagger-1 mt-4 text-lg leading-8 text-white/55">
            설치는 무료, 에셋도 무료.<br />
            마음에 들면 계정 만들어서 에셋 동기화하면 돼요.
          </p>
          <div className="reveal stagger-2 mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              className="group relative inline-flex h-12 items-center gap-2.5 overflow-hidden rounded-xl bg-white px-7 text-sm font-black text-slate-900 shadow-xl transition-all hover:scale-[1.03]"
              to="/download"
            >
              <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-blue-100/50 to-transparent transition-transform duration-500 group-hover:translate-x-[100%]" />
              <Download size={18} />
              무료 다운로드
            </Link>
            <Link
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/18 bg-white/8 px-7 text-sm font-bold text-white backdrop-blur-sm transition-all hover:scale-[1.02] hover:bg-white/12"
              to="/register"
            >
              회원가입 (무료)
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </Section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 text-sm text-slate-400">
          <span className="font-black text-slate-700">MarkVas</span>
          <span>© 2026 · 학습용 프로젝트</span>
          <div className="flex gap-4">
            <Link className="hover:text-slate-700" to="/assets">에셋 스토어</Link>
            <Link className="hover:text-slate-700" to="/download">다운로드</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
