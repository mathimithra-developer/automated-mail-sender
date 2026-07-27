import React, { useState, useRef, useEffect } from 'react';
import { BuilderBlock } from '../types';
import { AlignLeft, AlignCenter, AlignRight, Link2, Lock, Unlock, Plus, Trash2, Smile } from 'lucide-react';

// ─── Emoji Data ───────────────────────────────────────────────────────────────

const EMOJI_CATEGORIES = [
  {
    label: '🎯 Marketing',
    emojis: ['🚀','🎯','💡','⚡','🔥','✨','🌟','💫','🎉','🎊','🏆','🥇','💎','🎁','🎀','📣','📢','🔔','📊','📈','💰','💳','🛒','🎪','🎭'],
  },
  {
    label: '💼 Business',
    emojis: ['💼','📋','📌','📍','🗂️','📁','📂','🗓️','⏰','⏱️','🔑','🔓','🔒','⚙️','🔧','🛠️','💻','🖥️','📱','📲','🖨️','📠','📟','☎️','📞'],
  },
  {
    label: '✉️ Email',
    emojis: ['✉️','📧','📨','📩','📬','📭','📮','📝','📄','📃','📑','📒','📔','📕','📗','📘','📙','📚','🗒️','🗃️','🗄️','📰','🗞️','📜','📄'],
  },
  {
    label: '😊 People',
    emojis: ['👋','👍','👎','👏','🙌','🤝','💪','✌️','☝️','👆','👇','👈','👉','🤞','🤟','🤙','💁','🙋','🙏','😊','😍','🤩','😎','🥳','😄'],
  },
  {
    label: '📊 Charts',
    emojis: ['📊','📈','📉','💹','🔢','🔣','🔤','🔡','🔠','#️⃣','*️⃣','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','💯','✅','❌'],
  },
  {
    label: '⚠️ Alerts',
    emojis: ['⚠️','🚨','🚫','⛔','🔴','🟠','🟡','🟢','🔵','🟣','⚡','💥','❗','❕','❓','❔','‼️','⁉️','🆕','🆙','🔝','🔛','🔜','🔚','🔙'],
  },
];

// ─── EmojiPickerField Component ───────────────────────────────────────────────

