"use client";

import Link from "next/link";
import axios from "axios";
import { Eye, EyeOff, GalleryVerticalEnd, UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { register } from "../lib/api";

function passwordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (pw.length === 0) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) || /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: "약함", color: "bg-red-500" };
  if (score === 2) return { level: 2, label: "보통", color: "bg-yellow-400" };
  return { level: 3, label: "강함", color: "bg-blue-500" };
}

export function RegisterForm(): JSX.Element {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(password);
  const pwMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (password !== confirmPassword) { setError("비밀번호가 서로 다릅니다."); return; }
    setError("");
    setLoading(true);
    try {
      const result = await register(email, password);
      window.localStorage.setItem("accessToken", result.tokens.accessToken);
      window.localStorage.setItem("refreshToken", result.tokens.refreshToken);
      window.localStorage.setItem("role", result.user.role);
      window.localStorage.setItem("userEmail", result.user.email);
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
        <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30">
          <GalleryVerticalEnd size={22} />
        </span>
        <h1 className="text-2xl font-black text-white">MarkVas 시작하기</h1>
        <p className="text-sm text-white/60">무료 계정으로 에셋을 설치하고 동기화합니다.</p>
      </div>

      <form className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm" onSubmit={submit}>
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
                placeholder="8자 이상"
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
            {strength.level > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3].map((n) => (
                    <div
                      className={`h-1 flex-1 rounded-full transition-all ${n <= strength.level ? strength.color : "bg-slate-200"}`}
                      key={n}
                    />
                  ))}
                </div>
                <span className={`text-xs font-bold ${strength.level === 1 ? "text-red-500" : strength.level === 2 ? "text-yellow-500" : "text-blue-600"}`}>
                  {strength.label}
                </span>
              </div>
            )}
          </Field>

          <Field label="비밀번호 확인">
            <div className="relative">
              <input
                autoComplete="new-password"
                className={`field-input pr-10 ${pwMismatch ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                placeholder="비밀번호 재입력"
                required
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {pwMismatch && <p className="mt-1.5 text-xs font-semibold text-red-500">비밀번호가 다릅니다.</p>}
          </Field>
        </div>

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        <button className="button mt-5 w-full" disabled={loading || pwMismatch} type="submit">
          <UserPlus size={16} />
          {loading ? "처리 중…" : "계정 만들기"}
        </button>

        <p className="mt-5 text-center text-sm text-slate-500">
          이미 계정이 있나요?{" "}
          <Link className="font-bold text-blue-600 hover:underline" href="/login">
            로그인
          </Link>
        </p>
      </form>

      <p className="mt-5 text-center text-xs leading-5 text-slate-400">
        계정을 만들면{" "}
        <Link className="underline hover:text-slate-600" href="#">서비스 이용약관</Link>
        {" "}및{" "}
        <Link className="underline hover:text-slate-600" href="#">개인정보 처리방침</Link>에 동의합니다.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function toRegisterError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_NETWORK") return "API 서버에 연결할 수 없습니다.";
    if (error.response?.status === 409) return "이미 사용 중인 이메일입니다.";
    if (error.response?.status === 400) return "이메일 형식과 비밀번호 8자 이상 조건을 확인하세요.";
  }
  return "회원가입에 실패했습니다. 잠시 후 다시 시도하세요.";
}
