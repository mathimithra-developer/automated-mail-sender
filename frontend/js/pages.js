// pages.js — All live page logic: Customers, Campaigns, A/B Tests, Segments, Assets, Settings

const bq = '';
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

// ── Avatar Color Helper ──────────────────────────────────────────────────────
function getAvatarColor(name) {
  const colors = [
    'linear-gradient(135deg, #a78bfa, #7c3aed)', // Purple
    'linear-gradient(135deg, #60a5fa, #2563eb)', // Blue
    'linear-gradient(135deg, #34d399, #059669)', // Green
    'linear-gradient(135deg, #f472b6, #db2777)', // Pink
    'linear-gradient(135deg, #fbbf24, #d97706)', // Amber
    'linear-gradient(135deg, #2dd4bf, #0d9488)', // Teal
  ];
  let hash = 0;
  const n = name || 'U';
  for (let i = 0; i < n.length; i++) hash = n.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

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
  const modalHeader = document.querySelector('#modalOverlay .modal-header');
  if (modalHeader) modalHeader.className = 'modal-header';
  if (typeof lucide !== 'undefined') lucide.createIcons();
};
window.closeModal = () => { document.getElementById('modalOverlay').style.display = 'none'; };

// ── Drawer ───────────────────────────────────────────────────────────────────
window.openDrawer = (title, bodyHTML) => {
  document.getElementById('drawerTitle').textContent = title;
  document.getElementById('drawerContent').innerHTML = bodyHTML;
  
  const overlay = document.getElementById('drawerOverlay');
  const card = document.getElementById('drawerCard');
  
  overlay.style.display = 'block';
  document.body.style.overflow = 'hidden';
  // Force browser reflow/tick
  overlay.offsetHeight;
  
  overlay.classList.add('active');
  card.classList.add('active');
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.closeDrawer = () => {
  const overlay = document.getElementById('drawerOverlay');
  const card = document.getElementById('drawerCard');
  
  overlay.classList.remove('active');
  card.classList.remove('active');
  document.body.style.overflow = '';
  
  setTimeout(() => {
    if (!overlay.classList.contains('active')) {
      overlay.style.display = 'none';
      document.getElementById('drawerContent').innerHTML = '';
      document.body.style.overflow = '';
    }
  }, 250);
};

// Click outside drawer to close
document.addEventListener('click', (e) => {
  const overlay = document.getElementById('drawerOverlay');
  if (e.target === overlay) {
    closeDrawer();
  }
});

// ── Global Toast Notification Helper ─────────────────────────────────────────
window.showToast = (title, desc = '', type = 'info') => {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const iconMap = {
    success: 'check-circle-2',
    error: 'alert-circle',
    warning: 'alert-triangle',
    info: 'info'
  };
  const iconName = iconMap[type] || 'info';

  toast.innerHTML = `
    <div class="toast-icon"><i data-lucide="${iconName}"></i></div>
    <div style="flex:1;min-width:0">
      <div class="toast-title">${title}</div>
      ${desc ? `<div class="toast-desc">${desc}</div>` : ''}
    </div>
    <button class="toast-close" style="background:none;border:none;cursor:pointer;color:var(--text-muted);padding:2px"><i data-lucide="x" style="width:14px;height:14px"></i></button>
  `;

  toast.querySelector('.toast-close').onclick = () => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 250);
  };

  container.appendChild(toast);
  if (typeof lucide !== 'undefined') lucide.createIcons();

  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 250);
    }
  }, 4000);
};

// ── Dashboard ────────────────────────────────────────────────────────────────
window.loadDashboard = async () => {
  const refreshBtn = document.querySelector('#dashboard .page-header button');
  const refreshIcon = refreshBtn?.querySelector('i[data-lucide="refresh-cw"]');
  if (refreshIcon) refreshIcon.classList.add('spin');
  if (refreshBtn) refreshBtn.disabled = true;

  // Skeleton shimmer / loading indicator
  ['statCustomers','statSegments','statTemplates','statCampaigns'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = '...';
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
    const whEl = document.getElementById('welcomeHeader'); if (whEl) whEl.textContent = `${greeting}, ${userName}!`;
    showToast('Dashboard Refreshed', 'Latest stats and overview metrics updated.', 'success');
  } catch (err) {
    showToast('Dashboard Error', err.message || 'Failed to update dashboard data.', 'error');
  } finally {
    if (refreshIcon) refreshIcon.classList.remove('spin');
    if (refreshBtn) refreshBtn.disabled = false;
  }
};

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

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOMERS
// ══════════════════════════════════════════════════════════════════════════════
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

// Cache of custom field definitions for use in operator filtering
window._custFieldTypes = {};

window.updateCustomerFilterOperators = () => {
  const keySelect = document.getElementById('custAttrKey');
  const opSelect  = document.getElementById('custAttrOp');
  if (!keySelect || !opSelect) return;

  const field    = keySelect.value;
  const oldOp    = opSelect.value;

  // Determine data type: use cached field definitions, fallback to hardcoded rules
  const fieldDef = window._custFieldTypes?.[field];
  const dataType = fieldDef?.dataType || (field === 'lead_score' ? 'number' : 'text');
  const isNumeric = dataType === 'number';
  const isDate    = dataType === 'date';
  const isSelect  = dataType === 'select' || dataType === 'tags' || dataType === 'multi-select';

  let optionsHTML = '';
  if (isNumeric) {
    optionsHTML = `
      <option value="eq">=</option>
      <option value="gt">&gt;</option>
      <option value="lt">&lt;</option>
      <option value="gte">&ge;</option>
      <option value="lte">&le;</option>
    `;
  } else if (isDate) {
    optionsHTML = `
      <option value="eq">is</option>
      <option value="gt">after</option>
      <option value="lt">before</option>
    `;
  } else if (isSelect) {
    optionsHTML = `
      <option value="eq">=</option>
    `;
  } else {
    // text / phone / email
    optionsHTML = `
      <option value="eq">=</option>
      <option value="contains">contains</option>
    `;
  }

  opSelect.innerHTML = optionsHTML;

  // Restore previous selection if still valid
  const validOps = Array.from(opSelect.options).map(o => o.value);
  opSelect.value = validOps.includes(oldOp) ? oldOp : validOps[0];
};


window.clearCustomerFilters = () => {
  const search = document.getElementById('customerSearch');
  const status = document.getElementById('custStatusFilter');
  const broadcast = document.getElementById('custBroadcastFilter');
  const attrKey = document.getElementById('custAttrKey');
  const attrVal = document.getElementById('custAttrVal');

  if (search) search.value = '';
  if (status) status.value = '';
  if (broadcast) broadcast.value = '';
  if (attrKey) attrKey.value = '';
  if (attrVal) attrVal.value = '';
  if (attrKey) window.updateCustomerFilterOperators();

  const clearBtn = document.getElementById('custClearFiltersBtn');
  if (clearBtn) clearBtn.style.display = 'none';

  loadCustomers(1);
};

async function loadCustomers(page = 1) {
  custPage = page;
  // Preload field type definitions if not yet loaded (for operator dropdown)
  if (Object.keys(window._custFieldTypes || {}).length === 0) {
    fetch(`/api/customfields${bq}`).then(r => r.json()).then(d => {
      if (d.success) {
        window._custFieldTypes = {};
        (d.data || []).forEach(cf => {
          if (cf.name) window._custFieldTypes[cf.name] = { dataType: cf.dataType, label: cf.label };
        });
        window.updateCustomerFilterOperators?.();
      }
    }).catch(() => {});
  }

  const search = document.getElementById('customerSearch')?.value || '';
  const emailStatus = document.getElementById('custStatusFilter')?.value || '';
  const allowBroadcast = document.getElementById('custBroadcastFilter')?.value || '';
  const attrKey = document.getElementById('custAttrKey')?.value || '';
  const attrVal = document.getElementById('custAttrVal')?.value || '';
  const attrOp  = document.getElementById('custAttrOp')?.value || 'eq';

  // Show/hide Clear Filters button
  const hasFilter = !!(search || emailStatus || allowBroadcast || (attrKey && attrVal));
  const clearBtn = document.getElementById('custClearFiltersBtn');
  if (clearBtn) clearBtn.style.display = hasFilter ? 'inline-flex' : 'none';

  const tableWrap = document.getElementById('customersTableWrap');
  const cardsWrap = document.getElementById('customersCards');
  const tbody = document.getElementById('customersBody');

  // Validation
  const textFields = ['city', 'plan', 'industry', 'name', 'email', 'company'];
  const isTextField = textFields.includes(attrKey);
  const isGtLt = (attrOp === 'gt' || attrOp === 'lt' || attrOp === 'gte' || attrOp === 'lte');
  const numVal = Number(attrVal);
  const isNum = !isNaN(numVal);

  if (attrKey && attrVal && ((isTextField && isGtLt) || (isGtLt && !isNum))) {
    if (_custView === 'table') {
      if (tableWrap) tableWrap.style.display = 'block';
      if (cardsWrap) cardsWrap.style.display = 'none';
      if (tbody) tbody.innerHTML = '<tr><td colspan="10" class="cust-td-empty">Invalid filter combination</td></tr>';
    } else {
      if (tableWrap) tableWrap.style.display = 'none';
      if (cardsWrap) cardsWrap.style.display = 'grid';
      if (cardsWrap) cardsWrap.innerHTML = '<div style="text-align:center;padding:40px;color:#ef4444;grid-column:1/-1">Invalid filter combination</div>';
    }
    const countBadge = document.getElementById('customerCountBadge');
    if (countBadge) countBadge.textContent = `Total: 0`;
    return;
  }

  let url = `/api/customers?page=${page}&limit=10`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (emailStatus) url += `&emailStatus=${emailStatus}`;
  if (allowBroadcast) url += `&allowBroadcast=${allowBroadcast}`;
  if (attrKey && attrVal) url += `&attrKey=${attrKey}&attrVal=${encodeURIComponent(attrVal)}&attrOp=${attrOp}`;

  if (_custView === 'table') {
    if (tableWrap) tableWrap.style.display = 'block';
    if (cardsWrap) cardsWrap.style.display = 'none';
    if (tbody) tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#71717a;padding:30px">Loading...</td></tr>';
  } else {
    if (tableWrap) tableWrap.style.display = 'none';
    if (cardsWrap) cardsWrap.style.display = 'grid';
    if (cardsWrap) cardsWrap.innerHTML = '<div style="text-align:center;padding:40px;color:#71717a;grid-column:1/-1">Loading...</div>';
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const countBadge = document.getElementById('customerCountBadge');
    if (countBadge) countBadge.textContent = `Total: ${data.pagination?.total || 0}`;

    if (_custView === 'table') {
      if (!data.data.length) {
        tbody.innerHTML = '<tr><td colspan="10" class="cust-td-empty">No customers found</td></tr>';
        return;
      }
      tbody.innerHTML = data.data.map(c => {
        // Fallbacks for name, email, phoneNo in case of default import values
        let name = (c.name || '').trim();
        let phone = (c.phoneNo || '').trim();
        let email = (c.email || '').trim().toLowerCase();

        if ((!name || name === 'Unknown') && c.attributes) {
          const attrName = c.attributes.find(a => a.k.toLowerCase() === 'customername' || a.k.toLowerCase() === 'name')?.v_str;
          if (attrName) name = attrName;
        }
        if ((!phone || phone === '0000000000') && c.attributes) {
          const attrPhone = c.attributes.find(a => a.k.toLowerCase() === 'customerphone' || a.k.toLowerCase() === 'phone')?.v_num ||
                            c.attributes.find(a => a.k.toLowerCase() === 'customerphone' || a.k.toLowerCase() === 'phone')?.v_str;
          if (attrPhone) phone = String(attrPhone);
        }
        if (!email && c.attributes) {
          const attrEmail = c.attributes.find(a => a.k.toLowerCase() === 'customeremail' || a.k.toLowerCase() === 'email')?.v_str;
          if (attrEmail) email = attrEmail;
        }

        const city = c.attributes?.find(a => a.k === 'city')?.v_str || '—';
        const plan = c.attributes?.find(a => a.k === 'plan')?.v_str || '—';
        const leadScore = c.attributes?.find(a => a.k === 'lead_score')?.v_num ?? '—';
        const company = c.attributes?.find(a => a.k === 'company')?.v_str || '—';
        const industry = c.attributes?.find(a => a.k === 'industry')?.v_str || '—';

        // Email displaying with fallback placeholder
        const emailHTML = email 
          ? `<span class="cust-email">${email}</span>` 
          : `<span style="color:var(--text-subtle);font-style:italic;font-size:12px">No email on file</span>`;

        return `<tr data-id="${c._id}" onclick="handleRowClick(event,'${c._id}')" style="cursor:pointer">
          <td onclick="event.stopPropagation()">
            <input type="checkbox" class="cust-checkbox row-checkbox" data-id="${c._id}" onchange="updateBulkBar()">
          </td>
          <td><span style="font-weight:700;color:var(--text)">${name || 'Unknown'}</span></td>
          <td><span class="cust-phone">${phone && phone !== '0000000000' ? phone : '<span style="color:var(--text-subtle)">No phone</span>'}</span></td>
          <td>${emailHTML}</td>
          <td style="color:var(--text-muted);font-size:12.5px">${city}</td>
          <td>${plan !== '—' ? `<span class="attr-badge">${plan}</span>` : '<span style="color:var(--text-subtle)">—</span>'}</td>
          <td style="text-align:center">${leadScore !== '—' ? `<span class="lead-score-pill">${leadScore}</span>` : '<span style="color:var(--text-subtle)">—</span>'}</td>
          <td style="color:var(--text-muted);font-size:12.5px">${company}</td>
          <td style="color:var(--text-muted);font-size:12.5px">${industry}</td>
          <td style="text-align:right;padding-right:20px" onclick="event.stopPropagation()">
            <div class="row-actions-wrap" style="display:inline-flex;gap:6px">
              <button class="action-icon-btn" title="Duplicate customer" onclick="duplicateCustomer('${c._id}')"><i data-lucide="copy"></i></button>
              <button class="action-icon-btn" title="Edit customer" onclick="editCustomer('${c._id}')"><i data-lucide="edit-3"></i></button>
              <button class="action-icon-btn btn-delete" title="Delete customer" onclick="deleteCustomer('${c._id}')"><i data-lucide="trash-2"></i></button>
            </div>
          </td>
        </tr>`;
      }).join('');
      if (typeof lucide !== 'undefined') lucide.createIcons();
      updateBulkBar();
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
            <div style="display:flex;gap:6px">
              <button class="action-icon-btn" title="View details" onclick="viewCustomer('${c._id}')"><i data-lucide="eye"></i></button>
              <button class="action-icon-btn" title="Edit customer" onclick="editCustomer('${c._id}')"><i data-lucide="edit-3"></i></button>
              <button class="action-icon-btn btn-delete" title="Delete customer" onclick="deleteCustomer('${c._id}')"><i data-lucide="trash-2"></i></button>
            </div>
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
            <span class="status-badge" style="color:${statusColor}">${c.emailStatus}</span>
            <span class="status-badge" style="color:${c.allowBroadcast ? '#10b981' : '#ef4444'}">
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

    // Pagination (SaaS reference style)
    const { total, limit } = data.pagination;
    const pages = Math.ceil(total / limit) || 1;
    document.getElementById('customersPagination').innerHTML = `
      <div class="pagination-left">Total Records (${total})</div>
      <div class="pagination-right">
        <button class="pag-nav-btn" onclick="loadCustomers(${custPage - 1})" ${custPage <= 1 ? 'disabled' : ''} title="Previous Page">
          <i data-lucide="chevron-left"></i>
        </button>
        <input type="number" class="pag-input" value="${custPage}" min="1" max="${pages}" onchange="if(this.value >= 1 && this.value <= ${pages}) loadCustomers(Number(this.value))">
        <span class="pag-total">/ ${pages}</span>
        <button class="pag-nav-btn" onclick="loadCustomers(${custPage + 1})" ${custPage >= pages ? 'disabled' : ''} title="Next Page">
          <i data-lucide="chevron-right"></i>
        </button>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  } catch (err) {
    if (_custView === 'table') {
      tbody.innerHTML = `<tr><td colspan="7" class="cust-td-empty" style="color:#ef4444">Error: ${err.message}</td></tr>`;
    } else {
      cardsWrap.innerHTML = `<div style="color:#ef4444;padding:20px;grid-column:1/-1">Error: ${err.message}</div>`;
    }
  }
}
window.loadCustomers = loadCustomers;

// ── Bulk Selection Helpers ────────────────────────────────────────────────────
window.updateBulkBar = () => {
  const checkboxes = document.querySelectorAll('.row-checkbox');
  const checked    = document.querySelectorAll('.row-checkbox:checked');
  const bulkBar    = document.getElementById('custBulkBar');
  const countEl    = document.getElementById('custSelectedCount');
  const selectAll  = document.getElementById('selectAllCheckbox');

  // Highlight selected rows
  checkboxes.forEach(cb => {
    const row = cb.closest('tr');
    if (row) row.classList.toggle('row-selected', cb.checked);
  });

  if (countEl) countEl.textContent = checked.length;
  if (bulkBar)  bulkBar.style.display = checked.length > 0 ? 'flex' : 'none';

  // Update header checkbox state
  if (selectAll) {
    selectAll.indeterminate = checked.length > 0 && checked.length < checkboxes.length;
    selectAll.checked = checkboxes.length > 0 && checked.length === checkboxes.length;
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.toggleSelectAll = (headerCb) => {
  const checkboxes = document.querySelectorAll('.row-checkbox');
  checkboxes.forEach(cb => { cb.checked = headerCb.checked; });
  updateBulkBar();
};

window.clearCustomerSelection = () => {
  document.querySelectorAll('.row-checkbox').forEach(cb => { cb.checked = false; });
  const sa = document.getElementById('selectAllCheckbox');
  if (sa) { sa.checked = false; sa.indeterminate = false; }
  updateBulkBar();
};

// Click anywhere on the row to toggle its checkbox
window.handleRowClick = (event, id) => {
  const row = event.currentTarget;
  const cb  = row.querySelector('.row-checkbox');
  if (cb) { cb.checked = !cb.checked; updateBulkBar(); }
};

window.deleteSelectedCustomers = async () => {
  const checked = document.querySelectorAll('.row-checkbox:checked');
  if (!checked.length) return;
  const ids = Array.from(checked).map(cb => cb.dataset.id);
  const ok  = await showConfirmDialog(
    'Delete Selected Customers',
    `Are you sure you want to permanently delete ${ids.length} customer(s)? This cannot be undone.`,
    true
  );
  if (!ok) return;

  let deleted = 0;
  let errors  = 0;
  for (const id of ids) {
    try {
      const res  = await fetch(`/api/customers/${id}${bq}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (data.success) deleted++; else errors++;
    } catch { errors++; }
  }

  if (deleted > 0) showToast('Customers Deleted', `${deleted} customer(s) removed successfully.`, 'success');
  if (errors  > 0) showToast('Some Errors', `${errors} customer(s) could not be deleted.`, 'error');
  clearCustomerSelection();
  loadCustomers();
};

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

