import { useState } from "react";
import { Settings2, X } from "lucide-react";
import { storageGet, storageSet } from "../lib/storage";

export type EditorViewModeSetting = "edit" | "split" | "preview";

export type DarkModeSetting = "system" | "light" | "dark";

export interface WorkspaceSettings {
  defaultViewMode: EditorViewModeSetting;
  autoSaveDelayMs: number;
  showNoteInfoPanel: boolean;
  previewWidthPercent: number;
  darkMode: DarkModeSetting;
  wysiwygMode: boolean;
}

export const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettings = {
  defaultViewMode: "split",
  autoSaveDelayMs: 500,
  showNoteInfoPanel: true,
  previewWidthPercent: 50,
  darkMode: "system",
  wysiwygMode: false
};

const SETTINGS_STORAGE_KEY = "markdown-canvas:workspace-settings";

export function loadWorkspaceSettings(): WorkspaceSettings {
  try {
    const raw = storageGet(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_WORKSPACE_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<WorkspaceSettings>;
    return {
      defaultViewMode: isViewMode(parsed.defaultViewMode) ? parsed.defaultViewMode : DEFAULT_WORKSPACE_SETTINGS.defaultViewMode,
      autoSaveDelayMs: typeof parsed.autoSaveDelayMs === "number" ? parsed.autoSaveDelayMs : DEFAULT_WORKSPACE_SETTINGS.autoSaveDelayMs,
      showNoteInfoPanel: typeof parsed.showNoteInfoPanel === "boolean" ? parsed.showNoteInfoPanel : DEFAULT_WORKSPACE_SETTINGS.showNoteInfoPanel,
      previewWidthPercent: typeof parsed.previewWidthPercent === "number" ? parsed.previewWidthPercent : DEFAULT_WORKSPACE_SETTINGS.previewWidthPercent,
      darkMode: isDarkModeSetting(parsed.darkMode) ? parsed.darkMode : DEFAULT_WORKSPACE_SETTINGS.darkMode,
      wysiwygMode: typeof parsed.wysiwygMode === "boolean" ? parsed.wysiwygMode : DEFAULT_WORKSPACE_SETTINGS.wysiwygMode
    };
  } catch {
    return DEFAULT_WORKSPACE_SETTINGS;
  }
}

export function persistWorkspaceSettings(settings: WorkspaceSettings): void {
  storageSet(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

function isViewMode(value: unknown): value is EditorViewModeSetting {
  return value === "edit" || value === "split" || value === "preview";
}

function isDarkModeSetting(value: unknown): value is DarkModeSetting {
  return value === "system" || value === "light" || value === "dark";
}

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  settings: WorkspaceSettings;
  onClose: () => void;
  onSave: (settings: WorkspaceSettings) => void;
}

export function WorkspaceSettingsModal({ isOpen, settings, onClose, onSave }: WorkspaceSettingsModalProps): JSX.Element | null {
  const [draft, setDraft] = useState<WorkspaceSettings>(settings);

  if (!isOpen) return null;

  function handleSave(): void {
    onSave(draft);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 px-4">
      <div className="w-full max-w-md rounded border border-line bg-white p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <Settings2 size={18} />
          <h2 className="flex-1 text-base font-bold">워크스페이스 설정</h2>
          <button className="icon-button" title="닫기" type="button" onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <label className="block">
            <span className="text-sm font-semibold">기본 편집기 모드</span>
            <p className="mt-1 text-xs text-slate-500">앱 시작 시 적용되는 기본 보기 모드입니다.</p>
            <select
              className="mt-2 h-10 w-full rounded border border-line bg-white px-3 text-sm outline-none focus:border-accent"
              value={draft.defaultViewMode}
              onChange={(e) => setDraft({ ...draft, defaultViewMode: e.target.value as EditorViewModeSetting })}
            >
              <option value="split">분할 보기 (편집 + 미리보기)</option>
              <option value="edit">편집만</option>
              <option value="preview">미리보기만</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold">자동 저장 지연</span>
            <p className="mt-1 text-xs text-slate-500">입력 후 저장까지의 대기 시간입니다.</p>
            <select
              className="mt-2 h-10 w-full rounded border border-line bg-white px-3 text-sm outline-none focus:border-accent"
              value={draft.autoSaveDelayMs}
              onChange={(e) => setDraft({ ...draft, autoSaveDelayMs: parseInt(e.target.value, 10) })}
            >
              <option value={300}>300ms</option>
              <option value={500}>500ms (기본값)</option>
              <option value={1000}>1초</option>
              <option value={2000}>2초</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold">테마</span>
            <p className="mt-1 text-xs text-slate-500">앱 전체의 색상 테마를 선택합니다.</p>
            <div className="mt-2 flex gap-2">
              {(["system", "light", "dark"] as DarkModeSetting[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`flex-1 rounded border py-2 text-xs font-semibold transition ${
                    draft.darkMode === mode
                      ? "border-accent bg-teal-50 text-accent"
                      : "border-line bg-white text-slate-600 hover:border-accent"
                  }`}
                  onClick={() => setDraft({ ...draft, darkMode: mode })}
                >
                  {mode === "system" ? "🖥️ 시스템" : mode === "light" ? "☀️ 라이트" : "🌙 다크"}
                </button>
              ))}
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              className="h-4 w-4 accent-teal-600"
              checked={draft.wysiwygMode}
              onChange={(e) => setDraft({ ...draft, wysiwygMode: e.target.checked })}
            />
            <div>
              <span className="text-sm font-semibold">WYSIWYG 에디터 (Milkdown)</span>
              <p className="mt-0.5 text-xs text-slate-500">리치텍스트 편집기 사용 — 마크다운 문법 없이 서식 적용</p>
            </div>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              className="h-4 w-4 accent-teal-600"
              checked={draft.showNoteInfoPanel}
              onChange={(e) => setDraft({ ...draft, showNoteInfoPanel: e.target.checked })}
            />
            <span className="text-sm font-semibold">오른쪽 노트 정보 패널 표시</span>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="button-secondary" onClick={onClose}>
            취소
          </button>
          <button type="button" className="button" onClick={handleSave}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
