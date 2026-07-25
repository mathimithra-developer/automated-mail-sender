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
  Smile,
  ShieldAlert,
  ListOrdered,
  ListCheck,
  Award,
  DollarSign,
  UserCheck,
  LayoutTemplate,
  Megaphone,
  CreditCard,
  CheckCircle,
  FileCode,
  Tag,
  Sparkles,
} from 'lucide-react';

interface BlockPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (type: BuilderBlock['type']) => void;
}

export interface BlockPickerCategoryItem {
  type: BuilderBlock['type'];
  label: string;
  category: 'Basic Content' | 'Cards & Callouts' | 'Lists & Timelines' | 'Commerce & Pricing' | 'Footers & Headers' | 'Advanced';
  icon: React.ReactNode;
}

export const ALL_BUILDER_BLOCKS: BlockPickerCategoryItem[] = [
  // Basic Content
  { type: 'heading', label: 'Heading', category: 'Basic Content', icon: <Heading1 size={16} /> },
  { type: 'text', label: 'Text', category: 'Basic Content', icon: <AlignLeft size={16} /> },
  { type: 'paragraph', label: 'Paragraph', category: 'Basic Content', icon: <AlignLeft size={16} /> },
  { type: 'greeting', label: 'Greeting Header', category: 'Basic Content', icon: <Smile size={16} /> },
  { type: 'logo', label: 'Logo Header', category: 'Basic Content', icon: <Award size={16} /> },
  { type: 'button', label: 'CTA Button', category: 'Basic Content', icon: <RectangleHorizontal size={16} /> },
  { type: 'dualButton', label: 'Dual Buttons', category: 'Basic Content', icon: <RectangleHorizontal size={16} /> },
  { type: 'image', label: 'Image', category: 'Basic Content', icon: <ImageIcon size={16} /> },
  { type: 'heroBanner', label: 'Hero Banner', category: 'Basic Content', icon: <LayoutTemplate size={16} /> },
  { type: 'divider', label: 'Divider', category: 'Basic Content', icon: <Minus size={16} /> },
  { type: 'spacer', label: 'Spacer', category: 'Basic Content', icon: <MoveVertical size={16} /> },
  { type: 'emojiRow', label: 'Emoji', category: 'Basic Content', icon: <Smile size={16} /> },

  // Cards & Callouts
  { type: 'callout', label: 'Callout Card', category: 'Cards & Callouts', icon: <Megaphone size={16} /> },
  { type: 'infoCard', label: 'Info Card', category: 'Cards & Callouts', icon: <Sparkles size={16} /> },
  { type: 'featureCard', label: 'Feature Card', category: 'Cards & Callouts', icon: <Package size={16} /> },
  { type: 'multiFeature', label: 'Multi Features', category: 'Cards & Callouts', icon: <Grid2x2 size={16} /> },
  { type: 'buttonCard', label: 'Button Card', category: 'Cards & Callouts', icon: <RectangleHorizontal size={16} /> },
  { type: 'highlightBox', label: 'Highlight Box', category: 'Cards & Callouts', icon: <Sparkles size={16} /> },
  { type: 'container', label: 'Container Box', category: 'Cards & Callouts', icon: <Package size={16} /> },
  { type: 'alertBox', label: 'Alert Box', category: 'Cards & Callouts', icon: <ShieldAlert size={16} /> },

  // Lists & Timelines
  { type: 'benefitsList', label: 'Benefits List', category: 'Lists & Timelines', icon: <CheckCircle size={16} /> },
  { type: 'bulletList', label: 'Bullet List', category: 'Lists & Timelines', icon: <ListOrdered size={16} /> },
  { type: 'numberedSteps', label: 'Numbered Steps', category: 'Lists & Timelines', icon: <ListOrdered size={16} /> },
  { type: 'timeline', label: 'Timeline', category: 'Lists & Timelines', icon: <ListCheck size={16} /> },
  { type: 'checklist', label: 'Checklist', category: 'Lists & Timelines', icon: <ListCheck size={16} /> },
  { type: 'quote', label: 'Quote / Review', category: 'Lists & Timelines', icon: <Smile size={16} /> },
  { type: 'faqAccordion', label: 'FAQ Accordion', category: 'Lists & Timelines', icon: <BarChart2 size={16} /> },

  // Commerce & Pricing
  { type: 'pricingCard', label: 'Pricing Card', category: 'Commerce & Pricing', icon: <CreditCard size={16} /> },
  { type: 'productCard', label: 'Product Card', category: 'Commerce & Pricing', icon: <Package size={16} /> },
  { type: 'productGrid', label: 'Product Grid', category: 'Commerce & Pricing', icon: <Grid2x2 size={16} /> },
  { type: 'coupon', label: 'Promo Coupon', category: 'Commerce & Pricing', icon: <Ticket size={16} /> },
  { type: 'countdown', label: 'Timer Countdown', category: 'Commerce & Pricing', icon: <Timer size={16} /> },
  { type: 'statistics', label: 'Statistics Grid', category: 'Commerce & Pricing', icon: <DollarSign size={16} /> },
  { type: 'bannerCta', label: 'Banner CTA', category: 'Commerce & Pricing', icon: <Megaphone size={16} /> },

  // Footers & Headers
  { type: 'newsletterHeader', label: 'Newsletter Header', category: 'Footers & Headers', icon: <LayoutTemplate size={16} /> },
  { type: 'signature', label: 'Personal Signature', category: 'Footers & Headers', icon: <UserCheck size={16} /> },
  { type: 'footer', label: 'Email Footer', category: 'Footers & Headers', icon: <LayoutTemplate size={16} /> },
  { type: 'social', label: 'Social Icons', category: 'Footers & Headers', icon: <Share2 size={16} /> },
  { type: 'menu', label: 'Nav Menu', category: 'Footers & Headers', icon: <Menu size={16} /> },

  // Advanced
  { type: 'variable', label: 'Variable Pill', category: 'Advanced', icon: <Tag size={16} /> },
  { type: 'iconText', label: 'Icon + Text', category: 'Advanced', icon: <Star size={16} /> },
  { type: 'badge', label: 'Pill Badge', category: 'Advanced', icon: <Award size={16} /> },
  { type: 'code', label: 'Code Box', category: 'Advanced', icon: <FileCode size={16} /> },
  { type: 'html', label: 'Custom HTML', category: 'Advanced', icon: <Code2 size={16} /> },
  { type: 'table', label: 'Data Table', category: 'Advanced', icon: <Table size={16} /> },
  { type: 'icons', label: 'Icon Row', category: 'Advanced', icon: <Star size={16} /> },
  { type: 'rating', label: 'Star Rating', category: 'Advanced', icon: <StarHalf size={16} /> },
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

  const filtered = ALL_BUILDER_BLOCKS.filter(
    (b) =>
      b.label.toLowerCase().includes(search.toLowerCase()) ||
      b.type.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories: BlockPickerCategoryItem['category'][] = [
    'Basic Content',
    'Cards & Callouts',
    'Lists & Timelines',
    'Commerce & Pricing',
    'Footers & Headers',
    'Advanced',
  ];

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
          borderRadius: 14,
          boxShadow: '0 20px 30px -5px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: 540,
          maxHeight: '85vh',
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
            background: '#ffffff',
          }}
        >
          <Search size={18} style={{ color: '#94a3b8' }} />
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 40+ content blocks (e.g. Hero Banner, Quote, Pricing)..."
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

        {/* Body Items list grouped by Category */}
        <div className="builder-block-picker-scroll" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: 13 }}>
              No content block matching "{search}"
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {categories.map((catName) => {
                const catItems = filtered.filter((b) => b.category === catName);
                if (catItems.length === 0) return null;

                const categoryColors: Record<string, string> = {
                  'Basic Content': '#2563eb',
                  'Cards & Callouts': '#059669',
                  'Lists & Timelines': '#d97706',
                  'Commerce & Pricing': '#9333ea',
                  'Footers & Headers': '#0891b2',
                  'Advanced': '#475569',
                };

                const accentColor = categoryColors[catName] || '#2563eb';

                return (
                  <div key={catName}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: accentColor, margin: '0 0 8px 0' }}>
                      {catName} ({catItems.length})
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {catItems.map((item, idx) => (
                        <button
                          key={`${catName}-${item.type}-${idx}`}
                          type="button"
                          onClick={() => {
                            onSelectBlock(item.type);
                            onClose();
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '9px 12px',
                            borderRadius: 8,
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                            color: '#0f172a',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = accentColor;
                            e.currentTarget.style.backgroundColor = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                          }}
                        >
                          <div style={{ width: 28, height: 28, borderRadius: 6, background: `${accentColor}15`, color: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {item.icon}
                          </div>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
