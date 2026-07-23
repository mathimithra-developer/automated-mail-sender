import React from 'react';
import { SocialBlockData, SocialLinkItem } from '../types';
import { AlignLeft, AlignCenter, AlignRight, Plus, Trash2 } from 'lucide-react';

interface SocialPropertiesProps {
  block: SocialBlockData;
  onChange: (updatedContent: SocialBlockData['content']) => void;
}

export const SocialProperties: React.FC<SocialPropertiesProps> = ({
  block,
  onChange,
}) => {
  const {
    iconSize = 24,
    align = 'center',
    iconColor = '#3b82f6',
    links = [
      { platform: 'twitter', url: 'https://twitter.com' },
      { platform: 'linkedin', url: 'https://linkedin.com' },
      { platform: 'instagram', url: 'https://instagram.com' },
    ],
  } = block.content;

  const updateProp = <K extends keyof SocialBlockData['content']>(
    key: K,
    value: SocialBlockData['content'][K]
  ) => {
    onChange({
      ...block.content,
      [key]: value,
    });
  };

  // Dynamic Array Immutability Handlers
  const handleAddLink = () => {
    const newLinks: SocialLinkItem[] = [
      ...links,
      { platform: 'twitter', url: 'https://twitter.com' },
    ];
    updateProp('links', newLinks);
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    updateProp('links', newLinks);
  };

  const handleUpdateLink = (
    index: number,
    field: keyof SocialLinkItem,
    value: string
  ) => {
    const newLinks = links.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    updateProp('links', newLinks);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
          Social Properties
        </h4>
      </div>

      {/* Alignment & Icon Size Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Alignment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Alignment</label>
          <div style={{ display: 'flex', height: 36, background: '#f1f5f9', borderRadius: 6, padding: 2, gap: 2 }}>
            {(['left', 'center', 'right'] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => updateProp('align', dir)}
                style={{
                  flex: 1,
                  border: 'none',
                  borderRadius: 4,
                  background: align === dir ? '#ffffff' : 'transparent',
                  color: align === dir ? '#2563eb' : '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {dir === 'left' && <AlignLeft size={16} />}
                {dir === 'center' && <AlignCenter size={16} />}
                {dir === 'right' && <AlignRight size={16} />}
              </button>
            ))}
          </div>
        </div>

        {/* Icon Size */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Icon Size (px)</label>
          <input
            type="number"
            min={14}
            max={64}
            value={iconSize}
            onChange={(e) => updateProp('iconSize', Number(e.target.value) || 24)}
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Icon Color Picker */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Icon Color</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="color"
            value={iconColor}
            onChange={(e) => updateProp('iconColor', e.target.value)}
            style={{ width: 38, height: 36, padding: 2, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
          />
          <input
            type="text"
            value={iconColor}
            onChange={(e) => updateProp('iconColor', e.target.value)}
            style={{ flex: 1, height: 36, padding: '0 10px', fontSize: 13, fontFamily: 'monospace', borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Dynamic Social Links List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
            Social Links ({links.length})
          </label>
          <button
            type="button"
            onClick={handleAddLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 700,
              color: '#2563eb',
              background: 'rgba(37, 99, 235, 0.08)',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            <Plus size={13} /> Add Link
          </button>
        </div>

        {links.map((link, idx) => (
          <div
            key={idx}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <select
                value={link.platform}
                onChange={(e) => handleUpdateLink(idx, 'platform', e.target.value)}
                style={{
                  flex: 1,
                  height: 32,
                  padding: '0 8px',
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                }}
              >
                <option value="twitter">Twitter / X</option>
                <option value="linkedin">LinkedIn</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="youtube">YouTube</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="telegram">Telegram</option>
              </select>

              <button
                type="button"
                onClick={() => handleRemoveLink(idx)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  padding: 4,
                }}
                title="Remove link"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <input
              type="text"
              value={link.url}
              onChange={(e) => handleUpdateLink(idx, 'url', e.target.value)}
              placeholder="https://..."
              style={{
                width: '100%',
                height: 32,
                padding: '0 8px',
                fontSize: 12,
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                boxSizing: 'border-box',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
