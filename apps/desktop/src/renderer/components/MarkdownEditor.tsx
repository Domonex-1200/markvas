import { useEffect, useMemo, useRef, useState } from "react";
import type { ClipboardEvent, DragEvent, KeyboardEvent, MouseEvent as ReactMouseEvent } from "react";
import type { MarkdownDocument } from "@markdown-canvas/shared";
import {
  Bold,
  CalendarDays,
  CheckSquare,
  Code2,
  Columns2,
  Command,
  Eye,
  EyeOff,
  GripVertical,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Search,
  SquareCode,
  Strikethrough,
  Table2
} from "lucide-react";
import { normalizeMarkdownContent, renderMarkdownPreview, toggleCheckboxInContent } from "../lib/markdown";
import { FindReplaceBar, computeSearchMatches } from "./FindReplaceBar";
import type { SearchMatch } from "./FindReplaceBar";
import {
  WikiLinkAutocomplete,
  detectWikiTrigger,
  filterNotesByQuery,
  getCaretPixelPos,
} from "./WikiLinkAutocomplete";
import { MilkdownEditorPane } from "./MilkdownEditorPane";
import type { WikiTrigger } from "./WikiLinkAutocomplete";
import type { IndexedNote } from "../lib/workspace-index";

const IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml", "image/bmp", "image/avif"]);
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp", ".avif"]);

