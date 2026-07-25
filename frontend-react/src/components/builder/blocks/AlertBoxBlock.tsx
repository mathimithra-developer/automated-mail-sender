import React from 'react';
import { AlertBoxBlockData } from '../types';

export const AlertBoxBlock: React.FC<{ block: AlertBoxBlockData }> = ({ block }) => {
  const { variant = 'info', title = 'System Notice', message = 'Scheduled maintenance will take place on Sunday.' } = block.content;

  const styles = {
    info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', icon: 'ℹ️' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', icon: '✅' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: '⚠️' },
    danger: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', icon: '🚨' },
  }[variant] || { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', icon: 'ℹ️' };

  return (
    <div
      style={{
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: 8,
        padding: '14px 16px',
        margin: '8px 0',
        display: 'flex',
        gap: 12,
        boxSizing: 'border-box',
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0 }}>{styles.icon}</span>
      <div>
        <h5 style={{ margin: '0 0 2px 0', fontSize: 14, fontWeight: 700, color: styles.text }}>{title}</h5>
        <p style={{ margin: 0, fontSize: 13, color: styles.text, opacity: 0.9, lineHeight: 1.4 }}>{message}</p>
      </div>
    </div>
  );
};
