import { Link } from "react-router-dom";
import { GalleryVerticalEnd } from "lucide-react";

const links = {
  제품: [
    { label: "앱 다운로드", to: "/download" },
    { label: "에셋 스토어", to: "/assets" },
  ],
  리소스: [
    { label: "내 라이브러리", to: "/library" },
    { label: "찜한 에셋", to: "/wishlist" },
  ],
  계정: [
    { label: "로그인", to: "/login" },
    { label: "회원가입", to: "/register" },
    { label: "마이페이지", to: "/me" },
  ],
};

export function Footer(): JSX.Element {
  return (
    <footer
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-14">
        {/* 상단: 브랜드 + 링크 */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* 브랜드 */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span
                className="grid h-8 w-8 place-items-center rounded-lg text-black"
                style={{ background: "var(--teal)" }}
              >
                <GalleryVerticalEnd size={15} />
              </span>
              <span className="text-base font-black" style={{ color: "var(--text-primary)" }}>
                MarkVas
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7" style={{ color: "var(--text-secondary)" }}>
              마크다운으로 글을 쓰고, 테마·템플릿·플러그인으로 작업 환경을 만드는 데스크톱 노트 앱입니다.
            </p>
            <p className="mt-5 text-xs" style={{ color: "var(--text-muted)" }}>
              학습 목적으로 제작된 프로젝트입니다.
            </p>
          </div>

          {/* 링크 그룹 */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h3
                className="mb-4 text-xs font-black uppercase tracking-widest"
                style={{ color: "var(--text-muted)" }}
              >
                {group}
              </h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-sm transition-colors"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--text-primary)")}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--text-secondary)")}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 구분선 */}
        <div className="my-10" style={{ borderTop: "1px solid var(--border)" }} />

        {/* 하단 */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © 2026 MarkVas. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Built with
            </span>
            <span className="mx-1 text-xs font-bold" style={{ color: "var(--teal)" }}>
              Spring Boot
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              &
            </span>
            <span className="ml-1 text-xs font-bold" style={{ color: "var(--teal)" }}>
              React
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
