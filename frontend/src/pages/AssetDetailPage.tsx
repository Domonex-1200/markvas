import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { AssetCommerceActions } from "../components/AssetCommerceActions";
import { InstallButton } from "../components/InstallButton";
import { getAsset } from "../lib/api";
import type { StoreAsset } from "../types";

export default function AssetDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<StoreAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getAsset(id)
      .then(setAsset)
      .catch((err) => {
        if (err?.response?.status === 404) navigate("/assets");
        else setError("에셋 정보를 불러오지 못했습니다. 서버 연결을 확인하세요.");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="py-20 text-center text-slate-500">불러오는 중...</div>;

  if (error) return (
    <div className="mx-auto max-w-4xl px-6 py-20 text-center">
      <p className="font-bold text-red-600">연결 오류</p>
      <p className="mt-1 text-sm text-red-500">{error}</p>
      <Link className="mt-4 inline-block text-sm font-semibold text-accent" to="/assets">스토어로 돌아가기</Link>
    </div>
  );

  if (!asset) return <></>;

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <Link className="text-sm font-semibold text-accent" to="/assets">
        스토어로 돌아가기
      </Link>
      {asset.metadata.media?.coverImageUrl && (
        <img className="mt-6 aspect-[16/7] w-full rounded object-cover" src={asset.metadata.media.coverImageUrl} alt={`${asset.title} cover`} />
      )}
      <section className="mt-6 rounded border border-line bg-white p-7 shadow-sm">
        <div className="grid gap-5 md:grid-cols-[1fr_220px]">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{asset.type}</span>
              <span className="rounded bg-teal-50 px-2 py-1 text-xs font-bold text-accent">무료</span>
            </div>
            <h1 className="text-3xl font-bold">{asset.title}</h1>
            {asset.metadata.summary && <p className="mt-3 text-lg font-semibold text-accent">{asset.metadata.summary}</p>}
            <p className="mt-4 leading-7 text-slate-600">{asset.metadata.description ?? "설명이 아직 없습니다."}</p>
          </div>
          <div className="grid content-start gap-2">
            <InstallButton assetId={asset.id} />
            <AssetCommerceActions assetId={asset.id} />
          </div>
        </div>
        <dl className="mt-8 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
          <div><dt className="text-xs font-semibold text-slate-500">Version</dt><dd className="mt-1 text-sm">{asset.metadata.version}</dd></div>
          <div><dt className="text-xs font-semibold text-slate-500">File Path</dt><dd className="mt-1 break-all text-sm">{asset.filePath}</dd></div>
          <div><dt className="text-xs font-semibold text-slate-500">License</dt><dd className="mt-1 text-sm">무료 사용</dd></div>
          <div><dt className="text-xs font-semibold text-slate-500">Status</dt><dd className="mt-1 text-sm">{asset.status ?? "PUBLISHED"}</dd></div>
        </dl>
        {asset.metadata.changelog && (
          <section className="mt-6">
            <h2 className="font-bold">변경 내역</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{asset.metadata.changelog}</p>
          </section>
        )}
        <section className="mt-6">
          <h2 className="font-bold">Metadata</h2>
          <pre className="mt-3 max-h-96 overflow-auto rounded bg-ink p-4 text-xs text-white">{JSON.stringify(asset.metadata, null, 2)}</pre>
        </section>
      </section>
    </main>
  );
}
