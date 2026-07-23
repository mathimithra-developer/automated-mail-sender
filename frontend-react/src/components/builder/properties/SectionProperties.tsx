import React from 'react';
import { SectionData, ColumnData } from '../types';
import { Plus, Trash2 } from 'lucide-react';

interface SectionPropertiesProps {
  section: SectionData;
  onUpdateSection: (updates: Partial<SectionData>) => void;
  onAddColumn: () => void;
  onRemoveColumn: (columnId: string) => void;
  onUpdateColumn: (columnId: string, updates: any) => void;
}

export const SectionProperties: React.FC<SectionPropertiesProps> = ({
  section,
  onUpdateSection,
  onAddColumn,
  onRemoveColumn,
  onUpdateColumn,
}) => {
  const {
    background = '#ffffff',
    padding = '24px 20px',
    visibility = 'all',
    columns = [],
  } = section;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
          Section Settings
        </h4>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#2563eb', background: 'rgba(37, 99, 235, 0.1)', padding: '2px 8px', borderRadius: 4 }}>
          {columns.length} Column Layout
        </span>
      </div>

      {/* Section Background Color */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Section Background</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="color"
            value={background}
            onChange={(e) => onUpdateSection({ background: e.target.value })}
            style={{ width: 38, height: 36, padding: 2, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
          />
          <input
            type="text"
            value={background}
            onChange={(e) => onUpdateSection({ background: e.target.value })}
            style={{ flex: 1, height: 36, padding: '0 10px', fontSize: 13, fontFamily: 'monospace', borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Section Padding */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Section Padding</label>
        <input
          type="text"
          value={padding}
          onChange={(e) => onUpdateSection({ padding: e.target.value })}
          placeholder="e.g. 24px 20px"
          style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>

      {/* Visibility */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Display Visibility</label>
        <select
          value={visibility}
          onChange={(e) => onUpdateSection({ visibility: e.target.value as any })}
          style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1' }}
        >
          <option value="all">All Devices (Desktop & Mobile)</option>
          <option value="desktop">Desktop Only</option>
          <option value="mobile">Mobile Only</option>
        </select>
      </div>

      {/* ── COLUMNS LIST EDITOR ────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
            Columns ({columns.length})
          </label>
          <button
            type="button"
            onClick={onAddColumn}
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
            <Plus size={13} /> Add Column
          </button>
        </div>

        {columns.map((col: ColumnData, idx: number) => (
          <div
            key={col.id}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                Column #{idx + 1} ({col.components.length} blocks)
              </span>
              {columns.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveColumn(col.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}
                  title="Remove Column"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 11, color: '#64748b' }}>Width</label>
                <input
                  type="text"
                  value={col.width || ''}
                  onChange={(e) => onUpdateColumn(col.id, { width: e.target.value })}
                  placeholder="50%"
                  style={{ width: '100%', height: 30, padding: '0 6px', fontSize: 12, borderRadius: 4, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, color: '#64748b' }}>Padding</label>
                <input
                  type="text"
                  value={col.styles?.padding || ''}
                  onChange={(e) =>
                    onUpdateColumn(col.id, {
                      styles: { ...col.styles, padding: e.target.value },
                    })
                  }
                  placeholder="0px"
                  style={{ width: '100%', height: 30, padding: '0 6px', fontSize: 12, borderRadius: 4, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
