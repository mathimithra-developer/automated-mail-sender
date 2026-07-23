import React from 'react';
import { CountdownBlockData } from '../types';

interface CountdownPropertiesProps {
  block: CountdownBlockData;
  onChange: (updatedContent: CountdownBlockData['content']) => void;
}

export const CountdownProperties: React.FC<CountdownPropertiesProps> = ({
  block,
  onChange,
}) => {
  const {
    deadline = '',
    label = 'Limited Time Offer Ends In:',
    backgroundColor = '#0f172a',
    accentColor = '#3b82f6',
  } = block.content;

  const updateProp = <K extends keyof CountdownBlockData['content']>(
    key: K,
    value: CountdownBlockData['content'][K]
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
          Countdown Properties
        </h4>
      </div>

      {/* Target Deadline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Target Deadline</label>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => updateProp('deadline', e.target.value)}
          style={{
            width: '100%',
            height: 36,
            padding: '0 10px',
            fontSize: 13,
            borderRadius: 6,
            border: '1px solid #cbd5e1',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Header Label */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Header Label</label>
        <input
          type="text"
          value={label}
          onChange={(e) => updateProp('label', e.target.value)}
          placeholder="Offer Ends In:"
          style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
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
              style={{ width: '100%', height: 32, padding: '0 6px', fontSize: 11, fontFamily: 'monospace', borderRadius: 6, border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        {/* Accent Color */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Accent Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="color"
              value={accentColor}
              onChange={(e) => updateProp('accentColor', e.target.value)}
              style={{ width: 32, height: 32, padding: 2, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
            />
            <input
              type="text"
              value={accentColor}
              onChange={(e) => updateProp('accentColor', e.target.value)}
              style={{ width: '100%', height: 32, padding: '0 6px', fontSize: 11, fontFamily: 'monospace', borderRadius: 6, border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
