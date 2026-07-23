import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  isDestructive = true,
  loading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const defaultConfirmText = confirmText || (isDestructive ? 'Delete' : 'Confirm');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        style={{
          background: 'var(--bg-card, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: 16,
          padding: '28px 32px',
          maxWidth: 420,
          width: '92%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
          position: 'relative',
          animation: 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            color: 'var(--text-muted, #94a3b8)',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X style={{ width: 18, height: 18 }} />
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: isDestructive ? 'rgba(239, 68, 68, 0.12)' : 'rgba(37, 99, 235, 0.12)',
              color: isDestructive ? '#ef4444' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isDestructive
                ? '0 0 0 6px rgba(239, 68, 68, 0.05)'
                : '0 0 0 6px rgba(37, 99, 235, 0.05)',
            }}
          >
            {isDestructive ? (
              <Trash2 style={{ width: 26, height: 26 }} />
            ) : (
              <AlertTriangle style={{ width: 26, height: 26 }} />
            )}
          </div>
        </div>

        <h3
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            margin: '0 0 8px',
            color: 'var(--text, #0f172a)',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted, #64748b)',
            margin: '0 0 24px',
            lineHeight: 1.55,
          }}
        >
          {message}
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ flex: 1, padding: '10px 16px', fontWeight: 600 }}
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="btn"
            style={{
              flex: 1,
              padding: '10px 16px',
              fontWeight: 600,
              background: isDestructive ? '#dc2626' : '#2563eb',
              borderColor: isDestructive ? '#dc2626' : '#2563eb',
              color: '#ffffff',
              boxShadow: isDestructive
                ? '0 4px 12px rgba(220, 38, 38, 0.25)'
                : '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
            disabled={loading}
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
          >
            {loading ? 'Processing...' : defaultConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
