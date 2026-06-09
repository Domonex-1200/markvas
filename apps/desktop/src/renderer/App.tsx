import { useEffect, useMemo, useState } from "react";
import type { FileTreeNode, InstalledPlugin, MarkdownDocument, NoteTemplate, NoteTemplateInput, TrashEntry } from "@markdown-canvas/shared";
import { FolderOpen, RefreshCcw, X } from "lucide-react";
import { CommandPalette, type CommandPaletteItem } from "./components/CommandPalette";
import { FileTree } from "./components/FileTree";
import { MarkdownEditor } from "./components/MarkdownEditor";
import { NoteInfoPanel } from "./components/NoteInfoPanel";
import { PluginManagerModal } from "./components/PluginManagerModal";
import { QuickAccessPanel } from "./components/QuickAccessPanel";
import { TemplateManagerModal } from "./components/TemplateManagerModal";
import { Toolbar } from "./components/Toolbar";
import { TrashModal } from "./components/TrashModal";
import { WorkspaceSearchPanel } from "./components/WorkspaceSearchPanel";
import { TagManagerModal } from "./components/TagManagerModal";
import { BackupRestoreModal } from "./components/BackupRestoreModal";
import { GraphViewModal } from "./components/GraphViewModal";
import { renameTagInContent, removeTagFromContent } from "./lib/tag-utils";
import { storageGet, storageSet, storageDelete, syncFromElectronStore } from "./lib/storage";
import {
  DEFAULT_WORKSPACE_SETTINGS,
  WorkspaceSettingsModal,
  loadWorkspaceSettings,
  persistWorkspaceSettings,
  type WorkspaceSettings
} from "./components/WorkspaceSettingsModal";
import { exportToPdfElectron } from "./lib/exporters";
import { analyzeNote } from "./lib/note-analysis";
import { buildWorkspaceIndex, searchWorkspace, type IndexedNote, type WorkspaceIndex } from "./lib/workspace-index";

type DialogState =
  | { kind: "none" }
  | { kind: "new-note"; value: string; templateId: string; parentPath?: string }
  | { kind: "new-folder"; value: string; parentPath?: string }
  | { kind: "rename"; value: string; node: FileTreeNode }
  | { kind: "delete"; node: FileTreeNode }
  | { kind: "delete-multiple"; nodes: FileTreeNode[] }
  | { kind: "sync-assets"; value: string };

type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

interface WorkspaceNavigationState {
  pinnedPaths: string[];
  recentPaths: string[];
}

const EMPTY_NAVIGATION_STATE: WorkspaceNavigationState = { pinnedPaths: [], recentPaths: [] };
const MAX_RECENT_NOTES = 12;
const MAX_OPEN_TABS = 8;
const MIN_LEFT_SIDEBAR_WIDTH = 240;
const MAX_LEFT_SIDEBAR_WIDTH = 520;
const MIN_RIGHT_SIDEBAR_WIDTH = 220;
const MAX_RIGHT_SIDEBAR_WIDTH = 460;
const LEFT_SIDEBAR_WIDTH_STORAGE_KEY = "markdown-canvas:ui:left-sidebar-width";
const RIGHT_SIDEBAR_WIDTH_STORAGE_KEY = "markdown-canvas:ui:right-sidebar-width";

type ResizingSidebar = "left" | "right" | null;

