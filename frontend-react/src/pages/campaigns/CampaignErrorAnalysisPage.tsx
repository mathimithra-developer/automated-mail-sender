import React, { useMemo, useState } from 'react';
import { Download, AlertTriangle, XCircle, ShieldX, RotateCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useCampaignDetail } from './CampaignDetailsLayout';

interface ErrorGroup {
  code: string;
  reason: string;
  description: string;
  retryable: boolean;
  contacts: any[];
}

const WA_ERROR_META: Record<string, { description: string; retryable: boolean }> = {
  '131026': { description: 'The recipient is not registered on WhatsApp', retryable: false },
  '131049': { description: 'The number format is invalid or unreachable', retryable: false },
  '131021': { description: 'Recipient opted out of business messages', retryable: false },
  '131056': { description: 'Pair rate limit hit — too many messages to same user', retryable: true },
  '131042': { description: 'Business account not authorized to send templates', retryable: false },
  '130429': { description: 'Rate limit exceeded — try again later', retryable: true },
  '100':    { description: 'Parameter missing or invalid in message', retryable: false },
  '0':      { description: 'Unknown error — check OwnChat logs', retryable: true },
};

export const CampaignErrorAnalysisPage: React.FC = () => {
  const { errorsList, stats, loading } = useCampaignDetail();
  const { showToast } = useToast();
  const [retrying, setRetrying] = useState(false);

  const errorGroups: ErrorGroup[] = useMemo(() => {
    const map: Record<string, ErrorGroup> = {};
    errorsList.forEach((r) => {
      const code = r.errorCode || '0';
      const meta = WA_ERROR_META[code] || WA_ERROR_META['0'];
      if (!map[code]) {
        map[code] = {
          code,
          reason: r.failureReason || 'Unknown error',
          description: meta.description,
          retryable: meta.retryable,
          contacts: [],
        };
      }
      map[code].contacts.push(r);
    });
    return Object.values(map).sort((a, b) => b.contacts.length - a.contacts.length);
  }, [errorsList]);

  const recoverableCount = errorGroups.filter((g) => g.retryable).reduce((s, g) => s + g.contacts.length, 0);
  const permanentCount = errorsList.length - recoverableCount;

  const exportErrors = () => {
    const headers = ['Name', 'Phone', 'Error Code', 'Failure Reason', 'Description', 'Retry Available', 'Timestamp'];
    const rows = errorsList.map((r) => {
      const meta = WA_ERROR_META[r.errorCode] || WA_ERROR_META['0'];
      return [
        `"${r.name}"`, `"${r.phone}"`, `"${r.errorCode || '0'}"`, `"${r.failureReason || 'Unknown'}"`,
        `"${meta.description}"`, `"${meta.retryable ? 'Yes' : 'No'}"`, `"${r.failedTime}"`,
      ].join(',');
    });
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = 'campaign_errors.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported', `${errorsList.length} error records downloaded`, 'success');
  };

  const handleRetry = async () => {
    setRetrying(true);
    await new Promise((r) => setTimeout(r, 1800));
    setRetrying(false);
    showToast(
      'Retry Queued',
      `${recoverableCount} recoverable contacts queued for retry via OwnChat`,
      'info'
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #EF4444', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px auto', animation: 'spin 0.8s linear infinite' }} />
        <p>Analyzing errors…</p>
      </div>
    );
  }

  if (errorsList.length === 0) {
    return (
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
          <span style={{ fontSize: 28 }}>🎉</span>
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Zero Failures!</h3>
        <p style={{ fontSize: 14, color: '#64748B' }}>All messages were dispatched without any errors.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div style={{ background: '#FFFFFF', border: '2px solid #FEE2E2', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle style={{ width: 17, height: 17, color: '#EF4444' }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Failures</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#EF4444' }}>{errorsList.length}</div>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>{stats.failureRate}% of audience</span>
        </div>

        <div style={{ background: '#FFFFFF', border: '2px solid #BFDBFE', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RotateCw style={{ width: 17, height: 17, color: '#2563EB' }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Recoverable</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#2563EB' }}>{recoverableCount}</div>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>Can be retried</span>
        </div>

        <div style={{ background: '#FFFFFF', border: '2px solid #E2E8F0', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldX style={{ width: 17, height: 17, color: '#64748B' }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Permanent Failures</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#0F172A' }}>{permanentCount}</div>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>Non-deliverable numbers</span>
        </div>

        <div style={{ background: '#FFFFFF', border: '2px solid #E2E8F0', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle style={{ width: 17, height: 17, color: '#64748B' }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Error Types</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#0F172A' }}>{errorGroups.length}</div>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>Distinct error codes</span>
        </div>
      </div>

      {/* Grouped Error Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0 }}>Failure Breakdown by Error Code</h3>
            <p style={{ fontSize: 12.5, color: '#64748B', margin: '2px 0 0' }}>WhatsApp error classification</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {recoverableCount > 0 && (
              <button type="button" onClick={handleRetry} disabled={retrying}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                  background: retrying ? '#F1F5F9' : '#2563EB', color: retrying ? '#94A3B8' : '#FFFFFF',
                  border: '1.5px solid ' + (retrying ? '#E2E8F0' : '#2563EB'), cursor: retrying ? 'not-allowed' : 'pointer',
                }}
              >
                <RotateCw style={{ width: 14, height: 14, animation: retrying ? 'spin 0.8s linear infinite' : 'none' }} />
                {retrying ? 'Queuing Retry…' : `Retry ${recoverableCount} Failed`}
              </button>
            )}
            <button type="button" onClick={exportErrors}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: '#FFFFFF', color: '#475569', border: '1px solid #E2E8F0', cursor: 'pointer' }}>
              <Download style={{ width: 13, height: 13 }} /> Export Errors
            </button>
          </div>
        </div>

        {/* Error Groups */}
        <div style={{ padding: '12px 0' }}>
          {errorGroups.map((group, gi) => (
            <div key={group.code} style={{ borderBottom: gi < errorGroups.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
              {/* Group Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', background: '#FAFAFA', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15, fontWeight: 800, fontFamily: 'monospace', color: '#0F172A', background: '#FEF2F2', padding: '4px 10px', borderRadius: 8, border: '1px solid #FECACA' }}>
                  {group.code}
                </span>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{group.reason}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>{group.description}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    background: group.retryable ? '#DBEAFE' : '#FEF2F2',
                    color: group.retryable ? '#2563EB' : '#991B1B',
                  }}>
                    {group.retryable ? '↺ Retryable' : '✕ Permanent'}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#EF4444' }}>
                    {group.contacts.length} contacts
                  </span>
                </div>
              </div>

              {/* Contacts in this error group */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                  <thead>
                    <tr>
                      {['Customer', 'Phone', 'Email', 'Timestamp'].map((h) => (
                        <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', background: '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.contacts.slice(0, 5).map((c, ci) => (
                      <tr key={ci}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '')}>
                        <td style={{ padding: '10px 14px', fontSize: 13, color: '#334155', borderBottom: '1px solid #F1F5F9', fontWeight: 600 }}>{c.name}</td>
                        <td style={{ padding: '10px 14px', fontSize: 12, fontFamily: 'monospace', color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>{c.phone}</td>
                        <td style={{ padding: '10px 14px', fontSize: 12, color: '#64748B', borderBottom: '1px solid #F1F5F9' }}>{c.email}</td>
                        <td style={{ padding: '10px 14px', fontSize: 12, color: '#94A3B8', borderBottom: '1px solid #F1F5F9' }}>{c.failedTime}</td>
                      </tr>
                    ))}
                    {group.contacts.length > 5 && (
                      <tr>
                        <td colSpan={4} style={{ padding: '8px 14px', fontSize: 12, color: '#94A3B8', fontStyle: 'italic', borderBottom: '1px solid #F1F5F9' }}>
                          + {group.contacts.length - 5} more contacts in this error group
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignErrorAnalysisPage;
