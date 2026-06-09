import { dialog } from "electron";
import { access, mkdir, readdir, readFile, rename, rm, stat, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import type { FileTreeNode, MarkdownDocument, TrashEntry } from "@markdown-canvas/shared";

const MARKDOWN_EXTENSION = ".md";
const APP_DIRECTORY = ".markdown-canvas";
const TRASH_DIRECTORY = "trash";
const BACKUP_DIRECTORY = "backups";
const MAX_BACKUPS_PER_FILE = 20;

export async function pickWorkspace(): Promise<string | null> {
  const result = await dialog.showOpenDialog({
    title: "마크다운 워크스페이스 선택",
    properties: ["openDirectory", "createDirectory"]
  });

  return result.canceled ? null : result.filePaths[0] ?? null;
}

export async function buildWorkspaceTree(workspacePath: string): Promise<FileTreeNode> {
  const rootStats = await stat(workspacePath);
  if (!rootStats.isDirectory()) {
    throw new Error("Workspace path must be a directory.");
  }

  return {
    id: workspacePath,
    name: path.basename(workspacePath),
    path: workspacePath,
    kind: "workspace",
    children: await readDirectory(workspacePath)
  };
}

export async function readWorkspaceMarkdownDocuments(workspacePath: string): Promise<MarkdownDocument[]> {
  assertInsideWorkspace(workspacePath, workspacePath);
  const tree = await buildWorkspaceTree(workspacePath);
  const markdownPaths = collectMarkdownPaths(tree);
  return Promise.all(markdownPaths.map((filePath) => readMarkdown(filePath)));
}

async function readDirectory(directoryPath: string): Promise<FileTreeNode[]> {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const nodes = await Promise.all(
    entries
      .filter((entry) => !entry.name.startsWith("."))
      .map(async (entry): Promise<FileTreeNode | null> => {
        const absolutePath = path.join(directoryPath, entry.name);

        if (entry.isDirectory()) {
          return {
            id: absolutePath,
            name: entry.name,
            path: absolutePath,
            kind: "folder",
            children: await readDirectory(absolutePath)
          };
        }

        if (entry.isFile() && path.extname(entry.name).toLowerCase() === MARKDOWN_EXTENSION) {
          return {
            id: absolutePath,
            name: entry.name,
            path: absolutePath,
            kind: "markdown"
          };
        }

        return null;
      })
  );

  return nodes
    .filter((node): node is FileTreeNode => node !== null)
    .sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name));
}

function collectMarkdownPaths(node: FileTreeNode): string[] {
  if (node.kind === "markdown") return [node.path];
  return node.children?.flatMap(collectMarkdownPaths) ?? [];
}

export async function readMarkdown(filePath: string): Promise<MarkdownDocument> {
  assertMarkdownPath(filePath);
  const [content, stats] = await Promise.all([readFile(filePath, "utf8"), stat(filePath)]);
  return {
    path: filePath,
    content,
    updatedAt: stats.mtime.toISOString()
  };
}

export async function saveMarkdown(filePath: string, content: string): Promise<MarkdownDocument> {
  assertMarkdownPath(filePath);
  await writeFileAtomic(filePath, content);
  return readMarkdown(filePath);
}

export async function createMarkdown(workspacePath: string, title: string, parentPath?: string): Promise<MarkdownDocument> {
  const safeTitle = sanitizeName(title, "Untitled");
  return createMarkdownWithContent(workspacePath, title, `# ${safeTitle}\n\n새 메모를 작성하세요.\n`, parentPath);
}

export async function createMarkdownWithContent(
  workspacePath: string,
  title: string,
  content: string,
  parentPath?: string
): Promise<MarkdownDocument> {
  const targetDirectory = parentPath ?? workspacePath;
  assertInsideWorkspace(workspacePath, targetDirectory);
  const safeTitle = sanitizeName(title, "untitled");
  const fileName = await createAvailableFileName(targetDirectory, safeTitle || "untitled", ".md");
  const filePath = path.join(targetDirectory, fileName);

  await writeFileAtomic(filePath, content);
  return readMarkdown(filePath);
}

export async function createFolder(workspacePath: string, folderName: string, parentPath?: string): Promise<void> {
  const targetDirectory = parentPath ?? workspacePath;
  assertInsideWorkspace(workspacePath, targetDirectory);
  const safeName = sanitizeName(folderName, "New Folder");
  const availableName = await createAvailableFileName(targetDirectory, safeName, "");
  const folderPath = path.join(targetDirectory, availableName);
  await mkdir(folderPath, { recursive: false });
}

