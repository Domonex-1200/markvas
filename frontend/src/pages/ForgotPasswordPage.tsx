import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";
import { forgotPassword } from "../lib/api";

export default function ForgotPasswordPage(): JSX.Element {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await forgotPassword(email.trim());
      setDone(true);
    } catch {
      setError("요청에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-black text-slate-950">비밀번호 찾기</h1>
          <p className="mt-2 text-sm text-slate-500">가입한 이메일 주소를 입력하면 재설정 링크를 보내드립니다.</p>

          {done ? (
            <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-center">
              <p className="font-bold text-emerald-700">이메일을 확인해주세요</p>
              <p className="mt-1 text-sm text-emerald-600">
                비밀번호 재설정 링크를 {email}로 보냈습니다.<br />
                이메일이 오지 않는다면 스팸함을 확인해주세요.
              </p>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">이메일</span>
                <input
                  className="field-input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </label>
              {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
              <button className="button w-full" disabled={loading} type="submit">
                {loading ? "전송 중…" : "재설정 링크 전송"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link className="font-bold text-blue-600 hover:underline" to="/login">로그인으로 돌아가기</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
