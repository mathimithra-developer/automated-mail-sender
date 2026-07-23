import React from 'react';
import { PollBlockData, PollOptionItem } from '../types';
import { AlignLeft, AlignCenter, AlignRight, Plus, Trash2 } from 'lucide-react';

interface PollPropertiesProps {
  block: PollBlockData;
  onChange: (updatedContent: PollBlockData['content']) => void;
}

export const PollProperties: React.FC<PollPropertiesProps> = ({
  block,
  onChange,
}) => {
  const {
    question = 'How satisfied are you with our service?',
    align = 'center',
    options = [
      { emoji: '😍', label: 'Very Satisfied', url: '#' },
      { emoji: '🙂', label: 'Satisfied', url: '#' },
    ],
  } = block.content;

  const updateProp = <K extends keyof PollBlockData['content']>(
    key: K,
    value: PollBlockData['content'][K]
  ) => {
    onChange({
      ...block.content,
      [key]: value,
    });
  };

  const handleAddOption = () => {
    const newOptions: PollOptionItem[] = [
      ...options,
      { emoji: '👍', label: 'New Option', url: '#' },
    ];
    updateProp('options', newOptions);
  };

  const handleRemoveOption = (index: number) => {
    updateProp(
      'options',
      options.filter((_, i) => i !== index)
    );
  };

  const handleUpdateOption = (
    index: number,
    field: keyof PollOptionItem,
    value: string
  ) => {
    const newOptions = options.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateProp('options', newOptions);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
          Poll Properties
        </h4>
      </div>

      {/* Question */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Poll Question</label>
        <input
          type="text"
          value={question}
          onChange={(e) => updateProp('question', e.target.value)}
          placeholder="How satisfied are you?"
          style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, borderRadius: 6, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      </div>

      {/* Alignment */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Alignment</label>
        <div style={{ display: 'flex', height: 36, background: '#f1f5f9', borderRadius: 6, padding: 2, gap: 2 }}>
          {(['left', 'center', 'right'] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => updateProp('align', dir)}
              style={{
                flex: 1,
                border: 'none',
                borderRadius: 4,
                background: align === dir ? '#ffffff' : 'transparent',
                color: align === dir ? '#2563eb' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {dir === 'left' && <AlignLeft size={16} />}
              {dir === 'center' && <AlignCenter size={16} />}
              {dir === 'right' && <AlignRight size={16} />}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Options List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
            Poll Options ({options.length})
          </label>
          <button
            type="button"
            onClick={handleAddOption}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 700,
              color: '#2563eb',
              background: 'rgba(37, 99, 235, 0.08)',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            <Plus size={13} /> Add Option
          </button>
        </div>

        {options.map((opt, idx) => (
          <div
            key={idx}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <input
                type="text"
                value={opt.emoji}
                onChange={(e) => handleUpdateOption(idx, 'emoji', e.target.value)}
                placeholder="Emoji"
                style={{ width: 44, height: 32, padding: '0 4px', textAlign: 'center', fontSize: 16, borderRadius: 4, border: '1px solid #cbd5e1' }}
              />
              <input
                type="text"
                value={opt.label}
                onChange={(e) => handleUpdateOption(idx, 'label', e.target.value)}
                placeholder="Option Label"
                style={{ flex: 1, height: 32, padding: '0 8px', fontSize: 12, borderRadius: 4, border: '1px solid #cbd5e1' }}
              />
              <button
                type="button"
                onClick={() => handleRemoveOption(idx)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}
                title="Remove option"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <input
              type="text"
              value={opt.url}
              onChange={(e) => handleUpdateOption(idx, 'url', e.target.value)}
              placeholder="Vote Link URL (optional)"
              style={{ width: '100%', height: 30, padding: '0 8px', fontSize: 11, borderRadius: 4, border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
