import React from 'react';
import { FaqAccordionBlockData } from '../types';

export const FaqBlock: React.FC<{ block: FaqAccordionBlockData }> = ({ block }) => {
  const {
    items = [
      { question: 'How do I customize the template?', answer: 'Click on any section or block to customize text, colors, fonts, and links.' },
      { question: 'Are emails responsive on mobile?', answer: 'Yes! All blocks automatically scale cleanly on mobile devices.' },
    ],
    bgColor = '#ffffff',
    borderColor = '#e2e8f0',
  } = block.content;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '8px 0', width: '100%', boxSizing: 'border-box' }}>
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            background: bgColor,
            border: `1px solid ${borderColor}`,
            borderRadius: 8,
            padding: '12px 16px',
            boxSizing: 'border-box',
          }}
        >
          <h5 style={{ margin: '0 0 6px 0', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            ❓ {item.question}
          </h5>
          <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
            {item.answer}
          </p>
        </div>
      ))}
    </div>
  );
};
