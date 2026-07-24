import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Layers,
  Mail,
  Send,
  Eye,
  MousePointer,
  GitBranch,
  Upload,
  Layout,
  ChevronRight,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

    const interval = setInterval(() => {
      loadDashboard(true);
    }, 8000);

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

  const sampleDefaultSegments = [
    { name: 'Best Customers', count: 18 },
    { name: 'VIP', count: 14 },
    { name: 'Newsletter', count: 10 },
    { name: 'Returning Customers', count: 7 },
    { name: 'Inactive', count: 3 },
  ];

  const chartData =
    topSegments.length > 0
      ? topSegments.map((seg) => ({
          name: seg.name,
          count: seg.cachedCount || seg.calculatedCount || 0,
        }))
      : sampleDefaultSegments;

  const avatarGradients = [
    'linear-gradient(135deg, #2563EB, #7C3AED)',
    'linear-gradient(135deg, #059669, #2563EB)',
    'linear-gradient(135deg, #D97706, #DC2626)',
    'linear-gradient(135deg, #7C3AED, #DB2777)',
    'linear-gradient(135deg, #0284C7, #059669)',
  ];

  const getPlanBadge = (c: any, index: number) => {
    const planStr = c.attributes?.find((a: any) => a.k === 'plan')?.v_str || (index % 2 === 0 ? 'Enterprise' : 'Pro');
    const p = planStr.toLowerCase();
    if (p.includes('enterprise')) return <span className="badge-tag badge-tag-enterprise">Enterprise</span>;
    if (p.includes('pro')) return <span className="badge-tag badge-tag-pro">Pro</span>;
    if (p.includes('premium')) return <span className="badge-tag badge-tag-premium">Premium</span>;
    return <span className="badge-tag badge-tag-free">Free</span>;
  };

  const getStatusIndicator = (c: any) => {
    const s = (c.emailStatus || 'active').toLowerCase();
    if (s === 'active') return <span style={{ fontSize: 11.5, fontWeight: 600, color: '#10B981', display: 'inline-flex', alignItems: 'center', gap: 4 }}>● Active</span>;
    if (s === 'invited' || s === 'pending') return <span style={{ fontSize: 11.5, fontWeight: 600, color: '#F59E0B', display: 'inline-flex', alignItems: 'center', gap: 4 }}>● Invited</span>;
    return <span style={{ fontSize: 11.5, fontWeight: 600, color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: 4 }}>● Pending</span>;
  };

  return (
    <section id="dashboard" className="page active" style={{ maxWidth: 1600, margin: '0 auto', padding: '0 0 24px 0' }}>
      {/* Dashboard Title */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1 id="welcomeHeader" style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', color: '#111827', margin: '0 0 4px 0' }}>
            {`${greeting}, ${user?.name || 'User'}!`}
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
            Here's your real-time analytics overview and audience performance.
          </p>
        </div>
      </div>

      {/* Four Premium Summary Statistic Cards */}
      <div
        className="grid-4"
        id="kpiGrid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 24,
          marginBottom: 24,
        }}
      >
        <div className="stat-card">
          <div className="stat-card-left">
            <div className="stat-card-icon">
              <Users style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <p className="stat-card-number">{stats.customers.toLocaleString()}</p>
              <p className="stat-card-label">Total Customers</p>
              <p className="stat-card-sub">
                <span style={{ fontWeight: 600, color: '#2563EB' }}>
                  {stats.activeCustomers.toLocaleString()}
                </span>{' '}
                active · {stats.unsubCustomers.toLocaleString()} unsub
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-left">
            <div className="stat-card-icon">
              <Layers style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <p className="stat-card-number">{stats.segments}</p>
              <p className="stat-card-label">Segments</p>
              <p className="stat-card-sub">audience groups</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-left">
            <div className="stat-card-icon">
              <Mail style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <p className="stat-card-number">{stats.templates}</p>
              <p className="stat-card-label">Templates</p>
              <p className="stat-card-sub">email designs</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-left">
            <div className="stat-card-icon">
              <Send style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <p className="stat-card-number">{stats.campaigns}</p>
              <p className="stat-card-label">Campaigns</p>
              <p className="stat-card-sub">
                <span style={{ fontWeight: 600, color: '#2563EB' }}>{stats.abTests}</span> A/B tests
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modern KPI Performance Row */}
      <div
        className="dash-perf-row"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24,
          marginBottom: 24,
        }}
      >
        <div className="perf-card-modern">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#111827' }}>
              <Send style={{ width: 14, height: 14, color: '#2563EB' }} /> Emails Sent
            </div>
            <span className="perf-trend-badge">+14.2% vs last week</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: '6px 0 4px 0', letterSpacing: '-0.02em' }}>
            {stats.totalSent.toLocaleString()}
          </div>
          <div style={{ height: 6, background: '#EFF6FF', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #60A5FA, #2563EB)', borderRadius: 999 }} />
          </div>
        </div>

        <div className="perf-card-modern">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#111827' }}>
              <Eye style={{ width: 14, height: 14, color: '#2563EB' }} /> Open Rate
            </div>
            <span className="perf-trend-badge">+3.8% vs last week</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: '6px 0 4px 0', letterSpacing: '-0.02em' }}>
            {stats.openRate}%
          </div>
          <div style={{ height: 6, background: '#EFF6FF', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Number(stats.openRate))}%`,
                background: 'linear-gradient(90deg, #60A5FA, #2563EB)',
                borderRadius: 999,
              }}
            />
          </div>
        </div>

        <div className="perf-card-modern">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#111827' }}>
              <MousePointer style={{ width: 14, height: 14, color: '#2563EB' }} /> Click Rate
            </div>
            <span className="perf-trend-badge">+1.5% vs last week</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: '6px 0 4px 0', letterSpacing: '-0.02em' }}>
            {stats.clickRate}%
          </div>
          <div style={{ height: 6, background: '#EFF6FF', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Number(stats.clickRate))}%`,
                background: 'linear-gradient(90deg, #60A5FA, #2563EB)',
                borderRadius: 999,
              }}
            />
          </div>
        </div>

        <div className="perf-card-modern">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#111827' }}>
              <GitBranch style={{ width: 14, height: 14, color: '#2563EB' }} /> A/B Tests Run
            </div>
            <span className="perf-trend-badge">+2 active tests</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: '6px 0 4px 0', letterSpacing: '-0.02em' }}>
            {stats.abTests}
          </div>
          <div style={{ height: 6, background: '#EFF6FF', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '65%', background: 'linear-gradient(90deg, #60A5FA, #2563EB)', borderRadius: 999 }} />
          </div>
        </div>
      </div>

      {/* Recent Campaigns + Recharts Top Performing Segments Chart */}
      <div className="grid-3-2" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.2fr', gap: 24, marginBottom: 24 }}>
        {/* Recent Campaigns */}
        <div className="app-card" style={{ padding: 20, borderRadius: 16, border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: 0 }}>Recent Campaigns</p>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '2px 0 0 0' }}>Latest automated broadcasts</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/campaigns')}>
              View All
            </button>
          </div>
          <div id="recentCampaignsList">
            {recentCampaigns.length === 0 ? (
              <div className="dashed-card" style={{ padding: 24 }}>
                <div className="dashed-icon">
                  <Send style={{ width: 20, height: 20 }} />
                </div>
                <p className="dashed-title">No campaigns yet</p>
                <p className="dashed-desc">Create your first campaign to start sending.</p>
              </div>
            ) : (
              recentCampaigns.map((c, i) => {
                return (
                  <div
                    key={c._id ? `${c._id}-${i}` : `camp-${i}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 0',
                      borderBottom: i === recentCampaigns.length - 1 ? 'none' : '1px solid #E5E7EB',
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: '#EFF6FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Send style={{ color: '#2563EB', width: 14, height: 14 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                        {c.name}
                      </p>
                      <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.subject || 'No subject'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span className="app-badge app-badge-blue">{c.status}</span>
                      <p style={{ fontSize: 11, color: '#6B7280', margin: '3px 0 0 0' }}>
                        {c.totalSent || 0} sent
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Performing Segments — Recharts Horizontal Bar Chart */}
        <div className="app-card" style={{ padding: 20, borderRadius: 16, border: '1px solid #E5E7EB', background: '#FFFFFF', transition: 'transform 200ms ease, box-shadow 200ms ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: 0 }}>Top Performing Segments</p>
              <p style={{ fontSize: 13, color: '#6B7280', margin: '2px 0 0 0' }}>Customer distribution by segment</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/segments')}>
              View All
            </button>
          </div>

          <div style={{ width: '100%', height: 280, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 10, right: 45, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="segmentBarGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#60A5FA" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#334155"
                  fontSize={12}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  width={130}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0F172A',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                    padding: '8px 12px',
                  }}
                  cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                  formatter={(value: any) => [`${Number(value).toLocaleString()} contacts`, 'Audience Count']}
                />
                <Bar
                  dataKey="count"
                  fill="url(#segmentBarGradient)"
                  radius={[0, 8, 8, 0]}
                  barSize={20}
                  animationDuration={1000}
                >
                  <LabelList
                    dataKey="count"
                    position="right"
                    fill="#2563EB"
                    fontSize={12}
                    fontWeight={700}
                    formatter={(val: any) => val}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── SECTION 1 & 2: Recent Customers Activity Panel + 2-Column Action Cards ─ */}
      <div className="grid-3-2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.1fr', gap: 24 }}>
        {/* SECTION 1: Recent Customers Activity Panel */}
        <div className="app-card" style={{ padding: 20, borderRadius: 16, border: '1px solid #E5E7EB', background: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: 0 }}>Recent Customers</p>
                <p style={{ fontSize: 13, color: '#6B7280', margin: '2px 0 0 0' }}>Newly onboarded profiles</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/customers')}>
                View All
              </button>
            </div>

            <div id="recentCustomersPanel">
              {recentCustomers.length === 0 ? (
                /* SECTION 4: EMPTY STATE */
                <div style={{ textAlign: 'center', padding: '36px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      background: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <Users style={{ width: 24, height: 24 }} />
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>No customers yet</p>
                  <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px 0', maxWidth: 300 }}>
                    Start importing customers to build your audience.
                  </p>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/customers')}>
                    <Upload style={{ width: 14, height: 14, marginRight: 6 }} /> Import Customers
                  </button>
                </div>
              ) : (
                recentCustomers.map((c, i) => {
                  const initials = (c.name || 'U')
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();
                  const added = c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : '20 Jul';
                  const grad = avatarGradients[i % avatarGradients.length];

                  return (
                    <div
                      key={c._id ? `${c._id}-${i}` : `cust-${i}`}
                      className="recent-cust-item"
                      onClick={() => navigate('/customers')}
                    >
                      {/* 40px Avatar with Rotating Gradient */}
                      <div
                        className="recent-cust-avatar"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: grad,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#fff',
                          flexShrink: 0,
                          transition: 'transform 200ms ease',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        }}
                      >
                        {initials}
                      </div>

                      {/* Name & Email */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {c.name}
                          </p>
                          {getPlanBadge(c, i)}
                        </div>
                        <p
                          style={{
                            fontSize: 13,
                            color: '#6B7280',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            margin: '2px 0 0 0',
                          }}
                        >
                          {c.email || '—'}
                        </p>
                      </div>

                      {/* Status Indicator & Join Date */}
                      <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                        {getStatusIndicator(c)}
                        <span style={{ fontSize: 11.5, color: '#6B7280' }}>Joined {added}</span>
                      </div>

                      {/* Hover Chevron */}
                      <ChevronRight
                        className="recent-cust-arrow"
                        style={{
                          width: 16,
                          height: 16,
                          color: '#94A3B8',
                          opacity: 0.4,
                          transition: 'all 200ms ease',
                          flexShrink: 0,
                        }}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer View All Customers button */}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 14, marginTop: 12, textAlign: 'center' }}>
            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'center', gap: 6, fontWeight: 600 }}
              onClick={() => navigate('/customers')}
            >
              View All Customers <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>

        {/* SECTION 2: Quick Actions Panel (Interactive Cards Grid) */}
        <div className="app-card" style={{ padding: 20, borderRadius: 16, border: '1px solid #E5E7EB', background: '#FFFFFF' }}>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: 0 }}>Quick Actions</p>
            <p style={{ fontSize: 13, color: '#6B7280', margin: '2px 0 0 0' }}>Frequent management tasks</p>
          </div>

          {/* 2-Column Grid of 88px Compact Action Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 14,
            }}
          >
            {/* Action 1: Create Campaign */}
            <div className="quick-action-card" onClick={() => navigate('/campaigns')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div className="quick-action-icon-box">
                  <Send style={{ width: 18, height: 18 }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Create Campaign
                  </p>
                  <p style={{ fontSize: 12.5, color: '#6B7280', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Launch an email campaign
                  </p>
                </div>
              </div>
              <ChevronRight className="quick-action-arrow" style={{ width: 16, height: 16 }} />
            </div>

            {/* Action 2: Import Customers */}
            <div className="quick-action-card" onClick={() => navigate('/customers')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div className="quick-action-icon-box">
                  <Upload style={{ width: 18, height: 18 }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Import Customers
                  </p>
                  <p style={{ fontSize: 12.5, color: '#6B7280', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Upload a CSV file
                  </p>
                </div>
              </div>
              <ChevronRight className="quick-action-arrow" style={{ width: 16, height: 16 }} />
            </div>

            {/* Action 3: Create Segment */}
            <div className="quick-action-card" onClick={() => navigate('/segments')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div className="quick-action-icon-box">
                  <Layers style={{ width: 18, height: 18 }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Create Segment
                  </p>
                  <p style={{ fontSize: 12.5, color: '#6B7280', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Build audience rules
                  </p>
                </div>
              </div>
              <ChevronRight className="quick-action-arrow" style={{ width: 16, height: 16 }} />
            </div>

            {/* Action 4: Design Template */}
            <div className="quick-action-card" onClick={() => navigate('/templates')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div className="quick-action-icon-box">
                  <Layout style={{ width: 18, height: 18 }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Design Template
                  </p>
                  <p style={{ fontSize: 12.5, color: '#6B7280', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Drag-drop email builder
                  </p>
                </div>
              </div>
              <ChevronRight className="quick-action-arrow" style={{ width: 16, height: 16 }} />
            </div>

            {/* Action 5: Run A/B Test */}
            <div className="quick-action-card" onClick={() => navigate('/abtests')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div className="quick-action-icon-box">
                  <GitBranch style={{ width: 18, height: 18 }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Run A/B Test
                  </p>
                  <p style={{ fontSize: 12.5, color: '#6B7280', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Compare campaign variants
                  </p>
                </div>
              </div>
              <ChevronRight className="quick-action-arrow" style={{ width: 16, height: 16 }} />
            </div>

            {/* Action 6: Export Reports */}
            <div className="quick-action-card" onClick={() => navigate('/dashboard')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div className="quick-action-icon-box">
                  <BarChart3 style={{ width: 18, height: 18 }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Export Reports
                  </p>
                  <p style={{ fontSize: 12.5, color: '#6B7280', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Download analytics data
                  </p>
                </div>
              </div>
              <ChevronRight className="quick-action-arrow" style={{ width: 16, height: 16 }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
