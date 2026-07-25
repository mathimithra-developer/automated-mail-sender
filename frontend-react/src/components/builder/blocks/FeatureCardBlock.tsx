import React from 'react';
import { FeatureCardBlockData } from '../types';

export const FeatureCardBlock: React.FC<{ block: FeatureCardBlockData }> = ({ block }) => {
  const {
    icon = '⚡',
    title = 'Instant Delivery',
    description = 'Reach thousands of recipients in seconds with 99.9% uptime guaranteed.',
    ctaLabel = 'View Specs',
    ctaUrl = '#',
    bgColor = '#ffffff',
    borderColor = '#e2e8f0',
  } = block.content;

  return (
    <div
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 12,
        padding: '20px',
        margin: '8px 0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          {icon}
        </div>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>{title}</h3>
      </div>
      <p style={{ margin: '0 0 14px 0', fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>{description}</p>
      {ctaLabel && (
        <a
          href={ctaUrl}
          onClick={(e) => e.preventDefault()}
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#2563eb',
            textDecoration: 'none',
          }}
        >
          {ctaLabel} →
        </a>
      )}
    </div>
  );
};
