import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Search,
  Users,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Mail,
  Phone,
  ArrowLeft,
  Edit3,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';

interface SegmentPreviewModalProps {
  isOpen: boolean;
  totalCount: number;
  groups: any[];
  groupsMatch: 'all' | 'any';
  onClose: () => void;
  onSave: () => void;
  isEditing: boolean;
  showToast: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const SegmentPreviewModal: React.FC<SegmentPreviewModalProps> = ({
  isOpen,
  totalCount,
  groups,
  groupsMatch,
  onClose,
  onSave,
  isEditing,
  showToast,
}) => {
  if (!isOpen) return null;

  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCount, setActiveCount] = useState<number>(0);

  // Pagination & Filtering
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(25);
  const [total, setTotal] = useState<number>(totalCount);
  const [pages, setPages] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const formatCond = (c: any) => {
    const systemFieldNames = ['name', 'email', 'phoneNo', 'leadSource', 'inboxStatus', 'emailStatus', 'allowBroadcast'];
    const isCustomAttr = !systemFieldNames.includes(c.field);
    return {
      field: isCustomAttr ? 'attribute' : c.field,
      attrKey: isCustomAttr ? c.field : undefined,
      operator: c.operator,
      value: c.value,
      valueType: c.field === 'lead_score' ? 'num' : 'str',
    };
  };

  const fetchPreviewCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        conditionGroups: groups.map((g) => ({
          matchType: g.matchType,
          conditions: (g.conditions || []).map(formatCond),
        })),
        groupsMatch,
        page,
        limit,
        search,
        status: statusFilter,
      };

      const res = await api.post('/api/segments/preview', payload);
      setCustomers(res.customers || res.data || []);
      setTotal(res.pagination?.total ?? res.count ?? 0);
      setPages(res.pagination?.pages ?? 1);
      setActiveCount(res.activeCount ?? 0);
    } catch (err: any) {
      showToast('Preview Error', err.message || 'Failed to load preview customers', 'warning');
    } finally {
      setLoading(false);
    }
  }, [groups, groupsMatch, page, limit, search, statusFilter, showToast]);

  useEffect(() => {
    fetchPreviewCustomers();
  }, [page, limit, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchPreviewCustomers();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const activePct = total > 0 ? Math.round((activeCount / total) * 100) : 0;
  const startRecord = total > 0 ? (page - 1) * limit + 1 : 0;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className="seg-panel-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="seg-panel-card" style={{ maxWidth: 960 }}>
        {/* Header Banner */}
        <div className="seg-panel-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="badge badge-primary" style={{ fontSize: 10, fontWeight: 700 }}>
                FULL AUDIENCE PREVIEW
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {groups.reduce((acc, g) => acc + (g.conditions || []).length, 0)} Rule Conditions
              </span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--text)' }}>
              Matching Segment Customers
            </h2>
          </div>

          <button
            type="button"
            className="action-icon-btn"
            onClick={onClose}
            title="Close preview"
            style={{ width: 36, height: 36 }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Panel Content */}
        <div className="seg-panel-body">
          {/* Large Summary Highlight Banner */}
          <div className="preview-threshold-banner">
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary-dark)', display: 'block', marginBottom: 2 }}>
                SEGMENT AUDIENCE MATCH
              </span>
              <div className="preview-badge-count">
                {total.toLocaleString()} Customers Match These Rules
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Server-side paginated preview for high-volume datasets (scales to 100,000+ records).
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 18px', textAlign: 'center', minWidth: 160 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--success)', display: 'block' }}>
                {activeCount.toLocaleString()} ({activePct}%)
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Active Deliverable
              </span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="toolbar" style={{ margin: 0, padding: '12px 16px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <div className="search-wrap" style={{ flex: 1, maxWidth: 360 }}>
              <Search style={{ width: 14, height: 14 }} />
              <input
                type="text"
                className="search-input"
                placeholder="Search matching preview by name, email, phone…"
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
                  style={{ width: 140 }}
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
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Page size:</span>
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
                title="Refresh preview"
                onClick={fetchPreviewCustomers}
              >
                <RefreshCw style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>

          {/* Data Table Container */}
          <div className="seg-table-container">
            <div className="seg-table-scroll">
              <table className="data-table" style={{ width: '100%', minWidth: 680 }}>
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>Customer Name</th>
                    <th style={{ width: '30%' }}>Email Address</th>
                    <th style={{ width: '20%' }}>Phone Number</th>
                    <th style={{ width: '20%' }}>Email Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={`prev-skel-${idx}`} className="skeleton-row">
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="skeleton-box" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                            <div className="skeleton-box" style={{ width: 130, height: 14 }} />
                          </div>
                        </td>
                        <td><div className="skeleton-box" style={{ width: 150, height: 14 }} /></td>
                        <td><div className="skeleton-box" style={{ width: 110, height: 14 }} /></td>
                        <td><div className="skeleton-box" style={{ width: 70, height: 18, borderRadius: 999 }} /></td>
                      </tr>
                    ))
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: 40 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <Users style={{ width: 24, height: 24, color: 'var(--text-muted)' }} />
                          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                            No matching customers found
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                            {search || statusFilter ? 'Try adjusting your search or status filter.' : 'Zero customers match the current segment rules.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
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
                        <tr key={c._id || `prevcust-${idx}`}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div className="cust-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{initial}</div>
                              <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                                {c.name || 'Unknown Contact'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12.5 }}>
                              <Mail style={{ width: 13, height: 13 }} />
                              {c.email || '—'}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12.5 }}>
                              <Phone style={{ width: 13, height: 13 }} />
                              {c.phoneNo || '—'}
                            </div>
                          </td>
                          <td>
                            <span className={`status-pill ${statusClass}`}>
                              {c.emailStatus || 'active'}
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

        {/* Sticky Action Footer */}
        <div className="seg-panel-footer">
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Showing <strong>{startRecord}</strong> to <strong>{endRecord}</strong> of <strong>{total.toLocaleString()}</strong> preview records
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Pagination Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 12 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft style={{ width: 14, height: 14 }} />
              </button>
              <span style={{ fontSize: 12, padding: '0 4px', fontWeight: 600 }}>
                {page} / {pages}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={page >= pages || loading}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight style={{ width: 14, height: 14 }} />
              </button>
            </div>

            {/* Action Buttons */}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <Edit3 style={{ width: 14, height: 14 }} /> Edit Rules
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                onSave();
                onClose();
              }}
            >
              {isEditing ? 'Update Segment' : 'Create Segment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
