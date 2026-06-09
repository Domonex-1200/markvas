"use client";

import Link from "next/link";
import { Heart, Library, LogOut, ShieldCheck, UploadCloud, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import type { CurrentUser } from "@markdown-canvas/shared";
import { getMe } from "../lib/api";

export function AuthStatus(): JSX.Element {
  const scrolled = false;
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("accessToken");
    if (!token) { setIsReady(true); return; }

    getMe(token)
      .then((u) => {
        setUser(u);
        window.localStorage.setItem("userEmail", u.email);
        window.localStorage.setItem("role", u.role);
      })
      .catch(() => {
        ["accessToken", "refreshToken", "role", "userEmail"].forEach((k) =>
          window.localStorage.removeItem(k)
        );
        setUser(null);
      })
      .finally(() => setIsReady(true));
  }, []);

  function logout(): void {
    ["accessToken", "refreshToken", "role", "userEmail"].forEach((k) =>
      window.localStorage.removeItem(k)
    );
    setUser(null);
  }

  if (!isReady) {
    return <span className="w-20" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          className={`flex h-8 items-center rounded-md px-3.5 text-sm font-semibold transition ${
            scrolled
              ? "text-slate-700 hover:bg-slate-100"
              : "text-white/80 hover:bg-white/10 hover:text-white"
          }`}
          href="/login"
        >
          로그인
        </Link>
        <Link
          className="flex h-8 items-center rounded-md bg-blue-600 px-3.5 text-sm font-bold text-white transition hover:bg-blue-500"
          href="/register"
        >
          회원가입
        </Link>
      </div>
    );
  }

  const ghostCls = scrolled
    ? "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
    : "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white";

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Link className={ghostCls} href="/wishlist">
        <Heart size={14} />
        찜
      </Link>
      <Link className={ghostCls} href="/library">
        <Library size={14} />
        라이브러리
      </Link>
      {["DEVELOPER", "ADMIN"].includes(user.role) && (
        <Link className={ghostCls} href="/developer/assets/new">
          <UploadCloud size={14} />
          에셋 등록
        </Link>
      )}
      {user.role === "ADMIN" && (
        <Link className={ghostCls} href="/admin/review">
          <ShieldCheck size={14} />
          심사
        </Link>
      )}
      <div
        className={`hidden h-8 items-center gap-2 rounded-md px-2.5 text-sm lg:flex ${
          scrolled ? "text-slate-700" : "text-white/70"
        }`}
      >
        <UserRound size={14} />
        <span className="max-w-28 truncate font-semibold">{user.email}</span>
      </div>
      <button
        className={`grid h-8 w-8 place-items-center rounded-md transition ${
          scrolled
            ? "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            : "text-white/60 hover:bg-white/10 hover:text-white"
        }`}
        title="로그아웃"
        type="button"
        onClick={logout}
      >
        <LogOut size={14} />
      </button>
    </div>
  );
}