export async function renameEntry(workspacePath: string, entryPath: string, nextName: string): Promise<string> {
  assertInsideWorkspace(workspacePath, entryPath);
  const parsed = path.parse(entryPath);
  const safeName = sanitizeName(nextName, parsed.name);
  const extension = parsed.ext || (nextName.toLowerCase().endsWith(".md") ? "" : "");
  const nextPath = path.join(parsed.dir, safeName.endsWith(extension) ? safeName : `${safeName}${extension}`);
  assertInsideWorkspace(workspacePath, nextPath);
  if (path.resolve(entryPath) !== path.resolve(nextPath)) {
    await assertPathAvailable(nextPath);
  }
  await rename(entryPath, nextPath);
  return nextPath;
}

export async function deleteEntry(workspacePath: string, entryPath: string): Promise<void> {
  assertInsideWorkspace(workspacePath, entryPath);
  if (path.resolve(workspacePath) === path.resolve(entryPath)) {
    throw new Error("Workspace root cannot be deleted.");
  }
  await moveEntryToTrash(workspacePath, entryPath);
}

export async function listTrashEntries(workspacePath: string): Promise<TrashEntry[]> {
  const trashRoot = path.join(workspacePath, APP_DIRECTORY, TRASH_DIRECTORY);
  assertInsideWorkspace(workspacePath, trashRoot);

  try {
    const dayDirectories = await readdir(trashRoot, { withFileTypes: true });
    const entries = await Promise.all(
      dayDirectories
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => {
          const dayPath = path.join(trashRoot, entry.name);
          const files = await readdir(dayPath, { withFileTypes: true });
          return Promise.all(
            files
              .filter((file) => file.isFile() && file.name.endsWith(".trash.json"))
              .map((file) => readTrashEntry(path.join(dayPath, file.name)))
          );
        })
    );
    return entries.flat().sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") return [];
    throw error;
  }
}

export async function restoreTrashEntry(workspacePath: string, trashedPath: string): Promise<string> {
  assertInsideTrash(workspacePath, trashedPath);
  const metadataPath = `${trashedPath}.trash.json`;
  assertInsideTrash(workspacePath, metadataPath);

  const entry = await readTrashEntry(metadataPath);
  const originalDirectory = path.dirname(entry.originalPath);
  assertInsideWorkspace(workspacePath, originalDirectory);
  await mkdir(originalDirectory, { recursive: true });

  const parsed = path.parse(entry.originalPath);
  const restoredName = await createAvailableFileName(originalDirectory, parsed.name, parsed.ext);
  const restoredPath = path.join(originalDirectory, restoredName);
  await rename(trashedPath, restoredPath);
  await rm(metadataPath, { force: true });
  return restoredPath;
}

export async function permanentlyDeleteTrashEntry(workspacePath: string, trashedPath: string): Promise<void> {
  assertInsideTrash(workspacePath, trashedPath);
  const metadataPath = `${trashedPath}.trash.json`;
  assertInsideTrash(workspacePath, metadataPath);
  await rm(trashedPath, { recursive: true, force: false });
  await rm(metadataPath, { force: true });
}

export async function moveEntry(workspacePath: string, entryPath: string, targetDirectoryPath: string): Promise<string> {
  assertInsideWorkspace(workspacePath, entryPath);
  assertInsideWorkspace(workspacePath, targetDirectoryPath);

  const [entryStats, targetStats] = await Promise.all([stat(entryPath), stat(targetDirectoryPath)]);
  if (!targetStats.isDirectory()) {
    throw new Error("Target must be a folder.");
  }

  if (path.resolve(path.dirname(entryPath)) === path.resolve(targetDirectoryPath)) {
    return entryPath;
  }

  if (path.resolve(workspacePath) === path.resolve(entryPath)) {
    throw new Error("Workspace root cannot be moved.");
  }

  if (entryStats.isDirectory()) {
    const source = path.resolve(entryPath);
    const target = path.resolve(targetDirectoryPath);
    if (target === source || target.startsWith(`${source}${path.sep}`)) {
      throw new Error("A folder cannot be moved into itself.");
    }
  }

  const parsed = path.parse(entryPath);
  const nextName = await createAvailableFileName(targetDirectoryPath, parsed.name, parsed.ext);
  const nextPath = path.join(targetDirectoryPath, nextName);
  await rename(entryPath, nextPath);
  return nextPath;
}

