import React from 'react';
import { QuoteBlockData } from '../types';

export const QuoteBlock: React.FC<{ block: QuoteBlockData }> = ({ block }) => {
  const {
    quote = 'This builder completely transformed our newsletter engagement and saved us 10+ hours every week.',
    author = 'Sarah Jenkins',
    role = 'Head of Marketing at Acme Corp',
    avatarUrl = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    bgColor = '#f8fafc',
    accentColor = '#2563eb',
  } = block.content;

  return (
    <div
      style={{
        background: bgColor,
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: '0 12px 12px 0',
        padding: '20px',
        margin: '8px 0',
        boxSizing: 'border-box',
      }}
    >
      <p style={{ margin: '0 0 14px 0', fontSize: 15, fontStyle: 'italic', color: '#334155', lineHeight: 1.6 }}>"{quote}"</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {avatarUrl && <img src={avatarUrl} alt={author} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />}
        <div>
          <h5 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{author}</h5>
          <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#64748b' }}>{role}</p>
        </div>
      </div>
    </div>
  );
};
