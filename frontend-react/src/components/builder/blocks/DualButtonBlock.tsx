import React from 'react';
import { DualButtonBlockData } from '../types';

export const DualButtonBlock: React.FC<{ block: DualButtonBlockData }> = ({ block }) => {
  const {
    primaryLabel = 'Get Started',
    primaryUrl = '#',
    primaryBg = '#2563eb',
    primaryColor = '#ffffff',
    secondaryLabel = 'Learn More',
    secondaryUrl = '#',
    secondaryBg = '#f1f5f9',
    secondaryColor = '#334155',
    align = 'center',
  } = block.content;

  return (
    <div style={{ textAlign: align, width: '100%', padding: '6px 0', boxSizing: 'border-box' }}>
      <div style={{ display: 'inline-flex', gap: 12, flexWrap: 'wrap' }}>
        <a
          href={primaryUrl}
          onClick={(e) => e.preventDefault()}
          style={{
            display: 'inline-block',
            background: primaryBg,
            color: primaryColor,
            padding: '10px 20px',
            borderRadius: 6,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          {primaryLabel}
        </a>
        <a
          href={secondaryUrl}
          onClick={(e) => e.preventDefault()}
          style={{
            display: 'inline-block',
            background: secondaryBg,
            color: secondaryColor,
            padding: '10px 20px',
            borderRadius: 6,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
            border: '1px solid #cbd5e1',
          }}
        >
          {secondaryLabel}
        </a>
      </div>
    </div>
  );
};
