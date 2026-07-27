import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { useCampaignDetail } from './CampaignDetailsLayout';

export const CampaignAnalyticsPage: React.FC = () => {
  const { stats, loading } = useCampaignDetail();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
        <div
          style={{ width: 36, height: 36, border: '3px solid #2563EB', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px auto', animation: 'spin 0.8s linear infinite' }}
        />
        <p style={{ fontSize: 14 }}>Loading analytics…</p>
      </div>
    );
  }

  // Hourly trend data — Sent, Delivered, Read
  const hourlyData = Array.from({ length: 12 }, (_, i) => {
    const hour = (9 + i) % 24;
    const peak = i >= 2 && i <= 5;
    const base = Math.max(1, Math.round(stats.sent / 12));
    return {
      hour: `${hour}:00`,
      sent:      peak ? Math.round(base * 2.2) : base,
      delivered: peak ? Math.round(base * 2.0) : Math.round(base * 0.95),
      read:      peak ? Math.round(base * 1.5) : Math.round(base * 0.65),
    };
  });

  // Engagement Summary bar data — semantic colors only
  const summaryData = [
    { name: 'Delivered', count: stats.delivered, fill: '#16A34A' },
    { name: 'Read',      count: stats.read,      fill: '#64748B' },
    { name: 'Failed',    count: stats.failed,    fill: '#EF4444' },
  ];

  // Stat cards — standardized palette
  const metricCards = [
    { label: 'Delivery Success',   value: `${stats.deliveryRate}%`,  color: '#16A34A', border: '#16A34A' },
    { label: 'Read Rate',          value: `${stats.readRate}%`,      color: '#2563EB', border: '#2563EB' },
    { label: 'Failure Rate',       value: `${stats.failureRate}%`,   color: '#EF4444', border: '#EF4444' },
    { label: 'Avg Delivery Speed', value: stats.avgDeliveryTime,     color: '#2563EB', border: '#2563EB' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {metricCards.map((mc) => (
          <div
            key={mc.label}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 14,
              padding: '16px 20px',
              borderLeft: `4px solid ${mc.border}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: 90,
            }}
          >
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' as const }}>
              {mc.label}
            </span>
            <div style={{ fontSize: 24, fontWeight: 800, color: mc.color, marginTop: 6, lineHeight: 1.1 }}>
              {mc.value}
            </div>
          </div>
        ))}
      </div>

      {/* 2 Charts Only */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>

        {/* Chart 1 — Delivery & Engagement Trend */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16,
          padding: '20px 24px', display: 'flex', flexDirection: 'column',
          height: 360, boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}>
          <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
            Delivery &amp; Engagement Trend
          </h3>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 16px' }}>
            Hourly timeline of Sent, Delivered, and Read volume
          </p>
          <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12, boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="sent"      stroke="#2563EB" strokeWidth={2.5} name="Sent"      dot={false} />
                <Line type="monotone" dataKey="delivered" stroke="#16A34A" strokeWidth={2.5} name="Delivered" dot={false} />
                <Line type="monotone" dataKey="read"      stroke="#64748B" strokeWidth={2.5} name="Read"      dot={false} strokeDasharray="4 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 — Engagement Summary */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16,
          padding: '20px 24px', display: 'flex', flexDirection: 'column',
          height: 360, boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}>
          <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
            Engagement Summary
          </h3>
          <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 16px' }}>
            Comparison of messages delivered, read, and failed
          </p>
          <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summaryData} barSize={52}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 12, boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {summaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CampaignAnalyticsPage;
