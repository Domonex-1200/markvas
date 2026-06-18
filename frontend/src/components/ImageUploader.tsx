import { useRef, useState } from "react";
import { ImagePlus, Loader2, UserRound, X } from "lucide-react";
import { presignUpload, uploadFileToS3 } from "../lib/api";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  shape?: "rect" | "circle";
  maxMb?: number;
}

export function ImageUploader({
  value,
  onChange,
  folder = "uploads",
  label = "이미지",
  shape = "rect",
  maxMb = 5,
}: Props): JSX.Element {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File): Promise<void> {
    if (!file.type.startsWith("image/")) { setError("이미지 파일만 업로드 가능합니다."); return; }
    if (file.size > maxMb * 1024 * 1024) { setError(`${maxMb}MB 이하 파일만 업로드 가능합니다.`); return; }

    const token = window.localStorage.getItem("accessToken") ?? "";
    setUploading(true);
    setError("");
    try {
      const { uploadUrl, publicUrl } = await presignUpload(folder, file.name, file.type, token);
      await uploadFileToS3(uploadUrl, file);
      onChange(publicUrl);
    } catch {
      setError("업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  }

  const isCircle = shape === "circle";

  return (
    <div>
      <span className="mb-1.5 block text-sm font-bold">{label}</span>
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative inline-block shrink-0">
            <img
              src={value}
              alt="preview"
              className={`object-cover border border-slate-200 ${isCircle ? "h-20 w-20 rounded-full" : "h-32 w-auto rounded-md"}`}
            />
            <button
              type="button"
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
              onClick={() => onChange("")}
            >
              <X size={11} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={uploading}
            className={`flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500 disabled:opacity-50 ${
              isCircle ? "h-20 w-20 shrink-0 rounded-full flex-col gap-1" : "h-32 w-full rounded-md"
            }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) void handleFile(f); }}
          >
            {uploading
              ? <Loader2 size={18} className="animate-spin" />
              : isCircle ? <UserRound size={20} /> : <ImagePlus size={18} />
            }
            {!isCircle && (uploading ? "업로드 중…" : "클릭 또는 드래그")}
          </button>
        )}
        <div className="text-xs text-slate-400 leading-5">
          {uploading
            ? <p className="text-blue-500 font-semibold">업로드 중…</p>
            : (
              <>
                <p>JPG, PNG, GIF, WebP 지원</p>
                <p>최대 {maxMb}MB</p>
                {!value && <p className="mt-1 text-slate-300">클릭하거나 드래그해서 업로드</p>}
              </>
            )
          }
          {error && <p className="text-red-500 font-semibold">{error}</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
      />
    </div>
  );
}
