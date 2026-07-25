import React, { useState, useMemo } from 'react';
import {
  Search,
  Check,
  Megaphone,
  Shield,
  Package,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText as DocIcon,
  MousePointerClick,
  Type,
  X,
  Globe,
} from 'lucide-react';
import { WhatsAppTemplate } from '../../types';
import '../../assets/whatsapp-preview.css';

interface WhatsAppTemplateGalleryProps {
  templates: WhatsAppTemplate[];
  selectedTemplateId: string;
  onSelectTemplate: (template: WhatsAppTemplate) => void;
}

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'All', emoji: '🔍' },
  { value: 'MARKETING', label: 'Marketing', emoji: '📣' },
] as const;

type CategoryValue = typeof CATEGORY_OPTIONS[number]['value'] | 'UTILITY' | 'AUTHENTICATION';

export const WhatsAppTemplateGallery: React.FC<WhatsAppTemplateGalleryProps> = ({
  templates,
  selectedTemplateId,
  onSelectTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryValue>('ALL');
  const [mediaOnly, setMediaOnly] = useState(false);
  const [buttonsOnly, setButtonsOnly] = useState(false);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const name = (t.name || '').toLowerCase();
      const cat = (t.category || '').toUpperCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch = !query ||
        name.includes(query) ||
        cat.includes(query) ||
        (t.language || '').toLowerCase().includes(query);

      const matchesCat = categoryFilter === 'ALL' || cat === categoryFilter;

      const headerComp = t.components.find((c) => c.type === 'HEADER');
      const hasMedia = headerComp && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerComp.format || '');
      const matchesMedia = !mediaOnly || hasMedia;

      const buttonsComp = t.components.find((c) => c.type === 'BUTTONS');
      const hasButtons = buttonsComp && Array.isArray(buttonsComp.buttons) && buttonsComp.buttons.length > 0;
      const matchesButtons = !buttonsOnly || hasButtons;

      return matchesSearch && matchesCat && matchesMedia && matchesButtons;
    });
  }, [templates, searchQuery, categoryFilter, mediaOnly, buttonsOnly]);

  // Filter summary text
  const activeFilters: string[] = [];
  if (categoryFilter !== 'ALL') {
    activeFilters.push(CATEGORY_OPTIONS.find(c => c.value === categoryFilter)?.label || categoryFilter);
  }
  if (mediaOnly) activeFilters.push('Has Media');
  if (buttonsOnly) activeFilters.push('Has Buttons');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      {/* ── Premium Search Bar ── */}
      <div className="wa-search-wrapper">
        <Search className="wa-search-icon" />
        <input
          type="text"
          className="wa-search-input"
          placeholder="Search templates by name, keyword, language..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="wa-search-clear" onClick={() => setSearchQuery('')}>
            <X style={{ width: 12, height: 12 }} />
          </button>
        )}
      </div>

      {/* ── Category Pill Filters ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <div className="wa-filter-row">
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`wa-filter-chip ${categoryFilter === opt.value ? 'active' : ''}`}
              onClick={() => setCategoryFilter(opt.value)}
            >
              <span>{opt.emoji}</span> {opt.label}
              {opt.value === 'ALL' && (
                <span style={{ opacity: 0.7, fontWeight: 500, marginLeft: 2 }}>({templates.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Feature Toggle Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`wa-filter-chip ${mediaOnly ? 'active' : ''}`}
            onClick={() => setMediaOnly(!mediaOnly)}
          >
            <span>🖼</span> Has Media
          </button>
          <button
            type="button"
            className={`wa-filter-chip ${buttonsOnly ? 'active' : ''}`}
            onClick={() => setButtonsOnly(!buttonsOnly)}
          >
            <span>🔘</span> Has Buttons
          </button>
        </div>

        {/* Filter Summary */}
        <div className="wa-filter-summary">
          <span className="wa-filter-count-total">{templates.length} Templates</span>
          {filteredTemplates.length !== templates.length && (
            <>
              <span style={{ color: '#cbd5e1' }}>·</span>
              <span className="wa-filter-count-result">{filteredTemplates.length} Results</span>
            </>
          )}
          {activeFilters.map((f) => (
            <span key={f} className="wa-filter-active-label">{f}</span>
          ))}
        </div>
      </div>

      {/* ── Template Cards List ── */}
      <div
        className="wa-cards-scroll"
        style={{ flex: 1, maxHeight: 'calc(100vh - 420px)', minHeight: 250 }}
      >
        {filteredTemplates.length === 0 ? (
          <div className="wa-empty-state">
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>No templates found</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>
              Try different keywords or remove filters
            </p>
          </div>
        ) : (
          filteredTemplates.map((t, idx) => {
            const idVal = t._id || t.id || t.name;
            const isSelected = idVal === selectedTemplateId;

            const category = (t.category || 'UTILITY').toUpperCase();
            const headerComp = t.components.find((c) => c.type === 'HEADER');
            const bodyComp = t.components.find((c) => c.type === 'BODY');
            const buttonsComp = t.components.find((c) => c.type === 'BUTTONS');
            const footerComp = t.components.find((c) => c.type === 'FOOTER');

            const mediaFormat = headerComp?.format || '';
            const hasMedia = ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(mediaFormat);
            const buttonCount = buttonsComp?.buttons?.length || 0;
            const hasText = !!headerComp?.text || !!bodyComp?.text;

            return (
              <div
                key={`${idVal}-${idx}`}
                className={`wa-template-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectTemplate(t)}
              >
                {/* Top Row: Badges + Selected Check */}
                <div className="wa-card-top-row">
                  <div className="wa-card-badges">
                    {category === 'MARKETING' && (
                      <span className="wa-badge wa-badge-marketing">📣 Marketing</span>
                    )}
                    {category === 'UTILITY' && (
                      <span className="wa-badge wa-badge-utility">📦 Utility</span>
                    )}
                    {category === 'AUTHENTICATION' && (
                      <span className="wa-badge wa-badge-auth">🛡 Auth</span>
                    )}
                    <span className="wa-badge wa-badge-approved">✅ Approved</span>
                  </div>

                  {isSelected && (
                    <div className="wa-card-check">
                      <Check style={{ width: 13, height: 13 }} />
                    </div>
                  )}
                </div>

                {/* Template Name */}
                <h4 className="wa-card-name">{t.name}</h4>

                {/* Body Preview (2-line clamp) */}
                {bodyComp?.text && (
                  <p className="wa-card-preview">{bodyComp.text}</p>
                )}

                {/* Component Type Tags + Language */}
                <div className="wa-card-tags-row">
                  {hasText && !hasMedia && (
                    <span className="wa-tag-chip text">
                      <Type style={{ width: 9, height: 9 }} /> TEXT
                    </span>
                  )}
                  {mediaFormat === 'IMAGE' && (
                    <span className="wa-tag-chip image">
                      <ImageIcon style={{ width: 9, height: 9 }} /> IMAGE
                    </span>
                  )}
                  {mediaFormat === 'VIDEO' && (
                    <span className="wa-tag-chip video">
                      <VideoIcon style={{ width: 9, height: 9 }} /> VIDEO
                    </span>
                  )}
                  {mediaFormat === 'DOCUMENT' && (
                    <span className="wa-tag-chip document">
                      <DocIcon style={{ width: 9, height: 9 }} /> DOC
                    </span>
                  )}
                  {buttonCount > 0 && (
                    <span className="wa-tag-chip button">
                      <MousePointerClick style={{ width: 9, height: 9 }} /> {buttonCount} BTN{buttonCount > 1 ? 'S' : ''}
                    </span>
                  )}

                  {t.language && (
                    <span className="wa-card-language">
                      <Globe style={{ width: 9, height: 9 }} /> {t.language}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
