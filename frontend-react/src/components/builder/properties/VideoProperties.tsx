import React from 'react';
import { VideoBlockData } from '../types';

interface VideoPropertiesProps {
  block: VideoBlockData;
  onChange: (updatedContent: VideoBlockData['content']) => void;
}

export const VideoProperties: React.FC<VideoPropertiesProps> = ({
  block,
  onChange,
}) => {
  const {
    thumbnailUrl = '',
    videoUrl = '',
    alt = '',
    borderRadius = 8,
  } = block.content;

  const updateProp = <K extends keyof VideoBlockData['content']>(
    key: K,
    value: VideoBlockData['content'][K]
  ) => {
    onChange({
      ...block.content,
      [key]: value,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
          Video Properties
        </h4>
      </div>

      {/* Thumbnail URL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Thumbnail Image URL</label>
        <input
          type="text"
          value={thumbnailUrl}
          onChange={(e) => updateProp('thumbnailUrl', e.target.value)}
          placeholder="https://example.com/thumbnail.jpg"
          style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>

      {/* Video URL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Video Target URL</label>
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => updateProp('videoUrl', e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>

      {/* Alt Text & Border Radius Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Alt Text</label>
          <input
            type="text"
            value={alt}
            onChange={(e) => updateProp('alt', e.target.value)}
            placeholder="Video thumbnail"
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Corner Radius</label>
          <input
            type="number"
            min={0}
            max={50}
            value={borderRadius}
            onChange={(e) => updateProp('borderRadius', Number(e.target.value))}
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>
    </div>
  );
};
