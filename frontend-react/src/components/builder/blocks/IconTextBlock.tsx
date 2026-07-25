import React from 'react';
import { IconTextBlockData } from '../types';

export const IconTextBlock: React.FC<{ block: IconTextBlockData }> = ({ block }) => {
  const { icon = '⚡', iconColor = '#2563eb', heading = 'Lightning Fast Setup', description = 'Get your campaigns launched in minutes without coding.', align = 'left' } = block.content;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: align, margin: '8px 0', boxSizing: 'border-box' }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(37,99,235,0.1)', color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <h4 style={{ margin: '0 0 2px 0', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{heading}</h4>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.4 }}>{description}</p>
      </div>
    </div>
  );
};
