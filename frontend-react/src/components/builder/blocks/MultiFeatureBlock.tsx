import React from 'react';
import { MultiFeatureBlockData } from '../types';

export const MultiFeatureBlock: React.FC<{ block: MultiFeatureBlockData }> = ({ block }) => {
  const {
    columns = 3,
    items = [
      { icon: '🚀', title: 'Fast Setup', description: 'Ready in under 2 mins' },
      { icon: '🔒', title: 'Secure & Encrypted', description: 'Enterprise privacy standard' },
      { icon: '📊', title: 'Real-time Analytics', description: 'Detailed open & click rates' },
    ],
  } = block.content;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(columns, 4)}, 1fr)`,
        gap: 12,
        margin: '8px 0',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: 14,
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 6 }}>{item.icon}</div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{item.title}</h4>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{item.description}</p>
        </div>
      ))}
    </div>
  );
};