window.deleteCustomer = async (id) => {
  const ok = await showConfirmDialog('Delete Customer', 'Are you sure you want to permanently delete this customer? This action cannot be undone.', true);
  if (!ok) return;
  try {
    const res = await fetch(`/api/customers/${id}${bq}`, {
      method: 'DELETE',
      headers
    });
    const data = await res.json();
    if (data.success) {
      showToast('Customer Deleted', 'The customer has been removed.', 'success');
      loadCustomers();
    } else {
      window.showAlertDialog ? showAlertDialog('Error', data.error || 'Delete failed', 'error') : showToast('Error', data.error, 'error');
    }
  } catch (err) {
    showToast('Error', err.message, 'error');
  }
};

window.duplicateCustomer = async (id) => {
  const res = await fetch(`/api/customers/${id}${bq}`);
  const data = await res.json();
  if (!data.success) return showToast('Error', 'Could not load customer data', 'error');
  const c = data.data;
  
  // Open the add customer modal
  window.showAddCustomerModal();
  
  // Fill the inputs in addCustomerForm once it is loaded in DOM
  setTimeout(() => {
    const form = document.getElementById('addCustomerForm');
    if (form) {
      const nameInput = form.querySelector('[name="name"]');
      const phoneInput = form.querySelector('[name="phoneNo"]');
      const emailInput = form.querySelector('[name="email"]');
      const sourceInput = form.querySelector('[name="leadSource"]');
      const broadcastInput = form.querySelector('[name="allowBroadcast"]');
      
      if (nameInput) nameInput.value = c.name + ' (Copy)';
      if (phoneInput) phoneInput.value = c.phoneNo || '';
      if (emailInput) emailInput.value = c.email || '';
      if (sourceInput) sourceInput.value = c.leadSource || '';
      if (broadcastInput) broadcastInput.checked = !!c.allowBroadcast;
      
      const city = c.attributes?.find(a => a.k === 'city')?.v_str || '';
      const plan = c.attributes?.find(a => a.k === 'plan')?.v_str || '';
      const leadScore = c.attributes?.find(a => a.k === 'lead_score')?.v_num ?? '';
      const company = c.attributes?.find(a => a.k === 'company')?.v_str || '';
      
      const cityInput = form.querySelector('[name="attr_city"]');
      const planInput = form.querySelector('[name="attr_plan"]');
      const scoreInput = form.querySelector('[name="attr_lead_score"]');
      const companyInput = form.querySelector('[name="attr_company"]');
      
      if (cityInput) cityInput.value = city;
      if (planInput) planInput.value = plan;
      if (scoreInput) scoreInput.value = leadScore;
      if (companyInput) companyInput.value = company;
    }
  }, 100);
};

window.showAddCustomerModal = () => {
  openModal('Add Customer', `
    <form id="addCustomerForm" style="display:flex;flex-direction:column;gap:12px">
      <div class="property-row"><span class="property-label">Name *</span><input name="name" class="property-input" required placeholder="Full name"></div>
      <div class="property-row"><span class="property-label">Phone *</span><input name="phoneNo" class="property-input" required placeholder="+91-9876543210"></div>
      <div class="property-row"><span class="property-label">Email</span><input name="email" type="email" class="property-input" placeholder="email@example.com"></div>
      <div class="property-row"><span class="property-label">Lead Source</span><input name="leadSource" class="property-input" placeholder="website, referral..."></div>
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
    if (data.success) {
      closeModal();
      showToast('Customer Added', 'New customer created successfully.', 'success');
      loadCustomers();
    } else {
      showToast('Error', data.error, 'error');
    }
  });
};


window.editCustomer = async (id) => {
  const res = await fetch(`/api/customers/${id}${bq}`);
  const data = await res.json();
  if (!data.success) return showToast('Error', 'Could not load customer data', 'error');
  const c = data.data;
  const city      = c.attributes?.find(a => a.k === 'city')?.v_str || '';
  const plan      = c.attributes?.find(a => a.k === 'plan')?.v_str || '';
  const leadScore = c.attributes?.find(a => a.k === 'lead_score')?.v_num ?? '';
  const company   = c.attributes?.find(a => a.k === 'company')?.v_str || '';
  openModal('Edit Customer', `<form id="editCustomerForm" style="display:flex;flex-direction:column;gap:12px">
    <div class="property-row"><span class="property-label">Name *</span><input name="name" class="property-input" required value="${c.name||''}"></div>
    <div class="property-row"><span class="property-label">Phone *</span><input name="phoneNo" class="property-input" required value="${c.phoneNo||''}"></div>
    <div class="property-row"><span class="property-label">Email</span><input name="email" type="email" class="property-input" value="${c.email||''}"></div>
    <div class="property-row"><span class="property-label">Lead Source</span><input name="leadSource" class="property-input" value="${c.leadSource||''}"></div>
    <div class="property-row"><span class="property-label">Email Status</span><select name="emailStatus" class="property-select"><option value="active" ${c.emailStatus==='active'?'selected':''}>Active</option><option value="unsubscribed" ${c.emailStatus==='unsubscribed'?'selected':''}>Unsubscribed</option><option value="bounced" ${c.emailStatus==='bounced'?'selected':''}>Bounced</option><option value="complained" ${c.emailStatus==='complained'?'selected':''}>Complained</option></select></div>
    <div class="property-row-flex"><span class="property-label">Allow Broadcast</span><input type="checkbox" name="allowBroadcast" ${c.allowBroadcast?'checked':''}></div>
    <hr style="border-color:var(--border)"><p class="property-label">Custom Attributes</p>
    <div class="grid-4" style="gap:8px"><div class="property-row"><span class="property-label">City</span><input name="attr_city" class="property-input" value="${city}" placeholder="Mumbai"></div><div class="property-row"><span class="property-label">Plan</span><input name="attr_plan" class="property-input" value="${plan}" placeholder="pro"></div><div class="property-row"><span class="property-label">Lead Score</span><input name="attr_lead_score" type="number" class="property-input" value="${leadScore}" placeholder="75"></div><div class="property-row"><span class="property-label">Company</span><input name="attr_company" class="property-input" value="${company}" placeholder="Acme Ltd"></div></div>
    <button type="submit" class="btn" style="margin-top:8px">Save Changes</button>
  </form>`);
  document.getElementById('editCustomerForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const attrs = [];
    if (fd.get('attr_city'))       attrs.push({ k: 'city',       v_str: fd.get('attr_city') });
    if (fd.get('attr_plan'))       attrs.push({ k: 'plan',       v_str: fd.get('attr_plan') });
    if (fd.get('attr_lead_score')) attrs.push({ k: 'lead_score', v_num: +fd.get('attr_lead_score') });
    if (fd.get('attr_company'))    attrs.push({ k: 'company',    v_str: fd.get('attr_company') });
    const pr = await fetch(`/api/customers/${id}${bq}`, { method: 'PATCH', headers, body: JSON.stringify({ name: fd.get('name'), phoneNo: fd.get('phoneNo'), email: fd.get('email'), leadSource: fd.get('leadSource'), emailStatus: fd.get('emailStatus'), allowBroadcast: fd.get('allowBroadcast') === 'on', attributes: attrs }) });
    const pd = await pr.json();
    if (pd.success) { closeModal(); showToast('Customer Updated', 'Changes saved successfully.', 'success'); loadCustomers(); }
    else showToast('Error', pd.error || 'Failed to save changes', 'error');
  });
};

window.showImportModal = () => {
  openModal('Import Customers (CSV / Excel)', `
    <p class="property-label" style="margin-bottom:12px">Upload a CSV or Excel file (.xlsx, .xls) with columns: <code>name, phoneNo, email, city, plan, lead_score, company, industry</code></p>
    <input type="file" id="csvFile" accept=".csv, .xlsx, .xls" class="property-input" style="padding:8px">
    <button class="btn" style="margin-top:12px;width:100%" onclick="processCSV()">Import</button>
    <div id="importStatus" style="margin-top:10px;font-size:12px"></div>`);
};

window.processCSV = async () => {
  const file = document.getElementById('csvFile')?.files[0];
  if (!file) return;

  const importStatus = document.getElementById('importStatus');
  if (importStatus) importStatus.textContent = 'Reading file...';

  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON array of objects
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      
      if (rows.length === 0) {
        if (importStatus) importStatus.textContent = "Error: File is empty";
        return;
      }
      
      if (importStatus) importStatus.textContent = `Importing ${rows.length} rows...`;
      
      const res = await fetch(`/api/customers/import${bq}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ rows })
      });
      const responseData = await res.json();
      
      if (importStatus) {
        importStatus.textContent = responseData.success 
          ? `Imported ${responseData.inserted} customers successfully` 
          : `Error: ${responseData.error}`;
      }
      
      if (responseData.success) {
        setTimeout(() => {
          closeModal();
          loadCustomers();
        }, 1500);
      }
    } catch (err) {
      if (importStatus) importStatus.textContent = `Error: ${err.message}`;
    }
  };

  reader.onerror = function() {
    if (importStatus) importStatus.textContent = "Error reading file";
  };

  reader.readAsArrayBuffer(file);
};

