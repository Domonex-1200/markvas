import { useEffect, useRef, useState } from "react";
import { forceCenter, forceLink, forceManyBody, forceSimulation, forceCollide } from "d3-force";
import type { SimulationNodeDatum, SimulationLinkDatum } from "d3-force";
import { Network, X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import type { IndexedNote, WorkspaceIndex } from "../lib/workspace-index";

interface GraphNode extends SimulationNodeDatum {
  id: string;
  title: string;
  path: string;
  linkCount: number;
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: GraphNode;
  target: GraphNode;
}

interface GraphViewModalProps {
  isOpen: boolean;
  index: WorkspaceIndex | null;
  activePath?: string | undefined;
  onClose: () => void;
  onOpenNote: (path: string) => Promise<void>;
}

const NODE_BASE_RADIUS = 8;
const NODE_MAX_RADIUS = 22;
const LINK_COLOR = "#d8ddd6";
const NODE_COLOR = "#2b7a78";
const NODE_ACTIVE_COLOR = "#d66a50";
const NODE_HOVER_COLOR = "#1a5f5d";
const LABEL_COLOR = "#1c2430";

export function GraphViewModal({
  isOpen,
  index,
  activePath,
  onClose,
  onOpenNote,
}: GraphViewModalProps): JSX.Element | null {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });

  // 시뮬레이션 빌드
  useEffect(() => {
    if (!isOpen || !index || index.notes.length === 0) return;

    // 링크 맵 구성
    const linkSet = new Set<string>();
    const linkData: Array<{ source: string; target: string }> = [];
    const connectionCount = new Map<string, number>();

    for (const note of index.notes) {
      for (const link of note.analysis.links) {
        const targetNote = resolveLink(link.target, index);
        if (!targetNote || targetNote.path === note.path) continue;
        const key = [note.path, targetNote.path].sort().join("|");
        if (!linkSet.has(key)) {
          linkSet.add(key);
          linkData.push({ source: note.path, target: targetNote.path });
          connectionCount.set(note.path, (connectionCount.get(note.path) ?? 0) + 1);
          connectionCount.set(targetNote.path, (connectionCount.get(targetNote.path) ?? 0) + 1);
        }
      }
    }

    const maxLinks = Math.max(1, ...connectionCount.values());

    const initialNodes: GraphNode[] = index.notes.map((note) => ({
      id: note.path,
      title: note.analysis.title || note.name,
      path: note.path,
      linkCount: connectionCount.get(note.path) ?? 0,
      x: Math.random() * 600 - 300,
      y: Math.random() * 400 - 200,
    }));

    const nodeMap = new Map(initialNodes.map((n) => [n.id, n]));
    const initialLinks: GraphLink[] = linkData
      .map((l) => {
        const s = nodeMap.get(l.source);
        const t = nodeMap.get(l.target);
        if (!s || !t) return null;
        return { source: s, target: t };
      })
      .filter((l): l is GraphLink => l !== null);

    const sim = forceSimulation<GraphNode>(initialNodes)
      .force("link", forceLink<GraphNode, GraphLink>(initialLinks).id((d) => d.id).distance(90).strength(0.4))
      .force("charge", forceManyBody<GraphNode>().strength(-220))
      .force("center", forceCenter(0, 0))
      .force(
        "collide",
        forceCollide<GraphNode>((d) => nodeRadius(d.linkCount, maxLinks) + 4)
      )
      .alphaDecay(0.03);

    // 시뮬레이션을 빠르게 워밍업
    for (let i = 0; i < 120; i++) sim.tick();

    setNodes([...initialNodes]);
    setLinks([...initialLinks]);

    sim.on("tick", () => {
      setNodes((prev) => prev.map((n) => ({ ...n, x: n.x, y: n.y })));
    });

    return () => {
      sim.stop();
    };
  }, [isOpen, index]);

  // 줌/패닝 리셋 on open
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setHoveredNode(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const maxLinks = Math.max(1, ...nodes.map((n) => n.linkCount));

  function handleWheel(e: React.WheelEvent): void {
    e.preventDefault();
    setZoom((z) => Math.max(0.3, Math.min(3, z - e.deltaY * 0.001)));
  }

  function handleMouseDown(e: React.MouseEvent): void {
    if (e.button !== 0) return;
    isPanning.current = true;
    lastPan.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseMove(e: React.MouseEvent): void {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPan.current.x;
    const dy = e.clientY - lastPan.current.y;
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
    lastPan.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseUp(): void {
    isPanning.current = false;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30" onMouseUp={handleMouseUp}>
      <div className="flex h-full flex-col bg-paper">
        {/* 헤더 */}
        <header className="flex h-12 items-center gap-3 border-b border-line bg-white px-4">
          <Network size={17} />
          <h2 className="flex-1 text-sm font-bold">노트 연결 그래프</h2>
          <span className="text-xs text-slate-500">{nodes.length}개 노트 · {links.length}개 연결</span>
          <div className="flex items-center gap-1">
            <button className="icon-button h-8 w-8" title="축소" type="button" onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))}>
              <ZoomOut size={15} />
            </button>
            <span className="w-10 text-center text-xs font-semibold">{Math.round(zoom * 100)}%</span>
            <button className="icon-button h-8 w-8" title="확대" type="button" onClick={() => setZoom((z) => Math.min(3, z + 0.15))}>
              <ZoomIn size={15} />
            </button>
            <button className="icon-button h-8 w-8 ml-1" title="초기화" type="button" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
              <Maximize2 size={15} />
            </button>
          </div>
          <button className="icon-button h-8 w-8" title="닫기" type="button" onClick={onClose}>
            <X size={17} />
          </button>
        </header>

        {/* 그래프 */}
        <div
          ref={containerRef}
          className="relative min-h-0 flex-1 cursor-grab overflow-hidden active:cursor-grabbing"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {nodes.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-slate-500">
              노트가 없거나 연결이 없습니다.
            </div>
          ) : (
            <svg
              ref={svgRef}
              className="h-full w-full select-none"
            >
              <g transform={`translate(${(containerRef.current?.offsetWidth ?? 800) / 2 + pan.x},${(containerRef.current?.offsetHeight ?? 600) / 2 + pan.y}) scale(${zoom})`}>
                {/* 엣지 */}
                {links.map((link, i) => (
                  <line
                    key={i}
                    x1={link.source.x ?? 0}
                    y1={link.source.y ?? 0}
                    x2={link.target.x ?? 0}
                    y2={link.target.y ?? 0}
                    stroke={LINK_COLOR}
                    strokeWidth={1.5}
                  />
                ))}
                {/* 노드 */}
                {nodes.map((node) => {
                  const r = nodeRadius(node.linkCount, maxLinks);
                  const isActive = node.path === activePath;
                  const isHovered = hoveredNode?.path === node.path;
                  const fill = isActive ? NODE_ACTIVE_COLOR : isHovered ? NODE_HOVER_COLOR : NODE_COLOR;
                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x ?? 0},${node.y ?? 0})`}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHoveredNode(node)}
                      onMouseLeave={() => setHoveredNode(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        void onOpenNote(node.path).then(onClose);
                      }}
                    >
                      <circle r={r} fill={fill} fillOpacity={0.9} />
                      {(isHovered || isActive || node.linkCount > 2) && (
                        <text
                          textAnchor="middle"
                          dy={r + 13}
                          fontSize={11}
                          fill={LABEL_COLOR}
                          style={{ pointerEvents: "none" }}
                        >
                          {node.title.length > 18 ? node.title.slice(0, 18) + "…" : node.title}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
          )}

          {/* 호버 툴팁 */}
          {hoveredNode && (
            <div className="pointer-events-none absolute bottom-4 left-4 rounded border border-line bg-white px-3 py-2 text-xs shadow-md">
              <p className="font-semibold">{hoveredNode.title}</p>
              <p className="mt-0.5 text-slate-500">{hoveredNode.linkCount}개 연결 · 클릭하여 열기</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function nodeRadius(linkCount: number, maxLinks: number): number {
  if (maxLinks === 0) return NODE_BASE_RADIUS;
  return NODE_BASE_RADIUS + ((linkCount / maxLinks) * (NODE_MAX_RADIUS - NODE_BASE_RADIUS));
}

function resolveLink(target: string, index: WorkspaceIndex): IndexedNote | undefined {
  const t = target.replace(/\.md$/i, "").toLowerCase();
  return index.notes.find(
    (n) =>
      n.name.replace(/\.md$/i, "").toLowerCase() === t ||
      n.analysis.title.toLowerCase() === t
  );
}
