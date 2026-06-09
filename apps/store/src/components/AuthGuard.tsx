"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AuthGuard({ children, redirectTo = "/register" }: { children: React.ReactNode; redirectTo?: string }): JSX.Element | null {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("accessToken");
    if (!token) {
      router.replace(`${redirectTo}?next=${encodeURIComponent(window.location.pathname)}`);
    } else {
      setReady(true);
    }
  }, [router, redirectTo]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-400">
        확인 중…
      </div>
    );
  }

  return <>{children}</>;
}
