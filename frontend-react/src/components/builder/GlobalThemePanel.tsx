import React, { useState } from 'react';
import { GlobalTheme } from './types';
import { PageBackgroundProperties } from './properties/PageBackgroundProperties';
import { EmailBodyProperties } from './properties/EmailBodyProperties';
import { ChevronDown, ChevronRight, Palette, Layout, Type } from 'lucide-react';

interface GlobalThemePanelProps {
  theme: GlobalTheme;
  onUpdateTheme: (theme: Partial<GlobalTheme>) => void;
}

export const GlobalThemePanel: React.FC<GlobalThemePanelProps> = ({
  theme,
  onUpdateTheme,
}) => {
  const [openSections, setOpenSections] = useState({
    pageBg: true,
    emailBody: true,
    typography: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const {
    fontFamily = 'Inter, sans-serif',
    textColor = '#18181b',
    linkColor = '#2563eb',
    buttonColor = '#2563eb',
  } = theme;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 20px' }}>
      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
          Page & Workspace Styling
        </h4>
        <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#64748b' }}>
          Configure workspace page background image, email body canvas, and typography
        </p>
      </div>

      {/* ── 1. Page Background Section ── */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', background: '#ffffff' }}>
        <button
          type="button"
          onClick={() => toggleSection('pageBg')}
          style={{
            width: '100%',
            padding: '10px 14px',
            background: '#f8fafc',
            border: 'none',
            borderBottom: openSections.pageBg ? '1px solid #e2e8f0' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 13,
            fontWeight: 700,
            color: '#0f172a',
            cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Palette size={15} style={{ color: '#2563eb' }} /> Page Background
          </span>
          {openSections.pageBg ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </button>

        {openSections.pageBg && (
          <div style={{ padding: 14 }}>
            <PageBackgroundProperties theme={theme} onUpdateTheme={onUpdateTheme} />
          </div>
        )}
      </div>

      {/* ── 2. Email Body Section ── */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', background: '#ffffff' }}>
        <button
          type="button"
          onClick={() => toggleSection('emailBody')}
          style={{
            width: '100%',
            padding: '10px 14px',
            background: '#f8fafc',
            border: 'none',
            borderBottom: openSections.emailBody ? '1px solid #e2e8f0' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 13,
            fontWeight: 700,
            color: '#0f172a',
            cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layout size={15} style={{ color: '#2563eb' }} /> Email Body Canvas
          </span>
          {openSections.emailBody ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </button>

        {openSections.emailBody && (
          <div style={{ padding: 14 }}>
            <EmailBodyProperties theme={theme} onUpdateTheme={onUpdateTheme} />
          </div>
        )}
      </div>

      {/* ── 3. Base Typography & Palette Section ── */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', background: '#ffffff' }}>
        <button
          type="button"
          onClick={() => toggleSection('typography')}
          style={{
            width: '100%',
            padding: '10px 14px',
            background: '#f8fafc',
            border: 'none',
            borderBottom: openSections.typography ? '1px solid #e2e8f0' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 13,
            fontWeight: 700,
            color: '#0f172a',
            cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Type size={15} style={{ color: '#2563eb' }} /> Base Typography & Palette
          </span>
          {openSections.typography ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </button>

        {openSections.typography && (
          <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
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

            {/* Base Text Color */}
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

            {/* Link & Button Color Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
        )}
      </div>
    </div>
  );
};
