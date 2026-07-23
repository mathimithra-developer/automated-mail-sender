import React from 'react';
import { VideoBlockData } from '../types';
import { Play } from 'lucide-react';

interface VideoBlockProps {
  block: VideoBlockData;
  isSelected: boolean;
  onSelect: () => void;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({
  block,
  isSelected,
  onSelect,
}) => {
  const {
    thumbnailUrl = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80',
    videoUrl = 'https://youtube.com',
    alt = 'Video Thumbnail',
    borderRadius = 8,
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
      <div style={{ textAlign: 'center' }}>
        <a
          href={videoUrl || '#'}
          onClick={(e) => e.preventDefault()}
          style={{
            position: 'relative',
            display: 'inline-block',
            maxWidth: '100%',
            borderRadius: `${borderRadius}px`,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <img
            src={thumbnailUrl}
            alt={alt}
            style={{
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: `${borderRadius}px`,
            }}
          />
          {/* Centered Play Button Overlay */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '2px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          >
            <Play size={24} style={{ marginLeft: 3, fill: '#ffffff' }} />
          </div>
        </a>
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
          Video
        </div>
      )}
    </div>
  );
};
