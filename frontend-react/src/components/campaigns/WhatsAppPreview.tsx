import React from 'react';
import { 
  CheckCheck, 
  Globe, 
  Phone, 
  Copy, 
  ArrowRight, 
  Lock, 
  ShoppingBag, 
  FileText, 
  Play, 
  ImageIcon, 
  ShieldCheck, 
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { WhatsAppTemplate } from '../../types';
import '../../assets/whatsapp-preview.css';

interface VarMappingItem {
  componentType: 'HEADER' | 'BODY';
  varIndex: number;
  field: string;
  fallbackValue: string;
}

interface WhatsAppPreviewProps {
  template: WhatsAppTemplate | null;
  variableMappings?: VarMappingItem[];
  customSamples?: Record<string, string>;
  highlightVariables?: boolean;
}

const DEFAULT_SAMPLES: Record<string, string> = {
  '1': 'John',
  '2': '#5421',
  '3': '$250.00',
  '4': 'Express Delivery',
  '5': '15% OFF',
  '6': '24-48 hours',
};

export const WhatsAppPreview: React.FC<WhatsAppPreviewProps> = ({
  template,
  variableMappings = [],
  customSamples = {},
  highlightVariables = true,
}) => {
  if (!template) {
    return (
      <div className="wa-phone-frame" style={{ opacity: 0.92 }}>
        {/* Left volume buttons */}
        <div style={{ position: 'absolute', left: -3, top: 100, width: 3, height: 34, background: 'linear-gradient(180deg,#3a3a3c,#2c2c2e)', borderRadius: '3px 0 0 3px', boxShadow: '-1px 0 3px rgba(0,0,0,0.4)' }} />
        <div style={{ position: 'absolute', left: -3, top: 144, width: 3, height: 34, background: 'linear-gradient(180deg,#3a3a3c,#2c2c2e)', borderRadius: '3px 0 0 3px', boxShadow: '-1px 0 3px rgba(0,0,0,0.4)' }} />
        <div style={{ position: 'absolute', left: -3, top: 200, width: 3, height: 56, background: 'linear-gradient(180deg,#3a3a3c,#2c2c2e)', borderRadius: '3px 0 0 3px', boxShadow: '-1px 0 3px rgba(0,0,0,0.4)' }} />
        <div className="wa-phone-screen">
          <div className="wa-phone-status-bar">
            <span style={{ fontWeight: 700, fontSize: 12 }}>9:41</span>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <span style={{ fontSize: 10, opacity: 0.9 }}>▪▪▪</span>
              <span style={{ fontSize: 10 }}>5G</span>
              <span style={{ fontSize: 11 }}>🔋</span>
            </div>
          </div>
          <div className="wa-chat-header">
            <div className="wa-chat-avatar">WA</div>
            <div className="wa-chat-header-info">
              <h4 className="wa-chat-header-name">
                Select a Template <ShieldCheck style={{ width: 14, height: 14, color: '#34d399' }} />
              </h4>
              <p className="wa-chat-header-status">Official Business Account</p>
            </div>
          </div>
          <div className="wa-chat-canvas" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>
              <Smartphone style={{ width: 42, height: 42, color: '#cbd5e1', marginBottom: 12 }} />
              <h4 style={{ margin: '0 0 6px 0', fontSize: 14, color: '#334155' }}>No Template Selected</h4>
              <p style={{ margin: 0, fontSize: 12 }}>Choose a template from the list on the left to inspect the live preview.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract components
  const headerComp = template.components.find((c) => c.type === 'HEADER');
  const bodyComp = template.components.find((c) => c.type === 'BODY');
  const footerComp = template.components.find((c) => c.type === 'FOOTER');
  const buttonsComp = template.components.find((c) => c.type === 'BUTTONS');

  // Helper to replace variables
  const replaceVariables = (text: string = '', compType: 'HEADER' | 'BODY') => {
    if (!text) return '';
    let matchIdx = 0;

    return text.split(/(\{\{.*?\}\})/).map((part, index) => {
      if (part.startsWith('{{') && part.endsWith('}}')) {
        matchIdx++;
        const varNumStr = part.replace(/[\{\}]/g, '').trim() || String(matchIdx);
        const mappedItem = variableMappings.find(
          (m) => m.componentType === compType && String(m.varIndex) === varNumStr
        );

        let replacedValue = customSamples[varNumStr] || customSamples[part];
        if (!replacedValue && mappedItem) {
          replacedValue = mappedItem.fallbackValue || `[${mappedItem.field}]`;
        }
        if (!replacedValue) {
          replacedValue = DEFAULT_SAMPLES[varNumStr] || `Sample_${varNumStr}`;
        }

        if (highlightVariables) {
          return (
            <span key={index} className="wa-var-pill" title={`Variable {{${varNumStr}}}`}>
              {replacedValue}
            </span>
          );
        }
        return <span key={index}>{replacedValue}</span>;
      }

      // Simple WhatsApp formatting (*bold*, _italic_, ~strike~)
      return <span key={index}>{part}</span>;
    });
  };

  // Sample media images based on category or type
  const isMarketing = (template.category || '').toUpperCase() === 'MARKETING';
  const sampleMediaUrl = isMarketing
    ? 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80'
    : 'https://images.unsplash.com/photo-1556742049-0a670f4a4591?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="wa-phone-frame">
      {/* Left-side volume buttons (mute toggle + volume up/down) */}
      <div style={{ position: 'absolute', left: -3, top: 100, width: 3, height: 34, background: 'linear-gradient(180deg,#3a3a3c,#2c2c2e)', borderRadius: '3px 0 0 3px', boxShadow: '-1px 0 3px rgba(0,0,0,0.4)' }} />
      <div style={{ position: 'absolute', left: -3, top: 144, width: 3, height: 34, background: 'linear-gradient(180deg,#3a3a3c,#2c2c2e)', borderRadius: '3px 0 0 3px', boxShadow: '-1px 0 3px rgba(0,0,0,0.4)' }} />
      <div style={{ position: 'absolute', left: -3, top: 200, width: 3, height: 56, background: 'linear-gradient(180deg,#3a3a3c,#2c2c2e)', borderRadius: '3px 0 0 3px', boxShadow: '-1px 0 3px rgba(0,0,0,0.4)' }} />

      <div className="wa-phone-screen">
        {/* Phone Top Status Bar */}
        <div className="wa-phone-status-bar">
          <span style={{ fontWeight: 700, fontSize: 12 }}>9:41</span>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <span style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.85 }}>▪▪▪</span>
            <span style={{ fontSize: 10 }}>5G</span>
            <span style={{ fontSize: 11 }}>🔋</span>
          </div>
        </div>

        {/* WhatsApp Business Header */}
        <div className="wa-chat-header">
          <div className="wa-chat-avatar">
            {template.name ? template.name.charAt(0).toUpperCase() : 'B'}
          </div>
          <div className="wa-chat-header-info">
            <h4 className="wa-chat-header-name">
              Brand Broadcast <ShieldCheck style={{ width: 14, height: 14, color: '#34d399' }} />
            </h4>
            <p className="wa-chat-header-status">WhatsApp Business • Official Account</p>
          </div>
        </div>

        {/* Chat Canvas Wallpaper */}
        <div className="wa-chat-canvas">
          {/* Encryption Note */}
          <div className="wa-chat-encryption-notice">
            🔒 Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.
          </div>

          {/* Message Bubble */}
          <div className="wa-message-bubble">
            <div className="wa-message-content">
              {/* HEADER COMPONENT */}
              {headerComp && (
                <div style={{ marginBottom: 6 }}>
                  {/* Header Format: IMAGE */}
                  {headerComp.format === 'IMAGE' && (
                    <div className="wa-media-container">
                      <img
                        src={sampleMediaUrl}
                        alt="Header Banner"
                        className="wa-media-image"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Header Format: VIDEO */}
                  {headerComp.format === 'VIDEO' && (
                    <div className="wa-media-container">
                      <div
                        className="wa-media-video-wrapper"
                        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${sampleMediaUrl})` }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                          }}
                        >
                          <Play style={{ width: 20, height: 20, color: '#0f172a', marginLeft: 2 }} />
                        </div>
                        <span style={{ fontSize: 10, marginTop: 8, background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: 4 }}>
                          0:30 • Video Preview
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Header Format: DOCUMENT */}
                  {headerComp.format === 'DOCUMENT' && (
                    <div className="wa-media-doc-card">
                      <div style={{ background: '#ef4444', padding: 8, borderRadius: 6, color: '#ffffff' }}>
                        <FileText style={{ width: 20, height: 20 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h5 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                          Document_Attachment.pdf
                        </h5>
                        <p style={{ margin: '2px 0 0 0', fontSize: 10, color: '#64748b' }}>1 PAGE • 245 KB • PDF</p>
                      </div>
                    </div>
                  )}

                  {/* Header Text */}
                  {(headerComp.format === 'TEXT' || (!headerComp.format && headerComp.text)) && (
                    <div className="wa-header-text">
                      {replaceVariables(headerComp.text || 'Notification Header', 'HEADER')}
                    </div>
                  )}
                </div>
              )}

              {/* BODY COMPONENT */}
              {bodyComp && (
                <div className="wa-body-text">
                  {replaceVariables(bodyComp.text || '', 'BODY')}
                </div>
              )}

              {/* FOOTER COMPONENT */}
              {footerComp && footerComp.text && (
                <div className="wa-footer-text">{footerComp.text}</div>
              )}

              {/* MESSAGE METADATA (Timestamp + Double Tick) */}
              <div className="wa-meta-row">
                <span>10:42 AM</span>
                <span className="wa-double-tick" title="Delivered & Read">✓✓</span>
              </div>
            </div>

            {/* BUTTONS COMPONENT */}
            {buttonsComp && (
              <div className="wa-buttons-container">
                {Array.isArray(buttonsComp.buttons) && buttonsComp.buttons.length > 0 ? (
                  buttonsComp.buttons.map((btn: any, idx: number) => {
                    const btnType = (btn.type || '').toUpperCase();
                    const btnText = btn.text || btn.title || `Button ${idx + 1}`;

                    return (
                      <button key={idx} className="wa-action-btn" type="button">
                        {btnType.includes('URL') || btnType.includes('WEBSITE') ? (
                          <>
                            <ExternalLink style={{ width: 14, height: 14 }} /> {btnText}
                          </>
                        ) : btnType.includes('PHONE') || btnType.includes('CALL') ? (
                          <>
                            <Phone style={{ width: 14, height: 14 }} /> {btnText}
                          </>
                        ) : btnType.includes('COPY') || btnType.includes('COUPON') || btnType.includes('CODE') ? (
                          <>
                            <Copy style={{ width: 14, height: 14 }} /> {btnText}
                          </>
                        ) : btnType.includes('OTP') || btnType.includes('AUTH') ? (
                          <>
                            <Lock style={{ width: 14, height: 14 }} /> {btnText}
                          </>
                        ) : btnType.includes('CATALOG') ? (
                          <>
                            <ShoppingBag style={{ width: 14, height: 14 }} /> {btnText}
                          </>
                        ) : (
                          <>
                            <ArrowRight style={{ width: 14, height: 14 }} /> {btnText}
                          </>
                        )}
                      </button>
                    );
                  })
                ) : (
                  // Default sample button if template defines generic buttons
                  <button className="wa-action-btn" type="button">
                    <ArrowRight style={{ width: 14, height: 14 }} /> Take Action
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
