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
  CheckCircle2,
} from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import { Footer } from "../components/Footer";
import { useReveal } from "../hooks/useReveal";
import type { ReactNode, CSSProperties, RefObject } from "react";

/* ── 섹션별 reveal 래퍼 ─────────────────────────────────────────────────── */
function RevealSection({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useReveal();
  return (
    <section ref={ref as RefObject<HTMLElement>} className={className} style={style}>
      {children}
    </section>
  );
}

/* ── 공통 강조 뱃지 ─────────────────────────────────────────────────────── */
function Badge({ icon, label, teal = false }: { icon: ReactNode; label: string; teal?: boolean }) {
  return (
    <div
      className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
      style={
        teal
          ? { background: "rgba(32,197,188,0.12)", color: "var(--teal)", border: "1px solid rgba(32,197,188,0.25)" }
          : { background: "var(--bg-raised)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
      }
    >
      {icon}
      {label}
    </div>
  );
}

export default function HomePage(): JSX.Element {
  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "var(--bg-base)" }}>
      <SiteHeader />

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* 배경 */}
        <div className="pointer-events-none absolute inset-0">
          {/* 메인 그라디언트 */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(32,197,188,0.12) 0%, transparent 60%), " +
                "radial-gradient(ellipse 60% 50% at 80% 50%, rgba(124,92,252,0.08) 0%, transparent 55%), " +
                "linear-gradient(180deg, #07080f 0%, #0a0c18 100%)",
            }}
          />
          {/* glow orbs */}
          <div
            className="glow-animate absolute -left-40 top-10 h-[500px] w-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(32,197,188,0.10) 0%, transparent 65%)" }}
          />
          <div
            className="glow-animate-delay absolute -right-20 top-32 h-[400px] w-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(124,92,252,0.09) 0%, transparent 65%)" }}
          />
          {/* 미세한 별점 */}
          {[
            [8, 15], [88, 22], [5, 58], [93, 70], [78, 38], [22, 82],
          ].map(([l, t], i) => (
            <div
              key={i}
              className="absolute h-[2px] w-[2px] rounded-full"
              style={{
                left: `${l}%`, top: `${t}%`,
                background: "var(--teal)",
                opacity: 0.35,
                animation: `glow-pulse ${4 + i * 0.4}s ease-in-out ${i * 0.5}s infinite`,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-28 pt-20 text-center">
          {/* 뱃지 */}
          <div className="animate-fade-in mb-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
            style={{ background: "rgba(32,197,188,0.10)", color: "var(--teal)", border: "1px solid rgba(32,197,188,0.22)" }}
          >
            <Sparkles size={13} />
            마크다운 노트 앱 — 무료 제공
          </div>

          {/* 헤드라인 */}
          <h1
            className="animate-fade-up delay-100 mx-auto max-w-3xl text-5xl font-black leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
            style={{ color: "var(--text-primary)" }}
          >
            글쓰기에 집중하는
            <br />
            <span className="text-gradient">나만의 노트 공간.</span>
          </h1>

          <p
            className="animate-fade-up delay-300 mx-auto mt-6 max-w-lg text-lg leading-8"
            style={{ color: "var(--text-secondary)" }}
          >
            MarkVas는 마크다운 기반 데스크톱 노트 앱입니다.
            <br className="hidden sm:block" />
            테마·템플릿·플러그인으로 자신만의 작업 환경을 만들어보세요.
          </p>

          {/* CTA */}
          <div className="animate-fade-up delay-400 mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/download"
              className="btn-shine inline-flex h-12 items-center gap-2.5 rounded-[10px] px-7 text-sm font-black text-black shadow-lg transition-all hover:scale-[1.03]"
              style={{ background: "var(--teal)", boxShadow: "0 4px 24px rgba(32,197,188,0.35)" }}
            >
              <Download size={17} />
              무료 다운로드
            </Link>
            <Link
              to="/assets"
              className="inline-flex h-12 items-center gap-2 rounded-[10px] px-7 text-sm font-bold transition-all hover:scale-[1.02]"
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border-hover)",
                color: "var(--text-primary)",
              }}
            >
              에셋 스토어 둘러보기
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* 앱 목업 */}
          <div className="animate-scale-in delay-500 relative mx-auto mt-16 max-w-5xl">
            {/* 하단 glow */}
            <div
              className="absolute -bottom-6 inset-x-16 h-12 blur-3xl"
              style={{ background: "linear-gradient(90deg, rgba(32,197,188,0.3), rgba(124,92,252,0.2), rgba(32,197,188,0.3))" }}
            />
            <div
              className="animate-float relative overflow-hidden rounded-2xl"
              style={{
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 40px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {/* 타이틀바 */}
              <div
                className="flex items-center gap-2 px-5 py-3.5"
                style={{ background: "#09090f", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <span className="h-3 w-3 rounded-full bg-[#ff5f57] shadow shadow-red-500/40" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e] shadow shadow-yellow-400/40" />
                <span className="h-3 w-3 rounded-full bg-[#28c840] shadow shadow-green-500/40" />
                <div className="ml-3 flex-1 rounded-md py-1 text-center text-xs"
                  style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-muted)" }}>
                  MarkVas — Product Plan.md
                </div>
              </div>
              {/* 3패널 */}
              <div
                className="grid min-h-[380px] md:grid-cols-[180px_1fr_240px]"
                style={{ background: "#0d0e1a" }}
              >
                {/* 사이드바 */}
                <aside
                  className="hidden p-4 md:block"
                  style={{ background: "#090a14", borderRight: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                    style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-muted)" }}>
                    <Search size={11} /> 검색
                  </div>
                  <div className="mb-2 mt-4 px-1 text-[9px] font-black uppercase tracking-widest"
                    style={{ color: "var(--text-muted)" }}>Workspace</div>
                  {[
                    { icon: FileText, label: "Daily Notes", active: false },
                    { icon: FileText, label: "Product Plan.md", active: true },
                    { icon: FileText, label: "아이디어 메모", active: false },
                    { icon: Plug, label: "플러그인", active: false },
                  ].map((item) => (
                    <div key={item.label}
                      className="mb-0.5 flex items-center gap-2 rounded-md px-2.5 py-2 text-xs"
                      style={item.active
                        ? { background: "rgba(32,197,188,0.12)", color: "var(--teal)", fontWeight: 700 }
                        : { color: "rgba(255,255,255,0.28)" }
                      }
                    >
                      <item.icon size={11} />
                      <span className="truncate">{item.label}</span>
                    </div>
                  ))}
                </aside>
                {/* 에디터 */}
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black" style={{ color: "var(--text-primary)" }}>Product Plan.md</div>
                      <div className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>자동 저장됨</div>
                    </div>
                    <div className="flex gap-1.5">
                      {[0,1].map(i => (
                        <span key={i} className="h-6 w-6 rounded-md"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="h-4 w-52 rounded" style={{ background: "rgba(255,255,255,0.25)" }} />
                    <div className="h-2.5 rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
                    <div className="h-2.5 w-10/12 rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
                    <div className="h-2.5 w-7/12 rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
                    <div className="mt-4 rounded-xl p-4"
                      style={{ background: "rgba(32,197,188,0.06)", border: "1px solid rgba(32,197,188,0.15)" }}>
                      <div className="mb-2 h-2.5 w-32 rounded" style={{ background: "rgba(32,197,188,0.30)" }} />
                      <div className="h-2 w-full rounded" style={{ background: "rgba(32,197,188,0.14)" }} />
                      <div className="mt-1.5 h-2 w-8/12 rounded" style={{ background: "rgba(32,197,188,0.14)" }} />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[0,1,2].map(i => (
                        <div key={i} className="h-12 rounded-lg"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }} />
                      ))}
                    </div>
                  </div>
                </div>
                {/* 미리보기 */}
                <aside
                  className="hidden p-5 md:block"
                  style={{ background: "#f9f8f5", borderLeft: "1px solid rgba(0,0,0,0.08)" }}
                >
                  <div className="mb-4 text-[9px] font-black uppercase tracking-widest text-blue-700">Preview</div>
                  <div className="mb-3 h-4 w-36 rounded bg-slate-800/60" />
                  <div className="space-y-2">
                    <div className="h-2 rounded bg-slate-800/10" />
                    <div className="h-2 w-10/12 rounded bg-slate-800/10" />
                    <div className="h-2 w-7/12 rounded bg-slate-800/10" />
                  </div>
                  <div className="mt-4 rounded-lg border-l-4 border-[#20c5bc] bg-[#f0fffe] p-3">
                    <div className="mb-1.5 h-2 w-24 rounded bg-[#20c5bc]/40" />
                    <div className="h-2 w-full rounded bg-[#20c5bc]/20" />
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <div className="h-2 rounded bg-slate-800/07" />
                    <div className="h-2 w-9/12 rounded bg-slate-800/07" />
                    <div className="h-2 w-5/12 rounded bg-slate-800/07" />
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          NUMBERS BAR
      ══════════════════════════════════════════════════════════ */}
      <RevealSection style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--bg-surface)" }}>
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { num: "3", label: "테마" },
              { num: "3", label: "템플릿" },
              { num: "2", label: "플러그인" },
              { num: "100%", label: "무료" },
            ].map((item, i) => (
              <div key={item.label} className={`reveal stagger-${i + 1} text-center`}>
                <div className="text-3xl font-black" style={{ color: "var(--teal)" }}>{item.num}</div>
                <div className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ══════════════════════════════════════════════════════════
          FEATURE 1 — 에디터
      ══════════════════════════════════════════════════════════ */}
      <RevealSection className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="reveal">
              <Badge icon={<FileText size={14} />} label="마크다운 에디터" teal />
            </div>
            <h2 className="reveal stagger-1 text-4xl font-black leading-tight" style={{ color: "var(--text-primary)" }}>
              복잡한 설정 없이
              <br />바로 시작하세요.
            </h2>
            <p className="reveal stagger-2 mt-5 text-base leading-8" style={{ color: "var(--text-secondary)" }}>
              원하는 폴더를 열고 파일을 만들면 즉시 작성을 시작할 수 있습니다.
              Split View 기능으로 마크다운 원문과 렌더링 결과를 나란히 확인하면서 작업하세요.
            </p>
            <ul className="reveal stagger-3 mt-7 space-y-4">
              {[
                "실시간 Markdown 렌더링 미리보기",
                "폴더 기반 워크스페이스 구성",
                "파일 자동 저장",
                "코드 블록 구문 강조",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  <CheckCircle2 size={17} style={{ color: "var(--teal)", flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
            <div className="reveal stagger-4 mt-9">
              <Link to="/download" className="button">
                <Download size={16} />
                앱 다운로드
              </Link>
            </div>
          </div>

          {/* 에디터 카드 */}
          <div
            className="reveal stagger-2 overflow-hidden rounded-2xl"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            }}
          >
            <div className="flex items-center gap-1.5 px-4 py-3"
              style={{ background: "var(--bg-raised)", borderBottom: "1px solid var(--border)" }}>
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
              <span className="ml-3 text-xs" style={{ color: "var(--text-muted)" }}>readme.md</span>
            </div>
            <div className="grid grid-cols-2" style={{ borderTop: "none" }}>
              {/* 마크다운 원문 */}
              <div className="p-5" style={{ borderRight: "1px solid var(--border)" }}>
                <div className="space-y-1 font-mono text-[13px] leading-7">
                  <div><span className="font-black" style={{ color: "#7c5cfc" }}># </span><span style={{ color: "var(--text-primary)" }}>프로젝트 계획</span></div>
                  <div className="h-1" />
                  <div style={{ color: "var(--text-secondary)" }}>## 이번 주 목표</div>
                  <div className="h-1" />
                  <div><span style={{ color: "var(--teal)" }}>- [x] </span><span style={{ color: "var(--text-primary)" }}>기획서 작성</span></div>
                  <div><span style={{ color: "var(--teal)" }}>- [x] </span><span style={{ color: "var(--text-primary)" }}>디자인 검토</span></div>
                  <div><span style={{ color: "var(--text-muted)" }}>- [ ] </span><span style={{ color: "var(--text-secondary)" }}>개발 착수</span></div>
                  <div className="h-1" />
                  <div style={{ color: "var(--text-muted)" }}>```js</div>
                  <div><span style={{ color: "#20c5bc" }}>const </span><span style={{ color: "var(--text-primary)" }}>app </span><span style={{ color: "var(--text-muted)" }}>= </span><span style={{ color: "#f8a94a" }}>'markvas'</span></div>
                  <div style={{ color: "var(--text-muted)" }}>```</div>
                </div>
              </div>
              {/* 렌더링 결과 */}
              <div className="p-5" style={{ background: "#f9f8f5" }}>
                <h3 className="mb-2 text-base font-black text-slate-900">프로젝트 계획</h3>
                <h4 className="mb-2 text-sm font-bold text-slate-600">이번 주 목표</h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {[["기획서 작성", true], ["디자인 검토", true], ["개발 착수", false]].map(([label, done]) => (
                    <li key={label as string} className="flex items-center gap-2">
                      <span className="grid h-4 w-4 shrink-0 place-items-center rounded border-2"
                        style={{ borderColor: done ? "#20c5bc" : "#d1d5db", background: done ? "#20c5bc" : "transparent" }}>
                        {done && <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </span>
                      {label as string}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 rounded-lg bg-slate-900 px-3.5 py-2.5">
                  <code className="text-[11px]">
                    <span className="text-[#20c5bc]">const </span>
                    <span className="text-white">app </span>
                    <span className="text-white/40">= </span>
                    <span className="text-[#f8a94a]">'markvas'</span>
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ══════════════════════════════════════════════════════════
          FEATURE 2 — 에셋 스토어
      ══════════════════════════════════════════════════════════ */}
      <RevealSection
        className="py-24"
        style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* 에셋 카드 목업 */}
            <div className="order-2 space-y-3 lg:order-1">
              {[
                {
                  icon: SwatchBook, badge: "테마",
                  name: "Dark Void Theme",
                  desc: "눈의 피로를 최소화한 다크 에디터 테마입니다.",
                  iconBg: "rgba(124,92,252,0.15)", iconColor: "#7c5cfc",
                  badgeBg: "rgba(124,92,252,0.10)", badgeColor: "#7c5cfc",
                  delay: "stagger-1",
                },
                {
                  icon: FileText, badge: "템플릿",
                  name: "Weekly Review",
                  desc: "한 주의 성과와 다음 주 계획을 체계적으로 정리합니다.",
                  iconBg: "rgba(32,197,188,0.12)", iconColor: "var(--teal)",
                  badgeBg: "rgba(32,197,188,0.10)", badgeColor: "var(--teal)",
                  delay: "stagger-2",
                },
                {
                  icon: Plug, badge: "플러그인",
                  name: "TOC Generator",
                  desc: "문서의 헤딩 구조를 분석해 목차를 자동으로 생성합니다.",
                  iconBg: "rgba(248,169,74,0.12)", iconColor: "#f8a94a",
                  badgeBg: "rgba(248,169,74,0.10)", badgeColor: "#f8a94a",
                  delay: "stagger-3",
                },
              ].map((item) => (
                <div
                  key={item.name}
                  className={`reveal ${item.delay} shine-card flex items-center gap-4 rounded-2xl p-4 transition-all hover:-translate-y-0.5`}
                  style={{
                    background: "var(--bg-raised)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
                  }}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                    style={{ background: item.iconBg, color: item.iconColor }}>
                    <item.icon size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black" style={{ color: "var(--text-primary)" }}>{item.name}</span>
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                        style={{ background: item.badgeBg, color: item.badgeColor }}>{item.badge}</span>
                    </div>
                    <p className="mt-0.5 text-xs leading-5" style={{ color: "var(--text-secondary)" }}>{item.desc}</p>
                  </div>
                  <span className="shrink-0 rounded-full px-2.5 py-1 text-xs font-black"
                    style={{ background: "rgba(32,197,188,0.10)", color: "var(--teal)" }}>무료</span>
                </div>
              ))}
            </div>

            <div className="order-1 lg:order-2">
              <div className="reveal">
                <Badge icon={<Layers3 size={14} />} label="에셋 스토어" teal />
              </div>
              <h2 className="reveal stagger-1 text-4xl font-black leading-tight" style={{ color: "var(--text-primary)" }}>
                작업 환경을
                <br />원하는 대로 구성하세요.
              </h2>
              <p className="reveal stagger-2 mt-5 text-base leading-8" style={{ color: "var(--text-secondary)" }}>
                에디터 테마 하나만 바꿔도 작업 분위기가 완전히 달라집니다.
                자주 사용하는 문서 형식은 템플릿으로 저장해두고,
                반복 작업은 플러그인으로 자동화하세요.
                모든 에셋은 무료로 제공됩니다.
              </p>
              <div className="reveal stagger-3 mt-9">
                <Link to="/assets" className="button">
                  에셋 스토어 보기
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ══════════════════════════════════════════════════════════
          VALUE PROPS
      ══════════════════════════════════════════════════════════ */}
      <RevealSection className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14 text-center">
          <h2 className="reveal text-3xl font-black" style={{ color: "var(--text-primary)" }}>
            MarkVas를 선택하는 이유
          </h2>
          <p className="reveal stagger-1 mt-3 text-base" style={{ color: "var(--text-secondary)" }}>
            복잡한 기능보다 꼭 필요한 것에 집중합니다.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Zap, delay: "stagger-1",
              iconBg: "rgba(248,169,74,0.12)", iconColor: "#f8a94a",
              hoverBorder: "rgba(248,169,74,0.25)",
              title: "설치 즉시 사용 가능",
              desc: "계정 없이도 로컬 환경에서 바로 실행됩니다. 폴더를 열고 파일을 만들면 작성을 시작할 수 있습니다.",
            },
            {
              icon: Shield, delay: "stagger-2",
              iconBg: "rgba(32,197,188,0.12)", iconColor: "var(--teal)",
              hoverBorder: "rgba(32,197,188,0.25)",
              title: "데이터는 내 컴퓨터에",
              desc: "작성한 파일은 클라우드가 아닌 로컬에 저장됩니다. 인터넷 연결이 없어도 오프라인에서 정상 작동합니다.",
            },
            {
              icon: Layers3, delay: "stagger-3",
              iconBg: "rgba(124,92,252,0.12)", iconColor: "#7c5cfc",
              hoverBorder: "rgba(124,92,252,0.25)",
              title: "모든 에셋 무료 제공",
              desc: "테마, 템플릿, 플러그인을 포함한 모든 에셋은 무료입니다. 계속해서 새로운 에셋이 추가될 예정입니다.",
            },
            {
              icon: Globe, delay: "stagger-1",
              iconBg: "rgba(32,197,188,0.10)", iconColor: "var(--teal)",
              hoverBorder: "rgba(32,197,188,0.20)",
              title: "표준 마크다운 호환",
              desc: "특별한 전용 문법 없이 표준 .md 형식을 그대로 사용합니다. 다른 편집기나 플랫폼과 완벽히 호환됩니다.",
            },
            {
              icon: SwatchBook, delay: "stagger-2",
              iconBg: "rgba(248,169,74,0.10)", iconColor: "#f8a94a",
              hoverBorder: "rgba(248,169,74,0.20)",
              title: "다양한 테마 스타일",
              desc: "노션 스타일의 화이트, 눈이 편안한 다크, 세리프 문서 스타일까지 취향에 맞는 테마를 선택하세요.",
            },
            {
              icon: Sparkles, delay: "stagger-3",
              iconBg: "rgba(124,92,252,0.10)", iconColor: "#7c5cfc",
              hoverBorder: "rgba(124,92,252,0.20)",
              title: "지속적인 에셋 업데이트",
              desc: "새로운 테마와 플러그인이 꾸준히 추가됩니다. 지금 계정을 만들어두면 업데이트 내역을 자동으로 받아볼 수 있습니다.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className={`reveal ${item.delay} shine-card rounded-2xl p-6 transition-all hover:-translate-y-1`}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
                ["--hover-border" as string]: item.hoverBorder,
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = item.hoverBorder)}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
            >
              <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl"
                style={{ background: item.iconBg, color: item.iconColor }}>
                <item.icon size={20} />
              </span>
              <h3 className="mb-2.5 text-base font-black" style={{ color: "var(--text-primary)" }}>{item.title}</h3>
              <p className="text-sm leading-7" style={{ color: "var(--text-secondary)" }}>{item.desc}</p>
            </article>
          ))}
        </div>
      </RevealSection>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════ */}
      <RevealSection
        className="py-24"
        style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="reveal text-3xl font-black" style={{ color: "var(--text-primary)" }}>
            시작까지 5분이면 충분합니다
          </h2>
          <p className="reveal stagger-1 mt-3" style={{ color: "var(--text-secondary)" }}>
            설치부터 에셋 적용까지의 과정이 간단합니다.
          </p>

          <div className="relative mt-16 grid gap-8 sm:grid-cols-3">
            {/* 연결선 */}
            <div
              className="absolute left-[18%] right-[18%] top-7 hidden h-px sm:block"
              style={{ background: "linear-gradient(90deg, var(--teal), var(--purple), var(--teal))", opacity: 0.3 }}
            />
            {[
              {
                step: "01", icon: Download, delay: "stagger-1",
                bg: "var(--teal)", glow: "rgba(32,197,188,0.4)",
                title: "앱 설치",
                desc: "Windows 설치 파일을 다운로드하여 실행하세요. 설치 완료까지 약 1분이 소요됩니다.",
              },
              {
                step: "02", icon: Layers3, delay: "stagger-2",
                bg: "var(--purple)", glow: "rgba(124,92,252,0.4)",
                title: "에셋 선택",
                desc: "에셋 스토어에서 테마, 템플릿, 플러그인을 선택하고 라이브러리에 등록하세요.",
              },
              {
                step: "03", icon: Zap, delay: "stagger-3",
                bg: "#f8a94a", glow: "rgba(248,169,74,0.4)",
                title: "앱에서 바로 사용",
                desc: "앱에서 계정에 로그인하면 등록한 에셋이 자동으로 동기화됩니다.",
              },
            ].map((step) => (
              <article key={step.step} className={`reveal ${step.delay} flex flex-col items-center text-center`}>
                <div
                  className="relative mb-5 grid h-14 w-14 place-items-center rounded-2xl"
                  style={{
                    background: step.bg,
                    boxShadow: `0 8px 24px ${step.glow}`,
                  }}
                >
                  <step.icon size={22} className="text-black" />
                  <span
                    className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full text-[10px] font-black"
                    style={{ background: "var(--bg-base)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                  >
                    {step.step}
                  </span>
                </div>
                <h3 className="mb-2 font-black" style={{ color: "var(--text-primary)" }}>{step.title}</h3>
                <p className="text-sm leading-7" style={{ color: "var(--text-secondary)" }}>{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ══════════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════════ */}
      <RevealSection className="relative overflow-hidden py-28">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(32,197,188,0.10) 0%, transparent 60%), " +
              "radial-gradient(ellipse 50% 40% at 80% 100%, rgba(124,92,252,0.08) 0%, transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="reveal text-4xl font-black" style={{ color: "var(--text-primary)" }}>
            지금 바로 시작해보세요.
          </h2>
          <p className="reveal stagger-1 mt-4 text-lg leading-8" style={{ color: "var(--text-secondary)" }}>
            앱 설치와 에셋 사용 모두 무료입니다.
            <br />
            계정을 만들면 에셋을 앱과 동기화할 수 있습니다.
          </p>
          <div className="reveal stagger-2 mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/download"
              className="btn-shine inline-flex h-12 items-center gap-2.5 rounded-[10px] px-8 text-sm font-black text-black transition-all hover:scale-[1.03]"
              style={{ background: "var(--teal)", boxShadow: "0 4px 28px rgba(32,197,188,0.35)" }}
            >
              <Download size={17} />
              무료 다운로드
            </Link>
            <Link
              to="/register"
              className="inline-flex h-12 items-center gap-2 rounded-[10px] px-8 text-sm font-bold transition-all hover:scale-[1.02]"
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border-hover)",
                color: "var(--text-primary)",
              }}
            >
              회원가입 (무료)
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </RevealSection>

      <Footer />
    </main>
  );
}
