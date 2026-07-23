import React from 'react';
import { ConditionalBlockData } from '../types';
import { GitMerge } from 'lucide-react';

interface ConditionalBlockProps {
  block: ConditionalBlockData;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const ConditionalBlock: React.FC<ConditionalBlockProps> = ({ block }) => {
  const {
    condition = "user.plan === 'pro'",
    ifTrueContent = '🎉 Special Pro Member Offer: Get 50% Off Lifetime Upgrades!',
    ifFalseContent = '⚡ Upgrade to Pro today and unlock 100+ Premium Templates!',
  } = block.content;

  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '8px',
        border: '1px dashed #8b5cf6',
        background: 'rgba(139, 92, 246, 0.03)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Condition Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '12px',
            fontWeight: 700,
            color: '#8b5cf6',
            background: 'rgba(139, 92, 246, 0.08)',
            padding: '4px 10px',
            borderRadius: 4,
            width: 'fit-content',
          }}
        >
          <GitMerge size={14} />
          <span>IF ({condition || 'condition'})</span>
        </div>

        {/* True Branch */}
        <div
          style={{
            borderLeft: '3px solid #22c55e',
            paddingLeft: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#22c55e', textTransform: 'uppercase' }}>
            TRUE Branch
          </span>
          <div style={{ fontSize: '13px', color: '#334155' }}>
            {ifTrueContent || 'Content when condition is true'}
          </div>
        </div>

        {/* False Branch */}
        <div
          style={{
            borderLeft: '3px solid #ef4444',
            paddingLeft: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase' }}>
            FALSE Branch
          </span>
          <div style={{ fontSize: '13px', color: '#334155' }}>
            {ifFalseContent || 'Content when condition is false'}
          </div>
        </div>
      </div>
    </div>
  );
};
