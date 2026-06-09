import { useEffect, useState } from "react";
import { Clock, Download, Eye, History, X } from "lucide-react";

export interface BackupEntry {
  backupPath: string;
  originalPath: string;
  savedAt: string;
}

interface BackupRestoreModalProps {
  isOpen: boolean;
  workspacePath: string | null;
  filePath: string | null;
  currentContent: string;
  onClose: () => void;
  onRestore: (content: string) => void;
}

export function BackupRestoreModal({
  isOpen,
  workspacePath,
  filePath,
  currentContent,
  onClose,
  onRestore,
}: BackupRestoreModalProps): JSX.Element | null {
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewEntry, setPreviewEntry] = useState<BackupEntry | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !workspacePath || !filePath) return;
    setLoading(true);
    setError("");
    setPreviewContent(null);
    setPreviewEntry(null);

    window.markdownCanvas
      .listBackups(workspacePath, filePath)
      .then((list) => setBackups(list))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "백업 목록 로드 실패"))
      .finally(() => setLoading(false));
  }, [isOpen, workspacePath, filePath]);

  if (!isOpen) return null;

  async function handlePreview(entry: BackupEntry): Promise<void> {
    try {
      const content = await window.markdownCanvas.readBackup(entry.backupPath);
      setPreviewContent(content);
      setPreviewEntry(entry);
    } catch (e) {
      setError(e instanceof Error ? e.message : "백업 읽기 실패");
    }
  }

  function handleRestore(): void {
    if (!previewContent) return;
    onRestore(previewContent);
    onClose();
  }

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return iso;
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/25 px-5 py-8">
      <section className="backup-modal mx-auto flex h-full max-w-4xl flex-col overflow-hidden rounded border border-line shadow-xl">
        <header className="backup-modal-header flex h-14 items-center gap-3 border-b border-line px-4">
          <History size={18} />
          <h2 className="flex-1 text-sm font-bold">백업 이력</h2>
          <span className="text-xs text-slate-500">{filePath?.split(/[\\/]/).at(-1)}</span>
          {previewContent && (
            <button
              className="backup-restore-button flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-semibold"
              type="button"
              onClick={handleRestore}
            >
              <Download size={13} />
              이 버전으로 복원
            </button>
          )}
          <button className="icon-button" title="닫기" type="button" onClick={onClose}>
            <X size={17} />
          </button>
        </header>

        {error && <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">{error}</div>}

        <div className="flex min-h-0 flex-1">
          {/* 백업 목록 */}
          <aside className="backup-version-sidebar flex w-56 shrink-0 flex-col border-r border-line">
            <div className="backup-version-count border-b border-line px-4 py-2 text-xs font-semibold">
              {loading ? "로딩 중…" : `${backups.length}개 버전`}
            </div>
            <ul className="min-h-0 flex-1 overflow-auto">
              {backups.length === 0 && !loading && (
                <li className="p-4 text-sm text-slate-500">
                  <Clock className="mx-auto mb-2" size={24} />
                  <p className="text-center">백업 없음</p>
                  <p className="mt-1 text-center text-xs">5분마다 자동 생성됩니다.</p>
                </li>
              )}
              {backups.map((entry) => {
                const isSelected = previewEntry?.backupPath === entry.backupPath;
                return (
                  <li key={entry.backupPath}>
                    <button
                      className={`backup-version-button flex w-full flex-col gap-0.5 border-b border-line px-4 py-2.5 text-left text-xs last:border-b-0 ${
                        isSelected ? "is-selected" : ""
                      }`}
                      type="button"
                      onClick={() => void handlePreview(entry)}
                    >
                      <span className="font-semibold">{formatDate(entry.savedAt)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* 미리보기 */}
          <div className="backup-preview-pane min-h-0 flex-1 overflow-auto">
            {previewContent === null ? (
              <div className="grid h-full place-items-center text-center text-sm text-slate-500">
                <div>
                  <Eye className="mx-auto mb-3 text-slate-300" size={36} />
                  왼쪽에서 버전을 선택하면
                  <br />
                  내용을 미리볼 수 있습니다.
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    {previewEntry ? formatDate(previewEntry.savedAt) : ""} 버전
                  </span>
                  <span className="text-xs text-slate-400">
                    {previewContent.split("\n").length}줄 / {previewContent.length}자
                  </span>
                </div>
                <pre className="backup-preview-content whitespace-pre-wrap rounded border p-4 font-mono text-xs leading-6">
                  {previewContent}
                </pre>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
