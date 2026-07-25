import React from 'react';
import { CodeBlockData } from '../types';

export const CodeBlock: React.FC<{ block: CodeBlockData }> = ({ block }) => {
  const { code = 'const sendMail = () => {};', language = 'javascript', bgColor = '#0f172a', textColor = '#38bdf8' } = block.content;

  return (
    <div
      style={{
        background: bgColor,
        borderRadius: 8,
        padding: '14px 16px',
        margin: '8px 0',
        fontFamily: 'Consolas, Monaco, monospace',
        fontSize: 13,
        color: textColor,
        overflowX: 'auto',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      <span style={{ position: 'absolute', top: 6, right: 10, fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>{language}</span>
      <pre style={{ margin: 0, fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>{code}</pre>
    </div>
  );
};
