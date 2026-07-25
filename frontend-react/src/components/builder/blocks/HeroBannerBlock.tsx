import React from 'react';
import { HeroBannerBlockData } from '../types';

interface HeroBannerBlockProps {
  block: HeroBannerBlockData;
}

export const HeroBannerBlock: React.FC<HeroBannerBlockProps> = ({ block }) => {
  const {
    imageUrl = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1000&auto=format&fit=crop&q=80',
    title = 'Transform Your Business Today',
    subtitle = 'Powerful tools for modern growth and automation',
    ctaLabel = 'Get Started Free',
    ctaUrl = '#',
    ctaColor = '#2563eb',
    overlayColor = 'rgba(15, 23, 42, 0.65)',
    align = 'center',
    height = 320,
  } = block.content;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: `${height}px`,
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: 12,
        overflow: 'hidden',
        boxSizing: 'border-box',
        margin: '8px 0',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: overlayColor,
          display: 'flex',
          flexDirection: 'column',
          alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
          justifyContent: 'center',
          padding: '24px 32px',
          textAlign: align,
          color: '#ffffff',
          boxSizing: 'border-box',
        }}
      >
        <h2 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>{title}</h2>
        {subtitle && <p style={{ margin: '0 0 20px 0', fontSize: 15, opacity: 0.9, lineHeight: 1.5, maxWidth: 480 }}>{subtitle}</p>}
        {ctaLabel && (
          <a
            href={ctaUrl}
            onClick={(e) => e.preventDefault()}
            style={{
              display: 'inline-block',
              background: ctaColor,
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            {ctaLabel}
          </a>
        )}
      </div>
    </div>
  );
};
