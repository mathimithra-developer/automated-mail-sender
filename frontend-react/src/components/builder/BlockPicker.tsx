import React, { useState, useEffect, useRef } from 'react';
import { BuilderBlock } from './types';
import {
  Heading1,
  AlignLeft,
  RectangleHorizontal,
  Image as ImageIcon,
  Minus,
  MoveVertical,
  PlayCircle,
  Share2,
  Code2,
  Menu,
  Table,
  Star,
  StarHalf,
  Package,
  Grid2x2,
  Ticket,
  Timer,
  QrCode,
  BarChart2,
  GitMerge,
  Search,
  X,
} from 'lucide-react';

interface BlockPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (type: BuilderBlock['type']) => void;
}

interface BlockPickerItem {
  type: BuilderBlock['type'];
  label: string;
  category: 'Content' | 'Advanced';
  icon: React.ReactNode;
}

const ALL_BLOCKS: BlockPickerItem[] = [
  { type: 'heading', label: 'Heading', category: 'Content', icon: <Heading1 size={16} /> },
  { type: 'paragraph', label: 'Paragraph', category: 'Content', icon: <AlignLeft size={16} /> },
  { type: 'button', label: 'Button', category: 'Content', icon: <RectangleHorizontal size={16} /> },
  { type: 'image', label: 'Image', category: 'Content', icon: <ImageIcon size={16} /> },
  { type: 'divider', label: 'Divider', category: 'Content', icon: <Minus size={16} /> },
  { type: 'spacer', label: 'Spacer', category: 'Content', icon: <MoveVertical size={16} /> },
  { type: 'video', label: 'Video', category: 'Content', icon: <PlayCircle size={16} /> },
  { type: 'social', label: 'Social Icons', category: 'Content', icon: <Share2 size={16} /> },
  { type: 'html', label: 'Custom HTML', category: 'Content', icon: <Code2 size={16} /> },
  { type: 'menu', label: 'Nav Menu', category: 'Content', icon: <Menu size={16} /> },
  { type: 'table', label: 'Data Table', category: 'Advanced', icon: <Table size={16} /> },
  { type: 'icons', label: 'Icon List', category: 'Advanced', icon: <Star size={16} /> },
  { type: 'rating', label: 'Star Rating', category: 'Advanced', icon: <StarHalf size={16} /> },
  { type: 'productCard', label: 'Product Card', category: 'Advanced', icon: <Package size={16} /> },
  { type: 'productGrid', label: 'Product Grid', category: 'Advanced', icon: <Grid2x2 size={16} /> },
  { type: 'coupon', label: 'Promo Coupon', category: 'Advanced', icon: <Ticket size={16} /> },
  { type: 'countdown', label: 'Timer Countdown', category: 'Advanced', icon: <Timer size={16} /> },
  { type: 'qrCode', label: 'QR Code', category: 'Advanced', icon: <QrCode size={16} /> },
  { type: 'poll', label: 'Interactive Poll', category: 'Advanced', icon: <BarChart2 size={16} /> },
  { type: 'conditional', label: 'Conditional IF', category: 'Advanced', icon: <GitMerge size={16} /> },
];

export const BlockPicker: React.FC<BlockPickerProps> = ({
  isOpen,
  onClose,
  onSelectBlock,
}) => {
  const [search, setSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = ALL_BLOCKS.filter(
    (b) =>
      b.label.toLowerCase().includes(search.toLowerCase()) ||
      b.type.toLowerCase().includes(search.toLowerCase())
  );

  const contentItems = filtered.filter((b) => b.category === 'Content');
  const advancedItems = filtered.filter((b) => b.category === 'Advanced');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99990,
        background: 'rgba(15, 23, 42, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          width: '100%',
          maxWidth: 480,
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Search size={18} style={{ color: '#94a3b8' }} />
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search block types (e.g. Coupon, Table, Button)..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 14,
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Items list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: 13 }}>
              No block type matching "{search}"
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {contentItems.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', margin: '0 0 8px 0' }}>
                    Content Elements
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {contentItems.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          onSelectBlock(item.type);
                          onClose();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                          color: '#0f172a',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {item.icon}
                        </div>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {advancedItems.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#8b5cf6', margin: '0 0 8px 0' }}>
                    Advanced & Commerce
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {advancedItems.map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          onSelectBlock(item.type);
                          onClose();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          background: '#f8fafc',
                          color: '#0f172a',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {item.icon}
                        </div>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
