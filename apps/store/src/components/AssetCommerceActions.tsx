"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { addWishlist, getWishlist, removeWishlist } from "../lib/api";

export function AssetCommerceActions({ assetId }: { assetId: string }): JSX.Element {
  const [wishlistStatus, setWishlistStatus] = useState<"idle" | "busy" | "done">("idle");

  useEffect(() => {
    const token = window.localStorage.getItem("accessToken");
    if (!token) return;

    void getWishlist(token).then((items) => {
      if (items.some((item) => item.asset.id === assetId)) setWishlistStatus("done");
    });
  }, [assetId]);

  async function toggleWishlist(): Promise<void> {
    const token = window.localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    setWishlistStatus("busy");
    if (wishlistStatus === "done") {
      await removeWishlist(assetId, token);
      setWishlistStatus("idle");
      return;
    }

    await addWishlist(assetId, token);
    setWishlistStatus("done");
  }

  return (
    <button className="button-secondary w-full" onClick={toggleWishlist} disabled={wishlistStatus === "busy"}>
      <Heart size={16} />
      {wishlistStatus === "done" ? "찜 해제" : "찜하기"}
    </button>
  );
}
