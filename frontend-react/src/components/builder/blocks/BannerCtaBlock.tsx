import React from 'react';
import { BannerCtaBlockData } from '../types';

export const BannerCtaBlock: React.FC<{ block: BannerCtaBlockData }> = ({ block }) => {
  const {
    headline = 'Unlock 30% Discount Today',
    subheadline = 'Upgrade your subscription before the end of the month',
    ctaLabel = 'Claim Discount',
    ctaUrl = '#',
    imageUrl = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
    bgColor = '#0f172a',
  } = block.content;

  return (
    <div
      style={{
        background: bgColor,
        borderRadius: 14,
        overflow: 'hidden',
        color: '#ffffff',
        margin: '8px 0',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      {imageUrl && <img src={imageUrl} alt={headline} style={{ width: '100%', height: 160, objectFit: 'cover' }} />}
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 6px 0', fontSize: 20, fontWeight: 800, color: '#ffffff' }}>{headline}</h3>
        <p style={{ margin: '0 0 16px 0', fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>{subheadline}</p>
        <a
          href={ctaUrl}
          onClick={(e) => e.preventDefault()}
          style={{
            display: 'inline-block',
            background: '#2563eb',
            color: '#ffffff',
            padding: '10px 22px',
            borderRadius: 6,
            fontWeight: 800,
            fontSize: 13,
            textDecoration: 'none',
          }}
        >
          {ctaLabel}
        </a>
      </div>
    </div>
  );
};
