import React from 'react';
import { SpacerBlockData } from '../types';

interface SpacerBlockProps {
  block: SpacerBlockData;
  isSelected: boolean;
  onSelect: () => void;
}

export const SpacerBlock: React.FC<SpacerBlockProps> = ({
  block,
  isSelected,
  onSelect,
}) => {
  const { height = 32 } = block.content;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`builder-block-wrapper ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'relative',
        height: `${height}px`,
        margin: '4px 0',
        borderRadius: '6px',
        cursor: 'pointer',
        border: isSelected
          ? '2px solid #3b82f6'
          : '1px dashed #cbd5e1',
        background: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'rgba(241, 245, 249, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.15)' : 'none',
        transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>
        Spacer ({height}px)
      </span>

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
          Spacer
        </div>
      )}
    </div>
  );
};
