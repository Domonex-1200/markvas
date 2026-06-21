import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Code2, FileText, Package, Plug, SwatchBook } from "lucide-react";
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

function CodePreview({ asset }: { asset: StoreAsset }): JSX.Element | null {
  const [open, setOpen] = useState(false);

  let label = "";
  let lang = "";
  let code = "";

  if (asset.type === "THEME") {
    const css = asset.metadata?.tokens?.editorCss as string | undefined;
    if (!css) return null;
    label = "CSS 코드";
    lang = "css";
    code = css;
  } else if (asset.type === "TEMPLATE") {
    const content = asset.metadata?.template?.content as string | undefined;
    if (!content) return null;
    label = "템플릿 마크다운";
    lang = "markdown";
    code = content;
  } else if (asset.type === "PLUGIN") {
    const pluginCode = asset.metadata?.plugin?.code;
    if (!pluginCode) return null;
    label = "플러그인 코드 (JavaScript)";
    lang = "javascript";
    // 가독성을 위해 간단히 포맷
    try {
      code = pluginCode;
    } catch {
      code = pluginCode;
    }
  } else {
    return null;
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
      <button
        className="flex w-full items-center gap-3 px-7 py-5 text-left transition hover:opacity-80"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <Code2 size={17} style={{ color: "var(--teal)", flexShrink: 0 }} />
        <span className="flex-1 text-base font-bold" style={{ color: "var(--text-primary)" }}>{label}</span>
        <span className="rounded px-2 py-0.5 text-xs font-mono font-semibold" style={{ background: "var(--bg-overlay)", color: "var(--text-muted)" }}>{lang}</span>
        {open ? <ChevronUp size={16} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />}
      </button>

      {open && (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          <pre
            className="overflow-auto p-5 text-xs leading-relaxed"
            style={{
              background: "#0d1117",
              color: "#e6edf3",
              fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
              maxHeight: "420px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

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
      <main className="min-h-screen" style={{ background: "var(--bg-base)" }}>
        <SiteHeader />
        <div className="py-20 text-center" style={{ color: "var(--text-muted)" }}>불러오는 중...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen" style={{ background: "var(--bg-base)" }}>
        <SiteHeader />
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <p className="font-bold" style={{ color: "#f87171" }}>연결 오류</p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>{error}</p>
          <Link className="mt-4 inline-block text-sm font-semibold hover:underline" style={{ color: "var(--teal)" }} to="/assets">
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
    <main className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <SiteHeader />

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* 뒤로가기 */}
        <Link
          className="inline-flex items-center gap-1.5 text-sm font-semibold transition hover:opacity-80"
          style={{ color: "var(--text-muted)" }}
          to="/assets"
        >
          <ArrowLeft size={14} />
          에셋 스토어
        </Link>

        {/* 커버 이미지 */}
        {asset.metadata.media?.coverImageUrl ? (
          <img
            className="mt-5 aspect-[16/6] w-full rounded-2xl object-cover"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
            src={asset.metadata.media.coverImageUrl}
            alt={`${asset.title} cover`}
          />
        ) : (
          <div
            className="mt-5 flex aspect-[16/6] w-full items-center justify-center rounded-2xl"
            style={{ background: "linear-gradient(135deg, var(--bg-overlay), rgba(32,197,188,0.15))" }}
          >
            <Icon style={{ color: "var(--teal)", opacity: 0.4 }} size={64} />
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_260px]">
          {/* 왼쪽: 정보 */}
          <div className="space-y-4 min-w-0">
            <div className="rounded-2xl p-7" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: "var(--bg-overlay)", color: "var(--text-secondary)" }}>
                  {TYPE_LABEL[asset.type]}
                </span>
                <span className="rounded-full px-3 py-1 text-xs font-bold" style={isFree ? { background: "rgba(32,197,188,0.12)", color: "var(--teal)" } : { background: "rgba(124,92,252,0.12)", color: "var(--purple)" }}>
                  {isFree ? "무료" : `₩${(asset.priceCents! / 100).toLocaleString()}`}
                </span>
                {(asset.tags ?? []).map((tag) => (
                  <span key={tag} className="rounded-full px-3 py-1 text-xs font-bold" style={{ background: "rgba(124,92,252,0.10)", color: "var(--purple)" }}>#{tag}</span>
                ))}
                {(asset.reviewCount ?? 0) > 0 && (
                  <div className="flex items-center gap-1">
                    <StarRating value={Math.round(asset.avgRating ?? 0)} size={13} />
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{(asset.avgRating ?? 0).toFixed(1)} ({asset.reviewCount})</span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>{asset.title}</h1>

              {asset.metadata.summary && (
                <p className="mt-3 text-base font-semibold" style={{ color: "var(--teal)" }}>{asset.metadata.summary}</p>
              )}

              <p className="mt-4 leading-7" style={{ color: "var(--text-secondary)" }}>
                {asset.metadata.description ?? "설명이 아직 없습니다."}
              </p>
            </div>

            {/* 변경 내역 */}
            {asset.metadata.changelog && (
              <div className="rounded-2xl p-7" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
                <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>변경 내역</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                  {asset.metadata.changelog}
                </p>
              </div>
            )}

            {/* 코드 미리보기 */}
            <CodePreview asset={asset} />

            {/* 에셋 정보 */}
            <div className="rounded-2xl p-7" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
              <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>에셋 정보</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {asset.metadata.version && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>버전</dt>
                    <dd className="mt-1 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{asset.metadata.version}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>유형</dt>
                  <dd className="mt-1 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{TYPE_LABEL[asset.type]}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>라이선스</dt>
                  <dd className="mt-1 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>무료 사용</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>가격</dt>
                  <dd className="mt-1 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{isFree ? "무료" : `₩${(asset.priceCents! / 100).toLocaleString()}`}</dd>
                </div>
              </dl>
            </div>

            {/* 리뷰 섹션 */}
            <ReviewSection assetId={asset.id} assetAuthorId={asset.authorId} />
          </div>

          {/* 오른쪽: 설치/액션 */}
          <div className="space-y-3 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl p-5" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
              <InstallButton assetId={asset.id} priceCents={asset.priceCents ?? 0} />
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
