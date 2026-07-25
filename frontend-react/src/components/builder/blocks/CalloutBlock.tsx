import React from 'react';
import { CalloutBlockData } from '../types';

export const CalloutBlock: React.FC<{ block: CalloutBlockData }> = ({ block }) => {
  const {
    icon = '🚀',
    title = 'New Feature Announcement',
    description = 'Copy and paste nodes instantly across all campaign workflows.',
    ctaLabel = 'Learn More',
    ctaUrl = '#',
    bgColor = '#eff6ff',
    borderColor = '#bfdbfe',
    accentColor = '#2563eb',
  } = block.content;

  return (
    <div
      style={{
        background: bgColor,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 12,
        padding: '20px',
        margin: '8px 0',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        {icon && <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>{icon}</span>}
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
      </div>
      <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#475569', lineHeight: 1.5 }}>{description}</p>
      {ctaLabel && (
        <a
          href={ctaUrl}
          onClick={(e) => e.preventDefault()}
          style={{
            display: 'inline-block',
            background: accentColor,
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: 6,
            fontWeight: 700,
            fontSize: 13,
            textDecoration: 'none',
          }}
        >
          {ctaLabel}
        </a>
      )}
    </div>
  );
};