function isImageFile(name: string): boolean {
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

interface MarkdownEditorProps {
  document: MarkdownDocument | null;
  themeCss: string;
  initialViewMode?: EditorViewMode;
  autoSaveDelayMs?: number;
  initialPreviewWidth?: number;
  workspacePath?: string | null;
  notes?: IndexedNote[];
  wysiwygMode?: boolean;
  isDark?: boolean;
  onChange: (filePath: string, content: string) => Promise<void>;
  onDirty: () => void;
  onPreviewWidthChange?: (width: number) => void;
  onOpenInternalLink?: (target: string) => void | Promise<void>;
}

type EditorViewMode = "edit" | "split" | "preview";

type FormatAction =
  | "bold"
  | "italic"
  | "strike"
  | "highlight"
  | "h1"
  | "h2"
  | "h3"
  | "quote"
  | "bullet-list"
  | "ordered-list"
  | "check-list"
  | "inline-code"
  | "code-block"
  | "link"
  | "table"
  | "divider"
  | "date";

interface FormatCommand {
  action: FormatAction;
  label: string;
  description: string;
  shortcut?: string;
  keywords: string[];
  icon: JSX.Element;
}

interface FormatResult {
  content: string;
  selectionStart: number;
  selectionEnd: number;
}

const formatCommands: FormatCommand[] = [
  { action: "bold", label: "굵게", description: "선택 영역을 굵게 표시합니다.", shortcut: "Ctrl+B", keywords: ["bold", "strong"], icon: <Bold size={16} /> },
  { action: "italic", label: "기울임", description: "선택 영역을 기울임으로 표시합니다.", shortcut: "Ctrl+I", keywords: ["italic"], icon: <Italic size={16} /> },
  { action: "strike", label: "취소선", description: "선택 영역에 취소선을 적용합니다.", shortcut: "Ctrl+Shift+X", keywords: ["strike"], icon: <Strikethrough size={16} /> },
  { action: "highlight", label: "강조", description: "선택 영역을 강조 표시합니다.", shortcut: "Ctrl+Shift+H", keywords: ["highlight", "mark"], icon: <Highlighter size={16} /> },
  { action: "inline-code", label: "인라인 코드", description: "짧은 코드나 키워드를 표시합니다.", shortcut: "Ctrl+`", keywords: ["code", "inline"], icon: <Code2 size={16} /> },
  { action: "h1", label: "제목 1", description: "큰 제목으로 변경합니다.", shortcut: "Ctrl+Alt+1", keywords: ["heading", "h1"], icon: <Heading1 size={16} /> },
  { action: "h2", label: "제목 2", description: "중간 제목으로 변경합니다.", shortcut: "Ctrl+Alt+2", keywords: ["heading", "h2"], icon: <Heading2 size={16} /> },
  { action: "h3", label: "제목 3", description: "작은 제목으로 변경합니다.", shortcut: "Ctrl+Alt+3", keywords: ["heading", "h3"], icon: <Heading3 size={16} /> },
  { action: "quote", label: "인용", description: "문장을 인용 블록으로 변경합니다.", keywords: ["quote"], icon: <Quote size={16} /> },
  { action: "bullet-list", label: "글머리 목록", description: "불릿 목록을 만듭니다.", shortcut: "Ctrl+Shift+8", keywords: ["bullet", "list"], icon: <List size={16} /> },
  { action: "ordered-list", label: "번호 목록", description: "번호 목록을 만듭니다.", shortcut: "Ctrl+Shift+7", keywords: ["ordered", "list"], icon: <ListOrdered size={16} /> },
  { action: "check-list", label: "체크리스트", description: "할 일 목록을 만듭니다.", shortcut: "Ctrl+Shift+9", keywords: ["todo", "check"], icon: <CheckSquare size={16} /> },
  { action: "link", label: "링크", description: "링크 문법을 삽입합니다.", shortcut: "Ctrl+K", keywords: ["link", "url"], icon: <Link2 size={16} /> },
  { action: "code-block", label: "코드 블록", description: "여러 줄 코드 블록을 삽입합니다.", keywords: ["code", "block"], icon: <SquareCode size={16} /> },
  { action: "table", label: "표", description: "기본 표를 삽입합니다.", keywords: ["table"], icon: <Table2 size={16} /> },
  { action: "divider", label: "구분선", description: "문단 사이에 구분선을 삽입합니다.", keywords: ["hr", "divider"], icon: <Minus size={16} /> },
  { action: "date", label: "오늘 날짜", description: "오늘 날짜를 삽입합니다.", keywords: ["date", "today"], icon: <CalendarDays size={16} /> }
];

const pinnedToolbarActions: FormatAction[] = ["bold", "italic", "h1", "h2", "bullet-list", "check-list", "link", "table"];

export function MarkdownEditor({
  document,
  themeCss,
  initialViewMode,
  autoSaveDelayMs,
  initialPreviewWidth,
  workspacePath,
  notes = [],
  wysiwygMode = false,
  isDark = false,
  onChange,
  onDirty,
  onPreviewWidthChange,
  onOpenInternalLink
}: MarkdownEditorProps): JSX.Element {
  const [content, setContent] = useState("");
  const [viewMode, setViewMode] = useState<EditorViewMode>(initialViewMode ?? "split");
  const [previewWidth, setPreviewWidth] = useState(initialPreviewWidth ?? 50);
  const [isFormatMenuOpen, setIsFormatMenuOpen] = useState(false);
  const [formatQuery, setFormatQuery] = useState("");
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

  // Find & Replace
  const [isFindOpen, setIsFindOpen] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [isReplaceVisible, setIsReplaceVisible] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Image drag state
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  // Wiki-link autocomplete
  const [wikiTrigger, setWikiTrigger] = useState<WikiTrigger | null>(null);
  const [wikiSelectedIndex, setWikiSelectedIndex] = useState(0);
  const [wikiDropdownStyle, setWikiDropdownStyle] = useState<React.CSSProperties>({});
  const wikiFilteredNotes = useMemo(
    () => (wikiTrigger ? filterNotesByQuery(notes, wikiTrigger.query) : []),
    [wikiTrigger?.query, notes]
  );

  const shellRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewSectionRef = useRef<HTMLDivElement>(null);  // 스크롤 동기화용
  const saveTimerRef = useRef<number | null>(null);
  const latestDraftRef = useRef<{ filePath: string; content: string } | null>(null);
  const latestPreviewWidthRef = useRef(initialPreviewWidth ?? 50);
  const syncingScroll = useRef(false); // 재귀 방지

  const filteredCommands = useMemo(() => {
    const query = formatQuery.trim().toLowerCase();
    if (!query) return formatCommands;
    return formatCommands.filter((command) =>
      [command.label, command.description, command.shortcut ?? "", ...command.keywords].some((value) => value.toLowerCase().includes(query))
    );
  }, [formatQuery]);

  // Word / char / reading stats
  const contentStats = useMemo(() => {
    if (!content) return { words: 0, chars: 0, lines: 0, readMin: 0 };
    const words = content.replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/).filter(Boolean).length;
    const chars = content.replace(/\s/g, "").length;
    const lines = content.split("\n").length;
    const readMin = Math.max(1, Math.round(words / 250));
    return { words, chars, lines, readMin };
  }, [content]);

  // Search matches (computed from current content + query)
  const matches = useMemo<SearchMatch[]>(
    () => computeSearchMatches(content, findQuery, isCaseSensitive),
    [content, findQuery, isCaseSensitive]
  );

  // Preview HTML (includes basePath for image resolution)
  const previewHtml = useMemo(
    () => renderMarkdownPreview(content, document?.path ? { basePath: document.path } : undefined),
    [content, document?.path]
  );

  useEffect(() => {
    flushPendingSave();
    setContent(document ? normalizeMarkdownContent(document.content) : "");
    latestDraftRef.current = null;
    // Reset find bar on document change
    setIsFindOpen(false);
    setFindQuery("");
    setCurrentMatchIndex(0);

    return () => flushPendingSave();
  }, [document?.path]);

  useEffect(() => {
    setSelectedCommandIndex(0);
  }, [formatQuery]);

  // 현재 검색 매치를 textarea에서 선택/스크롤
  useEffect(() => {
    if (!isFindOpen || matches.length === 0 || !textareaRef.current) return;
    const safeIndex = Math.min(currentMatchIndex, matches.length - 1);
    const match = matches[safeIndex];
    if (!match) return;

    const ta = textareaRef.current;
    ta.focus();
    ta.setSelectionRange(match.start, match.end);

    // 해당 줄이 보이도록 스크롤 (행 높이 28px 기준)
    const linesBefore = content.slice(0, match.start).split("\n").length - 1;
    const lineHeight = 28;
    ta.scrollTop = Math.max(0, (linesBefore - 3) * lineHeight);
  }, [currentMatchIndex, matches, isFindOpen]);

  useEffect(() => {
    if (!isFormatMenuOpen) return;

    function closeOnOutsideClick(event: PointerEvent): void {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (menuRef.current?.contains(target)) return;
      if (target.closest("[data-format-menu-trigger='true']")) return;
      setIsFormatMenuOpen(false);
    }

    window.addEventListener("pointerdown", closeOnOutsideClick);
    return () => window.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [isFormatMenuOpen]);

  function updateContent(nextContent: string): void {
    const normalizedContent = normalizeMarkdownContent(nextContent);
    setContent(normalizedContent);
    if (!document) return;

    onDirty();
    latestDraftRef.current = { filePath: document.path, content: normalizedContent };
    if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      commitPendingSave();
    }, autoSaveDelayMs ?? 500);
  }

  function flushPendingSave(): void {
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    commitPendingSave();
  }

  function commitPendingSave(): void {
    const draft = latestDraftRef.current;
    latestDraftRef.current = null;
    if (draft) void onChange(draft.filePath, draft.content);
  }

  // ── Wiki-link autocomplete ───────────────────────────────────────────────
  function selectWikiNote(note: IndexedNote): void {
    if (!wikiTrigger) return;
    const title = note.analysis.title || note.name.replace(/\.md$/i, "");
    const insertion = `[[${title}]]`;
    const nextContent =
      content.slice(0, wikiTrigger.triggerStart) +
      insertion +
      content.slice(wikiTrigger.caretEnd);
    updateContent(nextContent);
    setWikiTrigger(null);
    // 커서를 ]] 뒤로 이동
    window.requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      const newPos = wikiTrigger.triggerStart + insertion.length;
      ta.setSelectionRange(newPos, newPos);
      ta.focus();
    });
  }

  function handleWikiKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): boolean {
    if (!wikiTrigger || wikiFilteredNotes.length === 0) return false;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setWikiSelectedIndex((i) => Math.min(i + 1, wikiFilteredNotes.length - 1));
      return true;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setWikiSelectedIndex((i) => Math.max(i - 1, 0));
      return true;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      const note = wikiFilteredNotes[wikiSelectedIndex];
      if (note) selectWikiNote(note);
      return true;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setWikiTrigger(null);
      return true;
    }
    return false;
  }

  function handleContentChange(nextContent: string, selectionStart: number): void {
    const normalizedContent = normalizeMarkdownContent(nextContent);
    updateContent(normalizedContent);
    // 다음 렌더 사이클에 커서 위치로 트리거 감지
    window.requestAnimationFrame(() => {
      const ta = textareaRef.current;
      const pos = ta ? ta.selectionStart : selectionStart;
      const trigger = detectWikiTrigger(normalizedContent, Math.min(pos, normalizedContent.length));
      if (trigger) {
        if (!wikiTrigger || trigger.query !== wikiTrigger.query) {
          setWikiSelectedIndex(0);
        }
        setWikiTrigger(trigger);
        // 드롭다운 위치 계산
        if (ta && ta.parentElement) {
          const pxPos = getCaretPixelPos(ta, trigger.triggerStart);
          const paneRect = ta.parentElement.getBoundingClientRect();
          setWikiDropdownStyle({
            top: pxPos.top - paneRect.top,
            left: pxPos.left - paneRect.left,
          });
        }
      } else {
        setWikiTrigger(null);
      }
    });
  }

  // ── 에디터 ↔ 미리보기 스크롤 동기화 ────────────────────────────────────
  function handleEditorScroll(e: React.UIEvent<HTMLTextAreaElement>): void {
    if (syncingScroll.current || viewMode !== "split") return;
    const ta = e.currentTarget;
    const preview = previewSectionRef.current;
    if (!preview) return;
    const sourceScrollable = ta.scrollHeight - ta.clientHeight;
    const targetScrollable = preview.scrollHeight - preview.clientHeight;
    if (sourceScrollable <= 0 || targetScrollable <= 0) return;
    const ratio = ta.scrollTop / sourceScrollable;
    syncingScroll.current = true;
    preview.scrollTop = ratio * targetScrollable;
    window.requestAnimationFrame(() => { syncingScroll.current = false; });
  }

  function handlePreviewScroll(e: React.UIEvent<HTMLElement>): void {
    if (syncingScroll.current || viewMode !== "split") return;
    const section = e.currentTarget;
    const ta = textareaRef.current;
    if (!ta) return;
    const sourceScrollable = section.scrollHeight - section.clientHeight;
    const targetScrollable = ta.scrollHeight - ta.clientHeight;
    if (sourceScrollable <= 0 || targetScrollable <= 0) return;
    const ratio = section.scrollTop / sourceScrollable;
    syncingScroll.current = true;
    ta.scrollTop = ratio * targetScrollable;
    window.requestAnimationFrame(() => { syncingScroll.current = false; });
  }

  // ── Find & Replace ──────────────────────────────────────────────────────
  function openFind(): void {
    setIsFindOpen(true);
    setCurrentMatchIndex(0);
  }

  function closeFind(): void {
    setIsFindOpen(false);
    setFindQuery("");
    setReplaceQuery("");
    textareaRef.current?.focus();
  }

  function navigateNext(): void {
    if (matches.length === 0) return;
    setCurrentMatchIndex((prev) => (prev + 1) % matches.length);
  }

  function navigatePrev(): void {
    if (matches.length === 0) return;
    setCurrentMatchIndex((prev) => (prev - 1 + matches.length) % matches.length);
  }

  function replaceCurrentMatch(): void {
    if (matches.length === 0 || !document) return;
    const safeIndex = Math.min(currentMatchIndex, matches.length - 1);
    const match = matches[safeIndex];
    if (!match) return;
    const nextContent = content.slice(0, match.start) + replaceQuery + content.slice(match.end);
    updateContent(nextContent);
    // Keep index in bounds after replace (match list shrinks by 1)
    setCurrentMatchIndex((prev) => Math.min(prev, Math.max(matches.length - 2, 0)));
  }

  function replaceAllMatches(): void {
    if (matches.length === 0 || !document) return;
    // Replace from end to start so indices remain valid
    let nextContent = content;
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i]!;
      nextContent = nextContent.slice(0, match.start) + replaceQuery + nextContent.slice(match.end);
    }
    updateContent(nextContent);
    setCurrentMatchIndex(0);
  }

  // ── Image drag & drop / paste ────────────────────────────────────────────
  async function insertImageFile(file: File): Promise<void> {
    if (!workspacePath || !document) return;
    const buffer = await file.arrayBuffer();
    const relativePath = await window.markdownCanvas.saveImageToWorkspace(
      workspacePath,
      file.name,
      new Uint8Array(buffer)
    );
    const altText = file.name.replace(/\.[^.]+$/, "");
    const markdown = `![${altText}](${relativePath})`;

    const ta = textareaRef.current;
    const insertAt = ta?.selectionStart ?? content.length;
    const nextContent =
      (insertAt > 0 && content[insertAt - 1] !== "\n" ? "\n" : "") +
      content.slice(0, insertAt) +
      markdown +
      content.slice(insertAt);
    updateContent(nextContent);
  }

  function handleEditorDragOver(event: DragEvent<HTMLTextAreaElement>): void {
    const hasImage = Array.from(event.dataTransfer.items).some(
      (item) => item.kind === "file" && IMAGE_MIME_TYPES.has(item.type)
    );
    if (!hasImage) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDraggingImage(true);
  }

  function handleEditorDragLeave(): void {
    setIsDraggingImage(false);
  }

  function handleEditorDrop(event: DragEvent<HTMLTextAreaElement>): void {
    setIsDraggingImage(false);
    const files = Array.from(event.dataTransfer.files).filter((f) => isImageFile(f.name));
    if (files.length === 0) return;
    event.preventDefault();
    for (const file of files) void insertImageFile(file);
  }

  function handleEditorPaste(event: ClipboardEvent<HTMLTextAreaElement>): void {
    const items = Array.from(event.clipboardData.items);
    const imageItem = items.find((item) => IMAGE_MIME_TYPES.has(item.type));
    if (!imageItem) return;
    const file = imageItem.getAsFile();
    if (!file) return;
    event.preventDefault();
    // Create a named file from the clipboard blob
    const ext = imageItem.type.split("/")[1] ?? "png";
    const namedFile = new File([file], `clipboard-${Date.now()}.${ext}`, { type: imageItem.type });
    void insertImageFile(namedFile);
  }

  // ── Preview width resize ─────────────────────────────────────────────────
  function applyFormat(format: FormatAction): void {
    const textarea = textareaRef.current;
    if (!document || !textarea) return;

    const selection = {
      start: textarea.selectionStart,
      end: textarea.selectionEnd
    };
    const result = formatContent(content, selection, format);
    updateContent(result.content);
    setIsFormatMenuOpen(false);
    setFormatQuery("");

    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }

  function openFormatMenu(): void {
    setIsFormatMenuOpen(true);
    setFormatQuery("");
  }

  function toggleViewMode(nextMode: EditorViewMode): void {
    setViewMode((currentMode) => (currentMode === nextMode && nextMode !== "split" ? "split" : nextMode));
  }

  function handleEditorKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    // Wiki-link autocomplete navigation
    if (wikiTrigger && handleWikiKeyDown(event)) return;

    // Ctrl+F — 찾기
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
      event.preventDefault();
      openFind();
      return;
    }

    // F3 / Shift+F3 — 다음/이전 매치 (Find 열려 있을 때)
    if (event.key === "F3" && isFindOpen) {
      event.preventDefault();
      if (event.shiftKey) navigatePrev();
      else navigateNext();
      return;
    }

    // Escape — Find 닫기
    if (event.key === "Escape" && isFindOpen) {
      event.preventDefault();
      closeFind();
      return;
    }

    const shortcutAction = shortcutToFormatAction(event);
    if (shortcutAction) {
      event.preventDefault();
      applyFormat(shortcutAction);
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === "/") {
      event.preventDefault();
      openFormatMenu();
    }
  }

  function handleCommandKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Escape") {
      setIsFormatMenuOpen(false);
      textareaRef.current?.focus();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedCommandIndex((index) => Math.min(index + 1, Math.max(filteredCommands.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedCommandIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const command = filteredCommands[selectedCommandIndex];
      if (command) applyFormat(command.action);
    }
  }

  function startPreviewResize(event: ReactMouseEvent<HTMLDivElement>): void {
    if (!shellRef.current) return;
    event.preventDefault();
    const bounds = shellRef.current.getBoundingClientRect();

    function handleMouseMove(moveEvent: MouseEvent): void {
      const nextWidth = Math.min(70, Math.max(30, ((bounds.right - moveEvent.clientX) / bounds.width) * 100));
      latestPreviewWidthRef.current = nextWidth;
      setPreviewWidth(nextWidth);
    }

    function handleMouseUp(): void {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      onPreviewWidthChange?.(latestPreviewWidthRef.current);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  function handlePreviewClick(event: ReactMouseEvent<HTMLElement>): void {
    const target = event.target as HTMLElement | null;

    if (target instanceof HTMLInputElement && target.type === "checkbox" && target.dataset.checkboxIndex !== undefined) {
      event.preventDefault();
      const index = parseInt(target.dataset.checkboxIndex, 10);
      if (!isNaN(index) && document) {
        updateContent(toggleCheckboxInContent(content, index));
      }
      return;
    }

    const link = target?.closest<HTMLAnchorElement>("a[data-note-target]");
    const noteTarget = link?.dataset.noteTarget;
    if (!noteTarget || !onOpenInternalLink) return;

    event.preventDefault();
    void onOpenInternalLink(noteTarget);
  }

  if (!document) {
    return <div className="grid flex-1 place-items-center text-sm text-slate-500">마크다운 파일을 선택하면 편집기가 열립니다.</div>;
  }

  const gridTemplateColumns =
    viewMode === "split" ? `minmax(320px, ${100 - previewWidth}%) 6px minmax(320px, ${previewWidth}%)` : "minmax(0, 1fr)";

  return (
    <div className="markdown-editor-shell flex min-h-0 flex-1 flex-col" data-view-mode={viewMode} ref={shellRef}>
      <style>{themeCss}</style>
      <EditorControlBar viewMode={viewMode} onViewModeChange={toggleViewMode} onFormat={applyFormat} onOpenCommandMenu={openFormatMenu} />

      {isFindOpen && (
        <FindReplaceBar
          findQuery={findQuery}
          replaceQuery={replaceQuery}
          isCaseSensitive={isCaseSensitive}
          isReplaceVisible={isReplaceVisible}
          matchCount={matches.length}
          currentMatchIndex={Math.min(currentMatchIndex, Math.max(matches.length - 1, 0))}
          onFindQueryChange={(q) => { setFindQuery(q); setCurrentMatchIndex(0); }}
          onReplaceQueryChange={setReplaceQuery}
          onCaseSensitiveToggle={() => setIsCaseSensitive((v) => !v)}
          onToggleReplace={() => setIsReplaceVisible((v) => !v)}
          onNavigateNext={navigateNext}
          onNavigatePrev={navigatePrev}
          onReplace={replaceCurrentMatch}
          onReplaceAll={replaceAllMatches}
          onClose={closeFind}
        />
      )}

      <div className="grid min-h-0 flex-1" style={{ gridTemplateColumns }}>
        {viewMode !== "preview" && (
          <section className="markdown-editor-pane relative flex min-w-0 flex-col bg-white">
            {wysiwygMode ? (
              /* ── WYSIWYG 모드: Milkdown Crepe ── */
              <MilkdownEditorPane
                key={document.path}
                content={content}
                workspacePath={workspacePath}
                isDark={isDark}
                onChange={(md) => {
                  const normalizedMarkdown = normalizeMarkdownContent(md);
                  setContent(normalizedMarkdown);
                  if (!document) return;
                  onDirty();
                  latestDraftRef.current = { filePath: document.path, content: normalizedMarkdown };
                  if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current);
                  saveTimerRef.current = window.setTimeout(() => {
                    saveTimerRef.current = null;
                    commitPendingSave();
                  }, autoSaveDelayMs ?? 500);
                }}
                onDirty={onDirty}
              />
            ) : (
              /* ── 일반 텍스트 에디터: textarea ── */
              <>
                <textarea
                  ref={textareaRef}
                  className={`markdown-editor-textarea min-h-0 flex-1 resize-none bg-white p-8 font-mono text-sm leading-7 outline-none transition ${
                    isDraggingImage ? "ring-2 ring-inset ring-accent" : ""
                  }`}
                  value={content}
                  spellCheck={false}
                  onChange={(event) =>
                    handleContentChange(event.target.value, event.target.selectionStart)
                  }
                  onKeyDown={handleEditorKeyDown}
                  onScroll={handleEditorScroll}
                  onDragOver={handleEditorDragOver}
                  onDragLeave={handleEditorDragLeave}
                  onDrop={handleEditorDrop}
                  onPaste={handleEditorPaste}
                />
                {isDraggingImage && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-teal-50/70 text-sm font-semibold text-accent">
                    이미지를 놓으면 삽입됩니다
                  </div>
                )}
                {wikiTrigger && (
                  <WikiLinkAutocomplete
                    notes={wikiFilteredNotes}
                    query={wikiTrigger.query}
                    selectedIndex={wikiSelectedIndex}
                    style={wikiDropdownStyle}
                    onSelect={selectWikiNote}
                    onSelectedIndexChange={setWikiSelectedIndex}
                  />
                )}
              </>
            )}
            {isFormatMenuOpen && (
              <FormatCommandMenu
                refElement={menuRef}
                commands={filteredCommands}
                query={formatQuery}
                selectedIndex={selectedCommandIndex}
                onQueryChange={setFormatQuery}
                onKeyDown={handleCommandKeyDown}
                onSelect={(action) => applyFormat(action)}
                onClose={() => setIsFormatMenuOpen(false)}
              />
            )}
          </section>
        )}
        {viewMode === "split" && (
          <div className="grid cursor-col-resize place-items-center border-x border-line bg-stone-100 text-slate-400" onMouseDown={startPreviewResize}>
            <GripVertical size={16} />
          </div>
        )}
        {viewMode !== "edit" && (
          <section
            ref={previewSectionRef as React.RefObject<HTMLElement>}
            className="markdown-preview-pane min-w-0 overflow-auto bg-paper p-8"
            onScroll={handlePreviewScroll}
          >
            <article
              ref={previewRef}
              id="export-root"
              className="prose-canvas mx-auto max-w-3xl rounded bg-white p-10 shadow-sm"
              onClick={handlePreviewClick}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </section>
        )}
      </div>

      {/* 상태 표시줄 */}
      <div className="flex h-6 shrink-0 items-center gap-4 border-t border-line bg-stone-50 px-4 text-[11px] text-slate-400 select-none">
        <span>{contentStats.words.toLocaleString()}단어</span>
        <span>{contentStats.chars.toLocaleString()}자</span>
        <span>{contentStats.lines.toLocaleString()}줄</span>
        <span className="ml-auto">읽기 약 {contentStats.readMin}분</span>
      </div>
    </div>
  );
}

