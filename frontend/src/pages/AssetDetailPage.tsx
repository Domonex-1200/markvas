import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Package, Plug, SwatchBook } from "lucide-react";
import { AssetCommerceActions } from "../components/AssetCommerceActions";
import { InstallButton } from "../components/InstallButton";
import { ReviewSection } from "../components/ReviewSection";
import { StarRating } from "../components/StarRating";
import { SiteHeader } from "../components/SiteHeader";
import { getAsset } from "../lib/api";
import type { StoreAsset } from "../types";

const TYPE_LABEL: Record<StoreAsset["type"], string> = {
  THEME: "테마",
  TEMPLATE: "템플릿",
  PLUGIN: "플러그인",
};

const TYPE_ICON: Record<StoreAsset["type"], React.ElementType> = {
  THEME: SwatchBook,
  TEMPLATE: FileText,
  PLUGIN: Plug,
};

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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f7fb]">
        <SiteHeader />
        <div className="py-20 text-center text-slate-500">불러오는 중...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f5f7fb]">
        <SiteHeader />
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="font-bold text-red-600">연결 오류</p>
          <p className="mt-1 text-sm text-red-500">{error}</p>
          <Link className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline" to="/assets">
            스토어로 돌아가기
          </Link>
        </div>
      </main>
    );
  }

  if (!asset) return <></>;

  const Icon = TYPE_ICON[asset.type] ?? Package;
  const isFree = !asset.priceCents || asset.priceCents === 0;

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <SiteHeader />

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* 뒤로가기 */}
        <Link
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          to="/assets"
        >
          <ArrowLeft size={14} />
          에셋 스토어
        </Link>

        {/* 커버 이미지 */}
        {asset.metadata.media?.coverImageUrl ? (
          <img
            className="mt-5 aspect-[16/6] w-full rounded-xl object-cover shadow-md"
            src={asset.metadata.media.coverImageUrl}
            alt={`${asset.title} cover`}
          />
        ) : (
          <div className="mt-5 flex aspect-[16/6] w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,#111827,#1d4ed8)] shadow-md">
            <Icon className="text-white/40" size={64} />
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_260px]">
          {/* 왼쪽: 정보 */}
          <div className="space-y-6 min-w-0">
            <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {TYPE_LABEL[asset.type]}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${isFree ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                  {isFree ? "무료" : `₩${(asset.priceCents! / 100).toLocaleString()}`}
                </span>
                {(asset.tags ?? []).map((tag) => (
                  <span key={tag} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">#{tag}</span>
                ))}
                {(asset.reviewCount ?? 0) > 0 && (
                  <div className="flex items-center gap-1">
                    <StarRating value={Math.round(asset.avgRating ?? 0)} size={13} />
                    <span className="text-xs text-slate-500">{(asset.avgRating ?? 0).toFixed(1)} ({asset.reviewCount})</span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl font-black text-slate-950">{asset.title}</h1>

              {asset.metadata.summary && (
                <p className="mt-3 text-base font-semibold text-blue-600">{asset.metadata.summary}</p>
              )}

              <p className="mt-4 leading-7 text-slate-600">
                {asset.metadata.description ?? "설명이 아직 없습니다."}
              </p>
            </div>

            {/* 변경 내역 */}
            {asset.metadata.changelog && (
              <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">변경 내역</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {asset.metadata.changelog}
                </p>
              </div>
            )}

            {/* 에셋 정보 */}
            <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">에셋 정보</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {asset.metadata.version && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">버전</dt>
                    <dd className="mt-1 text-sm font-medium text-slate-700">{asset.metadata.version}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">유형</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-700">{TYPE_LABEL[asset.type]}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">라이선스</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-700">무료 사용</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">가격</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-700">{isFree ? "무료" : `₩${(asset.priceCents! / 100).toLocaleString()}`}</dd>
                </div>
              </dl>
            </div>

            {/* 리뷰 섹션 */}
            <ReviewSection assetId={asset.id} />
          </div>

          {/* 오른쪽: 설치/액션 */}
          <div className="space-y-3 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <InstallButton assetId={asset.id} />
              <div className="mt-2">
                <AssetCommerceActions assetId={asset.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
