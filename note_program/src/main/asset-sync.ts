import { app } from "electron";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { InstalledAsset } from "@markdown-canvas/shared";

import { API_BASE_URL } from "./auth";
const CURRENT_THEME_FILE = "current-theme.css";
const TEMPLATE_ROOT = "templates";

export async function installAssetsFromStore(accessToken: string): Promise<InstalledAsset[]> {
  const response = await fetch(`${API_BASE_URL}/assets/me/installed`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Asset sync failed: ${response.status}`);
  }

  const installedAssets = (await response.json()) as InstalledAsset[];
  const assetRoot = path.join(app.getPath("userData"), "assets");
  await mkdir(assetRoot, { recursive: true });

  // 서버 활성 에셋 ID 목록
  const serverIds = new Set(installedAssets.map(({ asset }) => asset.id));

  // 로컬에 있지만 서버에서 사라진 에셋 제거 (강제 삭제/비활성화 반영)
  const localEntries = await readdir(assetRoot, { withFileTypes: true }).catch(() => []);
  await Promise.all(
    localEntries
      .filter((e) => e.isDirectory() && !serverIds.has(e.name))
      .map(async (e) => {
        await rm(path.join(assetRoot, e.name), { recursive: true, force: true });
      })
  );

  // 서버 에셋 설치/갱신
  await Promise.all(
    installedAssets.map(async ({ asset }) => {
      const assetDirectory = path.join(assetRoot, asset.id);
      await mkdir(assetDirectory, { recursive: true });
      await writeFile(path.join(assetDirectory, "metadata.json"), JSON.stringify(asset.metadata, null, 2), "utf8");

      if (asset.metadata.tokens?.editorCss) {
        await writeFile(path.join(assetDirectory, "theme.css"), asset.metadata.tokens.editorCss, "utf8");
      }

      if (asset.type === "TEMPLATE" && asset.metadata.template) {
        const templateRoot = path.join(assetRoot, TEMPLATE_ROOT);
        await mkdir(templateRoot, { recursive: true });
        await writeFile(path.join(templateRoot, `${asset.metadata.template.id}.md`), asset.metadata.template.content, "utf8");
      }

      if (asset.type === "PLUGIN" && asset.metadata.plugin?.code) {
        await writeFile(path.join(assetDirectory, asset.metadata.plugin.entryFile), asset.metadata.plugin.code, "utf8");
      }

      if (asset.type === "PLUGIN" && asset.filePath) {
        const pluginResponse = await fetch(`${API_BASE_URL}${asset.filePath}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (pluginResponse.ok) {
          await writeFile(path.join(assetDirectory, asset.metadata.entryFile ?? "plugin.js"), await pluginResponse.text(), "utf8");
        }
      }
    })
  );

  // 활성 테마가 있으면 current-theme.css 갱신, 없으면 초기화
  const themeAsset = installedAssets.find((item) => item.asset.type === "THEME" && item.asset.metadata.tokens?.editorCss);
  if (themeAsset?.asset.metadata.tokens?.editorCss) {
    await writeFile(path.join(assetRoot, CURRENT_THEME_FILE), themeAsset.asset.metadata.tokens.editorCss, "utf8");
  } else {
    await rm(path.join(assetRoot, CURRENT_THEME_FILE), { force: true });
  }

  return installedAssets;
}

export interface LocalAssetInfo {
  id: string;
  title: string;
  type: "THEME" | "TEMPLATE" | "PLUGIN";
  version?: string;
  description?: string;
  metadata: Record<string, unknown>;
}

export async function listLocalInstalledAssets(): Promise<LocalAssetInfo[]> {
  const assetRoot = path.join(app.getPath("userData"), "assets");
  try {
    const entries = await readdir(assetRoot, { withFileTypes: true });
    const results = await Promise.all(
      entries.filter((e) => e.isDirectory()).map(async (entry): Promise<LocalAssetInfo | null> => {
        try {
          const raw = await readFile(path.join(assetRoot, entry.name, "metadata.json"), "utf8");
          const meta = JSON.parse(raw) as Record<string, unknown>;
          const type: "THEME" | "TEMPLATE" | "PLUGIN" = meta.plugin ? "PLUGIN" : meta.template ? "TEMPLATE" : "THEME";
          const titleSrc = meta.plugin as Record<string, unknown> | undefined ?? meta.template as Record<string, unknown> | undefined;
          return {
            id: entry.name,
            title: (titleSrc?.title ?? meta.title ?? entry.name) as string,
            type,
            version: (meta.version ?? (titleSrc?.version)) as string | undefined,
            description: (meta.description ?? (titleSrc?.description)) as string | undefined,
            metadata: meta
          };
        } catch { return null; }
      })
    );
    return results.filter((r): r is LocalAssetInfo => r !== null);
  } catch { return []; }
}

export async function uninstallLocalAsset(assetId: string): Promise<void> {
  const assetDir = path.join(app.getPath("userData"), "assets", assetId);
  await rm(assetDir, { recursive: true, force: true });
}

export async function readCurrentThemeCss(): Promise<string> {
  const themePath = path.join(app.getPath("userData"), "assets", CURRENT_THEME_FILE);
  try {
    return await readFile(themePath, "utf8");
  } catch {
    return "";
  }
}
