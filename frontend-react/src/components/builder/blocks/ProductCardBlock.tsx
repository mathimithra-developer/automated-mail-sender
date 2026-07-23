import React from 'react';
import { ProductCardBlockData } from '../types';

interface ProductCardBlockProps {
  block: ProductCardBlockData;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const ProductCardBlock: React.FC<ProductCardBlockProps> = ({ block }) => {
  const {
    imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    title = 'Wireless Noise-Canceling Headphones',
    price = '$199.00',
    oldPrice = '$249.00',
    description = 'Experience premium acoustics and all-day comfort with active noise cancellation.',
    ctaLabel = 'Shop Now',
    ctaUrl = '#',
    ctaColor = '#2563eb',
    borderRadius = 10,
  } = block.content;

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: `${borderRadius}px`,
        border: '1px solid #e2e8f0',
        background: '#ffffff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <img
          src={imageUrl}
          alt={title}
          style={{
            width: '100%',
            maxWidth: '100%',
            maxHeight: 220,
            objectFit: 'cover',
            borderRadius: `${Math.max(0, borderRadius - 2)}px`,
            display: 'block',
            boxSizing: 'border-box',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
            {title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb' }}>
              {price}
            </span>
            {oldPrice && (
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#94a3b8',
                  textDecoration: 'line-through',
                }}
              >
                {oldPrice}
              </span>
            )}
          </div>

          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
            {description}
          </p>
        </div>

        <div style={{ marginTop: 4 }}>
          <a
            href={ctaUrl || '#'}
            onClick={(e) => e.preventDefault()}
            style={{
              display: 'inline-block',
              width: '100%',
              textAlign: 'center',
              backgroundColor: ctaColor,
              color: '#ffffff',
              padding: '10px 16px',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '14px',
              textDecoration: 'none',
              boxSizing: 'border-box',
              pointerEvents: 'none',
            }}
          >
            {ctaLabel || 'Shop Now'}
          </a>
        </div>
      </div>
    </div>
  );
};
