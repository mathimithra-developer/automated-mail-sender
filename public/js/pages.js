// pages.js — All live page logic: Customers, Campaigns, A/B Tests, Segments, Assets, Settings

const bypass = window.location.search.includes('bypass=true');
const bq = bypass ? '?bypass=true' : '';
const headers = { 'Content-Type': 'application/json' };

// ── Debounce ────────────────────────────────────────────────────────────────
const debounceTimers = {};
window.debounce = (fn, delay) => {
  const key = fn.toString().slice(0, 40);
  return (...args) => {
    clearTimeout(debounceTimers[key]);
    debounceTimers[key] = setTimeout(() => fn(...args), delay);
  };
};

// ── Navigation ───────────────────────────────────────────────────────────────
window.nav = (target) => {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.target === target));
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === target));
  if (target === 'customers') loadCustomers();
  if (target === 'campaigns') loadCampaigns();
  if (target === 'segments')  loadSegments();
  if (target === 'abtests')   loadABTests();
  if (target === 'assets')    loadAssets();
  if (target === 'settings')  loadSettings();
  if (target === 'dashboard') loadDashboard();
};

// ── Modal ────────────────────────────────────────────────────────────────────
window.openModal = (title, bodyHTML) => {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  document.getElementById('modalOverlay').style.display = 'flex';
  if (typeof lucide !== 'undefined') lucide.createIcons();
};
window.closeModal = () => { document.getElementById('modalOverlay').style.display = 'none'; };

