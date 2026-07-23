import React from 'react';
import { HtmlBlockData } from '../types';
import { Code2 } from 'lucide-react';

interface HtmlBlockProps {
  block: HtmlBlockData;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const HtmlBlock: React.FC<HtmlBlockProps> = ({ block }) => {
  const { html = '<div style="padding:16px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;text-align:center;color:#475569;">Custom HTML Block Content</div>' } = block.content;

  return (
    <div style={{ padding: '4px 0', width: '100%', boxSizing: 'border-box' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '11px',
          fontWeight: 700,
          color: '#f59e0b',
          background: 'rgba(245, 158, 11, 0.1)',
          padding: '4px 10px',
          borderRadius: 4,
          marginBottom: 8,
          width: 'fit-content',
        }}
      >
        <Code2 size={13} />
        <span>Custom HTML — renders as-is</span>
      </div>

      <div
        dangerouslySetInnerHTML={{ __html: html || '<!-- Custom HTML -->' }}
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};
