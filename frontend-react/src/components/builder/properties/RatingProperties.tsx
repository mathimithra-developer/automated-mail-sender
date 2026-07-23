import React from 'react';
import { RatingBlockData } from '../types';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface RatingPropertiesProps {
  block: RatingBlockData;
  onChange: (updatedContent: RatingBlockData['content']) => void;
}

export const RatingProperties: React.FC<RatingPropertiesProps> = ({
  block,
  onChange,
}) => {
  const {
    maxStars = 5,
    ratingValue = 4.5,
    url = '#',
    color = '#f59e0b',
    size = 24,
    align = 'center',
  } = block.content;

  const updateProp = <K extends keyof RatingBlockData['content']>(
    key: K,
    value: RatingBlockData['content'][K]
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
          Rating Properties
        </h4>
      </div>

      {/* Rating Value & Max Stars Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Rating Value</label>
          <input
            type="number"
            min={0}
            max={maxStars}
            step={0.5}
            value={ratingValue}
            onChange={(e) => updateProp('ratingValue', Number(e.target.value))}
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Max Stars</label>
          <input
            type="number"
            min={1}
            max={10}
            value={maxStars}
            onChange={(e) => updateProp('maxStars', Number(e.target.value) || 5)}
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Target URL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Target URL</label>
        <input
          type="text"
          value={url}
          onChange={(e) => updateProp('url', e.target.value)}
          placeholder="https://example.com/reviews"
          style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>

      {/* Alignment & Star Size Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Alignment</label>
          <div style={{ display: 'flex', height: 36, background: '#f1f5f9', borderRadius: 6, padding: 2, gap: 2 }}>
            {(['left', 'center', 'right'] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => updateProp('align', dir)}
                style={{
                  flex: 1,
                  border: 'none',
                  borderRadius: 4,
                  background: align === dir ? '#ffffff' : 'transparent',
                  color: align === dir ? '#2563eb' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {dir === 'left' && <AlignLeft size={16} />}
                {dir === 'center' && <AlignCenter size={16} />}
                {dir === 'right' && <AlignRight size={16} />}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Star Size (px)</label>
          <input
            type="number"
            min={12}
            max={64}
            value={size}
            onChange={(e) => updateProp('size', Number(e.target.value) || 24)}
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Star Color */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Star Color</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="color"
            value={color}
            onChange={(e) => updateProp('color', e.target.value)}
            style={{ width: 38, height: 36, padding: 2, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
          />
          <input
            type="text"
            value={color}
            onChange={(e) => updateProp('color', e.target.value)}
            style={{ flex: 1, height: 36, padding: '0 10px', fontSize: 13, fontFamily: 'monospace', borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>
    </div>
  );
};