function EditorControlBar({
  viewMode,
  onViewModeChange,
  onFormat,
  onOpenCommandMenu
}: {
  viewMode: EditorViewMode;
  onViewModeChange: (mode: EditorViewMode) => void;
  onFormat: (format: FormatAction) => void;
  onOpenCommandMenu: () => void;
}): JSX.Element {
  const pinnedCommands = pinnedToolbarActions.map((action) => formatCommands.find((command) => command.action === action)).filter(isCommand);

  return (
    <div className="formatting-toolbar flex min-h-11 items-center justify-between gap-3 border-b border-line bg-stone-50 px-3 py-1.5">
      <div className="flex min-w-0 items-center gap-1 overflow-hidden">
        <button
          className="format-command-button"
          data-format-menu-trigger="true"
          title="서식 명령 열기 (Ctrl+/)"
          type="button"
          onClick={onOpenCommandMenu}
        >
          <Command size={16} />
        </button>
        <div className="mx-1 h-6 border-l border-line" />
        {pinnedCommands.map((command) => (
          <button
            className="format-command-button"
            data-command={command.action}
            key={command.action}
            title={`${command.label}${command.shortcut ? ` (${command.shortcut})` : ""}`}
            type="button"
            onClick={() => onFormat(command.action)}
          >
            {command.icon}
          </button>
        ))}
      </div>
      <div className="flex shrink-0 items-center rounded border border-line bg-white p-0.5">
        <button
          className={`view-mode-button ${viewMode === "edit" ? "bg-teal-50 text-accent" : ""}`}
          title="편집만 보기. 다시 누르면 분할 보기로 돌아갑니다."
          type="button"
          onClick={() => onViewModeChange("edit")}
        >
          <EyeOff size={15} />
        </button>
        <button
          className={`view-mode-button ${viewMode === "split" ? "bg-teal-50 text-accent" : ""}`}
          title="편집과 미리보기"
          type="button"
          onClick={() => onViewModeChange("split")}
        >
          <Columns2 size={15} />
        </button>
        <button
          className={`view-mode-button ${viewMode === "preview" ? "bg-teal-50 text-accent" : ""}`}
          title="미리보기만 보기. 다시 누르면 분할 보기로 돌아갑니다."
          type="button"
          onClick={() => onViewModeChange("preview")}
        >
          <Eye size={15} />
        </button>
      </div>
    </div>
  );
}

