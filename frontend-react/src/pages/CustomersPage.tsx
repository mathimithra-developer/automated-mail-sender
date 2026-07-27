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
  ArrowLeft,
  Mail,
  Phone,
  ArrowRight,
  SlidersHorizontal,
  Building,
  MapPin,
  Award,
  Clock,
  Send,
  Tag,
  MessageSquare,
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
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [broadcastFilter, setBroadcastFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [leadScoreFilter, setLeadScoreFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [total, setTotal] = useState(0);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals / Drawers
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
  const [addEmailStatus, setAddEmailStatus] = useState('active');
  const [addSmsStatus, setAddSmsStatus] = useState('opted_in');
  const [attrCity, setAttrCity] = useState('');
  const [attrPlan, setAttrPlan] = useState('free');
  const [attrLeadScore, setAttrLeadScore] = useState(50);
  const [attrCompany, setAttrCompany] = useState('');
  const [addNotes, setAddNotes] = useState('');

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLeadSource, setEditLeadSource] = useState('');
  const [editEmailStatus, setEditEmailStatus] = useState('active');
  const [editSmsStatus, setEditSmsStatus] = useState('opted_in');
  const [editAllowBroadcast, setEditAllowBroadcast] = useState(true);
  const [editAttrCity, setEditAttrCity] = useState('');
  const [editAttrPlan, setEditAttrPlan] = useState('');
  const [editAttrLeadScore, setEditAttrLeadScore] = useState(50);
  const [editAttrCompany, setEditAttrCompany] = useState('');

  const [csvFile, setCsvFile] = useState<File | null>(null);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      let query = `/api/customers?page=${page}&limit=${limit}`;
      if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;
      if (statusFilter) query += `&emailStatus=${statusFilter}`;
      if (broadcastFilter) query += `&allowBroadcast=${broadcastFilter}`;
      if (planFilter) query += `&attrKey=plan&attrVal=${encodeURIComponent(planFilter)}&attrOp=eq`;
      if (cityFilter) query += `&attrKey=city&attrVal=${encodeURIComponent(cityFilter)}&attrOp=contains`;
      if (companyFilter) query += `&attrKey=company&attrVal=${encodeURIComponent(companyFilter)}&attrOp=contains`;

      const res = await api.get(query);
      const rawData = res.data || [];
      const uniqueData = Array.from(
        new Map(rawData.map((item: any) => [item._id || item.id, item])).values()
      );

      let sortedData = uniqueData as Customer[];
      if (sortBy === 'oldest') {
        sortedData = [...sortedData].reverse();
      } else if (sortBy === 'name') {
        sortedData = [...sortedData].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      }

      setCustomers(sortedData);
      setTotal(res.pagination?.total || 0);
    } catch (err: any) {
      showToast('Error loading customers', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Real-time debounced live search (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, page, limit, statusFilter, broadcastFilter, planFilter, cityFilter, companyFilter, leadScoreFilter, sortBy]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setBroadcastFilter('');
    setPlanFilter('');
    setCityFilter('');
    setCompanyFilter('');
    setLeadScoreFilter('');
    setSortBy('newest');
    setPage(1);
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
    setAddEmailStatus('active');
    setAddSmsStatus('opted_in');
    setAttrCity('');
    setAttrPlan('free');
    setAttrLeadScore(50);
    setAttrCompany('');
    setAddNotes('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setEditName(c.name || '');
    setEditPhone(c.phoneNo || '');
    setEditEmail(c.email || '');
    setEditLeadSource((c as any).leadSource || '');
    setEditEmailStatus(c.emailStatus || 'active');
    setEditSmsStatus('opted_in');
    setEditAllowBroadcast(c.allowBroadcast ?? true);
    const city = c.attributes?.find((a: any) => a.k === 'city')?.v_str || '';
    const plan = c.attributes?.find((a: any) => a.k === 'plan')?.v_str || '';
    const leadScore = c.attributes?.find((a: any) => a.k === 'lead_score')?.v_num ?? 50;
    const company = c.attributes?.find((a: any) => a.k === 'company')?.v_str || '';
    setEditAttrCity(city);
    setEditAttrPlan(plan);
    setEditAttrLeadScore(Number(leadScore));
    setEditAttrCompany(company);
  };

  const handleSaveEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    const attributes: any[] = [];
    if (editAttrCity) attributes.push({ k: 'city', v_str: editAttrCity });
    if (editAttrPlan) attributes.push({ k: 'plan', v_str: editAttrPlan });
    attributes.push({ k: 'lead_score', v_num: Number(editAttrLeadScore) });
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
    attributes.push({ k: 'lead_score', v_num: Number(attrLeadScore) });
    if (attrCompany) attributes.push({ k: 'company', v_str: attrCompany });
    if (addNotes) attributes.push({ k: 'notes', v_str: addNotes });

    try {
      await api.post('/api/customers', {
        name: addName,
        email: addEmail,
        phoneNo: addPhone,
        leadSource: addLeadSource,
        emailStatus: addEmailStatus,
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
  const hasActiveFilter = !!(statusFilter || broadcastFilter || planFilter || cityFilter || companyFilter || leadScoreFilter);

  const avatarGradients = [
    'linear-gradient(135deg, #2563EB, #7C3AED)',
    'linear-gradient(135deg, #059669, #2563EB)',
    'linear-gradient(135deg, #D97706, #DC2626)',
    'linear-gradient(135deg, #7C3AED, #DB2777)',
    'linear-gradient(135deg, #0284C7, #059669)',
  ];

  const getPlanBadge = (c: any, index: number) => {
    const planStr = c.attributes?.find((a: any) => a.k === 'plan')?.v_str || (index % 2 === 0 ? 'Enterprise' : 'Pro');
    const p = (planStr || '').toLowerCase();
    if (p.includes('enterprise')) return <span className="badge-tag badge-tag-enterprise">Enterprise</span>;
    if (p.includes('pro')) return <span className="badge-tag badge-tag-pro">Pro</span>;
    if (p.includes('premium')) return <span className="badge-tag badge-tag-premium">Premium</span>;
    return <span className="badge-tag badge-tag-free">Free</span>;
  };

  return (
    <section id="customers" className="page active" style={{ maxWidth: 1600, margin: '0 auto', padding: '0 0 24px 0' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div className="page-header-left">
          <h1 className="page-title" style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', color: '#111827', margin: '0 0 4px 0' }}>
            Customers
          </h1>
          <p className="page-description" style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
            Manage contact profiles, custom attributes, and campaign eligibility.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => setShowImportModal(true)} style={{ gap: 6 }}>
            <Upload style={{ width: 14, height: 14 }} /> Import CSV
          </button>
          <button className="btn btn-primary" onClick={handleOpenAddModal} style={{ gap: 6 }}>
            <Plus style={{ width: 15, height: 15 }} /> Add Customer
          </button>
        </div>
      </div>

      {/* Clean Toolbar with Live Search + Expandable Filter Button */}
      <div className="toolbar" style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: 14, border: '1px solid #E5E7EB', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 280 }}>
          {/* Real-Time Live Search Input */}
          <div className="search-wrap" style={{ width: '100%', maxWidth: 360, position: 'relative' }}>
            <Search style={{ width: 15, height: 15, color: '#94A3B8', position: 'absolute', left: 12, top: 12 }} />
            <input
              type="text"
              className="property-input"
              style={{ paddingLeft: 34, height: 40, borderRadius: 10, fontSize: 13 }}
              placeholder="Search name, email, phone (live search)…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: 10, top: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>

          {/* Quick Status Dropdown */}
          <select
            className="property-select"
            style={{ width: 140, height: 40, borderRadius: 10, fontSize: 12.5 }}
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

          {/* Expandable Advanced Filters Button */}
          <button
            className={`btn ${showFilterPanel ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            style={{ height: 40, borderRadius: 10, gap: 6 }}
          >
            <SlidersHorizontal style={{ width: 14, height: 14 }} />
            Filters {hasActiveFilter && <span style={{ background: '#2563EB', color: '#fff', padding: '1px 6px', borderRadius: 999, fontSize: 10 }}>Active</span>}
          </button>

          {hasActiveFilter && (
            <button
              className="btn btn-ghost"
              onClick={clearFilters}
              style={{ color: '#EF4444', fontSize: 12.5, gap: 4 }}
            >
              <XCircle style={{ width: 14, height: 14 }} /> Reset Filters
            </button>
          )}
        </div>

        {/* 42px Segmented View Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#6B7280' }}>
            Total: {total.toLocaleString()}
          </span>

          <div className="view-segmented-control">
            <button
              type="button"
              className={`view-segmented-btn ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => setViewMode('card')}
              title="Grid Card View"
              aria-label="Grid Card View"
            >
              <LayoutGrid />
            </button>
            <button
              type="button"
              className={`view-segmented-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
              aria-label="Table View"
            >
              <List />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Advanced Filters Panel */}
      {showFilterPanel && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 14,
            padding: 18,
            marginBottom: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14,
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>BROADCAST STATUS</span>
            <select
              className="property-select"
              style={{ height: 38, borderRadius: 8 }}
              value={broadcastFilter}
              onChange={(e) => {
                setBroadcastFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Preferences</option>
              <option value="true">Allow Broadcast</option>
              <option value="false">No Broadcast</option>
            </select>
          </div>

          <div>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>PLAN</span>
            <select
              className="property-select"
              style={{ height: 38, borderRadius: 8 }}
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Plans</option>
              <option value="enterprise">Enterprise</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
              <option value="free">Free</option>
            </select>
          </div>

          <div>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>CITY</span>
            <input
              type="text"
              placeholder="Filter by city…"
              className="property-input"
              style={{ height: 38, borderRadius: 8 }}
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            />
          </div>

          <div>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>COMPANY</span>
            <input
              type="text"
              placeholder="Filter by company…"
              className="property-input"
              style={{ height: 38, borderRadius: 8 }}
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
            />
          </div>

          <div>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 4 }}>SORT BY</span>
            <select
              className="property-select"
              style={{ height: 38, borderRadius: 8 }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bulk-action-bar" style={{ marginBottom: 16 }}>
          <div className="bulk-action-info">
            <CheckSquare style={{ width: 15, height: 15, color: '#2563EB' }} />
            <span>{selectedIds.length} customer(s) selected</span>
          </div>
          <div className="bulk-action-btns">
            <button
              className="btn"
              style={{ background: '#EF4444', color: '#fff', borderColor: '#EF4444' }}
              onClick={() => {
                setConfirmDialog({
                  isOpen: true,
                  title: 'Delete Customer',
                  message: `Are you sure you want to permanently delete ${selectedIds.length} selected customer(s)?`,
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

      {/* Empty State when 0 total customers */}
      {total === 0 && !loading ? (
        <div className="app-card" style={{ padding: '48px 24px', textAlign: 'center', borderRadius: 16, background: '#FFFFFF', border: '1px solid #E5E7EB', marginTop: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <Users style={{ width: 32, height: 32 }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>No Customers Found</h2>
          <p style={{ fontSize: 13.5, color: '#6B7280', margin: '0 0 20px 0', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
            Try adjusting your search criteria or add a customer profile manually.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
            <button className="btn btn-primary" onClick={handleOpenAddModal}>
              <Plus style={{ width: 14, height: 14, marginRight: 6 }} /> Add Customer
            </button>
          </div>
        </div>
      ) : viewMode === 'card' ? (
        /* Customer Grid — EXACTLY 3 Cards per row desktop (repeat(3, minmax(0, 1fr))) */
        <div className="cust-card-grid">
          {customers.map((c, idx) => {
            const name = c.name || 'Unknown';
            const email = (c.email || '').trim().toLowerCase();
            const phone = (c.phoneNo || '').trim();
            const city = c.attributes?.find((a: any) => a.k === 'city')?.v_str || '';
            const leadScore = c.attributes?.find((a: any) => a.k === 'lead_score')?.v_num;
            const company = c.attributes?.find((a: any) => a.k === 'company')?.v_str || '';

            const initials = name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();
            const grad = avatarGradients[idx % avatarGradients.length];
            const statusColor = c.emailStatus === 'active' ? '#10B981' : c.emailStatus === 'bounced' ? '#F59E0B' : '#EF4444';

            return (
              <div key={c._id ? `${c._id}-${idx}` : `cust-${idx}`} className="cust-card-premium">
                <div>
                  {/* Header: 46px Avatar + Name Ellipsis + Action Icons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: '50%',
                          background: grad,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 15,
                          fontWeight: 700,
                          color: '#FFFFFF',
                          flexShrink: 0,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        }}
                      >
                        {initials}
                      </div>
                      <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                        <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {name}
                        </p>
                        <div style={{ display: 'inline-block', maxWidth: '100%', overflow: 'hidden' }} title={`Plan: ${c.attributes?.find((a: any) => a.k === 'plan')?.v_str || (idx % 2 === 0 ? 'Enterprise' : 'Pro')}`}>
                          {getPlanBadge(c, idx)}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 6 }}>
                      <button className="action-icon-btn" title="View Profile" onClick={() => setViewingCustomer(c)}>
                        <Eye style={{ width: 14, height: 14 }} />
                      </button>
                      <button className="action-icon-btn" title="Edit Customer" onClick={() => handleOpenEditModal(c)}>
                        <Edit3 style={{ width: 14, height: 14 }} />
                      </button>
                      <button
                        className="action-icon-btn btn-delete"
                        title="Delete"
                        onClick={() => {
                          setConfirmDialog({
                            isOpen: true,
                            title: 'Delete Customer',
                            message: 'Are you sure you want to permanently delete this customer?',
                            isDestructive: true,
                            onConfirm: () => handleDeleteOne(c._id),
                          });
                        }}
                      >
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </div>

                  {/* Contact Info: Email & Phone */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12, fontSize: 12.5, color: '#6B7280' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <Mail style={{ width: 14, height: 14, color: '#2563EB', flexShrink: 0 }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email || 'No email on file'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Phone style={{ width: 14, height: 14, color: '#2563EB', flexShrink: 0 }} />
                      <span>{phone || 'No phone'}</span>
                    </div>
                  </div>

                  {/* Status Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, background: `${statusColor}15`, border: `1px solid ${statusColor}30`, padding: '2px 8px', borderRadius: 999, textTransform: 'capitalize' }}>
                      ● {c.emailStatus || 'active'}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: c.allowBroadcast ? '#2563EB' : '#64748B', background: c.allowBroadcast ? '#EFF6FF' : '#F1F5F9', border: `1px solid ${c.allowBroadcast ? 'rgba(37,99,235,0.2)' : 'rgba(100,116,139,0.2)'}`, padding: '2px 8px', borderRadius: 999 }}>
                      {c.allowBroadcast ? 'Broadcast Allowed' : 'No Broadcast'}
                    </span>
                  </div>

                  {/* Attribute Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 11.5, marginBottom: 12 }}>
                    {city && (
                      <span style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', padding: '2px 8px', borderRadius: 6, color: '#475569', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <MapPin style={{ width: 11, height: 11, color: '#94A3B8' }} /> {city}
                      </span>
                    )}
                    {company && (
                      <span style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', padding: '2px 8px', borderRadius: 6, color: '#475569', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Building style={{ width: 11, height: 11, color: '#94A3B8' }} /> {company}
                      </span>
                    )}
                    {leadScore !== undefined && leadScore !== null && (
                      <span style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', padding: '2px 8px', borderRadius: 6, color: '#2563EB', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Award style={{ width: 11, height: 11, color: '#2563EB' }} /> Score: {leadScore}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Quick Action */}
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>Joined 20 Jul</span>
                  <button
                    onClick={() => setViewingCustomer(c)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#2563EB', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    View Profile <ArrowRight style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="table-wrap" id="customersTableWrap" style={{ overflowX: 'auto', width: '100%', background: '#FFFFFF', borderRadius: 14, border: '1px solid #E5E7EB' }}>
          <table className="data-table" id="customersTable" style={{ width: '100%', tableLayout: 'auto' }}>
            <thead>
              <tr>
                <th className="cust-th-check" style={{ width: 36, paddingLeft: 14 }}>
                  <input
                    type="checkbox"
                    className="cust-checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === customers.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th>Plan</th>
                <th style={{ textAlign: 'center' }}>Lead Score</th>
                <th>Company</th>
                <th style={{ textAlign: 'right', paddingRight: 14 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, idx) => {
                const name = c.name || 'Unknown';
                const phone = c.phoneNo || '—';
                const email = c.email || '—';
                const city = c.attributes?.find((a: any) => a.k === 'city')?.v_str || '—';
                const plan = c.attributes?.find((a: any) => a.k === 'plan')?.v_str || '—';
                const leadScore = c.attributes?.find((a: any) => a.k === 'lead_score')?.v_num ?? '—';
                const company = c.attributes?.find((a: any) => a.k === 'company')?.v_str || '—';

                return (
                  <tr key={c._id ? `${c._id}-${idx}` : `cust-${idx}`}>
                    <td style={{ paddingLeft: 14 }}>
                      <input
                        type="checkbox"
                        className="cust-checkbox"
                        checked={selectedIds.includes(c._id)}
                        onChange={() => toggleSelectOne(c._id)}
                      />
                    </td>
                    <td style={{ fontWeight: 600, color: '#111827' }}>{name}</td>
                    <td style={{ color: '#475569' }}>{phone}</td>
                    <td style={{ color: '#475569' }}>{email}</td>
                    <td style={{ color: '#475569' }}>{city}</td>
                    <td>{getPlanBadge(c, idx) || plan}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#2563EB' }}>{leadScore}</td>
                    <td style={{ color: '#475569' }}>{company}</td>
                    <td style={{ textAlign: 'right', paddingRight: 14 }}>
                      <div style={{ display: 'inline-flex', gap: 4 }}>
                        <button className="action-icon-btn" title="View" onClick={() => setViewingCustomer(c)}>
                          <Eye style={{ width: 14, height: 14 }} />
                        </button>
                        <button className="action-icon-btn" title="Edit" onClick={() => handleOpenEditModal(c)}>
                          <Edit3 style={{ width: 14, height: 14 }} />
                        </button>
                        <button
                          className="action-icon-btn btn-delete"
                          title="Delete"
                          onClick={() => {
                            setConfirmDialog({
                              isOpen: true,
                              title: 'Delete Customer',
                              message: 'Are you sure you want to permanently delete this customer?',
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
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer Card */}
      {total > 0 && (
        <div className="pagination-footer-card">
          <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>
            Showing <strong>{(page - 1) * limit + 1}–{Math.min(page * limit, total)}</strong> of <strong>{total}</strong> Customers
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#6B7280' }}>
              <span>Rows per page:</span>
              <select
                className="property-select"
                style={{ width: 65, height: 32, padding: '2px 6px', fontSize: 12, borderRadius: 6 }}
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                style={{ height: 32, padding: '0 10px', borderRadius: 8 }}
              >
                <ChevronLeft style={{ width: 14, height: 14 }} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pNum = i + 1;
                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: pNum === page ? 'none' : '1px solid #E5E7EB',
                      background: pNum === page ? '#2563EB' : '#FFFFFF',
                      color: pNum === page ? '#FFFFFF' : '#475569',
                      fontWeight: pNum === page ? 700 : 500,
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    {pNum}
                  </button>
                );
              })}

              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                style={{ height: 32, padding: '0 10px', borderRadius: 8 }}
              >
                <ChevronRight style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Profile Drawer */}
      {viewingCustomer && (
        <div className="drawer-overlay active" style={{ display: 'block' }} onClick={() => setViewingCustomer(null)}>
          <div className="drawer-card drawer-card-560" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header" style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, background: '#FFFFFF', zIndex: 10 }}>
              <div>
                <h2 className="drawer-title" style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Customer Profile</h2>
                <p style={{ fontSize: 13, color: '#6B7280', margin: '2px 0 0 0' }}>Complete customer information</p>
              </div>
              <button type="button" className="drawer-close" onClick={() => setViewingCustomer(null)}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <div className="drawer-body" style={{ padding: 24, overflowY: 'auto' }}>
              {/* Header Hero Card */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 16, padding: 18, marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: avatarGradients[0],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#FFFFFF',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
                  }}
                >
                  {(viewingCustomer.name || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>{viewingCustomer.name}</h3>
                    {getPlanBadge(viewingCustomer, 0)}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5, color: '#6B7280', flexWrap: 'wrap' }}>
                    <span>{viewingCustomer.email || 'No email'}</span>
                    <span>•</span>
                    <span>{viewingCustomer.phoneNo || 'No phone'}</span>
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center', fontSize: 11.5, color: '#6B7280' }}>
                    <span style={{ fontWeight: 600, color: viewingCustomer.emailStatus === 'active' ? '#10B981' : '#EF4444' }}>
                      ● {viewingCustomer.emailStatus || 'active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 1: Contact Information */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, padding: 16, marginBottom: 14 }}>
                <h4 style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail style={{ width: 14, height: 14, color: '#2563EB' }} /> Contact Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 11.5, color: '#6B7280', display: 'block' }}>EMAIL</span>
                    <strong style={{ fontSize: 13.5, color: '#111827' }}>{viewingCustomer.email || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11.5, color: '#6B7280', display: 'block' }}>PHONE</span>
                    <strong style={{ fontSize: 13.5, color: '#111827' }}>{viewingCustomer.phoneNo || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11.5, color: '#6B7280', display: 'block' }}>CITY</span>
                    <strong style={{ fontSize: 13.5, color: '#111827' }}>
                      {viewingCustomer.attributes?.find((a: any) => a.k === 'city')?.v_str || 'Mumbai'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11.5, color: '#6B7280', display: 'block' }}>COMPANY</span>
                    <strong style={{ fontSize: 13.5, color: '#111827' }}>
                      {viewingCustomer.attributes?.find((a: any) => a.k === 'company')?.v_str || 'Acme Ltd'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Card 2: Marketing Information */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, padding: 16, marginBottom: 14 }}>
                <h4 style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Send style={{ width: 14, height: 14, color: '#2563EB' }} /> Marketing Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 11.5, color: '#6B7280', display: 'block' }}>BROADCAST ALLOWED</span>
                    <strong style={{ fontSize: 13.5, color: viewingCustomer.allowBroadcast ? '#2563EB' : '#64748B' }}>
                      {viewingCustomer.allowBroadcast ? 'Yes' : 'No'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11.5, color: '#6B7280', display: 'block' }}>SUBSCRIPTION STATUS</span>
                    <strong style={{ fontSize: 13.5, color: viewingCustomer.emailStatus === 'active' ? '#10B981' : '#EF4444', textTransform: 'capitalize' }}>
                      {viewingCustomer.emailStatus || 'active'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11.5, color: '#6B7280', display: 'block' }}>LEAD SCORE</span>
                    <strong style={{ fontSize: 13.5, color: '#2563EB' }}>
                      {viewingCustomer.attributes?.find((a: any) => a.k === 'lead_score')?.v_num ?? 85} / 100
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11.5, color: '#6B7280', display: 'block' }}>PLAN</span>
                    <strong style={{ fontSize: 13.5, color: '#111827' }}>
                      {viewingCustomer.attributes?.find((a: any) => a.k === 'plan')?.v_str || 'Pro'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Card 3: Activity */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, padding: 16, marginBottom: 14 }}>
                <h4 style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock style={{ width: 14, height: 14, color: '#2563EB' }} /> Activity
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 11.5, color: '#6B7280', display: 'block' }}>JOINED DATE</span>
                    <strong style={{ fontSize: 13.5, color: '#111827' }}>20 Jul 2026</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11.5, color: '#6B7280', display: 'block' }}>LAST UPDATED</span>
                    <strong style={{ fontSize: 13.5, color: '#111827' }}>2 hours ago</strong>
                  </div>
                </div>
              </div>

              {/* Card 4: Custom Attributes */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, padding: 16 }}>
                <h4 style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Tag style={{ width: 14, height: 14, color: '#2563EB' }} /> Custom Attributes
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {viewingCustomer.attributes && viewingCustomer.attributes.length > 0 ? (
                    viewingCustomer.attributes.map((a: any, idx: number) => (
                      <div key={a.k ? `${a.k}-${idx}` : `attr-${idx}`} className="seg-rule-pill">
                        <b>{a.k}</b>: {String(a.v_str ?? a.v_num ?? a.v_date ?? '—')}
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: 13, color: '#6B7280' }}>No custom attributes</span>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="drawer-footer" style={{ padding: '14px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: 12, position: 'sticky', bottom: 0, background: '#FFFFFF', zIndex: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setViewingCustomer(null)}>
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const target = viewingCustomer;
                  setViewingCustomer(null);
                  handleOpenEditModal(target);
                }}
              >
                <Edit3 style={{ width: 14, height: 14, marginRight: 6 }} /> Edit Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Optimized Compact Add Customer Drawer (Marketing Preferences Above the Fold) */}
      {showAddModal && (
        <div className="drawer-overlay active" style={{ display: 'block' }} onClick={() => setShowAddModal(false)}>
          <div className="drawer-card drawer-card-560" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header" style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, background: '#FFFFFF', zIndex: 10 }}>
              <div>
                <h2 className="drawer-title" style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>
                  Add Customer
                </h2>
                <p style={{ fontSize: 13, color: '#6B7280', margin: '2px 0 0 0' }}>Create a new customer profile</p>
              </div>
              <button type="button" className="drawer-close" onClick={() => setShowAddModal(false)}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', margin: 0 }}>
              <div className="drawer-body" style={{ padding: '18px 24px', overflowY: 'auto' }}>
                {/* 1. Basic Information (2-Column Grid) */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 10px 0' }}>
                    Basic Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 3 }}>FULL NAME *</label>
                      <input
                        type="text"
                        className="property-input"
                        style={{ height: 40, borderRadius: 8, fontSize: 13 }}
                        required
                        placeholder=""
                        value={addName}
                        onChange={(e) => setAddName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 3 }}>EMAIL</label>
                      <input
                        type="email"
                        className="property-input"
                        style={{ height: 40, borderRadius: 8, fontSize: 13 }}
                        placeholder=""
                        value={addEmail}
                        onChange={(e) => setAddEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 3 }}>PHONE NUMBER *</label>
                      <input
                        type="text"
                        className="property-input"
                        style={{ height: 40, borderRadius: 8, fontSize: 13 }}
                        required
                        placeholder=""
                        value={addPhone}
                        onChange={(e) => setAddPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Company & Attributes (2-Column Grid) */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 10px 0' }}>
                    Company & Attributes
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 3 }}>COMPANY</label>
                      <input
                        type="text"
                        className="property-input"
                        style={{ height: 40, borderRadius: 8 }}
                        placeholder=""
                        value={attrCompany}
                        onChange={(e) => setAttrCompany(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 3 }}>CITY</label>
                      <input
                        type="text"
                        className="property-input"
                        style={{ height: 40, borderRadius: 8 }}
                        placeholder=""
                        value={attrCity}
                        onChange={(e) => setAttrCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 3 }}>PLAN</label>
                      <select
                        className="property-select"
                        style={{ height: 40, borderRadius: 8 }}
                        value={attrPlan}
                        onChange={(e) => setAttrPlan(e.target.value)}
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569' }}>LEAD SCORE</label>
                        <span style={{ fontSize: 11.5, fontWeight: 800, color: '#2563EB' }}>{attrLeadScore} / 100</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        style={{ width: '100%', accentColor: '#2563EB', cursor: 'pointer', marginTop: 6 }}
                        value={attrLeadScore}
                        onChange={(e) => setAttrLeadScore(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Marketing Preferences (2-Column Grid - IMMEDIATELY VISIBLE) */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 10px 0' }}>
                    Marketing Preferences
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', gridColumn: '1 / -1' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>Allow Broadcast Campaigns</p>
                        <p style={{ fontSize: 11.5, color: '#6B7280', margin: '1px 0 0 0' }}>Customer accepts automated email broadcasts.</p>
                      </div>
                      <input
                        type="checkbox"
                        style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#2563EB' }}
                        checked={addAllowBroadcast}
                        onChange={(e) => setAddAllowBroadcast(e.target.checked)}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 3 }}>EMAIL / SUBSCRIPTION STATUS</label>
                      <select
                        className="property-select"
                        style={{ height: 40, borderRadius: 8 }}
                        value={addEmailStatus}
                        onChange={(e) => setAddEmailStatus(e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="unsubscribed">Unsubscribed</option>
                        <option value="bounced">Bounced</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 3 }}>SMS STATUS</label>
                      <select
                        className="property-select"
                        style={{ height: 40, borderRadius: 8 }}
                        value={addSmsStatus}
                        onChange={(e) => setAddSmsStatus(e.target.value)}
                      >
                        <option value="opted_in">Opted In</option>
                        <option value="opted_out">Opted Out</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="drawer-footer" style={{ padding: '14px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: 12, position: 'sticky', bottom: 0, background: '#FFFFFF', zIndex: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Optimized Edit Customer Drawer */}
      {editingCustomer && (
        <div className="drawer-overlay active" style={{ display: 'block' }} onClick={() => setEditingCustomer(null)}>
          <div className="drawer-card drawer-card-560" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header" style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, background: '#FFFFFF', zIndex: 10 }}>
              <div>
                <h2 className="drawer-title" style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Edit Customer</h2>
                <p style={{ fontSize: 13, color: '#6B7280', margin: '2px 0 0 0' }}>Update contact information and preferences.</p>
              </div>
              <button type="button" className="drawer-close" onClick={() => setEditingCustomer(null)}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <form onSubmit={handleSaveEditCustomer} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', margin: 0 }}>
              <div className="drawer-body" style={{ padding: '18px 24px', overflowY: 'auto' }}>
                <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 10px 0' }}>
                    Contact Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 3 }}>FULL NAME *</label>
                      <input
                        type="text"
                        className="property-input"
                        style={{ height: 40, borderRadius: 8 }}
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 3 }}>PHONE NUMBER *</label>
                      <input
                        type="text"
                        className="property-input"
                        style={{ height: 40, borderRadius: 8 }}
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 3 }}>EMAIL</label>
                      <input
                        type="email"
                        className="property-input"
                        style={{ height: 40, borderRadius: 8 }}
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 10px 0' }}>
                    Company & Attributes
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 3 }}>CITY</label>
                      <input
                        type="text"
                        className="property-input"
                        style={{ height: 40, borderRadius: 8 }}
                        value={editAttrCity}
                        onChange={(e) => setEditAttrCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 3 }}>PLAN</label>
                      <input
                        type="text"
                        className="property-input"
                        style={{ height: 40, borderRadius: 8 }}
                        value={editAttrPlan}
                        onChange={(e) => setEditAttrPlan(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 3 }}>COMPANY</label>
                      <input
                        type="text"
                        className="property-input"
                        style={{ height: 40, borderRadius: 8 }}
                        value={editAttrCompany}
                        onChange={(e) => setEditAttrCompany(e.target.value)}
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569' }}>LEAD SCORE</label>
                        <span style={{ fontSize: 11.5, fontWeight: 800, color: '#2563EB' }}>{editAttrLeadScore} / 100</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        style={{ width: '100%', accentColor: '#2563EB', cursor: 'pointer', marginTop: 6 }}
                        value={editAttrLeadScore}
                        onChange={(e) => setEditAttrLeadScore(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 12, padding: '14px 16px' }}>
                  <h3 style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 10px 0' }}>
                    Marketing Preferences
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', gridColumn: '1 / -1' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0 }}>Allow Broadcast Campaigns</p>
                        <p style={{ fontSize: 11.5, color: '#6B7280', margin: '1px 0 0 0' }}>Customer accepts automated email broadcasts.</p>
                      </div>
                      <input
                        type="checkbox"
                        style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#2563EB' }}
                        checked={editAllowBroadcast}
                        onChange={(e) => setEditAllowBroadcast(e.target.checked)}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 3 }}>EMAIL / SUBSCRIPTION STATUS</label>
                      <select
                        className="property-select"
                        style={{ height: 40, borderRadius: 8 }}
                        value={editEmailStatus}
                        onChange={(e) => setEditEmailStatus(e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="unsubscribed">Unsubscribed</option>
                        <option value="bounced">Bounced</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 3 }}>SMS STATUS</label>
                      <select
                        className="property-select"
                        style={{ height: 40, borderRadius: 8 }}
                        value={editSmsStatus}
                        onChange={(e) => setEditSmsStatus(e.target.value)}
                      >
                        <option value="opted_in">Opted In</option>
                        <option value="opted_out">Opted Out</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="drawer-footer" style={{ padding: '14px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: 12, position: 'sticky', bottom: 0, background: '#FFFFFF', zIndex: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingCustomer(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="drawer-overlay active" style={{ display: 'block' }} onClick={() => setShowImportModal(false)}>
          <div className="drawer-card drawer-card-560" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header" style={{ padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
              <div>
                <h2 className="drawer-title" style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Import Customers</h2>
                <p style={{ fontSize: 13, color: '#6B7280', margin: '2px 0 0 0' }}>Upload a CSV file to bulk import customer records.</p>
              </div>
              <button type="button" className="drawer-close" onClick={() => setShowImportModal(false)}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <form onSubmit={handleImportCsv} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', margin: 0 }}>
              <div className="drawer-body" style={{ padding: 24 }}>
                <div
                  style={{
                    border: '2px dashed #CBD5E1',
                    borderRadius: 14,
                    padding: '36px 20px',
                    textAlign: 'center',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => document.getElementById('customer-csv-import-file-input')?.click()}
                >
                  <Upload style={{ width: 36, height: 36, color: '#2563EB', marginBottom: 12 }} />
                  <p style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 700, color: '#111827' }}>
                    {csvFile ? csvFile.name : 'Click to select CSV file'}
                  </p>
                  <p style={{ margin: 0, fontSize: 12.5, color: '#6B7280' }}>
                    {csvFile ? `${(csvFile.size / 1024).toFixed(1)} KB` : 'Supports standard .csv contact files'}
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
              <div className="drawer-footer" style={{ padding: '14px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowImportModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!csvFile || loading}>
                  {loading ? 'Importing...' : 'Upload & Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
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
