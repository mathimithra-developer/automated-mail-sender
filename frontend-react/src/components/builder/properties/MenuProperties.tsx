import React from 'react';
import { MenuBlockData, MenuLinkItem } from '../types';
import { AlignLeft, AlignCenter, AlignRight, Plus, Trash2 } from 'lucide-react';

interface MenuPropertiesProps {
  block: MenuBlockData;
  onChange: (updatedContent: MenuBlockData['content']) => void;
}

export const MenuProperties: React.FC<MenuPropertiesProps> = ({
  block,
  onChange,
}) => {
  const {
    align = 'center',
    color = '#2563eb',
    fontSize = 14,
    separator = '|',
    links = [
      { label: 'Home', url: '#' },
      { label: 'Shop', url: '#' },
      { label: 'Blog', url: '#' },
      { label: 'Contact', url: '#' },
    ],
  } = block.content;

  const updateProp = <K extends keyof MenuBlockData['content']>(
    key: K,
    value: MenuBlockData['content'][K]
  ) => {
    onChange({
      ...block.content,
      [key]: value,
    });
  };

  // Dynamic Array Immutability Handlers
  const handleAddLink = () => {
    const newLinks: MenuLinkItem[] = [
      ...links,
      { label: 'New Link', url: '#' },
    ];
    updateProp('links', newLinks);
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    updateProp('links', newLinks);
  };

  const handleUpdateLink = (
    index: number,
    field: keyof MenuLinkItem,
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
          Menu Properties
        </h4>
      </div>

      {/* Alignment & Font Size Grid */}
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

        {/* Font Size */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Font Size (px)</label>
          <input
            type="number"
            min={10}
            max={32}
            value={fontSize}
            onChange={(e) => updateProp('fontSize', Number(e.target.value) || 14)}
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Separator & Color Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Separator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Separator</label>
          <input
            type="text"
            value={separator}
            onChange={(e) => updateProp('separator', e.target.value)}
            placeholder="|"
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        {/* Color */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Link Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="color"
              value={color}
              onChange={(e) => updateProp('color', e.target.value)}
              style={{ width: 32, height: 32, padding: 2, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
            />
            <input
              type="text"
              value={color}
              onChange={(e) => updateProp('color', e.target.value)}
              style={{ width: '100%', height: 32, padding: '0 6px', fontSize: 11, fontFamily: 'monospace', borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Menu Links List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
            Menu Items ({links.length})
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
            <Plus size={13} /> Add Item
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
              <input
                type="text"
                value={link.label}
                onChange={(e) => handleUpdateLink(idx, 'label', e.target.value)}
                placeholder="Link Label"
                style={{
                  flex: 1,
                  height: 32,
                  padding: '0 8px',
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  boxSizing: 'border-box',
                }}
              />

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
                title="Remove item"
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
