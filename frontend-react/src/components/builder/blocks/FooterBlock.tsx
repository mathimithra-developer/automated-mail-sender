import React from 'react';
import { FooterBlockData } from '../types';

export const FooterBlock: React.FC<{ block: FooterBlockData }> = ({ block }) => {
  const {
    companyName = 'Acme Technologies Inc.',
    address = '123 Business Way, Suite 400, San Francisco, CA 94107',
    unsubscribeUrl = '{{unsubscribe_link}}',
    privacyUrl = '#',
    copyrightText = '© 2026 Acme Inc. All rights reserved.',
    textColor = '#64748b',
    align = 'center',
  } = block.content;

  return (
    <div style={{ textAlign: align, color: textColor, fontSize: 12, padding: '16px 0', width: '100%', boxSizing: 'border-box', borderTop: '1px solid #e2e8f0', margin: '12px 0 0' }}>
      <p style={{ margin: '0 0 4px 0', fontWeight: 700 }}>{companyName}</p>
      <p style={{ margin: '0 0 10px 0', opacity: 0.85 }}>{address}</p>
      <div style={{ display: 'inline-flex', gap: 12, marginBottom: 8 }}>
        <a href={unsubscribeUrl} onClick={(e) => e.preventDefault()} style={{ color: textColor, textDecoration: 'underline' }}>Unsubscribe</a>
        <span>•</span>
        <a href={privacyUrl} onClick={(e) => e.preventDefault()} style={{ color: textColor, textDecoration: 'underline' }}>Privacy Policy</a>
      </div>
      <p style={{ margin: 0, opacity: 0.75, fontSize: 11 }}>{copyrightText}</p>
    </div>
  );
};
