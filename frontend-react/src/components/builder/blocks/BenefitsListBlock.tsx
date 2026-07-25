import React from 'react';
import { BenefitsListBlockData } from '../types';

export const BenefitsListBlock: React.FC<{ block: BenefitsListBlockData }> = ({ block }) => {
  const {
    icon = '✅',
    iconColor = '#10b981',
    items = ['No setup fee or credit card required', 'Unlimited automated campaign flows', '24/7 Priority support hotline'],
    fontSize = 14,
  } = block.content;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '8px 0', width: '100%', boxSizing: 'border-box' }}>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: `${fontSize}px`, color: '#334155' }}>
          <span style={{ color: iconColor, fontSize: '1.1em', flexShrink: 0 }}>{icon}</span>
          <span style={{ lineHeight: 1.5 }}>{item}</span>
        </div>
      ))}
    </div>
  );
};
