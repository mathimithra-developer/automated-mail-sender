import React from 'react';
import { LogoBlockData } from '../types';

interface LogoBlockProps {
  block: LogoBlockData;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const LogoBlock: React.FC<LogoBlockProps> = ({ block }) => {
  const { url, alt = 'Company Logo', linkUrl = '', maxWidth = 160, align = 'center', paddingY = 12 } = block.content;

  const content = (
    <img
      src={url || 'https://via.placeholder.com/150x40?text=Company+Logo'}
      alt={alt}
      style={{
        maxWidth: `${maxWidth}px`,
        height: 'auto',
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    />
  );

  return (
    <div style={{ textAlign: align, padding: `${paddingY}px 0`, width: '100%', boxSizing: 'border-box' }}>
      {linkUrl ? (
        <a href={linkUrl} onClick={(e) => e.preventDefault()} style={{ display: 'inline-block' }}>
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
};
