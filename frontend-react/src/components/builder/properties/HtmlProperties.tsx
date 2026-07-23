import React from 'react';
import { HtmlBlockData } from '../types';

interface HtmlPropertiesProps {
  block: HtmlBlockData;
  onChange: (updatedContent: HtmlBlockData['content']) => void;
}

export const HtmlProperties: React.FC<HtmlPropertiesProps> = ({
  block,
  onChange,
}) => {
  const { html = '' } = block.content;

  const updateProp = <K extends keyof HtmlBlockData['content']>(
    key: K,
    value: HtmlBlockData['content'][K]
  ) => {
    onChange({
      ...block.content,
      [key]: value,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
          HTML Properties
        </h4>
      </div>

      {/* HTML Content Textarea */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Custom HTML Code</label>
        <textarea
          value={html}
          onChange={(e) => updateProp('html', e.target.value)}
          placeholder="<div>Write custom HTML code...</div>"
          rows={12}
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: 12,
            fontFamily: 'Consolas, Monaco, monospace',
            borderRadius: 6,
            border: '1px solid #cbd5e1',
            background: '#0f172a',
            color: '#f8fafc',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      </div>
    </div>
  );
};
