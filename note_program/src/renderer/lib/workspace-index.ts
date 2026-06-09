import type { MarkdownDocument, NoteAnalysis } from "@markdown-canvas/shared";
import { analyzeNote } from "./note-analysis";

export interface IndexedNote {
  path: string;
  name: string;
  analysis: NoteAnalysis;
  content: string;
  updatedAt: string;
}

export interface WorkspaceIndex {
  notes: IndexedNote[];
  tags: Array<{ tag: string; count: number }>;
  backlinks: Record<string, IndexedNote[]>;
}

export function buildWorkspaceIndex(documents: MarkdownDocument[]): WorkspaceIndex {
  const notes = documents
    .map((document): IndexedNote | null => {
      const analysis = analyzeNote(document);
      if (!analysis) return null;

      return {
        path: document.path,
        name: fileName(document.path),
        analysis,
        content: document.content,
        updatedAt: document.updatedAt
      };
    })
    .filter((note): note is IndexedNote => note !== null);

  return {
    notes,
    tags: collectTags(notes),
    backlinks: collectBacklinks(notes)
  };
}

export function searchWorkspace(index: WorkspaceIndex | null, query: string, selectedTag: string | null): IndexedNote[] {
  if (!index) return [];
  const normalizedQuery = query.trim().toLowerCase();

  return index.notes.filter((note) => {
    const matchesTag = !selectedTag || note.analysis.tags.includes(selectedTag);
    const matchesQuery =
      !normalizedQuery ||
      note.name.toLowerCase().includes(normalizedQuery) ||
      note.analysis.title.toLowerCase().includes(normalizedQuery) ||
      note.content.toLowerCase().includes(normalizedQuery);

    return matchesTag && matchesQuery;
  });
}

function collectTags(notes: IndexedNote[]): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  for (const note of notes) {
    for (const tag of note.analysis.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

function collectBacklinks(notes: IndexedNote[]): Record<string, IndexedNote[]> {
  const byTitle = new Map<string, IndexedNote>();
  const byName = new Map<string, IndexedNote>();
  for (const note of notes) {
    byTitle.set(note.analysis.title.toLowerCase(), note);
    byName.set(note.name.replace(/\.md$/i, "").toLowerCase(), note);
  }

  const backlinks: Record<string, IndexedNote[]> = {};
  for (const note of notes) {
    for (const link of note.analysis.links) {
      const targetKey = link.target.replace(/\.md$/i, "").toLowerCase();
      const target = byTitle.get(targetKey) ?? byName.get(targetKey);
      if (!target) continue;
      backlinks[target.path] = [...(backlinks[target.path] ?? []), note];
    }
  }

  return backlinks;
}

function fileName(filePath: string): string {
  return filePath.split(/[\\/]/).at(-1) ?? filePath;
}
