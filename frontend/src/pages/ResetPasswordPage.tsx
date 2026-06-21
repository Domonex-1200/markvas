import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";
import { resetPassword } from "../lib/api";

export default function ResetPasswordPage(): JSX.Element {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    if (newPassword.length < 8) { setError("비밀번호는 8자 이상이어야 합니다."); return; }
    if (newPassword !== confirm) { setError("비밀번호가 일치하지 않습니다."); return; }
    setLoading(true);
    setError("");
    try {
      await resetPassword(token, newPassword);
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      setError("링크가 유효하지 않거나 만료됐습니다. 다시 요청해주세요.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-[#f5f7fb]">
        <SiteHeader />
        <div className="mx-auto max-w-md px-6 py-16 text-center">
          <p className="font-bold text-red-600">유효하지 않은 링크입니다.</p>
          <Link className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline" to="/forgot-password">
            비밀번호 찾기로 이동
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-black text-slate-950">새 비밀번호 설정</h1>

          {done ? (
            <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-center">
              <p className="font-bold text-emerald-700">비밀번호가 변경되었습니다</p>
              <p className="mt-1 text-sm text-emerald-600">잠시 후 로그인 페이지로 이동합니다…</p>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">새 비밀번호</span>
                <input
                  className="field-input"
                  type="password"
                  placeholder="8자 이상"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">비밀번호 확인</span>
                <input
                  className="field-input"
                  type="password"
                  placeholder="비밀번호 재입력"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </label>
              {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
              <button className="button w-full" disabled={loading} type="submit">
                {loading ? "변경 중…" : "비밀번호 변경"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
