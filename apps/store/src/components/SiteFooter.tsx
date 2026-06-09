import Link from "next/link";
import { GalleryVerticalEnd } from "lucide-react";

const footerLinks = [
  {
    heading: "제품",
    items: [
      { label: "앱 다운로드", href: "/download" },
      { label: "에셋스토어", href: "/assets" },
      { label: "라이브러리", href: "/library" },
      { label: "릴리즈 노트", href: "/download" }
    ]
  },
  {
    heading: "제작자",
    items: [
      { label: "에셋 등록", href: "/developer/assets/new" },
      { label: "제작자 가이드", href: "/developer/assets/new" },
      { label: "에셋 심사 기준", href: "/developer/assets/new" }
    ]
  },
  {
    heading: "계정",
    items: [
      { label: "로그인", href: "/login" },
      { label: "회원가입", href: "/register" },
      { label: "찜한 에셋", href: "/wishlist" },
      { label: "내 정보", href: "/me" }
    ]
  },
  {
    heading: "정책",
    items: [
      { label: "서비스 이용약관", href: "#" },
      { label: "개인정보 처리방침", href: "#" },
      { label: "에셋 라이선스", href: "#" }
    ]
  }
];

export function SiteFooter(): JSX.Element {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-[200px_1fr]">
          <div>
            <Link className="flex items-center gap-2.5 text-lg font-black text-slate-950" href="/">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-white shadow-sm">
                <GalleryVerticalEnd size={18} />
              </span>
              MarkVas
            </Link>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              마크다운 기반 노트와 무료 에셋을 한 곳에서.
            </p>
            <p className="mt-5 text-xs text-slate-400">© 2025 MarkVas. All rights reserved.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-4">
            {footerLinks.map((group) => (
              <div key={group.heading}>
                <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
                  {group.heading}
                </h3>
                <ul className="space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        className="text-sm text-slate-600 transition hover:text-blue-600"
                        href={item.href}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
