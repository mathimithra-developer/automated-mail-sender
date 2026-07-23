import React from 'react';
import { IconsBlockData, IconItem } from '../types';
import { AlignLeft, AlignCenter, AlignRight, Plus, Trash2 } from 'lucide-react';

interface IconsPropertiesProps {
  block: IconsBlockData;
  onChange: (updatedContent: IconsBlockData['content']) => void;
}

export const IconsProperties: React.FC<IconsPropertiesProps> = ({
  block,
  onChange,
}) => {
  const {
    iconSize = 24,
    align = 'center',
    iconColor = '#2563eb',
    icons = [
      { name: 'shield' },
      { name: 'truck' },
      { name: 'gift' },
    ],
  } = block.content;

  const updateProp = <K extends keyof IconsBlockData['content']>(
    key: K,
    value: IconsBlockData['content'][K]
  ) => {
    onChange({
      ...block.content,
      [key]: value,
    });
  };

  const handleAddIcon = () => {
    const newIcons: IconItem[] = [...icons, { name: 'star' }];
    updateProp('icons', newIcons);
  };

  const handleRemoveIcon = (index: number) => {
    updateProp(
      'icons',
      icons.filter((_, i) => i !== index)
    );
  };

  const handleUpdateIcon = (index: number, name: IconItem['name']) => {
    const newIcons = icons.map((item, i) => (i === index ? { ...item, name } : item));
    updateProp('icons', newIcons);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
          Icons Properties
        </h4>
      </div>

      {/* Alignment & Icon Size Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Icon Size (px)</label>
          <input
            type="number"
            min={12}
            max={64}
            value={iconSize}
            onChange={(e) => updateProp('iconSize', Number(e.target.value) || 24)}
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Icon Color */}
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

      {/* Icons List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
            Icon Items ({icons.length})
          </label>
          <button
            type="button"
            onClick={handleAddIcon}
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
            <Plus size={13} /> Add Icon
          </button>
        </div>

        {icons.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select
              value={item.name}
              onChange={(e) => handleUpdateIcon(idx, e.target.value as any)}
              style={{
                flex: 1,
                height: 32,
                padding: '0 8px',
                fontSize: 12,
                fontWeight: 600,
                borderRadius: 4,
                border: '1px solid #cbd5e1',
              }}
            >
              <option value="star">Star</option>
              <option value="heart">Heart</option>
              <option value="check-circle">Check Circle</option>
              <option value="mail">Mail</option>
              <option value="phone">Phone</option>
              <option value="gift">Gift</option>
              <option value="truck">Truck / Shipping</option>
              <option value="shield">Shield / Security</option>
              <option value="clock">Clock / Time</option>
              <option value="thumbs-up">Thumbs Up</option>
            </select>

            <button
              type="button"
              onClick={() => handleRemoveIcon(idx)}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}
              title="Remove icon"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
