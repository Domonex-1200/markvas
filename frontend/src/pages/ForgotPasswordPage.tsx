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
    <main className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 py-16">
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>비밀번호 찾기</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>가입한 이메일 주소를 입력해주세요.</p>

          {done ? (
            <div className="mt-6 rounded-xl p-5 text-center" style={{ background: "rgba(32,197,188,0.10)", border: "1px solid rgba(32,197,188,0.25)" }}>
              <p className="font-bold" style={{ color: "var(--teal)" }}>이 기능은 실제 서비스시 작동됩니다</p>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>이메일</span>
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

          <p className="mt-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            <Link className="font-bold hover:underline" style={{ color: "var(--teal)" }} to="/login">로그인으로 돌아가기</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
