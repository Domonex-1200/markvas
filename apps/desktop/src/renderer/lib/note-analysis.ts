import type { MarkdownDocument, NoteAnalysis, NoteFrontmatter, NoteLink } from "@markdown-canvas/shared";

const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const tagPattern = /(^|\s)#([A-Za-z0-9가-힣_-]+)/g;
const wikilinkPattern = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

export function analyzeNote(document: MarkdownDocument | null): NoteAnalysis | null {
  if (!document) return null;

  const { body, frontmatter } = extractFrontmatter(document.content);
  const title = frontmatter.title ?? extractHeading(body) ?? fileNameToTitle(document.path);
  const tags = unique([...(frontmatter.tags ?? []), ...extractTags(body)]);
  const links = [...extractWikiLinks(body), ...extractMarkdownLinks(body)];
  const words = body.replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/).filter(Boolean);

  return {
    title,
    frontmatter,
    tags,
    links,
    wordCount: words.length,
    characterCount: body.replace(/\s/g, "").length
  };
}

function extractFrontmatter(content: string): { body: string; frontmatter: NoteFrontmatter } {
  const match = content.match(frontmatterPattern);
  if (!match?.[1]) return { body: content, frontmatter: {} };

  return {
    body: content.slice(match[0].length),
    frontmatter: parseFrontmatter(match[1])
  };
}

function parseFrontmatter(raw: string): NoteFrontmatter {
  return raw.split(/\r?\n/).reduce<NoteFrontmatter>((metadata, line) => {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) return metadata;

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    if (!key) return metadata;

    if (rawValue.startsWith("[") && rawValue.endsWith("]")) {
      metadata[key] = rawValue
        .slice(1, -1)
        .split(",")
        .map((value) => value.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
      return metadata;
    }

    metadata[key] = rawValue.replace(/^["']|["']$/g, "");
    return metadata;
  }, {});
}

function extractHeading(content: string): string | undefined {
  return content.match(/^#\s+(.+)$/m)?.[1]?.trim();
}

function extractTags(content: string): string[] {
  return [...content.matchAll(tagPattern)].map((match) => match[2]).filter((tag): tag is string => Boolean(tag));
}

function extractWikiLinks(content: string): NoteLink[] {
  return [...content.matchAll(wikilinkPattern)].map((match) => ({
    target: match[1]?.trim() ?? "",
    label: match[2]?.trim() || match[1]?.trim() || "",
    kind: "wikilink"
  }));
}

function extractMarkdownLinks(content: string): NoteLink[] {
  return [...content.matchAll(markdownLinkPattern)].map((match) => ({
    label: match[1]?.trim() ?? "",
    target: match[2]?.trim() ?? "",
    kind: "markdown"
  }));
}

function fileNameToTitle(filePath: string): string {
  return filePath.split(/[\\/]/).at(-1)?.replace(/\.md$/i, "") ?? "Untitled";
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
