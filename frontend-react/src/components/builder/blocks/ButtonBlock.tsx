import React from 'react';
import { ButtonBlockData } from '../types';

interface ButtonBlockProps {
  block: ButtonBlockData;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updatedContent: ButtonBlockData['content']) => void;
}

export const ButtonBlock: React.FC<ButtonBlockProps> = ({
  block,
  isSelected,
  onSelect,
}) => {
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
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`builder-block-wrapper ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'relative',
        padding: '12px 16px',
        margin: '4px 0',
        borderRadius: '6px',
        cursor: 'pointer',
        border: isSelected ? '2px solid #3b82f6' : '1px dashed transparent',
        boxShadow: isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.15)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      <div style={{ textAlign: align }}>
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

      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: -10,
            right: 12,
            background: '#3b82f6',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            pointerEvents: 'none',
          }}
        >
          Button
        </div>
      )}
    </div>
  );
};
