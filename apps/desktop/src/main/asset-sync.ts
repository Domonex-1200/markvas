import { app } from "electron";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { InstalledAsset } from "@markdown-canvas/shared";

const API_BASE_URL = process.env.ASSET_STORE_API_URL ?? "http://localhost:3001";
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

  const themeAsset = installedAssets.find((item) => item.asset.type === "THEME" && item.asset.metadata.tokens?.editorCss);
  if (themeAsset?.asset.metadata.tokens?.editorCss) {
    await writeFile(path.join(assetRoot, CURRENT_THEME_FILE), themeAsset.asset.metadata.tokens.editorCss, "utf8");
  }

  return installedAssets;
}

export async function readCurrentThemeCss(): Promise<string> {
  const themePath = path.join(app.getPath("userData"), "assets", CURRENT_THEME_FILE);
  try {
    return await readFile(themePath, "utf8");
  } catch {
    return "";
  }
}
