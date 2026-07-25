import React from 'react';
import { InfoCardBlockData } from '../types';

export const InfoCardBlock: React.FC<{ block: InfoCardBlockData }> = ({ block }) => {
  const {
    icon = '💡',
    title = 'Pro Tip for Creators',
    description = 'Personalized subject lines increase email click rates by 26%.',
    buttonLabel = 'Read Guide',
    buttonUrl = '#',
    bgColor = '#f8fafc',
    align = 'center',
  } = block.content;

  return (
    <div
      style={{
        background: bgColor,
        borderRadius: 12,
        padding: '20px',
        margin: '8px 0',
        textAlign: align,
        border: '1px solid #e2e8f0',
        boxSizing: 'border-box',
      }}
    >
      {/* Emoji inline left of title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start', gap: 8, marginBottom: 8 }}>
        {icon && <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{icon}</span>}
        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{title}</h4>
      </div>
      <p style={{ margin: '0 0 14px 0', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{description}</p>
      {buttonLabel && (
        <a
          href={buttonUrl}
          onClick={(e) => e.preventDefault()}
          style={{
            display: 'inline-block',
            background: '#2563eb',
            color: '#ffffff',
            padding: '7px 14px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          {buttonLabel}
        </a>
      )}
    </div>
  );
};
