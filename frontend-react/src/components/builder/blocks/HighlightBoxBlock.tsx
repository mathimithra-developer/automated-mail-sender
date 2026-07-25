import React from 'react';
import { HighlightBoxBlockData } from '../types';

export const HighlightBoxBlock: React.FC<{ block: HighlightBoxBlockData }> = ({ block }) => {
  const {
    icon = '⭐',
    heading = 'VIP Subscriber Perk',
    text = 'Enjoy early access to our annual product sale before anyone else.',
    ctaLabel = 'Claim VIP Perk',
    ctaUrl = '#',
    bgColor = '#2563eb',
    textColor = '#ffffff',
  } = block.content;

  return (
    <div
      style={{
        background: bgColor,
        borderRadius: 14,
        padding: '24px',
        color: textColor,
        textAlign: 'center',
        margin: '8px 0',
        boxShadow: '0 8px 20px rgba(37,99,235,0.2)',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <h3 style={{ margin: '0 0 8px 0', fontSize: 22, fontWeight: 800, color: textColor }}>{heading}</h3>
      <p style={{ margin: '0 0 16px 0', fontSize: 14, opacity: 0.9, lineHeight: 1.5 }}>{text}</p>
      {ctaLabel && (
        <a
          href={ctaUrl}
          onClick={(e) => e.preventDefault()}
          style={{
            display: 'inline-block',
            background: '#ffffff',
            color: bgColor,
            padding: '10px 20px',
            borderRadius: 6,
            fontWeight: 800,
            fontSize: 13,
            textDecoration: 'none',
          }}
        >
          {ctaLabel}
        </a>
      )}
    </div>
  );
};
