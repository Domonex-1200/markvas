import { contextBridge, ipcRenderer } from "electron";
import type {
  FileTreeNode,
  InstalledAsset,
  InstalledPlugin,
  MarkdownDocument,
  NoteTemplate,
  NoteTemplateInput,
  PluginRunInput,
  PluginRunResult,
  TrashEntry
} from "@markdown-canvas/shared";

const api = {
  pickWorkspace: (): Promise<string | null> => ipcRenderer.invoke("workspace:pick"),
  readWorkspaceTree: (workspacePath: string): Promise<FileTreeNode> => ipcRenderer.invoke("workspace:tree", workspacePath),
  readWorkspaceDocuments: (workspacePath: string): Promise<MarkdownDocument[]> => ipcRenderer.invoke("workspace:documents", workspacePath),
  readTemplates: (workspacePath: string): Promise<NoteTemplate[]> => ipcRenderer.invoke("templates:list", workspacePath),
  saveTemplate: (workspacePath: string, input: NoteTemplateInput): Promise<NoteTemplate> => ipcRenderer.invoke("templates:save", workspacePath, input),
  deleteTemplate: (workspacePath: string, templateId: string): Promise<void> => ipcRenderer.invoke("templates:delete", workspacePath, templateId),
  readMarkdown: (filePath: string): Promise<MarkdownDocument> => ipcRenderer.invoke("markdown:read", filePath),
  createMarkdown: (workspacePath: string, title: string, parentPath?: string): Promise<MarkdownDocument> =>
    ipcRenderer.invoke("markdown:create", workspacePath, title, parentPath),
  createMarkdownFromTemplate: (workspacePath: string, title: string, templateId: string, parentPath?: string): Promise<MarkdownDocument> =>
    ipcRenderer.invoke("markdown:create-from-template", workspacePath, title, templateId, parentPath),
  saveMarkdown: (filePath: string, content: string): Promise<MarkdownDocument> =>
    ipcRenderer.invoke("markdown:save", filePath, content),
  createFolder: (workspacePath: string, folderName: string, parentPath?: string): Promise<void> =>
    ipcRenderer.invoke("entry:create-folder", workspacePath, folderName, parentPath),
  renameEntry: (workspacePath: string, entryPath: string, nextName: string): Promise<string> =>
    ipcRenderer.invoke("entry:rename", workspacePath, entryPath, nextName),
  deleteEntry: (workspacePath: string, entryPath: string): Promise<void> => ipcRenderer.invoke("entry:delete", workspacePath, entryPath),
  listTrash: (workspacePath: string): Promise<TrashEntry[]> => ipcRenderer.invoke("trash:list", workspacePath),
  restoreTrash: (workspacePath: string, trashedPath: string): Promise<string> => ipcRenderer.invoke("trash:restore", workspacePath, trashedPath),
  permanentlyDeleteTrash: (workspacePath: string, trashedPath: string): Promise<void> =>
    ipcRenderer.invoke("trash:delete-permanent", workspacePath, trashedPath),
  moveEntry: (workspacePath: string, entryPath: string, targetDirectoryPath: string): Promise<string> =>
    ipcRenderer.invoke("entry:move", workspacePath, entryPath, targetDirectoryPath),
  syncAssets: (accessToken: string): Promise<InstalledAsset[]> => ipcRenderer.invoke("assets:sync", accessToken),
  getLocalThemeCss: (): Promise<string> => ipcRenderer.invoke("assets:theme"),
  readPlugins: (): Promise<InstalledPlugin[]> => ipcRenderer.invoke("plugins:list"),
  runPluginCommand: (input: PluginRunInput): Promise<PluginRunResult> => ipcRenderer.invoke("plugins:run-command", input),
  runPlugin: (code: string, input: unknown): Promise<unknown> => ipcRenderer.invoke("plugin:run", code, input),
  createSampleWorkspace: (workspacePath: string): Promise<void> => ipcRenderer.invoke("workspace:create-sample", workspacePath),
  saveImageToWorkspace: (workspacePath: string, filename: string, data: Uint8Array): Promise<string> =>
    ipcRenderer.invoke("assets:save-image", workspacePath, filename, data),
  // 백업
  autoBackup: (workspacePath: string, filePath: string, content: string): Promise<void> =>
    ipcRenderer.invoke("backup:auto", workspacePath, filePath, content),
  listBackups: (workspacePath: string, filePath: string): Promise<Array<{ backupPath: string; originalPath: string; savedAt: string }>> =>
    ipcRenderer.invoke("backup:list", workspacePath, filePath),
  readBackup: (backupPath: string): Promise<string> =>
    ipcRenderer.invoke("backup:read", backupPath),
  createBackupNow: (workspacePath: string, filePath: string, content: string): Promise<void> =>
    ipcRenderer.invoke("backup:create-now", workspacePath, filePath, content),
  // PDF
  showPdfSaveDialog: (defaultFilename: string): Promise<string | null> =>
    ipcRenderer.invoke("export:pdf-dialog", defaultFilename),
  printToPdf: (htmlContent: string, outputPath: string): Promise<string> =>
    ipcRenderer.invoke("export:print-to-pdf", htmlContent, outputPath),
  // 영구 설정 저장소 (userData/app-store.json)
  storeGetAll: (): Promise<Record<string, unknown>> => ipcRenderer.invoke("store:get-all"),
  storeSet: (key: string, value: unknown): Promise<void> => ipcRenderer.invoke("store:set", key, value),
  storeDelete: (key: string): Promise<void> => ipcRenderer.invoke("store:delete", key),
  // PPTX
  showPptxSaveDialog: (defaultFilename: string): Promise<string | null> =>
    ipcRenderer.invoke("export:pptx-dialog", defaultFilename),
  saveFile: (outputPath: string, data: Uint8Array): Promise<string> =>
    ipcRenderer.invoke("export:save-file", outputPath, data)
};

contextBridge.exposeInMainWorld("markdownCanvas", api);

declare global {
  interface Window {
    markdownCanvas: typeof api;
  }
}
