import React from 'react';
import { SpacerBlockData } from '../types';

interface SpacerPropertiesProps {
  block: SpacerBlockData;
  onChange: (updatedContent: SpacerBlockData['content']) => void;
}

export const SpacerProperties: React.FC<SpacerPropertiesProps> = ({
  block,
  onChange,
}) => {
  const { height = 32 } = block.content;

  const updateProp = <K extends keyof SpacerBlockData['content']>(
    key: K,
    value: SpacerBlockData['content'][K]
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
          Spacer Properties
        </h4>
      </div>

      {/* Spacer Height */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>
          Spacer Height (px)
        </label>
        <input
          type="number"
          min={4}
          max={200}
          value={height}
          onChange={(e) => updateProp('height', Number(e.target.value) || 32)}
          style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>
    </div>
  );
};
