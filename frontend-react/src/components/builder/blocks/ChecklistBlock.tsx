import React from 'react';
import { ChecklistBlockData } from '../types';

export const ChecklistBlock: React.FC<{ block: ChecklistBlockData }> = ({ block }) => {
  const {
    title = 'Pre-launch Checklist',
    items = [
      { text: 'Upload contact list CSV', checked: true },
      { text: 'Map personalization variables', checked: true },
      { text: 'Send test preview email', checked: false },
    ],
    checkColor = '#10b981',
  } = block.content;

  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, margin: '8px 0', boxSizing: 'border-box' }}>
      {title && <h4 style={{ margin: '0 0 10px 0', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{title}</h4>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((it, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' }}>
            <span style={{ color: it.checked ? checkColor : '#94a3b8', fontWeight: 800 }}>{it.checked ? '☑' : '☐'}</span>
            <span style={{ textDecoration: it.checked ? 'line-through' : 'none', opacity: it.checked ? 0.75 : 1 }}>{it.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
