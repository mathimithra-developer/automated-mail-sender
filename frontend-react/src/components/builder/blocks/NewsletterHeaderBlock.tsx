import React from 'react';
import { NewsletterHeaderBlockData } from '../types';

export const NewsletterHeaderBlock: React.FC<{ block: NewsletterHeaderBlockData }> = ({ block }) => {
  const {
    logoUrl = '',
    title = 'Weekly SaaS Digest',
    subtitle = 'Curated insights for tech founders & marketers',
    issueDate = 'Issue #42 • July 2026',
    bgColor = '#ffffff',
    accentColor = '#2563eb',
  } = block.content;

  return (
    <div
      style={{
        background: bgColor,
        borderBottom: `2px solid ${accentColor}`,
        padding: '20px',
        textAlign: 'center',
        margin: '0 0 12px 0',
        boxSizing: 'border-box',
      }}
    >
      {logoUrl && <img src={logoUrl} alt="Logo" style={{ maxHeight: 36, marginBottom: 8 }} />}
      <h1 style={{ margin: '0 0 4px 0', fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{title}</h1>
      {subtitle && <p style={{ margin: '0 0 8px 0', fontSize: 13, color: '#64748b' }}>{subtitle}</p>}
      <span style={{ fontSize: 11, fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{issueDate}</span>
    </div>
  );
};
