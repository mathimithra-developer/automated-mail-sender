import React from 'react';
import { QrCodeBlockData } from '../types';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface QrCodePropertiesProps {
  block: QrCodeBlockData;
  onChange: (updatedContent: QrCodeBlockData['content']) => void;
}

export const QrCodeProperties: React.FC<QrCodePropertiesProps> = ({
  block,
  onChange,
}) => {
  const {
    url = '',
    size = 140,
    caption = '',
    align = 'center',
  } = block.content;

  const updateProp = <K extends keyof QrCodeBlockData['content']>(
    key: K,
    value: QrCodeBlockData['content'][K]
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
          QR Code Properties
        </h4>
      </div>

      {/* Target URL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>QR Data / URL</label>
        <input
          type="text"
          value={url}
          onChange={(e) => updateProp('url', e.target.value)}
          placeholder="https://example.com"
          style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>

      {/* Caption Text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Caption Text</label>
        <input
          type="text"
          value={caption}
          onChange={(e) => updateProp('caption', e.target.value)}
          placeholder="Scan with phone camera"
          style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>

      {/* Alignment & QR Size Grid */}
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
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>QR Size (px)</label>
          <input
            type="number"
            min={60}
            max={300}
            value={size}
            onChange={(e) => updateProp('size', Number(e.target.value) || 140)}
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>
    </div>
  );
};