function assertMarkdownPath(filePath: string): void {
  if (path.extname(filePath).toLowerCase() !== MARKDOWN_EXTENSION) {
    throw new Error("Only markdown files can be opened or saved.");
  }
}

function sanitizeName(value: string, fallback: string): string {
  return (
    value
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
      .replace(/^\.+$/, fallback)
      .slice(0, 80) || fallback
  );
}

function assertInsideWorkspace(workspacePath: string, targetPath: string): void {
  const workspace = path.resolve(workspacePath);
  const target = path.resolve(targetPath);
  if (target !== workspace && !target.startsWith(`${workspace}${path.sep}`)) {
    throw new Error("Target path is outside the current workspace.");
  }
}

async function createAvailableFileName(directoryPath: string, baseName: string, extension: string): Promise<string> {
  let index = 1;
  while (true) {
    const suffix = index === 1 ? "" : ` ${index}`;
    const candidate = `${baseName}${suffix}${extension}`;
    try {
      await access(path.join(directoryPath, candidate));
      index += 1;
    } catch {
      return candidate;
    }
  }
}

async function assertPathAvailable(targetPath: string): Promise<void> {
  try {
    await access(targetPath);
    throw new Error(`이미 같은 이름의 항목이 있습니다: ${path.basename(targetPath)}`);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("이미 같은 이름")) throw error;
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") return;
    throw error;
  }
}

async function writeFileAtomic(filePath: string, content: string): Promise<void> {
  const directoryPath = path.dirname(filePath);
  const tempPath = path.join(directoryPath, `.${path.basename(filePath)}.${Date.now()}.tmp`);
  await writeFile(tempPath, content, "utf8");
  await rename(tempPath, filePath);
}

async function moveEntryToTrash(workspacePath: string, entryPath: string): Promise<void> {
  const trashRoot = path.join(workspacePath, APP_DIRECTORY, TRASH_DIRECTORY);
  const deletedAt = new Date();
  const trashBatchDirectory = path.join(trashRoot, deletedAt.toISOString().slice(0, 10));
  await mkdir(trashBatchDirectory, { recursive: true });

  const parsed = path.parse(entryPath);
  const stampedName = `${parsed.name}-${deletedAt.getTime()}${parsed.ext}`;
  const trashedPath = path.join(trashBatchDirectory, stampedName);
  await rename(entryPath, trashedPath);

  const metadata = {
    originalPath: entryPath,
    trashedPath,
    deletedAt: deletedAt.toISOString()
  };
  await writeFileAtomic(`${trashedPath}.trash.json`, JSON.stringify(metadata, null, 2));
}

async function readTrashEntry(metadataPath: string): Promise<TrashEntry> {
  const metadata = JSON.parse(await readFile(metadataPath, "utf8")) as {
    originalPath: string;
    trashedPath: string;
    deletedAt: string;
  };
  const trashedStats = await stat(metadata.trashedPath);
  const extension = path.extname(metadata.originalPath).toLowerCase();

  return {
    id: metadata.trashedPath,
    name: path.basename(metadata.originalPath),
    originalPath: metadata.originalPath,
    trashedPath: metadata.trashedPath,
    deletedAt: metadata.deletedAt,
    kind: trashedStats.isDirectory() ? "folder" : extension === MARKDOWN_EXTENSION ? "markdown" : "file"
  };
}

function assertInsideTrash(workspacePath: string, targetPath: string): void {
  assertInsideWorkspace(workspacePath, targetPath);
  const trashRoot = path.resolve(workspacePath, APP_DIRECTORY, TRASH_DIRECTORY);
  const target = path.resolve(targetPath);
  if (target !== trashRoot && !target.startsWith(`${trashRoot}${path.sep}`)) {
    throw new Error("Target path is outside the workspace trash.");
  }
}

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp", ".avif"]);
const IMAGE_ASSETS_DIR = "assets";

// ── 백업 ────────────────────────────────────────────────────────────────────

export interface BackupEntry {
  backupPath: string;
  originalPath: string;
  savedAt: string; // ISO
}

