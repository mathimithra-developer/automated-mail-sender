import React from 'react';
import { ProductGridBlockData } from '../types';

interface ProductGridBlockProps {
  block: ProductGridBlockData;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const ProductGridBlock: React.FC<ProductGridBlockProps> = ({ block }) => {
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
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 12,
        width: '100%',
        boxSizing: 'border-box',
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
            boxSizing: 'border-box',
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          <img
            src={prod.imageUrl}
            alt={prod.title}
            style={{
              width: '100%',
              maxWidth: '100%',
              height: 120,
              objectFit: 'cover',
              borderRadius: 6,
              display: 'block',
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
  );
};
