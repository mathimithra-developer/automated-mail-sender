import React from 'react';
import { SpacerBlockData } from '../types';

interface SpacerBlockProps {
  block: SpacerBlockData;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const SpacerBlock: React.FC<SpacerBlockProps> = ({ block, isSelected }) => {
  const { height = 32 } = block.content;

  return (
    <div
      style={{
        height: `${height}px`,
        width: '100%',
        boxSizing: 'border-box',
        borderRadius: '4px',
        border: '1px dashed #cbd5e1',
        background: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'rgba(241, 245, 249, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>
        Spacer ({height}px)
      </span>
    </div>
  );
};
