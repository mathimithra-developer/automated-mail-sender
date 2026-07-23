import React from 'react';
import { DividerBlockData } from '../types';

interface DividerBlockProps {
  block: DividerBlockData;
  isSelected: boolean;
  onSelect: () => void;
}

export const DividerBlock: React.FC<DividerBlockProps> = ({
  block,
  isSelected,
  onSelect,
}) => {
  const {
    style = 'solid',
    thickness = 1,
    color = '#e2e8f0',
    paddingTop = 16,
    paddingBottom = 16,
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
        padding: `${paddingTop}px 16px ${paddingBottom}px`,
        margin: '4px 0',
        borderRadius: '6px',
        cursor: 'pointer',
        border: isSelected ? '2px solid #3b82f6' : '1px dashed transparent',
        boxShadow: isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.15)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      <hr
        style={{
          border: 'none',
          borderTop: `${thickness}px ${style} ${color}`,
          margin: 0,
        }}
      />

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
          Divider
        </div>
      )}
    </div>
  );
};
