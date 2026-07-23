import React from 'react';
import { TableBlockData } from '../types';

interface TableBlockProps {
  block: TableBlockData;
  isSelected: boolean;
  onSelect: () => void;
}

export const TableBlock: React.FC<TableBlockProps> = ({
  block,
  isSelected,
  onSelect,
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
      ['Discount', '1', '-$5.00'],
    ],
  } = block.content;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`builder-block-wrapper ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'relative',
        padding: '12px 16px',
        margin: '4px 0',
        borderRadius: '6px',
        cursor: 'pointer',
        border: isSelected ? '2px solid #3b82f6' : '1px dashed transparent',
        boxShadow: isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.15)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
            border: `1px solid ${borderColor}`,
          }}
        >
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  style={{
                    backgroundColor: headerBg,
                    color: headerTextColor,
                    padding: '10px 12px',
                    textAlign: 'left',
                    fontWeight: 700,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  {h || `Header ${i + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => {
              const isEven = rIdx % 2 === 0;
              const bg = stripedRows && !isEven ? 'rgba(241, 245, 249, 0.5)' : '#ffffff';
              return (
                <tr key={rIdx} style={{ backgroundColor: bg }}>
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      style={{
                        padding: '10px 12px',
                        color: '#334155',
                        border: `1px solid ${borderColor}`,
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: -10,
            right: 12,
            background: '#3b82f6',
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            pointerEvents: 'none',
          }}
        >
          Table ({headers.length}x{rows.length})
        </div>
      )}
    </div>
  );
};
