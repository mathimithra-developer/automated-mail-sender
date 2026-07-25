import React from 'react';
import { ButtonCardBlockData } from '../types';

export const ButtonCardBlock: React.FC<{ block: ButtonCardBlockData }> = ({ block }) => {
  const {
    icon = '🎯',
    heading = 'Ready to Get Started?',
    description = 'Join over 10,000+ businesses using our automated email platform.',
    ctaLabel = 'Create Account Now',
    ctaUrl = '#',
    bgColor = '#f0f6ff',
    accentColor = '#2563eb',
  } = block.content;

  return (
    <div
      style={{
        background: bgColor,
        border: `1px solid #bfdbfe`,
        borderRadius: 14,
        padding: '24px',
        textAlign: 'center',
        margin: '8px 0',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <h3 style={{ margin: '0 0 6px 0', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{heading}</h3>
      <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#475569', lineHeight: 1.5 }}>{description}</p>
      <a
        href={ctaUrl}
        onClick={(e) => e.preventDefault()}
        style={{
          display: 'inline-block',
          background: accentColor,
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: 8,
          fontWeight: 800,
          fontSize: 14,
          textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
        }}
      >
        {ctaLabel}
      </a>
    </div>
  );
};
