import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Code2, DollarSign, FileText, Save, SwatchBook } from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import { ImageUploader } from "../components/ImageUploader";
import { getAsset, updateAsset } from "../lib/api";
import type { AssetType, StoreAsset } from "../types";

export default function DeveloperEditAssetPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = window.localStorage.getItem("accessToken") ?? "";

  const [asset, setAsset]     = useState<StoreAsset | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle]                   = useState("");
  const [summary, setSummary]               = useState("");
  const [description, setDescription]       = useState("");
  const [changelog, setChangelog]           = useState("");
  const [version, setVersion]               = useState("");
  const [filePath, setFilePath]             = useState("");
  const [coverImageUrl, setCoverImageUrl]   = useState("");
  const [themeCss, setThemeCss]             = useState("");
  const [code, setCode]                     = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [pricingType, setPricingType]       = useState<"FREE" | "PAID">("FREE");
  const [priceCents, setPriceCents]         = useState(0);
  const [message, setMessage]               = useState("");
  const [success, setSuccess]               = useState(false);
  const [saving, setSaving]                 = useState(false);

  useEffect(() => {
    if (!id || !token) { navigate("/"); return; }
    getAsset(id)
      .then((a) => {
        setAsset(a);
        setTitle(a.title);
        setSummary(a.metadata.summary ?? "");
        setDescription(a.metadata.description ?? "");
        setChangelog(a.metadata.changelog ?? "");
        setVersion(a.metadata.version ?? "1.0.0");
        setFilePath(a.filePath);
        setCoverImageUrl(a.metadata.media?.coverImageUrl ?? "");
        setThemeCss((a.metadata.tokens as { editorCss?: string })?.editorCss ?? "");
        setCode((a.metadata.plugin as { code?: string })?.code ?? "");
        setTemplateContent((a.metadata.template as { content?: string })?.content ?? "");
        setPricingType(a.pricingType ?? "FREE");
        setPriceCents(a.priceCents ?? 0);
      })
      .catch(() => navigate("/developer/assets"))
      .finally(() => setLoading(false));
  }, [id, token, navigate]);

  async function save(): Promise<void> {
    if (!id || !title.trim()) { setSuccess(false); setMessage("제목을 입력해 주세요."); return; }
    setSaving(true);
    setMessage("");

    const type = asset?.type as AssetType;
    const existingPlugin = asset?.metadata.plugin;
    const existingTemplate = asset?.metadata.template;
    const metadata = {
      version,
      summary,
      description,
      ...(changelog ? { changelog } : {}),
      ...(coverImageUrl ? { media: { coverImageUrl } } : {}),
      ...(type === "THEME" ? { tokens: { editorCss: themeCss } } : {}),
      ...(type === "PLUGIN" ? { plugin: { id: existingPlugin?.id ?? "", title: existingPlugin?.title ?? "", version: existingPlugin?.version ?? version, entryFile: existingPlugin?.entryFile ?? "", code } } : {}),
      ...(type === "TEMPLATE" ? { template: { id: existingTemplate?.id ?? "", title: existingTemplate?.title ?? title, content: templateContent } } : {}),
    } as import("../types").AssetMetadata;

    try {
      await updateAsset(id, { title, filePath, metadata, pricingType, priceCents: pricingType === "FREE" ? 0 : priceCents, currency: "KRW" }, token);
      setSuccess(true);
      setMessage("저장되었습니다.");
    } catch {
      setSuccess(false);
      setMessage("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main style={{ background: "var(--bg-base)" }}>
        <SiteHeader />
        <div className="py-20 text-center" style={{ color: "var(--text-muted)" }}>불러오는 중…</div>
      </main>
    );
  }

  if (!asset) return <></>;

  const typeIcon: Record<AssetType, JSX.Element> = {
    THEME: <SwatchBook size={17} />, TEMPLATE: <FileText size={17} />, PLUGIN: <Code2 size={17} />,
  };
  const typeLabel: Record<AssetType, string> = { THEME: "테마", TEMPLATE: "템플릿", PLUGIN: "플러그인" };

  return (
    <main style={{ background: "var(--bg-base)" }}>
      <SiteHeader />
      <section className="hero-dark" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="mx-auto max-w-3xl px-6 py-8">
          <button
            className="mb-4 flex items-center gap-1.5 text-sm font-semibold transition hover:opacity-80"
            style={{ color: "var(--text-muted)" }}
            onClick={() => navigate("/developer/assets")}
          >
            <ArrowLeft size={14} />
            내 에셋 목록
          </button>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ background: "rgba(32,197,188,0.12)", color: "var(--teal)" }}>
              {typeIcon[asset.type]}
              {typeLabel[asset.type]}
            </span>
            <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>에셋 수정</h1>
          </div>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>{asset.title}</p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <section className="rounded-2xl p-6" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="제목" value={title} onChange={setTitle} placeholder="에셋 제목" required />
              <TextField label="버전" value={version} onChange={setVersion} placeholder="1.0.0" />
            </div>
            <TextField label="짧은 소개" value={summary} onChange={setSummary} placeholder="한 줄 설명" />
            <AreaField label="상세 설명" value={description} onChange={setDescription} rows={5} />
            <AreaField label="변경 내역 (Changelog)" value={changelog} onChange={setChangelog} placeholder={"## v1.0.0\n- 최초 릴리즈"} rows={4} />
            <TextField label="에셋 파일 경로" value={filePath} onChange={setFilePath} />
            <ImageUploader value={coverImageUrl} onChange={setCoverImageUrl} folder="assets/covers" label="대표 이미지" />

            {asset.type === "THEME"    && <AreaField label="테마 CSS" value={themeCss} onChange={setThemeCss} mono rows={10} />}
            {asset.type === "PLUGIN"   && <AreaField label="플러그인 코드" value={code} onChange={setCode} mono rows={12} />}
            {asset.type === "TEMPLATE" && <AreaField label="템플릿 본문" value={templateContent} onChange={setTemplateContent} mono rows={12} />}

            {/* 가격 설정 */}
            <div>
              <p className="mb-2 text-sm font-bold" style={{ color: "var(--text-secondary)" }}>가격 설정</p>
              <div className="flex gap-2">
                {(["FREE", "PAID"] as const).map(pt => (
                  <button
                    key={pt}
                    type="button"
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition"
                    style={pricingType === pt
                      ? { background: "rgba(32,197,188,0.15)", border: "1px solid rgba(32,197,188,0.4)", color: "var(--teal)" }
                      : { background: "var(--bg-overlay)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                    onClick={() => setPricingType(pt)}
                  >
                    <DollarSign size={14} />
                    {pt === "FREE" ? "무료" : "유료"}
                  </button>
                ))}
              </div>
              {pricingType === "PAID" && (
                <div className="mt-3">
                  <label className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
                    가격 (원)
                    <div className="mt-2 flex h-11 items-center gap-2 rounded-xl px-3" style={{ background: "var(--bg-overlay)", border: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--text-muted)" }}>₩</span>
                      <input
                        type="number" min={0} step={100}
                        className="flex-1 bg-transparent outline-none font-normal"
                        style={{ color: "var(--text-primary)" }}
                        value={priceCents / 100}
                        onChange={e => setPriceCents(Math.round(parseFloat(e.target.value || "0") * 100))}
                      />
                    </div>
                  </label>
                </div>
              )}
            </div>

            <button className="button justify-self-start" disabled={saving} onClick={() => void save()}>
              <Save size={16} />
              {saving ? "저장 중…" : "변경 사항 저장"}
            </button>

            {message && (
              <p className="rounded-xl px-4 py-3 text-sm font-bold" style={success
                ? { background: "rgba(32,197,188,0.10)", border: "1px solid rgba(32,197,188,0.25)", color: "var(--teal)" }
                : { background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }
              }>
                {message}
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function TextField({ label, value, onChange, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}): JSX.Element {
  return (
    <label className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
      {label}{required && <span style={{ color: "#f87171" }}> *</span>}
      <div className="mt-2 flex h-11 items-center gap-2 rounded-xl px-3" style={{ background: "var(--bg-overlay)", border: "1px solid var(--border)" }}>
        <input className="min-w-0 flex-1 bg-transparent font-normal outline-none" style={{ color: "var(--text-primary)" }} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
      </div>
    </label>
  );
}

function AreaField({ label, value, onChange, placeholder, rows = 5, mono }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; mono?: boolean;
}): JSX.Element {
  return (
    <label className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
      {label}
      <textarea
        className={`mt-2 w-full rounded-xl p-3 font-normal outline-none resize-y ${mono ? "font-mono text-sm" : ""}`}
        style={{ background: "var(--bg-overlay)", border: "1px solid var(--border)", color: "var(--text-primary)", minHeight: `${rows * 1.6}rem` }}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    </label>
  );
}
