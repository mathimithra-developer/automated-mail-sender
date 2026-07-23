import React from 'react';
import { PollBlockData } from '../types';

interface PollBlockProps {
  block: PollBlockData;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const PollBlock: React.FC<PollBlockProps> = ({ block }) => {
  const {
    question = 'How satisfied are you with our service?',
    align = 'center',
    options = [
      { emoji: '😍', label: 'Very Satisfied', url: '#' },
      { emoji: '🙂', label: 'Satisfied', url: '#' },
      { emoji: '😐', label: 'Neutral', url: '#' },
      { emoji: '🙁', label: 'Unsatisfied', url: '#' },
    ],
  } = block.content;

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        background: '#ffffff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ textAlign: align }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
          {question}
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {options.map((opt, idx) => (
            <a
              key={idx}
              href={opt.url || '#'}
              onClick={(e) => e.preventDefault()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#0f172a',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '13px',
                pointerEvents: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '16px' }}>{opt.emoji || '❓'}</span>
                <span>{opt.label || `Option ${idx + 1}`}</span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Vote</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
