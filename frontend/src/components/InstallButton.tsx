import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { getInstalledAssets, installAsset, uninstallAsset } from "../lib/api";

export function InstallButton({ assetId }: { assetId: string }): JSX.Element {
  const [status, setStatus] = useState<"idle" | "busy" | "registered" | "error">("idle");

  useEffect(() => {
    const token = window.localStorage.getItem("accessToken");
    if (!token) return;
    getInstalledAssets(token)
      .then((items) => {
        if (items.some((item) => item.asset.id === assetId)) setStatus("registered");
      })
      .catch(() => undefined);
  }, [assetId]);

  async function register(): Promise<void> {
    const token = window.localStorage.getItem("accessToken");
    if (!token) { window.location.href = "/login"; return; }
    setStatus("busy");
    try {
      await installAsset(assetId, token);
      setStatus("registered");
    } catch {
      setStatus("error");
    }
  }

  async function unregister(): Promise<void> {
    const token = window.localStorage.getItem("accessToken");
    if (!token) return;
    setStatus("busy");
    try {
      await uninstallAsset(assetId, token);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  if (status === "registered") {
    return (
      <button
        className="button-secondary flex items-center gap-2 text-slate-500 hover:border-red-300 hover:text-red-600"
        onClick={() => void unregister()}
      >
        <X size={16} />
        등록 해제
      </button>
    );
  }

  return (
    <button className="button flex items-center gap-2" onClick={() => void register()} disabled={status === "busy"}>
      <Download size={16} />
      {status === "error" ? "등록 실패" : status === "busy" ? "처리 중…" : "등록하기"}
    </button>
  );
}
