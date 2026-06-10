
import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { ChevronDown, GalleryVerticalEnd } from "lucide-react";
import { AuthStatus } from "./AuthStatus";

type DropdownItem = {
  label: string;
  href: string;
  description: string;
  requireAuth?: boolean;
};

const navItems: Array<{
  label: string;
  href?: string;
  dropdown?: DropdownItem[];
}> = [
  {
    label: "제품",
    dropdown: [
      { label: "앱 다운로드", href: "/download", description: "Windows 데스크톱 앱" }
    ]
  },
  {
    label: "에셋",
    dropdown: [
      { label: "에셋스토어", href: "/assets", description: "무료 테마·템플릿·플러그인" },
      { label: "에셋 등록", href: "/developer/assets/new", description: "내 에셋 업로드", requireAuth: true }
    ]
  },
  {
    label: "라이브러리",
    dropdown: [
      { label: "내 라이브러리", href: "/library", description: "설치한 에셋 모음", requireAuth: true },
      { label: "찜한 에셋", href: "/wishlist", description: "나중에 설치할 에셋", requireAuth: true }
    ]
  }
];

export function SiteHeader(): JSX.Element {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  function openDropdown(label: string): void {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(label);
  }

  function scheduleClose(): void {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  }

  function handleNavClick(item: DropdownItem): void {
    setOpenMenu(null);
    if (item.requireAuth) {
      const token = window.localStorage.getItem("accessToken");
      if (!token) {
        navigate(`/login?next=${encodeURIComponent(item.href)}`);
        return;
      }
    }
    navigate(item.href);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080b22]/95 backdrop-blur-xl">
      <div className="mx-auto grid h-14 max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center px-5">
        {/* Logo */}
        <Link
          className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/40 transition hover:bg-blue-500"
          to="/"
          title="MarkVas"
        >
          <GalleryVerticalEnd size={16} />
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-0.5">
          {navItems.map((item) =>
            item.dropdown ? (
              <div
                className="relative"
                key={item.label}
                onMouseEnter={() => openDropdown(item.label)}
                onMouseLeave={scheduleClose}
              >
                <button
                  className="flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
                  type="button"
                >
                  {item.label}
                  <ChevronDown
                    className={`opacity-60 transition-transform duration-200 ${openMenu === item.label ? "rotate-180" : ""}`}
                    size={12}
                  />
                </button>

                {openMenu === item.label && (
                  <div
                    className="absolute left-1/2 top-full mt-2 w-56 -translate-x-1/2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10"
                    onMouseEnter={() => openDropdown(item.label)}
                    onMouseLeave={scheduleClose}
                  >
                    <div className="p-1.5">
                      {item.dropdown.map((d) => (
                        <button
                          key={d.label}
                          className="flex w-full flex-col rounded-lg px-3.5 py-2.5 text-left transition hover:bg-slate-50"
                          onClick={() => handleNavClick(d)}
                        >
                          <span className="text-[13px] font-semibold text-slate-900">
                            {d.label}
                          </span>
                          <span className="mt-0.5 text-xs text-slate-400">{d.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                className="flex h-9 items-center rounded-md px-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
                to={item.href ?? "#"}
                key={item.label}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Auth */}
        <div className="flex justify-end">
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}