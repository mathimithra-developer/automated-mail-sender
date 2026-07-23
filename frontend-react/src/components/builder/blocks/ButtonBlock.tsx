import React from 'react';
import { ButtonBlockData } from '../types';

interface ButtonBlockProps {
  block: ButtonBlockData;
  isSelected?: boolean;
  onSelect?: () => void;
  onChange?: (updatedContent: ButtonBlockData['content']) => void;
}

export const ButtonBlock: React.FC<ButtonBlockProps> = ({ block }) => {
  const {
    label = 'Click Here',
    url = '#',
    backgroundColor = '#2563eb',
    color = '#ffffff',
    borderRadius = 6,
    align = 'center',
    paddingX = 24,
    paddingY = 12,
    shadow = true,
  } = block.content;

  return (
    <div style={{ textAlign: align, width: '100%', padding: '4px 0', boxSizing: 'border-box' }}>
      <a
        href={url || '#'}
        onClick={(e) => e.preventDefault()}
        style={{
          display: 'inline-block',
          backgroundColor: backgroundColor,
          color: color,
          padding: `${paddingY}px ${paddingX}px`,
          borderRadius: `${borderRadius}px`,
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '14px',
          boxShadow: shadow ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
          transition: 'all 0.15s ease',
          pointerEvents: 'none',
        }}
      >
        {label || 'Button Label'}
      </a>
    </div>
  );
};
