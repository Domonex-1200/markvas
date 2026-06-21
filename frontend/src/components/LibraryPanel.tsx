
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { StoreEntitlement } from "../types";
import { Library } from "lucide-react";
import { getEntitlements } from "../lib/api";

export function LibraryPanel(): JSX.Element {
  const [items, setItems] = useState<StoreEntitlement[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("accessToken");
    if (!token) {
      setMessage("로그인이 필요합니다.");
      return;
    }
    getEntitlements(token).then(setItems).catch(() => setMessage("라이브러리를 불러오지 못했습니다."));
  }, []);

  return (
    <section className="grid gap-3">
      {message && (
        <p className="rounded-xl p-4 text-sm" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
          {message}
        </p>
      )}
      {items.map(({ asset, source, grantedAt }) => (
        <article key={asset.id} className="rounded-xl p-5" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{asset.type}</p>
              <Link className="mt-1 block font-bold hover:underline" style={{ color: "var(--text-primary)" }} to={`/assets/${asset.id}`}>
                {asset.title}
              </Link>
              <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>{asset.metadata.summary ?? asset.metadata.description}</p>
              <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>권한: {source} · {new Date(grantedAt).toLocaleString()}</p>
            </div>
            <span className="rounded-full px-3 py-1.5 text-sm font-semibold" style={{ background: "rgba(32,197,188,0.12)", color: "var(--teal)" }}>이용 가능</span>
          </div>
        </article>
      ))}
      {items.length === 0 && !message && (
        <div className="rounded-xl p-8 text-center text-sm" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
          <Library className="mx-auto mb-3" size={24} style={{ color: "var(--text-muted)" }} />
          라이브러리에 추가된 에셋이 없습니다.
        </div>
      )}
    </section>
  );
}