// ══════════════════════════════════════════════════════════════════════════════
// SEGMENTS
// ══════════════════════════════════════════════════════════════════════════════
let _segView = 'card';
let segPage = 1;

window.setSegmentView = (view) => {
  _segView = view;
  const cardBtn  = document.getElementById('segCardViewBtn');
  const tableBtn = document.getElementById('segTableViewBtn');
  if (cardBtn)  { cardBtn.style.background  = view==='card'  ? 'var(--primary)' : 'transparent'; cardBtn.style.color  = view==='card'  ? '#fff' : '#71717a'; }
  if (tableBtn) { tableBtn.style.background = view==='table' ? 'var(--primary)' : 'transparent'; tableBtn.style.color = view==='table' ? '#fff' : '#71717a'; }
  loadSegments(segPage);
};

window.filterSegments = () => {
  loadSegments(1);
};

function getSegmentRulePillsJS(s) {
  const formatOp = (op) => {
    if (!op || op === 'eq') return '=';
    if (op === 'is_not') return '≠';
    if (op === 'gt') return '>';
    if (op === 'lt') return '<';
    if (op === 'gte') return '≥';
    if (op === 'lte') return '≤';
    if (op === 'contains') return 'contains';
    if (op === 'starts_with') return 'starts with';
    if (op === 'ends_with') return 'ends with';
    return op;
  };

  const condGroups = s.conditionGroups || [];
  if (condGroups.length > 0) {
    const pills = [];
    condGroups.forEach(g => {
      (g.conditions || []).forEach(c => {
        const field = c.attrKey || c.field || 'name';
        const opStr = formatOp(c.operator);
        const val = c.value ?? '';
        pills.push(`${field} ${opStr} ${val}`.trim());
      });
    });
    if (pills.length > 0) return pills;
  }

  const legacyConds = s.conditions || [];
  if (legacyConds.length > 0) {
    return legacyConds.map(c => {
      const field = c.attrKey || c.field || 'name';
      const opStr = formatOp(c.operator);
      const val = c.value ?? '';
      return `${field} ${opStr} ${val}`.trim();
    });
  }

  return ['All contacts'];
}

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
      const lastSync = s.lastEvaluatedAt ? new Date(s.lastEvaluatedAt).toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '18 Jul 2026, 04:21 pm';
      
      const pills = getSegmentRulePillsJS(s);
      const rulesHTML = pills.map(p =>
        `<span class="seg-rule-pill"><i data-lucide="filter" style="width:10px;height:10px"></i>${p}</span>`
      ).join('');

      return `
      <div class="seg-card" id="seg-${s._id}">
        <div class="seg-card-header-band">
          <span class="seg-members-badge">
            <i data-lucide="users" style="width:12px;height:12px"></i>
            ${s.cachedCount || 0} Members
          </span>
          <div class="seg-card-actions">
            <button class="seg-action-btn" title="View details" onclick="viewSegment('${s._id}','${s.name}')"><i data-lucide="eye" style="width:14px;height:14px"></i></button>
            <button class="seg-action-btn" title="Edit segment" onclick="editSegment('${s._id}')"><i data-lucide="pencil" style="width:14px;height:14px"></i></button>
            <button class="seg-action-btn" title="Duplicate segment" onclick="duplicateSegment('${s._id}')"><i data-lucide="copy" style="width:14px;height:14px"></i></button>
            <button class="seg-action-btn btn-delete" title="Delete segment" onclick="deleteSegment('${s._id}')"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>
          </div>
        </div>

        <div class="seg-card-body">
          <h3 class="seg-card-title">${s.name}</h3>
          <p class="seg-card-desc">${s.description || 'Dynamic audience segment'}</p>
          
          <div class="seg-card-rules-sec">
            <div class="seg-section-label">MATCHING RULES</div>
            <div class="seg-rules-wrapper">${rulesHTML}</div>
          </div>

          <div class="seg-card-footer">
            <span>Evaluated: ${lastSync}</span>
          </div>
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
      const pills = getSegmentRulePillsJS(s);
      const condBadges = pills.map(p => `<span class="seg-rule-pill" style="margin-right:4px"><i data-lucide="filter" style="width:10px;height:10px"></i>${p}</span>`).join('');

      return `<tr>
        <td style="font-weight:600">${s.name}</td>
        <td style="color:#71717a;font-size:13px">${s.description||'—'}</td>
        <td><div style="display:flex;flex-wrap:wrap;gap:4px">${condBadges}</div></td>
        <td><span style="font-weight:700;color:#2563eb">${s.cachedCount||0}</span></td>
        <td style="text-align:right;padding-right:20px" onclick="event.stopPropagation()">
          <div class="row-actions-wrap" style="display:inline-flex;gap:6px">
            <button class="seg-action-btn" title="View details" onclick="viewSegment('${s._id}','${s.name}')"><i data-lucide="eye" style="width:14px;height:14px"></i></button>
            <button class="seg-action-btn" title="Edit segment" onclick="editSegment('${s._id}')"><i data-lucide="pencil" style="width:14px;height:14px"></i></button>
            <button class="seg-action-btn" title="Duplicate segment" onclick="duplicateSegment('${s._id}')"><i data-lucide="copy" style="width:14px;height:14px"></i></button>
            <button class="seg-action-btn btn-delete" title="Delete segment" onclick="deleteSegment('${s._id}')"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>
          </div>
        </td>
      </tr>`;
    }).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

async function loadSegments(page = 1) {
  segPage = page;

  if (arguments.length === 0) {
    const searchInput = document.getElementById('segmentSearch');
    if (searchInput) searchInput.value = '';
    const statusSelect = document.getElementById('segmentStatusFilter');
    if (statusSelect) statusSelect.value = '';
  }

  const search = document.getElementById('segmentSearch')?.value || '';
  const status = document.getElementById('segmentStatusFilter')?.value || '';

  const cardEl  = document.getElementById('segmentsList');
  const tableEl = document.getElementById('segmentsTable');
  const tbodyEl = document.getElementById('segmentsTableBody');

  if (_segView === 'card') {
    if (cardEl) {
      cardEl.style.display = '';
      cardEl.innerHTML = '<div style="text-align:center;padding:40px;color:#71717a;grid-column:1/-1">Loading...</div>';
    }
    if (tableEl) tableEl.style.display = 'none';
  } else {
    if (cardEl) cardEl.style.display = 'none';
    if (tableEl) tableEl.style.display = '';
    if (tbodyEl) tbodyEl.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#71717a;padding:30px">Loading...</td></tr>';
  }

  try {
    let url = `/api/segments?page=${page}&limit=10`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${status}`;

    const res = await fetch(url);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const segments = data.data || [];

    const countEl = document.getElementById('segmentCount');
    if (countEl) countEl.textContent = `Total Records (${data.pagination?.total || 0})`;

    renderSegmentView(segments);

    // Render pagination
    const { total, limit } = data.pagination || { total: segments.length, limit: 10 };
    const pages = Math.ceil(total / limit) || 1;
    const startIdx = total === 0 ? 0 : (segPage - 1) * limit + 1;
    const endIdx = Math.min(segPage * limit, total);

    const pagEl = document.getElementById('segmentsPagination');
    if (pagEl) {
      pagEl.innerHTML = `
        <div class="seg-pagination-left">Showing ${startIdx}–${endIdx} of ${total} segments</div>
        <div class="seg-pagination-right">
          <button class="seg-pag-btn" onclick="loadSegments(${segPage - 1})" ${segPage <= 1 ? 'disabled' : ''} title="Previous Page">
            <i data-lucide="chevron-left" style="width:14px;height:14px"></i>
          </button>
          <input type="number" class="seg-pag-input" value="${segPage}" min="1" max="${pages}" onchange="if(this.value >= 1 && this.value <= ${pages}) loadSegments(Number(this.value))">
          <span class="seg-pag-total">/ ${pages}</span>
          <button class="seg-pag-btn" onclick="loadSegments(${segPage + 1})" ${segPage >= pages ? 'disabled' : ''} title="Next Page">
            <i data-lucide="chevron-right" style="width:14px;height:14px"></i>
          </button>
        </div>
      `;
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
  } catch (err) {
    if (_segView === 'card') {
      if (cardEl) cardEl.innerHTML = `<div style="color:#ef4444;padding:20px;grid-column:1/-1">Error: ${err.message}</div>`;
    } else {
      if (tbodyEl) tbodyEl.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#ef4444;padding:30px">Error: ${err.message}</td></tr>`;
    }
  }
}
window.loadSegments = loadSegments;

let segmentCustomers = [];
let segmentCustomersPage = 1;
const SEGMENT_CUSTOMERS_LIMIT = 10;

