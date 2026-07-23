import React from 'react';
import { ProductCardBlockData } from '../types';

interface ProductCardBlockProps {
  block: ProductCardBlockData;
  isSelected: boolean;
  onSelect: () => void;
}

export const ProductCardBlock: React.FC<ProductCardBlockProps> = ({
  block,
  isSelected,
  onSelect,
}) => {
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
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`builder-block-wrapper ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'relative',
        padding: '16px',
        margin: '4px 0',
        borderRadius: `${borderRadius}px`,
        cursor: 'pointer',
        border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
        background: '#ffffff',
        boxShadow: isSelected
          ? '0 0 0 3px rgba(59, 130, 246, 0.15)'
          : '0 4px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <img
          src={imageUrl}
          alt={title}
          style={{
            width: '100%',
            maxHeight: 220,
            objectFit: 'cover',
            borderRadius: `${Math.max(0, borderRadius - 2)}px`,
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

      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: -10,
            right: 12,
            background: '#3b82f6',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            pointerEvents: 'none',
          }}
        >
          Product Card
        </div>
      )}
    </div>
  );
};
