
import { useState } from "react";
import type { AssetMetadata, AssetType } from "../types";
import { Code2, FileText, Save, SwatchBook } from "lucide-react";
import { createAsset, submitAssetForReview } from "../lib/api";
import { ImageUploader } from "./ImageUploader";

const DEFAULT_PLUGIN_CODE = "return function(input) { return `현재 명령: ${input.commandId}`; };";
const DEFAULT_THEME_CSS = ".prose-canvas h1 { color: #2563eb; }";

export function AssetCreateForm(): JSX.Element {
  const [type, setType] = useState<AssetType>("THEME");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [filePath, setFilePath] = useState("/assets/custom/asset.json");
  const [themeCss, setThemeCss] = useState(DEFAULT_THEME_CSS);
  const [code, setCode] = useState(DEFAULT_PLUGIN_CODE);
  const [templateContent, setTemplateContent] = useState("# {{title}}\n\n");
  const [message, setMessage] = useState("");

  async function submit(): Promise<void> {
    const token = window.localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const metadata: AssetMetadata = {
        version,
        summary,
        description,
        ...(coverImageUrl ? { media: { coverImageUrl } } : {}),
        ...(type === "THEME"
          ? {
              tokens: {
                editorCss: themeCss
              }
            }
          : {}),
        ...(type === "PLUGIN"
          ? {
              plugin: {
                id: slug(title),
                title,
                version,
                description,
                permissions: ["note:read"],
                entryFile: "plugin.js",
                commands: [{ id: "run", title, description: summary }],
                code
              }
            }
          : {}),
        ...(type === "TEMPLATE"
          ? {
              template: {
                id: slug(title),
                title,
                description: summary,
                content: templateContent
              }
            }
          : {})
      };

      const asset = await createAsset(
        {
          title,
          type,
          filePath,
          pricingType: "FREE",
          priceCents: 0,
          currency: "USD",
          metadata
        },
        token
      );
      await submitAssetForReview(asset.id, token);
      setMessage(`${asset.title} 초안을 등록하고 심사를 요청했습니다.`);
    } catch {
      setMessage("등록에 실패했습니다. DEVELOPER 또는 ADMIN 권한이 필요합니다.");
    }
  }

  return (
    <section className="surface-card p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-950">에셋 초안 만들기</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">이미지, 설명, 코드 또는 템플릿을 입력하세요.</p>
      </div>

      <div className="grid gap-5">
        <fieldset>
          <legend className="mb-2 text-sm font-bold">에셋 종류</legend>
          <div className="grid gap-3 md:grid-cols-3">
            <TypeButton active={type === "THEME"} icon={<SwatchBook size={17} />} label="테마" onClick={() => setType("THEME")} />
            <TypeButton active={type === "TEMPLATE"} icon={<FileText size={17} />} label="템플릿" onClick={() => setType("TEMPLATE")} />
            <TypeButton active={type === "PLUGIN"} icon={<Code2 size={17} />} label="플러그인" onClick={() => setType("PLUGIN")} />
          </div>
        </fieldset>

        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="제목" value={title} onChange={setTitle} placeholder="예: Focus Writing Theme" />
          <TextField label="버전" value={version} onChange={setVersion} placeholder="1.0.0" />
        </div>

        <TextField label="짧은 소개" value={summary} onChange={setSummary} placeholder="에셋 목록에 보일 한 줄 설명" />

        <label className="text-sm font-bold">
          상세 설명
          <textarea className="mt-2 h-28 w-full rounded-md border border-slate-200 p-3 font-normal outline-none focus:border-blue-500" value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>

        <TextField label="에셋 파일 경로" value={filePath} onChange={setFilePath} placeholder="/assets/custom/asset.json" />

        <ImageUploader
          value={coverImageUrl}
          onChange={setCoverImageUrl}
          folder="assets/covers"
          label="대표 이미지"
        />

        {type === "THEME" && (
          <label className="text-sm font-bold">
            테마 CSS
            <textarea className="mt-2 h-48 w-full rounded-md border border-slate-200 p-3 font-mono text-sm font-normal outline-none focus:border-blue-500" value={themeCss} onChange={(event) => setThemeCss(event.target.value)} />
          </label>
        )}

        {type === "PLUGIN" && (
          <label className="text-sm font-bold">
            플러그인 코드
            <textarea className="mt-2 h-56 w-full rounded-md border border-slate-200 p-3 font-mono text-sm font-normal outline-none focus:border-blue-500" value={code} onChange={(event) => setCode(event.target.value)} />
          </label>
        )}

        {type === "TEMPLATE" && (
          <label className="text-sm font-bold">
            템플릿 본문
            <textarea className="mt-2 h-56 w-full rounded-md border border-slate-200 p-3 font-mono text-sm font-normal outline-none focus:border-blue-500" value={templateContent} onChange={(event) => setTemplateContent(event.target.value)} />
          </label>
        )}

        <button className="button justify-self-start" onClick={() => void submit()}>
          <Save size={16} />
          에셋 초안 등록
        </button>
        {message && <p className="rounded-md bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">{message}</p>}
      </div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  icon
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: JSX.Element;
}): JSX.Element {
  return (
    <label className="text-sm font-bold">
      {label}
      <div className="mt-2 flex h-11 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 focus-within:border-blue-500">
        {icon && <span className="text-slate-400">{icon}</span>}
        <input className="min-w-0 flex-1 font-normal outline-none" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      </div>
    </label>
  );
}

function TypeButton({ active, icon, label, onClick }: { active: boolean; icon: JSX.Element; label: string; onClick: () => void }): JSX.Element {
  return (
    <button
      className={`flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-bold transition ${
        active ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:bg-blue-50"
      }`}
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