function FormatCommandMenu({
  refElement,
  commands,
  query,
  selectedIndex,
  onQueryChange,
  onKeyDown,
  onSelect,
  onClose
}: {
  refElement: React.RefObject<HTMLDivElement>;
  commands: FormatCommand[];
  query: string;
  selectedIndex: number;
  onQueryChange: (query: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSelect: (action: FormatAction) => void;
  onClose: () => void;
}): JSX.Element {
  return (
    <div className="absolute left-4 top-4 z-40 w-[420px] rounded border border-line bg-white p-2 shadow-xl" ref={refElement}>
      <div className="flex h-10 items-center gap-2 rounded border border-line px-3">
        <Search size={15} />
        <input
          autoFocus
          className="min-w-0 flex-1 text-sm outline-none"
          placeholder="서식 명령 검색 또는 단축키 사용"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={onKeyDown}
        />
        <button className="text-xs font-semibold text-slate-400" type="button" onClick={onClose}>
          Esc
        </button>
      </div>
      <div className="mt-2 max-h-80 overflow-auto">
        {commands.map((command, index) => (
          <button
            className={`flex w-full items-center gap-3 rounded px-3 py-2 text-left ${index === selectedIndex ? "bg-teal-50 text-accent" : "hover:bg-stone-50"}`}
            data-command={command.action}
            key={command.action}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(command.action)}
          >
            <span className="grid h-8 w-8 place-items-center rounded border border-line bg-white">{command.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{command.label}</span>
              <span className="block truncate text-xs text-slate-500">{command.description}</span>
            </span>
            {command.shortcut && <kbd className="rounded border border-line bg-stone-50 px-2 py-1 text-xs text-slate-500">{command.shortcut}</kbd>}
          </button>
        ))}
        {commands.length === 0 && <p className="p-3 text-sm text-slate-500">일치하는 서식 명령이 없습니다.</p>}
      </div>
    </div>
  );
}

function shortcutToFormatAction(event: KeyboardEvent<HTMLTextAreaElement>): FormatAction | null {
  const key = event.key.toLowerCase();
  const mod = event.ctrlKey || event.metaKey;
  if (!mod) return null;
  if (key === "b") return "bold";
  if (key === "i") return "italic";
  if (key === "k") return "link";
  if (key === "`") return "inline-code";
  if (event.shiftKey && key === "x") return "strike";
  if (event.shiftKey && key === "h") return "highlight";
  if (event.altKey && key === "1") return "h1";
  if (event.altKey && key === "2") return "h2";
  if (event.altKey && key === "3") return "h3";
  if (event.shiftKey && key === "8") return "bullet-list";
  if (event.shiftKey && key === "7") return "ordered-list";
  if (event.shiftKey && key === "9") return "check-list";
  return null;
}

function formatContent(content: string, selection: { start: number; end: number }, action: FormatAction): FormatResult {
  if (action === "bold") return wrapSelection(content, selection, "**", "**", "굵은 텍스트");
  if (action === "italic") return wrapSelection(content, selection, "*", "*", "기울임 텍스트");
  if (action === "strike") return wrapSelection(content, selection, "~~", "~~", "취소선 텍스트");
  if (action === "highlight") return wrapSelection(content, selection, "==", "==", "강조 텍스트");
  if (action === "inline-code") return wrapSelection(content, selection, "`", "`", "code");
  if (action === "link") return insertLink(content, selection);
  if (action === "h1") return prefixSelectedLines(content, selection, "# ");
  if (action === "h2") return prefixSelectedLines(content, selection, "## ");
  if (action === "h3") return prefixSelectedLines(content, selection, "### ");
  if (action === "quote") return prefixSelectedLines(content, selection, "> ");
  if (action === "bullet-list") return prefixSelectedLines(content, selection, "- ");
  if (action === "ordered-list") return prefixSelectedLines(content, selection, (_line, index) => `${index + 1}. `);
  if (action === "check-list") return prefixSelectedLines(content, selection, "- [ ] ");
  if (action === "code-block") return insertBlock(content, selection, "```\ncode\n```");
  if (action === "table") return insertBlock(content, selection, "| 항목 | 내용 |\n| --- | --- |\n|  |  |");
  if (action === "divider") return insertBlock(content, selection, "---");
  if (action === "date") return insertInline(content, selection, new Date().toISOString().slice(0, 10));
  return { content, selectionStart: selection.start, selectionEnd: selection.end };
}

function wrapSelection(content: string, selection: { start: number; end: number }, before: string, after: string, placeholder: string): FormatResult {
  const selected = content.slice(selection.start, selection.end) || placeholder;
  const inserted = `${before}${selected}${after}`;
  const nextContent = replaceRange(content, selection.start, selection.end, inserted);
  const selectedStart = selection.start + before.length;
  return {
    content: nextContent,
    selectionStart: selectedStart,
    selectionEnd: selectedStart + selected.length
  };
}

function insertLink(content: string, selection: { start: number; end: number }): FormatResult {
  const selected = content.slice(selection.start, selection.end) || "링크 텍스트";
  const inserted = `[${selected}](https://)`;
  const nextContent = replaceRange(content, selection.start, selection.end, inserted);
  const urlStart = selection.start + selected.length + 3;
  return {
    content: nextContent,
    selectionStart: urlStart,
    selectionEnd: urlStart + "https://".length
  };
}

function insertInline(content: string, selection: { start: number; end: number }, inserted: string): FormatResult {
  const nextContent = replaceRange(content, selection.start, selection.end, inserted);
  const nextCaret = selection.start + inserted.length;
  return { content: nextContent, selectionStart: nextCaret, selectionEnd: nextCaret };
}

function insertBlock(content: string, selection: { start: number; end: number }, block: string): FormatResult {
  const prefix = selection.start > 0 && !content.slice(0, selection.start).endsWith("\n") ? "\n\n" : "";
  const suffix = selection.end < content.length && !content.slice(selection.end).startsWith("\n") ? "\n\n" : "";
  const inserted = `${prefix}${block}${suffix}`;
  const nextContent = replaceRange(content, selection.start, selection.end, inserted);
  const blockStart = selection.start + prefix.length;
  return {
    content: nextContent,
    selectionStart: blockStart,
    selectionEnd: blockStart + block.length
  };
}

function prefixSelectedLines(
  content: string,
  selection: { start: number; end: number },
  prefix: string | ((line: string, index: number) => string)
): FormatResult {
  const lineStart = content.lastIndexOf("\n", Math.max(selection.start - 1, 0)) + 1;
  const lineEndIndex = content.indexOf("\n", selection.end);
  const lineEnd = lineEndIndex === -1 ? content.length : lineEndIndex;
  const target = content.slice(lineStart, lineEnd) || "내용";
  const lines = target.split("\n");
  const formatted = lines
    .map((line, index) => {
      const nextPrefix = typeof prefix === "function" ? prefix(line, index) : prefix;
      return line.startsWith(nextPrefix) ? line : `${nextPrefix}${line}`;
    })
    .join("\n");
  const nextContent = replaceRange(content, lineStart, lineEnd, formatted);
  return {
    content: nextContent,
    selectionStart: lineStart,
    selectionEnd: lineStart + formatted.length
  };
}

function replaceRange(content: string, start: number, end: number, replacement: string): string {
  return `${content.slice(0, start)}${replacement}${content.slice(end)}`;
}

function isCommand(command: FormatCommand | undefined): command is FormatCommand {
  return Boolean(command);
}
