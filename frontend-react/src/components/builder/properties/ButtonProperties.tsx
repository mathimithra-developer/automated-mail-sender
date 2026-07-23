import React from 'react';
import { ButtonBlockData } from '../types';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface ButtonPropertiesProps {
  block: ButtonBlockData;
  onChange: (updatedContent: ButtonBlockData['content']) => void;
}

export const ButtonProperties: React.FC<ButtonPropertiesProps> = ({
  block,
  onChange,
}) => {
  const {
    label = 'Click Here',
    url = '#',
    backgroundColor = '#2563eb',
    color = '#ffffff',
    borderRadius = 6,
    align = 'center',
    paddingX = 24,
    paddingY = 12,
    shadow = true,
  } = block.content;

  const updateProp = <K extends keyof ButtonBlockData['content']>(
    key: K,
    value: ButtonBlockData['content'][K]
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
          Button Properties
        </h4>
      </div>

      {/* Button Label */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Button Label</label>
        <input
          type="text"
          value={label}
          onChange={(e) => updateProp('label', e.target.value)}
          placeholder="Click Here"
          style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>

      {/* Button URL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Target URL</label>
        <input
          type="text"
          value={url}
          onChange={(e) => updateProp('url', e.target.value)}
          placeholder="https://example.com"
          style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
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

      {/* Colors Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Background Color */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>BG Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => updateProp('backgroundColor', e.target.value)}
              style={{ width: 32, height: 32, padding: 2, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => updateProp('backgroundColor', e.target.value)}
              style={{ width: '100%', height: 32, padding: '0 6px', fontSize: 11, fontFamily: 'monospace', borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Text Color */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Text Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="color"
              value={color}
              onChange={(e) => updateProp('color', e.target.value)}
              style={{ width: 32, height: 32, padding: 2, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
            />
            <input
              type="text"
              value={color}
              onChange={(e) => updateProp('color', e.target.value)}
              style={{ width: '100%', height: 32, padding: '0 6px', fontSize: 11, fontFamily: 'monospace', borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>

      {/* Padding Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Padding X (px)</label>
          <input
            type="number"
            min={4}
            max={80}
            value={paddingX}
            onChange={(e) => updateProp('paddingX', Number(e.target.value))}
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Padding Y (px)</label>
          <input
            type="number"
            min={4}
            max={40}
            value={paddingY}
            onChange={(e) => updateProp('paddingY', Number(e.target.value))}
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Border Radius & Shadow */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Corner Radius</label>
          <input
            type="number"
            min={0}
            max={50}
            value={borderRadius}
            onChange={(e) => updateProp('borderRadius', Number(e.target.value))}
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18 }}>
          <input
            type="checkbox"
            id="buttonShadow"
            checked={shadow}
            onChange={(e) => updateProp('shadow', e.target.checked)}
            style={{ width: 16, height: 16, accentColor: '#2563eb', cursor: 'pointer' }}
          />
          <label htmlFor="buttonShadow" style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
            Drop Shadow
          </label>
        </div>
      </div>
    </div>
  );
};
