import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  XCircle,
  Upload,
  Plus,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  CheckSquare,
  X,
  HelpCircle,
} from 'lucide-react';
import { Customer } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ui/ConfirmModal';

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  isDestructive?: boolean;
}

export const CustomersPage: React.FC = () => {
  const { showToast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [broadcastFilter, setBroadcastFilter] = useState('');
  const [attrKey, setAttrKey] = useState('');
  const [attrVal, setAttrVal] = useState('');
  const [attrOp, setAttrOp] = useState('eq');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  // Add Form State
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addLeadSource, setAddLeadSource] = useState('');
  const [addAllowBroadcast, setAddAllowBroadcast] = useState(true);
  const [attrCity, setAttrCity] = useState('');
  const [attrPlan, setAttrPlan] = useState('');
  const [attrLeadScore, setAttrLeadScore] = useState('');
  const [attrCompany, setAttrCompany] = useState('');

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLeadSource, setEditLeadSource] = useState('');
  const [editEmailStatus, setEditEmailStatus] = useState('active');
  const [editAllowBroadcast, setEditAllowBroadcast] = useState(true);
  const [editAttrCity, setEditAttrCity] = useState('');
  const [editAttrPlan, setEditAttrPlan] = useState('');
  const [editAttrLeadScore, setEditAttrLeadScore] = useState('');
  const [editAttrCompany, setEditAttrCompany] = useState('');

  const [csvFile, setCsvFile] = useState<File | null>(null);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      let query = `/api/customers?page=${page}&limit=${limit}`;
      if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;
      if (statusFilter) query += `&emailStatus=${statusFilter}`;
      if (broadcastFilter) query += `&allowBroadcast=${broadcastFilter}`;
      if (attrKey && attrVal) query += `&attrKey=${attrKey}&attrVal=${encodeURIComponent(attrVal)}&attrOp=${attrOp}`;

      const res = await api.get(query);
      const rawData = res.data || [];
      const uniqueData = Array.from(
        new Map(rawData.map((item: any) => [item._id || item.id, item])).values()
      );
      setCustomers(uniqueData as Customer[]);
      setTotal(res.pagination?.total || 0);
    } catch (err: any) {
      showToast('Error loading customers', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [page, statusFilter, broadcastFilter]);

  const handleFilterClick = () => {
    setPage(1);
    loadCustomers();
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setBroadcastFilter('');
    setAttrKey('');
    setAttrVal('');
    setAttrOp('eq');
    setPage(1);
    loadCustomers();
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(customers.map((c) => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map((id) => api.delete(`/api/customers/${id}`)));
      showToast('Deleted', `${selectedIds.length} customer(s) deleted`, 'success');
      setSelectedIds([]);
      loadCustomers();
    } catch (err: any) {
      showToast('Error deleting customers', err.message, 'error');
    }
  };

  const handleDeleteOne = async (id: string) => {
    try {
      await api.delete(`/api/customers/${id}`);
      showToast('Customer Deleted', 'The customer has been removed.', 'success');
      loadCustomers();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleOpenAddModal = () => {
    setAddName('');
    setAddEmail('');
    setAddPhone('');
    setAddLeadSource('');
    setAddAllowBroadcast(true);
    setAttrCity('');
    setAttrPlan('');
    setAttrLeadScore('');
    setAttrCompany('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setEditName(c.name || '');
    setEditPhone(c.phoneNo || '');
    setEditEmail(c.email || '');
    setEditLeadSource((c as any).leadSource || '');
    setEditEmailStatus(c.emailStatus || 'active');
    setEditAllowBroadcast(c.allowBroadcast ?? true);
    const city = c.attributes?.find((a: any) => a.k === 'city')?.v_str || '';
    const plan = c.attributes?.find((a: any) => a.k === 'plan')?.v_str || '';
    const leadScore = c.attributes?.find((a: any) => a.k === 'lead_score')?.v_num ?? '';
    const company = c.attributes?.find((a: any) => a.k === 'company')?.v_str || '';
    setEditAttrCity(city);
    setEditAttrPlan(plan);
    setEditAttrLeadScore(leadScore !== '' ? String(leadScore) : '');
    setEditAttrCompany(company);
  };

  const handleSaveEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    const attributes: any[] = [];
    if (editAttrCity) attributes.push({ k: 'city', v_str: editAttrCity });
    if (editAttrPlan) attributes.push({ k: 'plan', v_str: editAttrPlan });
    if (editAttrLeadScore) attributes.push({ k: 'lead_score', v_num: Number(editAttrLeadScore) });
    if (editAttrCompany) attributes.push({ k: 'company', v_str: editAttrCompany });

    try {
      await api.patch(`/api/customers/${editingCustomer._id}`, {
        name: editName,
        phoneNo: editPhone,
        email: editEmail,
        leadSource: editLeadSource,
        emailStatus: editEmailStatus,
        allowBroadcast: editAllowBroadcast,
        attributes,
      });
      showToast('Customer Updated', 'Changes saved successfully.', 'success');
      setEditingCustomer(null);
      loadCustomers();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to save changes', 'error');
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const attributes: any[] = [];
    if (attrCity) attributes.push({ k: 'city', v_str: attrCity });
    if (attrPlan) attributes.push({ k: 'plan', v_str: attrPlan });
    if (attrLeadScore) attributes.push({ k: 'lead_score', v_num: Number(attrLeadScore) });
    if (attrCompany) attributes.push({ k: 'company', v_str: attrCompany });

    try {
      await api.post('/api/customers', {
        name: addName,
        email: addEmail,
        phoneNo: addPhone,
        leadSource: addLeadSource,
        allowBroadcast: addAllowBroadcast,
        attributes,
      });
      showToast('Customer Added', 'New customer created successfully.', 'success');
      setShowAddModal(false);
      loadCustomers();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to add customer', 'error');
    }
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      showToast('File Required', 'Please select a CSV file to import', 'warning');
      return;
    }

    if (!csvFile.name.toLowerCase().endsWith('.csv')) {
      showToast('Invalid File Format', 'Please select a valid .csv file', 'error');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const res = await api.postFormData('/api/customers/import', formData);
      const count = res.count || res.inserted || 0;
      showToast('Import Successful', `Successfully imported ${count} customer(s)`, 'success');
      setShowImportModal(false);
      setCsvFile(null);
      setPage(1);
      await loadCustomers();
    } catch (err: any) {
      showToast('Import Error', err.message || 'Failed to import CSV file', 'error');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;
  const hasFilter = !!(search || statusFilter || broadcastFilter || (attrKey && attrVal));

  return (
    <section id="customers" className="page active">
      <div className="page-header">
        <div>
          <p className="breadcrumb">
            <Users style={{ width: 12, height: 12 }} /> Customers
          </p>
          <h1 className="page-title">Customers</h1>
          <p className="page-description">Manage contacts, custom attributes, and tags.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>
            <Upload style={{ width: 14, height: 14 }} /> Import CSV / Excel
          </button>
          <button className="btn" onClick={handleOpenAddModal}>
            <Plus style={{ width: 14, height: 14 }} /> Add Customer
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="toolbar">
        <div className="search-wrap" style={{ maxWidth: 260 }}>
          <Search style={{ width: 14, height: 14 }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilterClick()}
          />
        </div>

        <select
          className="property-select"
          style={{ width: 130 }}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="unsubscribed">Unsubscribed</option>
          <option value="bounced">Bounced</option>
        </select>

        <select
          className="property-select"
          style={{ width: 150 }}
          value={broadcastFilter}
          onChange={(e) => {
            setBroadcastFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Broadcast</option>
          <option value="true">Allow Broadcast</option>
          <option value="false">No Broadcast</option>
        </select>

        <select
          className="property-select"
          style={{ width: 120 }}
          value={attrKey}
          onChange={(e) => {
            const key = e.target.value;
            setAttrKey(key);
            if (key === 'lead_score') {
              if (attrOp === 'contains') setAttrOp('eq');
            } else {
              if (attrOp === 'gt' || attrOp === 'lt') setAttrOp('eq');
            }
          }}
        >
          <option value="">Attr Filter…</option>
          <option value="city">city</option>
          <option value="plan">plan</option>
          <option value="lead_score">lead_score</option>
          <option value="industry">industry</option>
        </select>

        <input
          type="text"
          placeholder="Value…"
          className="property-input"
          style={{ width: 90 }}
          value={attrVal}
          onChange={(e) => setAttrVal(e.target.value)}
        />

        <select
          className="property-select"
          style={{ width: 100 }}
          value={attrOp}
          onChange={(e) => setAttrOp(e.target.value)}
        >
          <option value="eq">=</option>
          {attrKey === 'lead_score' ? (
            <>
              <option value="gt">&gt;</option>
              <option value="lt">&lt;</option>
            </>
          ) : (
            <option value="contains">contains</option>
          )}
        </select>

        <button className="btn btn-secondary" onClick={handleFilterClick}>
          <Filter style={{ width: 14, height: 14 }} /> Filter
        </button>

        {hasFilter && (
          <button
            className="btn btn-ghost"
            onClick={clearFilters}
            title="Clear all filters"
            style={{ color: 'var(--error)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <XCircle style={{ width: 14, height: 14 }} /> Clear Filters
          </button>
        )}

        <div className="toolbar-right">
          <span id="customerCountBadge" style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            Total: {total}
          </span>
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => setViewMode('card')}
              title="Card View"
            >
              <LayoutGrid style={{ width: 13, height: 13 }} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List style={{ width: 13, height: 13 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bulk-action-bar">
          <div className="bulk-action-info">
            <CheckSquare style={{ width: 15, height: 15, color: 'var(--primary)' }} />
            <span>{selectedIds.length} customer(s) selected</span>
          </div>
          <div className="bulk-action-btns">
            <button
              className="btn"
              style={{ background: 'var(--error)', color: '#fff', borderColor: 'var(--error)' }}
              onClick={() => {
                setConfirmDialog({
                  isOpen: true,
                  title: 'Delete Customer',
                  message: `Are you sure you want to permanently delete ${selectedIds.length} selected customer(s)? This action cannot be undone.`,
                  isDestructive: true,
                  onConfirm: handleDeleteSelected,
                });
              }}
            >
              <Trash2 style={{ width: 14, height: 14 }} /> Delete Selected
            </button>
            <button className="btn btn-secondary" onClick={() => setSelectedIds([])}>
              <X style={{ width: 14, height: 14 }} /> Clear
            </button>
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="table-wrap" id="customersTableWrap" style={{ overflowX: 'auto', width: '100%' }}>
          <div className="table-wrap-inner" style={{ width: '100%' }}>
            <table className="data-table" id="customersTable" style={{ width: '100%', tableLayout: 'auto' }}>
              <thead>
                <tr>
                  <th className="cust-th-check" style={{ width: 36, paddingLeft: 10 }}>
                    <input
                      type="checkbox"
                      className="cust-checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === customers.length}
                      onChange={handleSelectAll}
                      title="Select all on this page"
                    />
                  </th>
                  <th style={{ width: '14%' }}>Name</th>
                  <th style={{ width: '12%' }}>Phone</th>
                  <th style={{ width: '18%' }}>Email</th>
                  <th style={{ width: '9%' }}>City</th>
                  <th style={{ width: '7%' }}>Plan</th>
                  <th style={{ width: '8%', textAlign: 'center' }}>Lead Score</th>
                  <th style={{ width: '11%' }}>Company</th>
                  <th style={{ width: '10%' }}>Industry</th>
                  <th style={{ width: '11%', textAlign: 'right', paddingRight: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="cust-td-empty">
                      Loading…
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="cust-td-empty">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  customers.map((c, idx) => {
                    const name = (c.name || '').trim() || 'Unknown';
                    const phone = (c.phoneNo || '').trim();
                    const email = (c.email || '').trim().toLowerCase();

                    const city = c.attributes?.find((a: any) => a.k === 'city')?.v_str || '—';
                    const plan = c.attributes?.find((a: any) => a.k === 'plan')?.v_str || '—';
                    const leadScore = c.attributes?.find((a: any) => a.k === 'lead_score')?.v_num ?? '—';
                    const company = c.attributes?.find((a: any) => a.k === 'company')?.v_str || '—';
                    const industry = c.attributes?.find((a: any) => a.k === 'industry')?.v_str || '—';

                    return (
                      <tr key={c._id ? `${c._id}-${idx}` : `cust-${idx}`} className={selectedIds.includes(c._id) ? 'row-selected' : ''}>
                        <td onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="cust-checkbox"
                            checked={selectedIds.includes(c._id)}
                            onChange={() => toggleSelectOne(c._id)}
                          />
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--text)' }}>{name}</span>
                        </td>
                        <td>
                          <span className="cust-phone">
                            {phone && phone !== '0000000000' ? (
                              phone
                            ) : (
                              <span style={{ color: 'var(--text-subtle)' }}>No phone</span>
                            )}
                          </span>
                        </td>
                        <td>
                          {email ? (
                            <span className="cust-email">{email}</span>
                          ) : (
                            <span style={{ color: 'var(--text-subtle)', fontStyle: 'italic', fontSize: 12 }}>
                              No email on file
                            </span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{city}</td>
                        <td>
                          {plan !== '—' ? (
                            <span className="attr-badge">{plan}</span>
                          ) : (
                            <span style={{ color: 'var(--text-subtle)' }}>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {leadScore !== '—' ? (
                            <span className="lead-score-pill">{leadScore}</span>
                          ) : (
                            <span style={{ color: 'var(--text-subtle)' }}>—</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{company}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{industry}</td>
                        <td style={{ textAlign: 'right', paddingRight: 20 }}>
                          <div className="row-actions-wrap" style={{ display: 'inline-flex', gap: 6 }}>
                            <button
                              className="action-icon-btn"
                              title="View details"
                              onClick={() => setViewingCustomer(c)}
                            >
                              <Eye style={{ width: 14, height: 14 }} />
                            </button>
                            <button
                              className="action-icon-btn"
                              title="Edit customer"
                              onClick={() => handleOpenEditModal(c)}
                            >
                              <Edit3 style={{ width: 14, height: 14 }} />
                            </button>
                            <button
                              className="action-icon-btn btn-delete"
                              title="Delete customer"
                              onClick={() => {
                                setConfirmDialog({
                                  isOpen: true,
                                  title: 'Delete Customer',
                                  message: 'Are you sure you want to permanently delete this customer? This action cannot be undone.',
                                  isDestructive: true,
                                  onConfirm: () => handleDeleteOne(c._id),
                                });
                              }}
                            >
                              <Trash2 style={{ width: 14, height: 14 }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card View */
        <div className="cust-card-grid" style={{ marginTop: 16 }}>
          {customers.length === 0 ? (
            <div className="dashed-card" style={{ gridColumn: '1 / -1' }}>
              <div className="dashed-icon">
                <Users style={{ width: 20, height: 20 }} />
              </div>
              <p className="dashed-title">No customers found</p>
            </div>
          ) : (
            customers.map((c, idx) => {
              const name = c.name || 'Unknown';
              const plan = c.attributes?.find((a: any) => a.k === 'plan')?.v_str || '—';
              const leadScore = c.attributes?.find((a: any) => a.k === 'lead_score')?.v_num ?? '—';
              const city = c.attributes?.find((a: any) => a.k === 'city')?.v_str || '—';
              const statusColorMap: Record<string, string> = { active: '#10b981', unsubscribed: '#ef4444', bounced: '#f59e0b', complained: '#f97316' };
              const statusColor = statusColorMap[c.emailStatus] || '#71717a';
              return (
                <div key={c._id ? `${c._id}-${idx}` : `cust-${idx}`} className="cust-card">
                  <div className="cust-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span className="cust-card-name" style={{ fontWeight: 700, fontSize: 14 }}>{name}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="action-icon-btn"
                        title="View details"
                        onClick={() => setViewingCustomer(c)}
                      >
                        <Eye style={{ width: 13, height: 13 }} />
                      </button>
                      <button
                        className="action-icon-btn"
                        title="Edit customer"
                        onClick={() => handleOpenEditModal(c)}
                      >
                        <Edit3 style={{ width: 13, height: 13 }} />
                      </button>
                      <button
                        className="action-icon-btn btn-delete"
                        title="Delete customer"
                        onClick={() => {
                          setConfirmDialog({
                            isOpen: true,
                            title: 'Delete Customer',
                            message: 'Are you sure you want to permanently delete this customer? This action cannot be undone.',
                            isDestructive: true,
                            onConfirm: () => handleDeleteOne(c._id),
                          });
                        }}
                      >
                        <Trash2 style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                  </div>
                  <div className="cust-card-meta" style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                    <div>{c.email || 'No email on file'}</div>
                    <div>{c.phoneNo || 'No phone'}</div>
                  </div>
                  <div className="cust-card-badges" style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    <span className="status-badge" style={{ color: statusColor, background: `${statusColor}18`, padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                      {c.emailStatus}
                    </span>
                    <span className="status-badge" style={{ color: c.allowBroadcast ? '#10b981' : '#ef4444', background: c.allowBroadcast ? '#10b98118' : '#ef444418', padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                      {c.allowBroadcast ? 'Broadcast Allowed' : 'No Broadcast'}
                    </span>
                  </div>
                  <div className="cust-card-attrs" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 11 }}>
                    {plan !== '—' && <span className="attr-badge" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: 4 }}>Plan: {plan}</span>}
                    {leadScore !== '—' && <span className="attr-badge" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: 4 }}>Score: {leadScore}</span>}
                    {city !== '—' && <span className="attr-badge" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: 4 }}>City: {city}</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="table-pagination" style={{ marginTop: 16 }}>
        <div className="pagination-left">Total Records ({total})</div>
        <div className="pagination-right">
          <button
            className="pag-nav-btn"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            title="Previous Page"
          >
            <ChevronLeft style={{ width: 14, height: 14 }} />
          </button>
          <input
            type="number"
            className="pag-input"
            value={page}
            min={1}
            max={totalPages}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 1 && val <= totalPages) setPage(val);
            }}
          />
          <span className="pag-total">/ {totalPages}</span>
          <button
            className="pag-nav-btn"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            title="Next Page"
          >
            <ChevronRight style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>

      {/* View Customer Details Modal */}
      {viewingCustomer && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 520, maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h2 className="modal-title" style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Customer — {viewingCustomer.name}</h2>
              <button type="button" className="modal-close" onClick={() => setViewingCustomer(null)}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid-4" style={{ gap: 12 }}>
                <div className="property-row">
                  <span className="property-label">Name</span>
                  <p style={{ margin: '4px 0 0 0', fontWeight: 600 }}>{viewingCustomer.name}</p>
                </div>
                <div className="property-row">
                  <span className="property-label">Email</span>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>{viewingCustomer.email || '—'}</p>
                </div>
                <div className="property-row">
                  <span className="property-label">Phone</span>
                  <p style={{ margin: '4px 0 0 0' }}>{viewingCustomer.phoneNo || '—'}</p>
                </div>
                <div className="property-row">
                  <span className="property-label">Status</span>
                  <p style={{ margin: '4px 0 0 0', textTransform: 'capitalize', fontWeight: 600, color: viewingCustomer.emailStatus === 'active' ? '#10b981' : '#ef4444' }}>
                    {viewingCustomer.emailStatus}
                  </p>
                </div>
              </div>
              <hr style={{ borderColor: 'var(--border)', margin: '4px 0' }} />
              <div>
                <p className="property-label" style={{ marginBottom: 8, fontWeight: 700 }}>Custom Attributes</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {viewingCustomer.attributes && viewingCustomer.attributes.length > 0 ? (
                    viewingCustomer.attributes.map((a: any, idx: number) => (
                      <div key={a.k ? `${a.k}-${idx}` : `attr-${idx}`} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 6, fontSize: 12 }}>
                        <b>{a.k}</b>: {String(a.v_str ?? a.v_num ?? a.v_date ?? '—')}
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No custom attributes</span>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn" onClick={() => setViewingCustomer(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 540, maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h2 className="modal-title" style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Add Customer</h2>
              <button type="button" className="modal-close" onClick={() => setShowAddModal(false)}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', margin: 0 }}>
              <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="property-row">
                  <span className="property-label">Name *</span>
                  <input
                    type="text"
                    className="property-input"
                    required
                    placeholder="Full name"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                  />
                </div>
                <div className="property-row">
                  <span className="property-label">Phone *</span>
                  <input
                    type="text"
                    className="property-input"
                    required
                    placeholder="+91-9876543210"
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                  />
                </div>
                <div className="property-row">
                  <span className="property-label">Email</span>
                  <input
                    type="email"
                    className="property-input"
                    placeholder="email@example.com"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                  />
                </div>
                <div className="property-row">
                  <span className="property-label">Lead Source</span>
                  <input
                    type="text"
                    className="property-input"
                    placeholder="website, referral..."
                    value={addLeadSource}
                    onChange={(e) => setAddLeadSource(e.target.value)}
                  />
                </div>
                <div className="property-row-flex">
                  <span className="property-label">Allow Broadcast</span>
                  <input
                    type="checkbox"
                    checked={addAllowBroadcast}
                    onChange={(e) => setAddAllowBroadcast(e.target.checked)}
                  />
                </div>
                <hr style={{ borderColor: 'var(--border)', margin: '4px 0' }} />
                <p className="property-label" style={{ margin: 0, fontWeight: 700 }}>Custom Attributes</p>
                <div className="grid-4" style={{ gap: 8 }}>
                  <div className="property-row">
                    <span className="property-label">City</span>
                    <input
                      type="text"
                      className="property-input"
                      placeholder="Mumbai"
                      value={attrCity}
                      onChange={(e) => setAttrCity(e.target.value)}
                    />
                  </div>
                  <div className="property-row">
                    <span className="property-label">Plan</span>
                    <input
                      type="text"
                      className="property-input"
                      placeholder="pro"
                      value={attrPlan}
                      onChange={(e) => setAttrPlan(e.target.value)}
                    />
                  </div>
                  <div className="property-row">
                    <span className="property-label">Lead Score</span>
                    <input
                      type="number"
                      className="property-input"
                      placeholder="75"
                      value={attrLeadScore}
                      onChange={(e) => setAttrLeadScore(e.target.value)}
                    />
                  </div>
                  <div className="property-row">
                    <span className="property-label">Company</span>
                    <input
                      type="text"
                      className="property-input"
                      placeholder="Acme Ltd"
                      value={attrCompany}
                      onChange={(e) => setAttrCompany(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn" style={{ minWidth: 120 }}>
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 540, maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h2 className="modal-title" style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Edit Customer</h2>
              <button className="modal-close" onClick={() => setEditingCustomer(null)}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <form onSubmit={handleSaveEditCustomer} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', margin: 0 }}>
              <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="property-row">
                  <span className="property-label">Name *</span>
                  <input
                    type="text"
                    className="property-input"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="property-row">
                  <span className="property-label">Phone *</span>
                  <input
                    type="text"
                    className="property-input"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                  />
                </div>
                <div className="property-row">
                  <span className="property-label">Email</span>
                  <input
                    type="email"
                    className="property-input"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                  />
                </div>
                <div className="property-row">
                  <span className="property-label">Lead Source</span>
                  <input
                    type="text"
                    className="property-input"
                    value={editLeadSource}
                    onChange={(e) => setEditLeadSource(e.target.value)}
                  />
                </div>
                <div className="property-row">
                  <span className="property-label">Email Status</span>
                  <select
                    className="property-select"
                    value={editEmailStatus}
                    onChange={(e) => setEditEmailStatus(e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="unsubscribed">Unsubscribed</option>
                    <option value="bounced">Bounced</option>
                    <option value="complained">Complained</option>
                  </select>
                </div>
                <div className="property-row-flex">
                  <span className="property-label">Allow Broadcast</span>
                  <input
                    type="checkbox"
                    checked={editAllowBroadcast}
                    onChange={(e) => setEditAllowBroadcast(e.target.checked)}
                  />
                </div>
                <hr style={{ borderColor: 'var(--border)', margin: '4px 0' }} />
                <p className="property-label" style={{ margin: 0, fontWeight: 700 }}>Custom Attributes</p>
                <div className="grid-4" style={{ gap: 8 }}>
                  <div className="property-row">
                    <span className="property-label">City</span>
                    <input
                      type="text"
                      className="property-input"
                      placeholder="Mumbai"
                      value={editAttrCity}
                      onChange={(e) => setEditAttrCity(e.target.value)}
                    />
                  </div>
                  <div className="property-row">
                    <span className="property-label">Plan</span>
                    <input
                      type="text"
                      className="property-input"
                      placeholder="pro"
                      value={editAttrPlan}
                      onChange={(e) => setEditAttrPlan(e.target.value)}
                    />
                  </div>
                  <div className="property-row">
                    <span className="property-label">Lead Score</span>
                    <input
                      type="number"
                      className="property-input"
                      placeholder="75"
                      value={editAttrLeadScore}
                      onChange={(e) => setEditAttrLeadScore(e.target.value)}
                    />
                  </div>
                  <div className="property-row">
                    <span className="property-label">Company</span>
                    <input
                      type="text"
                      className="property-input"
                      placeholder="Acme Ltd"
                      value={editAttrCompany}
                      onChange={(e) => setEditAttrCompany(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingCustomer(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn" style={{ minWidth: 120 }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Upload style={{ width: 18, height: 18, color: 'var(--primary)' }} />
                Import Customers (.csv only)
              </h2>
              <button className="modal-close" onClick={() => setShowImportModal(false)}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <form onSubmit={handleImportCsv}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                  Upload a <strong>.csv</strong> file containing customer contacts. Column headers like Name, Phone, Email, City, Plan, Company, Lead Score, etc. will be automatically mapped.
                </p>

                <div
                  style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 8,
                    padding: '24px 16px',
                    textAlign: 'center',
                    background: 'var(--bg-elevated)',
                    cursor: 'pointer',
                  }}
                  onClick={() => document.getElementById('customer-csv-import-file-input')?.click()}
                >
                  <Upload style={{ width: 32, height: 32, color: 'var(--primary)', marginBottom: 8 }} />
                  <p style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                    {csvFile ? csvFile.name : 'Click to select CSV file'}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
                    {csvFile ? `${(csvFile.size / 1024).toFixed(1)} KB` : 'Accepts .csv files only'}
                  </p>
                  <input
                    id="customer-csv-import-file-input"
                    type="file"
                    accept=".csv"
                    style={{ display: 'none' }}
                    required
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (!file.name.toLowerCase().endsWith('.csv')) {
                          showToast('Invalid File Format', 'Only .csv files are supported', 'error');
                          setCsvFile(null);
                        } else {
                          setCsvFile(file);
                        }
                      }
                    }}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowImportModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={!csvFile || loading}>
                  {loading ? 'Importing...' : 'Upload & Import Customers'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Professional Confirmation Modal */}
      {confirmDialog && (
        <ConfirmModal
          isOpen={true}
          title={confirmDialog.title}
          message={confirmDialog.message}
          isDestructive={confirmDialog.isDestructive}
          onConfirm={confirmDialog.onConfirm}
          onClose={() => setConfirmDialog(null)}
        />
      )}
    </section>
  );
};
