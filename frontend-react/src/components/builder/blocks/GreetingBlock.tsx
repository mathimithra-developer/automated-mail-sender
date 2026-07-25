import React from 'react';
import { GreetingBlockData } from '../types';

interface GreetingBlockProps {
  block: GreetingBlockData;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const GreetingBlock: React.FC<GreetingBlockProps> = ({ block }) => {
  const { greeting = 'Hello', variable = 'customer.firstName', emoji = '👋', fontSize = 20, color = '#0f172a', align = 'left' } = block.content;

  return (
    <div style={{ textAlign: align, width: '100%', padding: '6px 0', boxSizing: 'border-box' }}>
      <h3 style={{ margin: 0, fontSize: `${fontSize}px`, fontWeight: 700, color }}>
        {greeting} <span style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: '0.9em' }}>{`{{${variable}}}`}</span> {emoji}
      </h3>
    </div>
  );
};
