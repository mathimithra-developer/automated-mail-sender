import React from 'react';
import { HtmlBlockData } from '../types';
import { Code2 } from 'lucide-react';

interface HtmlBlockProps {
  block: HtmlBlockData;
  isSelected: boolean;
  onSelect: () => void;
}

export const HtmlBlock: React.FC<HtmlBlockProps> = ({
  block,
  isSelected,
  onSelect,
}) => {
  const { html = '<div style="padding:16px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;text-align:center;color:#475569;">Custom HTML Block Content</div>' } = block.content;

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
      {/* Explicit Flagged Label for Custom HTML render */}
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

      {/* Controlled dangerouslySetInnerHTML escape hatch */}
      <div
        dangerouslySetInnerHTML={{ __html: html || '<!-- Custom HTML -->' }}
        style={{ pointerEvents: 'none' }}
      />

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
          HTML
        </div>
      )}
    </div>
  );
};
