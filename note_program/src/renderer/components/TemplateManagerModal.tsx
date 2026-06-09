import { useEffect, useMemo, useState } from "react";
import type { NoteTemplate, NoteTemplateInput } from "@markdown-canvas/shared";
import { Plus, Save, Trash2, X } from "lucide-react";

interface TemplateManagerModalProps {
  isOpen: boolean;
  templates: NoteTemplate[];
  onClose: () => void;
  onSave: (input: NoteTemplateInput) => Promise<void>;
  onDelete: (templateId: string) => Promise<void>;
}

interface TemplateDraft {
  id: string;
  title: string;
  description: string;
  content: string;
}

const EMPTY_TEMPLATE = `---
title: {{title}}
tags: []
template: custom-template
created: {{date}}
---

# {{title}}

`;

export function TemplateManagerModal({ isOpen, templates, onClose, onSave, onDelete }: TemplateManagerModalProps): JSX.Element | null {
  const editableTemplates = useMemo(() => templates.filter((template) => template.source === "workspace"), [templates]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState<TemplateDraft>(() => createDraft(null));

  useEffect(() => {
    if (!isOpen) return;
    const firstTemplate = editableTemplates[0] ?? null;
    setSelectedId(firstTemplate?.id ?? "");
    setDraft(createDraft(firstTemplate));
  }, [editableTemplates, isOpen]);

  if (!isOpen) return null;

  const selectedTemplate = editableTemplates.find((template) => template.id === selectedId);
  const canDelete = selectedTemplate && !selectedTemplate.readonly;

  return (
    <div className="fixed inset-0 z-50 bg-black/25 px-5 py-8">
      <section className="mx-auto flex h-full max-w-6xl overflow-hidden rounded border border-line bg-white shadow-xl">
        <aside className="flex w-72 shrink-0 flex-col border-r border-line">
          <div className="flex h-14 items-center justify-between border-b border-line px-4">
            <h2 className="text-sm font-bold">템플릿</h2>
            <button
              className="icon-button"
              title="새 템플릿"
              onClick={() => {
                setSelectedId("");
                setDraft(createDraft(null));
              }}
            >
              <Plus size={17} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-2">
            {editableTemplates.map((template) => (
              <button
                key={template.id}
                className={`block w-full rounded px-3 py-2 text-left text-sm ${
                  template.id === selectedId ? "bg-teal-50 text-accent" : "hover:bg-stone-50"
                }`}
                onClick={() => {
                  setSelectedId(template.id);
                  setDraft(createDraft(template));
                }}
              >
                <span className="block truncate font-semibold">{template.title}</span>
                <span className="block truncate text-xs text-slate-500">{template.id}</span>
              </button>
            ))}
          </div>
        </aside>

        <form
          className="flex min-w-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            void onSave({
              id: draft.id,
              title: draft.title,
              content: draft.content,
              ...(draft.description.trim() ? { description: draft.description } : {})
            });
          }}
        >
          <header className="flex h-14 items-center justify-end gap-2 border-b border-line px-4">
            <button className="icon-button" title="템플릿 삭제" type="button" disabled={!canDelete} onClick={() => void onDelete(draft.id)}>
              <Trash2 size={17} />
            </button>
            <button className="icon-button" title="저장" type="submit">
              <Save size={17} />
            </button>
            <button className="icon-button" title="닫기" type="button" onClick={onClose}>
              <X size={17} />
            </button>
          </header>

          <div className="grid gap-3 border-b border-line p-4">
            <label className="text-sm font-semibold">
              이름
              <input
                className="mt-2 h-10 w-full rounded border border-line px-3 text-sm font-normal outline-none focus:border-accent"
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              />
            </label>
            <label className="text-sm font-semibold">
              ID
              <input
                className="mt-2 h-10 w-full rounded border border-line px-3 font-mono text-sm font-normal outline-none focus:border-accent"
                value={draft.id}
                onChange={(event) => setDraft({ ...draft, id: event.target.value })}
              />
            </label>
            <label className="text-sm font-semibold">
              설명
              <input
                className="mt-2 h-10 w-full rounded border border-line px-3 text-sm font-normal outline-none focus:border-accent"
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              />
            </label>
          </div>

          <label className="flex min-h-0 flex-1 flex-col text-sm font-semibold">
            <span className="border-b border-line px-4 py-3">본문</span>
            <textarea
              className="min-h-0 flex-1 resize-none p-4 font-mono text-sm font-normal leading-7 outline-none"
              value={draft.content}
              spellCheck={false}
              onChange={(event) => setDraft({ ...draft, content: event.target.value })}
            />
          </label>
        </form>
      </section>
    </div>
  );
}

function createDraft(template: NoteTemplate | null): TemplateDraft {
  return {
    id: template?.id ?? "custom-template",
    title: template?.title ?? "커스텀 템플릿",
    description: template?.description ?? "",
    content: template?.content ?? EMPTY_TEMPLATE
  };
}
