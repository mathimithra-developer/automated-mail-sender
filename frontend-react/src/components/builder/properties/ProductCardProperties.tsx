import React from 'react';
import { ProductCardBlockData } from '../types';

interface ProductCardPropertiesProps {
  block: ProductCardBlockData;
  onChange: (updatedContent: ProductCardBlockData['content']) => void;
}

export const ProductCardProperties: React.FC<ProductCardPropertiesProps> = ({
  block,
  onChange,
}) => {
  const {
    imageUrl = '',
    title = '',
    price = '',
    oldPrice = '',
    description = '',
    ctaLabel = '',
    ctaUrl = '',
    ctaColor = '#2563eb',
    borderRadius = 10,
  } = block.content;

  const updateProp = <K extends keyof ProductCardBlockData['content']>(
    key: K,
    value: ProductCardBlockData['content'][K]
  ) => {
    onChange({
      ...block.content,
      [key]: value,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
          Product Card Properties
        </h4>
      </div>

      {/* Image URL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Image URL</label>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => updateProp('imageUrl', e.target.value)}
          placeholder="https://example.com/product.jpg"
          style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>

      {/* Product Title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Product Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => updateProp('title', e.target.value)}
          placeholder="Wireless Headphones"
          style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>

      {/* Price & Old Price Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Current Price</label>
          <input
            type="text"
            value={price}
            onChange={(e) => updateProp('price', e.target.value)}
            placeholder="$199.00"
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Original Price</label>
          <input
            type="text"
            value={oldPrice}
            onChange={(e) => updateProp('oldPrice', e.target.value)}
            placeholder="$249.00"
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Description</label>
        <textarea
          value={description}
          onChange={(e) => updateProp('description', e.target.value)}
          placeholder="Product feature details..."
          rows={3}
          style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>

      {/* CTA Button Label & Link URL */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>CTA Label</label>
          <input
            type="text"
            value={ctaLabel}
            onChange={(e) => updateProp('ctaLabel', e.target.value)}
            placeholder="Shop Now"
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>CTA Link</label>
          <input
            type="text"
            value={ctaUrl}
            onChange={(e) => updateProp('ctaUrl', e.target.value)}
            placeholder="https://..."
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* CTA Color & Corner Radius */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>CTA Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="color"
              value={ctaColor}
              onChange={(e) => updateProp('ctaColor', e.target.value)}
              style={{ width: 32, height: 32, padding: 2, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
            />
            <input
              type="text"
              value={ctaColor}
              onChange={(e) => updateProp('ctaColor', e.target.value)}
              style={{ width: '100%', height: 32, padding: '0 6px', fontSize: 11, fontFamily: 'monospace', borderRadius: 6, border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Card Radius</label>
          <input
            type="number"
            min={0}
            max={40}
            value={borderRadius}
            onChange={(e) => updateProp('borderRadius', Number(e.target.value))}
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>
    </div>
  );
};