window.renderSegmentCustomers = (page = 1) => {
  segmentCustomersPage = page;
  const total = segmentCustomers.length;
  const pages = Math.ceil(total / SEGMENT_CUSTOMERS_LIMIT) || 1;
  const start = (page - 1) * SEGMENT_CUSTOMERS_LIMIT;
  const end = start + SEGMENT_CUSTOMERS_LIMIT;
  const pageCustomers = segmentCustomers.slice(start, end);

  const tbody = document.getElementById('segmentModalCustomersBody');
  if (!tbody) return;

  tbody.innerHTML = pageCustomers.length ? pageCustomers.map(c => {
    const plan = c.attributes?.find(a => a.k === 'plan')?.v_str || '—';
    const score = c.attributes?.find(a => a.k === 'lead_score')?.v_num ?? '—';
    const statusColor = {active:'#10b981',unsubscribed:'#ef4444',bounced:'#f59e0b'}[c.emailStatus] || '#71717a';
    return `<tr>
      <td><span style="font-weight:500">${c.name || 'Unknown'}</span></td>
      <td style="color:var(--muted);font-size:12px">${c.email || '—'}</td>
      <td style="font-size:12px">${c.phoneNo || '—'}</td>
      <td><span class="attr-badge">${plan}</span></td>
      <td style="font-size:12px;font-weight:600;color:#8b5cf6">${score}</td>
      <td><span class="status-badge" style="background:${statusColor}20;color:${statusColor}">${c.emailStatus}</span></td>
    </tr>`;
  }).join('') : `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:24px">No matching customers found.</td></tr>`;

  // Render the pagination controls
  const pagWrap = document.getElementById('segmentModalCustomersPagination');
  if (pagWrap) {
    if (total <= SEGMENT_CUSTOMERS_LIMIT) {
      pagWrap.style.display = 'none';
      pagWrap.innerHTML = '';
    } else {
      pagWrap.style.display = 'flex';
      pagWrap.innerHTML = `
        <div class="pagination-left">Total Records (${total})</div>
        <div class="pagination-right">
          <button class="pag-nav-btn" onclick="window.renderSegmentCustomers(${segmentCustomersPage - 1})" ${segmentCustomersPage <= 1 ? 'disabled' : ''} title="Previous Page">
            <i data-lucide="chevron-left"></i>
          </button>
          <input type="number" class="pag-input" value="${segmentCustomersPage}" min="1" max="${pages}" onchange="if(this.value >= 1 && this.value <= ${pages}) window.renderSegmentCustomers(Number(this.value))">
          <span class="pag-total">/ ${pages}</span>
          <button class="pag-nav-btn" onclick="window.renderSegmentCustomers(${segmentCustomersPage + 1})" ${segmentCustomersPage >= pages ? 'disabled' : ''} title="Next Page">
            <i data-lucide="chevron-right"></i>
          </button>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }
};

window.viewSegment = async (id, name) => {
  // Show loading modal immediately
  openModal(`Segment: ${name}`, `<div style="text-align:center;padding:40px;color:#71717a"><i data-lucide="loader" style="animation:spin 1s linear infinite"></i><p style="margin-top:12px">Loading segment data...</p></div>`);
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
    segmentCustomers = customers;

    const modalHeader = document.querySelector('#modalOverlay .modal-header');
    if (modalHeader) modalHeader.classList.add('seg-modal-header');

    // Condition pill renderer
    let condHTML = '';
    let totalConds = 0;
    if (seg.conditionGroups && seg.conditionGroups.length > 0) {
      condHTML = seg.conditionGroups.map((g, gIdx) => {
        totalConds += (g.conditions || []).length;
        const condsListHTML = (g.conditions || []).map((c, cIdx) => `
          <div class="seg-cond-pill">
            <code>${c.attrKey || c.field}</code>
            <span class="seg-cond-op">${c.operator}</span>
            <code>${c.value}</code>
            ${c.valueType ? `<span style="font-size:10px;opacity:0.7">(${c.valueType})</span>` : ''}
          </div>
        `).join(`<div style="font-size:10px;font-weight:700;color:var(--text-muted);text-align:center;margin:4px 0">${g.matchType === 'any' ? 'OR' : 'AND'}</div>`);
        
        return `
          <div class="seg-cond-group-card">
            <p class="seg-cond-group-title">Condition Group ${gIdx + 1} (Match ${g.matchType.toUpperCase()})</p>
            <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start">${condsListHTML}</div>
          </div>
        `;
      }).join('');
    } else {
      totalConds = (seg.conditions || []).length;
      condHTML = `<div style="display:flex;flex-wrap:wrap;gap:8px">` + (seg.conditions || []).map(c => `
        <div class="seg-cond-pill">
          <code>${c.attrKey || c.field}</code>
          <span class="seg-cond-op">${c.operator}</span>
          <code>${c.value}</code>
          ${c.valueType ? `<span style="font-size:10px;opacity:0.7">(${c.valueType})</span>` : ''}
        </div>
      `).join('') + `</div>`;
    }

    document.getElementById('modalBody').innerHTML = `
      <!-- Header stats -->
      <div class="seg-stat-row">
        <div class="seg-stat-card">
          <span class="seg-stat-num">${custData.count ?? customers.length}</span>
          <span class="seg-stat-lbl">Matching Customers</span>
        </div>
        <div class="seg-stat-card">
          <span class="seg-stat-num">${totalConds}</span>
          <span class="seg-stat-lbl">Conditions</span>
        </div>
        <div class="seg-stat-card">
          <span class="seg-stat-desc-text">${seg.description || 'No description provided.'}</span>
          <span class="seg-stat-lbl">Description</span>
        </div>
      </div>

      <!-- Conditions -->
      <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:8px">Filter Conditions</p>
      <div class="seg-conditions-card">${condHTML || '<p style="color:var(--text-muted);font-size:12px;margin:0">No conditions set.</p>'}</div>

      <!-- Customers table -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted)">Matching Customers</p>
        ${customers.length ? `<button class="btn btn-sm btn-outline-primary" onclick="window.exportSegmentCSV('${id}')">Export CSV</button>` : ''}
      </div>
      <div style="overflow:auto;border-radius:8px;border:1px solid var(--border)">
        <table class="data-table seg-modal-table">
          <thead><tr class="seg-modal-table-header"><th>Name</th><th>Email</th><th>Phone</th><th>Plan</th><th>Lead Score</th><th>Status</th></tr></thead>
          <tbody id="segmentModalCustomersBody"></tbody>
        </table>
      </div>
      <div id="segmentModalCustomersPagination" class="table-pagination" style="margin-top:10px; border:1px solid var(--border); border-radius:8px"></div>
    `;
    window.renderSegmentCustomers(1);
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
  const _segOk = await showConfirmDialog('Delete Segment', 'Delete this segment? All linked campaigns will not be affected.', true); if (!_segOk) return;
  await fetch(`/api/segments/${id}${bq}`, { method: 'DELETE' });
  loadSegments();
};

window.showAddSegmentModal = async (prefill = null, editId = null) => {
  // Fetch custom fields
  let customFields = [];
  try {
    const cfRes = await fetch(`/api/customfields${bq}`);
    const cfData = await cfRes.json();
    if (cfData.success) customFields = cfData.data || [];
  } catch (e) { console.error("Error fetching custom fields", e); }

  const systemFields = [
    { label: 'Name', name: 'name', dataType: 'text' },
    { label: 'Email', name: 'email', dataType: 'text' },
    { label: 'Phone Number', name: 'phoneNo', dataType: 'text' },
    { label: 'Email Status', name: 'emailStatus', dataType: 'select', options: ['active', 'unsubscribed', 'bounced', 'complained'] },
    { label: 'Allow Broadcast', name: 'allowBroadcast', dataType: 'select', options: ['true', 'false'] },
    { label: 'Lead Source', name: 'leadSource', dataType: 'text' },
    { label: 'Inbox Status', name: 'inboxStatus', dataType: 'select', options: ['open', 'closed', 'in progress'] }
  ];

  const customFieldsMapped = customFields.map(cf => ({
    label: cf.label, name: cf.name, dataType: cf.dataType,
    options: cf.options || [], isCustom: true
  }));

  const allFields = [...systemFields, ...customFieldsMapped];
  const seenNames = new Set();
  const uniqueFields = [];
  for (const f of allFields) {
    if (!seenNames.has(f.name)) { seenNames.add(f.name); uniqueFields.push(f); }
  }

  const isEdit = !!editId;
  const modalTitle = isEdit ? 'Edit Segment' : 'New Segment';

  // Modal HTML skeleton — redesigned
  // Drawer HTML — same pattern as Campaign / Custom Field drawers
  openDrawer(modalTitle, `
    <form id="addSegmentForm" class="drawer-form">

      <div class="drawer-body">

        <!-- Inline Error Message -->
        <div id="segFormError" style="display:none;color:#ef4444;background:#fef2f2;border:1px solid #fee2e2;padding:10px;border-radius:6px;font-size:12px;font-weight:500;margin-bottom:12px"></div>

        <!-- Segment Details -->
        <div class="drawer-section">
          <h3 class="drawer-section-title">Segment Details</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div style="display:flex;flex-direction:column;gap:6px">
              <label style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em">Segment Name *</label>
              <input name="name" id="segNameInput" class="property-input" required placeholder="e.g., VIP Customers" value="${prefill?.name || ''}" style="font-size:14px;font-weight:500">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px">
              <label style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em">Description</label>
              <input name="description" id="segDescInput" class="property-input" placeholder="Optional description" value="${prefill?.description || ''}">
            </div>
          </div>
        </div>

        <!-- Targeting Rules -->
        <div class="drawer-section">
          <h3 class="drawer-section-title">Targeting Rules</h3>

          <!-- Between-groups logic toggle -->
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
            <div style="display:flex;align-items:center;gap:6px;background:var(--secondary);border:1px solid var(--border);border-radius:8px;padding:4px 10px">
              <span style="font-size:11px;color:var(--muted)">Groups match:</span>
              <select id="groupsLogicSelect" class="property-select" style="padding:2px 6px;font-size:12px;font-weight:600;width:auto;border:none;background:transparent">
                <option value="all">ALL (AND)</option>
                <option value="any">ANY (OR)</option>
              </select>
            </div>
            <div id="previewPill" style="margin-left:auto;display:flex;align-items:center;gap:8px;background:linear-gradient(135deg,rgba(139,92,246,0.1),rgba(59,130,246,0.1));border:1px solid rgba(139,92,246,0.2);border-radius:10px;padding:6px 14px;cursor:pointer" title="Click to show matching customers preview">
              <i data-lucide="users" style="width:14px;height:14px;color:#8b5cf6"></i>
              <span style="font-size:12px;color:var(--muted)">Matching:</span>
              <span id="previewCountVal" style="font-weight:800;color:#8b5cf6;font-size:14px">—</span>
              <button type="button" id="refreshPreviewBtn" style="background:none;border:none;cursor:pointer;padding:2px;display:flex;align-items:center;color:var(--muted)" title="Refresh">
                <i data-lucide="refresh-cw" style="width:12px;height:12px"></i>
              </button>
            </div>
          </div>

          <div id="conditionGroupsContainer" style="display:flex;flex-direction:column;gap:8px"></div>

          <button type="button" id="addConditionGroupBtn" class="btn btn-secondary" style="width:100%;margin-top:12px;display:flex;align-items:center;justify-content:center;gap:6px;padding:8px;font-size:12px;border-style:dashed">
            <i data-lucide="plus-circle" style="width:14px;height:14px"></i>
            Add Filter Group
          </button>
        </div>

        <!-- Matching Customers Preview Section -->
        <div class="drawer-section" id="segPreviewCustomersSection" style="display:none">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <h3 class="drawer-section-title" style="margin:0">Matching Customers Preview</h3>
            <span id="segPreviewLimitWarning" style="font-size:11px;color:var(--text-muted);font-weight:500"></span>
          </div>
          <div id="segPreviewCustomersWrap" style="border-radius:8px;border:1px solid var(--border);margin-bottom:10px">
            <table class="data-table" style="min-width: unset; width: 100%">
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th></tr></thead>
              <tbody id="segPreviewCustomersBody"></tbody>
            </table>
          </div>
          <div id="segPreviewCustomersPagination" class="table-pagination" style="border:1px solid var(--border); border-radius:8px"></div>
        </div>

      </div>

      <!-- Sticky footer -->
      <div class="drawer-footer">
        <button type="button" onclick="closeDrawer()" class="btn btn-secondary" style="width:auto;padding:8px 18px">Cancel</button>
        <button type="submit" class="btn" style="width:auto;padding:8px 20px;display:flex;align-items:center;gap:6px">
          <i data-lucide="${isEdit ? 'save' : 'plus-circle'}" style="width:14px;height:14px"></i>
          ${isEdit ? 'Update Segment' : 'Create Segment'}
        </button>
      </div>

    </form>
  `);

  if (typeof lucide !== 'undefined') lucide.createIcons();

  // ── State ────────────────────────────────────────────────────────────────────
  let groups = prefill?.conditionGroups?.length
    ? prefill.conditionGroups.map(g => ({
        id: Date.now() + Math.random(),
        matchType: g.matchType || 'all',
        conditions: (g.conditions || []).map(c => {
          let field = c.field === 'attribute' ? (c.attrKey || 'name') : (c.field || 'name');
          let operator = c.operator || 'contains';
          let value = c.value ?? '';

          if (value && typeof value === 'object') {
            if (value.$regex !== undefined) {
              operator = 'matches pattern';
              value = value.$regex;
            } else if (value.$not && value.$not.$regex !== undefined) {
              operator = 'does not match pattern';
              value = value.$not.$regex;
            } else if (value.$in && Array.isArray(value.$in)) {
              operator = 'is empty';
              value = '';
            } else if (value.$nin && Array.isArray(value.$nin)) {
              operator = 'is not empty';
              value = '';
            }
          }
          return { field, operator, value };
        })
      }))
    : [{ id: Date.now(), matchType: 'all', conditions: [{ field: 'name', operator: 'contains', value: '' }] }];

  // ── Preview Matching Customers State & Render ────────────────────────────────
  let previewCustomers = [];
  let previewCustomersPage = 1;
  const PREVIEW_CUSTOMERS_LIMIT = 10;
  let isPreviewExpanded = false;

  window.renderPreviewCustomers = (page = 1) => {
    previewCustomersPage = page;
    const total = previewCustomers.length;
    const pages = Math.ceil(total / PREVIEW_CUSTOMERS_LIMIT) || 1;
    const start = (page - 1) * PREVIEW_CUSTOMERS_LIMIT;
    const end = start + PREVIEW_CUSTOMERS_LIMIT;
    const pageCustomers = previewCustomers.slice(start, end);

    const tbody = document.getElementById('segPreviewCustomersBody');
    if (!tbody) return;

    if (total === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:24px">No customers match yet — add a condition to see results</td></tr>`;
      const pagWrap = document.getElementById('segPreviewCustomersPagination');
      if (pagWrap) {
        pagWrap.style.display = 'none';
        pagWrap.innerHTML = '';
      }
      return;
    }

    tbody.innerHTML = pageCustomers.map(c => {
      return `<tr>
        <td><span style="font-weight:500">${c.name || 'Unknown'}</span></td>
        <td style="color:var(--muted);font-size:12px">${c.email || '—'}</td>
        <td style="font-size:12px">${c.phoneNo || '—'}</td>
      </tr>`;
    }).join('');

    const pagWrap = document.getElementById('segPreviewCustomersPagination');
    if (pagWrap) {
      if (total <= PREVIEW_CUSTOMERS_LIMIT) {
        pagWrap.style.display = 'none';
        pagWrap.innerHTML = '';
      } else {
        pagWrap.style.display = 'flex';
        pagWrap.innerHTML = `
          <div class="pagination-left">Total: ${total}</div>
          <div class="pagination-right">
            <button type="button" class="pag-nav-btn" onclick="window.renderPreviewCustomers(${previewCustomersPage - 1})" ${previewCustomersPage <= 1 ? 'disabled' : ''} title="Previous Page">
              <i data-lucide="chevron-left"></i>
            </button>
            <input type="number" class="pag-input" value="${previewCustomersPage}" min="1" max="${pages}" onchange="if(this.value >= 1 && this.value <= ${pages}) window.renderPreviewCustomers(Number(this.value))">
            <span class="pag-total">/ ${pages}</span>
            <button type="button" class="pag-nav-btn" onclick="window.renderPreviewCustomers(${previewCustomersPage + 1})" ${previewCustomersPage >= pages ? 'disabled' : ''} title="Next Page">
              <i data-lucide="chevron-right"></i>
            </button>
          </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }
  };

  // ── Helper: get operators for field type ─────────────────────────────────────
  function getOperators(fDef) {
    if (!fDef) return [];
    if (fDef.dataType === 'phone-number' || fDef.name === 'phoneNo' || fDef.label === 'Phone Number') {
      return [
        { value: 'is', label: '=' },
        { value: 'is not', label: 'is not' },
        { value: 'contains', label: 'contains' },
        { value: 'does not contain', label: 'does not contain' },
        { value: 'starts with', label: 'starts with' },
        { value: 'ends with', label: 'ends with' },
        { value: 'does not start with', label: 'does not start with' },
        { value: 'does not end with', label: 'does not end with' },
        { value: 'matches pattern', label: 'matches pattern' },
        { value: 'does not match pattern', label: 'does not match pattern' },
        { value: 'is empty', label: 'is empty' },
        { value: 'is not empty', label: 'is not empty' }
      ];
    }
    if (fDef.dataType === 'number') return [
      { value: 'is', label: 'is' }, { value: 'is not', label: 'is not' },
      { value: 'greater than', label: 'greater than' }, { value: 'less than', label: 'less than' },
      { value: 'greater than or equal to', label: '≥' }, { value: 'less than or equal to', label: '≤' }
    ];
    if (fDef.dataType === 'date') return [
      { value: 'is', label: 'is' }, { value: 'is not', label: 'is not' },
      { value: 'after', label: 'after' }, { value: 'before', label: 'before' },
      { value: 'on or after', label: 'on or after' }, { value: 'on or before', label: 'on or before' }
    ];
    if (fDef.dataType === 'select') return [
      { value: 'is', label: 'is' }, { value: 'is not', label: 'is not' }
    ];
    return [
      { value: 'is', label: 'is' }, { value: 'is not', label: 'is not' },
      { value: 'contain', label: 'contains' }, { value: 'does not contain', label: 'does not contain' },
      { value: 'starts with', label: 'starts with' }, { value: 'ends with', label: 'ends with' }
    ];
  }

  // ── Helper: map condition to backend ────────────────────────────────────────
  function mapConditionToBackend(cond) {
    const fDef = uniqueFields.find(f => f.name === cond.field);
    if (!fDef) return null;
    let value = cond.value;
    let operator = cond.operator;

    if (operator === 'matches pattern') {
      operator = 'is';
      value = { $regex: cond.value, $options: 'i' };
    } else if (operator === 'does not match pattern') {
      operator = 'is';
      value = { $not: { $regex: cond.value, $options: 'i' } };
    } else if (operator === 'is empty') {
      operator = 'is';
      value = { $in: [null, ""] };
    } else if (operator === 'is not empty') {
      operator = 'is';
      value = { $nin: [null, ""] };
    } else {
      if (fDef.dataType === 'number') value = Number(value);
      else if (fDef.dataType === 'select' && fDef.name === 'allowBroadcast') value = value === 'true';
    }

    let valueType = 'str';
    if (fDef.dataType === 'number') valueType = 'num';
    else if (fDef.dataType === 'date') valueType = 'date';
    if (fDef.isCustom) return { field: 'attribute', attrKey: fDef.name, operator, value, valueType };
    return { field: fDef.name, operator, value, valueType };
  }

  function getBackendPayload() {
    return groups.map(g => ({
      matchType: g.matchType,
      conditions: g.conditions.map(mapConditionToBackend).filter(Boolean)
    }));
  }

  // ── Debounced preview ────────────────────────────────────────────────────────
  let _previewTimer = null;
  function schedulePreview(ms = 600) {
    clearTimeout(_previewTimer);
    _previewTimer = setTimeout(updatePreview, ms);
  }

  async function updatePreview() {
    const previewVal = document.getElementById('previewCountVal');
    if (!previewVal) return;
    previewVal.innerHTML = `<span style="opacity:.6;font-size:12px">…</span>`;
    
    const noConditions = !groups.length || !groups.some(g => g.conditions.length > 0);
    if (noConditions) {
      previewVal.textContent = '0';
      previewCustomers = [];
      window.renderPreviewCustomers(1);
      const warningEl = document.getElementById('segPreviewLimitWarning');
      if (warningEl) warningEl.textContent = '';
      return;
    }

    try {
      const conditionGroups = getBackendPayload();
      const res = await fetch(`/api/segments/preview${bq}`, {
        method: 'POST', headers,
        body: JSON.stringify({ conditionGroups, includeList: isPreviewExpanded })
      });
      const data = await res.json();
      previewVal.textContent = data.success ? `${data.count}` : `—`;
      previewCustomers = data.success ? (data.customers || []) : [];
      window.renderPreviewCustomers(1);
      
      const warningEl = document.getElementById('segPreviewLimitWarning');
      if (warningEl) {
        if (data.success && data.count > previewCustomers.length) {
          warningEl.textContent = `Showing ${previewCustomers.length} of ${data.count} matching customers`;
        } else {
          warningEl.textContent = '';
        }
      }
    } catch (e) {
      previewVal.textContent = `—`;
      previewCustomers = [];
      window.renderPreviewCustomers(1);
      const warningEl = document.getElementById('segPreviewLimitWarning');
      if (warningEl) warningEl.textContent = '';
    }
  }

  // ── Render condition group cards ─────────────────────────────────────────────
  function renderGroups() {
    const container = document.getElementById('conditionGroupsContainer');
    if (!container) return;

    // Between-group separator (shown between groups, not before first)
    const groupsLogic = document.getElementById('groupsLogicSelect')?.value || 'all';
    const betweenLabel = groupsLogic === 'any' ? 'OR' : 'AND';

    container.innerHTML = groups.map((g, gIdx) => {
      const operators = {};
      const condRowsHTML = g.conditions.map((c, cIdx) => {
        const fDef = uniqueFields.find(f => f.name === c.field) || uniqueFields[0];
        const ops = getOperators(fDef);
        if (!c.operator || !ops.some(op => op.value === c.operator)) c.operator = ops[0].value;

        const fieldOptsHTML = uniqueFields.map(f =>
          `<option value="${f.name}" ${f.name === c.field ? 'selected' : ''}>${f.label}</option>`
        ).join('');
        const opOptsHTML = ops.map(op =>
          `<option value="${op.value}" ${op.value === c.operator ? 'selected' : ''}>${op.label}</option>`
        ).join('');

        let valueHTML = '';
        if (c.operator === 'is empty' || c.operator === 'is not empty') {
          valueHTML = `<input type="text" class="property-input cond-value-input" data-gidx="${gIdx}" data-cidx="${cIdx}" value="" disabled placeholder="No value needed" style="min-width:0;flex:1">`;
        } else if (fDef.dataType === 'select') {
          valueHTML = `<select class="property-select cond-value-select" data-gidx="${gIdx}" data-cidx="${cIdx}" style="min-width:0;flex:1">
            ${(fDef.options||[]).map(opt => `<option value="${opt}" ${opt === String(c.value) ? 'selected':''}>${opt}</option>`).join('')}
          </select>`;
        } else if (fDef.dataType === 'date') {
          valueHTML = `<input type="date" class="property-input cond-value-input" data-gidx="${gIdx}" data-cidx="${cIdx}" value="${c.value}" style="min-width:0;flex:1">`;
        } else if (fDef.dataType === 'number') {
          valueHTML = `<input type="number" class="property-input cond-value-input" data-gidx="${gIdx}" data-cidx="${cIdx}" value="${c.value}" placeholder="Value" style="min-width:0;flex:1">`;
        } else {
          valueHTML = `<input type="text" class="property-input cond-value-input" data-gidx="${gIdx}" data-cidx="${cIdx}" value="${c.value}" placeholder="Enter value…" style="min-width:0;flex:1">`;
        }

        const andOrSep = cIdx > 0 ? `
          <div style="display:flex;align-items:center;gap:8px;padding:0 4px">
            <div style="flex:1;height:1px;background:var(--border)"></div>
            <span style="font-size:10px;font-weight:700;color:${g.matchType==='any'?'#f59e0b':'#3b82f6'};background:${g.matchType==='any'?'#fef3c7':'#eff6ff'};border:1px solid ${g.matchType==='any'?'#fcd34d':'#bfdbfe'};padding:1px 8px;border-radius:10px">${g.matchType === 'any' ? 'OR' : 'AND'}</span>
            <div style="flex:1;height:1px;background:var(--border)"></div>
          </div>` : '';

        return `
          ${andOrSep}
          <div class="cond-row" style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;align-items:center;background:var(--bg-card);border:1px solid var(--border);border-radius:8px;padding:10px 12px">
            <div style="display:flex;flex-direction:column;gap:3px;min-width:0">
              <span style="font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase">Field</span>
              <select class="property-select cond-field-select" data-gidx="${gIdx}" data-cidx="${cIdx}" style="font-size:13px;width:100%">${fieldOptsHTML}</select>
            </div>
            <div style="display:flex;flex-direction:column;gap:3px;min-width:0">
              <span style="font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase">Operator</span>
              <select class="property-select cond-operator-select" data-gidx="${gIdx}" data-cidx="${cIdx}" style="font-size:13px;width:100%">${opOptsHTML}</select>
            </div>
            <div style="display:flex;flex-direction:column;gap:3px;min-width:0">
              <span style="font-size:10px;font-weight:600;color:var(--muted);text-transform:uppercase">Value</span>
              ${valueHTML}
            </div>
            <button type="button" class="remove-cond-btn" data-gidx="${gIdx}" data-cidx="${cIdx}" title="Remove" style="background:none;border:none;color:#ef4444;cursor:pointer;padding:4px;border-radius:6px;display:flex;align-items:center;margin-top:16px;opacity:.7" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity='.7'">
              <i data-lucide="x" style="width:14px;height:14px"></i>
            </button>
          </div>`;
      }).join('');

      // Between-group separator
      const groupSep = gIdx > 0 ? `
        <div style="display:flex;align-items:center;gap:8px;margin:4px 0">
          <div style="flex:1;height:1px;background:var(--border)"></div>
          <span style="font-size:11px;font-weight:800;color:var(--primary);background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2);padding:2px 12px;border-radius:10px">${betweenLabel}</span>
          <div style="flex:1;height:1px;background:var(--border)"></div>
        </div>` : '';

      return `
        ${groupSep}
        <div class="cond-group-card" style="border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--bg-elevated)">
          <!-- Group header -->
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(139,92,246,0.04);border-bottom:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="width:22px;height:22px;background:var(--primary);color:#fff;border-radius:50%;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center">${gIdx+1}</span>
              <span style="font-size:12px;font-weight:600;color:var(--text)">Condition Group</span>
              <div style="display:flex;align-items:center;gap:6px;background:var(--secondary);border:1px solid var(--border);border-radius:6px;padding:2px 8px">
                <span style="font-size:11px;color:var(--muted)">Match</span>
                <select class="property-select group-match-select" data-gidx="${gIdx}" style="font-size:11px;font-weight:700;width:auto;padding:0 4px;border:none;background:transparent">
                  <option value="all" ${g.matchType==='all'?'selected':''}>ALL (AND)</option>
                  <option value="any" ${g.matchType==='any'?'selected':''}>ANY (OR)</option>
                </select>
              </div>
            </div>
            <button type="button" class="remove-group-btn" data-gidx="${gIdx}" title="Remove group" style="background:none;border:none;color:var(--muted);cursor:pointer;padding:4px;border-radius:6px;display:flex;align-items:center;opacity:.7" onmouseover="this.style.color='#ef4444';this.style.opacity=1" onmouseout="this.style.color='var(--muted)';this.style.opacity='.7'">
              <i data-lucide="trash-2" style="width:14px;height:14px"></i>
            </button>
          </div>
          <!-- Conditions -->
          <div style="display:flex;flex-direction:column;gap:6px;padding:12px 14px">
            ${condRowsHTML}
          </div>
          <!-- Add condition -->
          <div style="padding:0 14px 12px">
            <button type="button" class="add-cond-btn btn btn-secondary btn-sm" data-gidx="${gIdx}" style="font-size:11px;display:flex;align-items:center;gap:4px;width:auto;border-style:dashed">
              <i data-lucide="plus" style="width:12px;height:12px"></i> Add Condition
            </button>
          </div>
        </div>`;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();

    // ── Re-attach listeners ───────────────────────────────────────────────────
    container.querySelectorAll('.group-match-select').forEach(sel => {
      sel.addEventListener('change', e => {
        groups[+e.target.dataset.gidx].matchType = e.target.value;
        renderGroups(); schedulePreview();
      });
    });
    container.querySelectorAll('.cond-field-select').forEach(sel => {
      sel.addEventListener('change', e => {
        const gIdx = +e.target.dataset.gidx, cIdx = +e.target.dataset.cidx;
        const fDef = uniqueFields.find(f => f.name === e.target.value);
        groups[gIdx].conditions[cIdx].field = e.target.value;
        groups[gIdx].conditions[cIdx].value = fDef?.dataType === 'select' ? (fDef.options[0]||'')
          : fDef?.dataType === 'date' ? new Date().toISOString().slice(0,10) : '';
        renderGroups(); schedulePreview();
      });
    });
    container.querySelectorAll('.cond-operator-select').forEach(sel => {
      sel.addEventListener('change', e => {
        groups[+e.target.dataset.gidx].conditions[+e.target.dataset.cidx].operator = e.target.value;
        schedulePreview();
      });
    });
    container.querySelectorAll('.cond-value-input,.cond-value-select').forEach(inp => {
      inp.addEventListener('input', e => {
        groups[+inp.dataset.gidx].conditions[+inp.dataset.cidx].value = e.target.value;
        schedulePreview();
      });
      inp.addEventListener('change', e => {
        groups[+inp.dataset.gidx].conditions[+inp.dataset.cidx].value = e.target.value;
        schedulePreview(100);
      });
    });
    container.querySelectorAll('.remove-cond-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const b = e.target.closest('.remove-cond-btn');
        const gIdx = +b.dataset.gidx, cIdx = +b.dataset.cidx;
        groups[gIdx].conditions.splice(cIdx, 1);
        if (groups[gIdx].conditions.length === 0) groups.splice(gIdx, 1);
        renderGroups(); schedulePreview();
      });
    });
    container.querySelectorAll('.remove-group-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const gIdx = +e.target.closest('.remove-group-btn').dataset.gidx;
        groups.splice(gIdx, 1);
        renderGroups(); schedulePreview();
      });
    });
    container.querySelectorAll('.add-cond-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const gIdx = +e.target.closest('.add-cond-btn').dataset.gidx;
        groups[gIdx].conditions.push({ field: 'name', operator: 'contains', value: '' });
        renderGroups(); schedulePreview();
      });
    });
  }

  document.getElementById('addConditionGroupBtn')?.addEventListener('click', () => {
    groups.push({ id: Date.now(), matchType: 'all', conditions: [{ field: 'name', operator: 'contains', value: '' }] });
    renderGroups(); schedulePreview();
  });
  document.getElementById('refreshPreviewBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    updatePreview();
  });
  document.getElementById('previewPill')?.addEventListener('click', (e) => {
    if (e.target.closest('#refreshPreviewBtn')) return;
    isPreviewExpanded = !isPreviewExpanded;
    const sect = document.getElementById('segPreviewCustomersSection');
    const pill = document.getElementById('previewPill');
    if (sect) {
      sect.style.display = isPreviewExpanded ? 'block' : 'none';
    }
    if (pill) {
      if (isPreviewExpanded) {
        pill.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.15))';
        pill.style.borderColor = 'rgba(139,92,246,0.4)';
      } else {
        pill.style.background = '';
        pill.style.borderColor = '';
      }
    }
    updatePreview();
  });
  document.getElementById('groupsLogicSelect')?.addEventListener('change', () => { renderGroups(); schedulePreview(); });

  // Initial render + preview
  renderGroups();
  schedulePreview(400);

  // ── Form Submit ───────────────────────────────────────────────────────────────
  document.getElementById('addSegmentForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get('name');
    const description = fd.get('description');
    const conditionGroups = getBackendPayload();

    const errDiv = document.getElementById('segFormError');
    if (errDiv) errDiv.style.display = 'none';

    if (!conditionGroups.length || !conditionGroups.some(g => g.conditions.length > 0)) {
      showToast('Please add at least one condition.', 'error');
      return;
    }
    const conditions = conditionGroups[0]?.conditions || [];

    try {
      let res;
      if (isEdit) {
        res = await fetch(`/api/segments/${editId}${bq}`, {
          method: 'PATCH', headers,
          body: JSON.stringify({ name, description, conditions, conditionGroups })
        });
      } else {
        res = await fetch(`/api/segments${bq}`, {
          method: 'POST', headers,
          body: JSON.stringify({ name, description, conditions, conditionGroups })
        });
      }
      const data = await res.json();
      if (data.success) {
        closeDrawer();
        showToast(isEdit ? 'Segment updated!' : 'Segment created!', 'success');
        loadSegments();
      } else {
        if (errDiv) {
          errDiv.textContent = data.error || 'Error saving segment';
          errDiv.style.display = 'block';
          errDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          showToast(data.error || 'Error saving segment', 'error');
        }
      }
    } catch (err) {
      if (errDiv) {
        errDiv.textContent = 'Error saving segment: ' + err.message;
        errDiv.style.display = 'block';
      } else {
        showToast('Error saving segment', 'error');
      }
    }
  });
};

// ── Edit segment ──────────────────────────────────────────────────────────────
window.editSegment = async (id) => {
  try {
    const res = await fetch(`/api/segments/${id}${bq}`);
    const data = await res.json();
    if (!data.success) { showToast('Failed to load segment', 'error'); return; }
    const seg = data.data;
    window.showAddSegmentModal(seg, id);
  } catch (err) {
    showToast('Error loading segment: ' + err.message, 'error');
  }
};

// ── Duplicate segment ─────────────────────────────────────────────────────────
window.duplicateSegment = async (id) => {
  const ok = await showConfirmDialog('Duplicate Segment', 'Create a copy of this segment?');
  if (!ok) return;
  try {
    const res = await fetch(`/api/segments/${id}${bq}`);
    const data = await res.json();
    if (!data.success) { showToast('Failed to load segment', 'error'); return; }
    const seg = data.data;
    const payload = {
      name: `${seg.name} (Copy)`,
      description: seg.description || '',
      conditions: seg.conditions || [],
      conditionGroups: seg.conditionGroups || []
    };
    const postRes = await fetch(`/api/segments${bq}`, { method: 'POST', headers, body: JSON.stringify(payload) });
    const postData = await postRes.json();
    if (postData.success) {
      showToast('Segment duplicated!', 'success');
      loadSegments();
    } else {
      showToast(postData.error || 'Failed to duplicate segment', 'error');
    }
  } catch (err) {
    showToast('Error duplicating segment: ' + err.message, 'error');
  }
};


// ══════════════════════════════════════════════════════════════════════════════
// CAMPAIGNS
// ══════════════════════════════════════════════════════════════════════════════
async function loadCampaigns() {
  const el = document.getElementById('campaignsList');
  el.innerHTML = '<div style="text-align:center;padding:40px;color:#71717a">Loading...</div>';
  try {
    const res = await fetch(`/api/campaigns${bq}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    if (!data.data.length) { el.innerHTML = '<div class="dashed-card"><div class="dashed-icon"><i data-lucide="send"></i></div><p class="dashed-title">No campaigns yet</p><p class="dashed-desc">Create your first campaign to start sending emails.</p></div>'; if(typeof lucide!=='undefined')lucide.createIcons(); return; }
    el.innerHTML = data.data.map(c => {
      const openRate  = c.stats.sent ? ((c.stats.uniqueOpens  / c.stats.sent) * 100).toFixed(1) : 0;
      const clickRate = c.stats.sent ? ((c.stats.uniqueClicks / c.stats.sent) * 100).toFixed(1) : 0;
      const statusColor = { draft:'#71717a', scheduled:'#f59e0b', sending:'#3b82f6', sent:'#10b981', failed:'#ef4444', paused:'#f97316' }[c.status] || '#71717a';
      const isPastScheduled = c.status === 'scheduled' && c.scheduledAt && new Date(c.scheduledAt) <= new Date();
      const showSendNow = c.status === 'draft' || (c.status === 'scheduled' && !isPastScheduled);

      return `<div class="camp-card" id="camp-${c._id}">
        <div style="flex:1;min-width:200px;display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <span style="font-weight:700;font-size:15px;color:var(--text)">${c.name}</span>
            <span class="status-badge status-badge-${c.status}">
              ${c.status}${c.status === 'scheduled' && c.scheduledAt ? ` — ${new Date(c.scheduledAt).toLocaleString()}` : ''}
            </span>
          </div>
          <p style="font-size:12.5px;color:var(--text-muted);margin:0">Subject: <span style="color:var(--text);font-weight:500">${c.subject}</span></p>
          <p style="font-size:11px;color:var(--text-subtle);margin:0">Created: ${new Date(c.createdAt).toLocaleDateString()}</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          ${c.status === 'sent' ? `
            <div class="camp-stat-tile"><span class="camp-stat-num">${c.stats.sent}</span><span class="camp-stat-label">Sent</span></div>
            <div class="camp-stat-tile"><span class="camp-stat-num">${openRate}%</span><span class="camp-stat-label">Open</span></div>
            <div class="camp-stat-tile"><span class="camp-stat-num">${clickRate}%</span><span class="camp-stat-label">Click</span></div>
            <div class="camp-stat-tile"><span class="camp-stat-num">${c.stats.bounced}</span><span class="camp-stat-label">Bounce</span></div>
          ` : `<div class="camp-stat-recipients">${c.stats.total || 0} recipients</div>`}
        </div>
        <div style="display:flex;gap:8px;align-items:center;margin-left:auto">
          ${showSendNow ? `<button class="btn btn-sm" onclick="sendCampaign('${c._id}')">Send Now</button>` : ''}
          <button class="btn btn-sm btn-outline-danger" onclick="deleteCampaign('${c._id}')">Delete</button>
        </div>
      </div>`;
    }).join('');
    if(typeof lucide!=='undefined')lucide.createIcons();
  } catch (err) { el.innerHTML = `<div style="color:#ef4444;padding:20px">Error: ${err.message}</div>`; }
}
window.loadCampaigns = loadCampaigns;

window.sendCampaign = async (id) => {
  const _sendOk = await showConfirmDialog('Send Campaign', 'Send this campaign now? This will deliver emails to all eligible recipients.'); if (!_sendOk) return;
  try {
    const res = await fetch(`/api/campaigns/${id}/send${bq}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({})
    });
    const data = await res.json();
    if (data.success) {
      if (window.showToast) {
        window.showToast('Campaign Sent', data.message || 'Campaign sent successfully', 'success');
      } else {
        showToast('Campaign Queued', data.message, 'success');
      }
      loadCampaigns();
    } else {
      window.showAlertDialog ? showAlertDialog('Error', data.error || 'Failed to send campaign', 'error') : showToast('Error', data.error || 'Failed to send campaign', 'error');
    }
  } catch (err) {
    showToast('Error', err.message, 'error');
  }
};
window.deleteCampaign = async (id) => {
  const _camOk = await showConfirmDialog('Delete Campaign', 'Are you sure you want to delete this campaign?', true); if (!_camOk) return;
  try {
    const res = await fetch(`/api/campaigns/${id}${bq}`, {
      method: 'DELETE',
      headers
    });
    const data = await res.json();
    if (data.success) {
      if (window.showToast) {
        window.showToast('Campaign Deleted', 'Campaign deleted successfully', 'success');
      } else {
        showToast('Campaign Deleted', 'The campaign has been removed.', 'success');
      }
      loadCampaigns();
    } else {
      window.showAlertDialog ? showAlertDialog('Error', data.error || 'Failed to delete campaign', 'error') : showToast('Error', data.error || 'Failed to delete campaign', 'error');
    }
  } catch (err) {
    showToast('Error', err.message, 'error');
  }
};

window.showCreateCampaignModal = async () => {
  const [templRes, segRes] = await Promise.all([
    fetch('/api/templates?all=true'),
    fetch('/api/segments?all=true')
  ]);
  const templates = (await templRes.json()).data || [];
  const segments  = (await segRes.json()).data  || [];

  openDrawer('New Campaign', `
    <form id="createCampaignForm" class="drawer-form">
      <div class="drawer-body">
        
        <!-- Inline Error Message -->
        <div id="campaignFormError" style="display:none;color:#ef4444;background:#fef2f2;border:1px solid #fee2e2;padding:10px;border-radius:6px;font-size:12px;font-weight:500;margin-bottom:10px"></div>

        <!-- Section: Campaign Details -->
        <div class="drawer-section">
          <h3 class="drawer-section-title">Campaign Details</h3>
          <div class="property-row">
            <span class="property-label">Campaign Name *</span>
            <input name="name" class="property-input" required placeholder="July Newsletter">
          </div>
          <div class="property-row">
            <span class="property-label">Subject Line *</span>
            <input name="subject" class="property-input" required placeholder="Check out what's new...">
          </div>
          <div class="property-row">
            <span class="property-label">Template *</span>
            <select name="template" class="property-select" required>
              <option value="">— No template —</option>
              ${templates.map(t=>`<option value="${t._id}">${t.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Section: Audience -->
        <div class="drawer-section">
          <h3 class="drawer-section-title">Audience</h3>
          <div class="property-row">
            <span class="property-label">Audience Type</span>
            <select name="audienceType" class="property-select">
              <option value="segment">Segment</option>
              <option value="all">All Active Contacts</option>
            </select>
          </div>
          <div class="property-row" id="segSelectRow">
            <span class="property-label">Segment</span>
            <select name="segment" class="property-select">
              <option value="">— All —</option>
              ${segments.map(s=>`<option value="${s._id}">${s.name} (${s.cachedCount})</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Section: Sender -->
        <div class="drawer-section">
          <h3 class="drawer-section-title">Sender Information</h3>
          <div class="property-row">
            <span class="property-label">From Name</span>
            <input name="fromName" class="property-input" placeholder="Acme Corp">
          </div>
          <div class="property-row">
            <span class="property-label">From Email *</span>
            <input name="fromEmail" class="property-input" type="email" required placeholder="noreply@acme.com">
          </div>
        </div>

        <!-- Section: Delivery -->
        <div class="drawer-section">
          <h3 class="drawer-section-title">Delivery Options</h3>
          <div class="property-row">
            <span class="property-label">Send Action</span>
            <select name="sendAction" id="sendActionSelect" class="property-select">
              <option value="send_now">Send Immediately</option>
              <option value="schedule">Schedule for Specific Time</option>
              <option value="draft">Save as Draft / Send Later</option>
            </select>
          </div>
          <div class="property-row" id="scheduleTimeRow" style="display:none">
            <span class="property-label">Scheduled Time *</span>
            <input name="scheduledAt" id="scheduledAtInput" type="datetime-local" class="property-input">
          </div>
        </div>

      </div>

      <div class="drawer-footer">
        <button type="button" class="btn btn-secondary" onclick="closeDrawer()">Cancel</button>
        <button type="submit" class="btn">Create Campaign</button>
      </div>
    </form>`);

  const sendActionSelect = document.getElementById('sendActionSelect');
  const scheduleTimeRow  = document.getElementById('scheduleTimeRow');
  const scheduledAtInput = document.getElementById('scheduledAtInput');

  // Default to 1 hour from now for scheduledAt picker
  const nowPlusHour = new Date(Date.now() + 3600000);
  const nowIso = new Date(nowPlusHour.getTime() - (nowPlusHour.getTimezoneOffset() * 60000)).toISOString().slice(0,16);
  if (scheduledAtInput) scheduledAtInput.value = nowIso;

  if (sendActionSelect) {
    sendActionSelect.addEventListener('change', () => {
      if (sendActionSelect.value === 'schedule') {
        scheduleTimeRow.style.display = '';
        if (scheduledAtInput) scheduledAtInput.required = true;
      } else {
        scheduleTimeRow.style.display = 'none';
        if (scheduledAtInput) scheduledAtInput.required = false;
      }
    });
  }

  document.getElementById('createCampaignForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);

    const errDiv = document.getElementById('campaignFormError');
    if (errDiv) errDiv.style.display = 'none';

    const template = fd.get('template');
    if (!template) {
      if (errDiv) {
        errDiv.textContent = 'Please select a template';
        errDiv.style.display = 'block';
        errDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    const fromEmail = (fd.get('fromEmail') || '').trim();
    if (!fromEmail) {
      if (errDiv) {
        errDiv.textContent = 'Sender email is required';
        errDiv.style.display = 'block';
        errDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    const sendAction = fd.get('sendAction');

    const payload = {
      name: fd.get('name'),
      subject: fd.get('subject'),
      audienceType: fd.get('audienceType'),
      fromName: fd.get('fromName'),
      fromEmail: fromEmail,
      template: template
    };

    if (fd.get('segment'))  payload.segment  = fd.get('segment');

    if (sendAction === 'schedule') {
      const scheduledVal = fd.get('scheduledAt');
      if (!scheduledVal) {
        showToast('Scheduled time is required', 'error');
        return;
      }
      payload.scheduledAt = new Date(scheduledVal).toISOString();
      payload.status = 'scheduled';
    }

    try {
      const res = await fetch(`/api/campaigns${bq}`, { method: 'POST', headers, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      closeDrawer();
      
      if (sendAction === 'send_now') {
        showToast('Campaign created! Sending emails now...', 'info');
        window.sendCampaign(data.data._id);
      } else if (sendAction === 'schedule') {
        showToast(`Campaign scheduled for ${new Date(payload.scheduledAt).toLocaleString()}`, 'success');
        loadCampaigns();
      } else {
        showToast('Campaign saved as draft', 'success');
        loadCampaigns();
      }
    } catch (err) {
      window.showAlertDialog ? showAlertDialog('Error', err.message, 'error') : showToast('Error', err.message, 'error');
    }
  });
};

// ══════════════════════════════════════════════════════════════════════════════
// A/B TESTS
// ══════════════════════════════════════════════════════════════════════════════
async function loadABTests() {
  const el = document.getElementById('abTestsList');
  el.innerHTML = '<div style="text-align:center;padding:40px;color:#71717a">Loading...</div>';
  try {
    const res = await fetch(`/api/abtests${bq}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    if (!data.data.length) { el.innerHTML = '<div class="dashed-card"><div class="dashed-icon"><i data-lucide="git-branch"></i></div><p class="dashed-title">No A/B tests yet</p><p class="dashed-desc">Create two campaign variants and compare their performance.</p></div>'; if(typeof lucide!=='undefined')lucide.createIcons(); return; }
    el.innerHTML = data.data.map(t => {
      const aRate = t.campaignA?.stats?.sent ? ((t.campaignA.stats.uniqueOpens||0) / t.campaignA.stats.sent * 100).toFixed(1) : '—';
      const bRate = t.campaignB?.stats?.sent ? ((t.campaignB.stats.uniqueOpens||0) / t.campaignB.stats.sent * 100).toFixed(1) : '—';
      
      const campStatusClass = {
        running: 'sending',
        completed: 'sent',
        cancelled: 'failed'
      }[t.status] || 'draft';

      return `<div class="camp-card" style="flex-direction:column;align-items:stretch;width:100%">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;width:100%">
          <span style="font-weight:700;font-size:15px;color:var(--text)">${t.name}</span>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="status-badge status-badge-${campStatusClass}">${t.status}${t.winner?` — Winner: ${t.winner}`:''}</span>
            <button class="action-icon-btn btn-delete" title="Delete A/B Test" onclick="deleteABTest('${t._id}', '${t.status}')"><i data-lucide="trash-2"></i></button>
          </div>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;width:100%">
          <div style="flex:1;min-width:140px;padding:16px;background:#ffffff;border:1px solid hsl(214, 60%, 88%);border-left:4px solid var(--primary);border-radius:8px;display:flex;flex-direction:column;gap:6px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">
              <span style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em">Variant A</span>
              <span style="background:var(--primary-subtle);color:var(--primary-dark);font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px">A</span>
            </div>
            <p style="font-weight:700;font-size:13px;color:var(--text);margin:0">${t.campaignA?.name || '—'}</p>
            <p style="font-size:11.5px;color:var(--text-muted);margin:0">Subject: <span style="color:var(--text);font-weight:500">${t.campaignA?.subject || '—'}</span></p>
            <div style="margin-top:auto;padding-top:10px">
              <div style="display:inline-flex;align-items:baseline;gap:4px;background:var(--primary-subtle);border:1px solid hsl(214, 60%, 86%);border-radius:4px;padding:4px 8px">
                <span style="font-size:14px;font-weight:700;color:var(--primary-dark)">${aRate}%</span>
                <span style="font-size:9px;font-weight:600;color:var(--text-muted);text-transform:uppercase">opens</span>
              </div>
            </div>
          </div>
          <div style="flex:1;min-width:140px;padding:16px;background:#ffffff;border:1px solid hsl(214, 60%, 88%);border-left:4px solid hsl(214, 90%, 75%);border-radius:8px;display:flex;flex-direction:column;gap:6px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">
              <span style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em">Variant B</span>
              <span style="background:hsl(214, 60%, 93%);color:hsl(214, 90%, 50%);font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px">B</span>
            </div>
            <p style="font-weight:700;font-size:13px;color:var(--text);margin:0">${t.campaignB?.name || '—'}</p>
            <p style="font-size:11.5px;color:var(--text-muted);margin:0">Subject: <span style="color:var(--text);font-weight:500">${t.campaignB?.subject || '—'}</span></p>
            <div style="margin-top:auto;padding-top:10px">
              <div style="display:inline-flex;align-items:baseline;gap:4px;background:var(--primary-subtle);border:1px solid hsl(214, 60%, 86%);border-radius:4px;padding:4px 8px">
                <span style="font-size:14px;font-weight:700;color:var(--primary-dark)">${bRate}%</span>
                <span style="font-size:9px;font-weight:600;color:var(--text-muted);text-transform:uppercase">opens</span>
              </div>
            </div>
          </div>
        </div>
        ${t.status === 'running' ? `<div style="display:flex;gap:8px;margin-top:16px;width:100%"><button class="btn btn-outline-primary btn-sm" onclick="pickABWinner('${t._id}','A')">Pick Variant A as Winner</button><button class="btn btn-outline-primary btn-sm" onclick="pickABWinner('${t._id}','B')">Pick Variant B as Winner</button></div>` : ''}
      </div>`;
    }).join('');
    if(typeof lucide!=='undefined')lucide.createIcons();
  } catch (err) { el.innerHTML = `<div style="color:#ef4444;padding:20px">Error: ${err.message}</div>`; }
}
window.loadABTests = loadABTests;

window.pickABWinner = async (id, variant) => {
  const _winOk = await showConfirmDialog('Declare Winner', `Declare Variant ${variant} as winner? This action cannot be reversed.`); if (!_winOk) return;
  await fetch(`/api/abtests/${id}/pick-winner${bq}`, { method: 'POST', headers, body: JSON.stringify({ winner: variant }) });
  loadABTests();
};

window.deleteABTest = async (id, status) => {
  let msg = 'Are you sure you want to delete this A/B test?';
  if (status === 'running') {
    msg = 'This test is currently running — deleting it will stop tracking results. ' + msg;
  }
  const _ok = await showConfirmDialog('Delete A/B Test', msg, true);
  if (!_ok) return;
  await fetch(`/api/abtests/${id}${bq}`, { method: 'DELETE' });
  loadABTests();
};

window.showCreateABTestModal = async () => {
  const res = await fetch('/api/campaigns?all=true');
  const camps = (await res.json()).data || [];
  openModal('New A/B Test', `
    <form id="abTestForm" style="display:flex;flex-direction:column;gap:12px">
      <div class="property-row"><span class="property-label">Test Name *</span><input name="name" class="property-input" required placeholder="July Newsletter A/B"></div>
      <div class="property-row"><span class="property-label">Variant A (Campaign) *</span>
        <select name="campaignA" class="property-select" required><option value="">Select...</option>${camps.map(c=>`<option value="${c._id}">${c.name}</option>`).join('')}</select>
      </div>
      <div class="property-row"><span class="property-label">Variant B (Campaign) *</span>
        <select name="campaignB" class="property-select" required><option value="">Select...</option>${camps.map(c=>`<option value="${c._id}">${c.name}</option>`).join('')}</select>
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
    if (data.success) { closeModal(); showToast('AB Test updated', 'success'); loadABTests(); } else { window.showAlertDialog ? showAlertDialog('Error', data.error, 'error') : showToast('Error', data.error, 'error'); }
  });
};

// ══════════════════════════════════════════════════════════════════════════════
// ASSETS
// ══════════════════════════════════════════════════════════════════════════════
async function loadAssets() {
  const el = document.getElementById('assetGrid');
  el.innerHTML = '<div style="text-align:center;padding:40px;color:#71717a;grid-column:1/-1">Loading...</div>';
  try {
    const res = await fetch(`/api/assets${bq}`);
    const data = await res.json();
    if (!data.success || !data.data.length) { el.innerHTML = '<div style="text-align:center;padding:40px;color:#71717a;grid-column:1/-1">No assets yet. Upload your first image.</div>'; return; }
    el.innerHTML = data.data.map(a => {
      // Always proxy via backend (server uses IAM credentials to get private S3 objects).
      // Direct S3 URL would require the bucket to be public.
      const thumbSrc = `/api/assets/img/${encodeURIComponent(a.filename)}`;
      const sizeStr = `${(a.size/1024).toFixed(1)} KB`;
      return `
      <div class="asset-card" style="background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-md); padding:10px; box-sizing:border-box">
        <img src="${thumbSrc}" alt="${a.originalName}" style="width:100%;height:120px;object-fit:cover;border-radius:6px;margin-bottom:8px">
        <p style="font-size:11px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0 0 2px 0">${a.originalName}</p>
        <p style="font-size:10px;color:#71717a;margin:0 0 8px 0">${sizeStr}</p>
        <div style="display:flex;gap:6px;justify-content:center">
          <button class="action-icon-btn" onclick="viewAsset('${a.filename}', '${a.url}', '${sizeStr}')" title="View"><i data-lucide="eye"></i></button>
          <button class="action-icon-btn" onclick="copyAssetUrl('${a.url}')" title="Copy URL"><i data-lucide="link"></i></button>
          <button class="action-icon-btn btn-delete" onclick="deleteAsset('${a._id}')" title="Delete"><i data-lucide="trash-2"></i></button>
        </div>
      </div>`;
    }).join('');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  } catch (err) { el.innerHTML = `<div style="color:#ef4444;grid-column:1/-1;padding:20px">Error: ${err.message}</div>`; }
}
window.loadAssets = loadAssets;

window.viewAsset = (filename, url, sizeStr) => {
  const proxyUrl = `/api/assets/img/${encodeURIComponent(filename)}`;
  openModal('Asset Preview', `
    <div style="display:flex;flex-direction:column;align-items:center;gap:14px">
      <img src="${proxyUrl}" style="max-width:100%;max-height:70vh;object-fit:contain;border-radius:8px;box-shadow:var(--shadow-sm);border:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;align-items:center;width:100%;font-size:12px;color:var(--text-muted)">
        <span>Size: ${sizeStr}</span>
        <button class="btn btn-secondary btn-sm" onclick="copyAssetUrl('${url}')" style="display:flex;align-items:center;gap:4px">
          <i data-lucide="copy" style="width:12px;height:12px"></i>Copy URL
        </button>
      </div>
    </div>
  `);
};

window.copyAssetUrl = (url) => { const absoluteUrl = url.startsWith('http') ? url : (window.location.origin + url); navigator.clipboard.writeText(absoluteUrl); showToast('Copied to clipboard', 'Asset URL copied.', 'success'); };
window.deleteAsset = async (id) => {
  const _asOk = await showConfirmDialog('Delete Asset', 'Are you sure you want to delete this asset?', true); if (!_asOk) return;
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
    if (data.success) { loadAssets(); showToast('Asset uploaded', 'success'); } else { window.showAlertDialog ? showAlertDialog('Upload Failed', data.error, 'error') : showToast('Error', data.error, 'error'); }
  };
  reader.readAsDataURL(file);
};

window.showGenerateImageModal = (callback) => {
  openModal('AI Image Generator', `
    <form id="aiImageGenForm" style="display:flex;flex-direction:column;gap:14px">
      <div class="property-row">
        <span class="property-label" style="font-weight:600;margin-bottom:6px;display:block">Image Prompt *</span>
        <textarea name="prompt" class="property-input" required rows="4" style="width:100%;box-sizing:border-box" placeholder="Describe the image you want to generate (e.g. 'A vibrant, modern banner with summer sale discount, professional lighting, 3d render')"></textarea>
      </div>
      <div class="property-row">
        <span class="property-label" style="font-weight:600;margin-bottom:6px;display:block">Dimensions</span>
        <select name="dimensions" class="property-select" style="width:100%">
          <option value="1024x1024" selected>Square (1024 x 1024)</option>
          <option value="1024x768">Landscape (1024 x 768)</option>
          <option value="1024x576">Widescreen 16:9 (1024 x 576)</option>
          <option value="768x1024">Portrait (768 x 1024)</option>
        </select>
      </div>
      <button type="submit" class="btn" id="aiImageGenSubmitBtn" style="background:var(--accent-purple);color:white;width:100%;margin-top:10px;display:flex;align-items:center;justify-content:center;gap:6px">
        <i data-lucide="sparkles" style="width:16px;height:16px"></i>Generate Image
      </button>
    </form>
  `);

  document.getElementById('aiImageGenForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const prompt = fd.get('prompt');
    const dims = fd.get('dimensions').split('x');
    const width = parseInt(dims[0]);
    const height = parseInt(dims[1]);

    const submitBtn = document.getElementById('aiImageGenSubmitBtn');
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = `Generating... <span class="spinner" style="display:inline-block;width:12px;height:12px;border:2px solid white;border-top:2px solid transparent;border-radius:50%;animation:spin 1s linear infinite;margin-left:6px;vertical-align:middle"></span>`;

    try {
      const res = await fetch(`/api/ai/generate-image${bq}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, width, height })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to generate image');

      closeModal();
      showToast('Image Generated', 'Your AI image has been generated and saved.', 'success');
      
      // If we are in the Assets view, reload the assets list
      const assetsSection = document.getElementById('assets');
      if (assetsSection && assetsSection.classList.contains('active')) {
        loadAssets();
      }

      // If a callback was provided, invoke it with the generated image URL
      if (typeof callback === 'function') {
        callback(data.data.url);
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      window.showAlertDialog ? showAlertDialog('Generation Failed', err.message, 'error') : showToast('Error', err.message, 'error');
    }
  });
};

// ══════════════════════════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════════════════════════
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
      set('provider', s.provider);
      const provEl = form.querySelector('[name="provider"]');
      if (provEl) provEl.dispatchEvent(new Event('change'));
      set('senderName', s.senderName); set('senderEmail', s.senderEmail);
      set('replyTo', s.replyTo); set('apiKey', s.apiKey); set('smtpHost', s.smtpHost);
      set('smtpPort', s.smtpPort); set('smtpUser', s.smtpUser);
    }
  } catch {}

  // Fetch S3 / Together / Gemini system status
  try {
    const sysRes = await fetch(`/api/settings/sys-status${bq}`);
    const sysData = await sysRes.json();
    if (sysData.success) {
      const updateBadge = (id, active) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = active ? 'Active' : 'Inactive';
        el.style.background = active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(113, 113, 122, 0.15)';
        el.style.color = active ? '#10b981' : '#71717a';
        el.style.border = active ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(113, 113, 122, 0.3)';
      };
      updateBadge('s3StatusBadge', sysData.s3);
      updateBadge('togetherStatusBadge', sysData.together);
      updateBadge('geminiStatusBadge', sysData.gemini);
    }
  } catch (err) {
    console.error('Failed to load system configs status:', err);
  }

  loadCustomFields();
}
window.loadSettings = loadSettings;

