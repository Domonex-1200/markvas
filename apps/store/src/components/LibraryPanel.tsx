"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { StoreEntitlement } from "@markdown-canvas/shared";
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
      {message && <p className="rounded border border-line bg-white p-4 text-sm text-slate-600">{message}</p>}
      {items.map(({ asset, source, grantedAt }) => (
        <article key={asset.id} className="rounded border border-line bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500">{asset.type}</p>
              <Link className="mt-1 block font-bold hover:text-accent" href={`/assets/${asset.id}`}>
                {asset.title}
              </Link>
              <p className="mt-2 text-sm text-slate-600">{asset.metadata.summary ?? asset.metadata.description}</p>
              <p className="mt-3 text-xs text-slate-500">권한: {source} · {new Date(grantedAt).toLocaleString()}</p>
            </div>
            <span className="rounded bg-teal-50 px-3 py-2 text-sm font-semibold text-accent">이용 가능</span>
          </div>
        </article>
      ))}
      {items.length === 0 && !message && (
        <div className="rounded border border-line bg-white p-8 text-center text-sm text-slate-500">
          <Library className="mx-auto mb-3" size={24} />
          라이브러리에 추가된 에셋이 없습니다.
        </div>
      )}
    </section>
  );
}
