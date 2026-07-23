import React from 'react';
import { DividerBlockData } from '../types';

interface DividerBlockProps {
  block: DividerBlockData;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const DividerBlock: React.FC<DividerBlockProps> = ({ block }) => {
  const {
    style = 'solid',
    thickness = 1,
    color = '#e2e8f0',
    paddingTop = 16,
    paddingBottom = 16,
  } = block.content;

  return (
    <div style={{ padding: `${paddingTop}px 0 ${paddingBottom}px`, width: '100%', boxSizing: 'border-box' }}>
      <hr
        style={{
          border: 'none',
          borderTop: `${thickness}px ${style} ${color}`,
          margin: 0,
        }}
      />
    </div>
  );
};
