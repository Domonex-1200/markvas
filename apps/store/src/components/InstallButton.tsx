"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { getInstalledAssets, installAsset } from "../lib/api";

export function InstallButton({ assetId }: { assetId: string }): JSX.Element {
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");

  useEffect(() => {
    const token = window.localStorage.getItem("accessToken");
    if (!token) return;

    getInstalledAssets(token)
      .then((items) => {
        if (items.some((item) => item.asset.id === assetId)) setStatus("done");
      })
      .catch(() => undefined);
  }, [assetId]);

  async function install(): Promise<void> {
    const token = window.localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    setStatus("busy");
    try {
      await installAsset(assetId, token);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <button className="button" onClick={install} disabled={status === "busy" || status === "done"}>
      <Download size={16} />
      {status === "done" ? "설치됨" : status === "error" ? "설치 실패" : status === "busy" ? "설치 중" : "무료 설치"}
    </button>
  );
}
