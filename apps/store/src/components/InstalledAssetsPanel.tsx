"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { InstalledAsset } from "@markdown-canvas/shared";
import { Copy, DownloadCloud } from "lucide-react";
import { getInstalledAssets } from "../lib/api";

export function InstalledAssetsPanel(): JSX.Element {
  const [assets, setAssets] = useState<InstalledAsset[]>([]);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const accessToken = window.localStorage.getItem("accessToken") ?? "";
    setToken(accessToken);

    if (!accessToken) {
      setMessage("로그인이 필요합니다.");
      return;
    }

    getInstalledAssets(accessToken)
      .then(setAssets)
      .catch(() => setMessage("설치 에셋을 불러오지 못했습니다."));
  }, []);

  async function copyToken(): Promise<void> {
    await window.navigator.clipboard.writeText(token);
    setMessage("데스크톱 동기화용 토큰을 복사했습니다.");
  }

  if (!token) {
    return (
      <section className="rounded border border-line bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm text-slate-600">{message}</p>
        <Link className="button" href="/login">
          로그인
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded border border-line bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">데스크톱 동기화</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          데스크톱 앱의 에셋 동기화 버튼을 누른 뒤 이 토큰을 붙여넣으면 설치한 테마가 로컬 앱에 적용됩니다.
        </p>
        <button className="button mt-4" onClick={copyToken}>
          <Copy size={16} />
          동기화 토큰 복사
        </button>
        {message && <p className="mt-3 text-sm font-semibold text-accent">{message}</p>}
      </div>

      <div className="grid gap-3">
        {assets.map(({ asset, installedAt }) => (
          <article key={asset.id} className="rounded border border-line bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500">{asset.type}</p>
                <h3 className="mt-1 font-bold">{asset.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{asset.metadata.description}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded bg-teal-50 px-3 py-2 text-sm font-semibold text-accent">
                <DownloadCloud size={16} />
                설치됨
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">설치 시각: {new Date(installedAt).toLocaleString()}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