// ── Dashboard ────────────────────────────────────────────────────────────────
// ── Dashboard ────────────────────────────────────────────────────────────────
async function loadDashboard() {
  // Skeleton shimmer / loading indicator
  ['statCustomers','statSegments','statTemplates','statCampaigns'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = '…';
  });

  try {
    const res = await fetch(`/api/dashboard/stats${bq}`);
    const d   = await res.json();
    if (!d.success) throw new Error(d.error);

    const s = d.stats;
    // ── KPI numbers ──────────────────────────────────────────────────────────
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '0'; };
    set('statCustomers',  s.customers);
    set('statSegments',   s.segments);
    set('statTemplates',  s.templates);
    set('statCampaigns',  s.campaigns);
    set('statABTests',    s.abtests);
    set('statABTests2',   s.abtests);
    set('statActive',     s.activeCustomers);
    set('statUnsub',      s.unsubscribed);
    set('statTotalSent',  s.totalSent);
    set('statOpenRate',   s.openRate + '%');
    set('statClickRate',  s.clickRate + '%');

    // Animate performance bars
    setTimeout(() => {
      const bar = (id, pct) => { const el = document.getElementById(id); if (el) el.style.width = Math.min(pct, 100) + '%'; };
      bar('barOpen',  s.openRate);
      bar('barClick', s.clickRate);
      bar('barAB',    Math.min((s.abtests / Math.max(s.campaigns, 1)) * 100, 100));
    }, 100);

    // Welcome greeting with username
    const hr = new Date().getHours();
    const greeting = hr < 12 ? 'Good Morning' : hr < 17 ? 'Good Afternoon' : 'Good Evening';
    const userName = document.getElementById('userNameIndicator')?.textContent || 'User';
    if (wh) wh.textContent = `${greeting}, ${userName}!`;

    // ── Recent Campaigns ─────────────────────────────────────────────────────
    const campEl = document.getElementById('recentCampaignsList');
    if (campEl) {
      if (d.recentCampaigns?.length) {
        const statusColors = { draft:'#71717a', scheduled:'#f59e0b', sent:'#10b981', failed:'#ef4444', running:'#3b82f6' };
        campEl.innerHTML = d.recentCampaigns.map(c => `
          <div class="dash-camp-row">
            <div class="dash-camp-icon" style="background:${statusColors[c.status] || '#71717a'}20">
              <i data-lucide="send" style="color:${statusColors[c.status] || '#71717a'};width:14px;height:14px"></i>
            </div>
            <div style="flex:1;min-width:0">
              <p style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0">${c.name}</p>
              <p style="font-size:11px;color:var(--muted);margin:2px 0 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.subject || 'No subject'}</p>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <span class="status-badge status-${c.status}">${c.status}</span>
              <p style="font-size:10px;color:var(--muted);margin:3px 0 0 0">${c.totalSent || 0} sent</p>
            </div>
          </div>`).join('');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      } else {
        campEl.innerHTML = '<div class="dashed-card"><div class="dashed-icon"><i data-lucide="send"></i></div><p class="dashed-title">No campaigns yet</p><p class="dashed-desc">Create your first campaign to start sending.</p></div>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }

    // ── Top Segments ─────────────────────────────────────────────────────────
    const segEl = document.getElementById('topSegmentsList');
    if (segEl) {
      if (d.topSegments?.length) {
        segEl.innerHTML = d.topSegments.map((seg, i) => {
          const pct = d.stats.customers ? Math.round((seg.cachedCount / d.stats.customers) * 100) : 0;
          const colors = ['#8b5cf6','#3b82f6','#10b981','#f59e0b'];
          const col = colors[i % colors.length];
          return `
          <div style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
              <span style="font-size:12px;font-weight:600">${seg.name}</span>
              <span style="font-size:12px;font-weight:700;color:${col}">${seg.cachedCount || 0}</span>
            </div>
            <div style="height:5px;background:var(--border);border-radius:3px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:${col};border-radius:3px;transition:width .5s ease"></div>
            </div>
            <p style="font-size:10px;color:var(--muted);margin:3px 0 0 0">${pct}% of total customers</p>
          </div>`;
        }).join('');
      } else {
        segEl.innerHTML = '<div class="dashed-card"><div class="dashed-icon"><i data-lucide="layers"></i></div><p class="dashed-title">No segments yet</p></div>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }

    // ── Recent Customers ─────────────────────────────────────────────────────
    const custEl = document.getElementById('recentCustomersList');
    if (custEl) {
      if (d.recentCustomers?.length) {
        custEl.innerHTML = d.recentCustomers.map(c => {
          const initials = c.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
          const plan = c.attributes?.find(a => a.k === 'plan')?.v_str || '';
          const statusColor = {active:'#10b981',unsubscribed:'#ef4444',bounced:'#f59e0b'}[c.emailStatus] || '#71717a';
          const added = new Date(c.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
          return `
          <div class="dash-cust-row">
            <div class="dash-cust-avatar">${initials}</div>
            <div style="flex:1;min-width:0">
              <p style="font-size:13px;font-weight:600;margin:0">${c.name}</p>
              <p style="font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:2px 0 0 0">${c.email || '—'}</p>
            </div>
            <div style="text-align:right;flex-shrink:0">
              ${plan ? `<span class="attr-badge" style="font-size:10px">${plan}</span>` : ''}
              <div style="display:flex;align-items:center;gap:4px;margin-top:3px;justify-content:flex-end">
                <span style="width:6px;height:6px;border-radius:50%;background:${statusColor};display:inline-block"></span>
                <span style="font-size:10px;color:var(--muted)">${added}</span>
              </div>
            </div>
          </div>`;
        }).join('');
      } else {
        custEl.innerHTML = '<div class="dashed-card"><div class="dashed-icon"><i data-lucide="users"></i></div><p class="dashed-title">No customers yet</p></div>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }

  } catch (err) { console.error('Dashboard load error:', err); }
}

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOMERS
// ══════════════════════════════════════════════════════════════════════════════
let custPage = 1;
let _custView = 'table';

window.setCustomerView = (view) => {
  _custView = view;
  const cardBtn  = document.getElementById('custCardViewBtn');
  const tableBtn = document.getElementById('custTableViewBtn');
  if (cardBtn) {
    cardBtn.style.background = view === 'card' ? 'var(--primary)' : 'transparent';
    cardBtn.style.color = view === 'card' ? '#fff' : 'var(--muted)';
  }
  if (tableBtn) {
    tableBtn.style.background = view === 'table' ? 'var(--primary)' : 'transparent';
    tableBtn.style.color = view === 'table' ? '#fff' : 'var(--muted)';
  }
  loadCustomers(custPage);
};

async function loadCustomers(page = 1) {
  custPage = page;
  const search = document.getElementById('customerSearch')?.value || '';
  const emailStatus = document.getElementById('custStatusFilter')?.value || '';
  const allowBroadcast = document.getElementById('custBroadcastFilter')?.value || '';
  const attrKey = document.getElementById('custAttrKey')?.value || '';
  const attrVal = document.getElementById('custAttrVal')?.value || '';
  const attrOp  = document.getElementById('custAttrOp')?.value || 'eq';

  let url = `/api/customers${bq ? '?bypass=true' : '?'}${bq?'&':''}page=${page}&limit=25`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (emailStatus) url += `&emailStatus=${emailStatus}`;
  if (allowBroadcast) url += `&allowBroadcast=${allowBroadcast}`;
  if (attrKey && attrVal) url += `&attrKey=${attrKey}&attrVal=${encodeURIComponent(attrVal)}&attrOp=${attrOp}`;

  const tableWrap = document.getElementById('customersTableWrap');
  const cardsWrap = document.getElementById('customersCards');
  const tbody = document.getElementById('customersBody');

  if (_custView === 'table') {
    if (tableWrap) tableWrap.style.display = 'block';
    if (cardsWrap) cardsWrap.style.display = 'none';
    if (tbody) tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#71717a;padding:30px">Loading…</td></tr>';
  } else {
    if (tableWrap) tableWrap.style.display = 'none';
    if (cardsWrap) cardsWrap.style.display = 'grid';
    if (cardsWrap) cardsWrap.innerHTML = '<div style="text-align:center;padding:40px;color:#71717a;grid-column:1/-1">Loading…</div>';
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const countBadge = document.getElementById('customerCountBadge');
    if (countBadge) countBadge.textContent = `Total: ${data.pagination?.total || 0}`;

    if (_custView === 'table') {
      if (!data.data.length) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#71717a;padding:30px">No customers found</td></tr>';
        return;
      }
      tbody.innerHTML = data.data.map(c => {
        const plan = c.attributes?.find(a => a.k === 'plan')?.v_str || '—';
        const leadScore = c.attributes?.find(a => a.k === 'lead_score')?.v_num ?? '—';
        const city = c.attributes?.find(a => a.k === 'city')?.v_str || '—';
        const statusColor = { active: '#10b981', unsubscribed: '#ef4444', bounced: '#f59e0b', complained: '#f97316' }[c.emailStatus] || '#71717a';
        return `<tr>
          <td><span style="font-weight:500">${c.name}</span></td>
          <td style="color:#71717a;font-size:12px">${c.email || '—'}</td>
          <td style="font-size:12px">${c.phoneNo || '—'}</td>
          <td><span class="attr-badge">${plan}</span></td>
          <td><span class="lead-score-pill" style="--score:${leadScore}">${leadScore}</span></td>
          <td style="font-size:12px;color:#71717a">${city}</td>
          <td><span class="status-badge" style="background:${statusColor}20;color:${statusColor}">${c.emailStatus}</span></td>
          <td style="text-align:center">${c.allowBroadcast ? '✅' : '❌'}</td>
          <td><button class="btn-sm" onclick="viewCustomer('${c._id}')">View</button></td>
        </tr>`;
      }).join('');
    } else {
      if (!data.data.length) {
        cardsWrap.innerHTML = '<div class="dashed-card" style="grid-column:1/-1"><div class="dashed-icon"><i data-lucide="users"></i></div><p class="dashed-title">No customers found</p></div>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
      }
      cardsWrap.innerHTML = data.data.map(c => {
        const plan = c.attributes?.find(a => a.k === 'plan')?.v_str || '—';
        const leadScore = c.attributes?.find(a => a.k === 'lead_score')?.v_num ?? '—';
        const city = c.attributes?.find(a => a.k === 'city')?.v_str || '—';
        const statusColor = { active: '#10b981', unsubscribed: '#ef4444', bounced: '#f59e0b', complained: '#f97316' }[c.emailStatus] || '#71717a';
        return `
        <div class="cust-card" id="cust-${c._id}">
          <div class="cust-card-header">
            <span class="cust-card-name">${c.name}</span>
            <button class="seg-icon-btn" title="View details" onclick="viewCustomer('${c._id}')"><i data-lucide="eye"></i></button>
          </div>
          <div class="cust-card-meta">
            <div class="cust-card-meta-item">
              <i data-lucide="mail"></i>
              <span>${c.email || '—'}</span>
            </div>
            <div class="cust-card-meta-item">
              <i data-lucide="phone"></i>
              <span>${c.phoneNo || '—'}</span>
            </div>
          </div>
          <div class="cust-card-badges">
            <span class="status-badge" style="background:${statusColor}20;color:${statusColor}">${c.emailStatus}</span>
            <span class="status-badge" style="background:${c.allowBroadcast ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'};color:${c.allowBroadcast ? '#10b981' : '#ef4444'}">
              ${c.allowBroadcast ? 'Broadcast Allowed' : 'No Broadcast'}
            </span>
          </div>
          <div class="cust-card-attrs">
            ${plan !== '—' ? `<span class="cust-attr-badge">Plan: ${plan}</span>` : ''}
            ${leadScore !== '—' ? `<span class="cust-attr-badge">Score: ${leadScore}</span>` : ''}
            ${city !== '—' ? `<span class="cust-attr-badge">City: ${city}</span>` : ''}
          </div>
        </div>`;
      }).join('');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // Pagination
    const { total, limit } = data.pagination;
    const pages = Math.ceil(total / limit);
    document.getElementById('customersPagination').innerHTML = pages > 1
      ? `<div style="display:flex;gap:6px;padding:12px 16px">${Array.from({length:pages},(_,i)=>`<button class="btn-sm${custPage===i+1?' active':''}" onclick="loadCustomers(${i+1})">${i+1}</button>`).join('')}<span style="font-size:12px;color:#71717a;align-self:center;margin-left:8px">Total: ${total}</span></div>` : '';
  } catch (err) {
    if (_custView === 'table') {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:#ef4444;padding:30px">Error: ${err.message}</td></tr>`;
    } else {
      cardsWrap.innerHTML = `<div style="color:#ef4444;padding:20px;grid-column:1/-1">Error: ${err.message}</div>`;
    }
  }
}
window.loadCustomers = loadCustomers;

window.viewCustomer = async (id) => {
  const res = await fetch(`/api/customers/${id}${bq}`);
  const data = await res.json();
  if (!data.success) return;
  const c = data.data;
  openModal(`Customer — ${c.name}`, `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="grid-4" style="gap:12px">
        <div class="property-row"><span class="property-label">Name</span><p>${c.name}</p></div>
        <div class="property-row"><span class="property-label">Email</span><p>${c.email || '—'}</p></div>
        <div class="property-row"><span class="property-label">Phone</span><p>${c.phoneNo}</p></div>
        <div class="property-row"><span class="property-label">Status</span><p>${c.emailStatus}</p></div>
      </div>
      <div>
        <p class="property-label" style="margin-bottom:8px">Custom Attributes</p>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${(c.attributes||[]).map(a=>`<div style="background:var(--secondary);padding:4px 10px;border-radius:6px;font-size:12px"><b>${a.k}</b>: ${a.v_str??a.v_num??a.v_date??'—'}</div>`).join('') || '—'}
        </div>
      </div>
      ${c.tags?.length ? `<div><p class="property-label" style="margin-bottom:8px">Tags</p><div style="display:flex;gap:6px">${c.tags.map(t=>`<span style="background:${t.color}20;color:${t.color};padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600">${t.name}</span>`).join('')}</div></div>` : ''}
    </div>`);
};

window.showAddCustomerModal = () => {
  openModal('Add Customer', `
    <form id="addCustomerForm" style="display:flex;flex-direction:column;gap:12px">
      <div class="property-row"><span class="property-label">Name *</span><input name="name" class="property-input" required placeholder="Full name"></div>
      <div class="property-row"><span class="property-label">Phone *</span><input name="phoneNo" class="property-input" required placeholder="+91-9876543210"></div>
      <div class="property-row"><span class="property-label">Email</span><input name="email" type="email" class="property-input" placeholder="email@example.com"></div>
      <div class="property-row"><span class="property-label">Lead Source</span><input name="leadSource" class="property-input" placeholder="website, referral…"></div>
      <div class="property-row-flex"><span class="property-label">Allow Broadcast</span><input type="checkbox" name="allowBroadcast" checked></div>
      <hr style="border-color:var(--border)">
      <p class="property-label">Custom Attributes</p>
      <div class="grid-4" style="gap:8px">
        <div class="property-row"><span class="property-label">City</span><input name="attr_city" class="property-input" placeholder="Mumbai"></div>
        <div class="property-row"><span class="property-label">Plan</span><input name="attr_plan" class="property-input" placeholder="pro"></div>
        <div class="property-row"><span class="property-label">Lead Score</span><input name="attr_lead_score" type="number" class="property-input" placeholder="75"></div>
        <div class="property-row"><span class="property-label">Company</span><input name="attr_company" class="property-input" placeholder="Acme Ltd"></div>
      </div>
      <button type="submit" class="btn" style="margin-top:8px">Add Customer</button>
    </form>`);

  document.getElementById('addCustomerForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const attrs = [];
    if (fd.get('attr_city'))       attrs.push({ k: 'city',       v_str: fd.get('attr_city') });
    if (fd.get('attr_plan'))       attrs.push({ k: 'plan',       v_str: fd.get('attr_plan') });
    if (fd.get('attr_lead_score')) attrs.push({ k: 'lead_score', v_num: +fd.get('attr_lead_score') });
    if (fd.get('attr_company'))    attrs.push({ k: 'company',    v_str: fd.get('attr_company') });

    const res = await fetch(`/api/customers${bq}`, {
      method: 'POST', headers,
      body: JSON.stringify({ name: fd.get('name'), phoneNo: fd.get('phoneNo'), email: fd.get('email'), leadSource: fd.get('leadSource'), allowBroadcast: fd.get('allowBroadcast') === 'on', attributes: attrs }),
    });
    const data = await res.json();
    if (data.success) { closeModal(); loadCustomers(); } else alert(data.error);
  });
};

window.showImportModal = () => {
  openModal('Import Customers via CSV', `
    <p class="property-label" style="margin-bottom:12px">Upload a CSV with columns: <code>name, phoneNo, email, city, plan, lead_score, company, industry</code></p>
    <input type="file" id="csvFile" accept=".csv" class="property-input" style="padding:8px">
    <button class="btn" style="margin-top:12px;width:100%" onclick="processCSV()">Import</button>
    <div id="importStatus" style="margin-top:10px;font-size:12px"></div>`);
};

window.processCSV = async () => {
  const file = document.getElementById('csvFile')?.files[0];
  if (!file) return;
  const text = await file.text();
  const lines = text.split('\n').filter(l => l.trim());
  const colNames = lines[0].split(',').map(c => c.trim().toLowerCase().replace(/[^a-z0-9_]/g,''));
  const rows = lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g,''));
    return Object.fromEntries(colNames.map((c,i) => [c, vals[i] || '']));
  });
  document.getElementById('importStatus').textContent = `Importing ${rows.length} rows…`;
  const res = await fetch(`/api/customers/import${bq}`, { method: 'POST', headers, body: JSON.stringify({ rows }) });
  const data = await res.json();
  document.getElementById('importStatus').textContent = data.success ? `✅ Imported ${data.inserted} customers` : `❌ ${data.error}`;
  if (data.success) { setTimeout(() => { closeModal(); loadCustomers(); }, 1500); }
};

