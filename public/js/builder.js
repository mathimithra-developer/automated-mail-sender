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
  let bypassQuery = window.location.search.includes('bypass=true') ? '?bypass=true' : '';

  // ── DOM refs ────────────────────────────────────────────────────────────────
  const canvas    = document.getElementById("emailCanvas");
  const emptyMsg  = document.getElementById("emptyCanvasMsg");
  const propPanel = document.getElementById("propertyPanel");
  const propCont  = document.getElementById("propertyInputsContainer");
  const noSelMsg  = document.getElementById("noSelectionMsg");
  const nameInput = document.getElementById("templateNameInput");

  // ── History helpers ─────────────────────────────────────────────────────────
  function pushHistory() {
    undoStack.push(JSON.stringify(templateData));
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack = [];
    scheduleAutoSave();
  }
  function scheduleAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      localStorage.setItem("ms_builder_draft", JSON.stringify(templateData));
      localStorage.setItem("ms_builder_name", templateData.name);
      showToast("Draft saved", "info");
    }, 2000);
  }
  document.getElementById("undoBtn")?.addEventListener("click", () => {
    if (!undoStack.length) return;
    redoStack.push(JSON.stringify(templateData));
    templateData = JSON.parse(undoStack.pop());
    renderCanvas(); showToast("Undo", "info");
  });
  document.getElementById("redoBtn")?.addEventListener("click", () => {
    if (!redoStack.length) return;
    undoStack.push(JSON.stringify(templateData));
    templateData = JSON.parse(redoStack.pop());
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

  // ── Restore draft ───────────────────────────────────────────────────────────
  const draft = localStorage.getItem("ms_builder_draft");
  if (draft) { try { templateData = JSON.parse(draft); } catch {} }
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
      icons:      { id, type, icons: ["⭐", "❤️", "✓", "🎯"], iconSize: "32", align: "center" },
      rating:     { id, type, stars: 5, filled: 4, baseUrl: "#", color: "#f59e0b", size: "28", align: "center" },
      "product-card": { id, type, imageUrl: "https://placehold.co/280x200/8b5cf6/ffffff?text=Product", title: "Product Name", price: "$29.99", oldPrice: "$49.99", description: "Short product description here.", ctaLabel: "Shop Now", ctaUrl: "#", ctaColor: "#8b5cf6", borderRadius: "12" },
      "product-grid": { id, type, columns: 2, products: [
        { imageUrl: "https://placehold.co/200x150/8b5cf6/fff?text=P1", title: "Product 1", price: "$19.99", url: "#" },
        { imageUrl: "https://placehold.co/200x150/a78bfa/fff?text=P2", title: "Product 2", price: "$24.99", url: "#" },
      ]},
      coupon:     { id, type, headline: "Exclusive Offer!", discount: "20% OFF", code: "SAVE20", subtext: "Valid till 31st July. Min order ₹499.", bgColor: "#1a1a2e", borderColor: "#8b5cf6", textColor: "#ffffff" },
      countdown:  { id, type, deadline: new Date(Date.now() + 3 * 86400000).toISOString().slice(0,16), label: "Offer ends in:", bgColor: "#1a1a2e", textColor: "#ffffff", accentColor: "#8b5cf6" },
      "qr-code":  { id, type, url: "https://yourdomain.com", size: "150", caption: "Scan to visit", align: "center" },
      poll:       { id, type, question: "How did we do today?", options: [{ emoji: "😀", label: "Great", url: "#" }, { emoji: "😐", label: "OK", url: "#" }, { emoji: "😞", label: "Poor", url: "#" }], align: "center" },
      conditional:{ id, type, condition: "customer.plan == 'pro'", trueContent: "🌟 Pro member exclusive content", falseContent: "Upgrade to Pro to unlock this." },
    };
    return defaults[type] || { id, type, content: "Block" };
  }

  // ── Section builders ─────────────────────────────────────────────────────────
  function addSection(layout) {
    pushHistory();
    const colCount = layout === "3-col" ? 3 : layout === "2-col" ? 2 : 1;
    const cols = Array.from({ length: colCount }, () => ({ components: [], styles: { padding: "8px" } }));
    templateData.sections.push({
      id: `sec_${Date.now()}`,
      background: { color: "#ffffff", imageUrl: "", overlayOpacity: 0 },
      padding: { top: "20", bottom: "20", left: "20", right: "20" },
      columns: cols,
      visibility: { desktop: true, mobile: true },
    });
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
        <button class="sec-action" data-sec="${sIdx}" data-act="up" title="Move up">↑</button>
        <button class="sec-action" data-sec="${sIdx}" data-act="down" title="Move down">↓</button>
        <button class="sec-action" data-sec="${sIdx}" data-act="dupe" title="Duplicate">⧉</button>
        <button class="sec-action" data-sec="${sIdx}" data-act="del" title="Delete" style="color:#ef4444">✕</button>
      </div>`;

      // Columns wrapper
      const colsEl = document.createElement("div");
      colsEl.className = "canvas-columns";

      section.columns.forEach((col, cIdx) => {
        const colEl = document.createElement("div");
        colEl.className = "canvas-column";
        colEl.style.padding = col.styles?.padding || "4px";

        col.components.forEach((comp, compIdx) => {
          const compEl = document.createElement("div");
          const isSelected = selectedRef?.type === "component" && selectedRef.sectionIdx === sIdx && selectedRef.colIdx === cIdx && selectedRef.compIdx === compIdx;
          compEl.className = `canvas-component${isSelected ? " selected" : ""}`;
          compEl.dataset.secIdx = sIdx; compEl.dataset.colIdx = cIdx; compEl.dataset.compIdx = compIdx;

          compEl.innerHTML = `
            <div class="component-actions">
              <button class="action-btn comp-up"    data-si="${sIdx}" data-ci="${cIdx}" data-pi="${compIdx}" title="Move up">↑</button>
              <button class="action-btn comp-down"  data-si="${sIdx}" data-ci="${cIdx}" data-pi="${compIdx}" title="Move down">↓</button>
              <button class="action-btn comp-dupe"  data-si="${sIdx}" data-ci="${cIdx}" data-pi="${compIdx}" title="Duplicate">⧉</button>
              <button class="action-btn comp-del"   data-si="${sIdx}" data-ci="${cIdx}" data-pi="${compIdx}" title="Delete" style="color:#ef4444">✕</button>
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

  // ── Block HTML renderers ────────────────────────────────────────────────────
  function renderBlockHTML(comp) {
    switch (comp.type) {
      case "heading":    return `<${comp.tag||"h2"} style="margin:0;font-size:${comp.fontSize||28}px;font-weight:${comp.fontWeight||700};color:${comp.color||"#18181b"};text-align:${comp.align||"center"};letter-spacing:${comp.letterSpacing||0}px;line-height:${comp.lineHeight||1.3}">${comp.content}</${comp.tag||"h2"}>`;
      case "paragraph":  return `<p style="margin:0;font-size:${comp.fontSize||15}px;color:${comp.color||"#52525b"};text-align:${comp.align||"left"};line-height:${comp.lineHeight||1.7}">${comp.content}</p>`;
      case "button":     return `<div style="text-align:${comp.align||"center"}"><a href="${comp.url||"#"}" style="display:inline-block;background:${comp.bgColor||"#8b5cf6"};color:${comp.textColor||"#fff"};padding:${comp.paddingY||14}px ${comp.paddingX||28}px;border-radius:${comp.borderRadius||8}px;font-weight:600;text-decoration:none;font-size:15px;${comp.shadow?"box-shadow:0 4px 14px rgba(139,92,246,0.4);":""}">${comp.label||"Click Here"}</a></div>`;
      case "image":      return `<div style="text-align:${comp.align||"center"}"><img src="${comp.src}" alt="${comp.alt||""}" style="max-width:100%;height:auto;border-radius:${comp.borderRadius||0}px;" /></div>`;
      case "divider":    return `<div style="padding:${comp.paddingTop||16}px 0 ${comp.paddingBottom||16}px"><hr style="border:none;border-top:${comp.thickness||1}px ${comp.style||"solid"} ${comp.color||"#e4e4e7"};margin:0" /></div>`;
      case "spacer":     return `<div style="height:${comp.height||32}px;display:block"></div>`;
      case "social":     return renderSocialBlock(comp);
      case "html":       return `<div class="html-block-preview">${comp.content}</div>`;
      case "video":      return `<div style="text-align:center;position:relative"><a href="${comp.videoUrl||"#"}" target="_blank" style="display:inline-block;position:relative"><img src="${comp.thumbnailSrc}" alt="${comp.alt||"Watch Video"}" style="max-width:100%;border-radius:${comp.borderRadius||8}px;" /><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:64px;height:64px;background:rgba(0,0,0,.6);border-radius:50%;display:flex;align-items:center;justify-content:center"><span style="color:#fff;font-size:24px;margin-left:4px">▶</span></div></a></div>`;
      case "menu":       return `<div style="text-align:${comp.align||"center"};padding:8px 0">${comp.links.map((l,i) => `${i>0?`<span style="color:#999;margin:0 8px">${comp.separator||"|"}</span>`:""}<a href="${l.url||"#"}" style="color:${comp.color||"#8b5cf6"};font-size:${comp.fontSize||14}px;text-decoration:none;font-weight:500">${l.label}</a>`).join("")}</div>`;
      case "table":      return renderTableBlock(comp);
      case "icons":      return `<div style="text-align:${comp.align||"center"};padding:4px 0">${comp.icons.map(ic=>`<span style="font-size:${comp.iconSize||32}px;margin:0 6px">${ic}</span>`).join("")}</div>`;
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
    const icons = { twitter:"🐦", linkedin:"💼", instagram:"📸", facebook:"📘", youtube:"▶️", whatsapp:"💬", telegram:"✈️" };
    return `<div style="text-align:${comp.align||"center"};padding:8px 0">${comp.links.map(l=>`<a href="${l.url||"#"}" style="display:inline-block;margin:0 6px;text-decoration:none"><span style="font-size:${comp.iconSize||28}px" title="${l.platform}">${icons[l.platform]||"🔗"}</span></a>`).join("")}</div>`;
  }
  function renderTableBlock(comp) {
    const hdrs = comp.headers.map(h=>`<th style="background:${comp.headerBg||"#8b5cf6"};color:${comp.headerColor||"#fff"};padding:10px 14px;text-align:left;font-size:13px">${h}</th>`).join("");
    const rows = comp.rows.map((r,i)=>`<tr style="background:${comp.stripedRows&&i%2?"#f9f9f9":"#fff"}">${r.map(c=>`<td style="padding:9px 14px;font-size:13px;border-bottom:1px solid #f0f0f0;color:#333">${c}</td>`).join("")}</tr>`).join("");
    return `<div style="overflow:auto"><table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:8px;overflow:hidden"><thead><tr>${hdrs}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  function renderRatingBlock(comp) {
    const stars = Array.from({length:comp.stars||5},(_,i)=>`<a href="${comp.baseUrl||"#"}" style="text-decoration:none;font-size:${comp.size||28}px;color:${i<(comp.filled||4)?comp.color||"#f59e0b":"#d4d4d8"}">${i<(comp.filled||4)?"★":"☆"}</a>`).join("");
    return `<div style="text-align:${comp.align||"center"};padding:4px 0">${stars}</div>`;
  }
  function renderProductCard(comp) {
    return `<div style="border:1px solid #e4e4e7;border-radius:${comp.borderRadius||12}px;overflow:hidden;max-width:320px;margin:0 auto;font-family:inherit">
      <img src="${comp.imageUrl}" alt="${comp.title}" style="width:100%;display:block;object-fit:cover" />
      <div style="padding:16px">
        <h3 style="margin:0 0 6px;font-size:16px;font-weight:700;color:#18181b">${comp.title}</h3>
        <div style="margin-bottom:8px"><span style="font-size:18px;font-weight:700;color:#8b5cf6">${comp.price}</span>${comp.oldPrice?`<span style="font-size:13px;color:#a1a1aa;text-decoration:line-through;margin-left:8px">${comp.oldPrice}</span>`:""}</div>
        <p style="margin:0 0 14px;font-size:13px;color:#71717a">${comp.description}</p>
        <a href="${comp.ctaUrl||"#"}" style="display:block;text-align:center;background:${comp.ctaColor||"#8b5cf6"};color:#fff;padding:10px 20px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px">${comp.ctaLabel||"Shop Now"}</a>
      </div></div>`;
  }
  function renderProductGrid(comp) {
    const cols = comp.columns || 2;
    const items = comp.products.map(p=>`<div style="flex:1;min-width:0;border:1px solid #e4e4e7;border-radius:10px;overflow:hidden;text-align:center"><a href="${p.url||"#"}" style="text-decoration:none"><img src="${p.imageUrl}" alt="${p.title}" style="width:100%;display:block;object-fit:cover" /><div style="padding:10px"><p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#18181b">${p.title}</p><p style="margin:0;font-size:13px;color:#8b5cf6;font-weight:700">${p.price}</p></div></a></div>`).join("");
    return `<div style="display:flex;flex-wrap:wrap;gap:12px">${items}</div>`;
  }
  function renderCoupon(comp) {
    return `<div style="background:${comp.bgColor||"#1a1a2e"};border:2px dashed ${comp.borderColor||"#8b5cf6"};border-radius:12px;padding:24px;text-align:center;color:${comp.textColor||"#fff"}">
      <p style="margin:0 0 4px;font-size:13px;color:#a78bfa;font-weight:600;text-transform:uppercase;letter-spacing:.1em">${comp.headline||"Exclusive Offer!"}</p>
      <div style="font-size:36px;font-weight:900;margin:8px 0;letter-spacing:-.01em">${comp.discount}</div>
      <div style="display:inline-flex;align-items:center;gap:0;border:2px solid ${comp.borderColor||"#8b5cf6"};border-radius:8px;overflow:hidden;margin:8px 0">
        <span style="padding:10px 20px;font-size:18px;font-weight:700;letter-spacing:.1em;font-family:monospace">${comp.code}</span>
        <button onclick="navigator.clipboard.writeText('${comp.code}')" style="padding:10px 16px;background:${comp.borderColor||"#8b5cf6"};color:#fff;border:none;cursor:pointer;font-weight:600;font-size:13px">Copy</button>
      </div>
      <p style="margin:8px 0 0;font-size:12px;color:#a1a1aa">${comp.subtext||""}</p></div>`;
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
        selectedRef = { type: "component", sectionIdx: si, colIdx: ci, compIdx: pi };
        renderCanvas(); renderProperties();
      });
    });
    canvas.querySelectorAll(".canvas-section").forEach(el => {
      el.addEventListener("click", e => {
        if (e.target.closest(".canvas-component")) return;
        const si = +el.dataset.sectionIdx;
        selectedRef = { type: "section", sectionIdx: si };
        renderCanvas(); renderProperties();
      });
    });

    // Section actions
    canvas.querySelectorAll(".sec-action").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const si = +btn.dataset.sec, act = btn.dataset.act;
        pushHistory();
        const sec = templateData.sections;
        if (act === "del")  { sec.splice(si, 1); selectedRef = null; }
        if (act === "up"  && si > 0)            { [sec[si-1],sec[si]] = [sec[si],sec[si-1]]; }
        if (act === "down" && si < sec.length-1) { [sec[si],sec[si+1]] = [sec[si+1],sec[si]]; }
        if (act === "dupe") { sec.splice(si+1, 0, JSON.parse(JSON.stringify(sec[si]))); }
        renderCanvas();
      });
    });

    // Component actions
    canvas.querySelectorAll(".comp-del").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation(); pushHistory();
        const si = +btn.dataset.si, ci = +btn.dataset.ci, pi = +btn.dataset.pi;
        templateData.sections[si].columns[ci].components.splice(pi, 1);
        selectedRef = null; renderCanvas(); renderProperties();
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
    if (existing) existing.remove();

    const picker = document.createElement("div");
    picker.id = "inlineBlockPicker";
    picker.className = "inline-block-picker";
    const allTypes = ["heading","paragraph","button","image","divider","spacer","social","html","video","menu","table","icons","rating","product-card","coupon","countdown","qr-code","poll","conditional"];
    picker.innerHTML = allTypes.map(t=>`<button class="ibp-btn" data-type="${t}">${t}</button>`).join("");
    document.body.appendChild(picker);
    const r = anchor.getBoundingClientRect();
    picker.style.cssText = `position:fixed;top:${r.bottom+4}px;left:${r.left}px;z-index:9999`;

    picker.querySelectorAll(".ibp-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        pushHistory();
        templateData.sections[si].columns[ci].components.push(defaultBlock(btn.dataset.type));
        picker.remove();
        renderCanvas();
      });
    });
    setTimeout(() => document.addEventListener("click", () => picker.remove(), { once: true }), 50);
  }

  // ── Property Panel ──────────────────────────────────────────────────────────
  function renderProperties() {
    noSelMsg.style.display = selectedRef ? "none" : "block";
    propCont.style.display = selectedRef ? "block" : "none";
    if (!selectedRef) { propCont.innerHTML = ""; return; }

    if (selectedRef.type === "section") {
      renderSectionProps(selectedRef.sectionIdx);
    } else {
      const { sectionIdx, colIdx, compIdx } = selectedRef;
      const comp = templateData.sections[sectionIdx]?.columns[colIdx]?.components[compIdx];
      if (comp) renderComponentProps(comp, sectionIdx, colIdx, compIdx);
    }
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
        <div class="property-row"><span class="property-label">BG Image URL</span>
          <input type="text" class="prop property-input" data-key="background.imageUrl" value="${sec.background.imageUrl||""}" placeholder="https://..." /></div>
        <div class="property-row-flex"><span class="property-label">Hide on Mobile</span>
          <input type="checkbox" class="prop" data-key="visibility.mobile" ${!sec.visibility.mobile?"checked":""} style="cursor:pointer" /></div>
        <button class="btn btn-secondary" id="saveSectionBtn" style="margin-top:8px;width:100%">💾 Save as Reusable Block</button>
      </div>`;
    attachPropListeners(sec, true, si);
    document.getElementById("saveSectionBtn")?.addEventListener("click", () => {
      const name = prompt("Block name:", `Section ${si+1}`);
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
      coupon:      [["Headline","headline","text"],["Discount","discount","text"],["Code","code","text"],["Sub-text","subtext","text"],["BG Color","bgColor","color"],["Border Color","borderColor","color"]],
      conditional: [["Condition","condition","text"],["If TRUE show","trueContent","textarea"],["If FALSE show","falseContent","textarea"]],
      "product-card": [["Image URL","imageUrl","text"],["Title","title","text"],["Price","price","text"],["Old Price","oldPrice","text"],["Description","description","textarea"],["CTA Label","ctaLabel","text"],["CTA URL","ctaUrl","text"],["CTA Color","ctaColor","color"],["Border Radius","borderRadius","number"]],
    };

    const fields = commonPropMap[comp.type];
    let html = `<div class="property-group"><p class="property-title">${comp.type.replace("-"," ")} block</p>`;

    if (fields) {
      fields.forEach(([label, key, inputType]) => {
        const val = comp[key] ?? "";
        if (inputType === "textarea") {
          html += `<div class="property-row"><span class="property-label">${label}</span><textarea class="prop property-input" data-key="${key}" rows="3">${val}</textarea></div>`;
        } else if (inputType === "color") {
          html += `<div class="property-row-flex"><span class="property-label">${label}</span><input type="color" class="prop" data-key="${key}" value="${val||"#000000"}" style="border:none;width:36px;height:26px;cursor:pointer;border-radius:4px" /></div>`;
        } else if (inputType === "checkbox") {
          html += `<div class="property-row-flex"><span class="property-label">${label}</span><input type="checkbox" class="prop" data-key="${key}" ${val?"checked":""} style="cursor:pointer" /></div>`;
        } else if (inputType.startsWith("select:")) {
          const opts = inputType.slice(7).split("|").map(o=>`<option value="${o}"${o===String(val)?" selected":""}>${o}</option>`).join("");
          html += `<div class="property-row"><span class="property-label">${label}</span><select class="prop property-select" data-key="${key}">${opts}</select></div>`;
        } else {
          html += `<div class="property-row"><span class="property-label">${label}</span><input type="${inputType}" class="prop property-input" data-key="${key}" value="${val}" /></div>`;
        }
      });
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

    propCont.querySelectorAll(".merge-tag-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const ta = propCont.querySelector("textarea.prop");
        if (ta) { const p = ta.selectionStart; ta.value = ta.value.slice(0,p)+btn.dataset.tag+ta.value.slice(p); ta.dispatchEvent(new Event("input")); }
      });
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
        obj[keys[keys.length - 1]] = val;
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
  document.getElementById("globalFont")?.addEventListener("change", e => {
    pushHistory(); templateData.globalTheme.fontFamily = e.target.value; renderCanvas();
  });
  document.getElementById("globalBg")?.addEventListener("input", e => {
    templateData.globalTheme.backgroundColor = e.target.value; canvas.style.backgroundColor = e.target.value;
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
  document.getElementById("importJsonBtn")?.addEventListener("click", () => {
    const json = prompt("Paste JSON:");
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
  document.getElementById("saveTemplateBtn")?.addEventListener("click", async () => {
    const html = exportHTML();
    try {
      const payload = { name: templateData.name, jsonData: templateData, htmlContent: html, subject: templateData.metadata?.subject || "" };
      let res;
      if (currentTemplateId) {
        res = await fetch(`/api/templates/${currentTemplateId}${bypassQuery?'?bypass=true':''}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        res = await fetch(`/api/templates${bypassQuery?'?bypass=true':''}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (data.success) currentTemplateId = data.data._id;
      }
      if (res.ok) { showToast("Template saved to database!", "success"); }
      else        { showToast("Save failed — check console", "error"); }
    } catch (err) { showToast("Save error: " + err.message, "error"); }
  });

  // ── AI Panel ────────────────────────────────────────────────────────────────
  document.getElementById("aiGenerateBtn")?.addEventListener("click", async () => {
    const prompt = document.getElementById("aiPromptInput")?.value?.trim();
    if (!prompt) return showToast("Enter a prompt first", "error");
    document.getElementById("aiGenerateBtn").textContent = "Generating…";
    document.getElementById("aiGenerateBtn").disabled = true;
    try {
      const res = await fetch(`/api/ai/generate${bypassQuery?'?bypass=true':''}`, {
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
      const res = await fetch(`/api/ai/subject-lines${bypassQuery?'?bypass=true':''}`, {
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
      const res = await fetch(`/api/ai/analyze${bypassQuery?'?bypass=true':''}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: exportHTML(), subject: templateData.metadata?.subject || "" })
      });
      const data = await res.json();
      if (data.success) {
        const r = data.analysis;
        const el = document.getElementById("spamResults");
        if (el) el.innerHTML = `<div class="analysis-card"><div class="score-badge ${r.spamLevel}">Spam: ${r.spamScore}/10</div><div class="score-badge neutral">Readability: ${r.readabilityScore}/100</div><div class="score-badge neutral">~${r.estimatedReadTime}</div>${r.issues.map(i=>`<p class="issue-item">⚠️ ${i}</p>`).join("")}${r.suggestions.map(s=>`<p class="suggestion-item">💡 ${s}</p>`).join("")}</div>`;
        showToast("Analysis complete!", "success");
      }
    } catch (err) { showToast("Error: " + err.message, "error"); }
    document.getElementById("spamCheckBtn").textContent = "Check Spam Score";
  });

  document.getElementById("a11yCheckBtn")?.addEventListener("click", async () => {
    document.getElementById("a11yCheckBtn").textContent = "Checking…";
    try {
      const res = await fetch(`/api/ai/accessibility${bypassQuery?'?bypass=true':''}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: exportHTML() })
      });
      const data = await res.json();
      if (data.success) {
        const r = data.result;
        const el = document.getElementById("a11yResults");
        if (el) el.innerHTML = `<div class="analysis-card"><div class="score-badge ${r.grade==='A'?'low':'medium'}">Score: ${r.score}/100 (${r.grade})</div>${r.issues.map(i=>`<p class="issue-item ${i.severity}">⚠️ ${i.description}</p>`).join("")}${(r.passed||[]).map(p=>`<p class="success-item">✅ ${p}</p>`).join("")}</div>`;
        showToast("Accessibility checked!", "success");
      }
    } catch (err) { showToast("Error: " + err.message, "error"); }
    document.getElementById("a11yCheckBtn").textContent = "Check Accessibility";
  });

  // ── Version History ─────────────────────────────────────────────────────────
  document.getElementById("saveVersionBtn")?.addEventListener("click", async () => {
    if (!currentTemplateId) { showToast("Save template to DB first", "error"); return; }
    const label = prompt("Version label:", `v${new Date().toLocaleString()}`);
    if (!label) return;
    try {
      const html = exportHTML();
      await fetch(`/api/templates/${currentTemplateId}${bypassQuery?'?bypass=true':''}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonData: templateData, htmlContent: html }) });
      await fetch(`/api/templates/${currentTemplateId}/versions${bypassQuery?'?bypass=true':''}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label }) });
      loadVersionHistory();
      showToast("Version saved!", "success");
    } catch (err) { showToast("Error: " + err.message, "error"); }
  });

  async function loadVersionHistory() {
    if (!currentTemplateId) return;
    const el = document.getElementById("versionList");
    if (!el) return;
    try {
      const res = await fetch(`/api/templates/${currentTemplateId}/versions${bypassQuery?'?bypass=true':''}`);
      const data = await res.json();
      if (data.success) {
        el.innerHTML = data.data.map(v=>`<div class="version-item"><span>${v.label}</span><small>${new Date(v.createdAt).toLocaleString()}</small><button class="btn-sm" onclick="restoreVersion('${v._id}')">Restore</button></div>`).join("") || "<p style='color:#71717a;font-size:12px'>No saved versions</p>";
      }
    } catch {}
  }

  window.restoreVersion = async (vid) => {
    if (!confirm("Restore this version? Current state will be auto-saved.")) return;
    try {
      const res = await fetch(`/api/templates/${currentTemplateId}/versions/${vid}/restore${bypassQuery?'?bypass=true':''}`, { method: "POST" });
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

  // ── Initial render ──────────────────────────────────────────────────────────
  renderCanvas();
  loadVersionHistory();
});
