import React, { useState, useEffect } from 'react';
import { GitBranch, Plus, X, Trash2, Trophy } from 'lucide-react';
import { ABTest, Campaign } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export const ABTestsPage: React.FC = () => {
  const { showToast } = useToast();

  const [abTests, setAbTests] = useState<ABTest[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [campaignA, setCampaignA] = useState('');
  const [campaignB, setCampaignB] = useState('');
  const [splitPercent, setSplitPercent] = useState(50);
  const [winnerMetric, setWinnerMetric] = useState<'open_rate' | 'click_rate'>('open_rate');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [abRes, campRes] = await Promise.all([
        api.get('/api/abtests'),
        api.get('/api/campaigns?all=true'),
      ]);
      setAbTests(abRes.data || []);
      setCampaigns(campRes.data || []);
    } catch (err: any) {
      showToast('Error loading A/B tests', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setName('');
    setCampaignA('');
    setCampaignB('');
    setSplitPercent(50);
    setWinnerMetric('open_rate');
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { showToast('Required', 'Test name is required', 'warning'); return; }
    if (!campaignA || !campaignB) { showToast('Required', 'Select both Variant A and B campaigns', 'warning'); return; }
    if (campaignA === campaignB) { showToast('Invalid', 'Variant A and B must be different campaigns', 'warning'); return; }

    setSubmitting(true);
    try {
      await api.post('/api/abtests', { name: name.trim(), campaignA, campaignB, splitPercent, winnerMetric });
      showToast('Created', 'A/B test started successfully', 'success');
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err: any) {
      showToast('Error creating A/B test', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTest = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/api/abtests/${deleteConfirmId}`);
      showToast('Deleted', 'A/B test removed successfully', 'success');
      loadData();
    } catch (err: any) {
      showToast('Error deleting A/B test', err.message, 'error');
    }
  };

  const formatMetricLabel = (metric?: string) => {
    if (metric === 'click_rate') return 'Click Rate';
    return 'Open Rate';
  };

  const getVariantRateNumeric = (test: any, variant: 'A' | 'B') => {
    const camp = variant === 'A' ? test.campaignA : test.campaignB;
    const stats = camp?.stats || {};
    const metric = test.winnerMetric || 'open_rate';
    if (!stats.sent) return 0;
    if (metric === 'click_rate') {
      return (stats.uniqueClicks || 0) / stats.sent * 100;
    }
    return (stats.uniqueOpens || 0) / stats.sent * 100;
  };

  const getVariantDisplayValue = (test: any, variant: 'A' | 'B') => {
    const camp = variant === 'A' ? test.campaignA : test.campaignB;
    const stats = camp?.stats || {};
    const metric = test.winnerMetric || 'open_rate';
    if (!stats.sent) return '0.0%';
    const val = getVariantRateNumeric(test, variant);
    return `${val.toFixed(1)}%`;
  };

  return (
    <section className="page active" id="abtests">
      <div className="page-header">
        <div>
          <p className="breadcrumb"><GitBranch style={{ width: 12, height: 12 }} /> A/B Tests</p>
          <h1 className="page-title">A/B Tests</h1>
          <p className="page-description">Compare two campaign variants and pick a winner.</p>
        </div>
        <button className="btn" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus style={{ width: 14, height: 14 }} /> New A/B Test
        </button>
      </div>

      <div id="abTestsList" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>Loading A/B tests...</div>
        ) : abTests.length === 0 ? (
          <div className="dashed-card">
            <div className="dashed-icon"><GitBranch style={{ width: 20, height: 20 }} /></div>
            <p className="dashed-title">No A/B tests running</p>
            <p className="dashed-desc">Set up a split test to compare two existing campaigns.</p>
          </div>
        ) : (
          abTests.map((test: any, idx: number) => {
            const campAName = test.campaignA?.name || '—';
            const campBName = test.campaignB?.name || '—';
            const numA = getVariantRateNumeric(test, 'A');
            const numB = getVariantRateNumeric(test, 'B');
            const isWinnerA = numA >= numB;
            const metricLabel = formatMetricLabel(test.winnerMetric);

            return (
              <div key={test._id ? `${test._id}-${idx}` : `abtest-${idx}`} className="abtest-item">
                <div className="abtest-item-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong className="abtest-item-name">{test.name}</strong>
                      <span className="badge badge-purple">
                        {test.status === 'completed' ? `COMPLETED — WINNER: ${test.winner || 'A'}` : (test.status || 'RUNNING').toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                      Split: {test.splitPercent || 50}% / {100 - (test.splitPercent || 50)}% · Metric: {metricLabel}
                    </div>
                  </div>
                  <button
                    className="action-icon-btn btn-delete"
                    title="Delete test"
                    onClick={() => setDeleteConfirmId(test._id)}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>

                <div className="abtest-variants-grid">
                  <div className={`abtest-variant-box ${isWinnerA ? 'winner' : ''}`}>
                    <div className="abtest-variant-lbl">
                      Variant A {isWinnerA && test.status === 'completed' && <Trophy style={{ width: 11, height: 11, display: 'inline', marginLeft: 4 }} />}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{campAName}</div>
                    <div className="abtest-variant-val">{getVariantDisplayValue(test, 'A')}</div>
                    <div className="abtest-variant-sub">{metricLabel}</div>
                  </div>

                  <div className={`abtest-variant-box ${!isWinnerA ? 'winner' : ''}`}>
                    <div className="abtest-variant-lbl">
                      Variant B {!isWinnerA && test.status === 'completed' && <Trophy style={{ width: 11, height: 11, display: 'inline', marginLeft: 4 }} />}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{campBName}</div>
                    <div className="abtest-variant-val">{getVariantDisplayValue(test, 'B')}</div>
                    <div className="abtest-variant-sub">{metricLabel}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create A/B Test Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">New A/B Test</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <form onSubmit={handleCreateTest}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {campaigns.length < 2 && (
                  <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#92400e' }}>
                    ⚠️ You need at least 2 campaigns to run an A/B test. Create campaigns first.
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Test Name *</label>
                  <input
                    type="text" className="property-input" required
                    placeholder="e.g., Subject Line Comparison"
                    value={name} onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Variant A — Campaign *</label>
                    <select className="property-select" required value={campaignA} onChange={(e) => setCampaignA(e.target.value)}>
                      <option value="">Select Campaign A...</option>
                      {campaigns.filter((c) => c._id !== campaignB).map((c, idx) => (
                        <option key={c._id ? `${c._id}-${idx}` : `optA-${idx}`} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Variant B — Campaign *</label>
                    <select className="property-select" required value={campaignB} onChange={(e) => setCampaignB(e.target.value)}>
                      <option value="">Select Campaign B...</option>
                      {campaigns.filter((c) => c._id !== campaignA).map((c, idx) => (
                        <option key={c._id ? `${c._id}-${idx}` : `optB-${idx}`} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Split % (Variant A)</label>
                    <input type="number" className="property-input" min={10} max={90}
                      value={splitPercent} onChange={(e) => setSplitPercent(Number(e.target.value))} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, display: 'block' }}>
                      Variant B gets {100 - splitPercent}%
                    </span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Winner Metric</label>
                    <select className="property-select" value={winnerMetric} onChange={(e) => setWinnerMetric(e.target.value as any)}>
                      <option value="open_rate">Open Rate</option>
                      <option value="click_rate">Click Rate</option>
                    </select>
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn" disabled={submitting || campaigns.length < 2}>
                  {submitting ? 'Starting...' : 'Start A/B Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Professional Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        title="Delete A/B Test"
        message="Are you sure you want to permanently delete this A/B test? This action cannot be undone."
        confirmText="Delete Test"
        isDestructive={true}
        onConfirm={handleDeleteTest}
        onClose={() => setDeleteConfirmId(null)}
      />
    </section>
  );
};
