import React from 'react';
import { EmojiRowBlockData } from '../types';

export const EmojiRowBlock: React.FC<{ block: EmojiRowBlockData }> = ({ block }) => {
  const { emoji = block.content.emojis?.[0] || '🚀', text = '', isParagraph = false, size = 28, align = 'center' } = block.content;

  const alignmentStyles: Record<string, string> = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };

  return (
    <div style={{ textAlign: align, width: '100%', padding: '8px 0', boxSizing: 'border-box' }}>
      <span
        style={{
          display: 'inline-flex',
          flexDirection: isParagraph ? 'column' : 'row',
          alignItems: isParagraph ? alignmentStyles[align] || 'center' : 'center',
          justifyContent: 'center',
          gap: text ? (isParagraph ? '12px' : '8px') : '0px',
          fontSize: `${size}px`,
          padding: isParagraph ? '12px 16px' : '6px 12px',
          borderRadius: '8px',
          background: 'rgba(241, 245, 249, 0.6)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          transition: 'all 0.15s ease',
          cursor: 'pointer',
          userSelect: 'none',
          color: '#334155',
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          width: isParagraph ? '100%' : 'auto',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          e.currentTarget.style.background = '#eff6ff';
          e.currentTarget.style.borderColor = '#93c5fd';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.background = 'rgba(241, 245, 249, 0.6)';
          e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
        }}
      >
        <span>{emoji}</span>
        {text && (
          <span
            style={{
              fontSize: isParagraph ? '14px' : `${Math.max(12, size * 0.65)}px`,
              lineHeight: 1.6,
              textAlign: align,
              display: 'block',
              fontWeight: 400,
              color: '#475569',
            }}
          >
            {text}
          </span>
        )}
      </span>
    </div>
  );
};

