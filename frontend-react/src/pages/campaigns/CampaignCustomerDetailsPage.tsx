import React, { useState, useMemo } from 'react';
import { Download, Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useCampaignDetail } from './CampaignDetailsLayout';

type Status = 'all' | 'sent' | 'delivered' | 'read' | 'failed' | 'pending';

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  sent:      { bg: '#DBEAFE', color: '#2563EB' },
  delivered: { bg: '#DCFCE7', color: '#15803D' },
  read:      { bg: '#F1F5F9', color: '#475569' },
  failed:    { bg: '#FEF2F2', color: '#991B1B' },
  pending:   { bg: '#FEF3C7', color: '#B45309' },
};

export const CampaignCustomerDetailsPage: React.FC = () => {
  const { recipients, loading } = useCampaignDetail();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status>('all');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filteredAndSorted = useMemo(() => {
    let list = [...recipients];
    if (statusFilter !== 'all') list = list.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) =>
        r.name?.toLowerCase().includes(q) ||
        r.phone?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.messageId?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const aVal = (a[sortField] || '').toString().toLowerCase();
      const bVal = (b[sortField] || '').toString().toLowerCase();
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    return list;
  }, [recipients, statusFilter, search, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paginated = filteredAndSorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
    setPage(1);
  };

  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Status', 'Sent Time', 'Delivered Time', 'Read Time', 'Failed Time', 'Failure Reason', 'Message ID'];
    const rows = filteredAndSorted.map((r) => [
      `"${r.name}"`, `"${r.phone}"`, `"${r.email}"`, `"${r.status}"`,
      `"${r.sentTime}"`, `"${r.deliveredTime}"`, `"${r.readTime}"`, `"${r.failedTime}"`,
      `"${r.failureReason || ''}"`, `"${r.messageId}"`,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = 'campaign_details.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported', `${filteredAndSorted.length} records downloaded`, 'success');
  };

  const statusCounts: Record<Status, number> = useMemo(() => ({
    all: recipients.length,
    sent: recipients.filter((r) => r.status === 'sent').length,
    delivered: recipients.filter((r) => r.status === 'delivered').length,
    read: recipients.filter((r) => r.status === 'read').length,
    failed: recipients.filter((r) => r.status === 'failed').length,
    pending: recipients.filter((r) => r.status === 'pending').length,
  }), [recipients]);

  const thStyle: React.CSSProperties = {
    padding: '10px 14px', textAlign: 'left', fontSize: 11.5, fontWeight: 700,
    color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em',
    background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap', cursor: 'pointer',
  };
  const tdStyle: React.CSSProperties = {
    padding: '12px 14px', fontSize: 13, color: '#334155', borderBottom: '1px solid #F1F5F9',
    whiteSpace: 'nowrap',
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #2563EB', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px auto', animation: 'spin 0.8s linear infinite' }} />
        <p>Loading customer details…</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Customer Delivery Log</h3>
          <p style={{ fontSize: 12.5, color: '#64748B', margin: '2px 0 0' }}>Showing {filteredAndSorted.length} contacts</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search style={{ width: 14, height: 14, color: '#94A3B8', position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name, phone, email…"
              className="property-input"
              style={{ paddingLeft: 30, height: 36, fontSize: 12.5, borderRadius: 8, width: 220 }}
            />
          </div>
          <button type="button" className="btn btn-secondary" onClick={exportCSV} style={{ borderRadius: 8, fontSize: 12.5, height: 36, gap: 6 }}>
            <Download style={{ width: 13, height: 13 }} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '12px 20px', borderBottom: '1px solid #E2E8F0', overflowX: 'auto' }}>
        {(['all', 'sent', 'delivered', 'read', 'failed', 'pending'] as Status[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setStatusFilter(s); setPage(1); }}
            style={{
              padding: '5px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              border: statusFilter === s ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
              background: statusFilter === s ? '#EFF6FF' : '#FFFFFF',
              color: statusFilter === s ? '#1E40AF' : '#64748B',
              whiteSpace: 'nowrap',
              transition: 'all 0.12s ease',
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)} ({statusCounts[s]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr>
              {[
                { label: 'Customer', field: 'name' },
                { label: 'Phone', field: 'phone' },
                { label: 'Email', field: 'email' },
                { label: 'Status', field: 'status' },
                { label: 'Sent', field: 'sentTime' },
                { label: 'Delivered', field: 'deliveredTime' },
                { label: 'Read', field: 'readTime' },
                { label: 'Failed', field: 'failedTime' },
                { label: 'Failure Reason', field: 'failureReason' },
                { label: 'Message ID', field: 'messageId' },
              ].map(({ label, field }) => (
                <th key={field} style={thStyle} onClick={() => toggleSort(field)}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {label} <ArrowUpDown style={{ width: 11, height: 11, color: sortField === field ? '#2563EB' : '#CBD5E1' }} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ ...tdStyle, textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
                  No records found for the selected filter
                </td>
              </tr>
            ) : paginated.map((r) => (
              <tr key={r.id} style={{ transition: 'background 0.1s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '')}
              >
                <td style={tdStyle}><strong style={{ color: '#0F172A' }}>{r.name}</strong></td>
                <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 12 }}>{r.phone}</td>
                <td style={{ ...tdStyle, color: '#2563EB', fontSize: 12 }}>{r.email}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    background: STATUS_STYLES[r.status]?.bg ?? '#F1F5F9',
                    color: STATUS_STYLES[r.status]?.color ?? '#475569',
                  }}>
                    {r.status}
                  </span>
                </td>
                <td style={{ ...tdStyle, color: '#64748B' }}>{r.sentTime}</td>
                <td style={{ ...tdStyle, color: '#64748B' }}>{r.deliveredTime}</td>
                <td style={{ ...tdStyle, color: '#64748B' }}>{r.readTime}</td>
                <td style={{ ...tdStyle, color: '#64748B' }}>{r.failedTime}</td>
                <td style={{ ...tdStyle, color: r.failureReason ? '#EF4444' : '#94A3B8', fontSize: 12 }}>
                  {r.failureReason || '—'}
                </td>
                <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 11, color: '#94A3B8', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.messageId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredAndSorted.length > pageSize && (
        <div style={{ padding: '12px 20px', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 12.5, color: '#64748B' }}>
            Showing <strong>{(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filteredAndSorted.length)}</strong> of <strong>{filteredAndSorted.length}</strong>
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" className="btn btn-secondary" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} style={{ width: 34, height: 34, padding: 0, borderRadius: 8 }}>
              <ChevronLeft style={{ width: 14, height: 14 }} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(safePage - 2, totalPages - 4)) + i;
              return p <= totalPages ? (
                <button key={p} type="button" onClick={() => setPage(p)}
                  style={{ width: 34, height: 34, borderRadius: 8, fontSize: 12.5, fontWeight: p === safePage ? 700 : 500, border: p === safePage ? 'none' : '1px solid #E2E8F0', background: p === safePage ? '#2563EB' : '#FFFFFF', color: p === safePage ? '#FFFFFF' : '#475569', cursor: 'pointer' }}>
                  {p}
                </button>
              ) : null;
            })}
            <button type="button" className="btn btn-secondary" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)} style={{ width: 34, height: 34, padding: 0, borderRadius: 8 }}>
              <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignCustomerDetailsPage;
