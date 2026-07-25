import React from 'react';
import { ContainerBlockData } from '../types';

export const ContainerBlock: React.FC<{ block: ContainerBlockData }> = ({ block }) => {
  const {
    title = 'Container Box Title',
    description = 'Group content inside a styled container card.',
    bgColor = '#f8fafc',
    borderColor = '#cbd5e1',
    borderRadius = 12,
    padding = 20,
  } = block.content;

  return (
    <div
      style={{
        background: bgColor,
        border: `1.5px solid ${borderColor}`,
        borderRadius: `${borderRadius}px`,
        padding: `${padding}px`,
        margin: '8px 0',
        boxSizing: 'border-box',
      }}
    >
      {title && <h4 style={{ margin: '0 0 6px 0', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{title}</h4>}
      {description && <p style={{ margin: 0, fontSize: 14, color: '#475569', lineHeight: 1.5 }}>{description}</p>}
    </div>
  );
};
