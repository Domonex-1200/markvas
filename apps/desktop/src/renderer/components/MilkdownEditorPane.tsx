/**
 * Milkdown Crepe 기반 WYSIWYG 마크다운 에디터 패널.
 *
 * 분할 뷰에 임베드되는 구조라 floating UI(slash menu, block handles, toolbar)가
 * 컨테이너 밖으로 흘러나오는 문제를 방지하기 위해:
 * - block-edit(슬래시 메뉴 + 블록 핸들) 비활성화
 * - toolbar(선택 서식 팝업) 비활성화
 * - link-tooltip 비활성화
 * 만 사용한다. 서식은 App 툴바와 키보드 단축키로 적용.
 *
 * 부모에서 `key={document.path}` 를 사용해 문서 변경 시 재생성한다.
 */
import { useEffect, useRef } from "react";
import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/frame.css";

interface MilkdownEditorPaneProps {
  content: string;
  workspacePath?: string | null | undefined;
  isDark?: boolean | undefined;
  onChange: (markdown: string) => void;
  onDirty: () => void;
}

// 에디터 내부에서 사용할 기능 집합 (floating UI 제외)
const ACTIVE_FEATURES: Record<string, boolean> = {
  "cursor":      true,
  "list-item":   true,
  "code-mirror": true,
  "table":       true,
  "placeholder": true,
  // ── floating UI (분할 뷰에서 위치 충돌) ──
  "block-edit":   false,
  "toolbar":      false,
  "link-tooltip": false,
  "image-block":  false,
  "latex":        false,
  "top-bar":      false,
  "ai":           false,
};

export function MilkdownEditorPane({
  content,
  workspacePath,
  isDark = false,
  onChange,
  onDirty,
}: MilkdownEditorPaneProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const onDirtyRef  = useRef(onDirty);
  onChangeRef.current = onChange;
  onDirtyRef.current  = onDirty;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const crepe = new Crepe({
      root: el,
      defaultValue: content,
      features: ACTIVE_FEATURES as Record<string, boolean>,
    });

    // 콘텐츠 변경 리스너 — create() 호출 전에 등록
    crepe.on((listener) => {
      listener.markdownUpdated((_ctx, markdown, prevMarkdown) => {
        if (markdown !== prevMarkdown) {
          onChangeRef.current(markdown);
          onDirtyRef.current();
        }
      });
    });

    let alive = true;
    void crepe.create().then(() => {
      if (!alive) void crepe.destroy();
    });

    return () => {
      alive = false;
      void crepe.destroy();
    };
    // key 기반 재생성 — deps 배열 의도적으로 비움
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={`milkdown-wrapper min-h-0 flex-1 overflow-auto${isDark ? " dark" : ""}`}
    />
  );
}
