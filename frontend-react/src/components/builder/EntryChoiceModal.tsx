import React from 'react';
import { FilePlus, Sparkles, RotateCcw, X } from 'lucide-react';

interface EntryChoiceModalProps {
  isOpen: boolean;
  onSelectNew: () => void;
  onSelectSample: () => void;
  onResumeDraft?: () => void;
  draftName?: string;
  onClose?: () => void;
}

export const EntryChoiceModal: React.FC<EntryChoiceModalProps> = ({
  isOpen,
  onSelectNew,
  onSelectSample,
  onResumeDraft,
  draftName,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          maxWidth: 620,
          width: '100%',
          padding: 28,
          boxShadow: '0 20px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          position: 'relative',
          animation: 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              border: 'none',
              background: '#f1f5f9',
              color: '#64748b',
              width: 30,
              height: 30,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        )}

        {/* Header Title */}
        <div style={{ textAlign: 'center', padding: '0 10px' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <Sparkles size={24} />
          </div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
            Welcome to Mail Builder
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
            How would you like to start creating your email campaign template?
          </p>
        </div>

        {/* Unsaved Draft Banner / Recovery Button if available */}
        {onResumeDraft && (
          <div
            style={{
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1.5px solid #93c5fd',
              borderRadius: 12,
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <RotateCcw size={18} />
              </div>
              <div>
                <h5 style={{ margin: '0 0 2px 0', fontSize: 14, fontWeight: 700, color: '#1e3a8a' }}>
                  Unsaved Draft Found
                </h5>
                <p style={{ margin: 0, fontSize: 12, color: '#1e40af' }}>
                  "{draftName || 'Untitled Template'}" from your previous session.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onResumeDraft}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
              }}
            >
              Resume Draft &rarr;
            </button>
          </div>
        )}

        {/* Entry Choices Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Option 1: New Blank Template */}
          <button
            type="button"
            onClick={onSelectNew}
            style={{
              border: '2px solid #e2e8f0',
              borderRadius: 14,
              padding: 20,
              background: '#ffffff',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,99,235,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
            }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FilePlus size={20} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                New Blank Canvas
              </h4>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                Start fresh with a clean blank canvas and build step-by-step.
              </p>
            </div>
            <div style={{ marginTop: 'auto', paddingTop: 8, fontSize: 13, fontWeight: 700, color: '#2563eb' }}>
              Create Blank &rarr;
            </div>
          </button>

          {/* Option 2: Load Default Sample Template */}
          <button
            type="button"
            onClick={onSelectSample}
            style={{
              border: '2px solid #e2e8f0',
              borderRadius: 14,
              padding: 20,
              background: '#ffffff',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,99,235,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
            }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                Load Sample
              </h4>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                Pre-load default newsletter layout with Heading, Paragraph & CTA.
              </p>
            </div>
            <div style={{ marginTop: 'auto', paddingTop: 8, fontSize: 13, fontWeight: 700, color: '#16a34a' }}>
              Load Sample &rarr;
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

