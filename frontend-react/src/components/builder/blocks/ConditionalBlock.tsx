import React from 'react';
import { ConditionalBlockData } from '../types';
import { GitMerge } from 'lucide-react';

interface ConditionalBlockProps {
  block: ConditionalBlockData;
  isSelected: boolean;
  onSelect: () => void;
}

export const ConditionalBlock: React.FC<ConditionalBlockProps> = ({
  block,
  isSelected,
  onSelect,
}) => {
  const {
    condition = "user.plan === 'pro'",
    ifTrueContent = '🎉 Special Pro Member Offer: Get 50% Off Lifetime Upgrades!',
    ifFalseContent = '⚡ Upgrade to Pro today and unlock 100+ Premium Templates!',
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
        padding: '16px',
        margin: '4px 0',
        borderRadius: '8px',
        cursor: 'pointer',
        border: isSelected ? '2px solid #8b5cf6' : '1px dashed #8b5cf6',
        background: 'rgba(139, 92, 246, 0.03)',
        boxShadow: isSelected
          ? '0 0 0 3px rgba(139, 92, 246, 0.15)'
          : 'none',
        transition: 'all 0.15s',
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

      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: -10,
            right: 12,
            background: '#8b5cf6',
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
          Conditional logic
        </div>
      )}
    </div>
  );
};
