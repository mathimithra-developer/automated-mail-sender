import React from 'react';
import { BulletListBlockData } from '../types';

export const BulletListBlock: React.FC<{ block: BulletListBlockData }> = ({ block }) => {
  const {
    bulletStyle = 'check',
    bulletColor = '#2563eb',
    items = ['Automated email triggers', 'Dynamic subscriber segmentation', 'Custom domain authentication'],
    fontSize = 14,
  } = block.content;

  const renderBullet = () => {
    switch (bulletStyle) {
      case 'check': return '✔';
      case 'arrow': return '➔';
      case 'star': return '★';
      case 'dot': default: return '•';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '8px 0', width: '100%', boxSizing: 'border-box' }}>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: `${fontSize}px`, color: '#334155' }}>
          <span style={{ color: bulletColor, fontWeight: 700, flexShrink: 0 }}>{renderBullet()}</span>
          <span style={{ lineHeight: 1.5 }}>{item}</span>
        </div>
      ))}
    </div>
  );
};
