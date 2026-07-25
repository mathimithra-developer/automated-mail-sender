import React from 'react';
import { BadgeBlockData } from '../types';

export const BadgeBlock: React.FC<{ block: BadgeBlockData }> = ({ block }) => {
  const { text = 'NEW RELEASE', bgColor = '#dcfce7', textColor = '#15803d', size = 'medium', align = 'center' } = block.content;

  const padding = size === 'small' ? '2px 8px' : size === 'large' ? '6px 16px' : '4px 12px';
  const fontSize = size === 'small' ? 10 : size === 'large' ? 14 : 11;

  return (
    <div style={{ textAlign: align, margin: '4px 0', width: '100%', boxSizing: 'border-box' }}>
      <span
        style={{
          display: 'inline-block',
          background: bgColor,
          color: textColor,
          padding,
          borderRadius: 20,
          fontSize: `${fontSize}px`,
          fontWeight: 800,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {text}
      </span>
    </div>
  );
};
