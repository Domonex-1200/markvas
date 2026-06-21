import { useEffect, useState } from "react";
import { Check, Download, X } from "lucide-react";
import { getInstalledAssets, installAsset, purchaseAsset, uninstallAsset } from "../lib/api";

interface Props {
  assetId: string;
  priceCents?: number;
}

export function InstallButton({ assetId, priceCents = 0 }: Props): JSX.Element {
  const [status, setStatus] = useState<"idle" | "busy" | "registered" | "error">("idle");
  const isFree = priceCents === 0;

  useEffect(() => {
    const token = window.localStorage.getItem("accessToken");
    if (!token) return;
    getInstalledAssets(token)
      .then((items) => {
        if (Array.isArray(items) && items.some((item) => item.asset.id === assetId)) setStatus("registered");
      })
      .catch(() => undefined);
  }, [assetId]);

  async function acquire(): Promise<void> {
    const token = window.localStorage.getItem("accessToken");
    if (!token) { window.location.href = "/login"; return; }
    setStatus("busy");
    try {
      if (!isFree) {
        await purchaseAsset(assetId, token);
      }
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
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700">
          <Check size={16} />
          설치됨
        </div>
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-400 transition hover:border-red-200 hover:text-red-500"
          onClick={() => void unregister()}
        >
          <X size={13} />
          설치 해제
        </button>
      </div>
    );
  }

  return (
    <button
      className="button w-full"
      onClick={() => void acquire()}
      disabled={status === "busy"}
    >
      <Download size={16} />
      {status === "error"
        ? "오류 발생 — 다시 시도"
        : status === "busy"
        ? "처리 중…"
        : isFree
        ? "무료 설치"
        : `구매 후 설치`}
    </button>
  );
}
