import React from 'react';
import { HeadingBlockData } from '../types';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface HeadingPropertiesProps {
  block: HeadingBlockData;
  onChange: (updatedContent: HeadingBlockData['content']) => void;
}

export const HeadingProperties: React.FC<HeadingPropertiesProps> = ({
  block,
  onChange,
}) => {
  const {
    text = '',
    tag = 'h2',
    fontSize = 28,
    fontWeight = '700',
    color = '#18181b',
    align = 'center',
    letterSpacing = 0,
    lineHeight = 1.3,
  } = block.content;

  const updateProp = <K extends keyof HeadingBlockData['content']>(
    key: K,
    value: HeadingBlockData['content'][K]
  ) => {
    onChange({
      ...block.content,
      [key]: value,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border, #e2e8f0)', paddingBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text, #0f172a)' }}>
          Heading Properties
        </h4>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: 4 }}>
          {tag.toUpperCase()}
        </span>
      </div>

      {/* Text Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>
          Heading Text
        </label>
        <textarea
          value={text}
          onChange={(e) => updateProp('text', e.target.value)}
          placeholder="Enter heading text..."
          rows={3}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: 13,
            borderRadius: 6,
            border: '1px solid var(--border, #cbd5e1)',
            background: 'var(--bg-input, #f8fafc)',
            color: 'var(--text, #0f172a)',
            outline: 'none',
            fontFamily: 'inherit',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* HTML Tag & Alignment Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Tag */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>
            HTML Tag
          </label>
          <select
            value={tag}
            onChange={(e) => updateProp('tag', e.target.value as any)}
            style={{
              width: '100%',
              height: 36,
              padding: '0 10px',
              fontSize: 13,
              borderRadius: 6,
              border: '1px solid var(--border, #cbd5e1)',
              background: 'var(--bg-input, #f8fafc)',
              color: 'var(--text, #0f172a)',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <option value="h1">H1 (Title)</option>
            <option value="h2">H2 (Subtitle)</option>
            <option value="h3">H3 (Section)</option>
            <option value="h4">H4 (Subhead)</option>
            <option value="h5">H5 (Small)</option>
            <option value="h6">H6 (Tiny)</option>
          </select>
        </div>

        {/* Align */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>
            Alignment
          </label>
          <div style={{ display: 'flex', height: 36, background: '#f1f5f9', borderRadius: 6, padding: 2, gap: 2 }}>
            {(['left', 'center', 'right'] as const).map((dir) => {
              const isActive = align === dir;
              return (
                <button
                  key={dir}
                  type="button"
                  onClick={() => updateProp('align', dir)}
                  style={{
                    flex: 1,
                    border: 'none',
                    borderRadius: 4,
                    background: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? '#2563eb' : '#64748b',
                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                  title={`Align ${dir}`}
                >
                  {dir === 'left' && <AlignLeft size={16} />}
                  {dir === 'center' && <AlignCenter size={16} />}
                  {dir === 'right' && <AlignRight size={16} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Font Size & Font Weight Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Font Size */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>
            Font Size (px)
          </label>
          <input
            type="number"
            min={10}
            max={96}
            value={fontSize}
            onChange={(e) => updateProp('fontSize', Number(e.target.value) || 28)}
            style={{
              width: '100%',
              height: 36,
              padding: '0 10px',
              fontSize: 13,
              borderRadius: 6,
              border: '1px solid var(--border, #cbd5e1)',
              background: 'var(--bg-input, #f8fafc)',
              color: 'var(--text, #0f172a)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Font Weight */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>
            Font Weight
          </label>
          <select
            value={fontWeight}
            onChange={(e) => updateProp('fontWeight', e.target.value as any)}
            style={{
              width: '100%',
              height: 36,
              padding: '0 10px',
              fontSize: 13,
              borderRadius: 6,
              border: '1px solid var(--border, #cbd5e1)',
              background: 'var(--bg-input, #f8fafc)',
              color: 'var(--text, #0f172a)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="400">400 (Regular)</option>
            <option value="500">500 (Medium)</option>
            <option value="600">600 (SemiBold)</option>
            <option value="700">700 (Bold)</option>
            <option value="800">800 (ExtraBold)</option>
            <option value="900">900 (Black)</option>
          </select>
        </div>
      </div>

      {/* Color Picker */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>
          Text Color
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="color"
            value={color}
            onChange={(e) => updateProp('color', e.target.value)}
            style={{
              width: 38,
              height: 36,
              padding: 2,
              borderRadius: 6,
              border: '1px solid var(--border, #cbd5e1)',
              cursor: 'pointer',
              background: '#ffffff',
            }}
          />
          <input
            type="text"
            value={color}
            onChange={(e) => updateProp('color', e.target.value)}
            style={{
              flex: 1,
              height: 36,
              padding: '0 10px',
              fontSize: 13,
              fontFamily: 'monospace',
              borderRadius: 6,
              border: '1px solid var(--border, #cbd5e1)',
              background: 'var(--bg-input, #f8fafc)',
              color: 'var(--text, #0f172a)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Letter Spacing & Line Height Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Letter Spacing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>
            Letter Spacing (px)
          </label>
          <input
            type="number"
            min={-4}
            max={20}
            step={0.5}
            value={letterSpacing}
            onChange={(e) => updateProp('letterSpacing', Number(e.target.value))}
            style={{
              width: '100%',
              height: 36,
              padding: '0 10px',
              fontSize: 13,
              borderRadius: 6,
              border: '1px solid var(--border, #cbd5e1)',
              background: 'var(--bg-input, #f8fafc)',
              color: 'var(--text, #0f172a)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Line Height */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>
            Line Height
          </label>
          <input
            type="number"
            min={0.8}
            max={3.0}
            step={0.1}
            value={lineHeight}
            onChange={(e) => updateProp('lineHeight', Number(e.target.value) || 1.3)}
            style={{
              width: '100%',
              height: 36,
              padding: '0 10px',
              fontSize: 13,
              borderRadius: 6,
              border: '1px solid var(--border, #cbd5e1)',
              background: 'var(--bg-input, #f8fafc)',
              color: 'var(--text, #0f172a)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
    </div>
  );
};
