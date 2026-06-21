
import { Link } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, GalleryVerticalEnd, UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { register } from "../lib/api";

interface StrengthRule {
  ok: boolean;
  label: string;
}

function getPasswordRules(pw: string): StrengthRule[] {
  return [
    { ok: pw.length >= 7,             label: "7자 이상" },
    { ok: /[A-Z]/.test(pw),           label: "대문자 포함" },
    { ok: /[^A-Za-z0-9]/.test(pw),    label: "특수문자 포함" },
  ];
}

function strengthLevel(rules: StrengthRule[]): { level: 0|1|2|3; color: string; label: string; textColor: string } {
  const passed = rules.filter((r) => r.ok).length;
  if (passed === 0) return { level: 0, color: "", label: "", textColor: "" };
  if (passed === 1) return { level: 1, color: "bg-red-500",    label: "약함", textColor: "#f87171" };
  if (passed === 2) return { level: 2, color: "bg-yellow-400", label: "보통", textColor: "#fbbf24" };
  return            { level: 3, color: "bg-teal-400",  label: "강함", textColor: "var(--teal)" };
}

export function RegisterForm(): JSX.Element {
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [email, setEmail]                   = useState("");
  const [nickname, setNickname]             = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw]                 = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [error, setError]                   = useState("");
  const [loading, setLoading]               = useState(false);

  const rules    = getPasswordRules(password);
  const strength = strengthLevel(rules);
  const pwMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (password !== confirmPassword) { setError("비밀번호가 서로 다릅니다."); return; }
    if (!rules.every((r) => r.ok)) { setError("비밀번호 조건을 모두 충족해 주세요."); return; }
    setError("");
    setLoading(true);
    try {
      const result = await register(email, password, nickname || undefined);
      window.localStorage.setItem("accessToken",  result.tokens.accessToken);
      window.localStorage.setItem("refreshToken", result.tokens.refreshToken);
      window.localStorage.setItem("role",         result.user.role);
      window.localStorage.setItem("userEmail",    result.user.email);
      if (result.user.nickname) window.localStorage.setItem("nickname", result.user.nickname);
      window.location.href = next;
    } catch (caught) {
      setError(toRegisterError(caught));
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
        <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>MarkVas 시작하기</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>무료 계정으로 에셋을 설치하고 동기화합니다.</p>
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
          <Field label="이메일">
            <input
              autoComplete="email"
              className="field-input"
              placeholder="you@example.com"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field label="닉네임 (선택)">
            <input
              autoComplete="nickname"
              className="field-input"
              placeholder="표시될 이름"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </Field>

          <Field label="비밀번호">
            <div className="relative">
              <input
                autoComplete="new-password"
                className="field-input pr-10"
                placeholder="7자 이상 · 대문자 · 특수문자"
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

            {password.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className={`h-1 flex-1 rounded-full transition-all ${n <= strength.level ? strength.color : ""}`}
                        style={n <= strength.level ? {} : { background: "var(--bg-overlay)" }}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <span className="text-xs font-bold" style={{ color: strength.textColor }}>
                      {strength.label}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {rules.map((rule) => (
                    <span
                      key={rule.label}
                      className="flex items-center gap-1 text-xs"
                      style={{ color: rule.ok ? "var(--teal)" : "var(--text-muted)" }}
                    >
                      <span>{rule.ok ? "✓" : "○"}</span>
                      {rule.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Field>

          <Field label="비밀번호 확인">
            <div className="relative">
              <input
                autoComplete="new-password"
                className="field-input pr-10"
                style={pwMismatch ? { borderColor: "#f87171" } : {}}
                placeholder="비밀번호 재입력"
                required
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                style={{ color: "var(--text-muted)" }}
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {pwMismatch && (
              <p className="mt-1.5 text-xs font-semibold" style={{ color: "#f87171" }}>비밀번호가 다릅니다.</p>
            )}
          </Field>
        </div>

        {error && (
          <div className="mt-4 rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
            {error}
          </div>
        )}

        <button
          className="button mt-5 w-full"
          disabled={loading || pwMismatch}
          type="submit"
        >
          <UserPlus size={16} />
          {loading ? "처리 중…" : "계정 만들기"}
        </button>

        <p className="mt-5 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          이미 계정이 있나요?{" "}
          <Link className="font-bold hover:underline" style={{ color: "var(--teal)" }} to={next !== "/" ? `/login?next=${encodeURIComponent(next)}` : "/login"}>
            로그인
          </Link>
        </p>
      </form>

      <p className="mt-5 text-center text-xs leading-5" style={{ color: "var(--text-muted)" }}>
        계정을 만들면{" "}
        <Link className="underline" to="#">서비스 이용약관</Link>
        {" "}및{" "}
        <Link className="underline" to="#">개인정보 처리방침</Link>에 동의합니다.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold" style={{ color: "var(--text-secondary)" }}>{label}</span>
      {children}
    </label>
  );
}

function toRegisterError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_NETWORK") return "API 서버에 연결할 수 없습니다.";
    if (error.response?.status === 409) return "이미 사용 중인 이메일입니다.";
    if (error.response?.status === 400) return "입력값을 확인하세요 (이메일 형식, 비밀번호 조건).";
  }
  return "회원가입에 실패했습니다. 잠시 후 다시 시도하세요.";
}
