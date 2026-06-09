/**
 * 마크다운 → PPTX 변환기.
 * --- 구분자로 슬라이드를 분리하고 pptxgenjs로 PPTX 파일을 생성합니다.
 */
import PptxGenJS from "pptxgenjs";

export interface SlideContent {
  title: string;
  bullets: string[];
  code?: string | undefined;
}

/** 마크다운을 슬라이드 배열로 파싱한다 */
export function parseSlides(markdown: string): SlideContent[] {
  const rawSlides = markdown.split(/\n---\n/).map((s) => s.trim()).filter(Boolean);

  return rawSlides.map((raw) => {
    const lines = raw.split("\n");
    let title = "";
    const bullets: string[] = [];
    const codeLines: string[] = [];
    let inCode = false;

    for (const line of lines) {
      if (line.startsWith("```")) {
        inCode = !inCode;
        continue;
      }
      if (inCode) {
        codeLines.push(line);
        continue;
      }
      if (/^#{1,3} /.test(line)) {
        title = title || line.replace(/^#{1,3} /, "").trim();
      } else if (/^[-*] /.test(line)) {
        bullets.push(line.replace(/^[-*] /, "").trim());
      } else if (/^\d+\. /.test(line)) {
        bullets.push(line.replace(/^\d+\. /, "").trim());
      } else if (line.trim()) {
        bullets.push(line.trim());
      }
    }

    return { title, bullets, code: codeLines.length > 0 ? codeLines.join("\n") : undefined };
  });
}

/** 슬라이드 수를 반환한다 (--- 구분자 기준) */
export function countSlides(markdown: string): number {
  return markdown.split(/\n---\n/).filter((s) => s.trim()).length;
}

/** PPTX 파일을 Uint8Array로 생성한다 */
export async function buildPptx(
  slides: SlideContent[],
  presentationTitle: string
): Promise<Uint8Array> {
  const pptx = new PptxGenJS();

  pptx.layout = "LAYOUT_16x9";
  pptx.title = presentationTitle;
  pptx.author = "MarkVas";

  // 기본 마스터 슬라이드 설정
  const BG = { color: "FFFFFF" };
  const TITLE_COLOR = "1c2430";
  const BODY_COLOR = "374151";
  const ACCENT = "2b7a78";

  for (const slide of slides) {
    const sl = pptx.addSlide();

    sl.background = BG;

    // 상단 강조 바
    sl.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: "100%", h: 0.07,
      fill: { color: ACCENT },
      line: { color: ACCENT },
    });

    // 제목
    sl.addText(slide.title || "제목 없음", {
      x: 0.5, y: 0.25, w: "90%", h: 1.0,
      fontSize: 32,
      bold: true,
      color: TITLE_COLOR,
      fontFace: "Malgun Gothic, sans-serif",
    });

    // 구분선
    sl.addShape(pptx.ShapeType.line, {
      x: 0.5, y: 1.3, w: "90%", h: 0,
      line: { color: "d8ddd6", width: 1 },
    });

    let yPos = 1.5;

    // 코드 블록
    if (slide.code) {
      sl.addText(slide.code, {
        x: 0.5, y: yPos, w: "90%", h: 2.5,
        fontSize: 12,
        fontFace: "Consolas, Courier New",
        color: "e5e7eb",
        fill: { color: "1c2430" },
        inset: 0.15,
      });
      yPos += 2.7;
    }

    // 본문 / 불릿
    if (slide.bullets.length > 0) {
      const bulletText = slide.bullets.map((b) => ({ text: b, options: { bullet: true, indentLevel: 0 } }));
      sl.addText(bulletText, {
        x: 0.5, y: yPos, w: "90%", h: 5.19 - yPos,
        fontSize: 18,
        color: BODY_COLOR,
        fontFace: "Malgun Gothic, sans-serif",
        lineSpacingMultiple: 1.4,
        autoFit: true,
      });
    }

    // 슬라이드 번호 (우측 하단)
    sl.addText(`${slides.indexOf(slide) + 1} / ${slides.length}`, {
      x: "80%", y: "90%", w: "18%", h: 0.3,
      fontSize: 10,
      color: "9ca3af",
      align: "right",
    });
  }

  const arrayBuffer = await pptx.write({ outputType: "arraybuffer" }) as ArrayBuffer;
  return new Uint8Array(arrayBuffer);
}