export const EmojiPickerField: React.FC<{
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ label = 'Emoji', value, onChange, placeholder = '👋' }) => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const displayEmoji = value || placeholder;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', fontFamily: "'Inter', sans-serif", width: '100%', boxSizing: 'border-box' }} ref={containerRef}>
      {label && <label style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{label}</label>}
      {/* Trigger row */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
        {/* Left emoji preview button */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          title="Pick an emoji"
          style={{
            width: 52, height: 44, border: open || value ? '2.5px solid #2563eb' : '1px solid #cbd5e1',
            borderRadius: 12, background: open || value ? '#eff6ff' : '#ffffff', cursor: 'pointer',
            fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.15s', boxSizing: 'border-box',
            boxShadow: open ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
          }}
        >
          {displayEmoji}
        </button>
        {/* Middle centered display input */}
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={4}
          style={{
            flex: 1, minWidth: 0, width: '100%', height: 44, padding: '0 12px', fontSize: 24, border: '1.5px solid #e2e8f0',
            borderRadius: 12, outline: 'none', background: '#ffffff', color: '#0f172a', textAlign: 'center',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)', boxSizing: 'border-box'
          }}
        />
        {/* Right smiley face trigger */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          title="Open emoji picker"
          style={{
            width: 44, height: 44, border: open ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
            borderRadius: 12, background: open ? '#eff6ff' : '#ffffff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.15s', boxSizing: 'border-box',
            boxShadow: open ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
          }}
        >
          <Smile size={20} color={open ? '#2563eb' : '#64748b'} />
        </button>
      </div>

      {/* Floating picker popup directly below trigger */}
      {open && (
        <div style={{
          position: 'absolute', zIndex: 9999, top: 'calc(100% + 6px)', left: 0,
          background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: 16,
          boxShadow: '0 15px 35px rgba(15,23,42,0.12), 0 5px 15px rgba(15,23,42,0.06)', overflow: 'hidden',
          width: 310, minWidth: 310, animation: 'fadeIn 0.1s ease',
        }}>
          {/* Category tabs */}
          <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #f1f5f9', background: '#ffffff', padding: '10px 8px', gap: 4 }}>
            {EMOJI_CATEGORIES.map((cat, ci) => {
              const isActive = activeCategory === ci;
              return (
                <button
                  key={ci}
                  type="button"
                  onClick={() => setActiveCategory(ci)}
                  style={{
                    border: 'none', padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                    background: isActive ? '#2563eb' : 'transparent',
                    color: isActive ? '#ffffff' : '#64748b',
                    transition: 'all 0.15s'
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
          {/* Accent/Progress divider line */}
          <div style={{ height: 3, background: '#f1f5f9', width: '100%' }}>
            <div style={{ height: '100%', background: '#cbd5e1', width: '60%', borderRadius: 2 }} />
          </div>

          {/* Emoji grid with highlighted selection (6-column layout to prevent clipping) */}
          <div style={{ padding: 10, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
            {EMOJI_CATEGORIES[activeCategory].emojis.map((em, ei) => {
              const isSelected = value === em;
              return (
                <button
                  key={ei}
                  type="button"
                  onClick={() => { onChange(em); setOpen(false); }}
                  title={em}
                  style={{
                    border: isSelected ? '2px solid #2563eb' : '1px solid transparent',
                    background: isSelected ? '#eff6ff' : 'transparent',
                    borderRadius: 8, cursor: 'pointer', fontSize: 24, padding: '4px',
                    lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.1s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  {em}
                </button>
              );
            })}
          </div>
          {/* Current value footer */}
          <div style={{ borderTop: '1px solid #f1f5f9', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyItems: 'center', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 20 }}>{value || '👋'}</span>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                Selected: <strong style={{ color: '#0f172a' }}>{value || 'none'}</strong>
              </span>
            </div>
            {value && (
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); }}
                style={{
                  marginLeft: 'auto', border: 'none', background: 'none',
                  color: '#ef4444', fontSize: 13, cursor: 'pointer', fontWeight: 700
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Inline Emoji Input Component ──────────────────────────────────────────────

export const InlineEmojiInput: React.FC<{
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  isTextarea?: boolean;
  rows?: number;
}> = ({ label, value, onChange, placeholder = 'Type text...', isTextarea = false, rows = 3 }) => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const insertEmoji = (emoji: string) => {
    onChange((value || '') + emoji);
    setOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative', width: '100%', boxSizing: 'border-box' }} ref={containerRef}>
      {label && <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>{label}</label>}
      <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
        {isTextarea ? (
          <textarea
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            rows={rows}
            style={{ ...textareaStyle, paddingRight: 34, width: '100%', boxSizing: 'border-box' }}
            placeholder={placeholder}
          />
        ) : (
          <input
            type="text"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            style={{ ...inputStyle, paddingRight: 34, width: '100%', boxSizing: 'border-box' }}
            placeholder={placeholder}
          />
        )}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          title="Insert Emoji"
          style={{
            position: 'absolute',
            right: 6,
            top: isTextarea ? 8 : '50%',
            transform: isTextarea ? 'none' : 'translateY(-50%)',
            border: open ? '1px solid #2563eb' : '1px solid #cbd5e1',
            background: open ? '#eff6ff' : '#f8fafc',
            borderRadius: 6,
            padding: '3px 5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: open ? '#2563eb' : '#64748b',
            zIndex: 2,
            transition: 'all 0.15s',
          }}
        >
          <Smile size={15} />
        </button>
      </div>

      {/* Floating Emoji Picker Popover */}
      {open && (
        <div style={{
          position: 'absolute', zIndex: 99999, top: 'calc(100% + 4px)', right: 0,
          background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: 16,
          boxShadow: '0 15px 35px rgba(15,23,42,0.15), 0 5px 15px rgba(15,23,42,0.08)', overflow: 'hidden',
          width: 310, animation: 'fadeIn 0.1s ease',
        }}>
          <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #f1f5f9', background: '#ffffff', padding: '8px 6px', gap: 4 }}>
            {EMOJI_CATEGORIES.map((cat, ci) => {
              const isActive = activeCategory === ci;
              return (
                <button
                  key={ci}
                  type="button"
                  onClick={() => setActiveCategory(ci)}
                  style={{
                    border: 'none', padding: '5px 10px', borderRadius: 16, cursor: 'pointer',
                    fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                    background: isActive ? '#2563eb' : 'transparent',
                    color: isActive ? '#ffffff' : '#64748b',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
          <div style={{ padding: 10, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
            {EMOJI_CATEGORIES[activeCategory].emojis.map((em, ei) => (
              <button
                key={ei}
                type="button"
                onClick={() => insertEmoji(em)}
                title={em}
                style={{
                  border: '1px solid transparent', background: 'transparent',
                  borderRadius: 8, cursor: 'pointer', fontSize: 22, padding: '4px',
                  lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {em}
              </button>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #f1f5f9', padding: '6px 12px', background: '#f8fafc', fontSize: 11, color: '#64748b' }}>
            Click an emoji to insert directly into field
          </div>
        </div>
      )}
    </div>
  );
};

interface BlockPropertyInspectorProps {
  block: BuilderBlock;
  onChange: (updatedContent: any) => void;
  onToggleLock?: () => void;
}

// ─── Shared UI Components ─────────────────────────────────────────────────────

const SectionDivider: React.FC<{ label: string; style?: React.CSSProperties }> = ({ label, style }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0 4px 0', ...style }}>
    <span style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
  </div>
);

const Field: React.FC<{ label: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties }> = ({ label, children, style }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', boxSizing: 'border-box', ...style }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>{label}</label>
    {children}
  </div>
);

const inputStyle: React.CSSProperties = {
  width: '100%', maxWidth: '100%', padding: '7px 10px', fontSize: 13, border: '1px solid #cbd5e1',
  borderRadius: 6, outline: 'none', boxSizing: 'border-box', background: '#ffffff', color: '#0f172a',
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box',
};

const ColorField: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <Field label={label}>
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
      <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
        style={{ width: 36, height: 34, padding: 2, border: '1px solid #cbd5e1', cursor: 'pointer', borderRadius: 6, flexShrink: 0, boxSizing: 'border-box' }} />
      <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, fontFamily: 'monospace', flex: 1, minWidth: 0, width: '100%', boxSizing: 'border-box' }} />
    </div>
  </Field>
);

const AlignField: React.FC<{ value: string; onChange: (v: string) => void; style?: React.CSSProperties }> = ({ value, onChange, style }) => (
  <Field label="Alignment" style={style}>
    <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: 2, borderRadius: 6, width: '100%', boxSizing: 'border-box' }}>
      {(['left', 'center', 'right'] as const).map(a => (
        <button key={a} type="button" onClick={() => onChange(a)} style={{
          flex: 1, border: 'none', borderRadius: 4, cursor: 'pointer', padding: '5px',
          background: (value || 'left') === a ? '#ffffff' : 'transparent',
          color: (value || 'left') === a ? '#2563eb' : '#64748b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: (value || 'left') === a ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        }}>
          {a === 'left' && <AlignLeft size={14} />}
          {a === 'center' && <AlignCenter size={14} />}
          {a === 'right' && <AlignRight size={14} />}
        </button>
      ))}
    </div>
  </Field>
);

const FontSection: React.FC<{ content: any; onUpdate: (k: string, v: any) => void }> = ({ content, onUpdate }) => (
  <>
    <SectionDivider label="Typography" />
    <Field label="Font Family">
      <select value={content.fontFamily || 'inherit'} onChange={e => onUpdate('fontFamily', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
        <option value="inherit">Default (Inherited)</option>
        <option value="Inter, sans-serif">Inter</option>
        <option value="Roboto, sans-serif">Roboto</option>
        <option value="'Open Sans', sans-serif">Open Sans</option>
        <option value="Arial, sans-serif">Arial</option>
        <option value="Verdana, sans-serif">Verdana</option>
        <option value="Georgia, serif">Georgia</option>
        <option value="'Times New Roman', Times, serif">Times New Roman</option>
        <option value="'Courier New', Courier, monospace">Courier New</option>
        <option value="Impact, sans-serif">Impact</option>
      </select>
    </Field>
    <Field label={`Font Size (${content.fontSize || 14}px)`}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="range" min={10} max={72} value={content.fontSize || 14}
          onChange={e => onUpdate('fontSize', Number(e.target.value))} style={{ flex: 1 }} />
        <input type="number" min={10} max={72} value={content.fontSize || 14}
          onChange={e => onUpdate('fontSize', Number(e.target.value) || 14)}
          style={{ width: 52, padding: '4px 6px', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 4, textAlign: 'center' }} />
      </div>
    </Field>
    <Field label="Font Weight">
      <div style={{ display: 'flex', gap: 3 }}>
        {([['400', 'Regular'], ['500', 'Medium'], ['600', 'Semi'], ['700', 'Bold'], ['800', 'Extra']] as [string,string][]).map(([w, label]) => (
          <button key={w} type="button" onClick={() => onUpdate('fontWeight', w)} style={{
            flex: 1, padding: '5px 2px', fontSize: 10, fontWeight: Number(w), cursor: 'pointer',
            border: '1px solid',
            borderColor: (content.fontWeight || '400') === w ? '#2563eb' : '#cbd5e1',
            background: (content.fontWeight || '400') === w ? '#eff6ff' : '#ffffff',
            color: (content.fontWeight || '400') === w ? '#2563eb' : '#64748b',
            borderRadius: 4,
          }}>{label}</button>
        ))}
      </div>
    </Field>
    <ColorField label="Text Color" value={content.color || '#334155'} onChange={v => onUpdate('color', v)} />
    {'align' in content && <AlignField value={content.align || 'left'} onChange={v => onUpdate('align', v)} />}
    {'lineHeight' in content && (
      <Field label={`Line Height (${content.lineHeight ?? 1.5})`}>
        <input type="range" min={1} max={2.5} step={0.1} value={content.lineHeight || 1.5}
          onChange={e => onUpdate('lineHeight', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
    )}
  </>
);

const ButtonSection: React.FC<{
  sectionLabel?: string;
  labelField: string;
  urlField: string;
  colorField?: string;
  content: any;
  onUpdate: (k: string, v: any) => void;
  style?: React.CSSProperties;
}> = ({ sectionLabel = 'Button / CTA', labelField, urlField, colorField, content, onUpdate }) => (
  <>
    <SectionDivider label={sectionLabel} />
    <Field label="Button Text">
      <input type="text" value={content[labelField] || ''} onChange={e => onUpdate(labelField, e.target.value)}
        placeholder="Button label…" style={inputStyle} />
    </Field>
    <Field label={<span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Link2 size={11} />Button URL</span>}>
      <input type="text" value={content[urlField] || ''} onChange={e => onUpdate(urlField, e.target.value)}
        placeholder="https://…" style={inputStyle} />
    </Field>
    {colorField && (
      <ColorField label="Button Color" value={content[colorField] || '#2563eb'} onChange={v => onUpdate(colorField, v)} />
    )}
  </>
);

const SpacingSection: React.FC<{ content: any; onUpdate: (k: string, v: any) => void }> = ({ content, onUpdate }) => {
  const hasSpacing = 'padding' in content || 'paddingY' in content || 'height' in content || 'maxWidth' in content || 'borderRadius' in content;
  if (!hasSpacing) return null;
  return (
    <>
      <SectionDivider label="Spacing" />
      {'padding' in content && (
        <Field label={`Padding (${content.padding}px)`}>
          <input type="range" min={0} max={60} value={content.padding || 16}
            onChange={e => onUpdate('padding', Number(e.target.value))} style={{ width: '100%' }} />
        </Field>
      )}
      {'paddingY' in content && (
        <Field label={`Vertical Padding (${content.paddingY}px)`}>
          <input type="range" min={0} max={60} value={content.paddingY || 12}
            onChange={e => onUpdate('paddingY', Number(e.target.value))} style={{ width: '100%' }} />
        </Field>
      )}
      {'height' in content && (
        <Field label={`Height (${content.height}px)`}>
          <input type="range" min={10} max={500} step={5} value={content.height || 32}
            onChange={e => onUpdate('height', Number(e.target.value))} style={{ width: '100%' }} />
        </Field>
      )}
      {'maxWidth' in content && (
        <Field label={`Max Width (${content.maxWidth}px)`}>
          <input type="range" min={50} max={600} step={10} value={content.maxWidth || 200}
            onChange={e => onUpdate('maxWidth', Number(e.target.value))} style={{ width: '100%' }} />
        </Field>
      )}
      {'borderRadius' in content && (
        <Field label={`Border Radius (${content.borderRadius}px)`}>
          <input type="range" min={0} max={40} value={content.borderRadius || 0}
            onChange={e => onUpdate('borderRadius', Number(e.target.value))} style={{ width: '100%' }} />
        </Field>
      )}
    </>
  );
};

// ─── Block-specific field renderers ──────────────────────────────────────────

function renderBlockFields(block: BuilderBlock, content: any, upd: (k: string, v: any) => void): React.ReactNode {
  const type = block.type;

  if (type === 'text' || type === 'paragraph') {
    return (<>
      <SectionDivider label="Content" />
      <InlineEmojiInput
        label="Text Content"
        value={content.text || ''}
        onChange={val => upd('text', val)}
        isTextarea={true}
        rows={4}
        placeholder="Enter your text…"
      />
      <FontSection content={content} onUpdate={upd} />
      <SpacingSection content={content} onUpdate={upd} />
    </>);
  }

  if (type === 'heading') {
    return (<>
      <SectionDivider label="Content" />
      <InlineEmojiInput
        label="Heading Text"
        value={content.text || ''}
        onChange={val => upd('text', val)}
        placeholder="Heading…"
      />
      <Field label="HTML Tag" style={{ marginTop: 10 }}>
        <select value={content.tag || 'h2'} onChange={e => upd('tag', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="h1">H1 — Page Title</option>
          <option value="h2">H2 — Section Title</option>
          <option value="h3">H3 — Sub-section</option>
          <option value="h4">H4 — Subhead</option>
          <option value="h5">H5 — Minor Head</option>
          <option value="h6">H6 — Caption</option>
        </select>
      </Field>
      <FontSection content={content} onUpdate={upd} />
      {'letterSpacing' in content && (
        <Field label={`Letter Spacing (${content.letterSpacing}px)`}>
          <input type="range" min={-2} max={10} step={0.5} value={content.letterSpacing || 0}
            onChange={e => upd('letterSpacing', Number(e.target.value))} style={{ width: '100%' }} />
        </Field>
      )}
      <SpacingSection content={content} onUpdate={upd} />
    </>);
  }

  if (type === 'logo') {
    return (<>
      <SectionDivider label="Image" />
      <Field label="Logo Image URL"><input type="text" value={content.url || ''} onChange={e => upd('url', e.target.value)} placeholder="https://…" style={inputStyle} /></Field>
      <Field label="Alt Text"><input type="text" value={content.alt || ''} onChange={e => upd('alt', e.target.value)} placeholder="Company Logo" style={inputStyle} /></Field>
      <Field label="Link URL"><input type="text" value={content.linkUrl || ''} onChange={e => upd('linkUrl', e.target.value)} placeholder="https://example.com" style={inputStyle} /></Field>
      <SectionDivider label="Size & Alignment" />
      <Field label={`Logo Width (${content.maxWidth || 160}px)`}>
        <input type="range" min={20} max={600} step={10} value={content.maxWidth || 160} onChange={e => upd('maxWidth', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
      <AlignField value={content.align || 'center'} onChange={v => upd('align', v)} />
      <SpacingSection content={content} onUpdate={upd} />
    </>);
  }

  if (type === 'button') {
    return (<>
      <SectionDivider label="Content" />
      <InlineEmojiInput
        label="Button Label"
        value={content.label || ''}
        onChange={val => upd('label', val)}
        placeholder="Click Here"
      />
      <Field label="Button URL" style={{ marginTop: 10 }}>
        <input type="text" value={content.url || ''} onChange={e => upd('url', e.target.value)} style={inputStyle} placeholder="https://…" />
      </Field>
      <SectionDivider label="Appearance" />
      <Field label="Style">
        <select value={content.variant || 'solid'} onChange={e => upd('variant', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="solid">Solid Fill</option>
          <option value="outline">Outline</option>
          <option value="ghost">Ghost / Text</option>
        </select>
      </Field>
      <Field label="Size">
        <select value={content.size || 'medium'} onChange={e => upd('size', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </Field>
      <ColorField label="Background Color" value={content.backgroundColor || '#2563eb'} onChange={v => upd('backgroundColor', v)} />
      <ColorField label="Text Color" value={content.color || '#ffffff'} onChange={v => upd('color', v)} />
      <AlignField value={content.align || 'center'} onChange={v => upd('align', v)} />
      <Field label={`Border Radius (${content.borderRadius ?? 6}px)`}>
        <input type="range" min={0} max={40} value={content.borderRadius ?? 6} onChange={e => upd('borderRadius', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
      <Field label={`Padding X (${content.paddingX ?? 24}px)`}>
        <input type="range" min={8} max={60} value={content.paddingX ?? 24} onChange={e => upd('paddingX', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
      <Field label={`Padding Y (${content.paddingY ?? 12}px)`}>
        <input type="range" min={4} max={40} value={content.paddingY ?? 12} onChange={e => upd('paddingY', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
    </>);
  }

  if (type === 'dualButton') {
    return (<>
      <SectionDivider label="Primary Button" />
      <Field label="Label"><input type="text" value={content.primaryLabel || ''} onChange={e => upd('primaryLabel', e.target.value)} style={inputStyle} /></Field>
      <Field label="URL"><input type="text" value={content.primaryUrl || ''} onChange={e => upd('primaryUrl', e.target.value)} style={inputStyle} /></Field>
      <ColorField label="Background" value={content.primaryBg || '#2563eb'} onChange={v => upd('primaryBg', v)} />
      <ColorField label="Text Color" value={content.primaryColor || '#ffffff'} onChange={v => upd('primaryColor', v)} />
      <SectionDivider label="Secondary Button" />
      <Field label="Label"><input type="text" value={content.secondaryLabel || ''} onChange={e => upd('secondaryLabel', e.target.value)} style={inputStyle} /></Field>
      <Field label="URL"><input type="text" value={content.secondaryUrl || ''} onChange={e => upd('secondaryUrl', e.target.value)} style={inputStyle} /></Field>
      <ColorField label="Background" value={content.secondaryBg || '#f1f5f9'} onChange={v => upd('secondaryBg', v)} />
      <ColorField label="Text Color" value={content.secondaryColor || '#334155'} onChange={v => upd('secondaryColor', v)} />
      <AlignField value={content.align || 'center'} onChange={v => upd('align', v)} />
    </>);
  }

  if (type === 'image') {
    return (<>
      <SectionDivider label="Image" />
      <Field label="Image URL"><input type="text" value={content.url || ''} onChange={e => upd('url', e.target.value)} style={inputStyle} placeholder="https://…" /></Field>
      <Field label="Alt Text"><input type="text" value={content.alt || ''} onChange={e => upd('alt', e.target.value)} style={inputStyle} /></Field>
      <Field label="Link URL"><input type="text" value={content.linkUrl || ''} onChange={e => upd('linkUrl', e.target.value)} style={inputStyle} placeholder="https://…" /></Field>
      <Field label="Caption"><input type="text" value={content.caption || ''} onChange={e => upd('caption', e.target.value)} style={inputStyle} /></Field>
      <AlignField value={content.align || 'center'} onChange={v => upd('align', v)} />
      <Field label={`Border Radius (${content.borderRadius ?? 8}px)`}>
        <input type="range" min={0} max={40} value={content.borderRadius ?? 8} onChange={e => upd('borderRadius', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
    </>);
  }

  if (type === 'heroBanner') {
    return (<>
      <SectionDivider label="Content" />
      <InlineEmojiInput
        label="Title"
        value={content.title || ''}
        onChange={val => upd('title', val)}
        placeholder="Hero banner heading..."
      />
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Subtitle"
          value={content.subtitle || ''}
          onChange={val => upd('subtitle', val)}
          isTextarea={true}
          rows={2}
          placeholder="Subtitle text..."
        />
      </div>
      <ButtonSection labelField="ctaLabel" urlField="ctaUrl" colorField="ctaColor" content={content} onUpdate={upd} style={{ marginTop: 10 }} />
      <SectionDivider label="Appearance" />
      <Field label="Background Image URL"><input type="text" value={content.imageUrl || ''} onChange={e => upd('imageUrl', e.target.value)} style={inputStyle} /></Field>
      <ColorField label="Overlay Color" value={content.overlayColor || 'rgba(0,0,0,0.5)'} onChange={v => upd('overlayColor', v)} />
      <AlignField value={content.align || 'center'} onChange={v => upd('align', v)} />
      <Field label={`Height (${content.height || 320}px)`}>
        <input type="range" min={100} max={600} step={10} value={content.height || 320} onChange={e => upd('height', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
    </>);
  }

  if (type === 'callout') {
    return (<>
      <SectionDivider label="Content" />
      <EmojiPickerField value={content.icon || ''} onChange={v => upd('icon', v)} placeholder="🚀" />
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Title"
          value={content.title || ''}
          onChange={val => upd('title', val)}
          placeholder="Callout title..."
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Description"
          value={content.description || ''}
          onChange={val => upd('description', val)}
          isTextarea={true}
          rows={3}
          placeholder="Callout description..."
        />
      </div>
      <ButtonSection labelField="ctaLabel" urlField="ctaUrl" content={content} onUpdate={upd} style={{ marginTop: 10 }} />
      <SectionDivider label="Colors" />
      <ColorField label="Background Color" value={content.bgColor || '#eff6ff'} onChange={v => upd('bgColor', v)} />
      <ColorField label="Border Color" value={content.borderColor || '#bfdbfe'} onChange={v => upd('borderColor', v)} />
      <ColorField label="Accent / Button Color" value={content.accentColor || '#2563eb'} onChange={v => upd('accentColor', v)} />
    </>);
  }

  if (type === 'infoCard') {
    return (<>
      <SectionDivider label="Content" />
      <EmojiPickerField value={content.icon || ''} onChange={v => upd('icon', v)} placeholder="💡" />
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Title / Heading"
          value={content.title || ''}
          onChange={val => upd('title', val)}
          placeholder="Heading..."
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Description"
          value={content.description || ''}
          onChange={val => upd('description', val)}
          isTextarea={true}
          rows={3}
          placeholder="Description..."
        />
      </div>
      <ButtonSection labelField="buttonLabel" urlField="buttonUrl" content={content} onUpdate={upd} style={{ marginTop: 10 }} />
      <SectionDivider label="Colors & Layout" />
      <ColorField label="Background Color" value={content.bgColor || '#f8fafc'} onChange={v => upd('bgColor', v)} />
      <AlignField value={content.align || 'center'} onChange={v => upd('align', v)} />
    </>);
  }

  if (type === 'featureCard') {
    return (<>
      <SectionDivider label="Content" />
      <EmojiPickerField value={content.icon || ''} onChange={v => upd('icon', v)} placeholder="⚡" />
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Title"
          value={content.title || ''}
          onChange={val => upd('title', val)}
          placeholder="Feature title..."
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Description"
          value={content.description || ''}
          onChange={val => upd('description', val)}
          isTextarea={true}
          rows={3}
          placeholder="Feature description..."
        />
      </div>
      <ButtonSection labelField="ctaLabel" urlField="ctaUrl" content={content} onUpdate={upd} style={{ marginTop: 10 }} />
      <SectionDivider label="Colors" />
      <ColorField label="Background Color" value={content.bgColor || '#ffffff'} onChange={v => upd('bgColor', v)} />
      <ColorField label="Border Color" value={content.borderColor || '#e2e8f0'} onChange={v => upd('borderColor', v)} />
    </>);
  }

  if (type === 'buttonCard') {
    return (<>
      <SectionDivider label="Content" />
      <EmojiPickerField value={content.icon || ''} onChange={v => upd('icon', v)} />
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Heading"
          value={content.heading || ''}
          onChange={val => upd('heading', val)}
          placeholder="Heading..."
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Description"
          value={content.description || ''}
          onChange={val => upd('description', val)}
          isTextarea={true}
          rows={3}
          placeholder="Description..."
        />
      </div>
      <ButtonSection labelField="ctaLabel" urlField="ctaUrl" content={content} onUpdate={upd} style={{ marginTop: 10 }} />
      <SectionDivider label="Colors" />
      <ColorField label="Background Color" value={content.bgColor || '#ffffff'} onChange={v => upd('bgColor', v)} />
      <ColorField label="Accent Color" value={content.accentColor || '#2563eb'} onChange={v => upd('accentColor', v)} />
    </>);
  }

  if (type === 'highlightBox') {
    return (<>
      <SectionDivider label="Content" />
      <EmojiPickerField value={content.icon || ''} onChange={v => upd('icon', v)} />
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Heading"
          value={content.heading || ''}
          onChange={val => upd('heading', val)}
          placeholder="Heading..."
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Text"
          value={content.text || ''}
          onChange={val => upd('text', val)}
          isTextarea={true}
          rows={3}
          placeholder="Body text..."
        />
      </div>
      <ButtonSection labelField="ctaLabel" urlField="ctaUrl" content={content} onUpdate={upd} style={{ marginTop: 10 }} />
      <SectionDivider label="Colors" />
      <ColorField label="Background Color" value={content.bgColor || '#f8fafc'} onChange={v => upd('bgColor', v)} />
      <ColorField label="Text Color" value={content.textColor || '#0f172a'} onChange={v => upd('textColor', v)} />
    </>);
  }

  if (type === 'bannerCta') {
    return (<>
      <SectionDivider label="Content" />
      <InlineEmojiInput
        label="Headline"
        value={content.headline || ''}
        onChange={val => upd('headline', val)}
        placeholder="Headline..."
      />
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Sub-headline"
          value={content.subheadline || ''}
          onChange={val => upd('subheadline', val)}
          placeholder="Sub-headline..."
        />
      </div>
      <ButtonSection labelField="ctaLabel" urlField="ctaUrl" content={content} onUpdate={upd} style={{ marginTop: 10 }} />
      <SectionDivider label="Appearance" />
      <Field label="Background Image URL"><input type="text" value={content.imageUrl || ''} onChange={e => upd('imageUrl', e.target.value)} style={inputStyle} /></Field>
      <ColorField label="Background Color" value={content.bgColor || '#1e293b'} onChange={v => upd('bgColor', v)} />
    </>);
  }

  if (type === 'newsletterHeader') {
    return (<>
      <SectionDivider label="Content" />
      <Field label="Logo URL"><input type="text" value={content.logoUrl || ''} onChange={e => upd('logoUrl', e.target.value)} style={inputStyle} /></Field>
      <InlineEmojiInput
        label="Title"
        value={content.title || ''}
        onChange={val => upd('title', val)}
        placeholder="Title..."
      />
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Subtitle"
          value={content.subtitle || ''}
          onChange={val => upd('subtitle', val)}
          placeholder="Subtitle..."
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Issue Date"
          value={content.issueDate || ''}
          onChange={val => upd('issueDate', val)}
          placeholder="Issue Date..."
        />
      </div>
      <SectionDivider label="Colors" style={{ marginTop: 10 }} />
      <ColorField label="Background Color" value={content.bgColor || '#0f172a'} onChange={v => upd('bgColor', v)} />
      <ColorField label="Accent Color" value={content.accentColor || '#2563eb'} onChange={v => upd('accentColor', v)} />
    </>);
  }

  if (type === 'quote') {
    return (<>
      <SectionDivider label="Content" />
      <InlineEmojiInput
        label="Quote Text"
        value={content.quote || ''}
        onChange={val => upd('quote', val)}
        isTextarea={true}
        rows={3}
        placeholder="Quote..."
      />
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Author Name"
          value={content.author || ''}
          onChange={val => upd('author', val)}
          placeholder="Author..."
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Role / Title"
          value={content.role || ''}
          onChange={val => upd('role', val)}
          placeholder="Role..."
        />
      </div>
      <Field label="Avatar Image URL" style={{ marginTop: 10 }}><input type="text" value={content.avatarUrl || ''} onChange={e => upd('avatarUrl', e.target.value)} style={inputStyle} /></Field>
      <SectionDivider label="Colors" />
      <ColorField label="Background Color" value={content.bgColor || '#f8fafc'} onChange={v => upd('bgColor', v)} />
      <ColorField label="Accent Color" value={content.accentColor || '#2563eb'} onChange={v => upd('accentColor', v)} />
    </>);
  }

  if (type === 'pricingCard') {
    return (<>
      <SectionDivider label="Content" />
      <InlineEmojiInput
        label="Plan Name"
        value={content.planName || ''}
        onChange={val => upd('planName', val)}
        placeholder="Plan name..."
      />
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Price"
          value={content.price || ''}
          onChange={val => upd('price', val)}
          placeholder="$99"
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Period"
          value={content.period || ''}
          onChange={val => upd('period', val)}
          placeholder="/month"
        />
      </div>
      <Field label="Features (one per line)" style={{ marginTop: 10 }}>
        <textarea value={(content.features || []).join('\n')} onChange={e => upd('features', e.target.value.split('\n'))} rows={5} style={textareaStyle} />
      </Field>
      <ButtonSection labelField="ctaLabel" urlField="ctaUrl" content={content} onUpdate={upd} />
      <SectionDivider label="Colors" />
      <ColorField label="Background Color" value={content.bgColor || '#ffffff'} onChange={v => upd('bgColor', v)} />
      <ColorField label="Accent Color" value={content.accentColor || '#2563eb'} onChange={v => upd('accentColor', v)} />
      <Field label="Popular Badge">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={content.isPopular || false} onChange={e => upd('isPopular', e.target.checked)} />
          <span style={{ fontSize: 13, color: '#334155' }}>Show "Most Popular" badge</span>
        </label>
      </Field>
    </>);
  }

  if (type === 'signature') {
    return (<>
      <SectionDivider label="Contact Details" />
      <Field label="Name"><input type="text" value={content.name || ''} onChange={e => upd('name', e.target.value)} style={inputStyle} /></Field>
      <Field label="Role / Title"><input type="text" value={content.role || ''} onChange={e => upd('role', e.target.value)} style={inputStyle} /></Field>
      <Field label="Company"><input type="text" value={content.company || ''} onChange={e => upd('company', e.target.value)} style={inputStyle} /></Field>
      <Field label="Email"><input type="text" value={content.email || ''} onChange={e => upd('email', e.target.value)} style={inputStyle} /></Field>
      <Field label="Phone"><input type="text" value={content.phone || ''} onChange={e => upd('phone', e.target.value)} style={inputStyle} /></Field>
      <Field label="Avatar Image URL"><input type="text" value={content.avatarUrl || ''} onChange={e => upd('avatarUrl', e.target.value)} style={inputStyle} /></Field>
      <ColorField label="Accent Color" value={content.accentColor || '#2563eb'} onChange={v => upd('accentColor', v)} />
    </>);
  }

  if (type === 'footer') {
    return (<>
      <SectionDivider label="Company Info" />
      <Field label="Company Name"><input type="text" value={content.companyName || ''} onChange={e => upd('companyName', e.target.value)} style={inputStyle} /></Field>
      <Field label="Address"><textarea value={content.address || ''} onChange={e => upd('address', e.target.value)} rows={2} style={textareaStyle} /></Field>
      <Field label="Copyright Text"><input type="text" value={content.copyrightText || ''} onChange={e => upd('copyrightText', e.target.value)} style={inputStyle} /></Field>
      <SectionDivider label="Links" />
      <Field label="Unsubscribe URL"><input type="text" value={content.unsubscribeUrl || ''} onChange={e => upd('unsubscribeUrl', e.target.value)} style={inputStyle} /></Field>
      <Field label="Privacy Policy URL"><input type="text" value={content.privacyUrl || ''} onChange={e => upd('privacyUrl', e.target.value)} style={inputStyle} /></Field>
      <SectionDivider label="Appearance" />
      <ColorField label="Text Color" value={content.textColor || '#94a3b8'} onChange={v => upd('textColor', v)} />
      <AlignField value={content.align || 'center'} onChange={v => upd('align', v)} />
    </>);
  }

  if (type === 'alertBox') {
    return (<>
      <SectionDivider label="Content" />
      <Field label="Alert Type">
        <select value={content.variant || 'info'} onChange={e => upd('variant', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="success">✅ Success</option>
          <option value="info">ℹ️ Info</option>
          <option value="warning">⚠️ Warning</option>
          <option value="danger">🚨 Danger</option>
        </select>
      </Field>
      <InlineEmojiInput
        label="Title"
        value={content.title || ''}
        onChange={val => upd('title', val)}
        placeholder="Alert title..."
      />
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Message"
          value={content.message || ''}
          onChange={val => upd('message', val)}
          isTextarea={true}
          rows={3}
          placeholder="Alert message..."
        />
      </div>
    </>);
  }

  if (type === 'container') {
    return (<>
      <SectionDivider label="Content" />
      <InlineEmojiInput
        label="Title"
        value={content.title || ''}
        onChange={val => upd('title', val)}
        placeholder="Container title..."
      />
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Description"
          value={content.description || ''}
          onChange={val => upd('description', val)}
          isTextarea={true}
          rows={3}
          placeholder="Container description..."
        />
      </div>
      <SectionDivider label="Appearance" style={{ marginTop: 10 }} />
      <ColorField label="Background Color" value={content.bgColor || '#ffffff'} onChange={v => upd('bgColor', v)} />
      <ColorField label="Border Color" value={content.borderColor || '#e2e8f0'} onChange={v => upd('borderColor', v)} />
      <SpacingSection content={content} onUpdate={upd} />
    </>);
  }

  if (type === 'divider') {
    return (<>
      <SectionDivider label="Appearance" />
      <Field label="Style">
        <select value={content.style || 'solid'} onChange={e => upd('style', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
        </select>
      </Field>
      <ColorField label="Color" value={content.color || '#e2e8f0'} onChange={v => upd('color', v)} />
      <Field label={`Thickness (${content.thickness || 1}px)`}>
        <input type="range" min={1} max={8} value={content.thickness || 1} onChange={e => upd('thickness', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
      <Field label={`Top Padding (${content.paddingTop || 16}px)`}>
        <input type="range" min={0} max={60} value={content.paddingTop || 16} onChange={e => upd('paddingTop', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
      <Field label={`Bottom Padding (${content.paddingBottom || 16}px)`}>
        <input type="range" min={0} max={60} value={content.paddingBottom || 16} onChange={e => upd('paddingBottom', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
    </>);
  }

  if (type === 'spacer') {
    return (<>
      <SectionDivider label="Size" />
      <Field label={`Height (${content.height || 32}px)`}>
        <input type="range" min={8} max={200} step={4} value={content.height || 32} onChange={e => upd('height', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
    </>);
  }

  if (type === 'video') {
    return (<>
      <SectionDivider label="Video" />
      <Field label="Thumbnail Image URL"><input type="text" value={content.thumbnailUrl || ''} onChange={e => upd('thumbnailUrl', e.target.value)} style={inputStyle} /></Field>
      <Field label="Video URL (YouTube / Vimeo)"><input type="text" value={content.videoUrl || ''} onChange={e => upd('videoUrl', e.target.value)} style={inputStyle} /></Field>
      <Field label="Alt Text"><input type="text" value={content.alt || ''} onChange={e => upd('alt', e.target.value)} style={inputStyle} /></Field>
      <Field label={`Border Radius (${content.borderRadius ?? 8}px)`}>
        <input type="range" min={0} max={30} value={content.borderRadius ?? 8} onChange={e => upd('borderRadius', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
    </>);
  }

  if (type === 'greeting') {
    return (<>
      <SectionDivider label="Content" />
      <InlineEmojiInput
        label="Greeting Word"
        value={content.greeting || 'Hello'}
        onChange={val => upd('greeting', val)}
        placeholder="Hello"
      />
      <div style={{ marginTop: 10 }}>
        <Field label="Variable">
          <input type="text" value={content.variable || 'customer.firstName'} onChange={e => upd('variable', e.target.value)} style={inputStyle} />
        </Field>
      </div>
      <EmojiPickerField label="Emoji" value={content.emoji || ''} onChange={v => upd('emoji', v)} placeholder="👋" />
      <SectionDivider label="Typography" />
      <Field label={`Font Size (${content.fontSize || 20}px)`}>
        <input type="range" min={14} max={48} value={content.fontSize || 20} onChange={e => upd('fontSize', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
      <ColorField label="Text Color" value={content.color || '#0f172a'} onChange={v => upd('color', v)} />
      <AlignField value={content.align || 'left'} onChange={v => upd('align', v)} />
    </>);
  }

  if (type === 'badge') {
    return (<>
      <SectionDivider label="Content" />
      <InlineEmojiInput
        label="Badge Text"
        value={content.text || ''}
        onChange={val => upd('text', val)}
        placeholder="New..."
      />
      <div style={{ marginTop: 10 }}>
        <Field label="Size">
          <select value={content.size || 'medium'} onChange={e => upd('size', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </Field>
      </div>
      <SectionDivider label="Colors" />
      <ColorField label="Background Color" value={content.bgColor || '#2563eb'} onChange={v => upd('bgColor', v)} />
      <ColorField label="Text Color" value={content.textColor || '#ffffff'} onChange={v => upd('textColor', v)} />
      <AlignField value={content.align || 'center'} onChange={v => upd('align', v)} />
    </>);
  }

  if (type === 'iconText') {
    return (<>
      <SectionDivider label="Content" />
      <EmojiPickerField value={content.icon || ''} onChange={v => upd('icon', v)} />
      <ColorField label="Icon Color" value={content.iconColor || '#2563eb'} onChange={v => upd('iconColor', v)} />
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Heading"
          value={content.heading || ''}
          onChange={val => upd('heading', val)}
          placeholder="Heading..."
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <InlineEmojiInput
          label="Description"
          value={content.description || ''}
          onChange={val => upd('description', val)}
          isTextarea={true}
          rows={3}
          placeholder="Description..."
        />
      </div>
      <AlignField value={content.align || 'left'} onChange={v => upd('align', v)} style={{ marginTop: 10 }} />
    </>);
  }

  if (type === 'statistics') {
    const stats = content.stats || [];
    return (<>
      <SectionDivider label="Stats" />
      {stats.map((stat: any, i: number) => (
        <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Stat #{i + 1}</span>
            <button type="button" onClick={() => { const s = [...stats]; s.splice(i, 1); upd('stats', s); }} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}><Trash2 size={12} /></button>
          </div>
          <input type="text" value={stat.value || ''} onChange={e => { const s = [...stats]; s[i] = { ...s[i], value: e.target.value }; upd('stats', s); }} style={inputStyle} placeholder="Value (e.g. 99%)" />
          <input type="text" value={stat.label || ''} onChange={e => { const s = [...stats]; s[i] = { ...s[i], label: e.target.value }; upd('stats', s); }} style={inputStyle} placeholder="Label (e.g. Delivery Rate)" />
          <input type="text" value={stat.subtext || ''} onChange={e => { const s = [...stats]; s[i] = { ...s[i], subtext: e.target.value }; upd('stats', s); }} style={inputStyle} placeholder="Subtext (optional)" />
        </div>
      ))}
      <button type="button" onClick={() => upd('stats', [...stats, { value: '', label: '', subtext: '' }])} style={{ padding: '6px 12px', border: '1px dashed #cbd5e1', borderRadius: 6, background: '#f8fafc', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Plus size={12} /> Add Stat
      </button>
      <SectionDivider label="Colors" />
      <ColorField label="Background" value={content.bgColor || '#ffffff'} onChange={v => upd('bgColor', v)} />
      <ColorField label="Accent Color" value={content.accentColor || '#2563eb'} onChange={v => upd('accentColor', v)} />
    </>);
  }

  if (type === 'benefitsList') {
    const items = content.items || [];
    return (<>
      <SectionDivider label="Items" />
      {items.map((item: string, i: number) => (
        <div key={i} style={{ display: 'flex', gap: 6 }}>
          <input type="text" value={item} onChange={e => { const it = [...items]; it[i] = e.target.value; upd('items', it); }} style={{ ...inputStyle, flex: 1 }} />
          <button type="button" onClick={() => { const it = [...items]; it.splice(i, 1); upd('items', it); }} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={13} /></button>
        </div>
      ))}
      <button type="button" onClick={() => upd('items', [...items, ''])} style={{ padding: '6px 12px', border: '1px dashed #cbd5e1', borderRadius: 6, background: '#f8fafc', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Plus size={12} /> Add Item
      </button>
      <SectionDivider label="Appearance" />
      <EmojiPickerField label="Icon / Bullet" value={content.icon || '✅'} onChange={v => upd('icon', v)} placeholder="✅" />
      <ColorField label="Icon Color" value={content.iconColor || '#10b981'} onChange={v => upd('iconColor', v)} />
      <Field label={`Font Size (${content.fontSize || 14}px)`}>
        <input type="range" min={10} max={24} value={content.fontSize || 14} onChange={e => upd('fontSize', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
    </>);
  }

  if (type === 'bulletList') {
    const items = content.items || [];
    return (<>
      <SectionDivider label="Items" />
      {items.map((item: string, i: number) => (
        <div key={i} style={{ display: 'flex', gap: 6 }}>
          <input type="text" value={item} onChange={e => { const it = [...items]; it[i] = e.target.value; upd('items', it); }} style={{ ...inputStyle, flex: 1 }} />
          <button type="button" onClick={() => { const it = [...items]; it.splice(i, 1); upd('items', it); }} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={13} /></button>
        </div>
      ))}
      <button type="button" onClick={() => upd('items', [...items, ''])} style={{ padding: '6px 12px', border: '1px dashed #cbd5e1', borderRadius: 6, background: '#f8fafc', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Plus size={12} /> Add Item
      </button>
      <SectionDivider label="Style" />
      <Field label="Bullet Style">
        <select value={content.bulletStyle || 'check'} onChange={e => upd('bulletStyle', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="check">✅ Checkmark</option>
          <option value="arrow">➡️ Arrow</option>
          <option value="star">⭐ Star</option>
          <option value="dot">• Dot</option>
        </select>
      </Field>
      <ColorField label="Bullet Color" value={content.bulletColor || '#2563eb'} onChange={v => upd('bulletColor', v)} />
      <Field label={`Font Size (${content.fontSize || 14}px)`}>
        <input type="range" min={10} max={24} value={content.fontSize || 14} onChange={e => upd('fontSize', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
    </>);
  }

  if (type === 'numberedSteps') {
    const steps = content.steps || [];
    return (<>
      <SectionDivider label="Steps" />
      {steps.map((step: any, i: number) => (
        <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Step {i + 1}</span>
            <button type="button" onClick={() => { const s = [...steps]; s.splice(i, 1); upd('steps', s); }} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={12} /></button>
          </div>
          <input type="text" value={step.title || ''} onChange={e => { const s = [...steps]; s[i] = { ...s[i], title: e.target.value }; upd('steps', s); }} style={inputStyle} placeholder="Step title…" />
          <textarea value={step.description || ''} onChange={e => { const s = [...steps]; s[i] = { ...s[i], description: e.target.value }; upd('steps', s); }} rows={2} style={textareaStyle} placeholder="Description…" />
        </div>
      ))}
      <button type="button" onClick={() => upd('steps', [...steps, { stepNumber: steps.length + 1, title: '', description: '' }])} style={{ padding: '6px 12px', border: '1px dashed #cbd5e1', borderRadius: 6, background: '#f8fafc', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Plus size={12} /> Add Step
      </button>
      <ColorField label="Accent Color" value={content.accentColor || '#2563eb'} onChange={v => upd('accentColor', v)} />
    </>);
  }

  if (type === 'checklist') {
    const items = content.items || [];
    return (<>
      <SectionDivider label="Title" />
      <Field label="Checklist Title"><input type="text" value={content.title || ''} onChange={e => upd('title', e.target.value)} style={inputStyle} /></Field>
      <SectionDivider label="Items" />
      {items.map((item: any, i: number) => (
        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={item.checked || false} onChange={e => { const it = [...items]; it[i] = { ...it[i], checked: e.target.checked }; upd('items', it); }} />
          <input type="text" value={item.text || ''} onChange={e => { const it = [...items]; it[i] = { ...it[i], text: e.target.value }; upd('items', it); }} style={{ ...inputStyle, flex: 1 }} />
          <button type="button" onClick={() => { const it = [...items]; it.splice(i, 1); upd('items', it); }} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={13} /></button>
        </div>
      ))}
      <button type="button" onClick={() => upd('items', [...items, { text: '', checked: false }])} style={{ padding: '6px 12px', border: '1px dashed #cbd5e1', borderRadius: 6, background: '#f8fafc', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Plus size={12} /> Add Item
      </button>
      <ColorField label="Check Color" value={content.checkColor || '#10b981'} onChange={v => upd('checkColor', v)} />
    </>);
  }

  if (type === 'faqAccordion') {
    const items = content.items || [];
    return (<>
      <SectionDivider label="FAQ Items" />
      {items.map((item: any, i: number) => (
        <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Q{i + 1}</span>
            <button type="button" onClick={() => { const it = [...items]; it.splice(i, 1); upd('items', it); }} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={12} /></button>
          </div>
          <input type="text" value={item.question || ''} onChange={e => { const it = [...items]; it[i] = { ...it[i], question: e.target.value }; upd('items', it); }} style={inputStyle} placeholder="Question…" />
          <textarea value={item.answer || ''} onChange={e => { const it = [...items]; it[i] = { ...it[i], answer: e.target.value }; upd('items', it); }} rows={2} style={textareaStyle} placeholder="Answer…" />
        </div>
      ))}
      <button type="button" onClick={() => upd('items', [...items, { question: '', answer: '' }])} style={{ padding: '6px 12px', border: '1px dashed #cbd5e1', borderRadius: 6, background: '#f8fafc', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Plus size={12} /> Add FAQ
      </button>
      <SectionDivider label="Colors" />
      <ColorField label="Background" value={content.bgColor || '#ffffff'} onChange={v => upd('bgColor', v)} />
      <ColorField label="Border Color" value={content.borderColor || '#e2e8f0'} onChange={v => upd('borderColor', v)} />
    </>);
  }

  if (type === 'multiFeature') {
    const items = content.items || [];
    return (<>
      <SectionDivider label="Layout" />
      <Field label="Columns">
        <select value={content.columns || 3} onChange={e => upd('columns', Number(e.target.value))} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value={1}>1 Column</option>
          <option value={2}>2 Columns</option>
          <option value={3}>3 Columns</option>
        </select>
      </Field>
      <SectionDivider label="Feature Items" />
      {items.map((item: any, i: number) => (
        <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Feature {i + 1}</span>
            <button type="button" onClick={() => { const it = [...items]; it.splice(i, 1); upd('items', it); }} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={12} /></button>
          </div>
          <input type="text" value={item.icon || ''} onChange={e => { const it = [...items]; it[i] = { ...it[i], icon: e.target.value }; upd('items', it); }} style={inputStyle} placeholder="Icon / Emoji" />
          <input type="text" value={item.title || ''} onChange={e => { const it = [...items]; it[i] = { ...it[i], title: e.target.value }; upd('items', it); }} style={inputStyle} placeholder="Title" />
          <textarea value={item.description || ''} onChange={e => { const it = [...items]; it[i] = { ...it[i], description: e.target.value }; upd('items', it); }} rows={2} style={textareaStyle} placeholder="Description" />
        </div>
      ))}
      <button type="button" onClick={() => upd('items', [...items, { icon: '⭐', title: '', description: '' }])} style={{ padding: '6px 12px', border: '1px dashed #cbd5e1', borderRadius: 6, background: '#f8fafc', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Plus size={12} /> Add Feature
      </button>
    </>);
  }

  if (type === 'timeline') {
    const events = content.events || [];
    return (<>
      <SectionDivider label="Timeline Events" />
      {events.map((ev: any, i: number) => (
        <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Event {i + 1}</span>
            <button type="button" onClick={() => { const evs = [...events]; evs.splice(i, 1); upd('events', evs); }} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={12} /></button>
          </div>
          <input type="text" value={ev.date || ''} onChange={e => { const evs = [...events]; evs[i] = { ...evs[i], date: e.target.value }; upd('events', evs); }} style={inputStyle} placeholder="Date (e.g. Jan 2024)" />
          <input type="text" value={ev.title || ''} onChange={e => { const evs = [...events]; evs[i] = { ...evs[i], title: e.target.value }; upd('events', evs); }} style={inputStyle} placeholder="Title" />
          <textarea value={ev.description || ''} onChange={e => { const evs = [...events]; evs[i] = { ...evs[i], description: e.target.value }; upd('events', evs); }} rows={2} style={textareaStyle} placeholder="Description" />
        </div>
      ))}
      <button type="button" onClick={() => upd('events', [...events, { date: '', title: '', description: '' }])} style={{ padding: '6px 12px', border: '1px dashed #cbd5e1', borderRadius: 6, background: '#f8fafc', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Plus size={12} /> Add Event
      </button>
      <ColorField label="Accent Color" value={content.accentColor || '#2563eb'} onChange={v => upd('accentColor', v)} />
    </>);
  }

  if (type === 'variable') {
    return (<>
      <SectionDivider label="Variable" />
      <Field label="Variable Name"><input type="text" value={content.variableName || ''} onChange={e => upd('variableName', e.target.value)} style={inputStyle} placeholder="customer.firstName" /></Field>
      <Field label="Fallback Value"><input type="text" value={content.fallback || ''} onChange={e => upd('fallback', e.target.value)} style={inputStyle} placeholder="Friend" /></Field>
      <Field label="Display Label"><input type="text" value={content.label || ''} onChange={e => upd('label', e.target.value)} style={inputStyle} /></Field>
      <AlignField value={content.align || 'left'} onChange={v => upd('align', v)} />
    </>);
  }

  if (type === 'code') {
    return (<>
      <SectionDivider label="Code" />
      <Field label="Language"><input type="text" value={content.language || ''} onChange={e => upd('language', e.target.value)} style={inputStyle} placeholder="javascript" /></Field>
      <Field label="Code Snippet">
        <textarea value={content.code || ''} onChange={e => upd('code', e.target.value)} rows={6} style={{ ...textareaStyle, fontFamily: 'monospace', fontSize: 12 }} />
      </Field>
      <SectionDivider label="Colors" />
      <ColorField label="Background Color" value={content.bgColor || '#1e293b'} onChange={v => upd('bgColor', v)} />
      <ColorField label="Text Color" value={content.textColor || '#e2e8f0'} onChange={v => upd('textColor', v)} />
    </>);
  }

  if (type === 'html') {
    return (<>
      <SectionDivider label="Custom HTML" />
      <Field label="HTML Content">
        <textarea value={content.html || ''} onChange={e => upd('html', e.target.value)} rows={8} style={{ ...textareaStyle, fontFamily: 'monospace', fontSize: 12 }} />
      </Field>
    </>);
  }

  if (type === 'emojiRow') {
    const emoji = content.emoji || content.emojis?.[0] || '🚀';

    return (<>
      <SectionDivider label="Emoji" />
      <EmojiPickerField
        label="Select Emoji"
        value={emoji}
        onChange={(val) => upd('emoji', val)}
        placeholder="🚀"
      />
      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: 8 }}>
          <input
            type="checkbox"
            checked={content.isParagraph || false}
            onChange={(e) => upd('isParagraph', e.target.checked)}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Use Paragraph Layout</span>
        </label>
        <InlineEmojiInput
          label={content.isParagraph ? "Paragraph After Emoji" : "Text After Emoji"}
          value={content.text || ''}
          onChange={(val) => upd('text', val)}
          isTextarea={content.isParagraph || false}
          rows={3}
          placeholder={content.isParagraph ? "Enter paragraph content..." : "Enter accompanying text..."}
        />
      </div>

      <SectionDivider label="Appearance & Layout" style={{ marginTop: 12 }} />
      <Field label={`Emoji Size (${content.size || 28}px)`}>
        <input
          type="range"
          min={16}
          max={120}
          value={content.size || 28}
          onChange={e => upd('size', Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </Field>
      <AlignField value={content.align || 'center'} onChange={v => upd('align', v)} />
    </>);
  }

  if (type === 'coupon') {
    return (<>
      <SectionDivider label="Promo Coupon Details" />
      <Field label="Headline Text"><input type="text" value={content.headline || ''} onChange={e => upd('headline', e.target.value)} style={inputStyle} placeholder="SPECIAL PROMO DISCOUNT" /></Field>
      <ColorField label="Headline Color" value={content.headlineColor || '#1e293b'} onChange={v => upd('headlineColor', v)} />
      <Field label="Discount Badge Text"><input type="text" value={content.discount || ''} onChange={e => upd('discount', e.target.value)} style={inputStyle} placeholder="20% OFF" /></Field>
      <Field label="Promo Code"><input type="text" value={content.code || ''} onChange={e => upd('code', e.target.value)} style={{ ...inputStyle, fontWeight: '700', letterSpacing: 1 }} placeholder="SAVE20NOW" /></Field>
      <Field label="Subtext / Details"><textarea value={content.subtext || ''} onChange={e => upd('subtext', e.target.value)} rows={2} style={textareaStyle} placeholder="Use this code at checkout…" /></Field>
      <ButtonSection labelField="ctaLabel" urlField="ctaUrl" colorField="ctaBgColor" content={content} onUpdate={upd} />
      <SectionDivider label="Appearance & Borders" />
      <ColorField label="Background Color" value={content.backgroundColor || content.bgColor || '#f8fafc'} onChange={v => upd('backgroundColor', v)} />
      <ColorField label="Border Color" value={content.borderColor || '#3b82f6'} onChange={v => upd('borderColor', v)} />
      <Field label="Border Style">
        <select value={content.borderStyle || 'dashed'} onChange={e => upd('borderStyle', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="dashed">Dashed Coupon Border</option>
          <option value="solid">Solid Border</option>
          <option value="dotted">Dotted Border</option>
          <option value="double">Double Border</option>
        </select>
      </Field>
      <Field label={`Border Radius (${content.borderRadius ?? 12}px)`}>
        <input type="range" min={0} max={30} value={content.borderRadius ?? 12} onChange={e => upd('borderRadius', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
    </>);
  }

  if (type === 'countdown' || (type as string) === 'timer') {
    return (<>
      <SectionDivider label="Countdown Timer Settings" />
      <Field label="Title / Header"><input type="text" value={content.title || ''} onChange={e => upd('title', e.target.value)} style={inputStyle} placeholder="Sale Ends In:" /></Field>
      <ColorField label="Title Color" value={content.titleColor || '#0f172a'} onChange={v => upd('titleColor', v)} />
      <Field label="Target Date & Time">
        <input type="datetime-local" value={content.targetDate || ''} onChange={e => upd('targetDate', e.target.value)} style={inputStyle} />
      </Field>
      <Field label="Expired Fallback Text"><input type="text" value={content.expiredMessage || ''} onChange={e => upd('expiredMessage', e.target.value)} style={inputStyle} placeholder="Offer has expired!" /></Field>
      <SectionDivider label="Timer Digit Box Style" />
      <ColorField label="Digit Box Background" value={content.boxBgColor || '#0f172a'} onChange={v => upd('boxBgColor', v)} />
      <ColorField label="Digit Text Color" value={content.digitColor || '#ffffff'} onChange={v => upd('digitColor', v)} />
      <ColorField label="Label Color" value={content.labelColor || '#64748b'} onChange={v => upd('labelColor', v)} />
      <ButtonSection labelField="ctaLabel" urlField="ctaUrl" colorField="ctaBgColor" content={content} onUpdate={upd} />
      <SectionDivider label="Container" />
      <ColorField label="Background Color" value={content.bgColor || '#ffffff'} onChange={v => upd('bgColor', v)} />
      <AlignField value={content.align || 'center'} onChange={v => upd('align', v)} />
    </>);
  }

  if (type === 'productCard') {
    return (<>
      <SectionDivider label="Product Info" />
      <Field label="Product Image URL"><input type="text" value={content.imageUrl || content.url || ''} onChange={e => upd('imageUrl', e.target.value)} style={inputStyle} placeholder="https://…" /></Field>
      <Field label="Product Title"><input type="text" value={content.title || ''} onChange={e => upd('title', e.target.value)} style={inputStyle} placeholder="Product Name" /></Field>
      <Field label="Price"><input type="text" value={content.price || ''} onChange={e => upd('price', e.target.value)} style={inputStyle} placeholder="$49.99" /></Field>
      <Field label="Original Price (Strikethrough)"><input type="text" value={content.originalPrice || ''} onChange={e => upd('originalPrice', e.target.value)} style={inputStyle} placeholder="$79.99" /></Field>
      <Field label="Product Description"><textarea value={content.description || ''} onChange={e => upd('description', e.target.value)} rows={3} style={textareaStyle} /></Field>
      <Field label="Badge Text"><input type="text" value={content.badge || ''} onChange={e => upd('badge', e.target.value)} style={inputStyle} placeholder="BESTSELLER" /></Field>
      <ButtonSection labelField="buttonLabel" urlField="buttonUrl" colorField="buttonColor" content={content} onUpdate={upd} />
      <SectionDivider label="Appearance" />
      <ColorField label="Card Background" value={content.bgColor || '#ffffff'} onChange={v => upd('bgColor', v)} />
      <ColorField label="Border Color" value={content.borderColor || '#e2e8f0'} onChange={v => upd('borderColor', v)} />
      <Field label={`Border Radius (${content.borderRadius ?? 12}px)`}>
        <input type="range" min={0} max={30} value={content.borderRadius ?? 12} onChange={e => upd('borderRadius', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
    </>);
  }

  if (type === 'productGrid') {
    const products = content.products || content.items || [];
    return (<>
      <SectionDivider label="Grid Layout" />
      <Field label="Grid Columns">
        <select value={content.columns || 2} onChange={e => upd('columns', Number(e.target.value))} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value={1}>1 Column</option>
          <option value={2}>2 Columns</option>
          <option value={3}>3 Columns</option>
          <option value={4}>4 Columns</option>
        </select>
      </Field>
      <SectionDivider label="Products List" />
      {products.map((prod: any, i: number) => (
        <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Product #{i + 1}</span>
            <button type="button" onClick={() => { const p = [...products]; p.splice(i, 1); upd('products', p); }} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={12} /></button>
          </div>
          <input type="text" value={prod.title || ''} onChange={e => { const p = [...products]; p[i] = { ...p[i], title: e.target.value }; upd('products', p); }} style={inputStyle} placeholder="Title" />
          <input type="text" value={prod.imageUrl || ''} onChange={e => { const p = [...products]; p[i] = { ...p[i], imageUrl: e.target.value }; upd('products', p); }} style={inputStyle} placeholder="Image URL (https://…)" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <input type="text" value={prod.price || ''} onChange={e => { const p = [...products]; p[i] = { ...p[i], price: e.target.value }; upd('products', p); }} style={inputStyle} placeholder="Price ($49)" />
            <input type="text" value={prod.linkUrl || prod.url || ''} onChange={e => { const p = [...products]; p[i] = { ...p[i], linkUrl: e.target.value }; upd('products', p); }} style={inputStyle} placeholder="Link URL" />
          </div>
        </div>
      ))}
      <button type="button" onClick={() => upd('products', [...products, { title: 'New Item', imageUrl: '', price: '$29.00', linkUrl: '#' }])} style={{ padding: '6px 12px', border: '1px dashed #cbd5e1', borderRadius: 6, background: '#f8fafc', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Plus size={12} /> Add Product
      </button>
      <SectionDivider label="Colors" />
      <ColorField label="Card Background" value={content.cardBgColor || '#ffffff'} onChange={v => upd('cardBgColor', v)} />
      <ColorField label="Button Color" value={content.buttonColor || '#2563eb'} onChange={v => upd('buttonColor', v)} />
    </>);
  }

  if (type === 'menu' || (type as string) === 'nav') {
    const items = content.items || content.links || [];
    return (<>
      <SectionDivider label="Navigation Menu Items" />
      {items.map((item: any, i: number) => (
        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#f8fafc', padding: 6, borderRadius: 6, border: '1px solid #e2e8f0' }}>
          <input type="text" value={typeof item === 'string' ? item : item.label || ''} onChange={e => {
            const it = [...items];
            if (typeof item === 'string') it[i] = e.target.value;
            else it[i] = { ...it[i], label: e.target.value };
            upd('items', it);
          }} style={{ ...inputStyle, flex: 1 }} placeholder="Label" />
          <input type="text" value={typeof item === 'string' ? '#' : item.url || '#'} onChange={e => {
            const it = [...items];
            if (typeof item === 'string') it[i] = { label: item, url: e.target.value };
            else it[i] = { ...it[i], url: e.target.value };
            upd('items', it);
          }} style={{ ...inputStyle, flex: 1 }} placeholder="https://…" />
          <button type="button" onClick={() => { const it = [...items]; it.splice(i, 1); upd('items', it); }} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={13} /></button>
        </div>
      ))}
      <button type="button" onClick={() => upd('items', [...items, { label: 'New Link', url: '#' }])} style={{ padding: '6px 12px', border: '1px dashed #cbd5e1', borderRadius: 6, background: '#f8fafc', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Plus size={12} /> Add Nav Link
      </button>
      <SectionDivider label="Layout & Style" />
      <Field label="Orientation">
        <select value={content.layout || 'horizontal'} onChange={e => upd('layout', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="horizontal">Horizontal Inline Bar</option>
          <option value="vertical">Vertical Stacked Links</option>
        </select>
      </Field>
      <ColorField label="Link Text Color" value={content.color || content.textColor || '#334155'} onChange={v => upd('color', v)} />
      <Field label={`Font Size (${content.fontSize || 14}px)`}>
        <input type="range" min={11} max={24} value={content.fontSize || 14} onChange={e => upd('fontSize', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
      <AlignField value={content.align || 'center'} onChange={v => upd('align', v)} />
    </>);
  }

  if (type === 'social') {
    const items = content.items || content.links || [
      { platform: 'Facebook', url: 'https://facebook.com' },
      { platform: 'Twitter', url: 'https://twitter.com' },
      { platform: 'Instagram', url: 'https://instagram.com' },
    ];
    return (<>
      <SectionDivider label="Social Platforms" />
      {items.map((item: any, i: number) => (
        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#f8fafc', padding: 6, borderRadius: 6, border: '1px solid #e2e8f0' }}>
          <select value={item.platform || 'Facebook'} onChange={e => { const it = [...items]; it[i] = { ...it[i], platform: e.target.value }; upd('items', it); }} style={{ ...inputStyle, width: 100, cursor: 'pointer' }}>
            {['Facebook','Twitter','Instagram','LinkedIn','YouTube','GitHub','TikTok','WhatsApp','Website'].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <input type="text" value={item.url || ''} onChange={e => { const it = [...items]; it[i] = { ...it[i], url: e.target.value }; upd('items', it); }} style={{ ...inputStyle, flex: 1 }} placeholder="Profile URL" />
          <button type="button" onClick={() => { const it = [...items]; it.splice(i, 1); upd('items', it); }} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={13} /></button>
        </div>
      ))}
      <button type="button" onClick={() => upd('items', [...items, { platform: 'Website', url: '#' }])} style={{ padding: '6px 12px', border: '1px dashed #cbd5e1', borderRadius: 6, background: '#f8fafc', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Plus size={12} /> Add Platform
      </button>
      <SectionDivider label="Icon Style & Size" />
      <Field label="Icon Style">
        <select value={content.style || 'circle'} onChange={e => upd('style', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="circle">Colored Circle</option>
          <option value="outline">Monochrome Outline</option>
          <option value="filled">Filled Dark Box</option>
          <option value="flat">Flat Icon Only</option>
        </select>
      </Field>
      <Field label={`Icon Size (${content.iconSize || 24}px)`}>
        <input type="range" min={16} max={48} value={content.iconSize || 24} onChange={e => upd('iconSize', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
      <Field label={`Icon Gap (${content.gap || 12}px)`}>
        <input type="range" min={4} max={36} value={content.gap || 12} onChange={e => upd('gap', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
      <AlignField value={content.align || 'center'} onChange={v => upd('align', v)} />
    </>);
  }

  if (type === 'poll') {
    const options = content.options || [];
    return (<>
      <SectionDivider label="Poll Question" />
      <Field label="Question Text"><input type="text" value={content.question || ''} onChange={e => upd('question', e.target.value)} style={inputStyle} placeholder="What is your favorite feature?" /></Field>
      <ColorField label="Question Color" value={content.questionColor || '#0f172a'} onChange={v => upd('questionColor', v)} />
      <SectionDivider label="Poll Choices" />
      {options.map((opt: any, i: number) => (
        <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Choice #{i + 1}</span>
            <button type="button" onClick={() => { const o = [...options]; o.splice(i, 1); upd('options', o); }} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={12} /></button>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ width: 100 }}>
              <EmojiPickerField label="" value={opt.emoji || ''} onChange={v => { const o = [...options]; o[i] = { ...o[i], emoji: v }; upd('options', o); }} placeholder="👍" />
            </div>
            <input type="text" value={opt.text || ''} onChange={e => { const o = [...options]; o[i] = { ...o[i], text: e.target.value }; upd('options', o); }} style={{ ...inputStyle, flex: 1 }} placeholder="Option text…" />
          </div>
          <input type="text" value={opt.url || ''} onChange={e => { const o = [...options]; o[i] = { ...o[i], url: e.target.value }; upd('options', o); }} style={inputStyle} placeholder="Redirect URL (optional)" />
        </div>
      ))}
      <button type="button" onClick={() => upd('options', [...options, { text: 'New Choice', emoji: '✨', votes: 0, url: '#' }])} style={{ padding: '6px 12px', border: '1px dashed #cbd5e1', borderRadius: 6, background: '#f8fafc', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Plus size={12} /> Add Poll Option
      </button>
      <SectionDivider label="Colors & Appearance" />
      <ColorField label="Button Background" value={content.buttonBgColor || '#f1f5f9'} onChange={v => upd('buttonBgColor', v)} />
      <ColorField label="Button Text Color" value={content.buttonTextColor || '#0f172a'} onChange={v => upd('buttonTextColor', v)} />
      <ColorField label="Card Background" value={content.bgColor || '#ffffff'} onChange={v => upd('bgColor', v)} />
      <AlignField value={content.align || 'center'} onChange={v => upd('align', v)} />
    </>);
  }

  if (type === 'icons') {
    const iconsList = content.icons || [
      { name: 'shield' },
      { name: 'truck' },
      { name: 'gift' }
    ];
    return (<>
      <SectionDivider label="Icons Row List" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {iconsList.map((item: any, i: number) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#f8fafc', padding: 6, borderRadius: 6, border: '1px solid #e2e8f0' }}>
            <select
              value={item.name || 'star'}
              onChange={e => {
                const nextIcons = [...iconsList];
                nextIcons[i] = { ...nextIcons[i], name: e.target.value };
                upd('icons', nextIcons);
              }}
              style={{ ...inputStyle, flex: 1, cursor: 'pointer' }}
            >
              <option value="star">Star ⭐</option>
              <option value="heart">Heart ❤️</option>
              <option value="check-circle">Check Circle ✅</option>
              <option value="mail">Mail ✉️</option>
              <option value="phone">Phone 📞</option>
              <option value="gift">Gift 🎁</option>
              <option value="truck">Truck 🚚</option>
              <option value="shield">Shield 🛡️</option>
              <option value="clock">Clock ⏰</option>
              <option value="thumbs-up">Thumbs Up 👍</option>
              <option value="zap">Lightning ⚡</option>
              <option value="sparkles">Sparkles ✨</option>
              <option value="award">Award 🏆</option>
            </select>
            <input
              type="text"
              value={item.url || ''}
              onChange={e => {
                const nextIcons = [...iconsList];
                nextIcons[i] = { ...nextIcons[i], url: e.target.value };
                upd('icons', nextIcons);
              }}
              style={{ ...inputStyle, width: 100 }}
              placeholder="Link URL"
            />
            <button
              type="button"
              onClick={() => {
                const nextIcons = iconsList.filter((_: any, idx: number) => idx !== i);
                upd('icons', nextIcons);
              }}
              style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => upd('icons', [...iconsList, { name: 'star' }])}
          style={{ padding: '6px 12px', border: '1px dashed #cbd5e1', borderRadius: 6, background: '#f8fafc', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}
        >
          <Plus size={12} /> Add Icon
        </button>
      </div>
      <SectionDivider label="Icons Style" />
      <ColorField label="Icon Color" value={content.iconColor || '#2563eb'} onChange={v => upd('iconColor', v)} />
      <Field label={`Icon Size (${content.iconSize || 24}px)`}>
        <input type="range" min={16} max={48} value={content.iconSize || 24} onChange={e => upd('iconSize', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
      <AlignField value={content.align || 'center'} onChange={v => upd('align', v)} />
    </>);
  }

  if (type === 'table') {
    const headers = content.headers || ['Item', 'Quantity', 'Price'];
    const rows = content.rows || [['Standard Plan', '1', '$29.00']];

    const updateHeader = (index: number, val: string) => {
      const next = [...headers];
      next[index] = val;
      upd('headers', next);
    };

    const addColumn = () => {
      const nextHeaders = [...headers, `Header ${headers.length + 1}`];
      const nextRows = rows.map((r: any) => [...r, '']);
      upd('headers', nextHeaders);
      upd('rows', nextRows);
    };

    const removeColumn = (index: number) => {
      if (headers.length <= 1) return;
      const nextHeaders = headers.filter((_: any, i: number) => i !== index);
      const nextRows = rows.map((r: any) => r.filter((_: any, i: number) => i !== index));
      upd('headers', nextHeaders);
      upd('rows', nextRows);
    };

    const updateCell = (rowIndex: number, colIndex: number, val: string) => {
      const nextRows = rows.map((r: any, ri: number) => 
        ri === rowIndex ? r.map((c: any, ci: number) => ci === colIndex ? val : c) : r
      );
      upd('rows', nextRows);
    };

    const addRow = () => {
      const nextRows = [...rows, Array(headers.length).fill('')];
      upd('rows', nextRows);
    };

    const removeRow = (index: number) => {
      if (rows.length <= 1) return;
      const nextRows = rows.filter((_: any, i: number) => i !== index);
      upd('rows', nextRows);
    };

    return (<>
      <SectionDivider label="Table Design" />
      <ColorField label="Header Background" value={content.headerBg || '#f1f5f9'} onChange={v => upd('headerBg', v)} />
      <ColorField label="Header Text Color" value={content.headerTextColor || '#0f172a'} onChange={v => upd('headerTextColor', v)} />
      <ColorField label="Border Color" value={content.borderColor || '#cbd5e1'} onChange={v => upd('borderColor', v)} />
      <Field label="Table Options">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155', cursor: 'pointer', marginTop: 4 }}>
          <input type="checkbox" checked={content.stripedRows ?? true} onChange={e => upd('stripedRows', e.target.checked)} style={{ cursor: 'pointer' }} />
          <span>Striped Rows (alternate backgrounds)</span>
        </label>
      </Field>

      <SectionDivider label="Table Headers (Columns)" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {headers.map((h: string, i: number) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', width: 60 }}>Col #{i + 1}</span>
            <input type="text" value={h} onChange={e => updateHeader(i, e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            <button type="button" disabled={headers.length <= 1} onClick={() => removeColumn(i)} style={{ border: 'none', background: 'none', color: headers.length <= 1 ? '#cbd5e1' : '#ef4444', cursor: headers.length <= 1 ? 'not-allowed' : 'pointer' }}><Trash2 size={13} /></button>
          </div>
        ))}
        <button type="button" onClick={addColumn} style={{ padding: '6px 12px', border: '1px dashed #cbd5e1', borderRadius: 6, background: '#f8fafc', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content', marginTop: 4 }}>
          <Plus size={12} /> Add Column
        </button>
      </div>

      <SectionDivider label="Table Rows & Cells" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map((row: string[], ri: number) => (
          <div key={ri} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Row #{ri + 1}</span>
              <button type="button" disabled={rows.length <= 1} onClick={() => removeRow(ri)} style={{ border: 'none', background: 'none', color: rows.length <= 1 ? '#cbd5e1' : '#ef4444', cursor: rows.length <= 1 ? 'not-allowed' : 'pointer' }}><Trash2 size={12} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(headers.length, 3)}, 1fr)`, gap: 6 }}>
              {row.map((cell: string, ci: number) => (
                <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>{headers[ci] || `Col ${ci+1}`}</span>
                  <input type="text" value={cell} onChange={e => updateCell(ri, ci, e.target.value)} style={inputStyle} />
                </div>
              ))}
            </div>
            {row.length > 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4, borderTop: '1px dashed #e2e8f0', paddingTop: 6 }}>
                {row.slice(3).map((cell: string, ci: number) => {
                  const actualIdx = ci + 3;
                  return (
                    <div key={actualIdx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600, width: 80 }}>{headers[actualIdx] || `Col ${actualIdx+1}`}:</span>
                      <input type="text" value={cell} onChange={e => updateCell(ri, actualIdx, e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        <button type="button" onClick={addRow} style={{ padding: '6px 12px', border: '1px dashed #cbd5e1', borderRadius: 6, background: '#f8fafc', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
          <Plus size={12} /> Add Row
        </button>
      </div>
    </>);
  }

  if (type === 'conditional') {
    return (<>
      <SectionDivider label="Conditional Visibility (IF)" />
      <Field label="JavaScript Condition Expression">
        <input type="text" value={content.condition || ''} onChange={e => upd('condition', e.target.value)} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12 }} placeholder="user.plan === 'pro'" />
        <span style={{ fontSize: 10, color: '#64748b', marginTop: 2, display: 'block' }}>
          Validates dynamically during template compilation. E.g. <code>user.plan === 'pro'</code>
        </span>
      </Field>
      <Field label="True Content (If condition evaluates to TRUE)">
        <textarea value={content.ifTrueContent || ''} onChange={e => upd('ifTrueContent', e.target.value)} rows={4} style={textareaStyle} placeholder="Content for True branch..." />
      </Field>
      <Field label="False Content (If condition evaluates to FALSE)">
        <textarea value={content.ifFalseContent || ''} onChange={e => upd('ifFalseContent', e.target.value)} rows={4} style={textareaStyle} placeholder="Content for False branch..." />
      </Field>
    </>);
  }

  if (type === 'rating') {
    return (<>
      <SectionDivider label="Star Rating" />
      <Field label={`Rating Stars (${content.rating || 5}/5)`}>
        <input type="range" min={1} max={5} step={0.5} value={content.rating || 5} onChange={e => upd('rating', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
      <ColorField label="Star Color" value={content.starColor || '#f59e0b'} onChange={v => upd('starColor', v)} />
      <Field label="Headline"><input type="text" value={content.title || ''} onChange={e => upd('title', e.target.value)} style={inputStyle} placeholder="Rated 4.9/5 by over 10,000 users" /></Field>
      <AlignField value={content.align || 'center'} onChange={v => upd('align', v)} />
    </>);
  }

  if (type === 'qrCode') {
    return (<>
      <SectionDivider label="QR Code Settings" />
      <Field label="QR Code Target URL / Value">
        <input type="text" value={content.value || ''} onChange={e => upd('value', e.target.value)} style={inputStyle} placeholder="https://example.com/promo" />
      </Field>
      <Field label={`Size (${content.size || 140}px)`}>
        <input type="range" min={60} max={300} step={10} value={content.size || 140} onChange={e => upd('size', Number(e.target.value))} style={{ width: '100%' }} />
      </Field>
      <Field label="Caption Text"><input type="text" value={content.caption || ''} onChange={e => upd('caption', e.target.value)} style={inputStyle} placeholder="Scan QR code to open" /></Field>
      <AlignField value={content.align || 'center'} onChange={v => upd('align', v)} />
    </>);
  }

  // ── Generic fallback ──────────────────────────────────────────────────────
  return (<>
    <SectionDivider label="Content" />
    {'text' in content && <Field label="Text"><textarea value={content.text || ''} onChange={e => upd('text', e.target.value)} rows={3} style={textareaStyle} /></Field>}
    {'title' in content && <Field label="Title"><input type="text" value={content.title || ''} onChange={e => upd('title', e.target.value)} style={inputStyle} /></Field>}
    {'description' in content && <Field label="Description"><textarea value={content.description || ''} onChange={e => upd('description', e.target.value)} rows={3} style={textareaStyle} /></Field>}
    {'label' in content && <Field label="Label"><input type="text" value={content.label || ''} onChange={e => upd('label', e.target.value)} style={inputStyle} /></Field>}
    {'url' in content && <Field label="URL"><input type="text" value={content.url || ''} onChange={e => upd('url', e.target.value)} style={inputStyle} /></Field>}
    {'ctaLabel' in content && <>
      <Field label="CTA Label"><input type="text" value={content.ctaLabel || ''} onChange={e => upd('ctaLabel', e.target.value)} style={inputStyle} /></Field>
      <Field label="CTA URL"><input type="text" value={content.ctaUrl || ''} onChange={e => upd('ctaUrl', e.target.value)} style={inputStyle} /></Field>
    </>}
    {'buttonLabel' in content && <>
      <Field label="Button Label"><input type="text" value={content.buttonLabel || ''} onChange={e => upd('buttonLabel', e.target.value)} style={inputStyle} /></Field>
      <Field label="Button URL"><input type="text" value={content.buttonUrl || ''} onChange={e => upd('buttonUrl', e.target.value)} style={inputStyle} /></Field>
    </>}
    {'color' in content && <ColorField label="Text Color" value={content.color} onChange={v => upd('color', v)} />}
    {'bgColor' in content && <ColorField label="Background Color" value={content.bgColor} onChange={v => upd('bgColor', v)} />}
    {'align' in content && <AlignField value={content.align} onChange={v => upd('align', v)} />}
    <SpacingSection content={content} onUpdate={upd} />
  </>);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const BlockPropertyInspector: React.FC<BlockPropertyInspectorProps> = ({
  block,
  onChange,
  onToggleLock,
}) => {
  const content = (block.content || {}) as any;
  const isLocked = Boolean(block.isLocked);

  const handleUpdate = (field: string, value: any) => {
    if (isLocked) return;
    onChange({ ...content, [field]: value });
  };

  const blockLabel = block.type
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s: string) => s.toUpperCase())
    .trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 18px', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{blockLabel}</h4>
            {isLocked && <span style={{ fontSize: 10, fontWeight: 700, background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: 4 }}>LOCKED</span>}
          </div>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>ID: {block.id.slice(0, 20)}…</span>
        </div>
        {onToggleLock && (
          <button type="button" onClick={onToggleLock} title={isLocked ? 'Unlock block' : 'Lock block'}
            style={{ border: '1px solid #cbd5e1', background: isLocked ? '#fef3c7' : '#ffffff', color: isLocked ? '#d97706' : '#64748b', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            {isLocked ? <Lock size={13} /> : <Unlock size={13} />}
            <span>{isLocked ? 'Unlock' : 'Lock'}</span>
          </button>
        )}
      </div>

      {/* Locked Notice */}
      {isLocked && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', color: '#92400e', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lock size={14} style={{ flexShrink: 0 }} />
          <span>Block is locked. Click <strong>Unlock</strong> to edit.</span>
        </div>
      )}

      {/* All properties — unified scrollable panel */}
      <fieldset disabled={isLocked} style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        {renderBlockFields(block, content, handleUpdate)}
      </fieldset>
    </div>
  );
};
