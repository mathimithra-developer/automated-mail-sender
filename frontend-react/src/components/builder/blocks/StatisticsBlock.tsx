import React from 'react';
import { StatisticsBlockData } from '../types';

export const StatisticsBlock: React.FC<{ block: StatisticsBlockData }> = ({ block }) => {
  const {
    stats = [{ label: 'Active Users', value: '500K+' }, { label: 'Deliverability', value: '99.9%' }, { label: 'Support Rate', value: '5 Stars' }],
    bgColor = '#f8fafc',
    accentColor = '#2563eb',
  } = block.content;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
        gap: 10,
        background: bgColor,
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: 16,
        margin: '8px 0',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {stats.map((st, idx) => (
        <div key={idx} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: accentColor }}>{st.value}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginTop: 2 }}>{st.label}</div>
        </div>
      ))}
    </div>
  );
};
