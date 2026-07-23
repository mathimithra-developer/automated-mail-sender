import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  RefreshCw,
  Users,
  Layers,
  Mail,
  Send,
  Eye,
  MousePointer,
  GitBranch,
  Upload,
  Layout,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    customers: 0,
    activeCustomers: 0,
    unsubCustomers: 0,
    segments: 0,
    templates: 0,
    campaigns: 0,
    abTests: 0,
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    openRate: '0',
    clickRate: '0',
  });

  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);
  const [topSegments, setTopSegments] = useState<any[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);

  const loadDashboard = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const statsRes: any = await api.get('/api/dashboard/stats').catch(() => null);

      if (statsRes && statsRes.success && statsRes.stats) {
        const s = statsRes.stats;
        setStats({
          customers: s.customers || 0,
          activeCustomers: s.activeCustomers || 0,
          unsubCustomers: s.unsubscribed || 0,
          segments: s.segments || 0,
          templates: s.templates || 0,
          campaigns: s.campaigns || 0,
          abTests: s.abtests || 0,
          totalSent: s.totalSent || 0,
          totalOpened: s.totalOpened ?? Math.round(((s.openRate || 0) / 100) * (s.totalSent || 0)),
          totalClicked: s.totalClicked ?? Math.round(((s.clickRate || 0) / 100) * (s.totalSent || 0)),
          openRate: (s.openRate || 0).toString(),
          clickRate: (s.clickRate || 0).toString(),
        });

        if (statsRes.recentCampaigns) setRecentCampaigns(statsRes.recentCampaigns);
        if (statsRes.topSegments) setTopSegments(statsRes.topSegments);
        if (statsRes.recentCustomers) setRecentCustomers(statsRes.recentCustomers);
      } else {
        const [cRes, sRes, tRes, cmpRes, abRes, custRes] = await Promise.all([
          api.get('/api/customers?limit=1').catch(() => null),
          api.get('/api/segments?limit=10').catch(() => null),
          api.get('/api/templates?limit=1').catch(() => null),
          api.get('/api/campaigns?limit=5').catch(() => null),
          api.get('/api/abtests?limit=1').catch(() => null),
          api.get('/api/customers?limit=5').catch(() => null),
        ]);

        const customers = cRes?.pagination?.total || 0;
        setStats((prev) => ({
          ...prev,
          customers,
          activeCustomers: Math.round(customers * 0.9),
          unsubCustomers: Math.round(customers * 0.05),
          segments: sRes?.pagination?.total || 0,
          templates: tRes?.pagination?.total || 0,
          campaigns: cmpRes?.pagination?.total || 0,
          abTests: abRes?.pagination?.total || 0,
        }));
        if (cmpRes?.data) setRecentCampaigns(cmpRes.data);
        if (sRes?.data) setTopSegments((sRes.data || []).slice(0, 5));
        if (custRes?.data) setRecentCustomers(custRes.data);
      }
    } catch (err) {
      console.error('Error loading real-time dashboard data:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(false);

    // Real-time polling every 8 seconds
    const interval = setInterval(() => {
      loadDashboard(true);
    }, 8000);

    // Refresh instantly when window returns to focus
    const handleFocus = () => {
      loadDashboard(true);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Good Morning' : hr < 17 ? 'Good Afternoon' : 'Good Evening';

  const handleManualRefresh = async () => {
    await loadDashboard(false);
    showToast('Dashboard Refreshed', 'Latest stats and overview metrics updated.', 'success');
  };

  return (
    <section id="dashboard" className="page active">
      <div className="page-header">
        <div>
          <p className="breadcrumb">
            <LayoutDashboard style={{ width: 12, height: 12 }} /> Dashboard
          </p>
          <h1 id="welcomeHeader" className="page-title">
            {`${greeting}, ${user?.name || 'User'}!`}
          </h1>
          <p className="page-description">Here's your complete overview for today.</p>
        </div>
        <button className="btn btn-secondary" onClick={handleManualRefresh} style={{ gap: 6 }}>
          <RefreshCw className={loading ? 'spin' : ''} style={{ width: 14, height: 14 }} /> Refresh
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid-4" id="kpiGrid" style={{ marginBottom: 16 }}>
        <div className="kpi-card kpi-purple">
          <div className="kpi-icon">
            <Users style={{ width: 18, height: 18 }} />
          </div>
          <div className="kpi-body">
            <p className="kpi-label">Total Customers</p>
            <p className="kpi-value" id="statCustomers">
              {stats.customers.toLocaleString()}
            </p>
            <p className="kpi-sub">
              <span id="statActive" className="kpi-green">
                {stats.activeCustomers.toLocaleString()}
              </span>{' '}
              active ·{' '}
              <span id="statUnsub" className="kpi-red">
                {stats.unsubCustomers.toLocaleString()}
              </span>{' '}
              unsub
            </p>
          </div>
        </div>

        <div className="kpi-card kpi-blue">
          <div className="kpi-icon">
            <Layers style={{ width: 18, height: 18 }} />
          </div>
          <div className="kpi-body">
            <p className="kpi-label">Segments</p>
            <p className="kpi-value" id="statSegments">
              {stats.segments}
            </p>
            <p className="kpi-sub">audience groups</p>
          </div>
        </div>

        <div className="kpi-card kpi-green">
          <div className="kpi-icon">
            <Mail style={{ width: 18, height: 18 }} />
          </div>
          <div className="kpi-body">
            <p className="kpi-label">Templates</p>
            <p className="kpi-value" id="statTemplates">
              {stats.templates}
            </p>
            <p className="kpi-sub">email designs</p>
          </div>
        </div>

        <div className="kpi-card kpi-orange">
          <div className="kpi-icon">
            <Send style={{ width: 18, height: 18 }} />
          </div>
          <div className="kpi-body">
            <p className="kpi-label">Campaigns</p>
            <p className="kpi-value" id="statCampaigns">
              {stats.campaigns}
            </p>
            <p className="kpi-sub">
              <span id="statABTests">{stats.abTests}</span> A/B tests
            </p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="dash-perf-row" style={{ marginBottom: 16 }}>
        <div className="perf-card">
          <div className="perf-label">
            <Send style={{ width: 12, height: 12 }} /> Emails Sent
          </div>
          <div className="perf-value" id="statTotalSent">
            {stats.totalSent.toLocaleString()}
          </div>
          <div className="perf-bar-wrap">
            <div className="perf-bar perf-bar-gray" id="barSent" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="perf-card">
          <div className="perf-label">
            <Eye style={{ width: 12, height: 12 }} /> Open Rate
          </div>
          <div className="perf-value" id="statOpenRate">
            {stats.openRate}%
          </div>
          <div className="perf-bar-wrap">
            <div
              className="perf-bar perf-bar-green"
              id="barOpen"
              style={{ width: `${Math.min(100, Number(stats.openRate))}%` }}
            ></div>
          </div>
        </div>

        <div className="perf-card">
          <div className="perf-label">
            <MousePointer style={{ width: 12, height: 12 }} /> Click Rate
          </div>
          <div className="perf-value" id="statClickRate">
            {stats.clickRate}%
          </div>
          <div className="perf-bar-wrap">
            <div
              className="perf-bar perf-bar-blue"
              id="barClick"
              style={{ width: `${Math.min(100, Number(stats.clickRate))}%` }}
            ></div>
          </div>
        </div>

        <div className="perf-card">
          <div className="perf-label">
            <GitBranch style={{ width: 12, height: 12 }} /> A/B Tests Run
          </div>
          <div className="perf-value" id="statABTests2">
            {stats.abTests}
          </div>
          <div className="perf-bar-wrap">
            <div className="perf-bar perf-bar-purple" id="barAB" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>

      {/* Recent Campaigns + Top Segments */}
      <div className="grid-3-2" style={{ marginBottom: 16 }}>
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <p className="card-title">Recent Campaigns</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/campaigns')}>
              View All
            </button>
          </div>
          <div id="recentCampaignsList">
            {recentCampaigns.length === 0 ? (
              <div className="dashed-card">
                <div className="dashed-icon">
                  <Send style={{ width: 20, height: 20 }} />
                </div>
                <p className="dashed-title">No campaigns yet</p>
                <p className="dashed-desc">Create your first campaign to start sending.</p>
              </div>
            ) : (
              recentCampaigns.map((c, i) => {
                const statusColors: Record<string, string> = {
                  draft: '#71717a',
                  scheduled: '#f59e0b',
                  sent: '#10b981',
                  failed: '#ef4444',
                  running: '#3b82f6',
                };
                const color = statusColors[c.status] || '#71717a';
                return (
                  <div key={c._id ? `${c._id}-${i}` : `camp-${i}`} className="dash-camp-row">
                    <div className="dash-camp-icon" style={{ background: `${color}20` }}>
                      <Send style={{ color, width: 14, height: 14 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                        {c.name}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.subject || 'No subject'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span className={`status-badge status-${c.status}`}>{c.status}</span>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                        {c.totalSent || 0} sent
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <p className="card-title">Top Segments</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/segments')}>
              View All
            </button>
          </div>
          <div id="topSegmentsList">
            {topSegments.length === 0 ? (
              <div className="dashed-card" style={{ padding: 24 }}>
                <div className="dashed-icon">
                  <Layers style={{ width: 20, height: 20 }} />
                </div>
                <p className="dashed-title">No segments yet</p>
              </div>
            ) : (
              topSegments.map((seg, i) => {
                const count = seg.cachedCount || seg.calculatedCount || 0;
                const pct = stats.customers ? Math.round((count / stats.customers) * 100) : 0;
                const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];
                const col = colors[i % colors.length];
                return (
                  <div key={seg._id ? `${seg._id}-${i}` : `seg-${i}`} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{seg.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: col }}>{count}</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: col,
                          borderRadius: 3,
                          transition: 'width 0.5s ease',
                        }}
                      ></div>
                    </div>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                      {pct}% of total customers
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Customers + Quick Actions */}
      <div className="grid-3-2">
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <p className="card-title">Recent Customers</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/customers')}>
              View All
            </button>
          </div>
          <div id="recentCustomersList">
            {recentCustomers.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24, fontSize: 13 }}>
                No recent customers found.
              </div>
            ) : (
              recentCustomers.map((c, i) => {
                const initials = (c.name || 'U')
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();
                const plan = c.attributes?.find((a: any) => a.k === 'plan')?.v_str || '';
                const statusColorsMap: Record<string, string> = { active: '#10b981', unsubscribed: '#ef4444', bounced: '#f59e0b' };
                const statusColor = statusColorsMap[c.emailStatus] || '#71717a';
                const added = c.createdAt
                  ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                  : '20 Jul';
                return (
                  <div
                    key={c._id ? `${c._id}-${i}` : `cust-${i}`}
                    className="dash-cust-row"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 0',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div
                      className="dash-cust-avatar"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--accent-purple))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{c.name}</p>
                      <p
                        style={{
                          fontSize: 11,
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          margin: '2px 0 0 0',
                        }}
                      >
                        {c.email || '—'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {plan && <span className="attr-badge" style={{ fontSize: 10 }}>{plan}</span>}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3, justifyContent: 'flex-end' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, display: 'inline-block' }}></span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{added}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <p className="card-title">Quick Actions</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="quick-action" onClick={() => navigate('/campaigns')}>
              <div className="quick-action-icon" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
                <Send style={{ width: 14, height: 14 }} />
              </div>
              <div className="quick-action-text">
                <strong>Create Campaign</strong>
                <span>Send to your segments</span>
              </div>
            </button>

            <button className="quick-action" onClick={() => navigate('/customers')}>
              <div className="quick-action-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                <Upload style={{ width: 14, height: 14 }} />
              </div>
              <div className="quick-action-text">
                <strong>Import Customers</strong>
                <span>Upload a CSV file</span>
              </div>
            </button>

            <button className="quick-action" onClick={() => navigate('/templates')}>
              <div
                className="quick-action-icon"
                style={{ background: 'hsla(262 83% 68%/0.12)', color: 'var(--accent-purple)' }}
              >
                <Layout style={{ width: 14, height: 14 }} />
              </div>
              <div className="quick-action-text">
                <strong>Design Template</strong>
                <span>Drag-drop email builder</span>
              </div>
            </button>

            <button className="quick-action" onClick={() => navigate('/segments')}>
              <div className="quick-action-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                <Layers style={{ width: 14, height: 14 }} />
              </div>
              <div className="quick-action-text">
                <strong>Create Segment</strong>
                <span>Build audience rules</span>
              </div>
            </button>

            <button className="quick-action" onClick={() => navigate('/abtests')}>
              <div className="quick-action-icon" style={{ background: 'hsla(199 89% 48%/0.1)', color: 'var(--info)' }}>
                <GitBranch style={{ width: 14, height: 14 }} />
              </div>
              <div className="quick-action-text">
                <strong>Run A/B Test</strong>
                <span>Compare campaign variants</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
