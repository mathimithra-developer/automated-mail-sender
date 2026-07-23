import React from 'react';
import { VideoBlockData } from '../types';
import { Play } from 'lucide-react';

interface VideoBlockProps {
  block: VideoBlockData;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({ block }) => {
  const {
    thumbnailUrl = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80',
    videoUrl = 'https://youtube.com',
    alt = 'Video Thumbnail',
    borderRadius = 8,
  } = block.content;

  return (
    <div style={{ textAlign: 'center', width: '100%', padding: '4px 0', boxSizing: 'border-box', overflow: 'hidden' }}>
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
            boxSizing: 'border-box',
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
  );
};
