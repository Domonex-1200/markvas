
import { Link } from "react-router-dom";
import { Heart, Library, LogOut, Settings, ShieldCheck, UploadCloud, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import type { CurrentUser } from "../types";
import { getMe } from "../lib/api";

export function AuthStatus(): JSX.Element {
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
        if (u.nickname) window.localStorage.setItem("nickname", u.nickname);
      })
      .catch(() => {
        ["accessToken", "refreshToken", "role", "userEmail", "nickname"].forEach((k) =>
          window.localStorage.removeItem(k)
        );
        setUser(null);
      })
      .finally(() => setIsReady(true));
  }, []);

  function logout(): void {
    ["accessToken", "refreshToken", "role", "userEmail", "nickname"].forEach((k) =>
      window.localStorage.removeItem(k)
    );
    setUser(null);
    window.location.href = "/";
  }

  if (!isReady) return <span className="w-20" />;

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          className="flex h-8 items-center rounded-md px-3.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
          to="/login"
        >
          로그인
        </Link>
        <Link
          className="flex h-8 items-center rounded-md bg-blue-600 px-3.5 text-sm font-bold text-white transition hover:bg-blue-500"
          to="/register"
        >
          회원가입
        </Link>
      </div>
    );
  }

  const ghost = "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white";

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Link className={ghost} to="/wishlist">
        <Heart size={14} />
        찜
      </Link>
      <Link className={ghost} to="/library">
        <Library size={14} />
        라이브러리
      </Link>
      {["DEVELOPER", "ADMIN"].includes(user.role) && (
        <Link className={ghost} to="/developer/assets">
          <UploadCloud size={14} />
          내 에셋
        </Link>
      )}
      {user.role === "ADMIN" && (
        <Link className={ghost} to="/admin">
          <ShieldCheck size={14} />
          관리자
        </Link>
      )}
      <Link className={ghost} to="/me">
        <UserRound size={14} />
        <span className="max-w-28 truncate">{user.nickname ?? user.email}</span>
      </Link>
      <Link
        className="grid h-8 w-8 place-items-center rounded-md text-white/60 transition hover:bg-white/10 hover:text-white"
        to="/me"
        title="설정"
      >
        <Settings size={14} />
      </Link>
      <button
        className="grid h-8 w-8 place-items-center rounded-md text-white/60 transition hover:bg-white/10 hover:text-white"
        title="로그아웃"
        type="button"
        onClick={logout}
      >
        <LogOut size={14} />
      </button>
    </div>
  );
}