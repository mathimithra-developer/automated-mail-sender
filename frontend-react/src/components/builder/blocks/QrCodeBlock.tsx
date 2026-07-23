import React from 'react';
import { QrCodeBlockData } from '../types';

interface QrCodeBlockProps {
  block: QrCodeBlockData;
  isSelected: boolean;
  onSelect: () => void;
}

export const QrCodeBlock: React.FC<QrCodeBlockProps> = ({
  block,
  isSelected,
  onSelect,
}) => {
  const {
    url = 'https://example.com',
    size = 140,
    caption = 'Scan to open link',
    align = 'center',
  } = block.content;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    url || 'https://example.com'
  )}`;

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
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <img
            src={qrImageUrl}
            alt={caption || 'QR Code'}
            style={{
              width: size,
              height: size,
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              padding: 4,
              background: '#ffffff',
            }}
          />
          {caption && (
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
              {caption}
            </span>
          )}
        </div>
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
          QR Code
        </div>
      )}
    </div>
  );
};
