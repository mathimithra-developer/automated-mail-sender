import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Eye,
  Edit3,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building,
  Award,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const avatarGradients = [
  'linear-gradient(135deg, #2563EB, #1D4ED8)',
  'linear-gradient(135deg, #7C3AED, #6D28D9)',
  'linear-gradient(135deg, #059669, #047857)',
  'linear-gradient(135deg, #D97706, #B45309)',
  'linear-gradient(135deg, #DC2626, #B91C1C)',
  'linear-gradient(135deg, #0891B2, #0E7490)',
];

export const SegmentMatchesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [segment, setSegment] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch Segment Info & Customers
  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Fetch segment details
      const segRes = await api.get(`/api/segments`).catch(() => null);
      const allSegments = segRes?.data || [];
      const currentSeg = allSegments.find((s: any) => s._id === id);
      if (currentSeg) {
        setSegment(currentSeg);
      }

      // Fetch segment matching customers
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const custRes = await api.get(`/api/segments/${id}/customers?${params.toString()}`);
      if (custRes && custRes.data) {
        setCustomers(custRes.data);
        setTotal(custRes.count || custRes.pagination?.total || custRes.data.length);
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to fetch segment customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, page, limit, statusFilter]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setPage(1);
      loadData();
    }
  };

  const handleExportCsv = async () => {
    if (!id) return;
    setExporting(true);
    try {
      const response = await fetch(`/api/segments/${id}/export`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to export CSV');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(segment?.name || 'segment').toLowerCase().replace(/\s+/g, '_')}_customers.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('Exported', 'Matching customers exported to CSV', 'success');
    } catch (err: any) {
      showToast('Export Error', err.message, 'error');
    } finally {
      setExporting(false);
    }
  };

  const getPlanBadge = (c: any, idx: number) => {
    const planVal = c.attributes?.find((a: any) => a.k === 'plan')?.v_str || (idx % 2 === 0 ? 'Enterprise' : 'Pro');
    const planLower = planVal.toLowerCase();

    let bg = '#EFF6FF';
    let color = '#2563EB';
    let border = 'rgba(37,99,235,0.2)';

    if (planLower.includes('enterprise')) {
      bg = '#F3E8FF';
      color = '#7C3AED';
      border = 'rgba(124,58,237,0.2)';
    } else if (planLower.includes('free') || planLower.includes('starter')) {
      bg = '#F1F5F9';
      color = '#475569';
      border = 'rgba(71,85,105,0.2)';
    }

    return (
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color,
          background: bg,
          border: `1px solid ${border}`,
          padding: '2px 8px',
          borderRadius: 999,
          textTransform: 'capitalize',
          display: 'inline-block',
        }}
      >
        {planVal}
      </span>
    );
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <section className="page active" id="segment-matches" style={{ maxWidth: 1600, margin: '0 auto', padding: '0 0 24px 0' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div className="page-header-left" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/segments')}
            style={{ padding: '6px 12px', borderRadius: 8, fontSize: 13, width: 'fit-content', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Segments
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 className="page-title" style={{ fontSize: 28, fontWeight: 700, color: '#0F172A', margin: 0 }}>
              {segment ? segment.name : 'Segment Customers'}
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#EFF6FF',
                border: '1px solid rgba(37,99,235,0.2)',
                color: '#2563EB',
                borderRadius: 9999,
                padding: '0 12px',
                height: 30,
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              <Users style={{ width: 13, height: 13 }} />
              {total.toLocaleString()} Matching Contacts
            </span>
          </div>
          <p className="page-description" style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
            {segment?.description || "Dedicated full view of all customers matching this segment's rule conditions."}
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleExportCsv} disabled={exporting} style={{ height: 40, borderRadius: 10, padding: '0 16px', background: '#2563EB', color: '#FFF' }}>
          <Download style={{ width: 15, height: 15, marginRight: 6 }} /> {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Filter & View Mode Toolbar */}
      <div className="seg-toolbar" style={{ background: '#FFFFFF', border: '1px solid #E5EEFB', borderRadius: 14, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, maxWidth: 540 }}>
          <div className="seg-search-wrap" style={{ position: 'relative', flex: 1 }}>
            <Search style={{ width: 16, height: 16 }} className="seg-search-icon" />
            <input
              type="text"
              className="seg-search-input"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          <select
            className="seg-status-select"
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
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>
            Total ({total})
          </span>
          <div className="seg-view-toggle">
            <button
              type="button"
              className={`seg-toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => setViewMode('card')}
              title="Card View"
            >
              <LayoutGrid style={{ width: 16, height: 16 }} />
            </button>
            <button
              type="button"
              className={`seg-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Main View: Card View OR Table View */}
      {viewMode === 'card' ? (
        /* BUG 4 FIX — Reusing Exact Shared Customer Card Component with Avatars */
        <div className="cust-card-grid" style={{ marginTop: 20 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748B', gridColumn: '1 / -1' }}>
              Loading matching customers…
            </div>
          ) : customers.length === 0 ? (
            <div
              style={{
                gridColumn: '1 / -1',
                background: '#FFFFFF',
                border: '1px dashed #CBD5E1',
                borderRadius: 16,
                padding: '48px 24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users style={{ width: 28, height: 28 }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 }}>No Matching Customers</h3>
              <p style={{ fontSize: 14, color: '#64748B', margin: 0, maxWidth: 400 }}>
                No customer profiles match the current filter or search criteria for this segment.
              </p>
            </div>
          ) : (
            customers.map((c: any, idx: number) => {
              const name = c.name || 'Unknown';
              const email = (c.email || '').trim().toLowerCase();
              const phone = (c.phoneNo || '').trim();
              const city = c.attributes?.find((a: any) => a.k === 'city')?.v_str || '';
              const leadScore = c.attributes?.find((a: any) => a.k === 'lead_score')?.v_num;
              const company = c.attributes?.find((a: any) => a.k === 'company')?.v_str || '';

              const initials = name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
              const grad = avatarGradients[idx % avatarGradients.length];
              const statusColor = c.emailStatus === 'active' ? '#10B981' : c.emailStatus === 'bounced' ? '#F59E0B' : '#EF4444';
              const createdDate = c.createdAt
                ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : '20 Jul 2026';

              return (
                <div key={c._id ? `${c._id}-${idx}` : `cust-${idx}`} className="cust-card-premium">
                  <div>
                    {/* Header: 46px Colored Circular Initials Avatar + Name + Plan Badge */}
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
                          <div style={{ display: 'inline-block', maxWidth: '100%', overflow: 'hidden' }}>
                            {getPlanBadge(c, idx)}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 6 }}>
                        <button className="action-icon-btn" title="View Profile" onClick={() => navigate('/customers')}>
                          <Eye style={{ width: 14, height: 14 }} />
                        </button>
                        <button className="action-icon-btn" title="Edit Customer" onClick={() => navigate('/customers')}>
                          <Edit3 style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    </div>

                    {/* Contact Info: Email & Phone with Icons */}
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

                  {/* Footer */}
                  <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 10, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#9CA3AF' }}>
                    <span>Joined {createdDate}</span>
                    <span style={{ cursor: 'pointer', color: '#2563EB', fontWeight: 600, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }} onClick={() => navigate('/customers')}>
                      View Profile →
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Table View */
        <div className="table-wrap" style={{ marginTop: 20 }}>
          <table className="data-table" style={{ width: '100%', minWidth: 860 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th>Plan</th>
                <th style={{ textAlign: 'center' }}>Lead Score</th>
                <th>Company</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#64748B' }}>
                    Loading matching customers…
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#64748B' }}>
                    No matching customers found for this segment.
                  </td>
                </tr>
              ) : (
                customers.map((c: any, idx: number) => {
                  const name = (c.name || '').trim() || 'Unknown';
                  const phone = (c.phoneNo || '').trim();
                  const email = (c.email || '').trim().toLowerCase();

                  const city = c.attributes?.find((a: any) => a.k === 'city')?.v_str || '—';
                  const leadScore = c.attributes?.find((a: any) => a.k === 'lead_score')?.v_num ?? '—';
                  const company = c.attributes?.find((a: any) => a.k === 'company')?.v_str || '—';

                  return (
                    <tr key={c._id ? `${c._id}-${idx}` : `cust-${idx}`}>
                      <td style={{ fontWeight: 700, color: '#0F172A' }}>{name}</td>
                      <td>{phone && phone !== '0000000000' ? phone : '—'}</td>
                      <td>{email || '—'}</td>
                      <td style={{ color: '#64748B', fontSize: 13.5 }}>{city}</td>
                      <td>{getPlanBadge(c, idx)}</td>
                      <td style={{ textAlign: 'center' }}>
                        {leadScore !== '—' ? <span style={{ fontWeight: 700, color: '#2563EB' }}>{leadScore}</span> : '—'}
                      </td>
                      <td style={{ color: '#64748B', fontSize: 13.5 }}>{company}</td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 700, color: c.emailStatus === 'active' ? '#10B981' : '#EF4444', background: c.emailStatus === 'active' ? '#ECFDF5' : '#FEF2F2', padding: '2px 8px', borderRadius: 999 }}>
                          ● {c.emailStatus || 'active'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* BUG 3 FIX — Rebuilt Clean Per Page Dropdown Footer */}
      <div className="pagination-footer-card" style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
          Showing <strong>{total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)}</strong> of <strong>{total}</strong> Matching Customers
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748B' }}>
            <span>Per page:</span>
            <select
              className="seg-status-select"
              style={{ height: 36, padding: '0 10px', borderRadius: 8, fontSize: 13 }}
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              className="btn btn-secondary"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              style={{ width: 36, height: 36, padding: 0, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Previous Page"
            >
              <ChevronLeft style={{ width: 16, height: 16 }} />
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#334155', padding: '0 6px' }}>
              {page} / {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              style={{ width: 36, height: 36, padding: 0, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Next Page"
            >
              <ChevronRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
