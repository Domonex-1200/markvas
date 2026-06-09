import { app } from "electron";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { InstalledPlugin, PluginAction, PluginManifest, PluginRunInput, PluginRunResult } from "@markdown-canvas/shared";
import { runPluginInSandbox } from "./plugin-security";

interface PluginRecord {
  manifest: PluginManifest;
  code: string;
}

export async function readInstalledPlugins(): Promise<InstalledPlugin[]> {
  const records = await readPluginRecords();
  return records.map(({ manifest }) => ({
    id: manifest.id,
    title: manifest.title,
    version: manifest.version,
    permissions: manifest.permissions,
    commands: manifest.commands,
    ...(manifest.description ? { description: manifest.description } : {})
  }));
}

export async function runInstalledPluginCommand(input: PluginRunInput): Promise<PluginRunResult> {
  const records = await readPluginRecords();
  const record = records.find((item) => item.manifest.id === input.pluginId);
  if (!record) throw new Error("설치된 플러그인을 찾을 수 없습니다.");

  const hasCommand = record.manifest.commands.some((command) => command.id === input.commandId);
  if (!hasCommand) throw new Error("플러그인 명령을 찾을 수 없습니다.");

  const result = await runPluginInSandbox(record.code, {
    commandId: input.commandId,
    document: record.manifest.permissions.includes("note:read") ? input.document : null,
    workspacePath: record.manifest.permissions.includes("workspace:read") ? input.workspacePath : null
  });

  // 반환값에서 구조화 액션 감지
  result.action = detectPluginAction(result.output);
  return result;
}

function detectPluginAction(output: unknown): PluginAction | undefined {
  if (typeof output !== "object" || output === null) return undefined;
  const obj = output as Record<string, unknown>;
  if (typeof obj.type !== "string") return undefined;

  switch (obj.type) {
    case "notice":
      return typeof obj.message === "string" ? { type: "notice", message: obj.message } : undefined;
    case "insert":
      return typeof obj.content === "string" ? { type: "insert", content: obj.content } : undefined;
    case "replace":
      return typeof obj.content === "string" ? { type: "replace", content: obj.content } : undefined;
    case "append":
      return typeof obj.content === "string" ? { type: "append", content: obj.content } : undefined;
    case "open-url":
      return typeof obj.url === "string" ? { type: "open-url", url: obj.url } : undefined;
    default:
      return undefined;
  }
}

async function readPluginRecords(): Promise<PluginRecord[]> {
  const assetRoot = path.join(app.getPath("userData"), "assets");

  try {
    const entries = await readdir(assetRoot, { withFileTypes: true });
    const records = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry): Promise<PluginRecord | null> => {
          const assetDirectory = path.join(assetRoot, entry.name);
          try {
            const metadata = JSON.parse(await readFile(path.join(assetDirectory, "metadata.json"), "utf8")) as { plugin?: PluginManifest };
            if (!metadata.plugin) return null;
            const code = await readFile(path.join(assetDirectory, metadata.plugin.entryFile), "utf8");
            return { manifest: metadata.plugin, code };
          } catch {
            return null;
          }
        })
    );

    return records.filter((record): record is PluginRecord => record !== null);
  } catch {
    return [];
  }
}
