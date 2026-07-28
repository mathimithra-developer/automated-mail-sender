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
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { WhatsAppTemplate } from '../../types';
import { useToast } from '../../context/ToastContext';
import '../../assets/whatsapp-preview.css';

interface VarMappingItem {
  componentType: 'HEADER' | 'BODY' | 'BUTTONS';
  varIndex: number;
  buttonIndex?: number;
  buttonType?: string;
  buttonName?: string;
  url?: string;
  field: string;
  fallbackValue: string;
  previewUrl?: string;
  cardIndex?: number;
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

const getSampleValueForField = (field: string, fallback: string) => {
  if (fallback && fallback.trim()) return fallback;
  const f = field.toLowerCase();
  if (f.includes('name')) return 'John';
  if (f.includes('phone') || f.includes('mobile')) return '+1 555-0199';
  if (f.includes('location') || f.includes('city')) return 'New York';
  if (f.includes('designation') || f.includes('title') || f.includes('job')) return 'Developer';
  if (f.includes('order') || f.includes('id')) return 'ORD-98421';
  if (f.includes('amount') || f.includes('price') || f.includes('total')) return '$149.99';
  if (f.includes('date')) return new Date().toLocaleDateString();
  if (f.includes('discount') || f.includes('code') || f.includes('promo')) return 'SUMMER30';
  return `[${field}]`;
};

export const WhatsAppPreview: React.FC<WhatsAppPreviewProps> = ({
  template,
  variableMappings = [],
  customSamples = {},
  highlightVariables = true,
}) => {
  const { showToast } = useToast();

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
              <p style={{ margin: 0, fontSize: 12 }}>Choose a template to inspect the live preview.</p>
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
  const carouselComp = template.components.find((c) => c.type === 'CAROUSEL');

  // Interactive Button Click Handler
  const handleButtonClick = (btn: any, cardIdx?: number, btnIdx?: number) => {
    const btnType = (btn?.type || '').toUpperCase();
    const rawBtnText = btn?.text || btn?.title || 'Action';
    const textStr = typeof rawBtnText === 'string' ? rawBtnText : 'Action';

    // 1. COPY CODE / COUPON
    if (btnType.includes('COPY') || btnType.includes('CODE') || btnType.includes('COUPON')) {
      const code = btn.example || btn.code || 'PROMO2025';
      try {
        navigator.clipboard.writeText(code);
        showToast('Code Copied', `Coupon code "${code}" copied to clipboard!`, 'success');
      } catch (err) {
        showToast('Code Copied', `Coupon code "${code}"`, 'success');
      }
      return;
    }

    // 2. PHONE / CALL
    if (btnType.includes('PHONE') || btnType.includes('CALL')) {
      const phoneNum = btn.phone_number || btn.phoneNumber || '+18005550199';
      showToast('Call Triggered', `Initiating call to ${phoneNum}`, 'info');
      try {
        window.open(`tel:${phoneNum}`);
      } catch (e) {}
      return;
    }

    // 3. URL / WEBSITE / LINK BUTTON
    let targetUrl = btn?.url || '';
    if (targetUrl.includes('{{')) {
      const mappedItem = variableMappings.find(
        (m) => m.componentType === 'BUTTONS' && m.cardIndex === cardIdx && m.buttonIndex === btnIdx
      );
      const resolvedVal = mappedItem 
        ? getSampleValueForField(mappedItem.field, mappedItem.fallbackValue)
        : 'offer';
      targetUrl = targetUrl.replace(/\{\{(.*?)\}\}/g, resolvedVal);
    }

    if (!targetUrl) {
      if (/click|clck|url|link|visit|shop|buy|order|view|open|details|website/i.test(textStr)) {
        targetUrl = 'https://ownchat.app';
      }
    }

    if (targetUrl) {
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }
      showToast('Opening Target Link', `Navigating to ${targetUrl}`, 'info');
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // 4. QUICK REPLY / OTHER ACTION BUTTONS
    showToast('Action Selected', `Simulated Quick Reply: "${textStr}"`, 'success');
  };

  // Helper to replace variables
  const replaceVariables = (
    text: string = '', 
    compType: 'HEADER' | 'BODY' | 'BUTTONS', 
    buttonIdx?: number,
    cardIdx?: number
  ) => {
    if (!text) return '';
    let matchIdx = 0;

    return text.split(/(\{\{.*?\}\})/).map((part, index) => {
      if (part.startsWith('{{') && part.endsWith('}}')) {
        matchIdx++;
        const varNumStr = part.replace(/[\{\}]/g, '').trim() || String(matchIdx);
        
        // Find matching mapping
        const mappedItem = variableMappings.find((m) => {
          if (cardIdx !== undefined) {
            if (m.cardIndex !== cardIdx) return false;
          } else {
            if (m.cardIndex !== undefined) return false;
          }

          if (compType === 'BUTTONS') {
            return m.componentType === 'BUTTONS' && m.buttonIndex === buttonIdx && String(m.varIndex) === varNumStr;
          }
          return m.componentType === compType && String(m.varIndex) === varNumStr;
        });

        let replacedValue = customSamples[varNumStr] || customSamples[part];
        if (!replacedValue && mappedItem) {
          replacedValue = getSampleValueForField(mappedItem.field, mappedItem.fallbackValue);
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
          {/* Encryption Notice */}
          <div className="wa-chat-encryption-notice">
            🔒 Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.
          </div>

          {carouselComp && Array.isArray(carouselComp.cards) ? (
            /* ── CAROUSEL TEMPLATE LAYOUT ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              {/* Top-level Body Message Bubble */}
              {bodyComp && (
                <div className="wa-message-bubble" style={{ alignSelf: 'flex-start' }}>
                  <div className="wa-message-content">
                    <div className="wa-body-text">
                      {replaceVariables(bodyComp.text || '', 'BODY')}
                    </div>
                    <div className="wa-meta-row">
                      <span>10:42 AM</span>
                      <span className="wa-double-tick" title="Delivered & Read">✓✓</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Horizontal Scrollable Carousel Cards Track */}
              <div className="wa-carousel-scroll-container">
                <div className="wa-carousel-track">
                  {carouselComp.cards.map((card: any, cardIdx: number) => {
                    const cardHeader = card.components?.find((c: any) => c.type === 'HEADER');
                    const cardBody = card.components?.find((c: any) => c.type === 'BODY');
                    const cardButtons = card.components?.find((c: any) => c.type === 'BUTTONS');

                    // Determine Card Image / Video URL
                    let cardImgUrl = '';
                    if (cardHeader) {
                      const mappedItem = variableMappings.find(
                        (m) => m.componentType === 'HEADER' && m.cardIndex === cardIdx && m.varIndex === 1
                      );
                      if (mappedItem && (mappedItem.fallbackValue.startsWith('http') || mappedItem.fallbackValue.startsWith('blob:'))) {
                        cardImgUrl = mappedItem.fallbackValue;
                      }
                    }

                    return (
                      <div key={cardIdx} className="wa-carousel-card">
                        {/* Card Header Media */}
                        {cardHeader && (
                          <div className="wa-carousel-card-media">
                            {cardHeader.format === 'IMAGE' && (
                              cardImgUrl ? (
                                <img
                                  src={cardImgUrl}
                                  alt={`Card ${cardIdx + 1}`}
                                  className="wa-carousel-card-img"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  height: 140,
                                  background: '#f8fafc',
                                  color: '#64748b',
                                  borderBottom: '1px solid #e2e8f0'
                                }}>
                                  <ImageIcon style={{ width: 34, height: 34, color: '#94a3b8', marginBottom: 4 }} />
                                  <span style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>No image available</span>
                                </div>
                              )
                            )}
                            {cardHeader.format === 'VIDEO' && (
                              <div className="wa-carousel-card-video">
                                <Play style={{ width: 22, height: 22, color: '#ffffff', marginBottom: 4 }} />
                                <span style={{ fontSize: 10, opacity: 0.8 }}>0:30 Video</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Card Content */}
                        <div className="wa-carousel-card-content">
                          {cardBody && (
                            <div className="wa-carousel-card-body">
                              {replaceVariables(cardBody.text || '', 'BODY', undefined, cardIdx)}
                            </div>
                          )}
                        </div>

                        {/* Card Action Buttons */}
                        {cardButtons && Array.isArray(cardButtons.buttons) && cardButtons.buttons.length > 0 && (
                          <div className="wa-carousel-card-buttons">
                            {cardButtons.buttons.map((btn: any, btnIdx: number) => {
                              const rawBtnText = btn.text || btn.title || `Action ${btnIdx + 1}`;
                              const btnText = replaceVariables(rawBtnText, 'BUTTONS', btnIdx, cardIdx);
                              return (
                                <button 
                                  key={btnIdx} 
                                  className="wa-carousel-card-btn" 
                                  type="button"
                                  onClick={() => handleButtonClick(btn, cardIdx, btnIdx)}
                                >
                                  <ExternalLink style={{ width: 13, height: 13 }} />
                                  {btnText}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ── STANDARD TEMPLATE LAYOUT ── */
            <div className="wa-message-bubble">
              <div className="wa-message-content">
                {/* HEADER COMPONENT */}
                {headerComp && (
                  <div style={{ marginBottom: 6 }}>
                    {/* Header Format: IMAGE */}
                    {headerComp.format === 'IMAGE' && (
                      <div className="wa-media-container">
                        {(() => {
                          const mappedHeaderItem = variableMappings.find(
                            (m) => m.componentType === 'HEADER' && m.cardIndex === undefined
                          );
                          const rawVal = mappedHeaderItem?.fallbackValue || mappedHeaderItem?.previewUrl || '';
                          const headerImgUrl = (rawVal.startsWith('http') || rawVal.startsWith('blob:'))
                            ? rawVal
                            : '';

                          if (headerImgUrl) {
                            return (
                              <img
                                src={headerImgUrl}
                                alt="Header Banner"
                                className="wa-media-image"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            );
                          }

                          return (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '24px 16px',
                              background: '#f8fafc',
                              border: '2px dashed #cbd5e1',
                              borderRadius: 8,
                              color: '#64748b'
                            }}>
                              <ImageIcon style={{ width: 44, height: 44, color: '#94a3b8', marginBottom: 6 }} />
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>No image available</span>
                            </div>
                          );
                        })()}
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
                      const rawBtnText = btn.text || btn.title || `Button ${idx + 1}`;
                      const btnText = replaceVariables(rawBtnText, 'BUTTONS', idx);

                      // Check if URL button has variable parameters and resolve it dynamically
                      let resolvedUrl = btn.url || '';
                      if (resolvedUrl.includes('{{')) {
                        // Find dynamic URL variable
                        const mappedItem = variableMappings.find(
                          (m) => m.componentType === 'BUTTONS' && m.buttonIndex === idx && m.varIndex === 1
                        );
                        const resolvedVal = mappedItem 
                          ? getSampleValueForField(mappedItem.field, mappedItem.fallbackValue)
                          : 'deals';
                        resolvedUrl = resolvedUrl.replace(/\{\{(.*?)\}\}/g, resolvedVal);
                      }

                      return (
                        <button 
                          key={idx} 
                          className="wa-action-btn" 
                          type="button" 
                          onClick={() => handleButtonClick(btn, undefined, idx)}
                          title={resolvedUrl ? `Navigate to: ${resolvedUrl}` : undefined}
                        >
                          {btnType.includes('URL') || btnType.includes('WEBSITE') ? (
                            <>
                              <Globe style={{ width: 14, height: 14, color: '#00a884' }} /> {btnText}
                            </>
                          ) : btnType.includes('PHONE') || btnType.includes('CALL') ? (
                            <>
                              <Phone style={{ width: 14, height: 14, color: '#00a884' }} /> {btnText}
                            </>
                          ) : btnType.includes('COPY') || btnType.includes('COUPON') || btnType.includes('CODE') ? (
                            <>
                              <Copy style={{ width: 14, height: 14, color: '#00a884' }} /> {btnText}
                            </>
                          ) : btnType.includes('OTP') || btnType.includes('AUTH') ? (
                            <>
                              <Lock style={{ width: 14, height: 14, color: '#00a884' }} /> {btnText}
                            </>
                          ) : btnType.includes('CATALOG') ? (
                            <>
                              <ShoppingBag style={{ width: 14, height: 14, color: '#00a884' }} /> {btnText}
                            </>
                          ) : (
                            <>
                              <ArrowRight style={{ width: 14, height: 14, color: '#00a884' }} /> {btnText}
                            </>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    // Default sample button if template defines generic buttons
                    <button 
                      className="wa-action-btn" 
                      type="button"
                      onClick={() => handleButtonClick({ text: 'Take Action', type: 'URL', url: 'https://ownchat.app' })}
                    >
                      <ArrowRight style={{ width: 14, height: 14, color: '#00a884' }} /> Take Action
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


