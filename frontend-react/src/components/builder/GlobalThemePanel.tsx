import React from 'react';
import { GlobalTheme } from './types';

interface GlobalThemePanelProps {
  theme: GlobalTheme;
  onUpdateTheme: (theme: Partial<GlobalTheme>) => void;
}

export const GlobalThemePanel: React.FC<GlobalThemePanelProps> = ({
  theme,
  onUpdateTheme,
}) => {
  const {
    fontFamily = 'Inter, sans-serif',
    backgroundColor = '#f4f4f5',
    textColor = '#18181b',
    linkColor = '#8b5cf6',
    buttonColor = '#8b5cf6',
  } = theme;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 20px' }}>
      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
          Global Styles & Theme
        </h4>
        <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#64748b' }}>
          Controls base typography and default email palette
        </p>
      </div>

      {/* Font Family */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Font Family</label>
        <select
          value={fontFamily}
          onChange={(e) => onUpdateTheme({ fontFamily: e.target.value })}
          style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1' }}
        >
          <option value="Inter, sans-serif">Inter (Modern Sans)</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="Helvetica, sans-serif">Helvetica</option>
          <option value="Georgia, serif">Georgia (Serif)</option>
          <option value="'Courier New', monospace">Courier New (Monospace)</option>
          <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
          <option value="Verdana, sans-serif">Verdana</option>
        </select>
      </div>

      {/* Canvas Outer Background */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Email Outer Background</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => onUpdateTheme({ backgroundColor: e.target.value })}
            style={{ width: 38, height: 36, padding: 2, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
          />
          <input
            type="text"
            value={backgroundColor}
            onChange={(e) => onUpdateTheme({ backgroundColor: e.target.value })}
            style={{ flex: 1, height: 36, padding: '0 10px', fontSize: 13, fontFamily: 'monospace', borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Text Color */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Base Text Color</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="color"
            value={textColor}
            onChange={(e) => onUpdateTheme({ textColor: e.target.value })}
            style={{ width: 38, height: 36, padding: 2, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
          />
          <input
            type="text"
            value={textColor}
            onChange={(e) => onUpdateTheme({ textColor: e.target.value })}
            style={{ flex: 1, height: 36, padding: '0 10px', fontSize: 13, fontFamily: 'monospace', borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Link Color & Button Color Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Link Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="color"
              value={linkColor}
              onChange={(e) => onUpdateTheme({ linkColor: e.target.value })}
              style={{ width: 32, height: 32, padding: 2, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
            />
            <input
              type="text"
              value={linkColor}
              onChange={(e) => onUpdateTheme({ linkColor: e.target.value })}
              style={{ width: '100%', height: 32, padding: '0 6px', fontSize: 11, fontFamily: 'monospace', borderRadius: 6, border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Button Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="color"
              value={buttonColor}
              onChange={(e) => onUpdateTheme({ buttonColor: e.target.value })}
              style={{ width: 32, height: 32, padding: 2, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
            />
            <input
              type="text"
              value={buttonColor}
              onChange={(e) => onUpdateTheme({ buttonColor: e.target.value })}
              style={{ width: '100%', height: 32, padding: '0 6px', fontSize: 11, fontFamily: 'monospace', borderRadius: 6, border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
