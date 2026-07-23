import React from 'react';
import { ImageBlockData } from '../types';

interface ImageBlockProps {
  block: ImageBlockData;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ block }) => {
  const {
    url = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    alt = 'Image',
    borderRadius = 8,
    align = 'center',
  } = block.content;

  const imageMargin =
    align === 'center' ? '0 auto' : align === 'right' ? '0 0 0 auto' : '0 auto 0 0';

  return (
    <div style={{ textAlign: align, width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      <img
        src={url}
        alt={alt}
        style={{
          maxWidth: '100%',
          height: 'auto',
          borderRadius: `${borderRadius}px`,
          display: 'block',
          margin: imageMargin,
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
};
