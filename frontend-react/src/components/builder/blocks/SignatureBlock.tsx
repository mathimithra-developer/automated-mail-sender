import React from 'react';
import { SignatureBlockData } from '../types';

export const SignatureBlock: React.FC<{ block: SignatureBlockData }> = ({ block }) => {
  const {
    name = 'David Miller',
    role = 'Founder & CEO',
    company = 'MailFlow Platform',
    email = 'david@example.com',
    phone = '+1 (800) 555-0199',
    avatarUrl = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    accentColor = '#2563eb',
  } = block.content;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderTop: `2px solid ${accentColor}`, paddingTop: 14, margin: '12px 0 6px', width: '100%', boxSizing: 'border-box' }}>
      {avatarUrl && <img src={avatarUrl} alt={name} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }} />}
      <div>
        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{name}</h4>
        <p style={{ margin: '2px 0 4px 0', fontSize: 13, fontWeight: 600, color: accentColor }}>{role} • {company}</p>
        <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{email} | {phone}</p>
      </div>
    </div>
  );
};
