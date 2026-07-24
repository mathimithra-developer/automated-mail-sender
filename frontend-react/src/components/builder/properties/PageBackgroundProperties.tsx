import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, Trash2, RefreshCw } from 'lucide-react';
import { GlobalTheme } from '../types';

interface PageBackgroundPropertiesProps {
  theme: GlobalTheme;
  onUpdateTheme: (theme: Partial<GlobalTheme>) => void;
}

export const PageBackgroundProperties: React.FC<PageBackgroundPropertiesProps> = ({
  theme,
  onUpdateTheme,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    pageBackgroundColor = '#f3f4f6',
    pageBackgroundImage = '',
    pageBackgroundRepeat = 'no-repeat',
    pageBackgroundSize = 'cover',
    pageBackgroundPosition = 'center',
    pageBackgroundOpacity = 1,
  } = theme;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpe?g|webp|gif|svg\+xml)$/i)) {
      alert('Please select a valid image file (PNG, JPG, WEBP, GIF, SVG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        onUpdateTheme({
          pageBackgroundImage: reader.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Background Color */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Page Color</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="color"
            value={pageBackgroundColor}
            onChange={(e) => onUpdateTheme({ pageBackgroundColor: e.target.value })}
            style={{ width: 36, height: 36, padding: 2, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
          />
          <input
            type="text"
            value={pageBackgroundColor}
            onChange={(e) => onUpdateTheme({ pageBackgroundColor: e.target.value })}
            style={{ flex: 1, height: 36, padding: '0 10px', fontSize: 13, fontFamily: 'monospace', borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Upload Background Image */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Workspace Background Image</label>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        {pageBackgroundImage ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Thumbnail Preview */}
            <div
              style={{
                position: 'relative',
                height: 100,
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                backgroundImage: `url(${pageBackgroundImage})`,
                backgroundRepeat: pageBackgroundRepeat,
                backgroundSize: pageBackgroundSize,
                backgroundPosition: pageBackgroundPosition,
                opacity: pageBackgroundOpacity,
                overflow: 'hidden',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
              }}
            />

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  flex: 1,
                  height: 34,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#2563eb',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <RefreshCw size={13} /> Replace Image
              </button>
              <button
                type="button"
                onClick={() => onUpdateTheme({ pageBackgroundImage: '' })}
                style={{
                  height: 34,
                  padding: '0 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#dc2626',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              height: 40,
              fontSize: 13,
              fontWeight: 700,
              color: '#ffffff',
              background: '#2563eb',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 2px 6px rgba(37,99,235,0.2)',
            }}
          >
            <Upload size={15} /> Upload Background Image
          </button>
        )}
      </div>

      {pageBackgroundImage && (
        <>
          {/* Background Repeat & Size */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b' }}>Repeat</label>
              <select
                value={pageBackgroundRepeat}
                onChange={(e) => onUpdateTheme({ pageBackgroundRepeat: e.target.value as any })}
                style={{ height: 34, padding: '0 8px', fontSize: 12, borderRadius: 6, border: '1px solid #cbd5e1' }}
              >
                <option value="no-repeat">No Repeat</option>
                <option value="repeat">Tile Repeat</option>
                <option value="repeat-x">Repeat Horiz</option>
                <option value="repeat-y">Repeat Vert</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b' }}>Size</label>
              <select
                value={pageBackgroundSize}
                onChange={(e) => onUpdateTheme({ pageBackgroundSize: e.target.value as any })}
                style={{ height: 34, padding: '0 8px', fontSize: 12, borderRadius: 6, border: '1px solid #cbd5e1' }}
              >
                <option value="cover">Cover (Fill)</option>
                <option value="contain">Contain (Fit)</option>
                <option value="auto">Auto (Original)</option>
              </select>
            </div>
          </div>

          {/* Position & Opacity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b' }}>Position</label>
              <select
                value={pageBackgroundPosition}
                onChange={(e) => onUpdateTheme({ pageBackgroundPosition: e.target.value })}
                style={{ height: 34, padding: '0 8px', fontSize: 12, borderRadius: 6, border: '1px solid #cbd5e1' }}
              >
                <option value="center">Center</option>
                <option value="top">Top Center</option>
                <option value="bottom">Bottom Center</option>
                <option value="left">Top Left</option>
                <option value="right">Top Right</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b' }}>Opacity ({Math.round(pageBackgroundOpacity * 100)}%)</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={pageBackgroundOpacity}
                onChange={(e) => onUpdateTheme({ pageBackgroundOpacity: parseFloat(e.target.value) })}
                style={{ height: 34, accentColor: '#2563eb' }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
