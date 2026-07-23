// ============================================================
// Mail Sender — Full Email Builder Engine (Phase 1 + 2 + 3)
// Phase 1: Core blocks, Undo/Redo, Autosave, Merge Tags
// Phase 2: Product Card, Countdown, QR, Coupon, Poll, Video, Menu, Table, Icons, Rating, Conditional
// Phase 3: AI Panel, Version History, Accessibility Checker, Spam Score, A/B Test, Dark Preview
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  // ── State ──────────────────────────────────────────────────────────────────
  let templateData = {
    name: "Untitled Template", version: "2.0",
    globalTheme: { fontFamily: "Inter, sans-serif", backgroundColor: "#f4f4f5", textColor: "#18181b", linkColor: "#8b5cf6", buttonColor: "#8b5cf6" },
    variables: [
      { name: "customer.name", fallback: "there" }, { name: "customer.firstName", fallback: "there" },
      { name: "customer.email", fallback: "" }, { name: "org.name", fallback: "our team" },
      { name: "unsubscribe_link", fallback: "#" },
    ],
    sections: [],
    tracking: { openTracking: true, clickTracking: true },
    metadata: { aiPrompt: "", category: "marketing", subject: "", preheader: "" }
  };
  let selectedRef = null;
  let undoStack = [], redoStack = [];
  const MAX_HISTORY = 50;
  let autoSaveTimer = null;
  let currentTemplateId = null;
  let isDarkPreview = false;
  let hasUnsavedChanges = false;

  // ── DOM refs ────────────────────────────────────────────────────────────────
  const canvas    = document.getElementById("emailCanvas");
  const emptyMsg  = document.getElementById("emptyCanvasMsg");
  const propPanel = document.getElementById("propertyPanel");
  const propCont  = document.getElementById("propertyInputsContainer");
  const noSelMsg  = document.getElementById("noSelectionMsg");
  const nameInput = document.getElementById("templateNameInput");
  const autoSaveBadge = document.getElementById("autoSaveBadge");
  const discardBtn = document.getElementById("discardTemplateBtn");

  // ── Draft & Autosave Indicator ─────────────────────────────────────────────
  function updateDraftIndicator() {
    if (!autoSaveBadge) return;
    if (hasUnsavedChanges) {
      autoSaveBadge.innerHTML = `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#f59e0b;margin-right:5px;animation:pulse 1.5s infinite"></span>Unsaved changes`;
      if (discardBtn) discardBtn.style.display = "inline-flex";
    } else {
      autoSaveBadge.innerHTML = `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#10b981;margin-right:5px"></span>Saved`;
      if (discardBtn) discardBtn.style.display = "none";
    }
  }

  // ── AI Image generation listener on properties sidebar ─────────────────────
  propCont.addEventListener('click', (e) => {
    const btn = e.target.closest('.ai-gen-btn');
    if (!btn) return;
    const parentRow = btn.closest('.property-row');
    if (!parentRow) return;
    const input = parentRow.querySelector('input.prop, textarea.prop');
    if (!input) return;

    if (typeof window.showGenerateImageModal === 'function') {
      window.showGenerateImageModal((url) => {
        input.value = url;
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('change'));
      });
    } else {
      showToast('AI Image Generator not loaded yet.', 'error');
    }
  });

  // ── History helpers ─────────────────────────────────────────────────────────
  function pushHistory() {
    undoStack.push(JSON.stringify(templateData));
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack = [];
    hasUnsavedChanges = true;
    updateDraftIndicator();
    scheduleAutoSave();
  }
  function scheduleAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      localStorage.setItem("ms_builder_draft", JSON.stringify(templateData));
      localStorage.setItem("ms_builder_name", templateData.name);
      if (autoSaveBadge && hasUnsavedChanges) {
        autoSaveBadge.innerHTML = `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#a78bfa;margin-right:5px"></span>Draft Autosaved`;
      }
    }, 1500);
  }
  document.getElementById("undoBtn")?.addEventListener("click", () => {
    if (!undoStack.length) return;
    redoStack.push(JSON.stringify(templateData));
    templateData = JSON.parse(undoStack.pop());
    hasUnsavedChanges = true;
    updateDraftIndicator();
    renderCanvas(); showToast("Undo", "info");
  });
  document.getElementById("redoBtn")?.addEventListener("click", () => {
    if (!redoStack.length) return;
    undoStack.push(JSON.stringify(templateData));
    templateData = JSON.parse(redoStack.pop());
    hasUnsavedChanges = true;
    updateDraftIndicator();
    renderCanvas(); showToast("Redo", "info");
  });

  // ── Toast notification ──────────────────────────────────────────────────────
  function showToast(msg, type = "success") {
    let t = document.getElementById("builderToast");
    if (!t) { t = document.createElement("div"); t.id = "builderToast"; document.body.appendChild(t); }
    t.className = `builder-toast toast-${type}`;
    t.textContent = msg; t.style.display = "block";
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.display = "none"; }, 2500);
  }

  // ── Always start with a blank canvas ──────────────────────────────────────
  // Draft is intentionally NOT restored on page load.
  // Users must explicitly open a saved template or create a new one.
  localStorage.removeItem("ms_builder_draft");
  localStorage.removeItem("ms_builder_name");
  if (nameInput) nameInput.value = templateData.name;

  // ── Block definitions (Phase 1 + 2) ─────────────────────────────────────────
  function defaultBlock(type) {
    const id = `blk_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
    const defaults = {
      heading:    { id, type, content: "Your Heading Here", tag: "h2", fontSize: "28", fontWeight: "700", color: "#18181b", align: "center", letterSpacing: "0", lineHeight: "1.3" },
      paragraph:  { id, type, content: "Edit this text block. Click to select and modify it in the properties panel.", fontSize: "15", color: "#52525b", align: "left", lineHeight: "1.7" },
      button:     { id, type, label: "Click Here", url: "#", bgColor: "#8b5cf6", textColor: "#ffffff", borderRadius: "8", align: "center", width: "auto", paddingX: "28", paddingY: "14", shadow: false },
      image:      { id, type, src: "https://placehold.co/600x240/8b5cf6/ffffff?text=Image", alt: "Image", link: "", borderRadius: "0", align: "center" },
      divider:    { id, type, style: "solid", thickness: "1", color: "#e4e4e7", paddingTop: "16", paddingBottom: "16" },
      spacer:     { id, type, height: "32" },
      social:     { id, type, links: [ { platform: "twitter", url: "#" }, { platform: "linkedin", url: "#" }, { platform: "instagram", url: "#" } ], align: "center", iconSize: "32" },
      html:       { id, type, content: "<!-- Custom HTML -->\n<p style='color:#888;text-align:center;'>Custom HTML block</p>" },
      video:      { id, type, thumbnailSrc: "https://placehold.co/600x338/1a1a2e/a78bfa?text=▶+Video", videoUrl: "", alt: "Watch Video", borderRadius: "8" },
      menu:       { id, type, links: [{ label: "Home", url: "#" }, { label: "Products", url: "#" }, { label: "Contact", url: "#" }], align: "center", color: "#8b5cf6", fontSize: "14", separator: "|" },
      table:      { id, type, headers: ["Product", "Qty", "Price"], rows: [["Item 1", "2", "$20.00"], ["Item 2", "1", "$15.00"]], headerBg: "#8b5cf6", headerColor: "#ffffff", stripedRows: true },
      icons:      { id, type, icons: ["star", "heart", "check-circle", "mail"], iconSize: "32", align: "center", iconColor: "#8b5cf6" },
      rating:     { id, type, stars: 5, filled: 4, baseUrl: "#", color: "#f59e0b", size: "28", align: "center" },
      "product-card": { id, type, imageUrl: "https://placehold.co/280x200/8b5cf6/ffffff?text=Product", title: "Product Name", price: "$29.99", oldPrice: "$49.99", description: "Short product description here.", ctaLabel: "Shop Now", ctaUrl: "#", ctaColor: "#8b5cf6", borderRadius: "12" },
      "product-grid": { id, type, columns: 2, products: [
        { imageUrl: "https://placehold.co/200x150/8b5cf6/fff?text=P1", title: "Product 1", price: "$19.99", url: "#" },
        { imageUrl: "https://placehold.co/200x150/a78bfa/fff?text=P2", title: "Product 2", price: "$24.99", url: "#" },
      ]},
      coupon:     { id, type, headline: "Exclusive Offer!", discount: "20% OFF", code: "SAVE20", subtext: "Valid till 31st July. Min order ₹499.", bgColor: "#1a1a2e", borderColor: "#8b5cf6", textColor: "#ffffff", headlineColor: "#a78bfa" },
      countdown:  { id, type, deadline: new Date(Date.now() + 3 * 86400000).toISOString().slice(0,16), label: "Offer ends in:", bgColor: "#1a1a2e", textColor: "#ffffff", accentColor: "#8b5cf6" },
      "qr-code":  { id, type, url: "https://yourdomain.com", size: "150", caption: "Scan to visit", align: "center" },
      poll:       { id, type, question: "How did we do today?", options: [{ emoji: "A", label: "Great", url: "#" }, { emoji: "B", label: "OK", url: "#" }, { emoji: "C", label: "Poor", url: "#" }], align: "center" },
      conditional:{ id, type, condition: "customer.plan == 'pro'", trueContent: "Pro member exclusive content", falseContent: "Upgrade to Pro to unlock this." },
    };
    return defaults[type] || { id, type, content: "Block" };
  }

  // ── Section builders ─────────────────────────────────────────────────────────
  function addSection(layout, insertAfterIdx = -1) {
    pushHistory();
    const colCount = layout === "3-col" ? 3 : layout === "2-col" ? 2 : 1;
    const cols = Array.from({ length: colCount }, () => ({ components: [], styles: { padding: "8px" } }));
    const newSec = {
      id: `sec_${Date.now()}`,
      background: { color: "#ffffff", imageUrl: "", overlayOpacity: 0 },
      padding: { top: "20", bottom: "20", left: "20", right: "20" },
      columns: cols,
      visibility: { desktop: true, mobile: true },
    };
    if (insertAfterIdx >= 0) {
      templateData.sections.splice(insertAfterIdx + 1, 0, newSec);
    } else {
      templateData.sections.push(newSec);
    }
    selectedRef = null; renderCanvas();
  }

  // ── Content block add ───────────────────────────────────────────────────────
  function addContentBlock(type) {
    if (!templateData.sections.length) addSection("1-col");
    const lastSection = templateData.sections[templateData.sections.length - 1];
    const col = lastSection.columns[0];
    pushHistory();
    col.components.push(defaultBlock(type));
    renderCanvas();
    // Select the new block
    const secIdx = templateData.sections.length - 1;
    const compIdx = col.components.length - 1;
    selectedRef = { type: "component", sectionIdx: secIdx, colIdx: 0, compIdx };
    renderProperties();
  }

  // ── Canvas renderer ─────────────────────────────────────────────────────────
  function renderCanvas() {
    // Clear everything except emptyCanvasMsg
    Array.from(canvas.children).forEach(ch => { if (ch.id !== "emptyCanvasMsg") canvas.removeChild(ch); });
    emptyMsg.style.display = templateData.sections.length ? "none" : "flex";
    canvas.style.backgroundColor = templateData.globalTheme.backgroundColor;
    canvas.style.fontFamily = templateData.globalTheme.fontFamily;

    templateData.sections.forEach((section, sIdx) => {
      const sEl = document.createElement("div");
      sEl.className = `canvas-section${selectedRef?.type === "section" && selectedRef.sectionIdx === sIdx ? " selected" : ""}`;
      sEl.dataset.sectionIdx = sIdx;
      sEl.style.cssText = `background:${section.background.color || "#fff"};padding:${section.padding.top||20}px ${section.padding.right||20}px ${section.padding.bottom||20}px ${section.padding.left||20}px;`;
      if (section.background.imageUrl) sEl.style.backgroundImage = `url(${section.background.imageUrl})`;

      // Section actions bar
      sEl.innerHTML = `<div class="section-actions">
        <span style="margin-right:4px">Section ${sIdx+1}</span>
        <button class="sec-action" data-sec="${sIdx}" data-act="up" title="Move up"><i data-lucide="arrow-up" style="width:14px;height:14px"></i></button>
        <button class="sec-action" data-sec="${sIdx}" data-act="down" title="Move down"><i data-lucide="arrow-down" style="width:14px;height:14px"></i></button>
        <button class="sec-action" data-sec="${sIdx}" data-act="dupe" title="Duplicate"><i data-lucide="copy" style="width:14px;height:14px"></i></button>
        <button class="sec-action" data-sec="${sIdx}" data-act="del" title="Delete" style="color:#ef4444"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>
      </div>`;

      // Columns wrapper
      const colsEl = document.createElement("div");
      colsEl.className = "canvas-columns";

      section.columns.forEach((col, cIdx) => {
        const colEl = document.createElement("div");
        const isColSelected = selectedRef?.type === "column" && selectedRef.sectionIdx === sIdx && selectedRef.colIdx === cIdx;
        colEl.className = `canvas-column${isColSelected ? " selected" : ""}`;
        colEl.dataset.secIdx = sIdx;
        colEl.dataset.colIdx = cIdx;

        // Apply width percentage
        if (col.styles?.width) {
          colEl.style.width = col.styles.width;
          colEl.style.flex = "none";
        } else {
          colEl.style.flex = "1";
        }

        // Apply padding
        const pTop = col.styles?.paddingTop ?? 8;
        const pBottom = col.styles?.paddingBottom ?? 8;
        const pLeft = col.styles?.paddingLeft ?? 8;
        const pRight = col.styles?.paddingRight ?? 8;
        colEl.style.padding = `${pTop}px ${pRight}px ${pBottom}px ${pLeft}px`;

        // Apply background color
        if (col.styles?.backgroundColor) {
          colEl.style.backgroundColor = col.styles.backgroundColor;
        } else {
          colEl.style.backgroundColor = "transparent";
        }

        // Apply vertical alignment
        colEl.style.justifyContent = { top: 'flex-start', middle: 'center', bottom: 'flex-end' }[col.styles?.verticalAlign] || 'flex-start';

        col.components.forEach((comp, compIdx) => {
          const compEl = document.createElement("div");
          const isSelected = selectedRef?.type === "component" && selectedRef.sectionIdx === sIdx && selectedRef.colIdx === cIdx && selectedRef.compIdx === compIdx;
          compEl.className = `canvas-component${isSelected ? " selected" : ""}`;
          compEl.dataset.secIdx = sIdx; compEl.dataset.colIdx = cIdx; compEl.dataset.compIdx = compIdx;

          compEl.innerHTML = `
            <div class="component-actions">
              <button class="action-btn comp-up"    data-si="${sIdx}" data-ci="${cIdx}" data-pi="${compIdx}" title="Move up"><i data-lucide="arrow-up" style="width:14px;height:14px"></i></button>
              <button class="action-btn comp-down"  data-si="${sIdx}" data-ci="${cIdx}" data-pi="${compIdx}" title="Move down"><i data-lucide="arrow-down" style="width:14px;height:14px"></i></button>
              <button class="action-btn comp-dupe"  data-si="${sIdx}" data-ci="${cIdx}" data-pi="${compIdx}" title="Duplicate"><i data-lucide="copy" style="width:14px;height:14px"></i></button>
              <button class="action-btn comp-del"   data-si="${sIdx}" data-ci="${cIdx}" data-pi="${compIdx}" title="Delete" style="color:#ef4444"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>
            </div>
            ${renderBlockHTML(comp)}`;

          colEl.appendChild(compEl);
        });

        // Drop-here button
        const addBtn = document.createElement("div");
        addBtn.className = "col-add-btn";
        addBtn.textContent = "+ Add Block";
        addBtn.dataset.secIdx = sIdx; addBtn.dataset.colIdx = cIdx;
        colEl.appendChild(addBtn);
        colsEl.appendChild(colEl);
      });

      sEl.appendChild(colsEl);
      canvas.appendChild(sEl);
    });

    attachCanvasEvents();
    if (typeof lucide !== "undefined") lucide.createIcons();
  }

  function resolveUrl(url) {
    if (!url) return "";
    if (url.startsWith("/") && !url.startsWith("//")) {
      return window.location.origin + url;
    }
    return url;
  }

  // ── Block HTML renderers ────────────────────────────────────────────────────
  function renderBlockHTML(comp) {
    switch (comp.type) {
      case "heading":    return `<${comp.tag||"h2"} contenteditable="true" class="editable-content" style="margin:0;font-size:${comp.fontSize||28}px;font-weight:${comp.fontWeight||700};color:${comp.color||"#18181b"};text-align:${comp.align||"center"};letter-spacing:${comp.letterSpacing||0}px;line-height:${comp.lineHeight||1.3};outline:none;">${comp.content}</${comp.tag||"h2"}>`;
      case "paragraph":  return `<p contenteditable="true" class="editable-content" style="margin:0;font-size:${comp.fontSize||15}px;color:${comp.color||"#52525b"};text-align:${comp.align||"left"};line-height:${comp.lineHeight||1.7};outline:none;">${comp.content}</p>`;
      case "button":     return `<div style="text-align:${comp.align||"center"}"><a href="${comp.url||"#"}" onclick="event.preventDefault();" contenteditable="true" class="editable-content btn-editable" style="display:inline-block;background:${comp.bgColor||"#8b5cf6"};color:${comp.textColor||"#fff"};padding:${comp.paddingY||14}px ${comp.paddingX||28}px;border-radius:${comp.borderRadius||8}px;font-weight:600;text-decoration:none;font-size:15px;outline:none;${comp.shadow?"box-shadow:0 4px 14px rgba(139,92,246,0.4);":""}">${comp.label||"Click Here"}</a></div>`;
      case "image":      return `<div style="text-align:${comp.align||"center"}"><img src="${resolveUrl(comp.src || comp.imageUrl || "")}" alt="${comp.alt||""}" style="max-width:100%;height:auto;border-radius:${comp.borderRadius||0}px;" /></div>`;
      case "divider":    return `<div style="padding:${comp.paddingTop||16}px 0 ${comp.paddingBottom||16}px"><hr style="border:none;border-top:${comp.thickness||1}px ${comp.style||"solid"} ${comp.color||"#e4e4e7"};margin:0" /></div>`;
      case "spacer":     return `<div style="height:${comp.height||32}px;display:block"></div>`;
      case "social":     return renderSocialBlock(comp);
      case "html":       return `<div class="html-block-preview">${comp.content}</div>`;
      case "video":      return `<div style="text-align:center;position:relative"><a href="${comp.videoUrl||"#"}" target="_blank" style="display:inline-block;position:relative"><img src="${resolveUrl(comp.thumbnailSrc || "")}" alt="${comp.alt||"Watch Video"}" style="max-width:100%;border-radius:${comp.borderRadius||8}px;" /><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:64px;height:64px;background:rgba(0,0,0,.6);border-radius:50%;display:flex;align-items:center;justify-content:center"><span style="color:#fff;font-size:24px;margin-left:4px">▶</span></div></a></div>`;
      case "menu":       return `<div style="text-align:${comp.align||"center"};padding:8px 0">${comp.links.map((l,i) => `${i>0?`<span style="color:#999;margin:0 8px">${comp.separator||"|"}</span>`:""}<a href="${l.url||"#"}" style="color:${comp.color||"#8b5cf6"};font-size:${comp.fontSize||14}px;text-decoration:none;font-weight:500">${l.label}</a>`).join("")}</div>`;
      case "table":      return renderTableBlock(comp);
      case "icons":      {
        const iconColor = comp.iconColor || "#8b5cf6";
        const iconSize = comp.iconSize || 32;
        const iconHtml = (comp.icons || []).map(ic => {
          const isValidIcon = ic && /^[a-z0-9-]+$/i.test(ic);
          if (isValidIcon) {
            return `<i data-lucide="${ic}" style="width:${iconSize}px;height:${iconSize}px;color:${iconColor};display:inline-block;margin:0 6px;vertical-align:middle;"></i>`;
          } else {
            return `<span style="font-size:12px;color:${iconColor};margin:0 6px;vertical-align:middle;">•</span>`;
          }
        }).join("");
        return `<div style="text-align:${comp.align||"center"};padding:4px 0">${iconHtml}</div>`;
      }
      case "rating":     return renderRatingBlock(comp);
      case "product-card":  return renderProductCard(comp);
      case "product-grid":  return renderProductGrid(comp);
      case "coupon":     return renderCoupon(comp);
      case "countdown":  return renderCountdown(comp);
      case "qr-code":    return renderQRCode(comp);
      case "poll":       return renderPoll(comp);
      case "conditional":return `<div style="border:2px dashed #8b5cf6;border-radius:8px;padding:12px;background:#f5f3ff"><div style="font-size:10px;color:#8b5cf6;font-weight:700;margin-bottom:6px">IF: ${comp.condition}</div><div style="margin-bottom:6px;padding:6px;background:#ede9fe;border-radius:4px;font-size:12px">✅ ${comp.trueContent}</div><div style="font-size:10px;color:#888;margin:4px 0">ELSE:</div><div style="padding:6px;background:#f4f4f5;border-radius:4px;font-size:12px">❌ ${comp.falseContent}</div></div>`;
      default: return `<div style="padding:8px;background:#f4f4f5;border-radius:4px;font-size:12px;color:#888">[${comp.type}]</div>`;
    }
  }

  function renderSocialBlock(comp) {
    const icons = { twitter:"X", linkedin:"in", instagram:"IG", facebook:"fb", youtube:"YT", whatsapp:"WA", telegram:"TG" };
    return `<div style="text-align:${comp.align||"center"};padding:8px 0">${comp.links.map(l=>`<a href="${l.url||"#"}" style="display:inline-block;margin:0 6px;text-decoration:none"><span style="font-size:${comp.iconSize||28}px;font-weight:700;color:${comp.iconColor||"#8b5cf6"}" title="${l.platform}">${icons[l.platform]||"Link"}</span></a>`).join("")}</div>`;
  }
  function renderTableBlock(comp) {
    const borderColor = comp.borderColor || "#f0f0f0";
    const hdrs = comp.headers.map(h=>`<th style="background:${comp.headerBg||"#8b5cf6"};color:${comp.headerColor||"#fff"};padding:10px 14px;text-align:left;font-size:13px;border-bottom:1px solid ${borderColor}">${h}</th>`).join("");
    const rows = comp.rows.map((r,i)=>`<tr style="background:${comp.stripedRows&&i%2?"#f9f9f9":"#fff"}">${r.map(c=>`<td style="padding:9px 14px;font-size:13px;border-bottom:1px solid ${borderColor};color:#333">${c}</td>`).join("")}</tr>`).join("");
    return `<div style="overflow:auto"><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid ${borderColor}"><thead><tr>${hdrs}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  function renderRatingBlock(comp) {
    const stars = Array.from({length:comp.stars||5},(_,i)=>`<a href="${comp.baseUrl||"#"}" style="text-decoration:none;font-size:${comp.size||28}px;color:${i<(comp.filled||4)?comp.color||"#f59e0b":"#d4d4d8"}">${i<(comp.filled||4)?"★":"☆"}</a>`).join("");
    return `<div style="text-align:${comp.align||"center"};padding:4px 0">${stars}</div>`;
  }
  function renderProductCard(comp) {
    return `<div style="border:1px solid #e4e4e7;border-radius:${comp.borderRadius||12}px;overflow:hidden;max-width:320px;margin:0 auto;font-family:inherit">
      <img src="${resolveUrl(comp.imageUrl || comp.src || "")}" alt="${comp.title}" style="width:100%;display:block;object-fit:cover" />
      <div style="padding:16px">
        <h3 style="margin:0 0 6px;font-size:16px;font-weight:700;color:#18181b">${comp.title}</h3>
        <div style="margin-bottom:8px"><span style="font-size:18px;font-weight:700;color:#8b5cf6">${comp.price}</span>${comp.oldPrice?`<span style="font-size:13px;color:#a1a1aa;text-decoration:line-through;margin-left:8px">${comp.oldPrice}</span>`:""}</div>
        <p style="margin:0 0 14px;font-size:13px;color:#71717a">${comp.description}</p>
        <a href="${comp.ctaUrl||"#"}" style="display:block;text-align:center;background:${comp.ctaColor||"#8b5cf6"};color:#fff;padding:10px 20px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px">${comp.ctaLabel||"Shop Now"}</a>
      </div></div>`;
  }
  function renderProductGrid(comp) {
    const cols = comp.columns || 2;
    const items = comp.products.map(p=>`<div style="flex:0 0 calc((100% - ${(cols - 1) * 12}px) / ${cols});box-sizing:border-box;border:1px solid #e4e4e7;border-radius:10px;overflow:hidden;text-align:center"><a href="${p.url||"#"}" style="text-decoration:none"><img src="${resolveUrl(p.imageUrl || p.src || "")}" alt="${p.title}" style="width:100%;display:block;object-fit:cover" /><div style="padding:10px"><p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#18181b">${p.title}</p><p style="margin:0;font-size:13px;color:#8b5cf6;font-weight:700">${p.price}</p></div></a></div>`).join("");
    return `<div style="display:flex;flex-wrap:wrap;gap:12px">${items}</div>`;
  }
  function renderCoupon(comp) {
    return `<div style="background:${comp.bgColor||"#1a1a2e"};border:2px dashed ${comp.borderColor||"#8b5cf6"};border-radius:12px;padding:24px;text-align:center;color:${comp.textColor||"#fff"}">
      <p style="margin:0 0 4px;font-size:13px;color:${comp.headlineColor||"#a78bfa"};font-weight:600;text-transform:uppercase;letter-spacing:.1em">${comp.headline||"Exclusive Offer!"}</p>
      <div style="font-size:36px;font-weight:900;margin:16px 0;letter-spacing:-.01em">${comp.discount}</div>
      <div style="display:inline-flex;align-items:center;gap:0;border:2px solid ${comp.borderColor||"#8b5cf6"};border-radius:8px;overflow:hidden;margin:8px 0">
        <span style="padding:10px 20px;font-size:18px;font-weight:700;letter-spacing:.1em;font-family:monospace">${comp.code}</span>
        <button onclick="navigator.clipboard.writeText('${comp.code}')" style="padding:10px 16px;background:${comp.borderColor||"#8b5cf6"};color:#fff;border:none;cursor:pointer;font-weight:600;font-size:13px">Copy</button>
      </div>
      <p style="margin:8px 0 0;font-size:12px;color:${comp.textColor||"#fff"};opacity:0.75">${comp.subtext||""}</p></div>`;
  }
  function renderCountdown(comp) {
    const deadline = new Date(comp.deadline);
    const now = new Date();
    const diff = Math.max(0, deadline - now);
    const days = Math.floor(diff / 86400000);
    const hrs  = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    const box = (n,l) => `<div style="text-align:center;min-width:60px"><div style="font-size:32px;font-weight:900;background:${comp.accentColor||"#8b5cf6"};color:#fff;border-radius:10px;padding:10px 16px;line-height:1">${String(n).padStart(2,'0')}</div><div style="font-size:11px;color:#a1a1aa;margin-top:5px;text-transform:uppercase;letter-spacing:.05em">${l}</div></div>`;
    return `<div style="background:${comp.bgColor||"#1a1a2e"};border-radius:12px;padding:24px;text-align:center">
      <p style="margin:0 0 16px;color:${comp.textColor||"#fff"};font-size:14px;font-weight:600">${comp.label||"Offer ends in:"}</p>
      <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap">${box(days,"Days")}${box(hrs,"Hours")}${box(mins,"Mins")}${box(secs,"Secs")}</div></div>`;
  }
  function renderQRCode(comp) {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${comp.size||150}x${comp.size||150}&data=${encodeURIComponent(comp.url||"https://example.com")}`;
    return `<div style="text-align:${comp.align||"center"};padding:8px 0"><img src="${qrUrl}" alt="QR Code" style="border-radius:8px;border:3px solid #e4e4e7" />${comp.caption?`<p style="margin:8px 0 0;font-size:12px;color:#71717a">${comp.caption}</p>`:""}</div>`;
  }
  function renderPoll(comp) {
    const opts = comp.options.map(o=>`<a href="${o.url||"#"}" style="display:inline-flex;flex-direction:column;align-items:center;text-decoration:none;margin:0 10px"><span style="font-size:36px">${o.emoji}</span><span style="font-size:12px;color:#71717a;margin-top:4px">${o.label}</span></a>`).join("");
    return `<div style="text-align:${comp.align||"center"};padding:12px 0"><p style="margin:0 0 12px;font-weight:600;color:#18181b;font-size:15px">${comp.question}</p><div>${opts}</div></div>`;
  }

  // ── Canvas events ───────────────────────────────────────────────────────────
  function attachCanvasEvents() {
    // Select component / section
    canvas.querySelectorAll(".canvas-component").forEach(el => {
      el.addEventListener("click", e => {
        e.stopPropagation();
        const si = +el.dataset.secIdx, ci = +el.dataset.colIdx, pi = +el.dataset.compIdx;
        const alreadySelected = selectedRef?.type === "component" && selectedRef.sectionIdx === si && selectedRef.colIdx === ci && selectedRef.compIdx === pi;
        if (!alreadySelected) {
          selectedRef = { type: "component", sectionIdx: si, colIdx: ci, compIdx: pi };
          renderCanvas(); renderProperties();
        }
      });
    });

    // Select column
    canvas.querySelectorAll(".canvas-column").forEach(el => {
      el.addEventListener("click", e => {
        e.stopPropagation();
        if (e.target.closest(".canvas-component") || e.target.closest(".col-add-btn")) return;
        const si = +el.dataset.secIdx, ci = +el.dataset.colIdx;
        const alreadySelected = selectedRef?.type === "column" && selectedRef.sectionIdx === si && selectedRef.colIdx === ci;
        if (!alreadySelected) {
          selectedRef = { type: "column", sectionIdx: si, colIdx: ci };
          renderCanvas(); renderProperties();
        }
      });
    });

    canvas.querySelectorAll(".canvas-section").forEach(el => {
      el.addEventListener("click", e => {
        if (e.target.closest(".canvas-component") || e.target.closest(".canvas-column")) return;
        const si = +el.dataset.sectionIdx;
        const alreadySelected = selectedRef?.type === "section" && selectedRef.sectionIdx === si;
        if (!alreadySelected) {
          selectedRef = { type: "section", sectionIdx: si };
          renderCanvas(); renderProperties();
        }
      });
    });

    // Section actions
    canvas.querySelectorAll(".sec-action").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const si = +btn.dataset.sec, act = btn.dataset.act;
        const sec = templateData.sections;
        if (act === "del")  {
          showConfirmDialog("Delete Section", "Are you sure you want to delete this section? This will remove all blocks inside it.", true).then(ok => {
            if (ok) {
              pushHistory();
              sec.splice(si, 1); selectedRef = null;
              renderCanvas();
            }
          });
        } else {
          pushHistory();
          if (act === "up"  && si > 0)            { [sec[si-1],sec[si]] = [sec[si],sec[si-1]]; }
          if (act === "down" && si < sec.length-1) { [sec[si],sec[si+1]] = [sec[si+1],sec[si]]; }
          if (act === "dupe") { sec.splice(si+1, 0, JSON.parse(JSON.stringify(sec[si]))); }
          renderCanvas();
        }
      });
    });

    // Component actions
    canvas.querySelectorAll(".comp-del").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const si = +btn.dataset.si, ci = +btn.dataset.ci, pi = +btn.dataset.pi;
        showConfirmDialog("Delete Block", "Are you sure you want to delete this content block?", true).then(ok => {
          if (ok) {
            pushHistory();
            templateData.sections[si].columns[ci].components.splice(pi, 1);
            selectedRef = null; renderCanvas(); renderProperties();
          }
        });
      });
    });
    canvas.querySelectorAll(".comp-up").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation(); pushHistory();
        const si = +btn.dataset.si, ci = +btn.dataset.ci, pi = +btn.dataset.pi;
        const comps = templateData.sections[si].columns[ci].components;
        if (pi > 0) { [comps[pi-1],comps[pi]] = [comps[pi],comps[pi-1]]; renderCanvas(); }
      });
    });
    canvas.querySelectorAll(".comp-down").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation(); pushHistory();
        const si = +btn.dataset.si, ci = +btn.dataset.ci, pi = +btn.dataset.pi;
        const comps = templateData.sections[si].columns[ci].components;
        if (pi < comps.length-1) { [comps[pi],comps[pi+1]] = [comps[pi+1],comps[pi]]; renderCanvas(); }
      });
    });
    canvas.querySelectorAll(".comp-dupe").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation(); pushHistory();
        const si = +btn.dataset.si, ci = +btn.dataset.ci, pi = +btn.dataset.pi;
        const comps = templateData.sections[si].columns[ci].components;
        const clone = JSON.parse(JSON.stringify(comps[pi]));
        clone.id = `blk_${Date.now()}`;
        comps.splice(pi+1, 0, clone);
        renderCanvas();
      });
    });

    // Col add buttons
    canvas.querySelectorAll(".col-add-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const si = +btn.dataset.secIdx, ci = +btn.dataset.colIdx;
        // show mini block picker
        showInlineBlockPicker(si, ci, btn);
      });
    });
  }

  // ── Inline block picker ─────────────────────────────────────────────────────
  function showInlineBlockPicker(si, ci, anchor) {
    let existing = document.getElementById("inlineBlockPicker");
    if (existing) {
      existing.remove();
      // If we clicked the same button again, just toggle it off and return
      if (existing.dataset.anchorSec === String(si) && existing.dataset.anchorCol === String(ci)) {
        return;
      }
    }

    const PICKER_GROUPS = [
      {
        name: "Layout",
        items: [
          { type: "1-col", label: "1 Column", icon: "square", isLayout: true },
          { type: "2-col", label: "2 Columns", icon: "columns-2", isLayout: true },
          { type: "3-col", label: "3 Columns", icon: "columns-3", isLayout: true }
        ]
      },
      {
        name: "Content",
        items: [
          { type: "heading", label: "Heading", icon: "heading-1" },
          { type: "paragraph", label: "Text", icon: "align-left" },
          { type: "button", label: "Button", icon: "rectangle-horizontal" },
          { type: "image", label: "Image", icon: "image" },
          { type: "video", label: "Video", icon: "play-circle" },
          { type: "divider", label: "Divider", icon: "minus" },
          { type: "spacer", label: "Spacer", icon: "move-vertical" },
          { type: "social", label: "Social", icon: "share-2" },
          { type: "html", label: "HTML", icon: "code-2" },
          { type: "menu", label: "Menu", icon: "menu" }
        ]
      },
      {
        name: "Advanced",
        items: [
          { type: "table", label: "Table", icon: "table" },
          { type: "icons", label: "Icons", icon: "star" },
          { type: "rating", label: "Rating", icon: "star-half" },
          { type: "product-card", label: "Product", icon: "package" },
          { type: "coupon", label: "Coupon", icon: "ticket" },
          { type: "countdown", label: "Countdown", icon: "timer" },
          { type: "qr-code", label: "QR Code", icon: "qr-code" },
          { type: "poll", label: "Poll", icon: "bar-chart-2" },
          { type: "conditional", label: "Conditional", icon: "git-merge" }
        ]
      }
    ];

    const picker = document.createElement("div");
    picker.id = "inlineBlockPicker";
    picker.className = "inline-block-picker";
    picker.dataset.anchorSec = si;
    picker.dataset.anchorCol = ci;
    picker.style.cssText = `position:fixed; z-index:9999;`;

    picker.innerHTML = `
      <div class="picker-search-container">
        <input type="text" class="picker-search-input" placeholder="Search blocks..." autocomplete="off">
      </div>
      <div class="picker-content">
        ${PICKER_GROUPS.map(group => `
          <div class="picker-section" data-group-name="${group.name}">
            <p class="picker-section-title">${group.name}</p>
            <div class="builder-block-grid">
              ${group.items.map(item => `
                <button class="builder-block-btn picker-item-btn" data-type="${item.type}" data-label="${item.label.toLowerCase()}" ${item.isLayout ? 'data-is-layout="true"' : ''}>
                  <i data-lucide="${item.icon}"></i>
                  <span>${item.label}</span>
                </button>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>
    `;

    document.body.appendChild(picker);

    // Position popover relative to the button anchor
    const r = anchor.getBoundingClientRect();
    const pickerWidth = 280;
    
    // Boundary check
    let top = r.bottom + 4;
    let left = r.left;
    const pickerHeight = picker.offsetHeight || 380;

    if (top + pickerHeight > window.innerHeight) {
      top = r.top - pickerHeight - 4;
    }
    if (left + pickerWidth > window.innerWidth) {
      left = window.innerWidth - pickerWidth - 10;
    }
    picker.style.top = `${top}px`;
    picker.style.left = `${left}px`;

    if (typeof lucide !== "undefined") lucide.createIcons();

    // Focus search input
    const searchInp = picker.querySelector(".picker-search-input");
    searchInp?.focus();

    // Filter items
    searchInp?.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      picker.querySelectorAll(".picker-section").forEach(sec => {
        let hasAnyVisible = false;
        sec.querySelectorAll(".picker-item-btn").forEach(btn => {
          const isMatch = btn.dataset.label.includes(q);
          btn.style.display = isMatch ? "flex" : "none";
          if (isMatch) hasAnyVisible = true;
        });
        sec.style.display = hasAnyVisible ? "flex" : "none";
      });
    });

    // Add click listeners to items
    picker.querySelectorAll(".picker-item-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const type = btn.dataset.type;
        const isLayout = btn.dataset.isLayout === "true";
        if (isLayout) {
          addSection(type, si);
        } else {
          pushHistory();
          templateData.sections[si].columns[ci].components.push(defaultBlock(type));
          renderCanvas();
        }
        picker.remove();
        cleanup();
      });
    });

    // Close on escape or outside click
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        picker.remove();
        cleanup();
      }
    };
    const handleOutsideClick = (e) => {
      if (!picker.contains(e.target) && e.target !== anchor) {
        picker.remove();
        cleanup();
      }
    };

    function cleanup() {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleOutsideClick);
    }

    document.addEventListener("keydown", handleKeyDown);
    setTimeout(() => {
      document.addEventListener("click", handleOutsideClick);
    }, 50);
  }

  // ── Property Panel ──────────────────────────────────────────────────────────
  function renderProperties() {
    noSelMsg.style.display = selectedRef ? "none" : "block";
    propCont.style.display = selectedRef ? "block" : "none";
    if (!selectedRef) { propCont.innerHTML = ""; return; }

    if (selectedRef.type === "section") {
      renderSectionProps(selectedRef.sectionIdx);
    } else if (selectedRef.type === "column") {
      renderColumnProps(selectedRef.sectionIdx, selectedRef.colIdx);
    } else {
      const { sectionIdx, colIdx, compIdx } = selectedRef;
      const comp = templateData.sections[sectionIdx]?.columns[colIdx]?.components[compIdx];
      if (comp) renderComponentProps(comp, sectionIdx, colIdx, compIdx);
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function renderSectionProps(si) {
    const sec = templateData.sections[si];
    propCont.innerHTML = `
      <div class="property-group">
        <p class="property-title">Section ${si+1}</p>
        <div class="property-row"><span class="property-label">Background Color</span>
          <input type="color" class="prop" data-key="background.color" value="${sec.background.color||"#ffffff"}" style="width:100%;height:28px;border:none;border-radius:4px;cursor:pointer" /></div>
        <div class="property-row"><span class="property-label">Padding Top</span>
          <input type="number" class="prop" data-key="padding.top" value="${sec.padding.top||20}" class="property-input" /></div>
        <div class="property-row"><span class="property-label">Padding Bottom</span>
          <input type="number" class="prop" data-key="padding.bottom" value="${sec.padding.bottom||20}" class="property-input" /></div>
        <div class="property-row"><span class="property-label">Padding Left</span>
          <input type="number" class="prop" data-key="padding.left" value="${sec.padding.left||20}" class="property-input" /></div>
        <div class="property-row"><span class="property-label">Padding Right</span>
          <input type="number" class="prop" data-key="padding.right" value="${sec.padding.right||20}" class="property-input" /></div>
        <div class="property-row">
          <span class="property-label">BG Image URL</span>
          <div style="display:flex;align-items:center;gap:6px">
            <input type="text" class="prop property-input" data-key="background.imageUrl" value="${sec.background.imageUrl||""}" placeholder="https://..." style="flex:1;min-width:0" />
            <button type="button" class="ai-gen-btn" data-key="background.imageUrl" title="AI Generate" style="flex-shrink:0;width:24px;height:24px;padding:0;display:flex;align-items:center;justify-content:center;background:var(--accent-purple);border:none;border-radius:4px;cursor:pointer">
              <i data-lucide="sparkles" style="width:12px;height:12px;color:white"></i>
            </button>
          </div>
        </div>
        <div class="property-row-flex"><span class="property-label">Hide on Mobile</span>
          <input type="checkbox" class="prop" data-key="visibility.mobile" ${!sec.visibility.mobile?"checked":""} style="cursor:pointer" /></div>
        
        <div style="display:flex;gap:8px;margin-top:12px">
          <button type="button" class="btn btn-secondary btn-sm" id="addColBtn" style="flex:1">+ Add Column</button>
          <button type="button" class="btn btn-secondary btn-sm btn-danger" id="removeColBtn" style="flex:1" ${sec.columns.length <= 1 ? 'disabled' : ''}>Remove Column</button>
        </div>
        
        <button class="btn btn-secondary" id="saveSectionBtn" style="margin-top:12px;width:100%">Save as Reusable Block</button>
      </div>`;
    attachPropListeners(sec, true, si);

    document.getElementById("addColBtn")?.addEventListener("click", () => {
      pushHistory();
      sec.columns.push({ components: [], styles: { paddingTop: 8, paddingBottom: 8, paddingLeft: 8, paddingRight: 8 } });
      const w = (100 / sec.columns.length).toFixed(1) + '%';
      sec.columns.forEach(c => {
        if (!c.styles) c.styles = {};
        c.styles.width = w;
      });
      selectedRef = null;
      renderCanvas();
      renderProperties();
    });

    document.getElementById("removeColBtn")?.addEventListener("click", () => {
      if (sec.columns.length > 1) {
        pushHistory();
        sec.columns.pop();
        const w = (100 / sec.columns.length).toFixed(1) + '%';
        sec.columns.forEach(c => {
          if (!c.styles) c.styles = {};
          c.styles.width = w;
        });
        selectedRef = null;
        renderCanvas();
        renderProperties();
      }
    });

    document.getElementById("saveSectionBtn")?.addEventListener("click", async () => {
      const name = await showPromptDialog("Rename Block", "Enter the new block name:", `Section ${si+1}`);
      if (name) {
        const saved = JSON.parse(localStorage.getItem("ms_saved_blocks")||"[]");
        saved.push({ name, data: JSON.parse(JSON.stringify(templateData.sections[si])) });
        localStorage.setItem("ms_saved_blocks", JSON.stringify(saved));
        renderSavedBlocks(); showToast("Block saved!", "success");
      }
    });
  }

  function renderComponentProps(comp, si, ci, pi) {
    const commonPropMap = {
      heading:     [["Text","content","textarea"],["Font Size","fontSize","number"],["Font Weight","fontWeight","select:400|600|700|900"],["Color","color","color"],["Align","align","select:left|center|right"],["Tag","tag","select:h1|h2|h3|h4|h5|h6"],["Letter Spacing","letterSpacing","number"],["Line Height","lineHeight","number"]],
      paragraph:   [["Text","content","textarea"],["Font Size","fontSize","number"],["Color","color","color"],["Align","align","select:left|center|right"],["Line Height","lineHeight","number"]],
      button:      [["Label","label","text"],["URL","url","text"],["BG Color","bgColor","color"],["Text Color","textColor","color"],["Border Radius","borderRadius","number"],["Align","align","select:left|center|right"],["Padding X","paddingX","number"],["Padding Y","paddingY","number"],["Shadow","shadow","checkbox"]],
      image:       [["Image URL","src","text"],["Alt Text","alt","text"],["Link URL","link","text"],["Border Radius","borderRadius","number"],["Align","align","select:left|center|right"]],
      divider:     [["Style","style","select:solid|dashed|dotted"],["Thickness","thickness","number"],["Color","color","color"],["Padding Top","paddingTop","number"],["Padding Bottom","paddingBottom","number"]],
      spacer:      [["Height (px)","height","number"]],
      video:       [["Thumbnail URL","thumbnailSrc","text"],["Video URL","videoUrl","text"],["Alt Text","alt","text"],["Border Radius","borderRadius","number"]],
      "qr-code":   [["URL","url","text"],["Size (px)","size","number"],["Caption","caption","text"],["Align","align","select:left|center|right"]],
      countdown:   [["Deadline","deadline","datetime-local"],["Label","label","text"],["BG Color","bgColor","color"],["Accent Color","accentColor","color"]],
      coupon:      [["Headline","headline","text"],["Discount","discount","text"],["Code","code","text"],["Sub-text","subtext","text"],["BG Color","bgColor","color"],["Border Color","borderColor","color"],["Text Color","textColor","color"],["Headline Color","headlineColor","color"]],
      conditional: [["Condition","condition","text"],["If TRUE show","trueContent","textarea"],["If FALSE show","falseContent","textarea"]],
      "product-card": [["Image URL","imageUrl","text"],["Title","title","text"],["Price","price","text"],["Old Price","oldPrice","text"],["Description","description","textarea"],["CTA Label","ctaLabel","text"],["CTA URL","ctaUrl","text"],["CTA Color","ctaColor","color"],["Border Radius","borderRadius","number"]],
      poll:        [["Question","question","text"],["Align","align","select:left|center|right"]],
      table:       [["Header BG","headerBg","color"],["Header Text Color","headerColor","color"],["Striped Rows","stripedRows","checkbox"],["Border Color","borderColor","color"]],
      social:      [["Icon Size","iconSize","number"],["Align","align","select:left|center|right"],["Icon Color","iconColor","color"]],
      rating:      [["Max Stars","stars","number"],["Rating Value","filled","number"],["URL","baseUrl","text"],["Color","color","color"],["Size (px)","size","number"],["Align","align","select:left|center|right"]],
      html:        [["HTML Content","content","textarea"]],
      "product-grid": [["Columns","columns","number"]],
      menu:        [["Align","align","select:left|center|right"],["Color","color","color"],["Font Size","fontSize","number"],["Separator","separator","text"]],
      icons:       [["Icon Size","iconSize","number"],["Align","align","select:left|center|right"],["Icon Color","iconColor","color"]],
    };

    const fields = commonPropMap[comp.type];
    let html = `<div class="property-group"><p class="property-title">${comp.type.replace("-"," ")} block</p>`;

    if (fields) {
      fields.forEach(([label, key, inputType]) => {
        const val = comp[key] ?? "";
        const isImageField = (key === 'src' || key === 'imageUrl' || key === 'thumbnailSrc');
        const hasEmojiPicker = (comp.type === 'heading' && key === 'content') ||
                               (comp.type === 'paragraph' && key === 'content') ||
                               (comp.type === 'button' && key === 'label');

        if (isImageField) {
          html += `
            <div class="property-row">
              <span class="property-label">${label}</span>
              <div style="display:flex;align-items:center;gap:6px">
                <input type="text" class="prop property-input" data-key="${key}" value="${val}" style="flex:1;min-width:0" />
                <button type="button" class="ai-gen-btn" data-key="${key}" title="AI Generate" style="flex-shrink:0;width:24px;height:24px;padding:0;display:flex;align-items:center;justify-content:center;background:var(--accent-purple);border:none;border-radius:4px;cursor:pointer">
                  <i data-lucide="sparkles" style="width:12px;height:12px;color:white"></i>
                </button>
              </div>
            </div>
          `;
        } else if (inputType === "textarea") {
          if (hasEmojiPicker) {
            html += `
              <div class="property-row">
                <span class="property-label">${label}</span>
                <div style="display:flex;flex-direction:column;gap:4px;position:relative">
                  <textarea class="prop property-input" data-key="${key}" rows="3" style="width:100%;box-sizing:border-box">${val}</textarea>
                  <div style="display:flex;justify-content:flex-end">
                    <button type="button" class="emoji-picker-trigger-btn" data-key="${key}" title="Insert Emoji" style="padding:4px 8px;font-size:14px;background:var(--secondary);border:1px solid var(--border);border-radius:4px;cursor:pointer;display:flex;align-items:center;gap:4px">
                      😀 <span style="font-size:11px;color:var(--text-muted)">Emoji</span>
                    </button>
                  </div>
                </div>
              </div>
            `;
          } else {
            html += `<div class="property-row"><span class="property-label">${label}</span><textarea class="prop property-input" data-key="${key}" rows="3">${val}</textarea></div>`;
          }
        } else if (inputType === "color") {
          html += `<div class="property-row-flex"><span class="property-label">${label}</span><input type="color" class="prop" data-key="${key}" value="${val||"#000000"}" style="border:none;width:36px;height:26px;cursor:pointer;border-radius:4px" /></div>`;
        } else if (inputType === "checkbox") {
          html += `<div class="property-row-flex"><span class="property-label">${label}</span><input type="checkbox" class="prop" data-key="${key}" ${val?"checked":""} style="cursor:pointer" /></div>`;
        } else if (inputType.startsWith("select:")) {
          const opts = inputType.slice(7).split("|").map(o=>`<option value="${o}"${o===String(val)?" selected":""}>${o}</option>`).join("");
          html += `<div class="property-row"><span class="property-label">${label}</span><select class="prop property-select" data-key="${key}">${opts}</select></div>`;
        } else {
          if (hasEmojiPicker) {
            html += `
              <div class="property-row">
                <span class="property-label">${label}</span>
                <div style="display:flex;align-items:center;gap:6px">
                  <input type="text" class="prop property-input" data-key="${key}" value="${val}" style="flex:1;min-width:0" />
                  <button type="button" class="emoji-picker-trigger-btn" data-key="${key}" title="Insert Emoji" style="flex-shrink:0;width:28px;height:28px;padding:0;display:flex;align-items:center;justify-content:center;background:var(--secondary);border:1px solid var(--border);border-radius:4px;cursor:pointer;font-size:14px">
                    😀
                  </button>
                </div>
              </div>
            `;
          } else {
            html += `<div class="property-row"><span class="property-label">${label}</span><input type="${inputType}" class="prop property-input" data-key="${key}" value="${val}" /></div>`;
          }
        }
      });
    }

    if (comp.type === 'poll') {
      html += renderPollOptionsEditor(comp, si, ci, pi);
    } else if (comp.type === 'social') {
      html += renderSocialLinksEditor(comp, si, ci, pi);
    } else if (comp.type === 'table') {
      html += renderTableGridEditor(comp, si, ci, pi);
    } else if (comp.type === 'html') {
      html += `
        <div style="font-size:11px;color:#f59e0b;background:#fffbeb;border:1px solid #fef3c7;padding:8px 10px;border-radius:6px;margin-top:10px;font-weight:500;line-height:1.4">
          ⚠️ <strong>Live Preview Note:</strong> renders as-is, no sanitization applied — verify before sending
        </div>
      `;
    } else if (comp.type === 'product-grid') {
      html += renderProductGridEditor(comp, si, ci, pi);
    } else if (comp.type === 'menu') {
      html += renderMenuLinksEditor(comp, si, ci, pi);
    } else if (comp.type === 'icons') {
      html += renderIconsEditor(comp, si, ci, pi);
    }

    // Merge tag helper
    html += `<div class="property-row" style="margin-top:8px">
      <span class="property-label">Merge Tags</span>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">
        ${templateData.variables.map(v=>`<button class="merge-tag-btn" data-tag="{{${v.name}}}">{{${v.name.split(".").pop()}}}</button>`).join("")}
      </div></div>`;

    html += `</div>`;
    propCont.innerHTML = html;
    attachPropListeners(comp, false, si, ci, pi);

    if (comp.type === 'poll') {
      attachPollOptionsListeners(comp, si, ci, pi);
    } else if (comp.type === 'social') {
      attachSocialLinksListeners(comp, si, ci, pi);
    } else if (comp.type === 'table') {
      attachTableGridListeners(comp, si, ci, pi);
    } else if (comp.type === 'product-grid') {
      attachProductGridListeners(comp, si, ci, pi);
    } else if (comp.type === 'menu') {
      attachMenuLinksListeners(comp, si, ci, pi);
    } else if (comp.type === 'icons') {
      attachIconsListeners(comp, si, ci, pi);
    }

    propCont.querySelectorAll(".merge-tag-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const ta = propCont.querySelector("textarea.prop");
        if (ta) { const p = ta.selectionStart; ta.value = ta.value.slice(0,p)+btn.dataset.tag+ta.value.slice(p); ta.dispatchEvent(new Event("input")); }
      });
    });

    propCont.querySelectorAll(".emoji-picker-trigger-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const key = btn.dataset.key;
        const targetInput = btn.closest('.property-row').querySelector(`.prop[data-key="${key}"]`);
        if (!targetInput) return;
        
        const existing = document.querySelector(".emoji-picker-popover");
        if (existing) existing.remove();
        
        const curEmojis = ["🎉", "🔥", "⏰", "🎁", "✅", "⭐", "💰", "📢", "🚀", "❤️", "👍", "📅"];
        const rect = btn.getBoundingClientRect();
        
        const popover = document.createElement("div");
        popover.className = "emoji-picker-popover";
        popover.style.position = "absolute";
        popover.style.top = `${rect.bottom + window.scrollY + 4}px`;
        popover.style.left = `${rect.left + window.scrollX}px`;
        popover.style.background = "var(--bg-elevated, #ffffff)";
        popover.style.border = "1px solid var(--border, #e2e8f0)";
        popover.style.borderRadius = "8px";
        popover.style.padding = "8px";
        popover.style.display = "grid";
        popover.style.gridTemplateColumns = "repeat(4, 1fr)";
        popover.style.gap = "6px";
        popover.style.zIndex = "10000";
        popover.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        
        popover.innerHTML = curEmojis.map(emoji => `
          <button type="button" class="emoji-btn" style="background:none;border:none;font-size:18px;cursor:pointer;padding:4px;border-radius:4px;transition:background 0.1s;display:flex;align-items:center;justify-content:center" onmouseover="this.style.background='var(--secondary)'" onmouseout="this.style.background='none'">
            ${emoji}
          </button>
        `).join("");
        
        document.body.appendChild(popover);
        
        popover.querySelectorAll(".emoji-btn").forEach(emojiBtn => {
          emojiBtn.addEventListener("click", (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            const emoji = emojiBtn.textContent.trim();
            
            const start = targetInput.selectionStart;
            const end = targetInput.selectionEnd;
            const val = targetInput.value;
            if (start !== undefined && end !== undefined) {
              targetInput.value = val.slice(0, start) + emoji + val.slice(end);
              targetInput.selectionStart = targetInput.selectionEnd = start + emoji.length;
            } else {
              targetInput.value += emoji;
            }
            
            targetInput.focus();
            targetInput.dispatchEvent(new Event("input", { bubbles: true }));
            targetInput.dispatchEvent(new Event("change", { bubbles: true }));
            popover.remove();
          });
        });
        
        const closePopover = (evt) => {
          if (!popover.contains(evt.target) && evt.target !== btn) {
            popover.remove();
            document.removeEventListener("click", closePopover);
          }
        };
        setTimeout(() => {
          document.addEventListener("click", closePopover);
        }, 50);
      });
    });
  }

  function renderPollOptionsEditor(comp, si, ci, pi) {
    let optHtml = `<div class="property-row" style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px">
      <span class="property-label" style="font-weight:600;margin-bottom:8px">Poll Options</span>`;
    
    (comp.options || []).forEach((opt, oIdx) => {
      optHtml += `
      <div class="property-row-flex" style="gap:4px;margin-bottom:6px;align-items:center">
        <input type="text" class="property-input poll-opt-emoji" data-oidx="${oIdx}" value="${opt.emoji || ''}" placeholder="Emoji" style="width:50px;text-align:center" />
        <input type="text" class="property-input poll-opt-label" data-oidx="${oIdx}" value="${opt.label || ''}" placeholder="Label" style="flex:1;min-width:0" />
        <input type="text" class="property-input poll-opt-url" data-oidx="${oIdx}" value="${opt.url || ''}" placeholder="URL" style="flex:1;min-width:0" />
        <button type="button" class="btn-sm btn-danger remove-poll-opt-btn" data-oidx="${oIdx}" style="padding:4px 8px;color:#ef4444;background:none;border:none;cursor:pointer;font-weight:bold;font-size:14px" title="Delete">✕</button>
      </div>`;
    });

    optHtml += `
      <button type="button" class="btn btn-secondary btn-sm" id="addPollOptBtn" style="width:100%;margin-top:8px">+ Add Option</button>
    </div>`;
    return optHtml;
  }

  function attachPollOptionsListeners(comp, si, ci, pi) {
    const container = propCont;
    
    container.querySelectorAll('.poll-opt-emoji').forEach(inp => {
      inp.addEventListener('input', () => {
        const oIdx = +inp.dataset.oidx;
        comp.options[oIdx].emoji = inp.value;
        renderCanvas();
      });
      inp.addEventListener('change', () => {
        pushHistory();
        renderCanvas();
      });
    });

    container.querySelectorAll('.poll-opt-label').forEach(inp => {
      inp.addEventListener('input', () => {
        const oIdx = +inp.dataset.oidx;
        comp.options[oIdx].label = inp.value;
        renderCanvas();
      });
      inp.addEventListener('change', () => {
        pushHistory();
        renderCanvas();
      });
    });

    container.querySelectorAll('.poll-opt-url').forEach(inp => {
      inp.addEventListener('input', () => {
        const oIdx = +inp.dataset.oidx;
        comp.options[oIdx].url = inp.value;
        renderCanvas();
      });
      inp.addEventListener('change', () => {
        pushHistory();
        renderCanvas();
      });
    });

    container.querySelectorAll('.remove-poll-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        pushHistory();
        const oIdx = +btn.dataset.oidx;
        comp.options.splice(oIdx, 1);
        renderCanvas();
        renderProperties();
      });
    });

    document.getElementById('addPollOptBtn')?.addEventListener('click', () => {
      pushHistory();
      comp.options.push({ emoji: '⭐', label: 'New Option', url: '#' });
      renderCanvas();
      renderProperties();
    });
  }

  function renderSocialLinksEditor(comp, si, ci, pi) {
    let slHtml = `<div class="property-row" style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px">
      <span class="property-label" style="font-weight:600;margin-bottom:8px">Social Links</span>`;
    
    (comp.links || []).forEach((lnk, lIdx) => {
      slHtml += `
      <div class="property-row-flex" style="gap:4px;margin-bottom:6px;align-items:center">
        <select class="property-select social-lnk-platform" data-lidx="${lIdx}" style="width:100px;font-size:12px">
          <option value="twitter" ${lnk.platform === 'twitter' ? 'selected' : ''}>Twitter/X</option>
          <option value="linkedin" ${lnk.platform === 'linkedin' ? 'selected' : ''}>LinkedIn</option>
          <option value="instagram" ${lnk.platform === 'instagram' ? 'selected' : ''}>Instagram</option>
          <option value="facebook" ${lnk.platform === 'facebook' ? 'selected' : ''}>Facebook</option>
          <option value="youtube" ${lnk.platform === 'youtube' ? 'selected' : ''}>YouTube</option>
          <option value="whatsapp" ${lnk.platform === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
          <option value="telegram" ${lnk.platform === 'telegram' ? 'selected' : ''}>Telegram</option>
        </select>
        <input type="text" class="property-input social-lnk-url" data-lidx="${lIdx}" value="${lnk.url || ''}" placeholder="URL" style="flex:1;min-width:0" />
        <button type="button" class="btn-sm btn-danger remove-social-lnk-btn" data-lidx="${lIdx}" style="padding:4px 8px;color:#ef4444;background:none;border:none;cursor:pointer;font-weight:bold;font-size:14px" title="Delete">✕</button>
      </div>`;
    });

    slHtml += `
      <button type="button" class="btn btn-secondary btn-sm" id="addSocialLnkBtn" style="width:100%;margin-top:8px">+ Add Link</button>
    </div>`;
    return slHtml;
  }

  function attachSocialLinksListeners(comp, si, ci, pi) {
    const container = propCont;

    container.querySelectorAll('.social-lnk-platform').forEach(inp => {
      inp.addEventListener('change', () => {
        pushHistory();
        const lIdx = +inp.dataset.lidx;
        comp.links[lIdx].platform = inp.value;
        renderCanvas();
      });
    });

    container.querySelectorAll('.social-lnk-url').forEach(inp => {
      inp.addEventListener('input', () => {
        const lIdx = +inp.dataset.lidx;
        comp.links[lIdx].url = inp.value;
        renderCanvas();
      });
      inp.addEventListener('change', () => {
        pushHistory();
        renderCanvas();
      });
    });

    container.querySelectorAll('.remove-social-lnk-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        pushHistory();
        const lIdx = +btn.dataset.lidx;
        comp.links.splice(lIdx, 1);
        renderCanvas();
        renderProperties();
      });
    });

    document.getElementById('addSocialLnkBtn')?.addEventListener('click', () => {
      pushHistory();
      comp.links.push({ platform: 'twitter', url: '#' });
      renderCanvas();
      renderProperties();
    });
  }

  function renderMenuLinksEditor(comp, si, ci, pi) {
    let mlHtml = `<div class="property-row" style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px">
      <span class="property-label" style="font-weight:600;margin-bottom:8px">Menu Links</span>`;
    
    (comp.links || []).forEach((lnk, lIdx) => {
      mlHtml += `
      <div class="property-row-flex" style="gap:4px;margin-bottom:6px;align-items:center">
        <input type="text" class="property-input menu-lnk-label" data-lidx="${lIdx}" value="${lnk.label || ''}" placeholder="Label" style="width:90px" />
        <input type="text" class="property-input menu-lnk-url" data-lidx="${lIdx}" value="${lnk.url || ''}" placeholder="URL" style="flex:1;min-width:0" />
        <button type="button" class="btn-sm btn-danger remove-menu-lnk-btn" data-lidx="${lIdx}" style="padding:4px 8px;color:#ef4444;background:none;border:none;cursor:pointer;font-weight:bold;font-size:14px" title="Delete">✕</button>
      </div>`;
    });

    mlHtml += `
      <button type="button" class="btn btn-secondary btn-sm" id="addMenuLnkBtn" style="width:100%;margin-top:8px">+ Add Link</button>
    </div>`;
    return mlHtml;
  }

  function attachMenuLinksListeners(comp, si, ci, pi) {
    const container = propCont;

    container.querySelectorAll('.menu-lnk-label').forEach(inp => {
      inp.addEventListener('input', () => {
        const lIdx = +inp.dataset.lidx;
        if (comp.links[lIdx]) {
          comp.links[lIdx].label = inp.value;
          renderCanvas();
        }
      });
      inp.addEventListener('change', () => {
        pushHistory();
        renderCanvas();
      });
    });

    container.querySelectorAll('.menu-lnk-url').forEach(inp => {
      inp.addEventListener('input', () => {
        const lIdx = +inp.dataset.lidx;
        if (comp.links[lIdx]) {
          comp.links[lIdx].url = inp.value;
          renderCanvas();
        }
      });
      inp.addEventListener('change', () => {
        pushHistory();
        renderCanvas();
      });
    });

    container.querySelectorAll('.remove-menu-lnk-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        pushHistory();
        const lIdx = +btn.dataset.lidx;
        comp.links.splice(lIdx, 1);
        renderCanvas();
        renderProperties();
      });
    });

    document.getElementById('addMenuLnkBtn')?.addEventListener('click', () => {
      pushHistory();
      if (!comp.links) comp.links = [];
      comp.links.push({ label: 'New Link', url: '#' });
      renderCanvas();
      renderProperties();
    });
  }

  function renderIconsEditor(comp, si, ci, pi) {
    const iconOptions = ["star", "heart", "check-circle", "mail", "phone", "gift", "truck", "shield", "clock", "thumbs-up"];
    let icHtml = `<div class="property-row" style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px">
      <span class="property-label" style="font-weight:600;margin-bottom:8px">Icons List</span>`;
    
    (comp.icons || []).forEach((ic, iIdx) => {
      let opts = iconOptions;
      if (ic && !iconOptions.includes(ic)) {
        opts = [ic, ...iconOptions];
      }
      
      const optionTags = opts.map(opt => `<option value="${opt}" ${ic === opt ? 'selected' : ''}>${opt}</option>`).join('');

      icHtml += `
      <div class="property-row-flex" style="gap:4px;margin-bottom:6px;align-items:center">
        <select class="property-select icons-list-select" data-iidx="${iIdx}" style="flex:1;min-width:0;font-size:12px">
          ${optionTags}
        </select>
        <button type="button" class="btn-sm btn-danger remove-icons-btn" data-iidx="${iIdx}" style="padding:4px 8px;color:#ef4444;background:none;border:none;cursor:pointer;font-weight:bold;font-size:14px" title="Delete">✕</button>
      </div>`;
    });

    icHtml += `
      <button type="button" class="btn btn-secondary btn-sm" id="addIconsBtn" style="width:100%;margin-top:8px">+ Add Icon</button>
    </div>`;
    return icHtml;
  }

  function attachIconsListeners(comp, si, ci, pi) {
    const container = propCont;

    container.querySelectorAll('.icons-list-select').forEach(inp => {
      inp.addEventListener('change', () => {
        pushHistory();
        const iIdx = +inp.dataset.iidx;
        comp.icons[iIdx] = inp.value;
        renderCanvas();
      });
    });

    container.querySelectorAll('.remove-icons-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        pushHistory();
        const iIdx = +btn.dataset.iidx;
        comp.icons.splice(iIdx, 1);
        renderCanvas();
        renderProperties();
      });
    });

    document.getElementById('addIconsBtn')?.addEventListener('click', () => {
      pushHistory();
      if (!comp.icons) comp.icons = [];
      comp.icons.push('star');
      renderCanvas();
      renderProperties();
    });
  }

  function renderTableGridEditor(comp, si, ci, pi) {
    let tHtml = `<div class="property-row" style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px">
      <span class="property-label" style="font-weight:600;margin-bottom:8px">Table Grid Editor</span>
      <div style="overflow-x:auto;width:100%;background:#ffffff;border:1px solid var(--border);border-radius:6px;padding:8px">
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr>`;
    
    comp.headers.forEach((h, hIdx) => {
      tHtml += `<th style="padding:4px"><input type="text" class="property-input table-header-input" data-hidx="${hIdx}" value="${h}" style="width:100%;font-size:11px;font-weight:bold" /></th>`;
    });
    tHtml += `<th style="width:30px;padding:4px"></th></tr></thead><tbody>`;

    comp.rows.forEach((row, rIdx) => {
      tHtml += `<tr>`;
      row.forEach((cell, cIdx) => {
        tHtml += `<td style="padding:4px"><input type="text" class="property-input table-cell-input" data-ridx="${rIdx}" data-cidx="${cIdx}" value="${cell}" style="width:100%;font-size:11px" /></td>`;
      });
      tHtml += `<td style="padding:4px;text-align:center"><button type="button" class="remove-table-row-btn" data-ridx="${rIdx}" style="color:#ef4444;background:none;border:none;cursor:pointer;font-weight:bold" title="Delete Row">✕</button></td></tr>`;
    });

    tHtml += `</tbody></table></div>`;

    tHtml += `
      <div style="display:flex;gap:6px;margin-top:8px">
        <button type="button" class="btn btn-secondary btn-sm" id="addTableRowBtn" style="flex:1">+ Row</button>
        <button type="button" class="btn btn-secondary btn-sm" id="addTableColBtn" style="flex:1">+ Col</button>
        <button type="button" class="btn btn-secondary btn-sm btn-danger" id="removeTableColBtn" style="flex:1" ${comp.headers.length <= 1 ? 'disabled' : ''}>- Col</button>
      </div>
    </div>`;
    return tHtml;
  }

  function attachTableGridListeners(comp, si, ci, pi) {
    const container = propCont;

    container.querySelectorAll('.table-header-input').forEach(inp => {
      inp.addEventListener('input', () => {
        const hIdx = +inp.dataset.hidx;
        comp.headers[hIdx] = inp.value;
        renderCanvas();
      });
      inp.addEventListener('change', () => {
        pushHistory();
        renderCanvas();
      });
    });

    container.querySelectorAll('.table-cell-input').forEach(inp => {
      inp.addEventListener('input', () => {
        const rIdx = +inp.dataset.ridx;
        const cIdx = +inp.dataset.cidx;
        comp.rows[rIdx][cIdx] = inp.value;
        renderCanvas();
      });
      inp.addEventListener('change', () => {
        pushHistory();
        renderCanvas();
      });
    });

    container.querySelectorAll('.remove-table-row-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        pushHistory();
        const rIdx = +btn.dataset.ridx;
        comp.rows.splice(rIdx, 1);
        renderCanvas();
        renderProperties();
      });
    });

    document.getElementById('addTableRowBtn')?.addEventListener('click', () => {
      pushHistory();
      const newRow = Array.from({ length: comp.headers.length }, () => 'New cell');
      comp.rows.push(newRow);
      renderCanvas();
      renderProperties();
    });

    document.getElementById('addTableColBtn')?.addEventListener('click', () => {
      pushHistory();
      comp.headers.push('New Header');
      comp.rows.forEach(r => r.push('New cell'));
      renderCanvas();
      renderProperties();
    });

    document.getElementById('removeTableColBtn')?.addEventListener('click', () => {
      if (comp.headers.length > 1) {
        pushHistory();
        comp.headers.pop();
        comp.rows.forEach(r => r.pop());
        renderCanvas();
        renderProperties();
      }
    });
  }

  function renderProductGridEditor(comp, si, ci, pi) {
    let pGridHtml = `<div class="property-row" style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px">
      <span class="property-label" style="font-weight:600;margin-bottom:8px">Products Grid List</span>`;

    (comp.products || []).forEach((prod, pIdx) => {
      pGridHtml += `
      <div class="product-item-card" style="border:1px solid var(--border);border-radius:6px;padding:10px;margin-bottom:10px;background:var(--bg-elevated);position:relative">
        <button type="button" class="btn-sm btn-danger remove-grid-prod-btn" data-pidx="${pIdx}" style="position:absolute;top:6px;right:6px;padding:2px 6px;color:#ef4444;background:none;border:none;cursor:pointer;font-weight:bold;font-size:14px" title="Delete Product">✕</button>
        
        <div class="property-row" style="margin-bottom:6px">
          <span class="property-label" style="font-size:11px">Image URL</span>
          <div style="display:flex;align-items:center;gap:6px">
            <input type="text" class="prop property-input grid-prod-img" data-pidx="${pIdx}" value="${prod.imageUrl || prod.src || ''}" placeholder="https://..." style="font-size:11px;flex:1;min-width:0" />
            <button type="button" class="ai-gen-btn" data-key="products.${pIdx}.imageUrl" data-pidx="${pIdx}" title="AI Generate" style="flex-shrink:0;width:24px;height:24px;padding:0;display:flex;align-items:center;justify-content:center;background:var(--accent-purple);border:none;border-radius:4px;cursor:pointer">
              <i data-lucide="sparkles" style="width:12px;height:12px;color:white"></i>
            </button>
          </div>
        </div>

        <div style="margin-bottom:6px">
          <span class="property-label" style="font-size:11px">Title</span>
          <input type="text" class="property-input grid-prod-title" data-pidx="${pIdx}" value="${prod.title || ''}" placeholder="Product Title" style="font-size:11px" />
        </div>

        <div style="display:flex;gap:6px">
          <div style="flex:1">
            <span class="property-label" style="font-size:11px">Price</span>
            <input type="text" class="property-input grid-prod-price" data-pidx="${pIdx}" value="${prod.price || ''}" placeholder="$0.00" style="font-size:11px" />
          </div>
          <div style="flex:1">
            <span class="property-label" style="font-size:11px">Link URL</span>
            <input type="text" class="property-input grid-prod-url" data-pidx="${pIdx}" value="${prod.url || ''}" placeholder="#" style="font-size:11px" />
          </div>
        </div>
      </div>`;
    });

    pGridHtml += `
      <button type="button" class="btn btn-secondary btn-sm" id="addGridProdBtn" style="width:100%;margin-top:8px">+ Add Product</button>
    </div>`;
    return pGridHtml;
  }

  function attachProductGridListeners(comp, si, ci, pi) {
    const container = propCont;

    container.querySelectorAll('.grid-prod-img').forEach(inp => {
      const updateVal = () => {
        const pIdx = +inp.dataset.pidx;
        comp.products[pIdx].imageUrl = inp.value;
        renderCanvas();
      };
      inp.addEventListener('input', updateVal);
      inp.addEventListener('change', () => {
        pushHistory();
        updateVal();
      });
    });

    container.querySelectorAll('.grid-prod-title').forEach(inp => {
      const updateVal = () => {
        const pIdx = +inp.dataset.pidx;
        comp.products[pIdx].title = inp.value;
        renderCanvas();
      };
      inp.addEventListener('input', updateVal);
      inp.addEventListener('change', () => {
        pushHistory();
        updateVal();
      });
    });

    container.querySelectorAll('.grid-prod-price').forEach(inp => {
      const updateVal = () => {
        const pIdx = +inp.dataset.pidx;
        comp.products[pIdx].price = inp.value;
        renderCanvas();
      };
      inp.addEventListener('input', updateVal);
      inp.addEventListener('change', () => {
        pushHistory();
        updateVal();
      });
    });

    container.querySelectorAll('.grid-prod-url').forEach(inp => {
      const updateVal = () => {
        const pIdx = +inp.dataset.pidx;
        comp.products[pIdx].url = inp.value;
        renderCanvas();
      };
      inp.addEventListener('input', updateVal);
      inp.addEventListener('change', () => {
        pushHistory();
        updateVal();
      });
    });

    container.querySelectorAll('.remove-grid-prod-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        pushHistory();
        const pIdx = +btn.dataset.pidx;
        comp.products.splice(pIdx, 1);
        renderCanvas();
        renderProperties();
      });
    });

    document.getElementById('addGridProdBtn')?.addEventListener('click', () => {
      pushHistory();
      comp.products.push({
        imageUrl: 'https://placehold.co/150x150/1a1a2e/a78bfa?text=Product',
        title: 'New Product',
        price: '$0.00',
        url: '#'
      });
      renderCanvas();
      renderProperties();
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function renderColumnProps(si, ci) {
    const col = templateData.sections[si].columns[ci];
    const widthVal = col.styles?.width ? parseFloat(col.styles.width) : (100 / templateData.sections[si].columns.length);
    
    propCont.innerHTML = `
      <div class="property-group">
        <p class="property-title">Section ${si+1} — Column ${ci+1}</p>
        
        <div class="property-row">
          <span class="property-label">Column Width (%)</span>
          <input type="number" id="colWidthInput" class="property-input" min="10" max="100" value="${Math.round(widthVal)}" />
        </div>
        
        <div class="property-row">
          <span class="property-label">Padding Top (px)</span>
          <input type="number" class="prop-col" data-key="paddingTop" value="${col.styles?.paddingTop ?? 8}" class="property-input" />
        </div>
        <div class="property-row">
          <span class="property-label">Padding Bottom (px)</span>
          <input type="number" class="prop-col" data-key="paddingBottom" value="${col.styles?.paddingBottom ?? 8}" class="property-input" />
        </div>
        <div class="property-row">
          <span class="property-label">Padding Left (px)</span>
          <input type="number" class="prop-col" data-key="paddingLeft" value="${col.styles?.paddingLeft ?? 8}" class="property-input" />
        </div>
        <div class="property-row">
          <span class="property-label">Padding Right (px)</span>
          <input type="number" class="prop-col" data-key="paddingRight" value="${col.styles?.paddingRight ?? 8}" class="property-input" />
        </div>

        <div class="property-row">
          <span class="property-label">Background Color</span>
          <input type="color" class="prop-col" data-key="backgroundColor" value="${col.styles?.backgroundColor || "#ffffff"}" style="width:100%;height:28px;border:none;border-radius:4px;cursor:pointer" />
        </div>

        <div class="property-row">
          <span class="property-label">Vertical Align</span>
          <select class="prop-col property-select" data-key="verticalAlign">
            <option value="top" ${col.styles?.verticalAlign === 'top' ? 'selected' : ''}>Top</option>
            <option value="middle" ${col.styles?.verticalAlign === 'middle' ? 'selected' : ''}>Middle</option>
            <option value="bottom" ${col.styles?.verticalAlign === 'bottom' ? 'selected' : ''}>Bottom</option>
          </select>
        </div>
      </div>
    `;

    document.getElementById("colWidthInput")?.addEventListener("change", (e) => {
      pushHistory();
      const val = Math.min(100, Math.max(10, +e.target.value));
      const cols = templateData.sections[si].columns;
      if (cols.length > 1) {
        const oldSum = cols.reduce((sum, c, idx) => idx === ci ? sum : sum + parseFloat(c.styles.width || (100/cols.length)), 0);
        const newRem = 100 - val;
        cols.forEach((c, idx) => {
          if (idx === ci) {
            c.styles.width = `${val}%`;
          } else {
            const oldW = parseFloat(c.styles.width || (100/cols.length));
            const share = oldSum > 0 ? (oldW / oldSum) : (1 / (cols.length - 1));
            c.styles.width = `${(share * newRem).toFixed(1)}%`;
          }
        });
      } else {
        cols[0].styles.width = "100%";
      }
      renderCanvas();
    });

    propCont.querySelectorAll('.prop-col').forEach(inp => {
      const isImmediate = (inp.type === 'color' || inp.tagName === 'SELECT');
      const applyVal = () => {
        const key = inp.dataset.key;
        const val = inp.type === 'number' ? +inp.value : inp.value;
        if (!col.styles) col.styles = {};
        col.styles[key] = val;
      };

      if (isImmediate) {
        inp.addEventListener('change', () => {
          pushHistory();
          applyVal();
          renderCanvas();
        });
      } else {
        inp.addEventListener('input', () => {
          applyVal();
          renderCanvas();
        });
        inp.addEventListener('change', () => {
          pushHistory();
          applyVal();
          renderCanvas();
        });
        inp.addEventListener('blur', () => {
          pushHistory();
          applyVal();
          renderCanvas();
        });
      }
    });
  }

  function attachPropListeners(target, isSection, si, ci, pi) {
    let renderDebounce = null;

    propCont.querySelectorAll('.prop').forEach(inp => {
      const isText = (inp.tagName === 'TEXTAREA' || inp.type === 'text' || inp.type === 'number' || inp.type === 'datetime-local');
      const isImmediate = (inp.type === 'checkbox' || inp.type === 'color' || inp.tagName === 'SELECT');

      const applyValue = () => {
        const keys = inp.dataset.key.split('.');
        const val  = inp.type === 'checkbox' ? inp.checked
                   : inp.type === 'number'   ? inp.value
                   : inp.value;
        let obj = isSection
          ? templateData.sections[si]
          : templateData.sections[si].columns[ci].components[pi];
        for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
        const lastKey = keys[keys.length - 1];
        obj[lastKey] = val;

        // Also if we are updating imageUrl or src on image, sync them!
        if (!isSection && obj.type === 'image') {
          if (lastKey === 'src') {
            obj.imageUrl = val;
          } else if (lastKey === 'imageUrl') {
            obj.src = val;
          }
        }
      };

      if (isImmediate) {
        inp.addEventListener('change', () => {
          pushHistory();
          applyValue();
          renderCanvas();
          if (selectedRef) renderProperties();
        });
      } else {
        // Live update: apply value to data immediately, debounce the expensive canvas re-render
        inp.addEventListener('input', () => {
          applyValue();
          // Update matching DOM element text in place for instant feedback (heading/paragraph only)
          if (!isSection && selectedRef?.type === 'component') {
            const comp = templateData.sections[si]?.columns[ci]?.components[pi];
            if (comp && (comp.type === 'heading' || comp.type === 'paragraph') && inp.dataset.key === 'content') {
              const compEl = canvas.querySelector(`[data-sec-idx="${si}"][data-col-idx="${ci}"][data-comp-idx="${pi}"]`);
              if (compEl) {
                const inner = compEl.querySelector(comp.type === 'heading' ? (comp.tag || 'h2') : 'p');
                if (inner) inner.textContent = inp.value;
              }
            }
          }
          // Debounce the full canvas re-render
          clearTimeout(renderDebounce);
          renderDebounce = setTimeout(() => {
            pushHistory();
            renderCanvas();
          }, 350);
        });

        inp.addEventListener('change', () => {
          clearTimeout(renderDebounce);
          pushHistory();
          applyValue();
          renderCanvas();
        });

        inp.addEventListener('blur', () => {
          clearTimeout(renderDebounce);
          pushHistory();
          applyValue();
          renderCanvas();
        });
      }
    });
  }

  // ── Sidebar click handlers ──────────────────────────────────────────────────
  document.querySelectorAll("[data-layout]").forEach(btn =>
    btn.addEventListener("click", () => addSection(btn.dataset.layout))
  );
  document.querySelectorAll("[data-content]").forEach(btn =>
    btn.addEventListener("click", () => addContentBlock(btn.dataset.content))
  );

  // ── Global theme controls ───────────────────────────────────────────────────
  function syncThemeUI() {
    const g = templateData.globalTheme;
    const s = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    s('globalFont',     g.fontFamily       || 'Inter, sans-serif');
    s('globalBg',       g.backgroundColor  || '#f4f4f5');
    s('globalText',     g.textColor        || '#18181b');
    s('globalLink',     g.linkColor        || '#8b5cf6');
    s('globalBtnColor', g.buttonColor      || '#8b5cf6');
  }

  document.getElementById("globalFont")?.addEventListener("change", e => {
    pushHistory(); templateData.globalTheme.fontFamily = e.target.value; renderCanvas();
  });
  document.getElementById("globalBg")?.addEventListener("input", e => {
    templateData.globalTheme.backgroundColor = e.target.value; canvas.style.backgroundColor = e.target.value;
  });
  document.getElementById("globalText")?.addEventListener("input", e => {
    templateData.globalTheme.textColor = e.target.value; renderCanvas();
  });
  document.getElementById("globalLink")?.addEventListener("input", e => {
    templateData.globalTheme.linkColor = e.target.value; renderCanvas();
  });
  document.getElementById("globalBtnColor")?.addEventListener("input", e => {
    templateData.globalTheme.buttonColor = e.target.value; renderCanvas();
  });

  // ── New Template button ──────────────────────────────────────────────────────
  document.getElementById("newTemplateBtn")?.addEventListener("click", async () => {
    // Only confirm if there's actual content to lose
    if (templateData.sections.length > 0) {
      const ok = await showConfirmDialog("New Template", "Start a new blank template? All unsaved changes will be lost.");
      if (!ok) return;
    }
    currentTemplateId = null;
    undoStack = []; redoStack = [];
    templateData = {
      name: "Untitled Template", version: "2.0",
      globalTheme: { fontFamily: "Inter, sans-serif", backgroundColor: "#f4f4f5", textColor: "#18181b", linkColor: "#8b5cf6", buttonColor: "#8b5cf6" },
      variables: [
        { name: "customer.name", fallback: "there" }, { name: "customer.firstName", fallback: "there" },
        { name: "customer.email", fallback: "" }, { name: "org.name", fallback: "our team" },
        { name: "unsubscribe_link", fallback: "#" },
      ],
      sections: [],
      tracking: { openTracking: true, clickTracking: true },
      metadata: { aiPrompt: "", category: "marketing", subject: "", preheader: "" }
    };
    nameInput.value = templateData.name;
    localStorage.removeItem("ms_draft");
    localStorage.removeItem("ms_builder_draft");
    localStorage.removeItem("ms_builder_name");
    syncThemeUI();
    // Add a default blank 1-column section so canvas opens ready to use
    addSection("1-col");
    hasUnsavedChanges = false;
    updateDraftIndicator();
    showToast("New blank template created", "success");
  });

  // ── Template name ───────────────────────────────────────────────────────────
  nameInput?.addEventListener("input", () => { templateData.name = nameInput.value; scheduleAutoSave(); });

  // ── Preview toggle ──────────────────────────────────────────────────────────
  document.getElementById("viewToggleMobile")?.addEventListener("click", () => {
    canvas.classList.toggle("preview-mobile");
    document.getElementById("viewToggleMobile").style.background = canvas.classList.contains("preview-mobile") ? "var(--primary)" : "";
    document.getElementById("viewToggleDesktop").style.background = "";
  });
  document.getElementById("viewToggleDesktop")?.addEventListener("click", () => {
    canvas.classList.remove("preview-mobile");
    document.getElementById("viewToggleDesktop").style.background = "var(--secondary-hover)";
    document.getElementById("viewToggleMobile").style.background = "";
  });

  // ── Dark preview toggle ─────────────────────────────────────────────────────
  document.getElementById("darkPreviewBtn")?.addEventListener("click", () => {
    isDarkPreview = !isDarkPreview;
    canvas.parentElement.style.background = isDarkPreview ? "#1a1a2e" : "#e4e4e7";
    document.getElementById("darkPreviewBtn").style.background = isDarkPreview ? "var(--primary)" : "";
    showToast(isDarkPreview ? "Dark mode preview on" : "Dark mode preview off", "info");
  });

  // ── Export HTML ─────────────────────────────────────────────────────────────
  function exportHTML() {
    const sections = templateData.sections.map(sec => {
      const cols = sec.columns.map(col => {
        const comps = col.components.map(c => renderBlockHTML(c)).join("");
        return `<td valign="top" style="padding:${col.styles?.padding||"4px"}">${comps}</td>`;
      }).join("");
      return `<tr><td style="background:${sec.background.color||"#fff"};padding:${sec.padding.top||20}px ${sec.padding.right||20}px ${sec.padding.bottom||20}px ${sec.padding.left||20}px">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>${cols}</tr></table></td></tr>`;
    }).join("");

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${templateData.name}</title></head>
<body style="margin:0;padding:0;background:${templateData.globalTheme.backgroundColor};font-family:${templateData.globalTheme.fontFamily}">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">${sections}</table>
</td></tr></table></body></html>`;
  }

  document.getElementById("exportHtmlBtn")?.addEventListener("click", () => {
    const html = exportHTML();
    document.getElementById("codeModalTitle").textContent = "Export HTML";
    document.getElementById("codeTextarea").value = html;
    document.getElementById("codeModal").style.display = "flex";
  });
  document.getElementById("exportJsonBtn")?.addEventListener("click", () => {
    document.getElementById("codeModalTitle").textContent = "Export JSON";
    document.getElementById("codeTextarea").value = JSON.stringify(templateData, null, 2);
    document.getElementById("codeModal").style.display = "flex";
  });
  document.getElementById("importJsonBtn")?.addEventListener("click", async () => {
    const json = await showPromptDialog("Import JSON", "Paste the template JSON here:");
    if (!json) return;
    try { pushHistory(); templateData = JSON.parse(json); renderCanvas(); nameInput.value = templateData.name; showToast("Imported!", "success"); }
    catch { showToast("Invalid JSON", "error"); }
  });
  document.getElementById("closeModalBtn")?.addEventListener("click", () => { document.getElementById("codeModal").style.display = "none"; });
  document.getElementById("copyCodeBtn")?.addEventListener("click", () => {
    navigator.clipboard.writeText(document.getElementById("codeTextarea").value);
    showToast("Copied!", "success");
  });

  // ── Save to DB ──────────────────────────────────────────────────────────────
  document.getElementById("saveTemplateBtn")?.addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    const origHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span style="border:2px solid #ffffff;border-top:2px solid transparent;border-radius:50%;width:12px;height:12px;display:inline-block;animation:spin 1s linear infinite;margin-right:6px;vertical-align:middle"></span>Saving...';
    
    const html = exportHTML();
    try {
      const payload = { name: templateData.name, jsonData: templateData, htmlContent: html, subject: templateData.metadata?.subject || "" };
      let res;
      if (currentTemplateId) {
        res = await fetch(`/api/templates/${currentTemplateId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        res = await fetch('/api/templates', { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (data.success) currentTemplateId = data.data._id;
      }
      if (res.ok) {
        btn.classList.add("btn-success");
        btn.innerHTML = '<i data-lucide="check-circle" style="width:14px;height:14px;vertical-align:middle"></i> Saved!';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        showToast("Template saved to database!", "success");
        if (typeof loadMyTemplates === "function") loadMyTemplates();
        hasUnsavedChanges = false;
        updateDraftIndicator();
        setTimeout(() => {
          btn.classList.remove("btn-success");
          btn.innerHTML = origHtml;
          btn.disabled = false;
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 2000);
      } else {
        btn.classList.add("btn-danger");
        btn.innerHTML = 'Failed';
        showToast("Save failed — check console", "error");
        setTimeout(() => {
          btn.classList.remove("btn-danger");
          btn.innerHTML = origHtml;
          btn.disabled = false;
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 2000);
      }
    } catch (err) {
      btn.classList.add("btn-danger");
      btn.innerHTML = 'Error';
      showToast("Save error: " + err.message, "error");
      setTimeout(() => {
        btn.classList.remove("btn-danger");
        btn.innerHTML = origHtml;
        btn.disabled = false;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }, 2000);
    }
  });

  // ── AI Panel ────────────────────────────────────────────────────────────────
  document.getElementById("aiGenerateBtn")?.addEventListener("click", async () => {
    const prompt = document.getElementById("aiPromptInput")?.value?.trim();
    if (!prompt) return showToast("Enter a prompt first", "error");
    document.getElementById("aiGenerateBtn").textContent = "Generating…";
    document.getElementById("aiGenerateBtn").disabled = true;
    try {
      const res = await fetch('/api/ai/generate', {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, context: { orgName: window._session?.orgName || "Mail Sender" } })
      });
      const data = await res.json();
      if (data.success) {
        pushHistory();
        if (!templateData.sections.length) addSection("1-col");
        const lastSec = templateData.sections[templateData.sections.length - 1];
        lastSec.columns[0].components.push({ id: `blk_ai_${Date.now()}`, type: "html", content: data.html });
        templateData.metadata.aiPrompt = prompt;
        renderCanvas();
        showToast("AI content added to canvas!", "success");
      } else showToast(data.error || "AI failed", "error");
    } catch (err) { showToast("AI error: " + err.message, "error"); }
    document.getElementById("aiGenerateBtn").textContent = "Generate";
    document.getElementById("aiGenerateBtn").disabled = false;
  });

  // ── AI Subject Lines ────────────────────────────────────────────────────────
  document.getElementById("aiSubjectBtn")?.addEventListener("click", async () => {
    document.getElementById("aiSubjectBtn").textContent = "Generating…";
    try {
      const res = await fetch('/api/ai/subject-lines', {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: exportHTML(), campaignName: templateData.name })
      });
      const data = await res.json();
      if (data.success && data.lines) {
        const list = document.getElementById("subjectLineResults");
        if (list) { list.innerHTML = data.lines.map(l=>`<div class="subject-line-item" onclick="this.classList.toggle('selected')">${l}</div>`).join(""); }
        showToast("Subject lines generated!", "success");
      }
    } catch (err) { showToast("Error: " + err.message, "error"); }
    document.getElementById("aiSubjectBtn").textContent = "Generate Subject Lines";
  });

  // ── Spam / Accessibility check ──────────────────────────────────────────────
  document.getElementById("spamCheckBtn")?.addEventListener("click", async () => {
    document.getElementById("spamCheckBtn").textContent = "Analyzing…";
    try {
      const res = await fetch('/api/ai/analyze', {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: exportHTML(), subject: templateData.metadata?.subject || "" })
      });
      const data = await res.json();
      if (data.success) {
        const r = data.analysis;
        const el = document.getElementById("spamResults");
        if (el) el.innerHTML = `<div class="analysis-card"><div class="score-badge ${r.spamLevel}">Spam: ${r.spamScore}/10</div><div class="score-badge neutral">Readability: ${r.readabilityScore}/100</div><div class="score-badge neutral">~${r.estimatedReadTime}</div>${r.issues.map(i=>`<p class="issue-item">Issue: ${i}</p>`).join("")}${r.suggestions.map(s=>`<p class="suggestion-item">Tip: ${s}</p>`).join("")}</div>`;
        showToast("Analysis complete!", "success");
      }
    } catch (err) { showToast("Error: " + err.message, "error"); }
    document.getElementById("spamCheckBtn").textContent = "Check Spam Score";
  });

  document.getElementById("a11yCheckBtn")?.addEventListener("click", async () => {
    document.getElementById("a11yCheckBtn").textContent = "Checking…";
    try {
      const res = await fetch('/api/ai/accessibility', {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: exportHTML() })
      });
      const data = await res.json();
      if (data.success) {
        const r = data.result;
        const el = document.getElementById("a11yResults");
        if (el) el.innerHTML = `<div class="analysis-card"><div class="score-badge ${r.grade==='A'?'low':'medium'}">Score: ${r.score}/100 (${r.grade})</div>${r.issues.map(i=>`<p class="issue-item ${i.severity}">Issue: ${i.description}</p>`).join("")}${(r.passed||[]).map(p=>`<p class="success-item">Pass: ${p}</p>`).join("")}</div>`;
        showToast("Accessibility checked!", "success");
      }
    } catch (err) { showToast("Error: " + err.message, "error"); }
    document.getElementById("a11yCheckBtn").textContent = "Check Accessibility";
  });

  // ── Version History ─────────────────────────────────────────────────────────
  document.getElementById("saveVersionBtn")?.addEventListener("click", async () => {
    if (!currentTemplateId) { showToast("Save template to DB first", "error"); return; }
    const label = await showPromptDialog("Version Label", "Enter a version label name:", `v${new Date().toLocaleString()}`);
    if (!label) return;
    try {
      const html = exportHTML();
      await fetch(`/api/templates/${currentTemplateId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonData: templateData, htmlContent: html }) });
      await fetch(`/api/templates/${currentTemplateId}/versions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label }) });
      loadVersionHistory();
      showToast("Version saved!", "success");
    } catch (err) { showToast("Error: " + err.message, "error"); }
  });

  async function loadVersionHistory() {
    if (!currentTemplateId) return;
    const el = document.getElementById("versionList");
    if (!el) return;
    try {
      const res = await fetch(`/api/templates/${currentTemplateId}/versions`);
      const data = await res.json();
      if (data.success) {
        el.innerHTML = data.data.map(v=>`<div class="version-item"><span>${v.label}</span><small>${new Date(v.createdAt).toLocaleString()}</small><button class="btn-sm" onclick="restoreVersion('${v._id}')">Restore</button></div>`).join("") || "<p style='color:#71717a;font-size:12px'>No saved versions</p>";
      }
    } catch {}
  }

  window.restoreVersion = async (vid) => {
    const _rv = await showConfirmDialog("Restore Version", "Restore this version? Current state will be auto-saved."); if (!_rv) return;
    try {
      const res = await fetch(`/api/templates/${currentTemplateId}/versions/${vid}/restore`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        pushHistory();
        templateData = data.version.snapshot;
        renderCanvas(); showToast("Restored!", "success");
      }
    } catch (err) { showToast("Restore error: " + err.message, "error"); }
  };

  // ── Saved blocks ────────────────────────────────────────────────────────────
  function renderSavedBlocks() {
    const el = document.getElementById("savedBlocksList");
    if (!el) return;
    const saved = JSON.parse(localStorage.getItem("ms_saved_blocks")||"[]");
    if (!saved.length) { el.innerHTML = `<div class="property-label" style="text-align:center">No saved blocks.</div>`; return; }
    el.innerHTML = saved.map((b,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:var(--secondary);border-radius:6px;font-size:12px"><span>${b.name}</span><div style="display:flex;gap:4px"><button class="btn-sm" onclick="loadSavedBlock(${i})">Load</button><button class="btn-sm" style="color:#ef4444" onclick="deleteSavedBlock(${i})">✕</button></div></div>`).join("");
  }
  window.loadSavedBlock = (i) => {
    const saved = JSON.parse(localStorage.getItem("ms_saved_blocks")||"[]");
    if (!saved[i]) return;
    pushHistory();
    const clone = JSON.parse(JSON.stringify(saved[i].data));
    clone.id = `sec_${Date.now()}`;
    templateData.sections.push(clone);
    renderCanvas(); showToast("Block loaded!", "success");
  };
  window.deleteSavedBlock = (i) => {
    const saved = JSON.parse(localStorage.getItem("ms_saved_blocks")||"[]");
    saved.splice(i, 1);
    localStorage.setItem("ms_saved_blocks", JSON.stringify(saved));
    renderSavedBlocks(); showToast("Block deleted", "info");
  };
  renderSavedBlocks();

  // ── Industry Templates ───────────────────────────────────────────────────────
  function getTemplatesForIndustry(industry, orgName) {
    const defaultTheme = { fontFamily: "Inter, sans-serif", backgroundColor: "#f4f4f5", textColor: "#18181b", linkColor: "#8b5cf6", buttonColor: "#8b5cf6" };
    const defaultVars = [
      { name: "customer.name", fallback: "there" }, { name: "customer.firstName", fallback: "there" },
      { name: "customer.email", fallback: "" }, { name: "org.name", fallback: orgName },
      { name: "unsubscribe_link", fallback: "#" }
    ];

    const templatesMap = {
      Technology: [
        {
          name: "Software Launch Newsletter",
          description: "Perfect for sharing new software releases, platform updates, and feature rollouts.",
          jsonData: {
            name: "Software Launch Newsletter", version: "2.0",
            globalTheme: defaultTheme, variables: defaultVars,
            sections: [
              {
                id: "sec_tech1_1", background: { color: "#ffffff" }, padding: { top: "30", bottom: "20", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "tech1_head", type: "heading", content: `New Release from ${orgName}`, tag: "h1", fontSize: "30", fontWeight: "800", color: "#18181b", align: "center" },
                    { id: "tech1_sep", type: "divider", style: "solid", thickness: "1", color: "#e4e4e7", paddingTop: "10", paddingBottom: "20" },
                    { id: "tech1_para", type: "paragraph", content: "Hi {{customer.firstName}},<br><br>We are excited to announce the release of our latest software build! Our team has built new features to streamline your operations and make your workflow smoother.", fontSize: "15", color: "#52525b", align: "left", lineHeight: "1.7" }
                  ]
                }]
              },
              {
                id: "sec_tech1_2", background: { color: "#f4f4f5" }, padding: { top: "20", bottom: "20", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "tech1_feat_head", type: "heading", content: "Key Highlights", tag: "h3", fontSize: "18", fontWeight: "700", color: "#8b5cf6", align: "left" },
                    { id: "tech1_feat_list", type: "paragraph", content: "<b>Speed increase</b> — 5x faster processing speeds.<br><b>Better Security</b> — Added 2FA authorization flows.<br><b>Advanced Dashboards</b> — View live activity feeds instantly.", fontSize: "14", color: "#52525b", align: "left", lineHeight: "1.8" }
                  ]
                }]
              },
              {
                id: "sec_tech1_3", background: { color: "#ffffff" }, padding: { top: "25", bottom: "30", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "tech1_btn", type: "button", label: "Get Started Now", url: "#", bgColor: "#8b5cf6", textColor: "#ffffff", borderRadius: "8", align: "center", width: "auto", paddingX: "28", paddingY: "14" },
                    { id: "tech1_unsub", type: "paragraph", content: "<br><a href='{{unsubscribe_link}}' style='color:#8b5cf6; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#a1a1aa", align: "center" }
                  ]
                }]
              }
            ]
          }
        },
        {
          name: "API Integration Guide",
          description: "Developer-focused guide to help tech users integrate with your API/platforms.",
          jsonData: {
            name: "API Integration Guide", version: "2.0",
            globalTheme: defaultTheme, variables: defaultVars,
            sections: [
              {
                id: "sec_tech2_1", background: { color: "#ffffff" }, padding: { top: "30", bottom: "30", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "tech2_head", type: "heading", content: "Developer Integration Guide", tag: "h1", fontSize: "28", fontWeight: "800", color: "#18181b", align: "left" },
                    { id: "tech2_para", type: "paragraph", content: "Hello developer,<br><br>Ready to integrate with our system? We have made it extremely simple to plug in and start making requests using our RESTful endpoints.", fontSize: "14", color: "#52525b", align: "left", lineHeight: "1.6" },
                    { id: "tech2_html", type: "html", content: "<pre style='background:#18181b;color:#f4f4f5;padding:12px;border-radius:6px;font-family:monospace;font-size:12px;overflow:auto'>curl -X POST https://api.yourdomain.com/v1/auth \\\n  -H 'Authorization: Bearer YOUR_TOKEN' \\\n  -d 'grant_type=client_credentials'</pre>" },
                    { id: "tech2_btn", type: "button", label: "View API Docs", url: "#", bgColor: "#18181b", textColor: "#ffffff", borderRadius: "6", align: "left", width: "auto", paddingX: "24", paddingY: "12" },
                    { id: "tech2_unsub", type: "paragraph", content: "<br><a href='{{unsubscribe_link}}' style='color:#8b5cf6; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#a1a1aa", align: "center" }
                  ]
                }]
              }
            ]
          }
        },
        {
          name: "Tech Webinar Invite",
          description: "Invite your subscribers to live webinars or product Q&A sessions.",
          jsonData: {
            name: "Tech Webinar Invite", version: "2.0",
            globalTheme: defaultTheme, variables: defaultVars,
            sections: [
              {
                id: "sec_tech3_1", background: { color: "#ffffff" }, padding: { top: "30", bottom: "30", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "tech3_head", type: "heading", content: "Live Product Q&A & Demo", tag: "h1", fontSize: "26", fontWeight: "800", color: "#18181b", align: "center" },
                    { id: "tech3_para", type: "paragraph", content: "Hi {{customer.firstName}},<br><br>Want to see the system in action? Join our founder for a live demo next Thursday, followed by an open Q&A session.", fontSize: "15", color: "#52525b", align: "center", lineHeight: "1.7" },
                    { id: "tech3_count", type: "countdown", deadline: new Date(Date.now() + 4 * 86400000).toISOString().slice(0,16), label: "Live demo starts in:", bgColor: "#18181b", textColor: "#ffffff", accentColor: "#8b5cf6" },
                    { id: "tech3_space", type: "spacer", height: "20" },
                    { id: "tech3_btn", type: "button", label: "Reserve My Seat", url: "#", bgColor: "#8b5cf6", textColor: "#ffffff", borderRadius: "8", align: "center", width: "auto", paddingX: "28", paddingY: "14" },
                    { id: "tech3_unsub", type: "paragraph", content: "<br><a href='{{unsubscribe_link}}' style='color:#8b5cf6; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#a1a1aa", align: "center" }
                  ]
                }]
              }
            ]
          }
        }
      ],
      "E-commerce": [
        {
          name: "Flash Sale & Discount",
          description: "Engage retail customers with a limited-time coupon offer and countdown timer.",
          jsonData: {
            name: "Flash Sale & Discount", version: "2.0",
            globalTheme: defaultTheme, variables: defaultVars,
            sections: [
              {
                id: "sec_eco1_1", background: { color: "#ffffff" }, padding: { top: "30", bottom: "30", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "eco1_head", type: "heading", content: "FLASH SALE IS ON!", tag: "h1", fontSize: "32", fontWeight: "900", color: "#ef4444", align: "center" },
                    { id: "eco1_para", type: "paragraph", content: "Get the absolute best deals of the season. Use the coupon code below to unlock massive discounts at checkout.", fontSize: "15", color: "#52525b", align: "center", lineHeight: "1.6" },
                    { id: "eco1_coupon", type: "coupon", headline: "FLASH SALE OFFER", discount: "30% OFF", code: "FLASH30", subtext: "Valid for next 24 hours only. No minimum purchase required.", bgColor: "#ef4444", borderColor: "#ffffff", textColor: "#ffffff" },
                    { id: "eco1_count", type: "countdown", deadline: new Date(Date.now() + 1 * 86400000).toISOString().slice(0,16), label: "Sale ends in:", bgColor: "#18181b", textColor: "#ffffff", accentColor: "#ef4444" },
                    { id: "eco1_unsub", type: "paragraph", content: "<br><a href='{{unsubscribe_link}}' style='color:#ef4444; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#a1a1aa", align: "center" }
                  ]
                }]
              }
            ]
          }
        },
        {
          name: "New Collection Showcase",
          description: "Announce new product lines with catalog showcase grids.",
          jsonData: {
            name: "New Collection Showcase", version: "2.0",
            globalTheme: defaultTheme, variables: defaultVars,
            sections: [
              {
                id: "sec_eco2_1", background: { color: "#ffffff" }, padding: { top: "30", bottom: "25", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "eco2_head", type: "heading", content: "New Arrivals Have Landed!", tag: "h1", fontSize: "28", fontWeight: "800", color: "#18181b", align: "center" },
                    { id: "eco2_para", type: "paragraph", content: "Upgrade your catalog with our brand-new collection, designed for maximum comfort and premium style.", fontSize: "15", color: "#52525b", align: "center", lineHeight: "1.7" }
                  ]
                }]
              },
              {
                id: "sec_eco2_2", background: { color: "#ffffff" }, padding: { top: "10", bottom: "30", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "eco2_grid", type: "product-grid", columns: 2, products: [
                      { imageUrl: "https://placehold.co/240x180/8b5cf6/ffffff?text=Classic+Coat", title: "Classic Trench Coat", price: "$129.99", url: "#" },
                      { imageUrl: "https://placehold.co/240x180/ef4444/ffffff?text=Urban+Sneaker", title: "Urban Leather Sneaker", price: "$89.99", url: "#" }
                    ]},
                    { id: "eco2_space", type: "spacer", height: "20" },
                    { id: "eco2_btn", type: "button", label: "Shop Entire Catalog", url: "#", bgColor: "#18181b", textColor: "#ffffff", borderRadius: "8", align: "center", width: "auto", paddingX: "28", paddingY: "14" },
                    { id: "eco2_unsub", type: "paragraph", content: "<br><a href='{{unsubscribe_link}}' style='color:#8b5cf6; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#a1a1aa", align: "center" }
                  ]
                }]
              }
            ]
          }
        },
        {
          name: "Abandoned Cart Recovery",
          description: "Recover potential lost sales by reminding customers of items in their cart.",
          jsonData: {
            name: "Abandoned Cart Recovery", version: "2.0",
            globalTheme: defaultTheme, variables: defaultVars,
            sections: [
              {
                id: "sec_eco3_1", background: { color: "#ffffff" }, padding: { top: "30", bottom: "30", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "eco3_head", type: "heading", content: "Did you forget something?", tag: "h1", fontSize: "28", fontWeight: "800", color: "#18181b", align: "center" },
                    { id: "eco3_para", type: "paragraph", content: "Hi {{customer.firstName}},<br><br>We saved the premium items in your shopping cart, but they won't remain there forever. Complete your purchase now and get an extra 10% off.", fontSize: "15", color: "#52525b", align: "center", lineHeight: "1.7" },
                    { id: "eco3_card", type: "product-card", imageUrl: "https://placehold.co/280x200/8b5cf6/ffffff?text=Your+Item", title: "Premium Leather Backpack", price: "$79.99", oldPrice: "$99.99", description: "Waterproof, custom laptop sleeve, vegetable tanned leather.", ctaLabel: "Complete Checkout", ctaUrl: "#", ctaColor: "#8b5cf6", borderRadius: "12" },
                    { id: "eco3_unsub", type: "paragraph", content: "<br><a href='{{unsubscribe_link}}' style='color:#8b5cf6; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#a1a1aa", align: "center" }
                  ]
                }]
              }
            ]
          }
        }
      ],
      Healthcare: [
        {
          name: "Healthy Living Newsletter",
          description: "Share medical insights, seasonal tips, and clinic news with your patients.",
          jsonData: {
            name: "Healthy Living Newsletter", version: "2.0",
            globalTheme: defaultTheme, variables: defaultVars,
            sections: [
              {
                id: "sec_hc1_1", background: { color: "#ffffff" }, padding: { top: "30", bottom: "30", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "hc1_head", type: "heading", content: `${orgName} Wellness Letter`, tag: "h1", fontSize: "26", fontWeight: "800", color: "#0d9488", align: "center" },
                    { id: "hc1_para", type: "paragraph", content: "Dear {{customer.name}},<br><br>Welcome to our monthly health newsletter. Staying healthy during seasonal transitions is essential. Our doctors have put together three quick tips below.", fontSize: "14", color: "#52525b", align: "left", lineHeight: "1.7" },
                    { id: "hc1_tips", type: "paragraph", content: "<b>Stay Hydrated</b> — Aim for at least 3 liters of water daily.<br><b>Daily Walk</b> — 20 minutes of brisk walking reduces stress levels.<br><b>Leafy Greens</b> — Incorporate fiber-rich vegetables into your lunches.", fontSize: "14", color: "#52525b", align: "left", lineHeight: "1.8" },
                    { id: "hc1_btn", type: "button", label: "Read Our Health Blog", url: "#", bgColor: "#0d9488", textColor: "#ffffff", borderRadius: "8", align: "center", width: "auto", paddingX: "28", paddingY: "14" },
                    { id: "hc1_unsub", type: "paragraph", content: "<br><a href='{{unsubscribe_link}}' style='color:#0d9488; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#a1a1aa", align: "center" }
                  ]
                }]
              }
            ]
          }
        },
        {
          name: "Clinic Appointment Booking",
          description: "Encourage patients to book annual health exams or routine health reviews.",
          jsonData: {
            name: "Clinic Appointment Booking", version: "2.0",
            globalTheme: defaultTheme, variables: defaultVars,
            sections: [
              {
                id: "sec_hc2_1", background: { color: "#ffffff" }, padding: { top: "30", bottom: "30", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "hc2_head", type: "heading", content: "Time for Your Annual Health Exam?", tag: "h1", fontSize: "26", fontWeight: "800", color: "#18181b", align: "center" },
                    { id: "hc2_para", type: "paragraph", content: "Hi {{customer.firstName}},<br><br>Prevention is the best cure. If it's been more than a year since your last physical checkup, now is the time to schedule your appointment.", fontSize: "15", color: "#52525b", align: "center", lineHeight: "1.7" },
                    { id: "hc2_btn", type: "button", label: "Schedule Appointment", url: "#", bgColor: "#0d9488", textColor: "#ffffff", borderRadius: "8", align: "center", width: "auto", paddingX: "28", paddingY: "14" },
                    { id: "hc2_unsub", type: "paragraph", content: "<br><a href='{{unsubscribe_link}}' style='color:#0d9488; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#a1a1aa", align: "center" }
                  ]
                }]
              }
            ]
          }
        },
        {
          name: "Health & Wellness Webinar",
          description: "Invite subscribers to wellness webinars, doctor interactions, or health sessions.",
          jsonData: {
            name: "Health & Wellness Webinar", version: "2.0",
            globalTheme: defaultTheme, variables: defaultVars,
            sections: [
              {
                id: "sec_hc3_1", background: { color: "#ffffff" }, padding: { top: "30", bottom: "30", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "hc3_head", type: "heading", content: "Mental Health & Balance Webinar", tag: "h1", fontSize: "26", fontWeight: "800", color: "#0d9488", align: "center" },
                    { id: "hc3_para", type: "paragraph", content: "Hi {{customer.firstName}},<br><br>Join our medical experts for a live wellness webinar to discuss mindfulness, anxiety management, and daily routines.", fontSize: "15", color: "#52525b", align: "center", lineHeight: "1.7" },
                    { id: "hc3_count", type: "countdown", deadline: new Date(Date.now() + 5 * 86400000).toISOString().slice(0,16), label: "Live session begins in:", bgColor: "#0d9488", textColor: "#ffffff", accentColor: "#115e59" },
                    { id: "hc3_space", type: "spacer", height: "20" },
                    { id: "hc3_btn", type: "button", label: "Register for Session", url: "#", bgColor: "#0d9488", textColor: "#ffffff", borderRadius: "6", align: "center", width: "auto", paddingX: "24", paddingY: "12" },
                    { id: "hc3_unsub", type: "paragraph", content: "<br><a href='{{unsubscribe_link}}' style='color:#0d9488; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#a1a1aa", align: "center" }
                  ]
                }]
              }
            ]
          }
        }
      ],
      Education: [
        {
          name: "Course Catalog Announcement",
          description: "Promote new classes, training programs, or course enrollments.",
          jsonData: {
            name: "Course Catalog Announcement", version: "2.0",
            globalTheme: defaultTheme, variables: defaultVars,
            sections: [
              {
                id: "sec_edu1_1", background: { color: "#ffffff" }, padding: { top: "30", bottom: "30", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "edu1_head", type: "heading", content: "Expand Your Knowledge Base", tag: "h1", fontSize: "28", fontWeight: "800", color: "#1d4ed8", align: "center" },
                    { id: "edu1_para", type: "paragraph", content: "Dear {{customer.firstName}},<br><br>Enrollments are now officially open for our new professional training cohort! Learn from certified industry veterans.", fontSize: "15", color: "#52525b", align: "center", lineHeight: "1.7" },
                    { id: "edu1_btn", type: "button", label: "Browse Course Catalog", url: "#", bgColor: "#1d4ed8", textColor: "#ffffff", borderRadius: "8", align: "center", width: "auto", paddingX: "28", paddingY: "14" },
                    { id: "edu1_unsub", type: "paragraph", content: "<br><a href='{{unsubscribe_link}}' style='color:#1d4ed8; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#a1a1aa", align: "center" }
                  ]
                }]
              }
            ]
          }
        },
        {
          name: "Campus Event Newsletter",
          description: "Share upcoming events, seminars, or student orientations.",
          jsonData: {
            name: "Campus Event Newsletter", version: "2.0",
            globalTheme: defaultTheme, variables: defaultVars,
            sections: [
              {
                id: "sec_edu2_1", background: { color: "#ffffff" }, padding: { top: "30", bottom: "25", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "edu2_head", type: "heading", content: "Upcoming Campus Events", tag: "h1", fontSize: "26", fontWeight: "800", color: "#18181b", align: "left" },
                    { id: "edu2_para", type: "paragraph", content: "Hello Students & Parents,<br><br>Mark your calendars for our upcoming school activities, presentations, and technical seminars.", fontSize: "15", color: "#52525b", align: "left", lineHeight: "1.7" }
                  ]
                }]
              },
              {
                id: "sec_edu2_2", background: { color: "#f8fafc" }, padding: { top: "20", bottom: "20", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "edu2_list", type: "paragraph", content: "<b>ORIENTATION</b> — July 24th, 10:00 AM at Hall A.<br><b>SCIENCE EXHIBITION</b> — July 28th, 09:00 AM at Lab Block.<br><b>SPORTS TOURNAMENT</b> — August 1st, 04:00 PM at Stadium.", fontSize: "14", color: "#52525b", align: "left", lineHeight: "1.8" }
                  ]
                }]
              },
              {
                id: "sec_edu2_3", background: { color: "#ffffff" }, padding: { top: "20", bottom: "30", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "edu2_btn", type: "button", label: "RSVP to Events", url: "#", bgColor: "#1d4ed8", textColor: "#ffffff", borderRadius: "6", align: "center", width: "auto", paddingX: "24", paddingY: "12" },
                    { id: "edu2_unsub", type: "paragraph", content: "<br><a href='{{unsubscribe_link}}' style='color:#1d4ed8; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#a1a1aa", align: "center" }
                  ]
                }]
              }
            ]
          }
        },
        {
          name: "Student Feedback Survey",
          description: "Gather feedback from students/participants using a rating block.",
          jsonData: {
            name: "Student Feedback Survey", version: "2.0",
            globalTheme: defaultTheme, variables: defaultVars,
            sections: [
              {
                id: "sec_edu3_1", background: { color: "#ffffff" }, padding: { top: "30", bottom: "30", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "edu3_head", type: "heading", content: "Help Us Improve Classes", tag: "h1", fontSize: "26", fontWeight: "800", color: "#18181b", align: "center" },
                    { id: "edu3_para", type: "paragraph", content: "Hi {{customer.firstName}},<br><br>We want to ensure our courses provide the maximum educational value. Please take a moment to rate your overall training experience.", fontSize: "15", color: "#52525b", align: "center", lineHeight: "1.6" },
                    { id: "edu3_rate", type: "rating", stars: 5, filled: 5, baseUrl: "#", color: "#f59e0b", size: "36", align: "center" },
                    { id: "edu3_space", type: "spacer", height: "20" },
                    { id: "edu3_btn", type: "button", label: "Write Custom Review", url: "#", bgColor: "#1d4ed8", textColor: "#ffffff", borderRadius: "6", align: "center", width: "auto", paddingX: "24", paddingY: "12" },
                    { id: "edu3_unsub", type: "paragraph", content: "<br><a href='{{unsubscribe_link}}' style='color:#1d4ed8; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#a1a1aa", align: "center" }
                  ]
                }]
              }
            ]
          }
        }
      ],
      Finance: [
        {
          name: "Market Weekly Review",
          description: "Provide financial insights, asset reviews, or investment analysis table reports.",
          jsonData: {
            name: "Market Weekly Review", version: "2.0",
            globalTheme: defaultTheme, variables: defaultVars,
            sections: [
              {
                id: "sec_fin1_1", background: { color: "#ffffff" }, padding: { top: "30", bottom: "25", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "fin1_head", type: "heading", content: "Market Review Report", tag: "h1", fontSize: "28", fontWeight: "800", color: "#0f172a", align: "left" },
                    { id: "fin1_para", type: "paragraph", content: "Hello {{customer.firstName}},<br><br>Here is your weekly digest of global financial market updates, stock valuations, and macro indicators.", fontSize: "15", color: "#52525b", align: "left", lineHeight: "1.6" }
                  ]
                }]
              },
              {
                id: "sec_fin1_2", background: { color: "#ffffff" }, padding: { top: "10", bottom: "30", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "fin1_table", type: "table", headers: ["Asset", "Change", "Status"], rows: [["Gold / Ounce", "+1.2%", "Bullish"], ["S&P 500 Index", "-0.4%", "Neutral"], ["Treasury Yields", "+0.1%", "Bullish"]], headerBg: "#0f172a", headerColor: "#ffffff", stripedRows: true },
                    { id: "fin1_space", type: "spacer", height: "20" },
                    { id: "fin1_btn", type: "button", label: "Download Detailed PDF", url: "#", bgColor: "#0f172a", textColor: "#ffffff", borderRadius: "6", align: "left", width: "auto", paddingX: "24", paddingY: "12" },
                    { id: "fin1_unsub", type: "paragraph", content: "<br><a href='{{unsubscribe_link}}' style='color:#0f172a; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#a1a1aa", align: "center" }
                  ]
                }]
              }
            ]
          }
        },
        {
          name: "Secure Investment Options",
          description: "Introduce investment opportunities and portfolio management guides.",
          jsonData: {
            name: "Secure Investment Options", version: "2.0",
            globalTheme: defaultTheme, variables: defaultVars,
            sections: [
              {
                id: "sec_fin2_1", background: { color: "#ffffff" }, padding: { top: "30", bottom: "30", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "fin2_head", type: "heading", content: "Optimize Your Wealth Plan", tag: "h1", fontSize: "28", fontWeight: "800", color: "#0f172a", align: "center" },
                    { id: "fin2_para", type: "paragraph", content: "Hi {{customer.firstName}},<br><br>Looking to secure your portfolio against inflation? Discover safe and tax-efficient fixed-income plans tailored for your risk tolerance profile.", fontSize: "15", color: "#52525b", align: "center", lineHeight: "1.7" },
                    { id: "fin2_btn", type: "button", label: "Access Secure Portal", url: "#", bgColor: "#059669", textColor: "#ffffff", borderRadius: "8", align: "center", width: "auto", paddingX: "28", paddingY: "14" },
                    { id: "fin2_unsub", type: "paragraph", content: "<br><a href='{{unsubscribe_link}}' style='color:#059669; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#a1a1aa", align: "center" }
                  ]
                }]
              }
            ]
          }
        },
        {
          name: "Personal Budgeting Webinar",
          description: " webinar/course announcements to help clients structure monthly finances.",
          jsonData: {
            name: "Personal Budgeting Webinar", version: "2.0",
            globalTheme: defaultTheme, variables: defaultVars,
            sections: [
              {
                id: "sec_fin3_1", background: { color: "#ffffff" }, padding: { top: "30", bottom: "30", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "fin3_head", type: "heading", content: "Take Charge of Your Finances!", tag: "h1", fontSize: "26", fontWeight: "800", color: "#0f172a", align: "center" },
                    { id: "fin3_para", type: "paragraph", content: "Hi {{customer.firstName}},<br><br>Join our leading economists for a live wealth session on tax planning, investing for beginners, and setting up budgeting templates.", fontSize: "15", color: "#52525b", align: "center", lineHeight: "1.7" },
                    { id: "fin3_count", type: "countdown", deadline: new Date(Date.now() + 6 * 86400000).toISOString().slice(0,16), label: "Live session begins in:", bgColor: "#0f172a", textColor: "#ffffff", accentColor: "#059669" },
                    { id: "fin3_space", type: "spacer", height: "20" },
                    { id: "fin3_btn", type: "button", label: "Book Free Spot", url: "#", bgColor: "#059669", textColor: "#ffffff", borderRadius: "6", align: "center", width: "auto", paddingX: "24", paddingY: "12" },
                    { id: "fin3_unsub", type: "paragraph", content: "<br><a href='{{unsubscribe_link}}' style='color:#059669; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#a1a1aa", align: "center" }
                  ]
                }]
              }
            ]
          }
        }
      ],
      Retail: [
        {
          name: "In-Store Event Invite",
          description: "Invite your retail contacts to physical store events or custom product trials.",
          jsonData: {
            name: "In-Store Event Invite", version: "2.0",
            globalTheme: defaultTheme, variables: defaultVars,
            sections: [
              {
                id: "sec_ret1_1", background: { color: "#ffffff" }, padding: { top: "30", bottom: "30", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "ret1_head", type: "heading", content: `Exclusive Store Event at ${orgName}`, tag: "h1", fontSize: "28", fontWeight: "800", color: "#b91c1c", align: "center" },
                    { id: "ret1_para", type: "paragraph", content: "Hi {{customer.firstName}},<br><br>You're invited! Join us at our main location this Friday for an exclusive collection launch. Refreshments and custom loyalty gifts will be provided.", fontSize: "15", color: "#52525b", align: "center", lineHeight: "1.7" },
                    { id: "ret1_btn", type: "button", label: "Find Store & Directions", url: "#", bgColor: "#b91c1c", textColor: "#ffffff", borderRadius: "8", align: "center", width: "auto", paddingX: "28", paddingY: "14" },
                    { id: "ret1_unsub", type: "paragraph", content: "<br><a href='{{unsubscribe_link}}' style='color:#b91c1c; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#a1a1aa", align: "center" }
                  ]
                }]
              }
            ]
          }
        },
        {
          name: "Weekly Flyer Deals",
          description: "Feature best-selling products or weekly discounted items in a gallery grid.",
          jsonData: {
            name: "Weekly Flyer Deals", version: "2.0",
            globalTheme: defaultTheme, variables: defaultVars,
            sections: [
              {
                id: "sec_ret2_1", background: { color: "#ffffff" }, padding: { top: "30", bottom: "25", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "ret2_head", type: "heading", content: "This Week's Specials!", tag: "h1", fontSize: "28", fontWeight: "800", color: "#18181b", align: "center" },
                    { id: "ret2_para", type: "paragraph", content: "Stock is limited. Stop by our closest branch or order online to get these special discount packages today.", fontSize: "15", color: "#52525b", align: "center", lineHeight: "1.7" }
                  ]
                }]
              },
              {
                id: "sec_ret2_2", background: { color: "#ffffff" }, padding: { top: "10", bottom: "30", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "ret2_grid", type: "product-grid", columns: 2, products: [
                      { imageUrl: "https://placehold.co/200x150/b91c1c/fff?text=Deal+1", title: "Smart Charger Kit", price: "$14.99", url: "#" },
                      { imageUrl: "https://placehold.co/200x150/f59e0b/fff?text=Deal+2", title: "Wireless Mug Warmer", price: "$22.50", url: "#" }
                    ]},
                    { id: "ret2_space", type: "spacer", height: "20" },
                    { id: "ret2_btn", type: "button", label: "Shop All Deals", url: "#", bgColor: "#b91c1c", textColor: "#ffffff", borderRadius: "6", align: "center", width: "auto", paddingX: "24", paddingY: "12" },
                    { id: "ret2_unsub", type: "paragraph", content: "<br><a href='{{unsubscribe_link}}' style='color:#b91c1c; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#a1a1aa", align: "center" }
                  ]
                }]
              }
            ]
          }
        },
        {
          name: "Loyalty Program Welcome",
          description: "Perfect for onboarding retail loyalty signups with program highlights and a discount.",
          jsonData: {
            name: "Loyalty Program Welcome", version: "2.0",
            globalTheme: defaultTheme, variables: defaultVars,
            sections: [
              {
                id: "sec_ret3_1", background: { color: "#ffffff" }, padding: { top: "30", bottom: "30", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "ret3_head", type: "heading", content: "Welcome to VIP Rewards!", tag: "h1", fontSize: "28", fontWeight: "800", color: "#18181b", align: "center" },
                    { id: "ret3_para", type: "paragraph", content: "Hi {{customer.firstName}},<br><br>Thank you for joining our VIP loyalty program. You are now earning points on every purchase! Here is a welcome discount code for your next visit.", fontSize: "15", color: "#52525b", align: "center", lineHeight: "1.7" },
                    { id: "ret3_coupon", type: "coupon", headline: "VIP MEMBER WELCOME", discount: "15% OFF", code: "VIP15", subtext: "Valid in-store or online.", bgColor: "#18181b", borderColor: "#f59e0b", textColor: "#ffffff" },
                    { id: "ret3_unsub", type: "paragraph", content: "<br><a href='{{unsubscribe_link}}' style='color:#f59e0b; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#a1a1aa", align: "center" }
                  ]
                }]
              }
            ]
          }
        }
      ],
      Other: [
        {
          name: "Company Announcement",
          description: "Elegant layout for company statements, team introductions, or news updates.",
          jsonData: {
            name: "Company Announcement", version: "2.0",
            globalTheme: defaultTheme, variables: defaultVars,
            sections: [
              {
                id: "sec_oth1_1", background: { color: "#ffffff" }, padding: { top: "30", bottom: "30", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "oth1_head", type: "heading", content: `Important Update from ${orgName}`, tag: "h1", fontSize: "26", fontWeight: "800", color: "#18181b", align: "center" },
                    { id: "oth1_para", type: "paragraph", content: "Dear Subscriber,<br><br>We want to share an important announcement regarding our operations, values, and community support programs. Thank you for your continued partnership.", fontSize: "15", color: "#52525b", align: "left", lineHeight: "1.7" },
                    { id: "oth1_btn", type: "button", label: "Read Full Statement", url: "#", bgColor: "#8b5cf6", textColor: "#ffffff", borderRadius: "8", align: "center", width: "auto", paddingX: "28", paddingY: "14" },
                    { id: "oth1_unsub", type: "paragraph", content: "<br><a href='{{unsubscribe_link}}' style='color:#8b5cf6; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#a1a1aa", align: "center" }
                  ]
                }]
              }
            ]
          }
        },
        {
          name: "Customer Feedback Poll",
          description: "A quick customer feedback template featuring interactive emojis and voting options.",
          jsonData: {
            name: "Customer Feedback Poll", version: "2.0",
            globalTheme: defaultTheme, variables: defaultVars,
            sections: [
              {
                id: "sec_oth2_1", background: { color: "#ffffff" }, padding: { top: "30", bottom: "30", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "oth2_head", type: "heading", content: "Tell Us What You Think!", tag: "h1", fontSize: "26", fontWeight: "800", color: "#18181b", align: "center" },
                    { id: "oth2_para", type: "paragraph", content: "Hi {{customer.firstName}},<br><br>Your feedback helps us refine our communication, services, and product deliveries. Let us know how we did today.", fontSize: "15", color: "#52525b", align: "center", lineHeight: "1.6" },
                    { id: "oth2_poll", type: "poll", question: "How would you rate our communication today?", options: [{ emoji: "A", label: "Excellent", url: "#" }, { emoji: "B", label: "Good", url: "#" }, { emoji: "C", label: "Needs work", url: "#" }], align: "center" },
                    { id: "oth2_unsub", type: "paragraph", content: "<br><a href='{{unsubscribe_link}}' style='color:#8b5cf6; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#a1a1aa", align: "center" }
                  ]
                }]
              }
            ]
          }
        },
        {
          name: "Special Event Countdown",
          description: "Perfect template for product reveals, events, webinars, or custom announcements.",
          jsonData: {
            name: "Special Event Countdown", version: "2.0",
            globalTheme: defaultTheme, variables: defaultVars,
            sections: [
              {
                id: "sec_oth3_1", background: { color: "#ffffff" }, padding: { top: "30", bottom: "30", left: "30", right: "30" },
                columns: [{
                  styles: { padding: "8px" },
                  components: [
                    { id: "oth3_head", type: "heading", content: "Something exciting is coming...", tag: "h1", fontSize: "28", fontWeight: "800", color: "#18181b", align: "center" },
                    { id: "oth3_para", type: "paragraph", content: "Hi {{customer.firstName}},<br><br>We are working behind the scenes on a massive project. Stay tuned as we count down the days to our official release.", fontSize: "15", color: "#52525b", align: "center", lineHeight: "1.7" },
                    { id: "oth3_count", type: "countdown", deadline: new Date(Date.now() + 7 * 86400000).toISOString().slice(0,16), label: "Official reveal starts in:", bgColor: "#18181b", textColor: "#ffffff", accentColor: "#8b5cf6" },
                    { id: "oth3_space", type: "spacer", height: "20" },
                    { id: "oth3_btn", type: "button", label: "Subscribe to Notification", url: "#", bgColor: "#8b5cf6", textColor: "#ffffff", borderRadius: "6", align: "center", width: "auto", paddingX: "24", paddingY: "12" },
                    { id: "oth3_unsub", type: "paragraph", content: "<br><a href='{{unsubscribe_link}}' style='color:#8b5cf6; text-decoration:none;'>Unsubscribe</a>", fontSize: "11", color: "#a1a1aa", align: "center" }
                  ]
                }]
              }
            ]
          }
        }
      ]
    };

    return templatesMap[industry] || templatesMap.Other;
  }

  function renderTemplatesList(industry, orgName) {
    const listEl = document.getElementById("industryTemplatesList");
    if (!listEl) return;

    const titleEl = document.getElementById("templatesTabTitle");
    if (titleEl) titleEl.textContent = `${industry} Industry Templates`;

    const templates = getTemplatesForIndustry(industry, orgName);

    listEl.innerHTML = templates.map((tpl, idx) => `
      <div class="template-selector-card" style="border:1px solid var(--border);padding:12px;border-radius:var(--radius);background:var(--bg-card);cursor:pointer;transition:all 0.15s;margin-bottom:8px" onclick="loadIndustryTemplate(${idx})">
        <p style="font-size:12px;font-weight:700;color:var(--text);margin:0 0 4px 0">${tpl.name}</p>
        <p style="font-size:11px;color:var(--text-muted);margin:0;line-height:1.4">${tpl.description}</p>
      </div>
    `).join("");

    window.loadIndustryTemplate = async (idx) => {
      const _lt = await showConfirmDialog("Load Template", `Are you sure you want to load "${templates[idx].name}"? This will overwrite your current canvas.`); if (!_lt) return;
      pushHistory();
      templateData = JSON.parse(JSON.stringify(templates[idx].jsonData));
      if (nameInput) nameInput.value = templateData.name;
      currentTemplateId = null;
      renderCanvas();
      showToast("Template loaded!", "success");
    };
  }

  async function loadIndustryTemplates() {
    let session = window._session;
    if (!session) {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          session = data.user;
        }
      } catch (e) {
        console.error("Failed to load session in builder", e);
      }
    }
    const industry = session?.orgIndustry || 'Other';
    const orgName = session?.orgName || 'our organization';
    renderTemplatesList(industry, orgName);
  }

  // ── Custom User Saved Templates ─────────────────────────────────────────────
  async function loadMyTemplates() {
    const listEl = document.getElementById("myTemplatesList");
    if (!listEl) return;
    try {
      const res = await fetch('/api/templates');
      if (!res.ok) throw new Error("Failed to load templates");
      const data = await res.json();
      const templates = data.data || [];
      if (!templates.length) {
        listEl.innerHTML = `<p class="property-label" style="text-align:center;font-size:11px">No saved templates yet.</p>`;
        return;
      }
      listEl.innerHTML = templates.map(tpl => `
        <div class="template-selector-card" style="border:1px solid var(--border);padding:10px;border-radius:var(--radius);background:var(--bg-card);cursor:pointer;transition:all 0.15s;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center" onclick="loadUserTemplate('${tpl._id}')">
          <div style="flex:1;min-width:0;text-align:left">
            <p style="font-size:12px;font-weight:700;color:var(--text);margin:0 0 2px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${tpl.name}</p>
            <p style="font-size:9px;color:var(--text-muted);margin:0">Updated: ${new Date(tpl.updatedAt).toLocaleDateString()}</p>
          </div>
          <button class="btn btn-secondary btn-sm" style="padding:2px 6px;margin-left:8px;background:transparent;border:none;color:var(--error)" onclick="deleteUserTemplate(event, '${tpl._id}')">
            <i data-lucide="trash-2" style="width:12px;height:12px"></i>
          </button>
        </div>
      `).join("");
      if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
      console.error(err);
      listEl.innerHTML = `<p class="property-label" style="text-align:center;font-size:11px;color:var(--error)">Error loading templates.</p>`;
    }
  }

  window.loadUserTemplate = async (id) => {
    const _ldb = await showConfirmDialog("Load Template", "Are you sure you want to load this template? Unsaved changes in your current workspace will be lost."); if (!_ldb) return;
    try {
      const res = await fetch(`/api/templates/${id}`);
      if (!res.ok) throw new Error("Failed to load template");
      const data = await res.json();
      if (data.success && data.data) {
        undoStack = []; redoStack = [];
        templateData = data.data.jsonData;
        currentTemplateId = data.data._id;
        if (nameInput) nameInput.value = templateData.name || "Untitled Template";
        hasUnsavedChanges = false;
        updateDraftIndicator();
        renderCanvas();
        showToast("Template loaded!", "success");
      }
    } catch (err) {
      showToast("Error loading template: " + err.message, "error");
    }
  };

  window.deleteUserTemplate = async (e, id) => {
    e.stopPropagation();
    const _dt = await showConfirmDialog("Delete Template", "Are you sure you want to delete this template? This cannot be undone.", true); if (!_dt) return;
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Template deleted", "success");
        if (currentTemplateId === id) {
          currentTemplateId = null;
        }
        loadMyTemplates();
      } else {
        showToast("Delete failed", "error");
      }
    } catch (err) {
      showToast("Error deleting template: " + err.message, "error");
    }
  };

  // ── Global Canvas Delegate Listeners for Inline Editing ───────────────────
  canvas.addEventListener("input", e => {
    const el = e.target.closest(".editable-content");
    if (!el) return;
    const compEl = el.closest(".canvas-component");
    if (!compEl) return;
    const si = +compEl.dataset.secIdx;
    const ci = +compEl.dataset.colIdx;
    const compIdx = +compEl.dataset.compIdx;
    const comp = templateData.sections[si]?.columns[ci]?.components[compIdx];
    if (!comp) return;

    if (comp.type === "button") {
      comp.label = el.innerText;
    } else {
      comp.content = el.innerHTML;
    }

    hasUnsavedChanges = true;
    updateDraftIndicator();
    scheduleAutoSave();

    // Sync properties panel input if it's currently showing this component
    if (selectedRef && selectedRef.type === "component" && selectedRef.sectionIdx === si && selectedRef.colIdx === ci && selectedRef.compIdx === compIdx) {
      const propInp = propCont.querySelector('[data-key="content"], [data-key="label"]');
      if (propInp) {
        propInp.value = comp.type === "button" ? comp.label : comp.content;
      }
    }
  });

  canvas.addEventListener("blur", e => {
    const el = e.target.closest(".editable-content");
    if (!el) return;
    pushHistory();
  }, true);

  // ── Discard Template click listener ──────────────────────────────────────────
  discardBtn?.addEventListener("click", async () => {
    const ok = await showConfirmDialog("Discard Changes", "Are you sure you want to discard all unsaved changes? This cannot be undone.", true);
    if (!ok) return;
    if (currentTemplateId) {
      // Reload template from DB directly without confirm
      try {
        const res = await fetch(`/api/templates/${currentTemplateId}`);
        if (!res.ok) throw new Error("Failed to load template");
        const data = await res.json();
        if (data.success && data.data) {
          templateData = data.data.jsonData;
          if (nameInput) nameInput.value = templateData.name || "Untitled Template";
          undoStack = []; redoStack = [];
          hasUnsavedChanges = false;
          updateDraftIndicator();
          renderCanvas();
          showToast("Changes discarded", "info");
        }
      } catch (err) {
        showToast("Error reloading template: " + err.message, "error");
      }
    } else {
      // Clear canvas (new template)
      currentTemplateId = null;
      undoStack = []; redoStack = [];
      templateData = {
        name: "Untitled Template", version: "2.0",
        globalTheme: { fontFamily: "Inter, sans-serif", backgroundColor: "#f4f4f5", textColor: "#18181b", linkColor: "#8b5cf6", buttonColor: "#8b5cf6" },
        variables: [
          { name: "customer.name", fallback: "there" }, { name: "customer.firstName", fallback: "there" },
          { name: "customer.email", fallback: "" }, { name: "org.name", fallback: "our team" },
          { name: "unsubscribe_link", fallback: "#" },
        ],
        sections: [],
        tracking: { openTracking: true, clickTracking: true },
        metadata: { aiPrompt: "", category: "marketing", subject: "", preheader: "" }
      };
      if (nameInput) nameInput.value = templateData.name;
      localStorage.removeItem("ms_draft");
      localStorage.removeItem("ms_builder_draft");
      localStorage.removeItem("ms_builder_name");
      syncThemeUI();
      // add standard layout
      const colCount = 1;
      const cols = Array.from({ length: colCount }, () => ({ components: [], styles: { padding: "8px" } }));
      templateData.sections.push({
        id: `sec_${Date.now()}`,
        background: { color: "#ffffff", imageUrl: "", overlayOpacity: 0 },
        padding: { top: "20", bottom: "20", left: "20", right: "20" },
        columns: cols,
        visibility: { desktop: true, mobile: true },
      });
      hasUnsavedChanges = false;
      updateDraftIndicator();
      renderCanvas();
      showToast("Canvas cleared", "info");
    }
  });

  // ── Initial render ──────────────────────────────────────────────────────────
  renderCanvas();
  loadVersionHistory();
  loadIndustryTemplates();
  loadMyTemplates();
  updateDraftIndicator();
});
