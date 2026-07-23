import React from 'react';
import { X } from 'lucide-react';

export interface PolicyModalProps {
  type: 'tos' | 'privacy' | null;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  const isTos = type === 'tos';

  return (
    <div
      className="policy-modal-overlay active"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="policy-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: 16,
          width: '92%',
          maxWidth: 520,
          maxHeight: '82vh',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          className="policy-modal-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {isTos ? 'Terms of Service' : 'Privacy Policy'}
          </h3>
          <button
            className="policy-modal-close"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: 'none',
              background: '#f1f5f9',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div
          className="policy-modal-body"
          style={{
            padding: '20px 24px 24px',
            overflowY: 'auto',
            fontSize: '0.85rem',
            color: '#475569',
            lineHeight: 1.65,
          }}
        >
          {isTos ? (
            <>
              <h4 style={{ color: '#0f172a', fontSize: '0.925rem', fontWeight: 700, margin: '0 0 6px' }}>
                1. Acceptance of Terms
              </h4>
              <p style={{ margin: '0 0 16px' }}>
                By creating an account and using the MailFlow platform, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access the service.
              </p>

              <h4 style={{ color: '#0f172a', fontSize: '0.925rem', fontWeight: 700, margin: '16px 0 6px' }}>
                2. Account Responsibilities
              </h4>
              <ul style={{ margin: '0 0 16px', paddingLeft: 20 }}>
                <li style={{ marginBottom: 4 }}>You must provide accurate, current, and complete information during registration.</li>
                <li style={{ marginBottom: 4 }}>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li style={{ marginBottom: 4 }}>You must notify us immediately of any unauthorized use of your account.</li>
              </ul>

              <h4 style={{ color: '#0f172a', fontSize: '0.925rem', fontWeight: 700, margin: '16px 0 6px' }}>
                3. Acceptable Use
              </h4>
              <ul style={{ margin: '0 0 16px', paddingLeft: 20 }}>
                <li style={{ marginBottom: 4 }}>You may not use MailFlow to send unsolicited or spam emails.</li>
                <li style={{ marginBottom: 4 }}>All email campaigns must comply with applicable anti-spam laws (CAN-SPAM, GDPR, etc.).</li>
                <li style={{ marginBottom: 4 }}>You must include a working unsubscribe link in all marketing emails.</li>
              </ul>

              <h4 style={{ color: '#0f172a', fontSize: '0.925rem', fontWeight: 700, margin: '16px 0 6px' }}>
                4. Data Ownership
              </h4>
              <p style={{ margin: '0 0 16px' }}>
                You retain ownership of all customer data and email content you upload. MailFlow will not share, sell, or use your data for purposes other than providing the service.
              </p>

              <h4 style={{ color: '#0f172a', fontSize: '0.925rem', fontWeight: 700, margin: '16px 0 6px' }}>
                5. Service Availability
              </h4>
              <p style={{ margin: '0 0 16px' }}>
                We strive for 99.9% uptime but do not guarantee uninterrupted access. Scheduled maintenance will be communicated in advance.
              </p>

              <h4 style={{ color: '#0f172a', fontSize: '0.925rem', fontWeight: 700, margin: '16px 0 6px' }}>
                6. Termination
              </h4>
              <p style={{ margin: 0 }}>
                We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from the account settings page.
              </p>
            </>
          ) : (
            <>
              <h4 style={{ color: '#0f172a', fontSize: '0.925rem', fontWeight: 700, margin: '0 0 6px' }}>
                1. Information We Collect
              </h4>
              <ul style={{ margin: '0 0 16px', paddingLeft: 20 }}>
                <li style={{ marginBottom: 6 }}>
                  <strong>Account Data:</strong> Name, email address, phone number, and organization details you provide during registration.
                </li>
                <li style={{ marginBottom: 6 }}>
                  <strong>Usage Data:</strong> Login timestamps, feature usage patterns, and campaign performance metrics.
                </li>
                <li style={{ marginBottom: 6 }}>
                  <strong>Customer Data:</strong> Contact information you upload for email campaign recipients.
                </li>
              </ul>

              <h4 style={{ color: '#0f172a', fontSize: '0.925rem', fontWeight: 700, margin: '16px 0 6px' }}>
                2. How We Use Your Information
              </h4>
              <ul style={{ margin: '0 0 16px', paddingLeft: 20 }}>
                <li style={{ marginBottom: 4 }}>To provide, operate, and maintain the MailFlow platform.</li>
                <li style={{ marginBottom: 4 }}>To process and deliver your email campaigns.</li>
                <li style={{ marginBottom: 4 }}>To send you service-related notifications and updates.</li>
                <li style={{ marginBottom: 4 }}>To improve our services through aggregated, anonymized analytics.</li>
              </ul>

              <h4 style={{ color: '#0f172a', fontSize: '0.925rem', fontWeight: 700, margin: '16px 0 6px' }}>
                3. Data Protection
              </h4>
              <p style={{ margin: '0 0 16px' }}>
                We implement industry-standard security measures including encryption in transit (TLS) and at rest (AES-256). Access to personal data is restricted to authorized personnel only.
              </p>

              <h4 style={{ color: '#0f172a', fontSize: '0.925rem', fontWeight: 700, margin: '16px 0 6px' }}>
                4. Third-Party Sharing
              </h4>
              <p style={{ margin: '0 0 16px' }}>
                We do not sell your personal information. We may share data only with service providers necessary for platform operations (e.g., email delivery infrastructure), under strict data processing agreements.
              </p>

              <h4 style={{ color: '#0f172a', fontSize: '0.925rem', fontWeight: 700, margin: '16px 0 6px' }}>
                5. Your Rights
              </h4>
              <ul style={{ margin: '0 0 16px', paddingLeft: 20 }}>
                <li style={{ marginBottom: 4 }}>Access, correct, or delete your personal data at any time.</li>
                <li style={{ marginBottom: 4 }}>Export your data in a portable format.</li>
                <li style={{ marginBottom: 4 }}>Opt out of non-essential communications.</li>
              </ul>

              <h4 style={{ color: '#0f172a', fontSize: '0.925rem', fontWeight: 700, margin: '16px 0 6px' }}>
                6. Contact Us
              </h4>
              <p style={{ margin: 0 }}>
                For privacy-related inquiries, contact us at{' '}
                <a href="mailto:privacy@mailflow.com" style={{ color: 'var(--auth-primary, #2563eb)', fontWeight: 600 }}>
                  privacy@mailflow.com
                </a>.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
