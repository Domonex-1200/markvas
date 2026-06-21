import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";

export default function ForgotPasswordPage(): JSX.Element {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit(e: FormEvent): void {
    e.preventDefault();
    setDone(true);
  }

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-black text-slate-950">비밀번호 찾기</h1>
          <p className="mt-2 text-sm text-slate-500">가입한 이메일 주소를 입력해주세요.</p>

          {done ? (
            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-5 text-center">
              <p className="font-bold text-blue-700">이 기능은 실제 서비스시 작동됩니다</p>
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
              <button className="button w-full" type="submit">
                확인
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
