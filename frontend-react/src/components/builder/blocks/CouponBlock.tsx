import React, { useState } from 'react';
import { CouponBlockData } from '../types';
import { Copy, Check } from 'lucide-react';

interface CouponBlockProps {
  block: CouponBlockData;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const CouponBlock: React.FC<CouponBlockProps> = ({ block }) => {
  const {
    headline = 'SPECIAL PROMO DISCOUNT',
    headlineColor = '#1e293b',
    discount = '20% OFF',
    code = 'SAVE20NOW',
    subtext = 'Use this code at checkout to claim your savings.',
    backgroundColor = '#f8fafc',
    borderColor = '#3b82f6',
  } = block.content;

  const [copied, setCopied] = useState(false);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        margin: '4px 0',
        borderRadius: '8px',
        background: backgroundColor,
        border: `2px dashed ${borderColor}`,
        textAlign: 'center',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: headlineColor, letterSpacing: '0.05em' }}>
          {headline}
        </h4>

        <div style={{ fontSize: '32px', fontWeight: 900, color: borderColor, lineHeight: 1 }}>
          {discount}
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: '#ffffff',
            border: `1px solid ${borderColor}`,
            padding: '6px 16px',
            borderRadius: 6,
            marginTop: 4,
          }}
        >
          <span style={{ fontFamily: 'monospace', fontSize: '16px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.1em' }}>
            {code}
          </span>
          <button
            type="button"
            onClick={handleCopyCode}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: copied ? '#16a34a' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              padding: 2,
            }}
            title="Copy coupon code"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

        {subtext && (
          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748b' }}>
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};
