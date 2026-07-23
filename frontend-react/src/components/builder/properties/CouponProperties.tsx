import React from 'react';
import { CouponBlockData } from '../types';

interface CouponPropertiesProps {
  block: CouponBlockData;
  onChange: (updatedContent: CouponBlockData['content']) => void;
}

export const CouponProperties: React.FC<CouponPropertiesProps> = ({
  block,
  onChange,
}) => {
  const {
    headline = 'SPECIAL PROMO DISCOUNT',
    headlineColor = '#1e293b',
    discount = '20% OFF',
    code = 'SAVE20NOW',
    subtext = 'Use this code at checkout to claim your savings.',
    backgroundColor = '#f8fafc',
    borderColor = '#3b82f6',
  } = block.content;

  const updateProp = <K extends keyof CouponBlockData['content']>(
    key: K,
    value: CouponBlockData['content'][K]
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
          Coupon Properties
        </h4>
      </div>

      {/* Coupon Headline & Headline Color */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Headline Text</label>
        <input
          type="text"
          value={headline}
          onChange={(e) => updateProp('headline', e.target.value)}
          placeholder="SPECIAL PROMO DISCOUNT"
          style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Headline Color</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="color"
            value={headlineColor}
            onChange={(e) => updateProp('headlineColor', e.target.value)}
            style={{ width: 38, height: 36, padding: 2, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
          />
          <input
            type="text"
            value={headlineColor}
            onChange={(e) => updateProp('headlineColor', e.target.value)}
            style={{ flex: 1, height: 36, padding: '0 10px', fontSize: 13, fontFamily: 'monospace', borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Discount & Code Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Discount Text</label>
          <input
            type="text"
            value={discount}
            onChange={(e) => updateProp('discount', e.target.value)}
            placeholder="20% OFF"
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Promo Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => updateProp('code', e.target.value)}
            placeholder="SAVE20NOW"
            style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Subtext */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Sub-Text</label>
        <input
          type="text"
          value={subtext}
          onChange={(e) => updateProp('subtext', e.target.value)}
          placeholder="Use this code at checkout..."
          style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>

      {/* Colors Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>BG Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => updateProp('backgroundColor', e.target.value)}
              style={{ width: 32, height: 32, padding: 2, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => updateProp('backgroundColor', e.target.value)}
              style={{ width: '100%', height: 32, padding: '0 6px', fontSize: 11, fontFamily: 'monospace', borderRadius: 6, border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Border Color</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="color"
              value={borderColor}
              onChange={(e) => updateProp('borderColor', e.target.value)}
              style={{ width: 32, height: 32, padding: 2, borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
            />
            <input
              type="text"
              value={borderColor}
              onChange={(e) => updateProp('borderColor', e.target.value)}
              style={{ width: '100%', height: 32, padding: '0 6px', fontSize: 11, fontFamily: 'monospace', borderRadius: 6, border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
