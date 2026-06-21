
import { useState } from "react";
import type { AssetMetadata, AssetType } from "../types";
import { Code2, DollarSign, FileText, Save, SwatchBook } from "lucide-react";
import { createAsset, submitAssetForReview } from "../lib/api";
import { ImageUploader } from "./ImageUploader";

const DEFAULT_PLUGIN_CODE = "return function(input) { return `현재 명령: ${input.commandId}`; };";
const DEFAULT_THEME_CSS = ".prose-canvas h1 { color: #2563eb; }";

export function AssetCreateForm(): JSX.Element {
  const [type, setType] = useState<AssetType>("THEME");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [changelog, setChangelog] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [filePath, setFilePath] = useState("/assets/custom/asset.json");
  const [themeCss, setThemeCss] = useState(DEFAULT_THEME_CSS);
  const [code, setCode] = useState(DEFAULT_PLUGIN_CODE);
  const [templateContent, setTemplateContent] = useState("# {{title}}\n\n");
  const [pricingType, setPricingType] = useState<"FREE" | "PAID">("FREE");
  const [priceCents, setPriceCents] = useState(0);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(): Promise<void> {
    const token = window.localStorage.getItem("accessToken");
    if (!token) { window.location.href = "/login"; return; }
    if (!title.trim()) { setSuccess(false); setMessage("제목을 입력해 주세요."); return; }

    setSubmitting(true);
    setMessage("");

    try {
      const metadata: AssetMetadata = {
        version,
        summary,
        description,
        ...(changelog ? { changelog } : {}),
        ...(coverImageUrl ? { media: { coverImageUrl } } : {}),
        ...(type === "THEME" ? { tokens: { editorCss: themeCss } } : {}),
        ...(type === "PLUGIN"
          ? { plugin: { id: slug(title), title, version, description, permissions: ["note:read"], entryFile: "plugin.js", commands: [{ id: "run", title, description: summary }], code } }
          : {}),
        ...(type === "TEMPLATE"
          ? { template: { id: slug(title), title, description: summary, content: templateContent } }
          : {}),
      };

      const asset = await createAsset({ title, type, filePath, pricingType, priceCents: pricingType === "FREE" ? 0 : priceCents, currency: "KRW", metadata }, token);
      await submitAssetForReview(asset.id, token);
      setSuccess(true);
      setMessage(`"${asset.title}" 등록 완료! 관리자 심사 후 게시됩니다.`);
    } catch {
      setSuccess(false);
      setMessage("등록에 실패했습니다. DEVELOPER 또는 ADMIN 권한이 필요합니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl p-6" style={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }}>
      <div className="mb-6">
        <h2 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>에셋 초안 만들기</h2>
        <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>이미지, 설명, 코드 또는 템플릿을 입력하세요.</p>
      </div>

      <div className="grid gap-5">
        {/* 에셋 종류 */}
        <fieldset>
          <legend className="mb-2 text-sm font-bold" style={{ color: "var(--text-secondary)" }}>에셋 종류</legend>
          <div className="grid gap-3 md:grid-cols-3">
            <TypeButton active={type === "THEME"}    icon={<SwatchBook size={17} />} label="테마"     onClick={() => setType("THEME")} />
            <TypeButton active={type === "TEMPLATE"} icon={<FileText size={17} />}   label="템플릿"   onClick={() => setType("TEMPLATE")} />
            <TypeButton active={type === "PLUGIN"}   icon={<Code2 size={17} />}      label="플러그인" onClick={() => setType("PLUGIN")} />
          </div>
        </fieldset>

        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="제목" value={title} onChange={setTitle} placeholder="예: Focus Writing Theme" required />
          <TextField label="버전" value={version} onChange={setVersion} placeholder="1.0.0" />
        </div>

        <TextField label="짧은 소개" value={summary} onChange={setSummary} placeholder="에셋 목록에 보일 한 줄 설명" />

        <AreaField label="상세 설명" value={description} onChange={setDescription} placeholder="에셋의 기능과 사용 방법을 자세히 설명해주세요." rows={5} />
        <AreaField label="변경 내역 (Changelog)" value={changelog} onChange={setChangelog} placeholder={"## v1.0.0\n- 최초 릴리즈"} rows={4} />

        <TextField label="에셋 파일 경로" value={filePath} onChange={setFilePath} placeholder="/assets/custom/asset.json" />

        <ImageUploader value={coverImageUrl} onChange={setCoverImageUrl} folder="assets/covers" label="대표 이미지" />

        {type === "THEME"    && <AreaField label="테마 CSS" value={themeCss} onChange={setThemeCss} mono rows={10} />}
        {type === "PLUGIN"   && <AreaField label="플러그인 코드" value={code} onChange={setCode} mono rows={12} />}
        {type === "TEMPLATE" && <AreaField label="템플릿 본문" value={templateContent} onChange={setTemplateContent} mono rows={12} />}

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
                    type="number"
                    min={0}
                    step={100}
                    className="flex-1 bg-transparent outline-none font-normal"
                    style={{ color: "var(--text-primary)" }}
                    value={priceCents / 100}
                    onChange={e => setPriceCents(Math.round(parseFloat(e.target.value || "0") * 100))}
                    placeholder="0"
                  />
                </div>
              </label>
            </div>
          )}
        </div>

        <button className="button justify-self-start" disabled={submitting} onClick={() => void submit()}>
          <Save size={16} />
          {submitting ? "등록 중…" : "에셋 초안 등록"}
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
  );
}

function TextField({ label, value, onChange, placeholder, icon, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; icon?: JSX.Element; required?: boolean;
}): JSX.Element {
  return (
    <label className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
      {label}{required && <span style={{ color: "#f87171" }}> *</span>}
      <div className="mt-2 flex h-11 items-center gap-2 rounded-xl px-3" style={{ background: "var(--bg-overlay)", border: "1px solid var(--border)" }}>
        {icon && <span style={{ color: "var(--text-muted)" }}>{icon}</span>}
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

function TypeButton({ active, icon, label, onClick }: { active: boolean; icon: JSX.Element; label: string; onClick: () => void }): JSX.Element {
  return (
    <button
      className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition"
      style={active
        ? { background: "rgba(32,197,188,0.15)", border: "1px solid rgba(32,197,188,0.4)", color: "var(--teal)" }
        : { background: "var(--bg-overlay)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
      type="button"
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function slug(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-+|-+$/g, "") || "custom-asset";
}
