import { useEffect, useState } from "react";
import { BookMarked, Check, Download, PauseCircle } from "lucide-react";
import { getLibrary, installAsset } from "../lib/api";
import type { LibraryStatus } from "../types";

interface Props {
  assetId: string;
  priceCents?: number;
}

type ButtonState = "idle" | "busy" | "active" | "inactive" | "error";

export function InstallButton({ assetId, priceCents = 0 }: Props): JSX.Element {
  const [state, setState] = useState<ButtonState>("idle");
  const [libraryStatus, setLibraryStatus] = useState<LibraryStatus | null>(null);
  const isFree = priceCents === 0;

  useEffect(() => {
    const token = window.localStorage.getItem("accessToken");
    if (!token) return;
    getLibrary(token)
      .then((items) => {
        const found = items.find((i) => i.asset.id === assetId);
        if (found) {
          setLibraryStatus(found.status);
          setState(found.status === "ACTIVE" ? "active" : "inactive");
        }
      })
      .catch(() => undefined);
  }, [assetId]);

  async function addToLibrary(): Promise<void> {
    const token = window.localStorage.getItem("accessToken");
    if (!token) { window.location.href = "/login"; return; }
    setState("busy");
    try {
      await installAsset(assetId, token);
      setLibraryStatus("INACTIVE");
      setState("inactive");
    } catch {
      setState("error");
    }
  }

  if (state === "active") {
    return (
      <div
        className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold"
        style={{ background: "rgba(32,197,188,0.12)", color: "var(--teal)", border: "1px solid rgba(32,197,188,0.3)" }}
      >
        <Check size={15} />
        활성 등록됨
      </div>
    );
  }

  if (state === "inactive") {
    return (
      <div className="space-y-1.5">
        <div
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold"
          style={{ background: "rgba(248,169,74,0.10)", color: "#f8a94a", border: "1px solid rgba(248,169,74,0.25)" }}
        >
          <PauseCircle size={15} />
          라이브러리에 있음 (비활성)
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          라이브러리에서 활성화하면 노트 앱에 등록됩니다.{" "}
          <a href="/library" className="underline" style={{ color: "var(--teal)" }}>라이브러리 이동</a>
        </p>
      </div>
    );
  }

  return (
    <button
      className="button w-full"
      onClick={() => void addToLibrary()}
      disabled={state === "busy"}
    >
      {state === "busy" ? (
        "처리 중…"
      ) : state === "error" ? (
        "오류 발생 — 다시 시도"
      ) : (
        <>
          {isFree ? <Download size={16} /> : <BookMarked size={16} />}
          {isFree ? "라이브러리에 추가" : "구매 후 추가"}
        </>
      )}
    </button>
  );
}
