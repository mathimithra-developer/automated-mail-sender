import React from 'react';
import { TimelineBlockData } from '../types';

export const TimelineBlock: React.FC<{ block: TimelineBlockData }> = ({ block }) => {
  const {
    events = [
      { date: 'Q1 2026', title: 'Mail Builder 2.0 Launch', description: 'Introducing modular block design' },
      { date: 'Q2 2026', title: 'WhatsApp Integration', description: 'Multi-channel messaging hub' },
    ],
    accentColor = '#2563eb',
  } = block.content;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: '8px 0', width: '100%', boxSizing: 'border-box' }}>
      {events.map((ev, idx) => (
        <div key={idx} style={{ display: 'flex', gap: 14, position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: accentColor, flexShrink: 0, marginTop: 4 }} />
            {idx < events.length - 1 && <div style={{ width: 2, flex: 1, background: '#cbd5e1', margin: '4px 0' }} />}
          </div>
          <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: 'uppercase' }}>{ev.date}</span>
            <h4 style={{ margin: '2px 0 4px 0', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{ev.title}</h4>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{ev.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
