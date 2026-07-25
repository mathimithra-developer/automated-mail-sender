import React from 'react';
import { VariableBlockData } from '../types';

export const VariableBlock: React.FC<{ block: VariableBlockData }> = ({ block }) => {
  const { variableName = 'customer.firstName', fallback = 'Valued Customer', label = 'Recipient Variable', align = 'left' } = block.content;

  return (
    <div style={{ textAlign: align, margin: '6px 0', width: '100%', boxSizing: 'border-box' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          color: '#1d4ed8',
          padding: '4px 10px',
          borderRadius: 16,
          fontSize: 12,
          fontWeight: 700,
          fontFamily: 'monospace',
        }}
      >
        <span>⚡ {label}:</span>
        <code>{`{{${variableName}}}`}</code>
        <span style={{ opacity: 0.7, fontWeight: 400 }}>(Fallback: "{fallback}")</span>
      </span>
    </div>
  );
};