// ══════════════════════════════════════════════════════════════════════════════
// SEGMENTS
// ══════════════════════════════════════════════════════════════════════════════
let _segView = 'card';
let _allSegments = [];

window.setSegmentView = (view) => {
  _segView = view;
  const cardBtn  = document.getElementById('segCardViewBtn');
  const tableBtn = document.getElementById('segTableViewBtn');
  if (cardBtn)  { cardBtn.style.background  = view==='card'  ? 'var(--primary)' : 'transparent'; cardBtn.style.color  = view==='card'  ? '#fff' : '#71717a'; }
  if (tableBtn) { tableBtn.style.background = view==='table' ? 'var(--primary)' : 'transparent'; tableBtn.style.color = view==='table' ? '#fff' : '#71717a'; }
  renderSegmentView(_allSegments);
};

window.filterSegments = () => {
  const q = (document.getElementById('segmentSearch')?.value || '').toLowerCase();
  const status = document.getElementById('segmentStatusFilter')?.value || '';

  let filtered = _allSegments.filter(s => s.name.toLowerCase().includes(q) || (s.description||'').toLowerCase().includes(q));

  if (status === 'active') {
    filtered = filtered.filter(s => (s.cachedCount || 0) > 0);
  } else if (status === 'inactive') {
    filtered = filtered.filter(s => (s.cachedCount || 0) === 0);
  }

  const countEl = document.getElementById('segmentCount');
  if (countEl) countEl.textContent = `Total Records (${filtered.length})`;

  renderSegmentView(filtered);
};

