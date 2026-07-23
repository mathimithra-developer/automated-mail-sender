import React from 'react';
import { ParagraphBlockData } from '../types';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface ParagraphPropertiesProps {
  block: ParagraphBlockData;
  onChange: (updatedContent: ParagraphBlockData['content']) => void;
}

export const ParagraphProperties: React.FC<ParagraphPropertiesProps> = ({
  block,
  onChange,
}) => {
  const {
    text = '',
    fontSize = 15,
    color = '#334155',
    align = 'left',
    lineHeight = 1.6,
  } = block.content;

  const updateProp = <K extends keyof ParagraphBlockData['content']>(
    key: K,
    value: ParagraphBlockData['content'][K]
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
          Paragraph Properties
        </h4>
      </div>

      {/* Paragraph Text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Paragraph Content</label>
        <textarea
          value={text}
          onChange={(e) => updateProp('text', e.target.value)}
          placeholder="Write your content here..."
          rows={5}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: 13,
            borderRadius: 6,
            border: '1px solid #cbd5e1',
            background: '#f8fafc',
            color: '#0f172a',
            outline: 'none',
            fontFamily: 'inherit',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Font Size & Line Height Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Font Size (px)</label>
          <input
            type="number"
            min={10}
            max={48}
            value={fontSize}
            onChange={(e) => updateProp('fontSize', Number(e.target.value) || 15)}
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Line Height</label>
          <input
            type="number"
            min={1.0}
            max={3.0}
            step={0.1}
            value={lineHeight}
            onChange={(e) => updateProp('lineHeight', Number(e.target.value) || 1.6)}
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>

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

      {/* Color Picker */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Text Color</label>
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
