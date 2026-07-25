import { TemplateData, SectionData, ColumnData, BuilderBlock } from './types';

export function renderBlockHTML(comp: BuilderBlock): string {
  switch (comp.type) {
    case 'logo': {
      const { url = '', alt = 'Logo', linkUrl = '', maxWidth = 160, align = 'center', paddingY = 12 } = comp.content;
      const img = `<img src="${url}" alt="${alt}" style="max-width:${maxWidth}px;height:auto;display:inline-block;border:0;" />`;
      const inner = linkUrl ? `<a href="${linkUrl}" target="_blank">${img}</a>` : img;
      return `<div style="text-align:${align};padding:${paddingY}px 0;">${inner}</div>`;
    }

    case 'greeting': {
      const { greeting = 'Hello', variable = 'customer.firstName', emoji = '👋', fontSize = 20, color = '#0f172a', align = 'left' } = comp.content;
      return `<div style="text-align:${align};padding:6px 0;"><h3 style="margin:0;font-size:${fontSize}px;font-weight:700;color:${color};">${greeting} {{${variable}}} ${emoji}</h3></div>`;
    }

    case 'heading': {
      const { text, tag = 'h2', fontSize = 28, fontWeight = '700', color = '#18181b', align = 'center', letterSpacing = 0, lineHeight = 1.3 } = comp.content;
      return `<${tag} style="margin:0;font-size:${fontSize}px;font-weight:${fontWeight};color:${color};text-align:${align};letter-spacing:${letterSpacing}px;line-height:${lineHeight};">${text || ''}</${tag}>`;
    }

    case 'text': {
      const { text } = comp.content;
      return `<div style="font-size:14px;color:#334155;margin:0;line-height:1.5;">${text || ''}</div>`;
    }

    case 'paragraph': {
      const { text, fontSize = 15, color = '#334155', align = 'left', lineHeight = 1.6 } = comp.content;
      return `<p style="margin:0;font-size:${fontSize}px;color:${color};text-align:${align};line-height:${lineHeight};">${text || ''}</p>`;
    }

    case 'button': {
      const { label, url = '#', backgroundColor = '#2563eb', color = '#ffffff', borderRadius = 6, align = 'center', paddingX = 24, paddingY = 12 } = comp.content;
      return `<div style="text-align:${align};margin:12px 0;"><a href="${url}" target="_blank" style="display:inline-block;background-color:${backgroundColor};color:${color};padding:${paddingY}px ${paddingX}px;border-radius:${borderRadius}px;text-decoration:none;font-weight:bold;font-size:14px;">${label || 'Button'}</a></div>`;
    }

    case 'dualButton': {
      const { primaryLabel, primaryUrl, primaryBg = '#2563eb', primaryColor = '#ffffff', secondaryLabel, secondaryUrl, secondaryBg = '#f1f5f9', secondaryColor = '#334155', align = 'center' } = comp.content;
      return `<div style="text-align:${align};margin:12px 0;"><a href="${primaryUrl}" target="_blank" style="display:inline-block;background-color:${primaryBg};color:${primaryColor};padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;margin-right:8px;">${primaryLabel}</a><a href="${secondaryUrl}" target="_blank" style="display:inline-block;background-color:${secondaryBg};color:${secondaryColor};padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;border:1px solid #cbd5e1;">${secondaryLabel}</a></div>`;
    }

    case 'image': {
      const { url, alt = '', linkUrl, borderRadius = 8, align = 'center' } = comp.content;
      const img = `<img src="${url}" alt="${alt}" style="max-width:100%;height:auto;border-radius:${borderRadius}px;display:inline-block;" />`;
      const content = linkUrl ? `<a href="${linkUrl}" target="_blank">${img}</a>` : img;
      return `<div style="text-align:${align};margin:12px 0;">${content}</div>`;
    }

    case 'heroBanner': {
      const { imageUrl, title, subtitle, ctaLabel, ctaUrl, ctaColor = '#2563eb', overlayColor = 'rgba(15, 23, 42, 0.65)', align = 'center', height = 320 } = comp.content;
      return `<div style="position:relative;width:100%;height:${height}px;background-image:url('${imageUrl}');background-size:cover;background-position:center;border-radius:12px;overflow:hidden;margin:12px 0;"><div style="position:absolute;top:0;left:0;right:0;bottom:0;background:${overlayColor};padding:24px;text-align:${align};display:flex;flex-direction:column;justify-content:center;color:#ffffff;"><h2 style="margin:0 0 8px 0;font-size:28px;font-weight:bold;">${title}</h2><p style="margin:0 0 16px 0;font-size:15px;opacity:0.9;">${subtitle}</p><div><a href="${ctaUrl}" style="display:inline-block;background-color:${ctaColor};color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">${ctaLabel}</a></div></div></div>`;
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

    case 'emojiRow': {
      const { emoji = comp.content.emojis?.[0] || '🚀', text = '', isParagraph = false, size = 28, align = 'center' } = comp.content;
      if (isParagraph) {
        return `<div style="text-align:${align};margin:16px 0;font-family:'Inter',sans-serif;box-sizing:border-box;">` +
          `<div style="font-size:${size}px;line-height:1.2;">${emoji}</div>` +
          `<div style="margin-top:8px;font-size:14px;line-height:1.6;color:#475569;font-weight:400;text-align:${align};">${text}</div>` +
          `</div>`;
      } else {
        const textSpan = text ? ` <span style="font-size:${Math.max(12, size * 0.65)}px;margin-left:8px;vertical-align:middle;font-family:'Inter',sans-serif;font-weight:500;color:#334155;">${text}</span>` : '';
        return `<div style="text-align:${align};margin:12px 0;font-size:${size}px;line-height:1.2;vertical-align:middle;"><span style="vertical-align:middle;">${emoji}</span>${textSpan}</div>`;
      }
    }

    case 'callout': {
      const { icon = '🚀', title, description, ctaLabel, ctaUrl, bgColor = '#eff6ff', borderColor = '#bfdbfe', accentColor = '#2563eb' } = comp.content;
      return `<div style="background-color:${bgColor};border:1.5px solid ${borderColor};border-radius:12px;padding:20px;margin:12px 0;"><div style="font-size:28px;margin-bottom:8px;">${icon}</div><h3 style="margin:0 0 6px 0;font-size:18px;color:#0f172a;">${title}</h3><p style="margin:0 0 16px 0;font-size:14px;color:#475569;">${description}</p><a href="${ctaUrl}" style="display:inline-block;background:${accentColor};color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none;font-weight:bold;">${ctaLabel}</a></div>`;
    }

    case 'infoCard': {
      const { icon = '💡', title, description, buttonLabel, buttonUrl, bgColor = '#f8fafc', align = 'center' } = comp.content;
      return `<div style="background-color:${bgColor};border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:12px 0;text-align:${align};"><div style="font-size:24px;margin-bottom:6px;">${icon}</div><h4 style="margin:0 0 6px 0;font-size:16px;color:#0f172a;">${title}</h4><p style="margin:0 0 14px 0;font-size:13px;color:#64748b;">${description}</p><a href="${buttonUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:7px 14px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:12px;">${buttonLabel}</a></div>`;
    }

    case 'featureCard': {
      const { icon = '⚡', title, description, ctaLabel, ctaUrl, bgColor = '#ffffff', borderColor = '#e2e8f0' } = comp.content;
      return `<div style="background-color:${bgColor};border:1px solid ${borderColor};border-radius:12px;padding:20px;margin:12px 0;"><div style="font-size:20px;margin-bottom:10px;">${icon}</div><h3 style="margin:0 0 6px 0;font-size:17px;color:#0f172a;">${title}</h3><p style="margin:0 0 14px 0;font-size:14px;color:#64748b;">${description}</p><a href="${ctaUrl}" style="color:#2563eb;font-weight:bold;text-decoration:none;">${ctaLabel} &rarr;</a></div>`;
    }

    case 'multiFeature': {
      const { items = [] } = comp.content;
      const cols = items.map((it: any) => `<td valign="top" style="padding:10px;text-align:center;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;"><div style="font-size:24px;margin-bottom:6px;">${it.icon}</div><h4 style="margin:0 0 4px 0;font-size:14px;color:#0f172a;">${it.title}</h4><p style="margin:0;font-size:12px;color:#64748b;">${it.description}</p></td>`).join('');
      return `<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:12px 0;"><tr>${cols}</tr></table>`;
    }

    case 'benefitsList': {
      const { icon = '✅', items = [] } = comp.content;
      const rows = items.map((it: string) => `<div style="margin-bottom:8px;font-size:14px;color:#334155;"><span style="color:#10b981;margin-right:8px;">${icon}</span>${it}</div>`).join('');
      return `<div style="margin:12px 0;">${rows}</div>`;
    }

    case 'bulletList': {
      const { items = [], bulletColor = '#2563eb' } = comp.content;
      const rows = items.map((it: string) => `<div style="margin-bottom:6px;font-size:14px;color:#334155;"><span style="color:${bulletColor};font-weight:bold;margin-right:8px;">•</span>${it}</div>`).join('');
      return `<div style="margin:12px 0;">${rows}</div>`;
    }

    case 'numberedSteps': {
      const { steps = [], accentColor = '#2563eb' } = comp.content;
      const rows = steps.map((st: any, i: number) => `<div style="display:flex;margin-bottom:12px;"><div style="width:28px;height:28px;border-radius:50%;background:${accentColor};color:#fff;text-align:center;line-height:28px;font-weight:bold;margin-right:12px;flex-shrink:0;">${st.stepNumber || i + 1}</div><div><h4 style="margin:0 0 2px 0;font-size:15px;color:#0f172a;">${st.title}</h4><p style="margin:0;font-size:13px;color:#64748b;">${st.description}</p></div></div>`).join('');
      return `<div style="margin:12px 0;">${rows}</div>`;
    }

    case 'timeline': {
      const { events = [], accentColor = '#2563eb' } = comp.content;
      const rows = events.map((ev: any) => `<div style="margin-bottom:12px;padding:12px;background:#f8fafc;border-left:3px solid ${accentColor};border-radius:6px;"><span style="font-size:11px;font-weight:bold;color:${accentColor};">${ev.date}</span><h4 style="margin:2px 0 4px 0;font-size:14px;color:#0f172a;">${ev.title}</h4><p style="margin:0;font-size:12px;color:#64748b;">${ev.description}</p></div>`).join('');
      return `<div style="margin:12px 0;">${rows}</div>`;
    }

    case 'quote': {
      const { quote, author, role, avatarUrl, bgColor = '#f8fafc', accentColor = '#2563eb' } = comp.content;
      return `<div style="background:${bgColor};border-left:4px solid ${accentColor};padding:20px;margin:12px 0;border-radius:0 12px 12px 0;"><p style="margin:0 0 12px 0;font-size:15px;font-style:italic;color:#334155;">"${quote}"</p><div style="display:flex;align-items:center;"><img src="${avatarUrl}" style="width:40px;height:40px;border-radius:50%;margin-right:12px;" /><div><h5 style="margin:0;font-size:14px;color:#0f172a;">${author}</h5><p style="margin:0;font-size:12px;color:#64748b;">${role}</p></div></div></div>`;
    }

    case 'faqAccordion': {
      const { items = [] } = comp.content;
      const rows = items.map((it: any) => `<div style="background:#ffffff;border:1px solid #e2e8f0;padding:12px 16px;border-radius:8px;margin-bottom:8px;"><h5 style="margin:0 0 6px 0;font-size:14px;color:#0f172a;">❓ ${it.question}</h5><p style="margin:0;font-size:13px;color:#475569;">${it.answer}</p></div>`).join('');
      return `<div style="margin:12px 0;">${rows}</div>`;
    }

    case 'footer': {
      const { companyName, address, unsubscribeUrl, privacyUrl, copyrightText, textColor = '#64748b', align = 'center' } = comp.content;
      return `<div style="text-align:${align};color:${textColor};font-size:12px;padding:16px 0;border-top:1px solid #e2e8f0;margin:16px 0 0 0;"><p style="margin:0 0 4px 0;font-weight:bold;">${companyName}</p><p style="margin:0 0 8px 0;">${address}</p><p style="margin:0 0 8px 0;"><a href="${unsubscribeUrl}" style="color:${textColor};">Unsubscribe</a> &bull; <a href="${privacyUrl}" style="color:${textColor};">Privacy Policy</a></p><p style="margin:0;">${copyrightText}</p></div>`;
    }

    case 'signature': {
      const { name, role, company, email, phone, avatarUrl, accentColor = '#2563eb' } = comp.content;
      return `<div style="border-top:2px solid ${accentColor};padding-top:14px;margin:16px 0;display:flex;align-items:center;"><img src="${avatarUrl}" style="width:50px;height:50px;border-radius:50%;margin-right:12px;" /><div><h4 style="margin:0;font-size:16px;color:#0f172a;">${name}</h4><p style="margin:2px 0;font-size:13px;color:${accentColor};">${role} • ${company}</p><p style="margin:0;font-size:12px;color:#64748b;">${email} | ${phone}</p></div></div>`;
    }

    case 'pricingCard': {
      const { planName, price, period, features = [], ctaLabel, ctaUrl, accentColor = '#2563eb' } = comp.content;
      const featRows = features.map((f: string) => `<div style="margin-bottom:6px;font-size:13px;color:#334155;"><span style="color:${accentColor};margin-right:6px;">✓</span>${f}</div>`).join('');
      return `<div style="border:2px solid ${accentColor};border-radius:14px;padding:24px;margin:12px 0;text-align:center;"><h3 style="margin:0 0 8px 0;font-size:18px;color:#0f172a;">${planName}</h3><div style="font-size:32px;font-weight:bold;color:#0f172a;margin-bottom:16px;">${price} <span style="font-size:13px;color:#64748b;">${period}</span></div><div style="text-align:left;margin-bottom:20px;">${featRows}</div><a href="${ctaUrl}" style="display:block;background:${accentColor};color:#fff;padding:10px;border-radius:6px;text-decoration:none;font-weight:bold;">${ctaLabel}</a></div>`;
    }

    case 'container': {
      const { title, description, bgColor = '#f8fafc', borderColor = '#cbd5e1', borderRadius = 12, padding = 20 } = comp.content;
      return `<div style="background-color:${bgColor};border:1.5px solid ${borderColor};border-radius:${borderRadius}px;padding:${padding}px;margin:12px 0;"><h4 style="margin:0 0 6px 0;font-size:16px;color:#0f172a;">${title}</h4><p style="margin:0;font-size:14px;color:#475569;">${description}</p></div>`;
    }

    case 'alertBox': {
      const { variant = 'info', title, message } = comp.content;
      const bg = variant === 'success' ? '#f0fdf4' : variant === 'warning' ? '#fffbeb' : variant === 'danger' ? '#fef2f2' : '#eff6ff';
      const border = variant === 'success' ? '#bbf7d0' : variant === 'warning' ? '#fde68a' : variant === 'danger' ? '#fecaca' : '#bfdbfe';
      const color = variant === 'success' ? '#166534' : variant === 'warning' ? '#92400e' : variant === 'danger' ? '#991b1b' : '#1e40af';
      return `<div style="background:${bg};border:1px solid ${border};border-radius:8px;padding:14px;margin:12px 0;color:${color};"><h5 style="margin:0 0 2px 0;font-size:14px;">${title}</h5><p style="margin:0;font-size:13px;">${message}</p></div>`;
    }

    case 'code': {
      const { code, bgColor = '#0f172a', textColor = '#38bdf8' } = comp.content;
      return `<div style="background:${bgColor};color:${textColor};padding:14px;border-radius:8px;margin:12px 0;font-family:monospace;font-size:13px;white-space:pre-wrap;">${code}</div>`;
    }

    case 'variable': {
      const { variableName, fallback, label } = comp.content;
      return `<div style="margin:6px 0;"><span style="background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;padding:4px 10px;border-radius:16px;font-size:12px;font-family:monospace;">${label}: {{${variableName}}} (${fallback})</span></div>`;
    }

    case 'buttonCard': {
      const { icon = '🎯', heading, description, ctaLabel, ctaUrl, bgColor = '#f0f6ff', accentColor = '#2563eb' } = comp.content;
      return `<div style="background:${bgColor};border:1px solid #bfdbfe;border-radius:14px;padding:24px;text-align:center;margin:12px 0;"><div style="font-size:32px;margin-bottom:8px;">${icon}</div><h3 style="margin:0 0 6px 0;font-size:18px;color:#0f172a;">${heading}</h3><p style="margin:0 0 16px 0;font-size:14px;color:#475569;">${description}</p><a href="${ctaUrl}" style="display:inline-block;background:${accentColor};color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">${ctaLabel}</a></div>`;
    }

    case 'highlightBox': {
      const { icon = '⭐', heading, text, ctaLabel, ctaUrl, bgColor = '#2563eb', textColor = '#ffffff' } = comp.content;
      return `<div style="background:${bgColor};border-radius:14px;padding:24px;color:${textColor};text-align:center;margin:12px 0;"><div style="font-size:32px;margin-bottom:8px;">${icon}</div><h3 style="margin:0 0 8px 0;font-size:22px;">${heading}</h3><p style="margin:0 0 16px 0;font-size:14px;opacity:0.9;">${text}</p><a href="${ctaUrl}" style="display:inline-block;background:#fff;color:${bgColor};padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;">${ctaLabel}</a></div>`;
    }

    case 'checklist': {
      const { title, items = [] } = comp.content;
      const rows = items.map((it: any) => `<div style="margin-bottom:6px;font-size:13px;"><span style="color:#10b981;font-weight:bold;margin-right:6px;">${it.checked ? '☑' : '☐'}</span>${it.text}</div>`).join('');
      return `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin:12px 0;"><h4 style="margin:0 0 10px 0;font-size:15px;color:#0f172a;">${title}</h4>${rows}</div>`;
    }

    case 'iconText': {
      const { icon = '⚡', iconColor = '#2563eb', heading, description } = comp.content;
      return `<div style="display:flex;align-items:flex-start;margin:12px 0;"><div style="font-size:20px;color:${iconColor};margin-right:12px;">${icon}</div><div><h4 style="margin:0 0 2px 0;font-size:15px;color:#0f172a;">${heading}</h4><p style="margin:0;font-size:13px;color:#64748b;">${description}</p></div></div>`;
    }

    case 'badge': {
      const { text = 'NEW', bgColor = '#dcfce7', textColor = '#15803d', align = 'center' } = comp.content;
      return `<div style="text-align:${align};margin:6px 0;"><span style="display:inline-block;background:${bgColor};color:${textColor};padding:4px 12px;border-radius:20px;font-size:11px;font-weight:bold;">${text}</span></div>`;
    }

    case 'statistics': {
      const { stats = [], accentColor = '#2563eb' } = comp.content;
      const cols = stats.map((st: any) => `<td style="text-align:center;padding:8px;"><div style="font-size:24px;font-weight:bold;color:${accentColor};">${st.value}</div><div style="font-size:11px;color:#64748b;">${st.label}</div></td>`).join('');
      return `<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:12px 0;"><tr>${cols}</tr></table>`;
    }

    case 'newsletterHeader': {
      const { logoUrl, title, subtitle, issueDate, accentColor = '#2563eb' } = comp.content;
      return `<div style="border-bottom:2px solid ${accentColor};padding:20px;text-align:center;margin-bottom:16px;">${logoUrl ? `<img src="${logoUrl}" style="max-height:36px;margin-bottom:8px;" />` : ''}<h1 style="margin:0 0 4px 0;font-size:24px;color:#0f172a;">${title}</h1><p style="margin:0 0 8px 0;font-size:13px;color:#64748b;">${subtitle}</p><span style="font-size:11px;font-weight:bold;color:${accentColor};">${issueDate}</span></div>`;
    }

    case 'bannerCta': {
      const { headline, subheadline, ctaLabel, ctaUrl, imageUrl, bgColor = '#0f172a' } = comp.content;
      return `<div style="background:${bgColor};border-radius:14px;overflow:hidden;color:#fff;margin:12px 0;"><img src="${imageUrl}" style="width:100%;height:160px;object-fit:cover;" /><div style="padding:20px;text-align:center;"><h3 style="margin:0 0 6px 0;font-size:20px;">${headline}</h3><p style="margin:0 0 16px 0;font-size:13px;opacity:0.85;">${subheadline}</p><a href="${ctaUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 22px;border-radius:6px;text-decoration:none;font-weight:bold;">${ctaLabel}</a></div></div>`;
    }

    case 'html': {
      return comp.content.html || '';
    }

    case 'coupon': {
      const { headline, headlineColor = '#18181b', discount, code, subtext, backgroundColor = '#f8fafc', borderColor = '#2563eb' } = comp.content;
      return `<div style="padding:20px;margin:12px 0;background-color:${backgroundColor};border:2px dashed ${borderColor};border-radius:8px;text-align:center;"><h4 style="margin:0 0 8px 0;color:${headlineColor};font-size:14px;">${headline}</h4><div style="font-size:28px;font-weight:bold;color:${borderColor};">${discount}</div><div style="margin-top:10px;display:inline-block;padding:6px 16px;background:#fff;border:1px solid ${borderColor};font-family:monospace;font-weight:bold;font-size:16px;">${code}</div><p style="margin:8px 0 0 0;font-size:12px;color:#64748b;">${subtext || ''}</p></div>`;
    }

    default:
      return '';
  }
}

export function exportHTML(data: TemplateData): string {
  const { globalTheme, sections } = data;
  const font = globalTheme.fontFamily || 'Inter, sans-serif';
  const pageBg = globalTheme.pageBackgroundColor || globalTheme.backgroundColor || '#f3f4f6';
  const pageImg = globalTheme.pageBackgroundImage || '';
  const bodyBg = globalTheme.bodyBackgroundColor || '#ffffff';
  const bodyImg = globalTheme.bodyBackgroundImage || '';
  const bodyWidth = globalTheme.bodyWidth || 600;
  const textColor = globalTheme.textColor || '#18181b';

  const bodyBgStyle = bodyImg ? `background-color:${bodyBg};background-image:url('${bodyImg}');background-size:cover;` : `background-color:${bodyBg};`;
  const pageBgStyle = pageImg ? `background-color:${pageBg};background-image:url('${pageImg}');background-size:${globalTheme.pageBackgroundSize || 'cover'};background-repeat:${globalTheme.pageBackgroundRepeat || 'no-repeat'};` : `background-color:${pageBg};`;

  const sectionsHTML = sections
    .map((sec: SectionData) => {
      const secBg = sec.background || 'transparent';
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
      <table role="presentation" width="${bodyWidth}" border="0" cellspacing="0" cellpadding="0" style="max-width:${bodyWidth}px;width:100%;">
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
    body { margin: 0; padding: 0; font-family: ${font}; color: ${textColor}; }
    table { border-collapse: collapse; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body style="margin:0;padding:0;font-family:${font};${pageBgStyle}">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="${pageBgStyle}padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="${bodyWidth}" border="0" cellspacing="0" cellpadding="0" style="max-width:${bodyWidth}px;width:100%;${bodyBgStyle}border-radius:${globalTheme.bodyBorderRadius || 16}px;overflow:hidden;">
          <tr>
            <td>
              ${sectionsHTML}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