function renderSegmentView(segments) {
  const cardEl  = document.getElementById('segmentsList');
  const tableEl = document.getElementById('segmentsTable');
  const tbodyEl = document.getElementById('segmentsTableBody');

  if (_segView === 'card') {
    if (cardEl)  cardEl.style.display  = '';
    if (tableEl) tableEl.style.display = 'none';
    if (!cardEl) return;
    if (!segments.length) {
      cardEl.innerHTML = '<div class="dashed-card" style="grid-column:1/-1"><div class="dashed-icon"><i data-lucide="layers"></i></div><p class="dashed-title">No segments found</p></div>';
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }
    cardEl.innerHTML = segments.map(s => {
      const lastSync = s.lastEvaluatedAt ? new Date(s.lastEvaluatedAt).toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : 'Never';
      const condHTML = (s.conditions || []).map(c =>
        `<span class="seg-cond-badge"><i data-lucide="filter" style="width:10px;height:10px;margin-right:4px"></i>${c.attrKey || c.field} ${c.operator} ${c.value}</span>`
      ).join('');

      return `
      <div class="seg-card" id="seg-${s._id}">
        <!-- Top header band -->
        <div class="seg-card-header-band">
          <span class="seg-category-badge grow" style="background:#eff6ff;color:#2563eb;font-weight:700">${s.cachedCount || 0} Members</span>
          <div class="seg-card-actions">
            <button class="seg-icon-btn" title="View details" onclick="viewSegment('${s._id}','${s.name}')"><i data-lucide="eye"></i></button>
            <button class="seg-icon-btn" title="Delete segment" onclick="deleteSegment('${s._id}')"><i data-lucide="trash-2" style="color:#ef4444"></i></button>
          </div>
        </div>

        <!-- Body information -->
        <div class="seg-card-body" style="padding:16px;display:flex;flex-direction:column;gap:10px">
          <p class="seg-card-name">${s.name}</p>
          <p class="seg-card-desc" style="min-height:40px;margin-bottom:4px">${s.description || 'Dynamic audience segment'}</p>
          
          <div style="display:flex;flex-direction:column;gap:6px;margin-top:auto">
            <span style="font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.04em">Matching Rules</span>
            <div style="display:flex;flex-wrap:wrap;gap:6px">${condHTML || '<span style="font-size:11px;color:var(--muted)">No filters</span>'}</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="seg-card-footer">
          <span class="seg-footer-sync">Evaluated: ${lastSync}</span>
        </div>
      </div>`;
    }).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();

  } else {
    if (cardEl)  cardEl.style.display  = 'none';
    if (tableEl) tableEl.style.display = '';
    if (!tbodyEl) return;
    if (!segments.length) {
      tbodyEl.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#71717a;padding:30px">No segments found</td></tr>';
      return;
    }
    tbodyEl.innerHTML = segments.map(s => {
      const condBadges = (s.conditions||[]).map(c => `<span class="seg-cond-badge">${c.attrKey||c.field} ${c.operator} ${c.value}</span>`).join(' ');
      return `<tr>
        <td style="font-weight:600">${s.name}</td>
        <td style="color:#71717a;font-size:12px">${s.description||'—'}</td>
        <td>${condBadges||'—'}</td>
        <td><span style="font-weight:700;color:#8b5cf6">${s.cachedCount||0}</span></td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn btn-secondary" style="width:auto;padding:4px 10px;font-size:11px" onclick="viewSegment('${s._id}','${s.name}')"><i data-lucide="eye" style="width:12px;height:12px"></i> View</button>
            <button class="btn btn-secondary" style="width:auto;padding:4px 10px;font-size:11px;color:#ef4444" onclick="deleteSegment('${s._id}')">Delete</button>
          </div>
        </td>
      </tr>`;
    }).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

async function loadSegments() {
  const cardEl = document.getElementById('segmentsList');
  if (cardEl) cardEl.innerHTML = '<div style="text-align:center;padding:40px;color:#71717a;grid-column:1/-1">Loading...</div>';
  try {
    const res = await fetch(`/api/segments${bq}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    _allSegments = data.data;
    filterSegments();
  } catch (err) {
    if (cardEl) cardEl.innerHTML = `<div style="color:#ef4444;padding:20px;grid-column:1/-1">Error: ${err.message}</div>`;
  }
}
window.loadSegments = loadSegments;

window.viewSegment = async (id, name) => {
  // Show loading modal immediately
  openModal(`Segment: ${name}`, `<div style="text-align:center;padding:40px;color:#71717a"><i data-lucide="loader" style="animation:spin 1s linear infinite"></i><p style="margin-top:12px">Loading segment data…</p></div>`);
  if(typeof lucide!=='undefined') lucide.createIcons();

  try {
    const [segRes, custRes] = await Promise.all([
      fetch(`/api/segments/${id}${bq}`),
      fetch(`/api/segments/${id}/customers${bq}`)
    ]);
    const segData  = await segRes.json();
    const custData = await custRes.json();
    if (!segData.success) throw new Error(segData.error);

    const seg = segData.data;
    const customers = custData.data || [];

    // Condition pill renderer
    const condHTML = (seg.conditions || []).map(c => `
      <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--secondary);border-radius:8px;border-left:3px solid var(--primary)">
        <div style="flex:1">
          <p style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em">${c.field === 'attribute' ? 'Attribute' : 'Field'}</p>
          <p style="font-size:13px;font-weight:600;margin-top:2px">
            <code style="color:#a78bfa">${c.attrKey || c.field}</code>
            <span style="color:var(--muted);margin:0 6px">${c.operator}</span>
            <code style="color:#10b981">${c.value}</code>
            ${c.valueType ? `<span style="font-size:10px;color:var(--muted);margin-left:6px">(${c.valueType})</span>` : ''}
          </p>
        </div>
      </div>
    `).join('');

    // Customer rows renderer
    const custRows = customers.length ? customers.map(c => {
      const plan = c.attributes?.find(a => a.k === 'plan')?.v_str || '—';
      const score = c.attributes?.find(a => a.k === 'lead_score')?.v_num ?? '—';
      const statusColor = {active:'#10b981',unsubscribed:'#ef4444',bounced:'#f59e0b'}[c.emailStatus] || '#71717a';
      return `<tr>
        <td><span style="font-weight:500">${c.name}</span></td>
        <td style="color:var(--muted);font-size:12px">${c.email || '—'}</td>
        <td style="font-size:12px">${c.phoneNo || '—'}</td>
        <td><span class="attr-badge">${plan}</span></td>
        <td style="font-size:12px;font-weight:600;color:#8b5cf6">${score}</td>
        <td><span class="status-badge" style="background:${statusColor}20;color:${statusColor}">${c.emailStatus}</span></td>
      </tr>`;
    }).join('') : `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:24px">No matching customers found.</td></tr>`;

    document.getElementById('modalBody').innerHTML = `
      <!-- Header stats -->
      <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap">
        <div style="flex:1;min-width:100px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2);border-radius:10px;padding:14px;text-align:center">
          <p style="font-size:28px;font-weight:800;color:#8b5cf6">${customers.length}</p>
          <p style="font-size:11px;color:var(--muted)">Matching Customers</p>
        </div>
        <div style="flex:1;min-width:100px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:14px;text-align:center">
          <p style="font-size:28px;font-weight:800;color:#10b981">${(seg.conditions||[]).length}</p>
          <p style="font-size:11px;color:var(--muted)">Conditions</p>
        </div>
        <div style="flex:2;min-width:140px;background:var(--secondary);border:1px solid var(--border);border-radius:10px;padding:14px">
          <p style="font-size:11px;color:var(--muted);margin-bottom:4px">Description</p>
          <p style="font-size:13px">${seg.description || 'No description provided.'}</p>
        </div>
      </div>

      <!-- Conditions -->
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin-bottom:8px">Filter Conditions</p>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:20px">${condHTML || '<p style="color:var(--muted);font-size:12px">No conditions set.</p>'}</div>

      <!-- Customers table -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)">Matching Customers</p>
        ${customers.length ? `<button class="btn btn-secondary" style="width:auto;padding:5px 12px;font-size:11px" onclick="window.exportSegmentCSV('${id}')">Export CSV</button>` : ''}
      </div>
      <div style="overflow:auto;border-radius:8px;border:1px solid var(--border)">
        <table class="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Plan</th><th>Lead Score</th><th>Status</th></tr></thead>
          <tbody>${custRows}</tbody>
        </table>
      </div>
    `;
  } catch (err) {
    document.getElementById('modalBody').innerHTML = `<p style="color:#ef4444">Error: ${err.message}</p>`;
  }
};

window.exportSegmentCSV = async (id) => {
  const res = await fetch(`/api/segments/${id}/customers${bq}`);
  const data = await res.json();
  if (!data.success) return;
  const rows = data.data.map(c => [
    c.name, c.email || '', c.phoneNo || '',
    c.attributes?.find(a=>a.k==='plan')?.v_str || '',
    c.attributes?.find(a=>a.k==='lead_score')?.v_num ?? '',
    c.emailStatus
  ]);
  const csv = ['Name,Email,Phone,Plan,Lead Score,Status', ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `segment-${id}.csv`; a.click();
};

window.deleteSegment = async (id) => {
  if (!confirm('Delete this segment?')) return;
  await fetch(`/api/segments/${id}${bq}`, { method: 'DELETE' });
  loadSegments();
};

window.showAddSegmentModal = () => {
  openModal('New Segment', `
    <form id="addSegmentForm" style="display:flex;flex-direction:column;gap:12px">
      <div class="property-row"><span class="property-label">Segment Name *</span><input name="name" class="property-input" required placeholder="High Lead Score"></div>
      <div class="property-row"><span class="property-label">Description</span><input name="description" class="property-input" placeholder="Leads with score above 70"></div>
      <hr style="border-color:var(--border)">
      <p class="property-label">Add ONE condition (more coming)</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <select name="field" class="property-select" style="flex:1"><option value="attribute">Attribute</option><option value="emailStatus">Email Status</option></select>
        <input name="attrKey" class="property-input" style="flex:1" placeholder="Attr key (e.g. plan)">
        <select name="operator" class="property-select" style="flex:1"><option value="eq">=</option><option value="gt">&gt;</option><option value="lt">&lt;</option><option value="contains">contains</option></select>
        <input name="value" class="property-input" style="flex:1" placeholder="Value">
        <select name="valueType" class="property-select" style="flex:1"><option value="str">Text</option><option value="num">Number</option><option value="date">Date</option></select>
      </div>
      <button type="submit" class="btn">Create Segment</button>
    </form>`);

  document.getElementById('addSegmentForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const cond = { field: fd.get('field'), operator: fd.get('operator'), value: fd.get('valueType') === 'num' ? +fd.get('value') : fd.get('value'), valueType: fd.get('valueType'), attrKey: fd.get('attrKey') };
    const res = await fetch(`/api/segments${bq}`, { method: 'POST', headers, body: JSON.stringify({ name: fd.get('name'), description: fd.get('description'), conditions: [cond] }) });
    const data = await res.json();
    if (data.success) { closeModal(); loadSegments(); } else alert(data.error);
  });
};

// ══════════════════════════════════════════════════════════════════════════════
// CAMPAIGNS
// ══════════════════════════════════════════════════════════════════════════════
async function loadCampaigns() {
  const el = document.getElementById('campaignsList');
  el.innerHTML = '<div style="text-align:center;padding:40px;color:#71717a">Loading…</div>';
  try {
    const res = await fetch(`/api/campaigns${bq}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    if (!data.data.length) { el.innerHTML = '<div class="dashed-card"><div class="dashed-icon"><i data-lucide="send"></i></div><p class="dashed-title">No campaigns yet</p><p class="dashed-desc">Create your first campaign to start sending emails.</p></div>'; if(typeof lucide!=='undefined')lucide.createIcons(); return; }
    el.innerHTML = data.data.map(c => {
      const openRate  = c.stats.sent ? ((c.stats.uniqueOpens  / c.stats.sent) * 100).toFixed(1) : 0;
      const clickRate = c.stats.sent ? ((c.stats.uniqueClicks / c.stats.sent) * 100).toFixed(1) : 0;
      const statusColor = { draft:'#71717a', scheduled:'#f59e0b', sending:'#3b82f6', sent:'#10b981', failed:'#ef4444', paused:'#f97316' }[c.status] || '#71717a';
      return `<div class="dashboard-card" style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap">
        <div style="flex:1;min-width:200px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
            <span style="font-weight:600;font-size:15px">${c.name}</span>
            <span class="status-badge" style="background:${statusColor}20;color:${statusColor}">${c.status}</span>
          </div>
          <p style="font-size:12px;color:#71717a;margin-bottom:4px">Subject: ${c.subject}</p>
          <p style="font-size:11px;color:#52525b">${new Date(c.createdAt).toLocaleDateString()}</p>
        </div>
        <div style="display:flex;gap:20px;flex-wrap:wrap">
          ${c.status === 'sent' ? `
            <div style="text-align:center"><p style="font-size:18px;font-weight:700;color:#8b5cf6">${c.stats.sent}</p><p style="font-size:10px;color:#71717a">Sent</p></div>
            <div style="text-align:center"><p style="font-size:18px;font-weight:700;color:#10b981">${openRate}%</p><p style="font-size:10px;color:#71717a">Open</p></div>
            <div style="text-align:center"><p style="font-size:18px;font-weight:700;color:#a78bfa">${clickRate}%</p><p style="font-size:10px;color:#71717a">Click</p></div>
            <div style="text-align:center"><p style="font-size:18px;font-weight:700;color:#ef4444">${c.stats.bounced}</p><p style="font-size:10px;color:#71717a">Bounce</p></div>
          ` : `<div style="display:flex;align-items:center;color:#71717a;font-size:12px">${c.stats.total || 0} recipients</div>`}
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          ${c.status === 'draft' ? `<button class="btn btn-secondary btn-sm" onclick="sendCampaign('${c._id}')">Send Now</button>` : ''}
          <button class="btn-sm" style="color:#ef4444" onclick="deleteCampaign('${c._id}')">Delete</button>
        </div>
      </div>`;
    }).join('');
    if(typeof lucide!=='undefined')lucide.createIcons();
  } catch (err) { el.innerHTML = `<div style="color:#ef4444;padding:20px">Error: ${err.message}</div>`; }
}
window.loadCampaigns = loadCampaigns;

window.sendCampaign = async (id) => {
  if (!confirm('Send this campaign now? This will deliver emails to all eligible recipients.')) return;
  const res = await fetch(`/api/campaigns/${id}/send${bq}`, { method: 'POST', headers, body: JSON.stringify({}) });
  const data = await res.json();
  if (data.success) { alert(`✅ ${data.message}`); loadCampaigns(); } else alert(`❌ ${data.error}`);
};
window.deleteCampaign = async (id) => {
  if (!confirm('Delete this campaign?')) return;
  await fetch(`/api/campaigns/${id}${bq}`, { method: 'DELETE' });
  loadCampaigns();
};

window.showCreateCampaignModal = async () => {
  const [templRes, segRes] = await Promise.all([fetch(`/api/templates${bq}`), fetch(`/api/segments${bq}`)]);
  const templates = (await templRes.json()).data || [];
  const segments  = (await segRes.json()).data  || [];

  openModal('New Campaign', `
    <form id="createCampaignForm" style="display:flex;flex-direction:column;gap:12px">
      <div class="property-row"><span class="property-label">Campaign Name *</span><input name="name" class="property-input" required placeholder="July Newsletter"></div>
      <div class="property-row"><span class="property-label">Subject Line *</span><input name="subject" class="property-input" required placeholder="Check out what's new…"></div>
      <div class="property-row"><span class="property-label">Template</span>
        <select name="template" class="property-select">
          <option value="">— No template —</option>
          ${templates.map(t=>`<option value="${t._id}">${t.name}</option>`).join('')}
        </select>
      </div>
      <div class="property-row"><span class="property-label">Audience</span>
        <select name="audienceType" class="property-select">
          <option value="segment">Segment</option>
          <option value="all">All Active Contacts</option>
        </select>
      </div>
      <div class="property-row" id="segSelectRow"><span class="property-label">Segment</span>
        <select name="segment" class="property-select">
          <option value="">— All —</option>
          ${segments.map(s=>`<option value="${s._id}">${s.name} (${s.cachedCount})</option>`).join('')}
        </select>
      </div>
      <div class="property-row"><span class="property-label">From Name</span><input name="fromName" class="property-input" placeholder="Acme Corp"></div>
      <div class="property-row"><span class="property-label">From Email</span><input name="fromEmail" class="property-input" type="email" placeholder="noreply@acme.com"></div>
      <button type="submit" class="btn">Create Campaign</button>
    </form>`);

  document.getElementById('createCampaignForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = { name: fd.get('name'), subject: fd.get('subject'), audienceType: fd.get('audienceType'), fromName: fd.get('fromName'), fromEmail: fd.get('fromEmail') };
    if (fd.get('template')) payload.template = fd.get('template');
    if (fd.get('segment'))  payload.segment  = fd.get('segment');
    const res = await fetch(`/api/campaigns${bq}`, { method: 'POST', headers, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.success) { closeModal(); loadCampaigns(); } else alert(data.error);
  });
};

// ══════════════════════════════════════════════════════════════════════════════
// A/B TESTS
// ══════════════════════════════════════════════════════════════════════════════
async function loadABTests() {
  const el = document.getElementById('abTestsList');
  el.innerHTML = '<div style="text-align:center;padding:40px;color:#71717a">Loading…</div>';
  try {
    const res = await fetch(`/api/abtests${bq}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    if (!data.data.length) { el.innerHTML = '<div class="dashed-card"><div class="dashed-icon"><i data-lucide="git-branch"></i></div><p class="dashed-title">No A/B tests yet</p><p class="dashed-desc">Create two campaign variants and compare their performance.</p></div>'; if(typeof lucide!=='undefined')lucide.createIcons(); return; }
    el.innerHTML = data.data.map(t => {
      const aRate = t.campaignA?.stats?.sent ? ((t.campaignA.stats.uniqueOpens||0) / t.campaignA.stats.sent * 100).toFixed(1) : '—';
      const bRate = t.campaignB?.stats?.sent ? ((t.campaignB.stats.uniqueOpens||0) / t.campaignB.stats.sent * 100).toFixed(1) : '—';
      return `<div class="dashboard-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <span style="font-weight:600;font-size:15px">${t.name}</span>
          <span class="status-badge status-${t.status}">${t.status}${t.winner?` — Winner: ${t.winner}`:''}</span>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <div style="flex:1;min-width:140px;padding:12px;background:var(--secondary);border-radius:8px;border-left:3px solid #8b5cf6">
            <p style="font-size:11px;color:#71717a;margin-bottom:4px">Variant A</p>
            <p style="font-weight:600;font-size:13px">${t.campaignA?.name || '—'}</p>
            <p style="font-size:11px;margin-top:4px">${t.campaignA?.subject || '—'}</p>
            <p style="font-size:18px;font-weight:700;color:#8b5cf6;margin-top:8px">${aRate}% opens</p>
          </div>
          <div style="flex:1;min-width:140px;padding:12px;background:var(--secondary);border-radius:8px;border-left:3px solid #10b981">
            <p style="font-size:11px;color:#71717a;margin-bottom:4px">Variant B</p>
            <p style="font-weight:600;font-size:13px">${t.campaignB?.name || '—'}</p>
            <p style="font-size:11px;margin-top:4px">${t.campaignB?.subject || '—'}</p>
            <p style="font-size:18px;font-weight:700;color:#10b981;margin-top:8px">${bRate}% opens</p>
          </div>
        </div>
        ${t.status === 'running' ? `<div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-secondary btn-sm" onclick="pickABWinner('${t._id}','A')">Pick A as Winner</button><button class="btn btn-secondary btn-sm" onclick="pickABWinner('${t._id}','B')">Pick B as Winner</button></div>` : ''}
      </div>`;
    }).join('');
    if(typeof lucide!=='undefined')lucide.createIcons();
  } catch (err) { el.innerHTML = `<div style="color:#ef4444;padding:20px">Error: ${err.message}</div>`; }
}
window.loadABTests = loadABTests;

window.pickABWinner = async (id, variant) => {
  if (!confirm(`Declare Variant ${variant} as winner?`)) return;
  await fetch(`/api/abtests/${id}/pick-winner${bq}`, { method: 'POST', headers, body: JSON.stringify({ winner: variant }) });
  loadABTests();
};

window.showCreateABTestModal = async () => {
  const res = await fetch(`/api/campaigns${bq}`);
  const camps = (await res.json()).data || [];
  openModal('New A/B Test', `
    <form id="abTestForm" style="display:flex;flex-direction:column;gap:12px">
      <div class="property-row"><span class="property-label">Test Name *</span><input name="name" class="property-input" required placeholder="July Newsletter A/B"></div>
      <div class="property-row"><span class="property-label">Variant A (Campaign) *</span>
        <select name="campaignA" class="property-select" required><option value="">Select…</option>${camps.map(c=>`<option value="${c._id}">${c.name}</option>`).join('')}</select>
      </div>
      <div class="property-row"><span class="property-label">Variant B (Campaign) *</span>
        <select name="campaignB" class="property-select" required><option value="">Select…</option>${camps.map(c=>`<option value="${c._id}">${c.name}</option>`).join('')}</select>
      </div>
      <div class="property-row"><span class="property-label">Winner Metric</span>
        <select name="winnerMetric" class="property-select"><option value="open_rate">Open Rate</option><option value="click_rate">Click Rate</option></select>
      </div>
      <button type="submit" class="btn">Create A/B Test</button>
    </form>`);
  document.getElementById('abTestForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const res = await fetch(`/api/abtests${bq}`, { method: 'POST', headers, body: JSON.stringify({ name: fd.get('name'), campaignA: fd.get('campaignA'), campaignB: fd.get('campaignB'), winnerMetric: fd.get('winnerMetric') }) });
    const data = await res.json();
    if (data.success) { closeModal(); loadABTests(); } else alert(data.error);
  });
};

// ══════════════════════════════════════════════════════════════════════════════
// ASSETS
// ══════════════════════════════════════════════════════════════════════════════
async function loadAssets() {
  const el = document.getElementById('assetGrid');
  el.innerHTML = '<div style="text-align:center;padding:40px;color:#71717a;grid-column:1/-1">Loading…</div>';
  try {
    const res = await fetch(`/api/assets${bq}`);
    const data = await res.json();
    if (!data.success || !data.data.length) { el.innerHTML = '<div style="text-align:center;padding:40px;color:#71717a;grid-column:1/-1">No assets yet. Upload your first image.</div>'; return; }
    el.innerHTML = data.data.map(a => `
      <div class="asset-card">
        <img src="${a.url}" alt="${a.originalName}" style="width:100%;height:120px;object-fit:cover;border-radius:6px;margin-bottom:8px">
        <p style="font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.originalName}</p>
        <p style="font-size:10px;color:#71717a">${(a.size/1024).toFixed(1)} KB</p>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn-sm" onclick="copyAssetUrl('${a.url}')">Copy URL</button>
          <button class="btn-sm" style="color:#ef4444" onclick="deleteAsset('${a._id}')">Delete</button>
        </div>
      </div>`).join('');
  } catch (err) { el.innerHTML = `<div style="color:#ef4444;grid-column:1/-1;padding:20px">Error: ${err.message}</div>`; }
}
window.loadAssets = loadAssets;

window.copyAssetUrl = (url) => { navigator.clipboard.writeText(window.location.origin + url); alert('URL copied!'); };
window.deleteAsset = async (id) => {
  if (!confirm('Delete this asset?')) return;
  await fetch(`/api/assets/${id}${bq}`, { method: 'DELETE' });
  loadAssets();
};

window.uploadAsset = async (input) => {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    const res = await fetch(`/api/assets/upload${bq}`, { method: 'POST', headers, body: JSON.stringify({ filename: file.name, mimeType: file.type, dataBase64: e.target.result }) });
    const data = await res.json();
    if (data.success) { loadAssets(); } else alert('Upload failed: ' + data.error);
  };
  reader.readAsDataURL(file);
};

// ══════════════════════════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════════════════════════
async function loadSettings() {
  // Set webhook URL
  document.getElementById('webhookUrl').textContent = `${window.location.origin}/api/campaigns/webhook/zepto`;

  try {
    const res = await fetch(`/api/settings${bq}`);
    const data = await res.json();
    if (data.success && data.data) {
      const s = data.data;
      const form = document.getElementById('settingsForm');
      if (!form) return;
      const set = (name, val) => { const el = form.querySelector(`[name="${name}"]`); if (el && val) el.value = val; };
      set('provider', s.provider); set('senderName', s.senderName); set('senderEmail', s.senderEmail);
      set('replyTo', s.replyTo); set('apiKey', s.apiKey); set('smtpHost', s.smtpHost);
      set('smtpPort', s.smtpPort); set('smtpUser', s.smtpUser);
    }
  } catch {}
  loadCustomFields();
}
window.loadSettings = loadSettings;

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOM FIELDS
// ══════════════════════════════════════════════════════════════════════════════
async function loadCustomFields() {
  const tbody = document.getElementById('customFieldsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#71717a;padding:20px">Loading…</td></tr>';
  try {
    const res = await fetch(`/api/customfields${bq}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    if (!data.data.length) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#71717a;padding:20px">No custom fields defined yet.</td></tr>';
      return;
    }

    tbody.innerHTML = data.data.map(f => `
      <tr>
        <td><span style="font-weight:600">${f.label}</span></td>
        <td><code style="font-size:11px;color:#a78bfa">${f.name || '—'}</code></td>
        <td><span class="attr-badge">${f.dataType}</span></td>
        <td style="color:#71717a;font-size:12px">${f.hint || '—'}</td>
        <td style="text-align:center">${f.isMandatory ? '✅' : '❌'}</td>
        <td><code>${f.defaultValue !== undefined ? JSON.stringify(f.defaultValue) : '—'}</code></td>
        <td><span style="color:#10b981;font-weight:500">✅ Linked Segment</span></td>
        <td>
          <button class="btn-sm" style="color:#ef4444" onclick="deleteCustomField('${f._id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#ef4444;padding:20px">Error: ${err.message}</td></tr>`;
  }
}
window.loadCustomFields = loadCustomFields;

window.showAddCustomFieldModal = () => {
  openModal('Add Custom Field', `
    <form id="addCustomFieldForm" style="display:flex;flex-direction:column;gap:12px">
      <div class="property-row">
        <span class="property-label">Label *</span>
        <input name="label" class="property-input" required placeholder="Anniversary, Company Size, VIP Tier">
      </div>
      <div class="property-row">
        <span class="property-label">System Key / Name (Optional - auto-generated if blank)</span>
        <input name="name" class="property-input" placeholder="e.g. company_size">
      </div>
      <div class="property-row">
        <span class="property-label">Data Type *</span>
        <select name="dataType" class="property-select" required>
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="date">Date</option>
          <option value="email">Email</option>
          <option value="phone-number">Phone Number</option>
          <option value="select">Dropdown Select</option>
          <option value="multi-select">Multi-Select Dropdown</option>
          <option value="textarea">Textarea</option>
          <option value="switch">Switch / Toggle</option>
        </select>
      </div>
      <div class="property-row">
        <span class="property-label">Hint / Description</span>
        <input name="hint" class="property-input" placeholder="Brief help text for this field">
      </div>
      <div class="property-row">
        <span class="property-label">Default Value</span>
        <input name="defaultValue" class="property-input" placeholder="Default value if undefined">
      </div>
      <div class="property-row">
        <span class="property-label">Options (Comma separated - for Dropdowns)</span>
        <input name="options" class="property-input" placeholder="Option 1, Option 2, Option 3">
      </div>
      <div class="property-row-flex">
        <span class="property-label">Is Mandatory Field</span>
        <input type="checkbox" name="isMandatory">
      </div>
      <div class="property-row-flex" style="background:rgba(139,92,246,0.1);padding:10px;border-radius:8px;border:1px solid rgba(139,92,246,0.2)">
        <div>
          <span class="property-label" style="font-weight:600;color:var(--accent)">Automated Link to Segment</span>
          <p style="font-size:10px;color:var(--muted)">Auto-creates a dynamic Audience Segment matching this field.</p>
        </div>
        <input type="checkbox" name="autoCreateSegment" checked>
      </div>
      <button type="submit" class="btn" style="margin-top:8px">Create Custom Field</button>
    </form>
  `);

  document.getElementById('addCustomFieldForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      label: fd.get('label'),
      name: fd.get('name'),
      dataType: fd.get('dataType'),
      hint: fd.get('hint'),
      defaultValue: fd.get('defaultValue'),
      options: fd.get('options'),
      isMandatory: fd.get('isMandatory') === 'on',
      autoCreateSegment: fd.get('autoCreateSegment') === 'on'
    };

    const res = await fetch(`/api/customfields${bq}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal();
      loadCustomFields();
      if (payload.autoCreateSegment && data.linkedSegment) {
        // Navigate to Segments page and open the newly created segment's view
        nav('segments');
        // Small delay to let segments load, then auto-open the linked segment view
        setTimeout(() => {
          viewSegment(data.linkedSegment._id, data.linkedSegment.name);
        }, 800);
      } else {
        // Show success toast from builder.js or fallback
        const toast = document.getElementById('builderToast');
        if (toast) {
          toast.textContent = '✅ Custom Field Created!';
          toast.className = 'builder-toast toast-success';
          toast.style.display = 'block';
          setTimeout(() => { toast.style.display = 'none'; }, 2500);
        }
      }
    } else {
      alert(data.error);
    }
  });
};

window.deleteCustomField = async (id) => {
  if (!confirm('Are you sure you want to delete this custom field? All linked dynamic segments will be cleaned up.')) return;
  try {
    const res = await fetch(`/api/customfields/${id}${bq}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      loadCustomFields();
      showToast ? showToast('Custom Field Deleted', 'info') : alert('Custom Field Deleted');
    }
  } catch (err) {
    alert(err.message);
  }
};

document.getElementById('settingsForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  const res = await fetch(`/api/settings${bq}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
  const data = await res.json();
  if (data.success) alert('✅ Settings saved!'); else alert('❌ ' + data.error);
});

window.testSend = async () => {
  const to = prompt('Send test email to:');
  if (!to) return;
  const res = await fetch(`/api/settings/test-send${bq}`, { method: 'POST', headers, body: JSON.stringify({ to }) });
  const data = await res.json();
  alert(data.success ? `✅ Test email sent to ${to}` : `❌ ${data.error}`);
};

window.saveGeminiKey = () => {
  const key = document.getElementById('geminiKeyInput')?.value;
  if (!key) return;
  alert('ℹ️ Add GEMINI_API_KEY=' + key + ' to your .env file and restart the server.');
};

// ── Builder sidebar tabs ──────────────────────────────────────────────────────
document.querySelectorAll('.sidebar-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const id = tab.dataset.tab;
    document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === id));
    document.querySelectorAll('.sidebar-tab-content').forEach(c => c.classList.toggle('active', c.id === `tab-${id}`));
  });
});

// ── Initial load ──────────────────────────────────────────────────────────────
loadDashboard();
