import React, { useRef } from 'react';
import { Upload, RefreshCw, Trash2 } from 'lucide-react';
import { GlobalTheme } from '../types';

interface EmailBodyPropertiesProps {
  theme: GlobalTheme;
  onUpdateTheme: (theme: Partial<GlobalTheme>) => void;
}

export const EmailBodyProperties: React.FC<EmailBodyPropertiesProps> = ({
  theme,
  onUpdateTheme,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    bodyBackgroundColor = '#ffffff',
    bodyBackgroundImage = '',
    bodyWidth = 600,
    bodyPadding = 24,
    bodyBorderRadius = 16,
    bodyShadow = '0 4px 20px rgba(0,0,0,0.06)',
  } = theme;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpe?g|webp|gif|svg\+xml)$/i)) {
      alert('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        onUpdateTheme({
          bodyBackgroundImage: reader.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Body Background Color */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Body Background Color</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="color"
            value={bodyBackgroundColor}
            onChange={(e) => onUpdateTheme({ bodyBackgroundColor: e.target.value })}
            style={{ width: 36, height: 36, padding: 2, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
          />
          <input
            type="text"
            value={bodyBackgroundColor}
            onChange={(e) => onUpdateTheme({ bodyBackgroundColor: e.target.value })}
            style={{ flex: 1, height: 36, padding: '0 10px', fontSize: 13, fontFamily: 'monospace', borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Body Background Image */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Body Background Image (Optional)</label>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        {bodyBackgroundImage ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                backgroundImage: `url(${bodyBackgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                height: 32,
                padding: '0 10px',
                fontSize: 12,
                fontWeight: 600,
                color: '#2563eb',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <RefreshCw size={12} /> Replace
            </button>
            <button
              type="button"
              onClick={() => onUpdateTheme({ bodyBackgroundImage: '' })}
              style={{
                height: 32,
                padding: '0 10px',
                fontSize: 12,
                fontWeight: 600,
                color: '#dc2626',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Trash2 size={12} /> Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%',
              height: 36,
              fontSize: 12,
              fontWeight: 600,
              color: '#3b82f6',
              background: '#f0f9ff',
              border: '1px dashed #93c5fd',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Upload size={14} /> Add Body Image
          </button>
        )}
      </div>

      {/* Body Width & Padding */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b' }}>Width ({bodyWidth}px)</label>
          <select
            value={bodyWidth}
            onChange={(e) => onUpdateTheme({ bodyWidth: Number(e.target.value) })}
            style={{ height: 34, padding: '0 8px', fontSize: 12, borderRadius: 6, border: '1px solid #cbd5e1' }}
          >
            <option value={500}>500px (Narrow)</option>
            <option value={600}>600px (Standard Email)</option>
            <option value={640}>640px (Wide)</option>
            <option value={700}>700px (Extra Wide)</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b' }}>Padding ({bodyPadding}px)</label>
          <input
            type="number"
            min="0"
            max="60"
            step="4"
            value={bodyPadding}
            onChange={(e) => onUpdateTheme({ bodyPadding: Number(e.target.value) })}
            style={{ height: 34, padding: '0 8px', fontSize: 12, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Border Radius & Shadow */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b' }}>Border Radius ({bodyBorderRadius}px)</label>
          <input
            type="range"
            min="0"
            max="32"
            step="2"
            value={bodyBorderRadius}
            onChange={(e) => onUpdateTheme({ bodyBorderRadius: Number(e.target.value) })}
            style={{ height: 34, accentColor: '#2563eb' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b' }}>Soft Shadow</label>
          <select
            value={bodyShadow}
            onChange={(e) => onUpdateTheme({ bodyShadow: e.target.value })}
            style={{ height: 34, padding: '0 8px', fontSize: 12, borderRadius: 6, border: '1px solid #cbd5e1' }}
          >
            <option value="none">None</option>
            <option value="0 2px 10px rgba(0,0,0,0.04)">Subtle</option>
            <option value="0 4px 20px rgba(0,0,0,0.06)">Soft (Recommended)</option>
            <option value="0 8px 30px rgba(0,0,0,0.12)">Elevated</option>
          </select>
        </div>
      </div>
    </div>
  );
};
