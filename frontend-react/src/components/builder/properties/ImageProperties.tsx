import React from 'react';
import { ImageBlockData } from '../types';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface ImagePropertiesProps {
  block: ImageBlockData;
  onChange: (updatedContent: ImageBlockData['content']) => void;
}

export const ImageProperties: React.FC<ImagePropertiesProps> = ({
  block,
  onChange,
}) => {
  const {
    url = '',
    alt = 'Image',
    linkUrl = '',
    borderRadius = 8,
    align = 'center',
  } = block.content;

  const updateProp = <K extends keyof ImageBlockData['content']>(
    key: K,
    value: ImageBlockData['content'][K]
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
          Image Properties
        </h4>
      </div>

      {/* Image URL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Image URL</label>
        <input
          type="text"
          value={url}
          onChange={(e) => updateProp('url', e.target.value)}
          placeholder="https://example.com/image.jpg"
          style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>

      {/* Alt Text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Alt Text</label>
        <input
          type="text"
          value={alt}
          onChange={(e) => updateProp('alt', e.target.value)}
          placeholder="Image description"
          style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>

      {/* Target Link URL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Click Link URL (optional)</label>
        <input
          type="text"
          value={linkUrl}
          onChange={(e) => updateProp('linkUrl', e.target.value)}
          placeholder="https://example.com"
          style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>

      {/* Alignment & Border Radius Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Alignment */}
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

        {/* Border Radius */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Corner Radius</label>
          <input
            type="number"
            min={0}
            max={60}
            value={borderRadius}
            onChange={(e) => updateProp('borderRadius', Number(e.target.value))}
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>
    </div>
  );
};
