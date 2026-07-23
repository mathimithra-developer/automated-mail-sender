import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Search,
  Download,
  Users,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  Mail,
  Phone,
  Radio,
} from 'lucide-react';
import { api } from '../../services/api';

interface SegmentMembersPanelProps {
  segment: any;
  onClose: () => void;
  showToast: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const SegmentMembersPanel: React.FC<SegmentMembersPanelProps> = ({
  segment,
  onClose,
  showToast,
}) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(25);
  const [total, setTotal] = useState<number>(0);
  const [pages, setPages] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [exporting, setExporting] = useState<boolean>(false);

  // Summary Metrics
  const [summary, setSummary] = useState<{
    total: number;
    activeCount: number;
    lastEvaluatedAt: string | null;
  }>({
    total: segment?.cachedCount ?? 0,
    activeCount: 0,
    lastEvaluatedAt: segment?.lastEvaluatedAt ?? null,
  });

  const fetchMembers = useCallback(async () => {
    if (!segment?._id) return;
    setLoading(true);
    setError(null);
    try {
      let query = `/api/segments/${segment._id}/customers?page=${page}&limit=${limit}`;
      if (search.trim()) {
        query += `&search=${encodeURIComponent(search.trim())}`;
      }
      if (statusFilter) {
        query += `&status=${encodeURIComponent(statusFilter)}`;
      }

      const res = await api.get(query);
      setCustomers(res.data || []);
      setTotal(res.pagination?.total ?? res.count ?? 0);
      setPages(res.pagination?.pages ?? 1);
      if (res.summary) {
        setSummary({
          total: res.summary.total ?? res.pagination?.total ?? 0,
          activeCount: res.summary.activeCount ?? 0,
          lastEvaluatedAt: res.summary.lastEvaluatedAt || segment?.lastEvaluatedAt,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load segment customers.');
      showToast('Error', err.message || 'Failed to load segment customers', 'error');
    } finally {
      setLoading(false);
    }
  }, [segment?._id, page, limit, search, statusFilter, showToast, segment?.lastEvaluatedAt]);

  // Fetch when page, limit, or statusFilter changes
  useEffect(() => {
    fetchMembers();
  }, [page, limit, statusFilter]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchMembers();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Lock body scroll while panel is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleExportCSV = async () => {
    if (!segment?._id) return;
    setExporting(true);
    try {
      const response = await fetch(`/api/segments/${segment._id}/export`, {
        headers: {
          'Accept': 'text/csv',
        },
      });
      if (!response.ok) throw new Error('Failed to export segment CSV');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `segment-${segment.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('Export Success', 'Segment CSV downloaded successfully.', 'success');
    } catch (err: any) {
      showToast('Export Error', err.message || 'Failed to export CSV', 'error');
    } finally {
      setExporting(false);
    }
  };

  const activePercentage = summary.total > 0
    ? Math.round((summary.activeCount / summary.total) * 100)
    : 0;

  const formattedLastEvaluated = summary.lastEvaluatedAt
    ? new Date(summary.lastEvaluatedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Never';

  const startRecord = total > 0 ? (page - 1) * limit + 1 : 0;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className="seg-panel-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="seg-panel-card">
        {/* Header */}
        <div className="seg-panel-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span className="badge badge-primary" style={{ fontSize: 11, fontWeight: 700 }}>
                DYNAMIC SEGMENT
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>ID: {segment._id}</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--text)' }}>
              {segment.name}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              {segment.description || 'Enterprise customer audience group.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={exporting}
              onClick={handleExportCSV}
            >
              <Download style={{ width: 14, height: 14 }} />
              {exporting ? 'Exporting…' : 'Export CSV'}
            </button>
            <button
              type="button"
              className="action-icon-btn"
              onClick={onClose}
              title="Close panel"
              style={{ width: 36, height: 36 }}
            >
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>

        {/* Panel Body */}
        <div className="seg-panel-body">
          {/* Summary Metric Cards */}
          <div className="seg-summary-grid">
            <div className="seg-metric-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="seg-metric-title">Total Members</span>
                <Users style={{ width: 16, height: 16, color: 'var(--primary)' }} />
              </div>
              <span className="seg-metric-value">{summary.total.toLocaleString()}</span>
              <span className="seg-metric-sub">Matching segment rules</span>
            </div>

            <div className="seg-metric-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="seg-metric-title">Active Contacts</span>
                <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--success)' }} />
              </div>
              <span className="seg-metric-value">{summary.activeCount.toLocaleString()}</span>
              <span className="seg-metric-sub">{activePercentage}% deliverable audience</span>
            </div>

            <div className="seg-metric-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="seg-metric-title">Last Sync</span>
                <Clock style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
              </div>
              <span className="seg-metric-value" style={{ fontSize: 16, paddingTop: 4 }}>
                {formattedLastEvaluated}
              </span>
              <span className="seg-metric-sub">Real-time dynamic check</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="toolbar" style={{ margin: 0, padding: '12px 16px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <div className="search-wrap" style={{ flex: 1, maxWidth: 360 }}>
              <Search style={{ width: 14, height: 14 }} />
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, email, or phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)' }}
                >
                  <X style={{ width: 12, height: 12 }} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <SlidersHorizontal style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                <select
                  className="property-select"
                  style={{ width: 150 }}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="bounced">Bounced</option>
                  <option value="unsubscribed">Unsubscribed</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Per page:</span>
                <select
                  className="property-select"
                  style={{ width: 75 }}
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <button
                type="button"
                className="action-icon-btn"
                title="Refresh table"
                onClick={fetchMembers}
              >
                <RefreshCw style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="seg-table-container">
            <div className="seg-table-scroll">
              <table className="data-table" style={{ width: '100%', minWidth: 700 }}>
                <thead>
                  <tr>
                    <th style={{ width: '28%' }}>Customer</th>
                    <th style={{ width: '28%' }}>Email</th>
                    <th style={{ width: '18%' }}>Phone</th>
                    <th style={{ width: '13%' }}>Status</th>
                    <th style={{ width: '13%' }}>Broadcast</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    // Skeleton Loading State
                    Array.from({ length: 6 }).map((_, idx) => (
                      <tr key={`skel-${idx}`} className="skeleton-row">
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="skeleton-box" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                            <div className="skeleton-box" style={{ width: 120, height: 14 }} />
                          </div>
                        </td>
                        <td><div className="skeleton-box" style={{ width: 160, height: 14 }} /></td>
                        <td><div className="skeleton-box" style={{ width: 100, height: 14 }} /></td>
                        <td><div className="skeleton-box" style={{ width: 70, height: 18, borderRadius: 999 }} /></td>
                        <td><div className="skeleton-box" style={{ width: 60, height: 14 }} /></td>
                      </tr>
                    ))
                  ) : error ? (
                    // Error State
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                          <AlertCircle style={{ width: 32, height: 32, color: 'var(--error)' }} />
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--error)', margin: 0 }}>
                            {error}
                          </p>
                          <button className="btn btn-secondary btn-sm" onClick={fetchMembers}>
                            Retry Loading
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    // Empty State
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: 50 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users style={{ width: 22, height: 22, color: 'var(--text-muted)' }} />
                          </div>
                          <p style={{ fontSize: 15, fontWeight: 700, margin: '4px 0 0 0', color: 'var(--text)' }}>
                            No customers found
                          </p>
                          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, maxWidth: 320 }}>
                            {search || statusFilter
                              ? 'No matching customer records for your active filter criteria.'
                              : 'This segment currently has 0 matching customers.'}
                          </p>
                          {(search || statusFilter) && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ marginTop: 8 }}
                              onClick={() => {
                                setSearch('');
                                setStatusFilter('');
                              }}
                            >
                              Reset Filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // Data Rows
                    customers.map((c, idx) => {
                      const initial = c.name ? c.name.charAt(0).toUpperCase() : '?';
                      const statusClass = c.emailStatus === 'active'
                        ? 'status-pill-active'
                        : c.emailStatus === 'bounced'
                        ? 'status-pill-bounced'
                        : c.emailStatus === 'unsubscribed'
                        ? 'status-pill-unsubscribed'
                        : 'status-pill-inactive';

                      return (
                        <tr key={c._id || `cust-${idx}`}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className="cust-avatar">{initial}</div>
                              <div>
                                <span style={{ fontWeight: 600, color: 'var(--text)', display: 'block' }}>
                                  {c.name || 'Unnamed Contact'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                              <Mail style={{ width: 13, height: 13, flexShrink: 0 }} />
                              <span style={{ fontSize: 12.5 }}>{c.email || '—'}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                              <Phone style={{ width: 13, height: 13, flexShrink: 0 }} />
                              <span style={{ fontSize: 12.5 }}>{c.phoneNo || '—'}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-pill ${statusClass}`}>
                              {c.emailStatus || 'active'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: 12, fontWeight: 500, color: c.allowBroadcast ? 'var(--success)' : 'var(--text-muted)' }}>
                              {c.allowBroadcast ? 'Allowed' : 'Opted Out'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Pagination */}
        <div className="seg-panel-footer">
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Showing <strong>{startRecord}</strong> to <strong>{endRecord}</strong> of <strong>{total.toLocaleString()}</strong> customers
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft style={{ width: 14, height: 14 }} /> Previous
            </button>
            <span style={{ fontSize: 13, padding: '0 8px', fontWeight: 600 }}>
              Page {page} of {pages}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={page >= pages || loading}
              onClick={() => setPage(page + 1)}
            >
              Next <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
