
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { StoreWishlistItem } from "../types";
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
      {message && (
        <p className="rounded-xl p-4 text-sm" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
          {message}
        </p>
      )}
      {items.map(({ asset }) => (
        <article key={asset.id} className="rounded-xl p-5" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{asset.type}</p>
              <Link className="mt-1 block font-bold hover:underline" style={{ color: "var(--text-primary)" }} to={`/assets/${asset.id}`}>
                {asset.title}
              </Link>
              <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>{asset.metadata.summary ?? asset.metadata.description}</p>
            </div>
            <button
              className="rounded-lg p-2 transition"
              style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
              title="찜 해제"
              onClick={() => void remove(asset.id)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </article>
      ))}
      {items.length === 0 && !message && (
        <div className="rounded-xl p-8 text-center text-sm" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
          <Heart className="mx-auto mb-3" size={24} style={{ color: "var(--text-muted)" }} />
          찜한 에셋이 없습니다.
        </div>
      )}
    </section>
  );
}
