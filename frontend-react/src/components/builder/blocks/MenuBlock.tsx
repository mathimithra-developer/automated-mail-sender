import React from 'react';
import { MenuBlockData } from '../types';

interface MenuBlockProps {
  block: MenuBlockData;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const MenuBlock: React.FC<MenuBlockProps> = ({ block }) => {
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
    <div style={{ padding: '4px 0', width: '100%', boxSizing: 'border-box' }}>
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
    </div>
  );
};
