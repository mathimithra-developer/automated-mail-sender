import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useCampaignDetail } from './CampaignDetailsLayout';

type FilterType = 'sent' | 'delivered' | 'read' | 'failed';

const STATUS_CONFIG: Record<FilterType, { label: string; color: string; bg: string; border: string }> = {
  sent:      { label: 'Sent',      color: '#1D4ED8', bg: '#DBEAFE', border: '#BFDBFE' },
  delivered: { label: 'Delivered', color: '#15803D', bg: '#DCFCE7', border: '#BBF7D0' },
  read:      { label: 'Read',      color: '#5B21B6', bg: '#EDE9FE', border: '#DDD6FE' },
  failed:    { label: 'Failed',    color: '#991B1B', bg: '#FEF2F2', border: '#FECACA' },
};

export const CampaignFilteredListPage: React.FC = () => {
  const { id, filter } = useParams<{ id: string; filter: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { recipients, loading } = useCampaignDetail();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const filterType = (filter as FilterType) || 'sent';
  const config = STATUS_CONFIG[filterType] || STATUS_CONFIG.sent;

  const filtered = useMemo(() => {
    let list = recipients.filter((r) => r.status === filterType);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.phone?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [recipients, filterType, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Status', 'Time', 'Failure Reason'];
    const timeField = filterType === 'sent' ? 'sentTime' : filterType === 'delivered' ? 'deliveredTime' : filterType === 'read' ? 'readTime' : 'failedTime';
    const rows = filtered.map((r) =>
      [`"${r.name}"`, `"${r.phone}"`, `"${r.email}"`, `"${r.status}"`, `"${r[timeField]}"`, `"${r.failureReason || ''}"`].join(',')
    );
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `campaign_${filterType}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported', `${filtered.length} contacts downloaded`, 'success');
  };

  const tdStyle: React.CSSProperties = { padding: '11px 14px', fontSize: 13, color: '#334155', borderBottom: '1px solid #F1F5F9' };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Breadcrumb / Back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => navigate(`/campaigns/${id}/performance`)}
          className="btn btn-secondary"
          style={{ borderRadius: 9, fontSize: 12.5, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Performance
        </button>
        <span style={{ color: '#CBD5E1' }}>›</span>
        <span style={{
          padding: '4px 14px', borderRadius: 9999, fontSize: 12, fontWeight: 700,
          background: config.bg, color: config.color, border: `1px solid ${config.border}`,
        }}>
          {config.label} Contacts
        </span>
      </div>

      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
        {/* Header */}
        <div
          style={{
            padding: '16px 20px', borderBottom: '1px solid #E2E8F0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
            background: config.bg,
          }}
        >
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: config.color, margin: 0 }}>
              {config.label} Contacts — {filtered.length} records
            </h2>
            <p style={{ fontSize: 12.5, color: config.color, opacity: 0.8, margin: '2px 0 0' }}>
              Filtered view for contacts with status: <strong>{filterType}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ width: 13, height: 13, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search contacts…"
                className="property-input"
                style={{ paddingLeft: 28, height: 34, fontSize: 12.5, borderRadius: 8, width: 200 }}
              />
            </div>
            <button type="button" onClick={exportCSV}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, background: '#FFFFFF', color: config.color, border: `1px solid ${config.border}`, cursor: 'pointer' }}>
              <Download style={{ width: 13, height: 13 }} /> Export
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '50px 0', textAlign: 'center', color: '#64748B' }}>
            <div style={{ width: 30, height: 30, border: '3px solid ' + config.color, borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
            Loading…
          </div>
        ) : paginated.length === 0 ? (
          <div style={{ padding: '50px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>
              {filterType === 'failed' ? '❌' : filterType === 'read' ? '👁️' : filterType === 'delivered' ? '✅' : '📤'}
            </div>
            <h3 style={{ fontSize: 16, color: '#0F172A', marginBottom: 6 }}>No {config.label} Contacts</h3>
            <p style={{ fontSize: 13, color: '#64748B' }}>
              {search ? 'No results match your search.' : `No contacts with status "${filterType}" found.`}
            </p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>Customer</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>Phone</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>Email</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>Status</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>Time</th>
                    {filterType === 'failed' && <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>Failure Reason</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((r, i) => {
                    const timeField = filterType === 'sent' ? r.sentTime : filterType === 'delivered' ? r.deliveredTime : filterType === 'read' ? r.readTime : r.failedTime;
                    return (
                      <tr key={i}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                      >
                        <td style={tdStyle}><strong style={{ color: '#0F172A' }}>{r.name}</strong></td>
                        <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 12 }}>{r.phone}</td>
                        <td style={{ ...tdStyle, color: '#2563EB', fontSize: 12 }}>{r.email}</td>
                        <td style={tdStyle}>
                          <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', background: config.bg, color: config.color }}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, color: '#64748B' }}>{timeField}</td>
                        {filterType === 'failed' && <td style={{ ...tdStyle, color: '#EF4444', fontSize: 12 }}>{r.failureReason || '—'}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filtered.length > pageSize && (
              <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <span style={{ fontSize: 12.5, color: '#64748B' }}>
                  {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button type="button" className="btn btn-secondary" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} style={{ width: 34, height: 34, padding: 0, borderRadius: 8 }}>
                    <ChevronLeft style={{ width: 14, height: 14 }} />
                  </button>
                  <button type="button" className="btn btn-secondary" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)} style={{ width: 34, height: 34, padding: 0, borderRadius: 8 }}>
                    <ChevronRight style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CampaignFilteredListPage;
