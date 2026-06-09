import { app } from "electron";
import { access, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { MarkdownDocument, NoteTemplate, NoteTemplateInput } from "@markdown-canvas/shared";
import { createMarkdownWithContent } from "./file-system";

const TEMPLATE_ROOT = ".markdown-canvas/templates";
const TEMPLATE_MANIFEST = "manifest.json";

const DEFAULT_TEMPLATES: Array<Omit<NoteTemplate, "source">> = [
  {
    id: "blank-note",
    title: "빈 노트",
    description: "가볍게 시작하는 기본 마크다운 노트",
    content: `---
title: {{title}}
tags: []
template: blank-note
created: {{date}}
---

# {{title}}

`
  },
  {
    id: "meeting-note",
    title: "회의록",
    description: "안건, 결정사항, 액션 아이템을 정리하는 회의 노트",
    content: `---
title: {{title}}
tags: [meeting]
template: meeting-note
created: {{date}}
---

# {{title}}

## 참석자

- 

## 안건

- 

## 결정사항

- 

## 액션 아이템

- [ ] 
`
  },
  {
    id: "project-note",
    title: "프로젝트 메모",
    description: "목표, 범위, 다음 작업을 남기는 프로젝트 노트",
    content: `---
title: {{title}}
tags: [project]
template: project-note
created: {{date}}
---

# {{title}}

## 목표


## 범위


## 다음 작업

- [ ] 
`
  }
];

export async function readWorkspaceTemplates(workspacePath: string): Promise<NoteTemplate[]> {
  const directoryPath = await ensureTemplateDirectory(workspacePath);
  await ensureDefaultTemplates(directoryPath);
  const manifest = await readTemplateManifest(directoryPath);

  const entries = await readdir(directoryPath, { withFileTypes: true });
  const templates = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
      .map(async (entry): Promise<NoteTemplate> => {
        const filePath = path.join(directoryPath, entry.name);
        const content = await readFile(filePath, "utf8");
        const id = path.basename(entry.name, ".md");
        const manifestEntry = manifest[id];

        return {
          id,
          title: manifestEntry?.title ?? id,
          content,
          source: "workspace",
          readonly: DEFAULT_TEMPLATES.some((template) => template.id === id),
          ...(manifestEntry?.description ? { description: manifestEntry.description } : {})
        };
      })
  );

  return [...templates, ...(await readInstalledAssetTemplates())].sort((a, b) => a.title.localeCompare(b.title));
}

export async function saveWorkspaceTemplate(workspacePath: string, input: NoteTemplateInput): Promise<NoteTemplate> {
  const directoryPath = await ensureTemplateDirectory(workspacePath);
  await ensureDefaultTemplates(directoryPath);

  const id = sanitizeTemplateId(input.id || input.title);
  const manifest = await readTemplateManifest(directoryPath);
  manifest[id] = {
    title: input.title.trim() || id,
    ...(input.description?.trim() ? { description: input.description.trim() } : {})
  };

  await writeTemplateManifest(directoryPath, manifest);
  await writeFile(path.join(directoryPath, `${id}.md`), input.content, "utf8");

  return {
    id,
    title: manifest[id].title,
    content: input.content,
    source: "workspace",
    ...(manifest[id].description ? { description: manifest[id].description } : {})
  };
}

export async function deleteWorkspaceTemplate(workspacePath: string, templateId: string): Promise<void> {
  const directoryPath = await ensureTemplateDirectory(workspacePath);
  const id = sanitizeTemplateId(templateId);

  if (DEFAULT_TEMPLATES.some((template) => template.id === id)) {
    throw new Error("기본 템플릿은 삭제할 수 없습니다.");
  }

  const manifest = await readTemplateManifest(directoryPath);
  delete manifest[id];
  await writeTemplateManifest(directoryPath, manifest);
  await rm(path.join(directoryPath, `${id}.md`), { force: true });
}

export async function createMarkdownFromTemplate(
  workspacePath: string,
  title: string,
  templateId: string,
  parentPath?: string
): Promise<MarkdownDocument> {
  const templates = await readWorkspaceTemplates(workspacePath);
  const template = templates.find((item) => item.id === templateId) ?? templates[0];
  if (!template) {
    throw new Error("사용할 수 있는 템플릿이 없습니다.");
  }

  return createMarkdownWithContent(workspacePath, title, renderTemplate(template.content, title), parentPath);
}

async function ensureTemplateDirectory(workspacePath: string): Promise<string> {
  const directoryPath = path.join(workspacePath, TEMPLATE_ROOT);
  await mkdir(directoryPath, { recursive: true });
  return directoryPath;
}

async function ensureDefaultTemplates(directoryPath: string): Promise<void> {
  const manifest = await readTemplateManifest(directoryPath);
  await Promise.all(
    DEFAULT_TEMPLATES.map(async (template) => {
      const filePath = path.join(directoryPath, `${template.id}.md`);
      try {
        await access(filePath);
      } catch {
        await writeFile(filePath, template.content, "utf8");
      }
      if (!manifest[template.id]) {
        manifest[template.id] = {
          title: template.title,
          ...(template.description ? { description: template.description } : {})
        };
      }
    })
  );
  await writeTemplateManifest(directoryPath, manifest);
}

function renderTemplate(content: string, title: string): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const datetime = now.toISOString();

  return content
    .replaceAll("{{title}}", title.trim() || "Untitled")
    .replaceAll("{{date}}", date)
    .replaceAll("{{datetime}}", datetime);
}

async function readInstalledAssetTemplates(): Promise<NoteTemplate[]> {
  const assetRoot = path.join(app.getPath("userData"), "assets");

  try {
    const entries = await readdir(assetRoot, { withFileTypes: true });
    const templates = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry): Promise<NoteTemplate | null> => {
          try {
            const metadata = JSON.parse(await readFile(path.join(assetRoot, entry.name, "metadata.json"), "utf8")) as {
              template?: { id: string; title: string; description?: string; content: string };
            };
            if (!metadata.template) return null;
            return { ...metadata.template, source: "asset", readonly: true };
          } catch {
            return null;
          }
        })
    );

    return templates.filter((template): template is NoteTemplate => template !== null);
  } catch {
    return [];
  }
}

interface TemplateManifestEntry {
  title: string;
  description?: string;
}

async function readTemplateManifest(directoryPath: string): Promise<Record<string, TemplateManifestEntry>> {
  try {
    return JSON.parse(await readFile(path.join(directoryPath, TEMPLATE_MANIFEST), "utf8")) as Record<string, TemplateManifestEntry>;
  } catch {
    return {};
  }
}

async function writeTemplateManifest(directoryPath: string, manifest: Record<string, TemplateManifestEntry>): Promise<void> {
  await writeFile(path.join(directoryPath, TEMPLATE_MANIFEST), JSON.stringify(manifest, null, 2), "utf8");
}

function sanitizeTemplateId(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9가-힣_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "custom-template"
  );
}
