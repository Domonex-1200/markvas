"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { StoreWishlistItem } from "@markdown-canvas/shared";
import { Heart, Trash2 } from "lucide-react";
import { getWishlist, removeWishlist } from "../lib/api";

export function WishlistPanel(): JSX.Element {
  const [items, setItems] = useState<StoreWishlistItem[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("accessToken");
    if (!token) {
      setMessage("로그인이 필요합니다.");
      return;
    }
    getWishlist(token).then(setItems).catch(() => setMessage("찜 목록을 불러오지 못했습니다."));
  }, []);

  async function remove(assetId: string): Promise<void> {
    const token = window.localStorage.getItem("accessToken");
    if (!token) return;
    await removeWishlist(assetId, token);
    setItems((current) => current.filter((item) => item.asset.id !== assetId));
  }

  return (
    <section className="grid gap-3">
      {message && <p className="rounded border border-line bg-white p-4 text-sm text-slate-600">{message}</p>}
      {items.map(({ asset }) => (
        <article key={asset.id} className="rounded border border-line bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500">{asset.type}</p>
              <Link className="mt-1 block font-bold hover:text-accent" href={`/assets/${asset.id}`}>
                {asset.title}
              </Link>
              <p className="mt-2 text-sm text-slate-600">{asset.metadata.summary ?? asset.metadata.description}</p>
            </div>
            <button className="icon-button" title="찜 해제" onClick={() => void remove(asset.id)}>
              <Trash2 size={16} />
            </button>
          </div>
        </article>
      ))}
      {items.length === 0 && !message && (
        <div className="rounded border border-line bg-white p-8 text-center text-sm text-slate-500">
          <Heart className="mx-auto mb-3" size={24} />
          찜한 에셋이 없습니다.
        </div>
      )}
    </section>
  );
}
