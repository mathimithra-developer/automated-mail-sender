import React from 'react';
import { PricingCardBlockData } from '../types';

export const PricingCardBlock: React.FC<{ block: PricingCardBlockData }> = ({ block }) => {
  const {
    planName = 'Pro Plan',
    price = '$49',
    period = '/month',
    features = ['Unlimited Campaigns', 'Advanced AI Assistant', 'Priority Email Support', 'Custom Branding'],
    ctaLabel = 'Upgrade Now',
    ctaUrl = '#',
    isPopular = true,
    bgColor = '#ffffff',
    accentColor = '#2563eb',
  } = block.content;

  return (
    <div
      style={{
        background: bgColor,
        border: `2px solid ${isPopular ? accentColor : '#e2e8f0'}`,
        borderRadius: 14,
        padding: '24px',
        margin: '8px 0',
        position: 'relative',
        boxShadow: isPopular ? '0 10px 25px -5px rgba(37,99,235,0.15)' : 'none',
        boxSizing: 'border-box',
      }}
    >
      {isPopular && (
        <span
          style={{
            position: 'absolute',
            top: -12,
            right: 20,
            background: accentColor,
            color: '#ffffff',
            fontSize: 10,
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: 12,
            textTransform: 'uppercase',
          }}
        >
          Most Popular
        </span>
      )}
      <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{planName}</h3>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
        <span style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>{price}</span>
        <span style={{ fontSize: 13, color: '#64748b' }}>{period}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {features.map((feat, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' }}>
            <span style={{ color: accentColor, fontWeight: 700 }}>✓</span>
            <span>{feat}</span>
          </div>
        ))}
      </div>
      <a
        href={ctaUrl}
        onClick={(e) => e.preventDefault()}
        style={{
          display: 'block',
          textAlign: 'center',
          background: accentColor,
          color: '#ffffff',
          padding: '10px',
          borderRadius: 6,
          fontWeight: 700,
          fontSize: 14,
          textDecoration: 'none',
        }}
      >
        {ctaLabel}
      </a>
    </div>
  );
};
