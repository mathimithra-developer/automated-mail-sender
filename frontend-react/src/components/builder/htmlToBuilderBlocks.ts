import { BuilderBlock, SectionData } from './types';

/**
 * Utility functions to extract inline CSS values from HTML elements
 */
function getStyleValue(element: Element, property: string): string {
  const styleAttr = element.getAttribute('style') || '';
  const regex = new RegExp(`${property}\\s*:\\s*([^;]+)`, 'i');
  const match = styleAttr.match(regex);
  return match ? match[1].trim() : '';
}

function parseFontSize(element: Element, defaultSize: number): number {
  const style = getStyleValue(element, 'font-size');
  if (style) {
    const parsed = parseInt(style, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return defaultSize;
}

function parseColor(element: Element, defaultColor: string): string {
  const style = getStyleValue(element, 'color');
  if (style) return style;
  return defaultColor;
}

function parseBgColor(element: Element, defaultColor: string): string {
  const style = getStyleValue(element, 'background-color') || getStyleValue(element, 'background');
  if (style && style !== 'transparent') return style;
  return defaultColor;
}

function parseAlign(element: Element, defaultAlign: 'left' | 'center' | 'right'): 'left' | 'center' | 'right' {
  const style = getStyleValue(element, 'text-align') || element.getAttribute('align') || '';
  if (style.includes('center')) return 'center';
  if (style.includes('right')) return 'right';
  if (style.includes('left')) return 'left';
  return defaultAlign;
}

function parseBorderRadius(element: Element, defaultRadius: number): number {
  const style = getStyleValue(element, 'border-radius');
  if (style) {
    const parsed = parseInt(style, 10);
    if (!isNaN(parsed) && parsed >= 0) return parsed;
  }
  return defaultRadius;
}

/**
 * Recursively flattens container wrappers (tables, trs, tds, wrapper divs) to locate actual content elements.
 */
function collectContentNodes(node: Element, result: Element[] = []): Element[] {
  const tag = node.tagName.toLowerCase();

  // If node is a heading, paragraph, button link, image, hr, table, coupon box, or standalone content element
  if (
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'img', 'hr'].includes(tag) ||
    (tag === 'a' && (node.getAttribute('style')?.includes('background') || node.getAttribute('class')?.includes('btn'))) ||
    node.getAttribute('style')?.includes('dashed') ||
    node.getAttribute('data-block-type')
  ) {
    result.push(node);
    return result;
  }

  // If table/div wrapper, traverse children
  const children = Array.from(node.children);
  if (children.length > 0) {
    children.forEach((child) => collectContentNodes(child, result));
  } else if (node.textContent && node.textContent.trim().length > 0) {
    result.push(node);
  }

  return result;
}

/**
 * Converts a raw HTML string into modular native BuilderBlock objects.
 */
export function htmlToBuilderBlocks(html: string): BuilderBlock[] {
  if (!html || typeof html !== 'string') return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  const rawElements = collectContentNodes(body);
  const blocks: BuilderBlock[] = [];

  rawElements.forEach((el, index) => {
    const tag = el.tagName.toLowerCase();
    const id = `ai_block_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`;

    // 1. Heading Elements
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
      const tagType = tag as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      const defaultSizes: Record<string, number> = { h1: 28, h2: 24, h3: 20, h4: 18, h5: 16, h6: 14 };
      blocks.push({
        id,
        type: 'heading',
        content: {
          text: el.textContent?.trim() || 'Heading',
          tag: tagType,
          fontSize: parseFontSize(el, defaultSizes[tagType] || 22),
          fontWeight: '700',
          color: parseColor(el, '#18181b'),
          align: parseAlign(el, 'center'),
          letterSpacing: 0,
          lineHeight: 1.3,
        },
      });
      return;
    }

    // 2. Image Elements
    if (tag === 'img') {
      const src = el.getAttribute('src') || '';
      if (!src) return;
      const parentLink = el.parentElement?.tagName.toLowerCase() === 'a' ? el.parentElement.getAttribute('href') || '' : '';
      blocks.push({
        id,
        type: 'image',
        content: {
          url: src,
          alt: el.getAttribute('alt') || 'Image',
          linkUrl: parentLink,
          borderRadius: parseBorderRadius(el, 8),
          align: parseAlign(el, 'center'),
        },
      });
      return;
    }

    // 3. Button / CTA Link Elements
    if (tag === 'a' || (el.querySelector('a') && getStyleValue(el, 'background-color'))) {
      const anchor = tag === 'a' ? el : el.querySelector('a') || el;
      blocks.push({
        id,
        type: 'button',
        content: {
          label: anchor.textContent?.trim() || 'Click Here',
          url: anchor.getAttribute('href') || '#',
          backgroundColor: parseBgColor(el, '#8b5cf6'),
          color: parseColor(anchor, '#ffffff'),
          borderRadius: parseBorderRadius(el, 6),
          align: parseAlign(el, 'center'),
          paddingX: 24,
          paddingY: 12,
          shadow: true,
        },
      });
      return;
    }

    // 4. Divider Elements
    if (tag === 'hr') {
      blocks.push({
        id,
        type: 'divider',
        content: {
          style: 'solid',
          thickness: 1,
          color: parseColor(el, '#e2e8f0'),
          paddingTop: 16,
          paddingBottom: 16,
        },
      });
      return;
    }

    // 5. Coupon / Promo Box Elements
    if (el.getAttribute('style')?.includes('dashed') || el.textContent?.includes('OFF') || el.textContent?.includes('CODE')) {
      const codeMatch = el.textContent?.match(/[A-Z0-9]{4,12}/);
      blocks.push({
        id,
        type: 'coupon',
        content: {
          headline: 'SPECIAL PROMO OFFER',
          headlineColor: '#18181b',
          discount: '20% OFF',
          code: codeMatch ? codeMatch[0] : 'SAVE20',
          subtext: 'Use code at checkout',
          backgroundColor: parseBgColor(el, '#f8fafc'),
          borderColor: parseColor(el, '#8b5cf6'),
        },
      });
      return;
    }

    // 6. Paragraph Elements
    if (tag === 'p' || tag === 'div' || tag === 'span') {
      const text = el.textContent?.trim();
      if (!text) return;
      blocks.push({
        id,
        type: 'paragraph',
        content: {
          text: el.innerHTML || text,
          fontSize: parseFontSize(el, 15),
          color: parseColor(el, '#334155'),
          align: parseAlign(el, 'left'),
          lineHeight: 1.6,
        },
      });
      return;
    }

    // 7. Fallback: Custom HTML Block
    if (el.outerHTML && el.outerHTML.trim()) {
      blocks.push({
        id,
        type: 'html',
        content: {
          html: el.outerHTML,
        },
      });
    }
  });

  // Fallback: If no discrete blocks parsed, create a default paragraph or single html block
  if (blocks.length === 0 && html.trim()) {
    blocks.push({
      id: `ai_block_fallback_${Date.now()}`,
      type: 'html',
      content: { html },
    });
  }

  return blocks;
}

/**
 * Converts a raw HTML string into structured SectionData array for MailBuilder.
 */
export function htmlToSections(html: string): SectionData[] {
  const blocks = htmlToBuilderBlocks(html);
  if (blocks.length === 0) return [];

  // Group blocks into logical sections (e.g. 3-4 blocks per section for clean drag-and-drop structure)
  const sections: SectionData[] = [];
  const chunkSize = 4;

  for (let i = 0; i < blocks.length; i += chunkSize) {
    const chunk = blocks.slice(i, i + chunkSize);
    const secId = `sec_ai_${Date.now()}_${i}`;
    sections.push({
      id: secId,
      background: '#ffffff',
      padding: '20px 24px',
      columns: [
        {
          id: `col_${secId}_1`,
          width: '100%',
          components: chunk,
        },
      ],
    });
  }

  return sections;
}
