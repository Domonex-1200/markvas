import { useState } from "react";
import type { StoreAuthState } from "../../preload/index";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (auth: StoreAuthState) => void;
}

export function LoginModal({ isOpen, onClose, onLogin }: Props): JSX.Element | null {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    setError("");
    try {
      const auth = await window.markdownCanvas.login(email.trim(), password);
      onLogin(auth);
      setEmail("");
      setPassword("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 px-4">
      <form
        className="w-full max-w-sm rounded border border-line bg-white p-6 shadow-lg"
        onSubmit={(e) => void handleSubmit(e)}
      >
        <h2 className="text-base font-bold">MarkVas 계정 로그인</h2>
        <p className="mt-1 text-xs text-slate-500">
          에셋 스토어 계정으로 로그인하면 구매한 에셋이 자동으로 동기화됩니다.
        </p>

        {error && (
          <div className="mt-3 rounded bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>
        )}

        <label className="mt-4 block text-xs font-semibold text-slate-700">
          이메일
          <input
            className="mt-1 h-9 w-full rounded border border-line px-3 text-sm outline-none focus:border-accent"
            type="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            placeholder="account@example.com"
          />
        </label>

        <label className="mt-3 block text-xs font-semibold text-slate-700">
          비밀번호
          <input
            className="mt-1 h-9 w-full rounded border border-line px-3 text-sm outline-none focus:border-accent"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </label>

        <div className="mt-5 flex items-center justify-between">
          <a
            href="#"
            className="text-xs text-accent hover:underline"
            onClick={(e) => {
              e.preventDefault();
              window.open("https://d36v39m4b0nmuu.cloudfront.net/register", "_blank");
            }}
          >
            계정이 없으신가요? 회원가입 →
          </a>
          <div className="flex gap-2">
            <button type="button" className="button-secondary" onClick={onClose} disabled={isLoading}>
              취소
            </button>
            <button className="button" type="submit" disabled={isLoading || !email || !password}>
              {isLoading ? "로그인 중…" : "로그인"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