export async function createFileBackup(workspacePath: string, filePath: string, content: string): Promise<void> {
  assertInsideWorkspace(workspacePath, filePath);

  const now = new Date();
  const datePart = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const timePart = now.toISOString().slice(11, 19).replace(/:/g, "-"); // HH-MM-SS

  const backupDir = path.join(workspacePath, APP_DIRECTORY, BACKUP_DIRECTORY, datePart);
  await mkdir(backupDir, { recursive: true });

  const basename = path.basename(filePath, MARKDOWN_EXTENSION);
  const backupFilename = `${timePart}_${basename}.md`;
  const backupPath = path.join(backupDir, backupFilename);

  await writeFile(backupPath, content, "utf8");

  // 오래된 백업 정리 (파일당 최대 MAX_BACKUPS_PER_FILE개 유지)
  await pruneOldBackups(workspacePath, basename);
}

async function pruneOldBackups(workspacePath: string, basename: string): Promise<void> {
  const backupRoot = path.join(workspacePath, APP_DIRECTORY, BACKUP_DIRECTORY);
  const pattern = `_${basename}.md`;

  // 날짜 폴더 전체 순회하며 해당 파일의 백업 목록 수집
  const allBackups: { mtime: number; fullPath: string }[] = [];
  try {
    const dateDirs = await readdir(backupRoot);
    await Promise.all(
      dateDirs.map(async (dateDir) => {
        const dateDirPath = path.join(backupRoot, dateDir);
        const files = await readdir(dateDirPath).catch(() => [] as string[]);
        await Promise.all(
          files
            .filter((f) => f.endsWith(pattern))
            .map(async (f) => {
              const fullPath = path.join(dateDirPath, f);
              const s = await stat(fullPath).catch(() => null);
              if (s) allBackups.push({ mtime: s.mtimeMs, fullPath });
            })
        );
      })
    );
  } catch {
    return;
  }

  // 오래된 것부터 삭제
  if (allBackups.length > MAX_BACKUPS_PER_FILE) {
    allBackups.sort((a, b) => a.mtime - b.mtime);
    const toDelete = allBackups.slice(0, allBackups.length - MAX_BACKUPS_PER_FILE);
    await Promise.all(toDelete.map(({ fullPath }) => rm(fullPath, { force: true })));
  }
}

export async function listFileBackups(workspacePath: string, filePath: string): Promise<BackupEntry[]> {
  assertInsideWorkspace(workspacePath, filePath);
  const basename = path.basename(filePath, MARKDOWN_EXTENSION);
  const pattern = `_${basename}.md`;
  const backupRoot = path.join(workspacePath, APP_DIRECTORY, BACKUP_DIRECTORY);

  const results: BackupEntry[] = [];
  try {
    const dateDirs = (await readdir(backupRoot)).sort().reverse(); // 최신 날짜 먼저
    await Promise.all(
      dateDirs.map(async (dateDir) => {
        const dateDirPath = path.join(backupRoot, dateDir);
        const files = (await readdir(dateDirPath).catch(() => [] as string[])).sort().reverse();
        files
          .filter((f) => f.endsWith(pattern))
          .forEach((f) => {
            const timePart = f.split("_")[0] ?? ""; // HH-MM-SS
            const isoTime = `${dateDir}T${timePart.replace(/-/g, ":")}`;
            results.push({
              backupPath: path.join(dateDirPath, f),
              originalPath: filePath,
              savedAt: isoTime,
            });
          });
      })
    );
  } catch {
    return [];
  }

  return results.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export async function readBackupContent(backupPath: string): Promise<string> {
  return readFile(backupPath, "utf8");
}

export function isImageExtension(ext: string): boolean {
  return IMAGE_EXTENSIONS.has(ext.toLowerCase());
}

/**
 * Save image binary data to {workspace}/assets/ and return the relative markdown path.
 * Handles duplicate filenames by appending a numeric suffix.
 */
export async function saveImageFile(workspacePath: string, filename: string, data: Uint8Array): Promise<string> {
  assertInsideWorkspace(workspacePath, workspacePath);

  const ext = path.extname(filename).toLowerCase();
  if (!isImageExtension(ext)) throw new Error("지원하지 않는 이미지 형식입니다.");

  const assetsDir = path.join(workspacePath, IMAGE_ASSETS_DIR);
  await mkdir(assetsDir, { recursive: true });

  const safeBase = sanitizeName(path.basename(filename, ext), "image");
  const availableName = await createAvailableFileName(assetsDir, safeBase, ext);
  const destPath = path.join(assetsDir, availableName);

  await writeFile(destPath, data);

  return `${IMAGE_ASSETS_DIR}/${availableName}`;
}
