import { app, BrowserWindow, dialog, ipcMain, net, protocol, shell } from "electron";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { NoteTemplateInput, PluginRunInput } from "@markdown-canvas/shared";
import { is } from "@electron-toolkit/utils";
import {
  buildWorkspaceTree,
  createFolder,
  createMarkdown,
  deleteEntry,
  listTrashEntries,
  moveEntry,
  pickWorkspace,
  readMarkdown,
  readWorkspaceMarkdownDocuments,
  renameEntry,
  permanentlyDeleteTrashEntry,
  restoreTrashEntry,
  saveMarkdown,
  saveImageFile,
  createFileBackup,
  listFileBackups,
  readBackupContent,
  type BackupEntry
} from "./file-system";

// mc-asset:// 커스텀 프로토콜 등록 (app.ready 전에 호출해야 함)
protocol.registerSchemesAsPrivileged([
  { scheme: "mc-asset", privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } }
]);
import { installAssetsFromStore, listLocalInstalledAssets, readCurrentThemeCss, uninstallLocalAsset } from "./asset-sync";
import { loginWithCredentials, fetchMe, refreshAccessToken, toStoreAuthState, type StoreAuthState } from "./auth";
import { readInstalledPlugins, runInstalledPluginCommand } from "./plugin-registry";
import { runPluginInSandbox } from "./plugin-security";
import { createMarkdownFromTemplate, deleteWorkspaceTemplate, readWorkspaceTemplates, saveWorkspaceTemplate } from "./templates";
import { createSampleWorkspace } from "./samples";
import { initStore, storeGetAll, storeSet, storeDelete } from "./store";

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 980,
    minHeight: 640,
    title: "MarkVas",
    backgroundColor: "#f8f7f3",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(async () => {
  // 앱 설정 저장소 초기화 (userData/app-store.json)
  await initStore();

  // electron-store IPC
  ipcMain.handle("store:get-all", () => storeGetAll());
  ipcMain.handle("store:set", (_event, key: string, value: unknown) => storeSet(key, value));
  ipcMain.handle("store:delete", (_event, key: string) => storeDelete(key));

  // ── 인증 IPC ──
  ipcMain.handle("auth:login", async (_event, email: string, password: string) => {
    const result = await loginWithCredentials(email, password);
    const authState = toStoreAuthState(result);
    await storeSet("auth", authState);
    return authState;
  });

  ipcMain.handle("auth:logout", async () => {
    await storeDelete("auth");
  });

  ipcMain.handle("auth:get", async () => {
    const stored = storeGetAll()["auth"] as StoreAuthState | undefined;
    if (!stored?.accessToken) return null;
    try {
      const user = await fetchMe(stored.accessToken);
      const next: StoreAuthState = { ...stored, user };
      await storeSet("auth", next);
      return next;
    } catch {
      // 액세스 토큰 만료 시 리프레시 시도
      try {
        const tokens = await refreshAccessToken(stored.refreshToken);
        const user = await fetchMe(tokens.accessToken);
        const next: StoreAuthState = { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user };
        await storeSet("auth", next);
        return next;
      } catch {
        await storeDelete("auth");
        return null;
      }
    }
  });

  // 로컬 이미지를 mc-asset:// 프로토콜로 안전하게 서빙
  protocol.handle("mc-asset", (request) => {
    const encodedPath = request.url.slice("mc-asset://".length);
    const filePath = decodeURIComponent(encodedPath).replace(/\//g, "\\");
    const fileUrl = "file:///" + filePath.replace(/\\/g, "/").replace(/^\//, "");
    return net.fetch(fileUrl);
  });
  ipcMain.handle("workspace:pick", () => pickWorkspace());
  ipcMain.handle("workspace:tree", (_event, workspacePath: string) => buildWorkspaceTree(workspacePath));
  ipcMain.handle("workspace:documents", (_event, workspacePath: string) => readWorkspaceMarkdownDocuments(workspacePath));
  ipcMain.handle("templates:list", (_event, workspacePath: string) => readWorkspaceTemplates(workspacePath));
  ipcMain.handle("templates:save", (_event, workspacePath: string, input: NoteTemplateInput) => saveWorkspaceTemplate(workspacePath, input));
  ipcMain.handle("templates:delete", (_event, workspacePath: string, templateId: string) => deleteWorkspaceTemplate(workspacePath, templateId));
  ipcMain.handle("markdown:read", (_event, filePath: string) => readMarkdown(filePath));
  ipcMain.handle("markdown:save", (_event, filePath: string, content: string) => saveMarkdown(filePath, content));
  ipcMain.handle("markdown:create", (_event, workspacePath: string, title: string, parentPath?: string) =>
    createMarkdown(workspacePath, title, parentPath)
  );
  ipcMain.handle("markdown:create-from-template", (_event, workspacePath: string, title: string, templateId: string, parentPath?: string) =>
    createMarkdownFromTemplate(workspacePath, title, templateId, parentPath)
  );
  ipcMain.handle("entry:create-folder", (_event, workspacePath: string, folderName: string, parentPath?: string) =>
    createFolder(workspacePath, folderName, parentPath)
  );
  ipcMain.handle("entry:rename", (_event, workspacePath: string, entryPath: string, nextName: string) =>
    renameEntry(workspacePath, entryPath, nextName)
  );
  ipcMain.handle("entry:delete", (_event, workspacePath: string, entryPath: string) => deleteEntry(workspacePath, entryPath));
  ipcMain.handle("trash:list", (_event, workspacePath: string) => listTrashEntries(workspacePath));
  ipcMain.handle("trash:restore", (_event, workspacePath: string, trashedPath: string) => restoreTrashEntry(workspacePath, trashedPath));
  ipcMain.handle("trash:delete-permanent", (_event, workspacePath: string, trashedPath: string) =>
    permanentlyDeleteTrashEntry(workspacePath, trashedPath)
  );
  ipcMain.handle("entry:move", (_event, workspacePath: string, entryPath: string, targetDirectoryPath: string) =>
    moveEntry(workspacePath, entryPath, targetDirectoryPath)
  );
  ipcMain.handle("assets:sync", (_event, accessToken: string) => installAssetsFromStore(accessToken));
  ipcMain.handle("assets:theme", () => readCurrentThemeCss());
  ipcMain.handle("assets:uninstall-local", (_event, assetId: string) => uninstallLocalAsset(assetId));
  ipcMain.handle("assets:remove-from-library", async (_event, assetId: string, accessToken: string) => {
    const response = await fetch(`${API_BASE_URL}/assets/${assetId}/library`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!response.ok && response.status !== 404) throw new Error(`라이브러리 제거 실패 (${response.status})`);
  });
  ipcMain.handle("assets:uninstall-remote", async (_event, assetId: string, accessToken: string) => {
    const { API_BASE_URL } = await import("./auth");
    const response = await fetch(`${API_BASE_URL}/assets/${assetId}/install`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!response.ok) throw new Error(`설치 취소 실패 (${response.status})`);
  });
  ipcMain.handle("plugins:list", () => readInstalledPlugins());
  ipcMain.handle("assets:list-local", () => listLocalInstalledAssets());
  ipcMain.handle("plugins:run-command", (_event, input: PluginRunInput) => runInstalledPluginCommand(input));
  ipcMain.handle("plugin:run", (_event, code: string, input: unknown) => runPluginInSandbox(code, input));
  ipcMain.handle("workspace:create-sample", (_event, workspacePath: string) => createSampleWorkspace(workspacePath));
  ipcMain.handle("assets:save-image", (_event, workspacePath: string, filename: string, data: Uint8Array) =>
    saveImageFile(workspacePath, filename, data)
  );

  // ── 백업 ──
  // saveMarkdown 래핑: 저장 시 레이트-리밋 기반 자동 백업
  const lastBackupTime = new Map<string, number>();
  const BACKUP_INTERVAL_MS = 5 * 60 * 1000; // 5분

  ipcMain.handle("backup:auto", async (_event, workspacePath: string, filePath: string, content: string) => {
    const now = Date.now();
    const last = lastBackupTime.get(filePath) ?? 0;
    if (now - last >= BACKUP_INTERVAL_MS) {
      lastBackupTime.set(filePath, now);
      await createFileBackup(workspacePath, filePath, content);
    }
  });
  ipcMain.handle("backup:list", (_event, workspacePath: string, filePath: string) =>
    listFileBackups(workspacePath, filePath)
  );
  ipcMain.handle("backup:read", (_event, backupPath: string) => readBackupContent(backupPath));
  ipcMain.handle("backup:create-now", (_event, workspacePath: string, filePath: string, content: string) =>
    createFileBackup(workspacePath, filePath, content)
  );

  // ── PDF 내보내기 ──
  ipcMain.handle("export:pptx-dialog", async (_event, defaultFilename: string) => {
    const result = await dialog.showSaveDialog({
      title: "PPTX로 저장",
      defaultPath: defaultFilename,
      filters: [{ name: "PowerPoint 파일", extensions: ["pptx"] }],
    });
    return result.canceled ? null : result.filePath;
  });
  ipcMain.handle("export:save-file", async (_event, outputPath: string, data: Uint8Array) => {
    await writeFile(outputPath, data);
    return outputPath;
  });

  ipcMain.handle("export:pdf-dialog", async (_event, defaultFilename: string) => {
    const result = await dialog.showSaveDialog({
      title: "PDF로 저장",
      defaultPath: defaultFilename,
      filters: [{ name: "PDF 파일", extensions: ["pdf"] }],
    });
    return result.canceled ? null : result.filePath;
  });

  ipcMain.handle("export:print-to-pdf", async (_event, htmlContent: string, outputPath: string) => {
    const os = await import("node:os");
    const tmpHtml = path.join(os.tmpdir(), `markvas-pdf-${Date.now()}.html`);
    await writeFile(tmpHtml, htmlContent, "utf8");

    const pdfWin = new BrowserWindow({
      width: 900,
      height: 1200,
      show: false,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    try {
      await pdfWin.loadURL("file:///" + tmpHtml.replace(/\\/g, "/"));
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));

      const pdfBuffer = await pdfWin.webContents.printToPDF({
        printBackground: true,
        pageSize: "A4",
        marginType: "printableArea",
      });

      await writeFile(outputPath, pdfBuffer);
      return outputPath;
    } finally {
      pdfWin.destroy();
      await import("node:fs/promises").then((fs) => fs.rm(tmpHtml, { force: true })).catch(() => {});
    }
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
