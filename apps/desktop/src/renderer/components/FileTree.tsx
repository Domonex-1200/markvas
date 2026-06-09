import type { FileTreeNode } from "@markdown-canvas/shared";
import { ChevronDown, ChevronRight, FilePlus2, FileText, Folder, FolderPlus, Pencil, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";

interface FileTreeProps {
  tree: FileTreeNode | null;
  selectedPath: string | undefined;
  onOpenFile: (node: FileTreeNode) => void;
  onRename: (node: FileTreeNode) => void;
  onDelete: (node: FileTreeNode) => void;
  onMove: (node: FileTreeNode, targetFolder: FileTreeNode | null) => void;
  onDeleteMultiple: (nodes: FileTreeNode[]) => void;
  onMoveMultiple: (nodes: FileTreeNode[], targetFolder: FileTreeNode | null) => void;
  onCreateNoteInFolder: (folder: FileTreeNode | null) => void;
  onCreateFolderInFolder: (folder: FileTreeNode | null) => void;
}

function collectAllNodes(node: FileTreeNode): FileTreeNode[] {
  const result: FileTreeNode[] = [node];
  for (const child of node.children ?? []) {
    result.push(...collectAllNodes(child));
  }
  return result;
}

export function FileTree({
  tree,
  selectedPath,
  onOpenFile,
  onRename,
  onDelete,
  onMove,
  onDeleteMultiple,
  onMoveMultiple,
  onCreateNoteInFolder,
  onCreateFolderInFolder
}: FileTreeProps): JSX.Element {
  const [draggingNode, setDraggingNode] = useState<FileTreeNode | null>(null);
  const [dropTargetPath, setDropTargetPath] = useState<string | null>(null);
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(() => new Set());
  const [multiSelectedPaths, setMultiSelectedPaths] = useState<Set<string>>(new Set());

  const allNodes = useMemo(() => (tree ? collectAllNodes(tree) : []), [tree]);

  if (!tree) {
    return <div className="p-4 text-sm text-slate-500">왼쪽 폴더 버튼으로 마크다운 워크스페이스를 선택하세요.</div>;
  }

  function handleDrop(droppedNode: FileTreeNode, targetFolder: FileTreeNode | null): void {
    if (multiSelectedPaths.has(droppedNode.path) && multiSelectedPaths.size > 1) {
      const nodes = allNodes.filter((n) => multiSelectedPaths.has(n.path));
      onMoveMultiple(nodes, targetFolder);
      setMultiSelectedPaths(new Set());
    } else {
      onMove(droppedNode, targetFolder);
    }
  }

  function handleDelete(node: FileTreeNode): void {
    if (multiSelectedPaths.has(node.path) && multiSelectedPaths.size > 1) {
      const nodes = allNodes.filter((n) => multiSelectedPaths.has(n.path));
      onDeleteMultiple(nodes);
      setMultiSelectedPaths(new Set());
    } else {
      onDelete(node);
    }
  }

  function toggleMultiSelect(path: string): void {
    setMultiSelectedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  function clearMultiSelect(): void {
    setMultiSelectedPaths(new Set());
  }

  function handleBulkDelete(): void {
    const nodes = allNodes.filter((n) => multiSelectedPaths.has(n.path));
    onDeleteMultiple(nodes);
    setMultiSelectedPaths(new Set());
  }

  return (
    <nav
      className={`relative min-h-0 flex-1 overflow-auto p-2 ${dropTargetPath === tree.path ? "bg-teal-50" : ""}`}
      onDragOver={(event) => {
        if (!draggingNode) return;
        event.preventDefault();
        setDropTargetPath(tree.path);
      }}
      onDragLeave={(event) => {
        if ((event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) return;
        setDropTargetPath(null);
      }}
      onDrop={(event) => {
        event.preventDefault();
        if (!draggingNode) return;
        handleDrop(draggingNode, tree);
        setDraggingNode(null);
        setDropTargetPath(null);
      }}
    >
      <div className="mb-2 flex items-center gap-1 px-1">
        <button className="icon-button h-8 w-8" title="워크스페이스에 노트 만들기" type="button" onClick={() => onCreateNoteInFolder(tree)}>
          <FilePlus2 size={15} />
        </button>
        <button className="icon-button h-8 w-8" title="워크스페이스에 폴더 만들기" type="button" onClick={() => onCreateFolderInFolder(tree)}>
          <FolderPlus size={15} />
        </button>
      </div>

      {tree.children?.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          selectedPath={selectedPath}
          depth={0}
          draggingNode={draggingNode}
          dropTargetPath={dropTargetPath}
          collapsedPaths={collapsedPaths}
          multiSelectedPaths={multiSelectedPaths}
          onOpenFile={(n) => {
            clearMultiSelect();
            onOpenFile(n);
          }}
          onRename={onRename}
          onDelete={handleDelete}
          onMove={handleDrop}
          onCreateNoteInFolder={onCreateNoteInFolder}
          onCreateFolderInFolder={onCreateFolderInFolder}
          onToggleFolder={(path) => {
            setCollapsedPaths((current) => {
              const next = new Set(current);
              if (next.has(path)) next.delete(path);
              else next.add(path);
              return next;
            });
          }}
          onToggleMultiSelect={toggleMultiSelect}
          onClearMultiSelect={clearMultiSelect}
          onDragStart={setDraggingNode}
          onDropTargetChange={setDropTargetPath}
          onDragEnd={() => {
            setDraggingNode(null);
            setDropTargetPath(null);
          }}
        />
      ))}

      {multiSelectedPaths.size > 0 && (
        <div className="sticky bottom-0 border-t border-line bg-white p-2">
          <div className="flex items-center gap-2 rounded bg-blue-50 px-3 py-2 text-blue-700">
            <span className="flex-1 text-xs font-semibold">{multiSelectedPaths.size}개 선택됨</span>
            <button
              className="grid h-6 w-6 place-items-center rounded hover:bg-blue-100"
              title="선택 항목 삭제 (휴지통)"
              type="button"
              onClick={handleBulkDelete}
            >
              <Trash2 size={13} />
            </button>
            <button
              className="grid h-6 w-6 place-items-center rounded hover:bg-blue-100"
              title="선택 해제"
              type="button"
              onClick={clearMultiSelect}
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

interface TreeNodeProps {
  node: FileTreeNode;
  selectedPath: string | undefined;
  depth: number;
  draggingNode: FileTreeNode | null;
  dropTargetPath: string | null;
  collapsedPaths: Set<string>;
  multiSelectedPaths: Set<string>;
  onOpenFile: (node: FileTreeNode) => void;
  onRename: (node: FileTreeNode) => void;
  onDelete: (node: FileTreeNode) => void;
  onMove: (node: FileTreeNode, targetFolder: FileTreeNode) => void;
  onCreateNoteInFolder: (folder: FileTreeNode) => void;
  onCreateFolderInFolder: (folder: FileTreeNode) => void;
  onToggleFolder: (path: string) => void;
  onToggleMultiSelect: (path: string) => void;
  onClearMultiSelect: () => void;
  onDragStart: (node: FileTreeNode) => void;
  onDropTargetChange: (path: string | null) => void;
  onDragEnd: () => void;
}

function TreeNode({
  node,
  selectedPath,
  depth,
  draggingNode,
  dropTargetPath,
  collapsedPaths,
  multiSelectedPaths,
  onOpenFile,
  onRename,
  onDelete,
  onMove,
  onCreateNoteInFolder,
  onCreateFolderInFolder,
  onToggleFolder,
  onToggleMultiSelect,
  onClearMultiSelect,
  onDragStart,
  onDropTargetChange,
  onDragEnd
}: TreeNodeProps): JSX.Element {
  const isFolder = node.kind === "folder" || node.kind === "workspace";
  const isSelected = selectedPath === node.path;
  const isMultiSelected = multiSelectedPaths.has(node.path);
  const isDropTarget = isFolder && dropTargetPath === node.path;
  const isDragging = draggingNode?.path === node.path;
  const isCollapsed = isFolder && collapsedPaths.has(node.path);

  function handleRowClick(event: ReactMouseEvent<HTMLButtonElement>): void {
    if (event.shiftKey) {
      event.preventDefault();
      onToggleMultiSelect(node.path);
      return;
    }
    if (multiSelectedPaths.size > 0) {
      onClearMultiSelect();
    }
    if (isFolder) onToggleFolder(node.path);
    else onOpenFile(node);
  }

  const rowColorClass = isMultiSelected
    ? "bg-blue-50 text-blue-700"
    : isSelected
    ? "bg-teal-50 text-accent"
    : "hover:bg-stone-100";

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.stopPropagation();
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", node.path);
        onDragStart(node);
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        if (!isFolder || !draggingNode || draggingNode.path === node.path) return;
        event.preventDefault();
        event.stopPropagation();
        onDropTargetChange(node.path);
      }}
      onDrop={(event) => {
        if (!isFolder || !draggingNode || draggingNode.path === node.path) return;
        event.preventDefault();
        event.stopPropagation();
        onMove(draggingNode, node);
        onDragEnd();
      }}
    >
      <div
        className={`tree-row group ${rowColorClass} ${isDropTarget ? "ring-2 ring-accent ring-inset" : ""} ${isDragging ? "opacity-40" : ""}`}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        {isMultiSelected && (
          <span className="mr-1 grid h-4 w-4 shrink-0 place-items-center rounded border border-blue-400 bg-blue-400 text-white">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2.5 2.5L8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}

        <button
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={handleRowClick}
          title={`${node.path}${"\n"}Shift+클릭으로 다중 선택`}
        >
          {isFolder ? (isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />) : <FileText size={14} />}
          {isFolder && <Folder size={15} />}
          <span className={`truncate ${isFolder ? "font-semibold" : "font-medium text-ink"}`}>{node.name}</span>
        </button>

        {isFolder && (
          <>
            <button
              className="hidden h-6 w-6 place-items-center rounded hover:bg-white group-hover:grid"
              title="이 폴더에 노트 만들기"
              type="button"
              onClick={() => onCreateNoteInFolder(node)}
            >
              <FilePlus2 size={13} />
            </button>
            <button
              className="hidden h-6 w-6 place-items-center rounded hover:bg-white group-hover:grid"
              title="이 폴더에 폴더 만들기"
              type="button"
              onClick={() => onCreateFolderInFolder(node)}
            >
              <FolderPlus size={13} />
            </button>
          </>
        )}
        <button
          className="hidden h-6 w-6 place-items-center rounded hover:bg-white group-hover:grid"
          title="이름 변경"
          type="button"
          onClick={() => onRename(node)}
        >
          <Pencil size={13} />
        </button>
        <button
          className={`hidden h-6 w-6 place-items-center rounded hover:bg-white group-hover:grid ${isMultiSelected ? "text-red-500" : ""}`}
          title={isMultiSelected && multiSelectedPaths.size > 1 ? `선택된 ${multiSelectedPaths.size}개 삭제` : "삭제"}
          type="button"
          onClick={() => onDelete(node)}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {isFolder &&
        !isCollapsed &&
        node.children?.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            selectedPath={selectedPath}
            depth={depth + 1}
            draggingNode={draggingNode}
            dropTargetPath={dropTargetPath}
            collapsedPaths={collapsedPaths}
            multiSelectedPaths={multiSelectedPaths}
            onOpenFile={onOpenFile}
            onRename={onRename}
            onDelete={onDelete}
            onMove={onMove}
            onCreateNoteInFolder={onCreateNoteInFolder}
            onCreateFolderInFolder={onCreateFolderInFolder}
            onToggleFolder={onToggleFolder}
            onToggleMultiSelect={onToggleMultiSelect}
            onClearMultiSelect={onClearMultiSelect}
            onDragStart={onDragStart}
            onDropTargetChange={onDropTargetChange}
            onDragEnd={onDragEnd}
          />
        ))}
    </div>
  );
}
