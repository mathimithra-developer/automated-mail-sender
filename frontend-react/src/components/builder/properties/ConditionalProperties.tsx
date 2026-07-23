import React from 'react';
import { ConditionalBlockData } from '../types';

interface ConditionalPropertiesProps {
  block: ConditionalBlockData;
  onChange: (updatedContent: ConditionalBlockData['content']) => void;
}

export const ConditionalProperties: React.FC<ConditionalPropertiesProps> = ({
  block,
  onChange,
}) => {
  const {
    condition = '',
    ifTrueContent = '',
    ifFalseContent = '',
  } = block.content;

  const updateProp = <K extends keyof ConditionalBlockData['content']>(
    key: K,
    value: ConditionalBlockData['content'][K]
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
          Conditional Properties
        </h4>
      </div>

      {/* Condition Expression */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Condition Expression</label>
        <input
          type="text"
          value={condition}
          onChange={(e) => updateProp('condition', e.target.value)}
          placeholder="e.g. user.plan === 'pro'"
          style={{
            width: '100%',
            height: 36,
            padding: '0 10px',
            fontSize: 13,
            fontFamily: 'monospace',
            borderRadius: 6,
            border: '1px solid #cbd5e1',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* If True Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>If TRUE Content</label>
        <textarea
          value={ifTrueContent}
          onChange={(e) => updateProp('ifTrueContent', e.target.value)}
          placeholder="Content to render when condition evaluates to true..."
          rows={3}
          style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>

      {/* If False Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#dc2626' }}>If FALSE Content</label>
        <textarea
          value={ifFalseContent}
          onChange={(e) => updateProp('ifFalseContent', e.target.value)}
          placeholder="Content to render when condition evaluates to false..."
          rows={3}
          style={{ width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>
    </div>
  );
};
