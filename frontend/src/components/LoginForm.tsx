
import { Link } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, GalleryVerticalEnd, LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { login } from "../lib/api";

export function LoginForm(): JSX.Element {
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      window.localStorage.setItem("accessToken", result.tokens.accessToken);
      window.localStorage.setItem("refreshToken", result.tokens.refreshToken);
      window.localStorage.setItem("role", result.user.role);
      window.localStorage.setItem("userEmail", result.user.email);
      window.location.href = next;
    } catch (caught) {
      setError(toLoginError(caught));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30">
          <GalleryVerticalEnd size={22} />
        </span>
        <h1 className="text-2xl font-black text-white">다시 오셨군요</h1>
        <p className="text-sm text-white/60">MarkVas 계정으로 로그인합니다.</p>
      </div>

      <form className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm" onSubmit={submit}>
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-slate-700">이메일</span>
            <input
              autoComplete="email"
              className="field-input"
              placeholder="you@example.com"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-slate-700">비밀번호</span>
            <div className="relative">
              <input
                autoComplete="current-password"
                className="field-input pr-10"
                placeholder="비밀번호 입력"
                required
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                type="button"
                onClick={() => setShowPw((v) => !v)}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <button className="button mt-5 w-full" disabled={loading} type="submit">
          <LogIn size={16} />
          {loading ? "로그인 중…" : "로그인"}
        </button>

        <p className="mt-5 text-center text-sm text-slate-500">
          계정이 없나요?{" "}
          <Link className="font-bold text-blue-600 hover:underline" to={next !== "/" ? `/register?next=${encodeURIComponent(next)}` : "/register"}>
            회원가입
          </Link>
        </p>
      </form>
    </div>
  );
}

function toLoginError(error: unknown): string {
  if (axios.isAxiosError(error) && error.code === "ERR_NETWORK") {
    return "API 서버에 연결할 수 없습니다.";
  }
  return "이메일 또는 비밀번호를 확인하세요.";
}