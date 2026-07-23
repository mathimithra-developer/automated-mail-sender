import React from 'react';
import { ProductGridBlockData } from '../types';

interface ProductGridBlockProps {
  block: ProductGridBlockData;
  isSelected: boolean;
  onSelect: () => void;
}

export const ProductGridBlock: React.FC<ProductGridBlockProps> = ({
  block,
  isSelected,
  onSelect,
}) => {
  const {
    columns = 2,
    products = [
      {
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        title: 'Minimalist Watch',
        price: '$120.00',
        linkUrl: '#',
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
        title: 'Running Sneakers',
        price: '$85.00',
        linkUrl: '#',
      },
    ],
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
        padding: '12px 16px',
        margin: '4px 0',
        borderRadius: '6px',
        cursor: 'pointer',
        border: isSelected ? '2px solid #3b82f6' : '1px dashed transparent',
        boxShadow: isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.15)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 12,
        }}
      >
        {products.map((prod, idx) => (
          <div
            key={idx}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              textAlign: 'center',
            }}
          >
            <img
              src={prod.imageUrl}
              alt={prod.title}
              style={{
                width: '100%',
                height: 120,
                objectFit: 'cover',
                borderRadius: 6,
              }}
            />
            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
              {prod.title}
            </h4>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#2563eb' }}>
              {prod.price}
            </span>
          </div>
        ))}
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
          Product Grid ({products.length} items)
        </div>
      )}
    </div>
  );
};
