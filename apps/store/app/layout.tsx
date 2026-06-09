import type { Metadata } from "next";
import { SiteFooter } from "../src/components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarkVas Store",
  description: "MarkVas 데스크탑 앱과 무료 테마, 템플릿, 플러그인을 제공하는 스토어입니다."
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="ko">
      <body className="flex min-h-screen flex-col">
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
