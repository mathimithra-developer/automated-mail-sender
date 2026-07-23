import React from 'react';
import { TableBlockData } from '../types';
import { Plus, Trash2 } from 'lucide-react';

interface TablePropertiesProps {
  block: TableBlockData;
  onChange: (updatedContent: TableBlockData['content']) => void;
}

export const TableProperties: React.FC<TablePropertiesProps> = ({
  block,
  onChange,
}) => {
  const {
    headerBg = '#f1f5f9',
    headerTextColor = '#0f172a',
    stripedRows = true,
    borderColor = '#cbd5e1',
    headers = ['Item', 'Quantity', 'Price'],
    rows = [
      ['Standard Plan', '1', '$29.00'],
      ['Add-on Credits', '2', '$10.00'],
    ],
  } = block.content;

  const updateProp = <K extends keyof TableBlockData['content']>(
    key: K,
    value: TableBlockData['content'][K]
  ) => {
    onChange({
      ...block.content,
      [key]: value,
    });
  };

  // ── 2D GRID IMMUTABILITY HANDLERS ──────────────────────────────────────────

  // Edit Header Cell
  const handleHeaderChange = (cIdx: number, val: string) => {
    const newHeaders = headers.map((h, i) => (i === cIdx ? val : h));
    updateProp('headers', newHeaders);
  };

  // Edit Data Cell
  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    const newRows = rows.map((r, i) => {
      if (i === rIdx) {
        return r.map((cell, j) => (j === cIdx ? val : cell));
      }
      return r;
    });
    updateProp('rows', newRows);
  };

  // Add Row
  const handleAddRow = () => {
    const newRow = new Array(headers.length).fill('Cell');
    updateProp('rows', [...rows, newRow]);
  };

  // Remove Row
  const handleRemoveRow = (rIdx: number) => {
    if (rows.length <= 1) return;
    updateProp(
      'rows',
      rows.filter((_, i) => i !== rIdx)
    );
  };

  // Add Column across whole 2D structure
  const handleAddColumn = () => {
    const colNum = headers.length + 1;
    const newHeaders = [...headers, `Header ${colNum}`];
    const newRows = rows.map((r) => [...r, 'Cell']);
    onChange({
      ...block.content,
      headers: newHeaders,
      rows: newRows,
    });
  };

  // Remove Column across whole 2D structure
  const handleRemoveColumn = (cIdx: number) => {
    if (headers.length <= 1) return;
    const newHeaders = headers.filter((_, i) => i !== cIdx);
    const newRows = rows.map((r) => r.filter((_, i) => i !== cIdx));
    onChange({
      ...block.content,
      headers: newHeaders,
      rows: newRows,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
          Table Properties
        </h4>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>
          {headers.length} Cols x {rows.length} Rows
        </span>
      </div>

      {/* Colors Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* Header BG */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Header BG</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="color"
              value={headerBg}
              onChange={(e) => updateProp('headerBg', e.target.value)}
              style={{ width: 32, height: 32, padding: 2, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
            />
            <input
              type="text"
              value={headerBg}
              onChange={(e) => updateProp('headerBg', e.target.value)}
              style={{ width: '100%', height: 32, padding: '0 6px', fontSize: 11, fontFamily: 'monospace', borderRadius: 6, border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        {/* Header Text Color */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Header Text</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="color"
              value={headerTextColor}
              onChange={(e) => updateProp('headerTextColor', e.target.value)}
              style={{ width: 32, height: 32, padding: 2, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
            />
            <input
              type="text"
              value={headerTextColor}
              onChange={(e) => updateProp('headerTextColor', e.target.value)}
              style={{ width: '100%', height: 32, padding: '0 6px', fontSize: 11, fontFamily: 'monospace', borderRadius: 6, border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>
      </div>

      {/* Border Color & Striped Rows */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Border Color</label>
          <input
            type="color"
            value={borderColor}
            onChange={(e) => updateProp('borderColor', e.target.value)}
            style={{ width: '100%', height: 34, padding: 2, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18 }}>
          <input
            type="checkbox"
            id="stripedRows"
            checked={stripedRows}
            onChange={(e) => updateProp('stripedRows', e.target.checked)}
            style={{ width: 16, height: 16, accentColor: '#2563eb', cursor: 'pointer' }}
          />
          <label htmlFor="stripedRows" style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
            Striped Rows
          </label>
        </div>
      </div>

      {/* ── 2D GRID EDITOR SECTION ────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
            Table Content Editor
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={handleAddColumn}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                fontSize: 11,
                fontWeight: 700,
                color: '#2563eb',
                background: 'rgba(37, 99, 235, 0.08)',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              <Plus size={13} /> + Col
            </button>
            <button
              type="button"
              onClick={handleAddRow}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                fontSize: 11,
                fontWeight: 700,
                color: '#16a34a',
                background: 'rgba(22, 163, 74, 0.08)',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              <Plus size={13} /> + Row
            </button>
          </div>
        </div>

        {/* Headers Editor */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Column Headers
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
            {headers.map((h, cIdx) => (
              <div key={cIdx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="text"
                  value={h}
                  onChange={(e) => handleHeaderChange(cIdx, e.target.value)}
                  placeholder={`Header ${cIdx + 1}`}
                  style={{
                    flex: 1,
                    height: 30,
                    padding: '0 8px',
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 4,
                    border: '1px solid #cbd5e1',
                  }}
                />
                {headers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveColumn(cIdx)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}
                    title="Remove column"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Rows Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Row Data
          </span>
          {rows.map((row, rIdx) => (
            <div
              key={rIdx}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>
                  Row #{rIdx + 1}
                </span>
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(rIdx)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}
                    title="Remove row"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {row.map((cell, cIdx) => (
                  <input
                    key={cIdx}
                    type="text"
                    value={cell}
                    onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                    placeholder={`${headers[cIdx] || 'Cell'}`}
                    style={{
                      height: 28,
                      padding: '0 8px',
                      fontSize: 12,
                      borderRadius: 4,
                      border: '1px solid #cbd5e1',
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
