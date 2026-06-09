const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function rewriteTagsInFrontmatterBlock(block: string, transform: (tags: string[]) => string[]): string {
  return block.replace(/^(tags\s*:\s*)\[([^\]]*)\]/m, (_, prefix: string, tagsPart: string) => {
    const tags = tagsPart
      .split(",")
      .map((t) => t.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
    const next = transform(tags);
    return `${prefix}[${next.join(", ")}]`;
  });
}

export function renameTagInContent(content: string, oldTag: string, newTag: string): string {
  const fmMatch = content.match(FRONTMATTER_RE);
  const tagRe = new RegExp(`((?:^|[\\s]))#${escapeRegex(oldTag)}(?=[^A-Za-z0-9가-힣_-]|$)`, "gm");

  if (fmMatch) {
    const fmBlock = fmMatch[0];
    const body = content.slice(fmBlock.length);
    return rewriteTagsInFrontmatterBlock(fmBlock, (tags) => tags.map((t) => (t === oldTag ? newTag : t))) +
      body.replace(tagRe, `$1#${newTag}`);
  }

  return content.replace(tagRe, `$1#${newTag}`);
}

export function removeTagFromContent(content: string, tag: string): string {
  const fmMatch = content.match(FRONTMATTER_RE);
  const tagRe = new RegExp(`((?:^|[\\s]))#${escapeRegex(tag)}(?=[^A-Za-z0-9가-힣_-]|$)`, "gm");

  if (fmMatch) {
    const fmBlock = fmMatch[0];
    const body = content.slice(fmBlock.length);
    return rewriteTagsInFrontmatterBlock(fmBlock, (tags) => tags.filter((t) => t !== tag)) +
      body.replace(tagRe, "$1");
  }

  return content.replace(tagRe, "$1");
}
