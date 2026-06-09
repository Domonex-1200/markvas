"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { StoreAsset } from "@markdown-canvas/shared";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { approveAsset, getReviewAssets, rejectAsset } from "../lib/api";

export function AdminReviewPanel(): JSX.Element {
  const [assets, setAssets] = useState<StoreAsset[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = window.localStorage.getItem("accessToken");
    if (!token) {
      setMessage("관리자 로그인이 필요합니다.");
      return;
    }
    getReviewAssets(token).then(setAssets).catch(() => setMessage("심사 목록을 불러오지 못했습니다."));
  }, []);

  async function update(assetId: string, action: "approve" | "reject"): Promise<void> {
    const token = window.localStorage.getItem("accessToken");
    if (!token) return;
    const nextAsset = action === "approve" ? await approveAsset(assetId, token) : await rejectAsset(assetId, token);
    setAssets((current) => current.map((asset) => (asset.id === assetId ? nextAsset : asset)));
    setMessage(`${nextAsset.title} 상태를 ${nextAsset.status}로 변경했습니다.`);
  }

  return (
    <section className="space-y-4">
      <div className="rounded border border-line bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <ShieldCheck size={18} />
          에셋 심사
        </h2>
        <p className="mt-2 text-sm text-slate-600">등록된 에셋의 설명, 이미지, manifest, 코드 metadata를 검토하고 게시 여부를 결정합니다.</p>
        {message && <p className="mt-3 text-sm font-semibold text-accent">{message}</p>}
      </div>

      <div className="grid gap-3">
        {assets.map((asset) => (
          <article key={asset.id} className="rounded border border-line bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold text-slate-500">{asset.type}</p>
                  <span className="rounded bg-stone-100 px-2 py-1 text-[11px] font-semibold text-slate-600">{asset.status}</span>
                  <span className="rounded bg-stone-100 px-2 py-1 text-[11px] font-semibold text-slate-600">v{asset.metadata.version}</span>
                </div>
                <Link className="mt-2 block text-base font-bold hover:text-accent" href={`/assets/${asset.id}`}>
                  {asset.title}
                </Link>
                <p className="mt-2 text-sm leading-6 text-slate-600">{asset.metadata.summary ?? asset.metadata.description ?? "설명 없음"}</p>
                <p className="mt-2 break-all text-xs text-slate-500">{asset.filePath}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button className="button-secondary" onClick={() => void update(asset.id, "reject")} disabled={asset.status === "REJECTED"}>
                  <XCircle size={16} />
                  반려
                </button>
                <button className="button" onClick={() => void update(asset.id, "approve")} disabled={asset.status === "PUBLISHED"}>
                  <CheckCircle2 size={16} />
                  승인
                </button>
              </div>
            </div>
          </article>
        ))}
        {assets.length === 0 && !message && <p className="rounded border border-line bg-white p-6 text-center text-sm text-slate-500">심사할 에셋이 없습니다.</p>}
      </div>
    </section>
  );
}
