import { TemplateData, SectionData, ColumnData, BuilderBlock } from './types';

export function renderBlockHTML(comp: BuilderBlock): string {
  switch (comp.type) {
    case 'heading': {
      const { text, tag = 'h2', fontSize = 28, fontWeight = '700', color = '#18181b', align = 'center', letterSpacing = 0, lineHeight = 1.3 } = comp.content;
      return `<${tag} style="margin:0;font-size:${fontSize}px;font-weight:${fontWeight};color:${color};text-align:${align};letter-spacing:${letterSpacing}px;line-height:${lineHeight};">${text || ''}</${tag}>`;
    }
    case 'paragraph': {
      const { text, fontSize = 15, color = '#334155', align = 'left', lineHeight = 1.6 } = comp.content;
      return `<p style="margin:0;font-size:${fontSize}px;color:${color};text-align:${align};line-height:${lineHeight};">${text || ''}</p>`;
    }
    case 'button': {
      const { label, url = '#', backgroundColor = '#8b5cf6', color = '#ffffff', borderRadius = 6, align = 'center', paddingX = 24, paddingY = 12 } = comp.content;
      return `<div style="text-align:${align};margin:12px 0;"><a href="${url}" target="_blank" style="display:inline-block;background-color:${backgroundColor};color:${color};padding:${paddingY}px ${paddingX}px;border-radius:${borderRadius}px;text-decoration:none;font-weight:bold;font-size:14px;">${label || 'Button'}</a></div>`;
    }
    case 'image': {
      const { url, alt = '', linkUrl, borderRadius = 8, align = 'center' } = comp.content;
      const img = `<img src="${url}" alt="${alt}" style="max-width:100%;height:auto;border-radius:${borderRadius}px;display:inline-block;" />`;
      const content = linkUrl ? `<a href="${linkUrl}" target="_blank">${img}</a>` : img;
      return `<div style="text-align:${align};margin:12px 0;">${content}</div>`;
    }
    case 'divider': {
      const { style = 'solid', thickness = 1, color = '#e2e8f0', paddingTop = 16, paddingBottom = 16 } = comp.content;
      return `<div style="padding-top:${paddingTop}px;padding-bottom:${paddingBottom}px;"><hr style="border:none;border-top:${thickness}px ${style} ${color};margin:0;" /></div>`;
    }
    case 'spacer': {
      return `<div style="height:${comp.content.height || 32}px;line-height:${comp.content.height || 32}px;">&nbsp;</div>`;
    }
    case 'video': {
      const { thumbnailUrl, videoUrl = '#', alt = '', borderRadius = 8 } = comp.content;
      return `<div style="text-align:center;margin:12px 0;"><a href="${videoUrl}" target="_blank" style="position:relative;display:inline-block;"><img src="${thumbnailUrl}" alt="${alt}" style="max-width:100%;height:auto;border-radius:${borderRadius}px;display:block;" /></a></div>`;
    }
    case 'html': {
      return comp.content.html || '';
    }
    case 'coupon': {
      const { headline, headlineColor = '#18181b', discount, code, subtext, backgroundColor = '#f8fafc', borderColor = '#8b5cf6' } = comp.content;
      return `<div style="padding:20px;margin:12px 0;background-color:${backgroundColor};border:2px dashed ${borderColor};border-radius:8px;text-align:center;"><h4 style="margin:0 0 8px 0;color:${headlineColor};font-size:14px;">${headline}</h4><div style="font-size:28px;font-weight:bold;color:${borderColor};">${discount}</div><div style="margin-top:10px;display:inline-block;padding:6px 16px;background:#fff;border:1px solid ${borderColor};font-family:monospace;font-weight:bold;font-size:16px;">${code}</div><p style="margin:8px 0 0 0;font-size:12px;color:#64748b;">${subtext || ''}</p></div>`;
    }
    default:
      return '';
  }
}

export function exportHTML(data: TemplateData): string {
  const { globalTheme, sections } = data;
  const font = globalTheme.fontFamily || 'Inter, sans-serif';
  const bg = globalTheme.backgroundColor || '#f4f4f5';
  const textColor = globalTheme.textColor || '#18181b';

  const sectionsHTML = sections
    .map((sec: SectionData) => {
      const secBg = sec.background || '#ffffff';
      const secPadding = sec.padding || '24px 20px';

      const colsHTML = sec.columns
        .map((col: ColumnData) => {
          const colWidth = col.width || `${(100 / sec.columns.length).toFixed(2)}%`;
          const blocksHTML = col.components.map(renderBlockHTML).join('\n');
          return `<td width="${colWidth}" valign="${col.styles?.verticalAlign || 'top'}" style="padding:${col.styles?.padding || '0'};background-color:${col.styles?.backgroundColor || 'transparent'};">\n${blocksHTML}\n</td>`;
        })
        .join('\n');

      return `<!-- Section ${sec.id} -->
<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:${secBg};">
  <tr>
    <td align="center" style="padding:${secPadding};">
      <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;">
        <tr>
          ${colsHTML}
        </tr>
      </table>
    </td>
  </tr>
</table>`;
    })
    .join('\n\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.name}</title>
  <style>
    body { margin: 0; padding: 0; font-family: ${font}; background-color: ${bg}; color: ${textColor}; }
    table { border-collapse: collapse; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${bg};font-family:${font};">
  <div style="background-color:${bg};padding:20px 0;">
    ${sectionsHTML}
  </div>
</body>
</html>`;
}