export default function App(): JSX.Element {
  const [workspacePath, setWorkspacePath] = useState<string | null>(null);
  const [tree, setTree] = useState<FileTreeNode | null>(null);
  const [document, setDocument] = useState<MarkdownDocument | null>(null);
  const [themeCss, setThemeCss] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [dialog, setDialog] = useState<DialogState>({ kind: "none" });
  const [workspaceIndex, setWorkspaceIndex] = useState<WorkspaceIndex | null>(null);
  const [templates, setTemplates] = useState<NoteTemplate[]>([]);
  const [plugins, setPlugins] = useState<InstalledPlugin[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [isPluginManagerOpen, setIsPluginManagerOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [trashEntries, setTrashEntries] = useState<TrashEntry[]>([]);
  const [isTrashLoading, setIsTrashLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isGraphOpen, setIsGraphOpen] = useState(false);

  const [workspaceSettings, setWorkspaceSettings] = useState<WorkspaceSettings>(() => loadWorkspaceSettings());
  const [navigationState, setNavigationState] = useState<WorkspaceNavigationState>(EMPTY_NAVIGATION_STATE);
  const [isPinnedCollapsed, setIsPinnedCollapsed] = useState(false);
  const [isRecentCollapsed, setIsRecentCollapsed] = useState(false);
  const [openDocumentPaths, setOpenDocumentPaths] = useState<string[]>([]);
  const [commandPaletteQuery, setCommandPaletteQuery] = useState("");
  const [commandPaletteIndex, setCommandPaletteIndex] = useState(0);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(() =>
    readStoredWidth(LEFT_SIDEBAR_WIDTH_STORAGE_KEY, 320, MIN_LEFT_SIDEBAR_WIDTH, MAX_LEFT_SIDEBAR_WIDTH)
  );
  const [rightSidebarWidth, setRightSidebarWidth] = useState(() =>
    readStoredWidth(RIGHT_SIDEBAR_WIDTH_STORAGE_KEY, 288, MIN_RIGHT_SIDEBAR_WIDTH, MAX_RIGHT_SIDEBAR_WIDTH)
  );
  const [resizingSidebar, setResizingSidebar] = useState<ResizingSidebar>(null);

  const title = useMemo(() => document?.path.split(/[\\/]/).at(-1) ?? "문서를 선택하세요", [document]);
  const noteAnalysis = useMemo(() => analyzeNote(document), [document]);
  const searchResults = useMemo(() => searchWorkspace(workspaceIndex, searchQuery, selectedTag), [workspaceIndex, searchQuery, selectedTag]);
  const backlinks = useMemo(() => (document && workspaceIndex ? workspaceIndex.backlinks[document.path] ?? [] : []), [document, workspaceIndex]);
  const pinnedNotes = useMemo(() => resolveNavigationNotes(workspaceIndex, navigationState.pinnedPaths), [navigationState.pinnedPaths, workspaceIndex]);
  const recentNotes = useMemo(() => resolveNavigationNotes(workspaceIndex, navigationState.recentPaths), [navigationState.recentPaths, workspaceIndex]);
  const openDocumentTabs = useMemo(() => resolveNavigationNotes(workspaceIndex, openDocumentPaths), [openDocumentPaths, workspaceIndex]);
  const isCurrentDocumentPinned = Boolean(document && navigationState.pinnedPaths.includes(document.path));
  const commandPaletteItems = useMemo(
    () =>
      buildCommandPaletteItems({
        query: commandPaletteQuery,
        workspacePath,
        document,
        isCurrentDocumentPinned,
        workspaceIndex,
        templates,
        plugins,
        selectWorkspace,
        openFileByPath,
        createNote,
        createQuickNote,
        createFolder,
        refreshTree,
        exportCurrentDocumentPdf,
        openTemplateManager,
        openPluginManager,
        openTrash,
        toggleCurrentDocumentPin,
        syncAssets,
        openSettings: () => setIsSettingsOpen(true),
        openTagManager: () => setIsTagManagerOpen(true),
        openBackup: () => setIsBackupOpen(true),
        runPluginCommand,
        openNewNoteFromTemplate,
        closePalette: closeCommandPalette
      }),
    [commandPaletteQuery, document, plugins, templates, workspaceIndex, workspacePath, navigationState]
  );

  // ── 다크 모드 적용 ──
  useEffect(() => {
    function applyDark(dark: boolean): void {
      window.document.documentElement.classList.toggle("dark", dark);
    }

    const { darkMode } = workspaceSettings;
    if (darkMode === "dark") { applyDark(true); return; }
    if (darkMode === "light") { applyDark(false); return; }

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    applyDark(mq.matches);
    const listener = (e: MediaQueryListEvent) => applyDark(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [workspaceSettings.darkMode]);

  // ── electron-store → localStorage 초기 동기화 ──
  useEffect(() => {
    void syncFromElectronStore();
  }, []);

  useEffect(() => {
    window.markdownCanvas
      ?.getLocalThemeCss()
      .then((css) => {
        if (css) {
          setThemeCss(css);
          setNotice("설치된 로컬 테마를 적용했습니다.");
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const lastWorkspace = storageGet("lastWorkspacePath");
    if (!lastWorkspace) return;

    window.markdownCanvas
      ?.readWorkspaceTree(lastWorkspace)
      .then((nextTree) => {
        setWorkspacePath(lastWorkspace);
        setTree(nextTree);
        setNavigationState(readNavigationState(lastWorkspace));
        setOpenDocumentPaths(readOpenDocumentPaths(lastWorkspace));
        void refreshWorkspaceIndex(lastWorkspace);
        void refreshTemplates(lastWorkspace);
        void refreshPlugins();
        setNotice("최근 워크스페이스를 복원했습니다.");
      })
      .catch(() => storageDelete("lastWorkspacePath"));
  }, []);

  useEffect(() => {
    function handleGlobalShortcut(event: KeyboardEvent): void {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
        event.preventDefault();
        setCommandPaletteQuery("");
        setCommandPaletteIndex(0);
        setIsCommandPaletteOpen(true);
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        void createQuickNote();
      }
    }

    window.addEventListener("keydown", handleGlobalShortcut);
    return () => window.removeEventListener("keydown", handleGlobalShortcut);
  }, [workspacePath, navigationState]);

  useEffect(() => {
    if (!resizingSidebar) return;

    function handleMouseMove(event: MouseEvent): void {
      if (resizingSidebar === "left") {
        setLeftSidebarWidth((width) => clamp(width + event.movementX, MIN_LEFT_SIDEBAR_WIDTH, MAX_LEFT_SIDEBAR_WIDTH));
        return;
      }
      setRightSidebarWidth((width) => clamp(width - event.movementX, MIN_RIGHT_SIDEBAR_WIDTH, MAX_RIGHT_SIDEBAR_WIDTH));
    }

    function handleMouseUp(): void {
      setResizingSidebar(null);
    }

    window.document.body.style.cursor = "col-resize";
    window.document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.document.body.style.cursor = "";
      window.document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingSidebar]);

  useEffect(() => {
    storageSet(LEFT_SIDEBAR_WIDTH_STORAGE_KEY, String(leftSidebarWidth));
  }, [leftSidebarWidth]);

  useEffect(() => {
    storageSet(RIGHT_SIDEBAR_WIDTH_STORAGE_KEY, String(rightSidebarWidth));
  }, [rightSidebarWidth]);

  async function selectWorkspace(): Promise<void> {
    setIsBusy(true);
    setError("");
    try {
      assertDesktopApi();
      const selected = await window.markdownCanvas.pickWorkspace();
      if (!selected) return;
      setWorkspacePath(selected);
      storageSet("lastWorkspacePath", selected);
      setNavigationState(readNavigationState(selected));
      setOpenDocumentPaths(readOpenDocumentPaths(selected));
      setTree(await window.markdownCanvas.readWorkspaceTree(selected));
      await refreshWorkspaceIndex(selected);
      await refreshTemplates(selected);
      await refreshPlugins();
      setDocument(null);
      setSaveStatus("idle");
      setNotice("워크스페이스를 열었습니다.");
    } catch (caught) {
      setError(toErrorMessage(caught));
    } finally {
      setIsBusy(false);
    }
  }

  async function refreshTree(): Promise<void> {
    if (!workspacePath) return;
    try {
      setError("");
      setTree(await window.markdownCanvas.readWorkspaceTree(workspacePath));
      await refreshWorkspaceIndex(workspacePath);
      setDialog({ kind: "none" });
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  }

  async function openFile(node: FileTreeNode): Promise<void> {
    if (node.kind !== "markdown") return;
    try {
      setError("");
      const opened = await window.markdownCanvas.readMarkdown(node.path);
      setDocument(opened);
      rememberRecentNote(opened.path);
      rememberOpenDocument(opened.path);
      setSaveStatus("idle");
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  }

  async function openFileByPath(filePath: string): Promise<void> {
    try {
      setError("");
      const opened = await window.markdownCanvas.readMarkdown(filePath);
      setDocument(opened);
      rememberRecentNote(opened.path);
      rememberOpenDocument(opened.path);
      setSaveStatus("idle");
      setSearchQuery("");
      closeCommandPalette();
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  }

  async function openInternalLink(target: string): Promise<void> {
    const targetPath = resolveInternalNotePath(workspaceIndex, document, target);
    if (!targetPath) {
      setError(`연결된 노트를 찾을 수 없습니다: ${target}`);
      return;
    }

    await openFileByPath(targetPath);
  }

  async function createNote(): Promise<void> {
    if (!workspacePath) return;
    const nextTemplates = templates.length > 0 ? templates : await refreshTemplates(workspacePath);
    setDialog({ kind: "new-note", value: "Untitled", templateId: nextTemplates[0]?.id ?? "blank-note" });
  }

  async function createQuickNote(): Promise<void> {
    if (!workspacePath) return;

    try {
      setError("");
      const created = await window.markdownCanvas.createMarkdown(workspacePath, quickNoteTitle());
      setDocument(created);
      rememberRecentNote(created.path);
      rememberOpenDocument(created.path);
      setSaveStatus("saved");
      setTree(await window.markdownCanvas.readWorkspaceTree(workspacePath));
      await refreshWorkspaceIndex(workspacePath);
      setNotice("빠른 노트를 만들었습니다.");
      closeCommandPalette();
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  }

  async function createNoteInFolder(folder: FileTreeNode | null): Promise<void> {
    if (!workspacePath) return;
    const nextTemplates = templates.length > 0 ? templates : await refreshTemplates(workspacePath);
    setDialog({ kind: "new-note", value: "Untitled", templateId: nextTemplates[0]?.id ?? "blank-note", ...(folder?.path ? { parentPath: folder.path } : {}) });
  }

  async function openNewNoteFromTemplate(templateId: string): Promise<void> {
    if (!workspacePath) return;
    setDialog({ kind: "new-note", value: "Untitled", templateId });
  }

  async function createFolder(): Promise<void> {
    if (!workspacePath) return;
    setDialog({ kind: "new-folder", value: "New Folder" });
  }

  function createFolderInFolder(folder: FileTreeNode | null): void {
    if (!workspacePath) return;
    setDialog({ kind: "new-folder", value: "New Folder", ...(folder?.path ? { parentPath: folder.path } : {}) });
  }

  async function createNoteWithTitle(title: string, templateId: string, parentPath?: string): Promise<void> {
    if (!workspacePath || !title.trim()) return;

    try {
      setError("");
      const created = await window.markdownCanvas.createMarkdownFromTemplate(workspacePath, title, templateId, parentPath);
      setDocument(created);
      rememberRecentNote(created.path);
      rememberOpenDocument(created.path);
      setSaveStatus("saved");
      setTree(await window.markdownCanvas.readWorkspaceTree(workspacePath));
      await refreshWorkspaceIndex(workspacePath);
      setNotice("새 노트를 만들었습니다.");
      setDialog({ kind: "none" });
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  }

  async function createFolderWithName(folderName: string, parentPath?: string): Promise<void> {
    if (!workspacePath || !folderName.trim()) return;

    try {
      setError("");
      await window.markdownCanvas.createFolder(workspacePath, folderName, parentPath);
      setTree(await window.markdownCanvas.readWorkspaceTree(workspacePath));
      setNotice("새 폴더를 만들었습니다.");
      setDialog({ kind: "none" });
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  }

  async function renameNode(node: FileTreeNode): Promise<void> {
    setDialog({ kind: "rename", value: node.name, node });
  }

  async function renameNodeWithName(node: FileTreeNode, nextName: string): Promise<void> {
    if (!workspacePath || !nextName.trim()) return;

    try {
      setError("");
      const nextPath = await window.markdownCanvas.renameEntry(workspacePath, node.path, nextName);
      replaceNavigationPath(node.path, nextPath);
      if (document?.path === node.path) {
        setDocument(await window.markdownCanvas.readMarkdown(nextPath));
        setSaveStatus("idle");
      }
      setTree(await window.markdownCanvas.readWorkspaceTree(workspacePath));
      await refreshWorkspaceIndex(workspacePath);
      setNotice("이름을 변경했습니다.");
      setDialog({ kind: "none" });
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  }

  function deleteNode(node: FileTreeNode): void {
    setDialog({ kind: "delete", node });
  }

  async function deleteNodeConfirmed(node: FileTreeNode): Promise<void> {
    if (!workspacePath) return;

    try {
      setError("");
      await window.markdownCanvas.deleteEntry(workspacePath, node.path);
      removeNavigationPath(node.path);
      if (document?.path === node.path || document?.path.startsWith(`${node.path}\\`) || document?.path.startsWith(`${node.path}/`)) {
        setDocument(null);
        setSaveStatus("idle");
      }
      setTree(await window.markdownCanvas.readWorkspaceTree(workspacePath));
      await refreshWorkspaceIndex(workspacePath);
      if (isTrashOpen) await refreshTrash(workspacePath);
      setNotice("휴지통으로 이동했습니다.");
      setDialog({ kind: "none" });
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  }

  function moveNode(node: FileTreeNode, targetFolder: FileTreeNode | null): void {
    void moveNodeConfirmed(node, targetFolder);
  }

  async function moveNodeConfirmed(node: FileTreeNode, targetFolder: FileTreeNode | null): Promise<void> {
    if (!workspacePath) return;
    const targetPath = targetFolder?.path ?? workspacePath;

    try {
      setError("");
      const nextPath = await window.markdownCanvas.moveEntry(workspacePath, node.path, targetPath);
      replaceNavigationPath(node.path, nextPath);
      const nextDocument = await refreshDocumentAfterMove(document, node, nextPath, window.markdownCanvas.readMarkdown);
      setDocument(nextDocument);
      if (nextDocument) setSaveStatus("idle");
      setTree(await window.markdownCanvas.readWorkspaceTree(workspacePath));
      await refreshWorkspaceIndex(workspacePath);
      setDialog({ kind: "none" });
      setNotice("항목을 이동했습니다.");
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  }

  async function saveDocument(filePath: string, content: string): Promise<void> {
    try {
      setSaveStatus("saving");
      const saved = await window.markdownCanvas.saveMarkdown(filePath, content);
      setDocument((current) => (current?.path === filePath ? saved : current));
      setSaveStatus("saved");
      if (workspacePath) {
        await refreshWorkspaceIndex(workspacePath);
        // 레이트-리밋 자동 백업 (5분에 1회)
        void window.markdownCanvas.autoBackup(workspacePath, filePath, content).catch(() => undefined);
      }
    } catch (caught) {
      setSaveStatus("error");
      setError(toErrorMessage(caught));
    }
  }

  async function refreshWorkspaceIndex(path: string): Promise<void> {
    const documents = await window.markdownCanvas.readWorkspaceDocuments(path);
    setWorkspaceIndex(buildWorkspaceIndex(documents));
  }

  async function refreshTemplates(path: string): Promise<NoteTemplate[]> {
    const nextTemplates = await window.markdownCanvas.readTemplates(path);
    setTemplates(nextTemplates);
    return nextTemplates;
  }

  async function refreshPlugins(): Promise<InstalledPlugin[]> {
    const nextPlugins = await window.markdownCanvas.readPlugins();
    setPlugins(nextPlugins);
    return nextPlugins;
  }

  async function openTemplateManager(): Promise<void> {
    if (!workspacePath) return;
    await refreshTemplates(workspacePath);
    setIsTemplateManagerOpen(true);
  }

  async function openPluginManager(): Promise<void> {
    await refreshPlugins();
    setIsPluginManagerOpen(true);
  }

  function toggleCurrentDocumentPin(): void {
    if (!workspacePath || !document) return;
    const nextState = navigationState.pinnedPaths.includes(document.path)
      ? { ...navigationState, pinnedPaths: navigationState.pinnedPaths.filter((path) => path !== document.path) }
      : { ...navigationState, pinnedPaths: [document.path, ...navigationState.pinnedPaths] };
    persistNavigationState(workspacePath, nextState);
    setNavigationState(nextState);
  }

  function rememberRecentNote(filePath: string): void {
    if (!workspacePath) return;
    const nextState = {
      ...navigationState,
      recentPaths: [filePath, ...navigationState.recentPaths.filter((path) => path !== filePath)].slice(0, MAX_RECENT_NOTES)
    };
    persistNavigationState(workspacePath, nextState);
    setNavigationState(nextState);
  }

  function rememberOpenDocument(filePath: string): void {
    if (!workspacePath) return;
    const nextPaths = [filePath, ...openDocumentPaths.filter((path) => path !== filePath)].slice(0, MAX_OPEN_TABS);
    persistOpenDocumentPaths(workspacePath, nextPaths);
    setOpenDocumentPaths(nextPaths);
  }

  async function closeOpenDocument(filePath: string): Promise<void> {
    if (!workspacePath) return;
    const nextPaths = openDocumentPaths.filter((path) => path !== filePath);
    persistOpenDocumentPaths(workspacePath, nextPaths);
    setOpenDocumentPaths(nextPaths);

    if (document?.path !== filePath) return;
    const nextPath = nextPaths[0];
    if (nextPath) {
      await openFileByPath(nextPath);
      return;
    }

    setDocument(null);
    setSaveStatus("idle");
  }

  function replaceNavigationPath(previousPath: string, nextPath: string): void {
    if (!workspacePath) return;
    const nextState = {
      pinnedPaths: navigationState.pinnedPaths.map((path) => replacePathPrefix(path, previousPath, nextPath)),
      recentPaths: navigationState.recentPaths.map((path) => replacePathPrefix(path, previousPath, nextPath))
    };
    const nextOpenDocumentPaths = openDocumentPaths.map((path) => replacePathPrefix(path, previousPath, nextPath));
    persistNavigationState(workspacePath, nextState);
    persistOpenDocumentPaths(workspacePath, nextOpenDocumentPaths);
    setNavigationState(nextState);
    setOpenDocumentPaths(nextOpenDocumentPaths);
  }

  function removeNavigationPath(pathToRemove: string): void {
    if (!workspacePath) return;
    const nextState = {
      pinnedPaths: navigationState.pinnedPaths.filter((path) => !isSameOrChildPath(path, pathToRemove)),
      recentPaths: navigationState.recentPaths.filter((path) => !isSameOrChildPath(path, pathToRemove))
    };
    const nextOpenDocumentPaths = openDocumentPaths.filter((path) => !isSameOrChildPath(path, pathToRemove));
    persistNavigationState(workspacePath, nextState);
    persistOpenDocumentPaths(workspacePath, nextOpenDocumentPaths);
    setNavigationState(nextState);
    setOpenDocumentPaths(nextOpenDocumentPaths);
  }

  function unpinNote(pathToRemove: string): void {
    if (!workspacePath) return;
    const nextState = {
      ...navigationState,
      pinnedPaths: navigationState.pinnedPaths.filter((path) => path !== pathToRemove)
    };
    persistNavigationState(workspacePath, nextState);
    setNavigationState(nextState);
  }

  function removeRecentNote(pathToRemove: string): void {
    if (!workspacePath) return;
    const nextState = {
      ...navigationState,
      recentPaths: navigationState.recentPaths.filter((path) => path !== pathToRemove)
    };
    persistNavigationState(workspacePath, nextState);
    setNavigationState(nextState);
  }

  async function openTrash(): Promise<void> {
    if (!workspacePath) return;
    setIsTrashOpen(true);
    await refreshTrash(workspacePath);
  }

  async function refreshTrash(path: string): Promise<void> {
    try {
      setIsTrashLoading(true);
      setError("");
      setTrashEntries(await window.markdownCanvas.listTrash(path));
    } catch (caught) {
      setError(toErrorMessage(caught));
    } finally {
      setIsTrashLoading(false);
    }
  }

  async function restoreTrashEntry(entry: TrashEntry): Promise<void> {
    if (!workspacePath) return;

    try {
      setError("");
      const restoredPath = await window.markdownCanvas.restoreTrash(workspacePath, entry.trashedPath);
      setTree(await window.markdownCanvas.readWorkspaceTree(workspacePath));
      await refreshWorkspaceIndex(workspacePath);
      await refreshTrash(workspacePath);
      if (entry.kind === "markdown") {
        const restored = await window.markdownCanvas.readMarkdown(restoredPath);
        setDocument(restored);
        rememberRecentNote(restored.path);
        rememberOpenDocument(restored.path);
        setSaveStatus("idle");
      }
      setNotice("휴지통에서 복구했습니다.");
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  }

  async function permanentlyDeleteTrashEntry(entry: TrashEntry): Promise<void> {
    if (!workspacePath) return;

    try {
      setError("");
      await window.markdownCanvas.permanentlyDeleteTrash(workspacePath, entry.trashedPath);
      await refreshTrash(workspacePath);
      setNotice("휴지통에서 영구 삭제했습니다.");
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  }

  async function saveTemplate(input: NoteTemplateInput): Promise<void> {
    if (!workspacePath) return;

    try {
      setError("");
      await window.markdownCanvas.saveTemplate(workspacePath, input);
      await refreshTemplates(workspacePath);
      setNotice("템플릿을 저장했습니다.");
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  }

  async function deleteTemplate(templateId: string): Promise<void> {
    if (!workspacePath) return;

    try {
      setError("");
      await window.markdownCanvas.deleteTemplate(workspacePath, templateId);
      await refreshTemplates(workspacePath);
      setNotice("템플릿을 삭제했습니다.");
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  }

  function deleteMultipleNodes(nodes: FileTreeNode[]): void {
    setDialog({ kind: "delete-multiple", nodes });
  }

  async function confirmDeleteMultipleNodes(nodes: FileTreeNode[]): Promise<void> {
    if (!workspacePath) return;

    try {
      setError("");
      const topLevel = filterTopLevelNodes(nodes);
      const deletedCurrentDoc = nodes.some(
        (n) => document?.path === n.path || document?.path.startsWith(`${n.path}\\`) || document?.path.startsWith(`${n.path}/`)
      );

      for (const node of topLevel) {
        await window.markdownCanvas.deleteEntry(workspacePath, node.path);
        removeNavigationPath(node.path);
      }

      if (deletedCurrentDoc) {
        setDocument(null);
        setSaveStatus("idle");
      }

      setTree(await window.markdownCanvas.readWorkspaceTree(workspacePath));
      await refreshWorkspaceIndex(workspacePath);
      if (isTrashOpen) await refreshTrash(workspacePath);
      setNotice(`${topLevel.length}개 항목을 휴지통으로 이동했습니다.`);
      setDialog({ kind: "none" });
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  }

  async function moveMultipleNodes(nodes: FileTreeNode[], targetFolder: FileTreeNode | null): Promise<void> {
    if (!workspacePath) return;
    const targetPath = targetFolder?.path ?? workspacePath;

    try {
      setError("");
      const topLevel = filterTopLevelNodes(nodes);
      const movedCurrentDoc = nodes.some(
        (n) => document?.path === n.path || document?.path.startsWith(`${n.path}\\`) || document?.path.startsWith(`${n.path}/`)
      );

      for (const node of topLevel) {
        const nextPath = await window.markdownCanvas.moveEntry(workspacePath, node.path, targetPath);
        replaceNavigationPath(node.path, nextPath);
      }

      setTree(await window.markdownCanvas.readWorkspaceTree(workspacePath));
      await refreshWorkspaceIndex(workspacePath);

      if (movedCurrentDoc) {
        setDocument(null);
        setSaveStatus("idle");
      }

      setNotice(`${topLevel.length}개 항목을 이동했습니다.`);
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  }

  async function handleRenameTag(oldTag: string, newTag: string): Promise<void> {
    if (!workspaceIndex) return;
    const affected = workspaceIndex.notes.filter((n) => n.analysis.tags.includes(oldTag));
    for (const note of affected) {
      const nextContent = renameTagInContent(note.content, oldTag, newTag);
      await window.markdownCanvas.saveMarkdown(note.path, nextContent);
    }
    if (workspacePath) await refreshWorkspaceIndex(workspacePath);
    setNotice(`#${oldTag} → #${newTag} 변경 완료 (${affected.length}개 노트)`);
  }

  async function handleDeleteTag(tag: string): Promise<void> {
    if (!workspaceIndex) return;
    const affected = workspaceIndex.notes.filter((n) => n.analysis.tags.includes(tag));
    for (const note of affected) {
      const nextContent = removeTagFromContent(note.content, tag);
      await window.markdownCanvas.saveMarkdown(note.path, nextContent);
    }
    if (workspacePath) await refreshWorkspaceIndex(workspacePath);
    setNotice(`#${tag} 삭제 완료 (${affected.length}개 노트에서 제거)`);
  }

  async function startSampleWorkspace(): Promise<void> {
    setIsBusy(true);
    setError("");
    try {
      assertDesktopApi();
      const selected = await window.markdownCanvas.pickWorkspace();
      if (!selected) return;
      await window.markdownCanvas.createSampleWorkspace(selected);
      setWorkspacePath(selected);
      storageSet("lastWorkspacePath", selected);
      setNavigationState(readNavigationState(selected));
      setOpenDocumentPaths(readOpenDocumentPaths(selected));
      setTree(await window.markdownCanvas.readWorkspaceTree(selected));
      await refreshWorkspaceIndex(selected);
      await refreshTemplates(selected);
      await refreshPlugins();
      setDocument(null);
      setSaveStatus("idle");
      setNotice("샘플 워크스페이스를 만들었습니다. 시작하기.md를 열어보세요!");
    } catch (caught) {
      setError(toErrorMessage(caught));
    } finally {
      setIsBusy(false);
    }
  }

  async function restoreFromBackup(restoredContent: string): Promise<void> {
    if (!document || !workspacePath) return;
    try {
      setError("");
      // 현재 상태 먼저 백업
      await window.markdownCanvas.createBackupNow(workspacePath, document.path, document.content);
      const saved = await window.markdownCanvas.saveMarkdown(document.path, restoredContent);
      setDocument(saved);
      setSaveStatus("saved");
      await refreshWorkspaceIndex(workspacePath);
      setNotice("백업에서 복원했습니다.");
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  }

  function saveWorkspaceSettings(settings: WorkspaceSettings): void {
    persistWorkspaceSettings(settings);
    setWorkspaceSettings(settings);
  }

  async function syncAssets(): Promise<void> {
    setDialog({ kind: "sync-assets", value: "" });
  }

  async function exportCurrentDocumentPdf(): Promise<void> {
    if (!document) return;
    try {
      await exportToPdfElectron(document.content, document.path, title);
      setNotice("PDF로 저장했습니다.");
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  }

  function closeCommandPalette(): void {
    setIsCommandPaletteOpen(false);
    setCommandPaletteQuery("");
    setCommandPaletteIndex(0);
  }

  async function runPluginCommand(plugin: InstalledPlugin, commandId: string): Promise<void> {
    try {
      setError("");
      const result = await window.markdownCanvas.runPluginCommand({
        pluginId: plugin.id,
        commandId,
        document,
        workspacePath
      });

      // 구조화 액션 처리
      if (result.action) {
        const action = result.action;
        if (action.type === "notice") {
          setNotice(action.message);
          return;
        }
        if (action.type === "replace" && document) {
          const saved = await window.markdownCanvas.saveMarkdown(document.path, action.content);
          setDocument(saved);
          setSaveStatus("saved");
          setNotice(`${plugin.title}: 노트를 교체했습니다.`);
          return;
        }
        if (action.type === "append" && document) {
          const nextContent = document.content + "\n\n" + action.content;
          const saved = await window.markdownCanvas.saveMarkdown(document.path, nextContent);
          setDocument(saved);
          setSaveStatus("saved");
          setNotice(`${plugin.title}: 내용을 추가했습니다.`);
          return;
        }
        if (action.type === "insert" && document) {
          // 노트 현재 커서 위치에 삽입 (간단 구현: 끝에 추가)
          const nextContent = document.content + "\n\n" + action.content;
          const saved = await window.markdownCanvas.saveMarkdown(document.path, nextContent);
          setDocument(saved);
          setSaveStatus("saved");
          setNotice(`${plugin.title}: 내용을 삽입했습니다.`);
          return;
        }
        if (action.type === "open-url") {
          window.open(action.url, "_blank");
          return;
        }
      }

      // 일반 문자열 출력
      const output = typeof result.output === "string" ? result.output : JSON.stringify(result.output);
      setNotice(output && output !== "undefined" ? output : `${plugin.title} 명령을 실행했습니다.`);
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  }

  async function syncAssetsWithToken(token: string): Promise<void> {
    if (!token.trim()) return;

    try {
      setError("");
      setNotice("");
      const installedAssets = await window.markdownCanvas.syncAssets(token.trim());
      const themeAsset = installedAssets.find((item) => item.asset.type === "THEME" && item.asset.metadata.tokens?.editorCss);

      if (themeAsset?.asset.metadata.tokens?.editorCss) {
        setThemeCss(themeAsset.asset.metadata.tokens.editorCss);
      }
      if (workspacePath) await refreshTemplates(workspacePath);
      await refreshPlugins();

      setNotice(`${installedAssets.length}개 에셋을 동기화했습니다.`);
      setDialog({ kind: "none" });
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  }

  return (
    <main className="flex h-screen min-h-0 overflow-hidden bg-paper text-ink">
      <aside className="flex min-h-0 shrink-0 flex-col overflow-hidden border-r border-line bg-white" style={{ width: leftSidebarWidth }}>
        <div className="flex h-14 items-center gap-2 border-b border-line px-3">
          <button className="icon-button" title="워크스페이스 열기" onClick={selectWorkspace} disabled={isBusy}>
            <FolderOpen size={18} />
          </button>
          <button className="icon-button" title="파일 트리 새로고침" onClick={refreshTree} disabled={!workspacePath}>
            <RefreshCcw size={18} />
          </button>
          <span className="min-w-0 flex-1 truncate text-base font-bold text-ink" title={tree?.name ?? "MarkVas"}>
            {tree?.name ?? "MarkVas"}
          </span>
        </div>
        {error && <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">{error}</div>}
        {notice && (
          <div className="flex items-start gap-2 border-b border-teal-100 bg-teal-50 px-3 py-2 text-xs leading-5 text-accent">
            <span className="min-w-0 flex-1">{notice}</span>
            <button
              className="grid h-5 w-5 shrink-0 place-items-center rounded text-accent/70 transition hover:bg-white/70 hover:text-accent"
              title="안내 닫기"
              type="button"
              onClick={() => setNotice("")}
            >
              <X size={13} />
            </button>
          </div>
        )}
        <WorkspaceSearchPanel
          index={workspaceIndex}
          results={searchResults}
          query={searchQuery}
          selectedTag={selectedTag}
          onQueryChange={setSearchQuery}
          onTagChange={setSelectedTag}
          onOpenNote={openFileByPath}
          onManageTags={() => setIsTagManagerOpen(true)}
        />
        <QuickAccessPanel
          pinnedNotes={pinnedNotes}
          recentNotes={recentNotes}
          isPinnedCollapsed={isPinnedCollapsed}
          isRecentCollapsed={isRecentCollapsed}
          onOpenNote={openFileByPath}
          onTogglePinned={() => setIsPinnedCollapsed((value) => !value)}
          onToggleRecent={() => setIsRecentCollapsed((value) => !value)}
          onUnpinNote={unpinNote}
          onRemoveRecentNote={removeRecentNote}
        />
        <FileTree
          tree={tree}
          selectedPath={document?.path}
          onOpenFile={openFile}
          onRename={renameNode}
          onDelete={deleteNode}
          onMove={moveNode}
          onDeleteMultiple={deleteMultipleNodes}
          onMoveMultiple={moveMultipleNodes}
          onCreateNoteInFolder={createNoteInFolder}
          onCreateFolderInFolder={createFolderInFolder}
        />
      </aside>

      <SidebarResizeHandle side="left" onMouseDown={() => setResizingSidebar("left")} />

      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Toolbar
          title={title}
          document={document}
          saveStatus={saveStatus}
          isPinned={isCurrentDocumentPinned}
          themeCss={themeCss}
          onThemeChange={setThemeCss}
          onSyncAssets={syncAssets}
          onManageTemplates={openTemplateManager}
          onManagePlugins={openPluginManager}
          onOpenTrash={openTrash}
          onTogglePin={toggleCurrentDocumentPin}
          onExportPdf={exportCurrentDocumentPdf}
          onManageSettings={() => setIsSettingsOpen(true)}
          onOpenBackup={() => setIsBackupOpen(true)}
          onOpenGraph={() => setIsGraphOpen(true)}
          canManageTemplates={Boolean(workspacePath)}
        />
        <OpenDocumentBar
          notes={openDocumentTabs}
          activePath={document?.path ?? null}
          onOpenNote={openFileByPath}
          onCloseNote={closeOpenDocument}
        />
        {!workspacePath ? (
          <OnboardingScreen isBusy={isBusy} onSelectWorkspace={selectWorkspace} onStartSample={startSampleWorkspace} />
        ) : (
          <MarkdownEditor
            document={document}
            themeCss={themeCss}
            initialViewMode={workspaceSettings.defaultViewMode}
            autoSaveDelayMs={workspaceSettings.autoSaveDelayMs}
            initialPreviewWidth={workspaceSettings.previewWidthPercent}
            workspacePath={workspacePath}
            notes={workspaceIndex?.notes ?? []}
            wysiwygMode={workspaceSettings.wysiwygMode}
            isDark={workspaceSettings.darkMode === "dark" ||
              (workspaceSettings.darkMode === "system" &&
                window.matchMedia("(prefers-color-scheme: dark)").matches)}
            onChange={saveDocument}
            onDirty={() => setSaveStatus("dirty")}
            onPreviewWidthChange={(w) => saveWorkspaceSettings({ ...workspaceSettings, previewWidthPercent: w })}
            onOpenInternalLink={openInternalLink}
          />
        )}
      </section>

      {workspaceSettings.showNoteInfoPanel && (
        <>
          <SidebarResizeHandle side="right" onMouseDown={() => setResizingSidebar("right")} />
          <NoteInfoPanel analysis={noteAnalysis} backlinks={backlinks} onOpenNote={openFileByPath} width={rightSidebarWidth} />
        </>
      )}

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        query={commandPaletteQuery}
        items={commandPaletteItems}
        selectedIndex={Math.min(commandPaletteIndex, Math.max(commandPaletteItems.length - 1, 0))}
        onQueryChange={setCommandPaletteQuery}
        onSelectedIndexChange={setCommandPaletteIndex}
        onClose={closeCommandPalette}
      />

      <TemplateManagerModal
        isOpen={isTemplateManagerOpen}
        templates={templates}
        onClose={() => setIsTemplateManagerOpen(false)}
        onSave={saveTemplate}
        onDelete={deleteTemplate}
      />

      <PluginManagerModal
        isOpen={isPluginManagerOpen}
        plugins={plugins}
        onClose={() => setIsPluginManagerOpen(false)}
        onRunCommand={runPluginCommand}
      />

      <TrashModal
        isOpen={isTrashOpen}
        entries={trashEntries}
        isLoading={isTrashLoading}
        onClose={() => setIsTrashOpen(false)}
        onRestore={restoreTrashEntry}
        onDeletePermanent={permanentlyDeleteTrashEntry}
      />

      <WorkspaceSettingsModal
        isOpen={isSettingsOpen}
        settings={workspaceSettings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={saveWorkspaceSettings}
      />

      <TagManagerModal
        isOpen={isTagManagerOpen}
        index={workspaceIndex}
        onClose={() => setIsTagManagerOpen(false)}
        onRenameTag={handleRenameTag}
        onDeleteTag={handleDeleteTag}
      />

      <BackupRestoreModal
        isOpen={isBackupOpen}
        workspacePath={workspacePath}
        filePath={document?.path ?? null}
        currentContent={document?.content ?? ""}
        onClose={() => setIsBackupOpen(false)}
        onRestore={restoreFromBackup}
      />

      <GraphViewModal
        isOpen={isGraphOpen}
        index={workspaceIndex}
        activePath={document?.path}
        onClose={() => setIsGraphOpen(false)}
        onOpenNote={openFileByPath}
      />

      {dialog.kind !== "none" && dialog.kind !== "delete" && dialog.kind !== "delete-multiple" && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 px-4">
          <form
            className="w-full max-w-md rounded border border-line bg-white p-5 shadow-lg"
            onSubmit={(event) => {
              event.preventDefault();
              if (dialog.kind === "new-note") void createNoteWithTitle(dialog.value, dialog.templateId, dialog.parentPath);
              if (dialog.kind === "new-folder") void createFolderWithName(dialog.value, dialog.parentPath);
              if (dialog.kind === "rename") void renameNodeWithName(dialog.node, dialog.value);
              if (dialog.kind === "sync-assets") void syncAssetsWithToken(dialog.value);
            }}
          >
            <h2 className="text-base font-bold">{getDialogTitle(dialog)}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{getDialogDescription(dialog)}</p>
            <input
              className="mt-4 h-10 w-full rounded border border-line px-3 text-sm outline-none focus:border-accent"
              autoFocus
              value={dialog.value}
              type={dialog.kind === "sync-assets" ? "password" : "text"}
              onChange={(event) => setDialog({ ...dialog, value: event.target.value })}
            />
            {dialog.kind === "new-note" && (
              <label className="mt-4 block text-sm font-semibold">
                템플릿
                <select
                  className="mt-2 h-10 w-full rounded border border-line bg-white px-3 text-sm font-normal outline-none focus:border-accent"
                  value={dialog.templateId}
                  onChange={(event) => setDialog({ ...dialog, templateId: event.target.value })}
                >
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="button-secondary" onClick={() => setDialog({ kind: "none" })}>
                취소
              </button>
              <button className="button" type="submit">
                {dialog.kind === "sync-assets" ? "동기화" : dialog.kind === "rename" ? "변경" : "만들기"}
              </button>
            </div>
          </form>
        </div>
      )}

      {dialog.kind === "delete" && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 px-4">
          <div className="w-full max-w-md rounded border border-line bg-white p-5 shadow-lg">
            <h2 className="text-base font-bold">삭제 확인</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              `{dialog.node.name}` 항목을 휴지통으로 이동합니다.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="button-secondary" onClick={() => setDialog({ kind: "none" })}>
                취소
              </button>
              <button className="button" type="button" onClick={() => void deleteNodeConfirmed(dialog.node)}>
                삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {dialog.kind === "delete-multiple" && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/20 px-4">
          <div className="w-full max-w-md rounded border border-line bg-white p-5 shadow-lg">
            <h2 className="text-base font-bold">묶음 삭제 확인</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              선택한 {dialog.nodes.length}개 항목을 휴지통으로 이동합니다.
            </p>
            <ul className="mt-3 max-h-36 overflow-auto rounded border border-line bg-stone-50 p-2">
              {dialog.nodes.map((n) => (
                <li key={n.path} className="truncate py-0.5 text-xs text-slate-600">
                  • {n.name}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="button-secondary" onClick={() => setDialog({ kind: "none" })}>
                취소
              </button>
              <button className="button" type="button" onClick={() => void confirmDeleteMultipleNodes(dialog.nodes)}>
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function OpenDocumentBar({
  notes,
  activePath,
  onOpenNote,
  onCloseNote
}: {
  notes: IndexedNote[];
  activePath: string | null;
  onOpenNote: (path: string) => Promise<void>;
  onCloseNote: (path: string) => Promise<void>;
}): JSX.Element | null {
  if (notes.length === 0) return null;

  return (
    <div className="flex h-10 items-center gap-1 overflow-x-auto border-b border-line bg-white px-2">
      {notes.map((note) => {
        const isActive = note.path === activePath;
        return (
          <div
            className={`flex h-8 max-w-56 shrink-0 items-center rounded border text-sm ${
              isActive ? "border-accent bg-teal-50 text-accent" : "border-line bg-stone-50 text-slate-600"
            }`}
            key={note.path}
          >
            <button className="min-w-0 flex-1 truncate px-3 text-left" type="button" title={note.path} onClick={() => void onOpenNote(note.path)}>
              {note.analysis.title || note.name}
            </button>
            <button
              className="grid h-7 w-7 place-items-center rounded text-slate-400 transition hover:bg-white hover:text-red-600"
              type="button"
              title="탭 닫기"
              onClick={() => void onCloseNote(note.path)}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function SidebarResizeHandle({ side, onMouseDown }: { side: "left" | "right"; onMouseDown: () => void }): JSX.Element {
  const visibilityClass = side === "right" ? "hidden xl:block" : "block";

  return (
    <div
      className={`${visibilityClass} group relative z-10 w-1 shrink-0 cursor-col-resize bg-line/40 transition hover:bg-accent/40`}
      role="separator"
      aria-orientation="vertical"
      title={side === "left" ? "왼쪽 사이드바 크기 조절" : "오른쪽 사이드바 크기 조절"}
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown();
      }}
    >
      <div className="absolute inset-y-0 left-1/2 w-3 -translate-x-1/2" />
    </div>
  );
}

function resolveInternalNotePath(index: WorkspaceIndex | null, currentDocument: MarkdownDocument | null, rawTarget: string): string | null {
  if (!index) return null;

  const target = normalizeLinkTarget(rawTarget);
  if (!target) return null;

  const currentDirectory = currentDocument ? normalizePath(currentDocument.path).replace(/\/[^/]*$/, "") : "";
  const targetPath = normalizePath(target);
  const relativeTargetPath = currentDirectory && !isAbsolutePath(targetPath) ? normalizePath(`${currentDirectory}/${targetPath}`) : targetPath;
  const targetWithoutExtension = stripMarkdownExtension(targetPath).toLowerCase();
  const targetWithExtension = ensureMarkdownExtension(targetPath).toLowerCase();

  const exactPathMatch = index.notes.find((note) => normalizePath(note.path).toLowerCase() === relativeTargetPath.toLowerCase());
  if (exactPathMatch) return exactPathMatch.path;

  const suffixMatch = index.notes.find((note) => normalizePath(note.path).toLowerCase().endsWith(`/${targetWithExtension}`));
  if (suffixMatch) return suffixMatch.path;

  const semanticMatch = index.notes.find((note) => {
    const noteName = stripMarkdownExtension(note.name).toLowerCase();
    const noteTitle = note.analysis.title.toLowerCase();
    const aliases = note.analysis.frontmatter.aliases ?? [];
    return noteName === targetWithoutExtension || noteTitle === targetWithoutExtension || aliases.some((alias) => alias.toLowerCase() === targetWithoutExtension);
  });

  return semanticMatch?.path ?? null;
}

function normalizeLinkTarget(target: string): string {
  const withoutAnchor = target.split("#")[0]?.trim() ?? "";
  try {
    return decodeURIComponent(withoutAnchor);
  } catch {
    return withoutAnchor;
  }
}

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/\/+/g, "/");
}

function isAbsolutePath(filePath: string): boolean {
  return /^[a-z]:\//i.test(filePath) || filePath.startsWith("//");
}

function stripMarkdownExtension(value: string): string {
  return value.replace(/\.md$/i, "");
}

function ensureMarkdownExtension(value: string): string {
  return /\.md$/i.test(value) ? value : `${value}.md`;
}

function quickNoteTitle(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `Quick Note ${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}${pad(date.getMinutes())}`;
}

async function refreshDocumentAfterMove(
  document: MarkdownDocument | null,
  movedNode: FileTreeNode,
  nextPath: string,
  readMarkdown: (filePath: string) => Promise<MarkdownDocument>
): Promise<MarkdownDocument | null> {
  if (!document) return null;
  if (document.path === movedNode.path) return readMarkdown(nextPath);
  if (document.path.startsWith(`${movedNode.path}\\`) || document.path.startsWith(`${movedNode.path}/`)) {
    const relativePath = document.path.slice(movedNode.path.length + 1);
    return readMarkdown(`${nextPath}\\${relativePath}`);
  }
  return document;
}

function getDialogTitle(dialog: Exclude<DialogState, { kind: "none" } | { kind: "delete" } | { kind: "delete-multiple" }>): string {
  if (dialog.kind === "new-note") return "새 노트 만들기";
  if (dialog.kind === "new-folder") return "새 폴더 만들기";
  if (dialog.kind === "rename") return "이름 변경";
  return "에셋 동기화";
}

function getDialogDescription(dialog: Exclude<DialogState, { kind: "none" } | { kind: "delete" } | { kind: "delete-multiple" }>): string {
  if (dialog.kind === "new-note") return "생성할 마크다운 파일 이름과 템플릿을 선택하세요.";
  if (dialog.kind === "new-folder") return "생성할 폴더 이름을 입력하세요.";
  if (dialog.kind === "rename") return "새 이름을 입력하세요. 마크다운 파일은 확장자가 유지됩니다.";
  return "스토어에서 복사한 동기화 토큰을 입력하세요.";
}

interface CommandPaletteContext {
  query: string;
  workspacePath: string | null;
  document: MarkdownDocument | null;
  isCurrentDocumentPinned: boolean;
  workspaceIndex: WorkspaceIndex | null;
  templates: NoteTemplate[];
  plugins: InstalledPlugin[];
  selectWorkspace: () => Promise<void>;
  openFileByPath: (path: string) => Promise<void>;
  createNote: () => Promise<void>;
  createQuickNote: () => Promise<void>;
  createFolder: () => Promise<void>;
  refreshTree: () => Promise<void>;
  exportCurrentDocumentPdf: () => Promise<void>;
  openTemplateManager: () => Promise<void>;
  openPluginManager: () => Promise<void>;
  openTrash: () => Promise<void>;
  toggleCurrentDocumentPin: () => void;
  syncAssets: () => Promise<void>;
  openSettings: () => void;
  openTagManager: () => void;
  openBackup: () => void;
  runPluginCommand: (plugin: InstalledPlugin, commandId: string) => Promise<void>;
  openNewNoteFromTemplate: (templateId: string) => Promise<void>;
  closePalette: () => void;
}

function buildCommandPaletteItems(context: CommandPaletteContext): CommandPaletteItem[] {
  const query = context.query.trim().toLowerCase();
  const run = (action: () => void | Promise<void>): (() => Promise<void>) => {
    return async () => {
      context.closePalette();
      await action();
    };
  };

  const commands: CommandPaletteItem[] = [
    {
      id: "command:open-workspace",
      kind: "command",
      title: "워크스페이스 열기",
      subtitle: "로컬 마크다운 폴더 선택",
      onSelect: run(context.selectWorkspace)
    }
  ];

  if (context.workspacePath) {
    commands.push(
      {
        id: "command:new-note",
        kind: "command",
        title: "새 노트 만들기",
        subtitle: "템플릿을 선택해서 마크다운 노트 생성",
        onSelect: run(context.createNote)
      },
      {
        id: "command:quick-note",
        kind: "command",
        title: "빠른 노트 만들기",
        subtitle: "대화상자 없이 즉시 새 노트 생성",
        tags: ["Ctrl+N"],
        onSelect: run(context.createQuickNote)
      },
      {
        id: "command:new-folder",
        kind: "command",
        title: "새 폴더 만들기",
        subtitle: "현재 워크스페이스에 폴더 생성",
        onSelect: run(context.createFolder)
      },
      {
        id: "command:refresh-tree",
        kind: "command",
        title: "파일 트리 새로고침",
        subtitle: "워크스페이스 파일 목록과 인덱스 갱신",
        onSelect: run(context.refreshTree)
      },
      {
        id: "command:manage-templates",
        kind: "command",
        title: "템플릿 관리",
        subtitle: "워크스페이스 노트 양식 편집",
        onSelect: run(context.openTemplateManager)
      },
      {
        id: "command:manage-plugins",
        kind: "command",
        title: "플러그인 관리",
        subtitle: "설치된 플러그인 권한과 명령 확인",
        onSelect: run(context.openPluginManager)
      },
      {
        id: "command:open-trash",
        kind: "command",
        title: "휴지통 열기",
        subtitle: "삭제한 노트와 폴더를 복구하거나 영구 삭제",
        onSelect: run(context.openTrash)
      },
      {
        id: "command:sync-assets",
        kind: "command",
        title: "에셋 동기화",
        subtitle: "스토어에서 설치한 테마와 템플릿 반영",
        onSelect: run(context.syncAssets)
      },
      {
        id: "command:settings",
        kind: "command",
        title: "워크스페이스 설정",
        subtitle: "기본 편집기 모드, 자동 저장 간격, 패널 표시 설정",
        onSelect: run(context.openSettings)
      },
      {
        id: "command:tag-manager",
        kind: "command",
        title: "태그 관리",
        subtitle: "태그 이름 변경, 삭제 — 전체 워크스페이스에 반영",
        onSelect: run(context.openTagManager)
      },
      {
        id: "command:backup",
        kind: "command",
        title: "백업 이력",
        subtitle: "현재 노트의 자동 백업 목록에서 이전 버전 복원",
        onSelect: run(context.openBackup)
      }
    );
  }

  if (context.document) {
    commands.push(
      {
        id: "command:toggle-pin",
        kind: "command",
        title: context.isCurrentDocumentPinned ? "현재 노트 고정 해제" : "현재 노트 고정",
        subtitle: "왼쪽 고정 노트 영역에 현재 노트를 표시하거나 제거",
        onSelect: run(context.toggleCurrentDocumentPin)
      },
      {
        id: "command:export-pdf",
        kind: "command",
      title: "PDF 추출",
      subtitle: "현재 노트를 PDF로 저장",
        onSelect: run(context.exportCurrentDocumentPdf)
      }
    );
  }

  const templateItems: CommandPaletteItem[] = context.templates.map((template) => ({
    id: `template:${template.id}`,
    kind: "template",
    title: `${template.title}로 새 노트`,
    subtitle: template.description ?? "템플릿에서 새 노트 생성",
    tags: [template.source],
    onSelect: run(() => context.openNewNoteFromTemplate(template.id))
  }));

  const pluginItems: CommandPaletteItem[] = context.plugins.flatMap((plugin) =>
    plugin.commands.map((command) => ({
      id: `plugin:${plugin.id}:${command.id}`,
      kind: "plugin" as const,
      title: command.title,
      subtitle: command.description ?? plugin.title,
      tags: ["plugin", plugin.title],
      onSelect: run(() => context.runPluginCommand(plugin, command.id))
    }))
  );

  const noteItems = searchWorkspace(context.workspaceIndex, context.query, null)
    .slice(0, 30)
    .map(
      (note): CommandPaletteItem => ({
        id: `note:${note.path}`,
        kind: "note",
        title: note.analysis.title,
        subtitle: note.name,
        tags: note.analysis.tags,
        onSelect: () => context.openFileByPath(note.path)
      })
    );

  const commandItems = [...commands, ...templateItems, ...pluginItems].filter((item) => commandMatches(item, query));
  return [...commandItems, ...noteItems].slice(0, 50);
}

function commandMatches(item: CommandPaletteItem, query: string): boolean {
  if (!query) return true;
  return (
    item.title.toLowerCase().includes(query) ||
    item.subtitle.toLowerCase().includes(query) ||
    Boolean(item.tags?.some((tag) => tag.toLowerCase().includes(query)))
  );
}

function resolveNavigationNotes(index: WorkspaceIndex | null, paths: string[]) {
  if (!index) return [];
  const notesByPath = new Map(index.notes.map((note) => [note.path, note]));
  return paths.map((path) => notesByPath.get(path)).filter((note): note is NonNullable<typeof note> => Boolean(note));
}

function readNavigationState(workspacePath: string): WorkspaceNavigationState {
  try {
    const rawValue = storageGet(navigationStorageKey(workspacePath));
    if (!rawValue) return EMPTY_NAVIGATION_STATE;
    const parsed = JSON.parse(rawValue) as Partial<WorkspaceNavigationState>;
    return {
      pinnedPaths: Array.isArray(parsed.pinnedPaths) ? parsed.pinnedPaths.filter(isString) : [],
      recentPaths: Array.isArray(parsed.recentPaths) ? parsed.recentPaths.filter(isString).slice(0, MAX_RECENT_NOTES) : []
    };
  } catch {
    return EMPTY_NAVIGATION_STATE;
  }
}

function persistNavigationState(workspacePath: string, state: WorkspaceNavigationState): void {
  storageSet(navigationStorageKey(workspacePath), JSON.stringify(state));
}

function navigationStorageKey(workspacePath: string): string {
  return `markdown-canvas:navigation:${encodeURIComponent(workspacePath)}`;
}

function readOpenDocumentPaths(workspacePath: string): string[] {
  try {
    const rawValue = storageGet(openDocumentsStorageKey(workspacePath));
    if (!rawValue) return [];
    const parsed = JSON.parse(rawValue) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isString).slice(0, MAX_OPEN_TABS) : [];
  } catch {
    return [];
  }
}

function persistOpenDocumentPaths(workspacePath: string, paths: string[]): void {
  storageSet(openDocumentsStorageKey(workspacePath), JSON.stringify(paths.slice(0, MAX_OPEN_TABS)));
}

function openDocumentsStorageKey(workspacePath: string): string {
  return `markdown-canvas:open-documents:${encodeURIComponent(workspacePath)}`;
}

function replacePathPrefix(filePath: string, previousPath: string, nextPath: string): string {
  if (filePath === previousPath) return nextPath;
  if (!isSameOrChildPath(filePath, previousPath)) return filePath;
  return `${nextPath}${filePath.slice(previousPath.length)}`;
}

function isSameOrChildPath(filePath: string, parentPath: string): boolean {
  return filePath === parentPath || filePath.startsWith(`${parentPath}\\`) || filePath.startsWith(`${parentPath}/`);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function OnboardingScreen({
  isBusy,
  onSelectWorkspace,
  onStartSample
}: {
  isBusy: boolean;
  onSelectWorkspace: () => Promise<void>;
  onStartSample: () => Promise<void>;
}): JSX.Element {
  return (
    <div className="grid flex-1 place-items-center bg-paper p-8">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 text-6xl">✍️</div>
        <h2 className="text-2xl font-bold text-ink">MarkVas</h2>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          로컬 마크다운 파일을 연결된 노트로 관리하는 에디터입니다.
          <br />
          기존 폴더를 열거나 샘플 워크스페이스로 시작해 보세요.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button className="button py-3 text-base" disabled={isBusy} onClick={() => void onSelectWorkspace()}>
            폴더 열기
          </button>
          <button className="button-secondary py-3 text-base" disabled={isBusy} onClick={() => void onStartSample()}>
            샘플 워크스페이스 시작하기
          </button>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          샘플을 선택하면 폴더를 고른 후 예제 노트들이 자동으로 생성됩니다.
        </p>
      </div>
    </div>
  );
}

function filterTopLevelNodes(nodes: FileTreeNode[]): FileTreeNode[] {
  return nodes.filter(
    (node) =>
      !nodes.some(
        (other) =>
          other.path !== node.path &&
          (node.path.startsWith(`${other.path}\\`) || node.path.startsWith(`${other.path}/`))
      )
  );
}

function assertDesktopApi(): void {
  if (!window.markdownCanvas) {
    throw new Error("Electron preload API가 연결되지 않았습니다. 앱을 다시 시작해 주세요.");
  }
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function readStoredWidth(key: string, fallback: number, min: number, max: number): number {
  const storedValue = Number(storageGet(key));
  return Number.isFinite(storedValue) ? clamp(storedValue, min, max) : fallback;
}
