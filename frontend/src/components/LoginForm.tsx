
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
        <span
          className="grid h-12 w-12 place-items-center rounded-2xl"
          style={{ background: "var(--teal)", color: "#000", boxShadow: "0 0 24px rgba(32,197,188,0.4)" }}
        >
          <GalleryVerticalEnd size={22} />
        </span>
        <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>다시 오셨군요</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>MarkVas 계정으로 로그인합니다.</p>
      </div>

      <form
        className="rounded-2xl p-7"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
        onSubmit={submit}
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold" style={{ color: "var(--text-secondary)" }}>이메일</span>
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
              <span className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>비밀번호</span>
              <Link className="text-xs font-semibold hover:underline" style={{ color: "var(--teal)" }} to="/forgot-password">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 transition"
              style={{ color: "var(--text-muted)" }}
                type="button"
                onClick={() => setShowPw((v) => !v)}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
        </div>

        {error && (
          <div className="mt-4 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
            {error}
          </div>
        )}

        <button className="button mt-5 w-full" disabled={loading} type="submit">
          <LogIn size={16} />
          {loading ? "로그인 중…" : "로그인"}
        </button>

        <p className="mt-5 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          계정이 없나요?{" "}
          <Link className="font-bold hover:underline" style={{ color: "var(--teal)" }} to={next !== "/" ? `/register?next=${encodeURIComponent(next)}` : "/register"}>
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
