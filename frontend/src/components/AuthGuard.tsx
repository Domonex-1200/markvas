
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function AuthGuard({ children, redirectTo = "/register" }: { children: React.ReactNode; redirectTo?: string }): JSX.Element | null {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("accessToken");
    if (!token) {
      navigate(`${redirectTo}?next=${encodeURIComponent(window.location.pathname)}`, { replace: true });
    } else {
      setReady(true);
    }
  }, [navigate, redirectTo]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-400">
        확인 중…
      </div>
    );
  }

  return <>{children}</>;
}