
import { Link } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, GalleryVerticalEnd, LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { login, googleLogin } from "../lib/api";

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
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">비밀번호</span>
              <Link className="text-xs font-semibold text-blue-500 hover:underline" to="/forgot-password">
                비밀번호 찾기
              </Link>
            </div>
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

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">또는</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
          onClick={() => void handleGoogleLogin()}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Google로 로그인
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

  async function handleGoogleLogin(): Promise<void> {
    if (typeof (window as unknown as { google?: unknown }).google === "undefined") {
      setError("Google 로그인이 설정되지 않았습니다.");
      return;
    }
    const g = (window as unknown as { google: { accounts: { id: { initialize: (c: unknown) => void; prompt: () => void } } } }).google;
    g.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "",
      callback: async (response: { credential: string }) => {
        setLoading(true);
        setError("");
        try {
          const result = await googleLogin(response.credential);
          window.localStorage.setItem("accessToken", result.tokens.accessToken);
          window.localStorage.setItem("refreshToken", result.tokens.refreshToken);
          window.localStorage.setItem("role", result.user.role);
          window.localStorage.setItem("userEmail", result.user.email);
          window.location.href = next;
        } catch {
          setError("Google 로그인에 실패했습니다.");
          setLoading(false);
        }
      },
    });
    g.accounts.id.prompt();
  }
}

function toLoginError(error: unknown): string {
  if (axios.isAxiosError(error) && error.code === "ERR_NETWORK") {
    return "API 서버에 연결할 수 없습니다.";
  }
  return "이메일 또는 비밀번호를 확인하세요.";
}