// ══════════════════════════════════════════════════════════════════════════════
// CUSTOM FIELDS
// ══════════════════════════════════════════════════════════════════════════════
let customFieldsData = [];
let customFieldsPage = 1;
let customFieldsPageSize = 10;

async function loadCustomFields() {
  const tbody = document.getElementById('customFieldsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#71717a;padding:20px">Loading...</td></tr>';
  try {
    const res = await fetch(`/api/customfields${bq}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    customFieldsData = data.data || [];

    // Populate the field-type cache used by customer filter operator dropdown
    window._custFieldTypes = {};
    customFieldsData.forEach(cf => {
      if (cf.name) window._custFieldTypes[cf.name] = { dataType: cf.dataType, label: cf.label };
    });

    // Reset to page 1 if the current page has no data
    if ((customFieldsPage - 1) * customFieldsPageSize >= customFieldsData.length) {
      customFieldsPage = 1;
    }

    renderCustomFieldsTable();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#ef4444;padding:20px">Error: ${err.message}</td></tr>`;
    const paginEl = document.getElementById('customFieldsPagination');
    if (paginEl) paginEl.style.display = 'none';
  }
}

function renderCustomFieldsTable() {
  const tbody = document.getElementById('customFieldsTableBody');
  if (!tbody) return;

  if (!customFieldsData.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#71717a;padding:20px">No custom fields defined yet.</td></tr>';
    const paginEl = document.getElementById('customFieldsPagination');
    if (paginEl) paginEl.style.display = 'none';
    return;
  }

  const startIndex = (customFieldsPage - 1) * customFieldsPageSize;
  const endIndex = startIndex + customFieldsPageSize;
  const pageData = customFieldsData.slice(startIndex, endIndex);

  tbody.innerHTML = pageData.map(f => `
    <tr>
      <td><span style="font-weight:600">${f.label}</span></td>
      <td><code style="font-size:11px;color:#a78bfa">${f.name || '—'}</code></td>
      <td><span class="attr-badge">${f.dataType}</span></td>
      <td style="color:#71717a;font-size:12px">${f.hint || '—'}</td>
      <td style="text-align:center">${f.isMandatory ? 'Yes' : 'No'}</td>
      <td><code>${f.defaultValue !== undefined ? JSON.stringify(f.defaultValue) : '—'}</code></td>
      <td><span style="color:#10b981;font-weight:500">Linked Segment</span></td>
      <td style="text-align:right;padding-right:20px">
        <button class="action-icon-btn btn-delete" title="Delete Field" onclick="deleteCustomField('${f._id}')">Delete</button>
      </td>
    </tr>
  `).join('');

  renderCustomFieldsPagination();
}

function renderCustomFieldsPagination() {
  const paginEl = document.getElementById('customFieldsPagination');
  if (!paginEl) return;

  const totalItems = customFieldsData.length;
  if (!totalItems) {
    paginEl.style.display = 'none';
    paginEl.innerHTML = '';
    return;
  }

  paginEl.style.display = 'flex';
  paginEl.style.justifyContent = 'space-between';
  paginEl.style.alignItems = 'center';

  const totalPages = Math.ceil(totalItems / customFieldsPageSize) || 1;
  const startIndex = (customFieldsPage - 1) * customFieldsPageSize;
  const endIndex = Math.min(startIndex + customFieldsPageSize, totalItems);

  const prevDisabled = customFieldsPage === 1 ? 'disabled' : '';
  const nextDisabled = customFieldsPage >= totalPages ? 'disabled' : '';

  paginEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;font-size:13px;color:var(--text-muted)">
      <span>Showing ${startIndex + 1}–${endIndex} of ${totalItems} fields</span>
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:12px">Per page:</span>
        <select class="property-select" style="padding:2px 6px;font-size:12px;height:auto;width:auto" onchange="changeCustomFieldsPageSize(this.value)">
          <option value="5" ${customFieldsPageSize === 5 ? 'selected' : ''}>5</option>
          <option value="10" ${customFieldsPageSize === 10 ? 'selected' : ''}>10</option>
          <option value="25" ${customFieldsPageSize === 25 ? 'selected' : ''}>25</option>
          <option value="50" ${customFieldsPageSize === 50 ? 'selected' : ''}>50</option>
          <option value="9999" ${customFieldsPageSize === 9999 ? 'selected' : ''}>All (${totalItems})</option>
        </select>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:6px">
      <button type="button" class="pag-nav-btn" ${prevDisabled} onclick="changeCustomFieldsPage(-1)">‹</button>
      <span style="font-size:13px;color:var(--text-muted)">${customFieldsPage} / ${totalPages}</span>
      <button type="button" class="pag-nav-btn" ${nextDisabled} onclick="changeCustomFieldsPage(1)">›</button>
    </div>
  `;
}

window.changeCustomFieldsPageSize = (val) => {
  customFieldsPageSize = Number(val);
  customFieldsPage = 1;
  renderCustomFieldsTable();
};

window.changeCustomFieldsPage = (dir) => {
  const totalPages = Math.ceil(customFieldsData.length / customFieldsPageSize) || 1;
  const newPage = customFieldsPage + dir;
  if (newPage >= 1 && newPage <= totalPages) {
    customFieldsPage = newPage;
    renderCustomFieldsTable();
  }
};

window.loadCustomFields = loadCustomFields;

window.showAddCustomFieldModal = () => {
  openDrawer('Add Custom Field', `
    <form id="addCustomFieldForm" class="drawer-form">
      <div class="drawer-body">
        
        <!-- Inline Error Message -->
        <div id="cfFormError" style="display:none;color:#ef4444;background:#fef2f2;border:1px solid #fee2e2;padding:10px;border-radius:6px;font-size:12px;font-weight:500"></div>

        <!-- Section: Field Details -->
        <div class="drawer-section">
          <h3 class="drawer-section-title">Field Details</h3>
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
        </div>

        <!-- Section: Configuration -->
        <div class="drawer-section">
          <h3 class="drawer-section-title">Configuration</h3>
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
        </div>

        <!-- Section: Automation -->
        <div class="drawer-section">
          <h3 class="drawer-section-title">Automation</h3>
          <div class="property-row-flex" style="background:rgba(139,92,246,0.06);padding:12px;border-radius:var(--radius-md);border:1px solid rgba(139,92,246,0.12)">
            <div>
              <span class="property-label" style="font-weight:600;color:var(--accent)">Automated Link to Segment</span>
              <p style="font-size:10px;color:var(--text-subtle);margin-top:2px">Auto-creates a dynamic Audience Segment matching this field.</p>
            </div>
            <input type="checkbox" name="autoCreateSegment" checked>
          </div>
        </div>

      </div>

      <div class="drawer-footer">
        <button type="button" class="btn btn-secondary" onclick="closeDrawer()">Cancel</button>
        <button type="submit" class="btn">Add Field</button>
      </div>
    </form>
  `);

  document.getElementById('addCustomFieldForm').addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const label = (fd.get('label') || '').trim();
    const systemName = (fd.get('name') || '').trim();
    
    // Clean name: alphanumeric lowercase (same as backend)
    const cleanName = systemName || label.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    // Check duplicate case-insensitively against custom fields and system fields
    const systemFields = [
      { label: 'Name', name: 'name' },
      { label: 'Email', name: 'email' },
      { label: 'Phone Number', name: 'phoneNo' },
      { label: 'Inbox Status', name: 'inboxStatus' },
      { label: 'Allow Broadcast', name: 'allowBroadcast' },
      { label: 'Lead Source', name: 'leadSource' },
      { label: 'Email Status', name: 'emailStatus' }
    ];

    const isDuplicate = customFieldsData.some(f => 
      f.label.trim().toLowerCase() === label.toLowerCase() ||
      (f.name || '').trim().toLowerCase() === cleanName.toLowerCase()
    ) || systemFields.some(f => 
      f.label.trim().toLowerCase() === label.toLowerCase() ||
      (f.name || '').trim().toLowerCase() === cleanName.toLowerCase()
    );

    const errDiv = document.getElementById('cfFormError');
    if (isDuplicate) {
      if (errDiv) {
        errDiv.textContent = 'A field with this name already exists. Duplicate field names are not allowed.';
        errDiv.style.display = 'block';
        errDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    } else {
      if (errDiv) errDiv.style.display = 'none';
    }

    const payload = {
      label,
      name: systemName,
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
      closeDrawer();
      customFieldsPage = 1;
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
          toast.textContent = 'Custom Field Created!';
          toast.className = 'builder-toast toast-success';
          toast.style.display = 'block';
          setTimeout(() => { toast.style.display = 'none'; }, 2500);
        }
      }
    } else {
      showToast('Error', data.error, 'error');
    }
  });
};

window.deleteCustomField = async (id) => {
  const _cfOk = await showConfirmDialog('Delete Custom Field', 'Are you sure? All linked dynamic segments will be cleaned up.', true); if (!_cfOk) return;
  try {
    const res = await fetch(`/api/customfields/${id}${bq}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      loadCustomFields();
      showToast('Custom Field Deleted', 'Custom field has been deleted.', 'info');
    }
  } catch (err) {
    showToast('Error', err.message, 'error');
  }
};

