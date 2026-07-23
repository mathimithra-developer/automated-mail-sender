import React from 'react';
import { MenuBlockData } from '../types';

interface MenuBlockProps {
  block: MenuBlockData;
  isSelected: boolean;
  onSelect: () => void;
}

export const MenuBlock: React.FC<MenuBlockProps> = ({
  block,
  isSelected,
  onSelect,
}) => {
  const {
    align = 'center',
    color = '#2563eb',
    fontSize = 14,
    separator = '|',
    links = [
      { label: 'Home', url: '#' },
      { label: 'Shop', url: '#' },
      { label: 'Blog', url: '#' },
      { label: 'Contact', url: '#' },
    ],
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
          gap: 10,
          flexWrap: 'wrap',
          fontSize: `${fontSize}px`,
          fontWeight: 600,
        }}
      >
        {links.map((item, idx) => (
          <React.Fragment key={idx}>
            <a
              href={item.url || '#'}
              onClick={(e) => e.preventDefault()}
              style={{
                color: color,
                textDecoration: 'none',
                pointerEvents: 'none',
              }}
            >
              {item.label || 'Link'}
            </a>
            {idx < links.length - 1 && (
              <span style={{ color: '#94a3b8', userSelect: 'none' }}>{separator}</span>
            )}
          </React.Fragment>
        ))}
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
          Menu ({links.length})
        </div>
      )}
    </div>
  );
};
