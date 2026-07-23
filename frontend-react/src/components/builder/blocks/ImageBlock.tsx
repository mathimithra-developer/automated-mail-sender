import React from 'react';
import { ImageBlockData } from '../types';

interface ImageBlockProps {
  block: ImageBlockData;
  isSelected: boolean;
  onSelect: () => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
  block,
  isSelected,
  onSelect,
}) => {
  const {
    url = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    alt = 'Image',
    borderRadius = 8,
    align = 'center',
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
        <img
          src={url}
          alt={alt}
          style={{
            maxWidth: '100%',
            height: 'auto',
            borderRadius: `${borderRadius}px`,
            display: 'inline-block',
          }}
        />
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
          Image
        </div>
      )}
    </div>
  );
};
