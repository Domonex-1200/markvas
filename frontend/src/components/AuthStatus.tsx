
import { Link } from "react-router-dom";
import { Heart, Library, LogOut, ShieldCheck, UploadCloud } from "lucide-react";
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

  const icon = "grid h-8 w-8 place-items-center rounded-md text-white/60 transition hover:bg-white/10 hover:text-white";

  // 닉네임/이메일 첫 글자로 아바타
  const avatarChar = (user.nickname ?? user.email)[0].toUpperCase();

  return (
    <div className="flex items-center gap-0.5">
      <Link className={icon} to="/wishlist" title="찜">
        <Heart size={16} />
      </Link>
      <Link className={icon} to="/library" title="라이브러리">
        <Library size={16} />
      </Link>
      {["DEVELOPER", "ADMIN"].includes(user.role) && (
        <Link className={icon} to="/developer/assets" title="내 에셋">
          <UploadCloud size={16} />
        </Link>
      )}
      {user.role === "ADMIN" && (
        <Link className={icon} to="/admin" title="관리자">
          <ShieldCheck size={16} />
        </Link>
      )}
      {/* 프로필 아바타 */}
      <Link
        to="/me"
        title={user.nickname ?? user.email}
        className="ml-1 grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-xs font-black text-white transition hover:bg-blue-500"
      >
        {user.profilePictureUrl ? (
          <img src={user.profilePictureUrl} alt="프로필" className="h-full w-full rounded-full object-cover" />
        ) : (
          avatarChar
        )}
      </Link>
      <button
        className={`${icon} ml-0.5`}
        title="로그아웃"
        type="button"
        onClick={logout}
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}