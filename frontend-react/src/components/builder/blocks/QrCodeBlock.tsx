import React from 'react';
import { QrCodeBlockData } from '../types';

interface QrCodeBlockProps {
  block: QrCodeBlockData;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const QrCodeBlock: React.FC<QrCodeBlockProps> = ({ block }) => {
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
    <div style={{ padding: '4px 0', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ textAlign: align }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6, maxWidth: '100%' }}>
          <img
            src={qrImageUrl}
            alt={caption || 'QR Code'}
            style={{
              width: size,
              height: 'auto',
              maxWidth: '100%',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              padding: 4,
              background: '#ffffff',
              display: 'block',
              boxSizing: 'border-box',
            }}
          />
          {caption && (
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
              {caption}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
