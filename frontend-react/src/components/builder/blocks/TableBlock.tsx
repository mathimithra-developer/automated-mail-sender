import React from 'react';
import { TableBlockData } from '../types';

interface TableBlockProps {
  block: TableBlockData;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const TableBlock: React.FC<TableBlockProps> = ({ block }) => {
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
    <div style={{ padding: '4px 0', width: '100%', boxSizing: 'border-box' }}>
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
    </div>
  );
};