document.getElementById('settingsForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = Object.fromEntries(fd.entries());
  const res = await fetch(`/api/settings${bq}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
  const data = await res.json();
  if (data.success) showToast('Settings Saved', 'Organization email settings saved successfully.', 'success'); else showToast('Error', data.error, 'error');
});

window.testSend = async () => {
  const to = await showPromptDialog('Send Test Email', 'Enter the recipient email address:');
  if (!to) return;
  const res = await fetch(`/api/settings/test-send${bq}`, { method: 'POST', headers, body: JSON.stringify({ to }) });
  const data = await res.json();
  if (data.success) { showToast('Test Sent', `Test email sent to ${to}`, 'success'); } else { window.showAlertDialog ? showAlertDialog('Error', data.error, 'error') : showToast('Error', data.error, 'error'); }
};

window.saveGeminiKey = () => {
  const key = document.getElementById('geminiKeyInput')?.value;
  if (!key) return;
  window.showAlertDialog ? showAlertDialog('Gemini API Key Added', 'Add GEMINI_API_KEY=' + key + ' to your .env file and restart the server.', 'info') : showToast('Saved', 'Remember to add GEMINI_API_KEY to your .env file and restart the server.', 'info');
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

// Initialise customer filter operators so #custAttrOp shows correct options on first paint
window.addEventListener('DOMContentLoaded', () => {
  if (typeof window.updateCustomerFilterOperators === 'function') {
    window.updateCustomerFilterOperators();
  }
  // Also wire custAttrKey so changing the field updates operators AND reloads
  const attrKeyEl = document.getElementById('custAttrKey');
  if (attrKeyEl) {
    attrKeyEl.addEventListener('change', () => {
      window.updateCustomerFilterOperators?.();
      // Only auto-reload if a value is already entered
      const attrVal = document.getElementById('custAttrVal');
      if (attrVal?.value?.trim()) loadCustomers(1);
    });
  }
});

