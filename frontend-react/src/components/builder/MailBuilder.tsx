import React, { useReducer, useState, useEffect } from 'react';
import { builderReducer, initialBuilderState } from './builderReducer';
import { Section } from './Section';
import { ExportModal } from './ExportModal';
import { GlobalThemePanel } from './GlobalThemePanel';
import { AIPanel } from './AIPanel';
import { VersionHistoryPanel } from './VersionHistoryPanel';
import { SectionProperties } from './properties/SectionProperties';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

// Block Property Editors
import { HeadingProperties } from './properties/HeadingProperties';
import { ParagraphProperties } from './properties/ParagraphProperties';
import { ButtonProperties } from './properties/ButtonProperties';
import { ImageProperties } from './properties/ImageProperties';
import { DividerProperties } from './properties/DividerProperties';
import { SpacerProperties } from './properties/SpacerProperties';
import { VideoProperties } from './properties/VideoProperties';
import { SocialProperties } from './properties/SocialProperties';
import { HtmlProperties } from './properties/HtmlProperties';
import { MenuProperties } from './properties/MenuProperties';
import { TableProperties } from './properties/TableProperties';
import { IconsProperties } from './properties/IconsProperties';
import { RatingProperties } from './properties/RatingProperties';
import { ProductCardProperties } from './properties/ProductCardProperties';
import { ProductGridProperties } from './properties/ProductGridProperties';
import { CouponProperties } from './properties/CouponProperties';
import { CountdownProperties } from './properties/CountdownProperties';
import { QrCodeProperties } from './properties/QrCodeProperties';
import { PollProperties } from './properties/PollProperties';
import { ConditionalProperties } from './properties/ConditionalProperties';

// Lucide Icons
import {
  Undo2,
  Redo2,
  Save,
  RotateCcw,
  Code2,
  Download,
  Upload,
  Monitor,
  Smartphone,
  Layout,
  Type,
  Palette,
  Sparkles,
  History,
  Columns,
  Columns2,
  Columns3,
  Heading1,
  AlignLeft,
  RectangleHorizontal,
  Image as ImageIcon,
  Minus,
  MoveVertical,
  PlayCircle,
  Share2,
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
} from 'lucide-react';

interface MailBuilderProps {
  initialTemplateId?: string;
}

export const MailBuilder: React.FC<MailBuilderProps> = ({ initialTemplateId }) => {
  const { showToast } = useToast();
  const [state, dispatch] = useReducer(builderReducer, initialBuilderState);
  const { past, present, future, selectedId, hasUnsavedChanges, saveStatus } = state;

  // Local UI Modes
  const [activeRightTab, setActiveRightTab] = useState<'properties' | 'theme' | 'ai' | 'history'>('properties');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [exportModal, setExportModal] = useState<{ isOpen: boolean; mode: 'html' | 'json' | 'import' }>({
    isOpen: false,
    mode: 'html',
  });
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const [templateId, setTemplateId] = useState<string | undefined>(initialTemplateId);

  // Load existing template if ID passed
  useEffect(() => {
    if (!initialTemplateId) return;
    const fetchTemplate = async () => {
      try {
        const res = await api.get(`/api/templates/${initialTemplateId}`);
        if (res.data && res.data.jsonData) {
          dispatch({ type: 'LOAD_TEMPLATE', template: res.data.jsonData });
          setTemplateId(initialTemplateId);
        }
      } catch (err: any) {
        showToast('Error', 'Failed to load template data', 'error');
      }
    };
    fetchTemplate();
  }, [initialTemplateId]);

  // Debounced Autosave (1.5s)
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('ms_builder_draft', JSON.stringify(present));
        localStorage.setItem('ms_builder_name', present.name);
        dispatch({ type: 'MARK_AUTOSAVED' });
      } catch (e) {
        // Fallback in-memory
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [present, hasUnsavedChanges]);

  // Save to Backend API
  const handleSaveToServer = async () => {
    try {
      const payload = {
        name: present.name,
        subject: present.metadata?.subject || present.name,
        htmlContent: '',
        jsonData: present,
      };

      if (templateId) {
        await api.patch(`/api/templates/${templateId}`, payload);
        showToast('Saved', 'Template updated successfully', 'success');
      } else {
        const res = await api.post('/api/templates', payload);
        if (res.data?._id) {
          setTemplateId(res.data._id);
        }
        showToast('Saved', 'New template saved to library', 'success');
      }
      dispatch({ type: 'MARK_SAVED' });
    } catch (err: any) {
      showToast('Save Error', err.message || 'Failed to save template', 'error');
    }
  };

  // Find currently selected block/section/column
  let selectedBlock: any = null;
  let selectedSection: any = null;
  let selectedColumnSectionId = '';

  if (selectedId?.type === 'block') {
    for (const sec of present.sections) {
      for (const col of sec.columns) {
        const found = col.components.find((c) => c.id === selectedId.id);
        if (found) {
          selectedBlock = found;
          break;
        }
      }
    }
  } else if (selectedId?.type === 'section') {
    selectedSection = present.sections.find((s) => s.id === selectedId.id);
  } else if (selectedId?.type === 'column') {
    for (const sec of present.sections) {
      const foundCol = sec.columns.find((c) => c.id === selectedId.id);
      if (foundCol) {
        selectedSection = sec;
        selectedColumnSectionId = sec.id;
        break;
      }
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 90px)',
        background: '#f8fafc',
        fontFamily: present.globalTheme.fontFamily || 'Inter, sans-serif',
        overflow: 'hidden',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}
    >
      {/* ── 1. Top Builder Header Toolbar ────────────────────────────── */}
      <header
        style={{
          height: 54,
          padding: '0 20px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        {/* Template Title & Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="text"
            value={present.name}
            onChange={(e) => dispatch({ type: 'SET_NAME', name: e.target.value })}
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#0f172a',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              padding: '4px 6px',
              borderRadius: 4,
            }}
          />
          {/* Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600 }}>
            {saveStatus === 'saved' && (
              <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} /> Saved
              </span>
            )}
            {saveStatus === 'unsaved' && (
              <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706' }} /> Unsaved changes
              </span>
            )}
            {saveStatus === 'autosaved' && (
              <span style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6' }} /> Draft Autosaved
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Preview Device Toggle */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 6, padding: 2 }}>
            <button
              type="button"
              onClick={() => setPreviewMode('desktop')}
              style={{
                border: 'none',
                background: previewMode === 'desktop' ? '#ffffff' : 'transparent',
                color: previewMode === 'desktop' ? '#2563eb' : '#64748b',
                padding: '5px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Desktop preview"
            >
              <Monitor size={15} />
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('mobile')}
              style={{
                border: 'none',
                background: previewMode === 'mobile' ? '#ffffff' : 'transparent',
                color: previewMode === 'mobile' ? '#2563eb' : '#64748b',
                padding: '5px 10px',
                borderRadius: 4,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Mobile preview"
            >
              <Smartphone size={15} />
            </button>
          </div>

          <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />

          {/* Undo / Redo */}
          <button
            type="button"
            disabled={past.length === 0}
            onClick={() => dispatch({ type: 'UNDO' })}
            style={{
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: past.length === 0 ? '#cbd5e1' : '#0f172a',
              padding: '6px 10px',
              borderRadius: 6,
              cursor: past.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
            }}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={14} /> Undo
          </button>
          <button
            type="button"
            disabled={future.length === 0}
            onClick={() => dispatch({ type: 'REDO' })}
            style={{
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: future.length === 0 ? '#cbd5e1' : '#0f172a',
              padding: '6px 10px',
              borderRadius: 6,
              cursor: future.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
            }}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={14} /> Redo
          </button>

          <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />

          {/* Export Code Options */}
          <button
            type="button"
            onClick={() => setExportModal({ isOpen: true, mode: 'html' })}
            style={{
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              padding: '6px 10px',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Code2 size={14} /> HTML
          </button>

          <button
            type="button"
            onClick={() => setExportModal({ isOpen: true, mode: 'json' })}
            style={{
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              padding: '6px 10px',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Download size={14} /> JSON
          </button>

          <button
            type="button"
            onClick={() => setExportModal({ isOpen: true, mode: 'import' })}
            style={{
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              padding: '6px 10px',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Upload size={14} /> Import
          </button>

          <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />

          {/* Save & Discard */}
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={() => setIsDiscardConfirmOpen(true)}
              style={{
                border: '1px solid #fee2e2',
                background: '#fef2f2',
                color: '#ef4444',
                padding: '6px 10px',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <RotateCcw size={14} /> Discard
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveToServer}
            style={{
              border: 'none',
              background: '#2563eb',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 700,
              boxShadow: '0 2px 6px rgba(37,99,235,0.2)',
            }}
          >
            <Save size={15} /> Save Template
          </button>
        </div>
      </header>

      {/* ── 2. Middle Body: Catalog + Canvas + Properties ───────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* ── Left Sidebar Catalog (LAYOUT + CONTENT + ADVANCED) ── */}
        <div
          style={{
            width: 290,
            background: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}
        >
          <div style={{ padding: 16, flex: 1, overflowY: 'auto' }}>
            {/* LAYOUT SECTIONS */}
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#2563eb', margin: '0 0 10px 0' }}>
              Layout Structure
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 20 }}>
              <button
                type="button"
                onClick={() => dispatch({ type: 'ADD_SECTION', columnsCount: 1 })}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
              >
                <Columns size={16} style={{ color: '#2563eb' }} />
                <span>1 Column</span>
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'ADD_SECTION', columnsCount: 2 })}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
              >
                <Columns2 size={16} style={{ color: '#2563eb' }} />
                <span>2 Columns</span>
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'ADD_SECTION', columnsCount: 3 })}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
              >
                <Columns3 size={16} style={{ color: '#2563eb' }} />
                <span>3 Columns</span>
              </button>
            </div>

            {/* CONTENT SECTION */}
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', margin: '0 0 10px 0' }}>
              Content Blocks
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 20 }}>
              {[
                { type: 'heading', label: 'Heading', icon: <Heading1 size={15} /> },
                { type: 'paragraph', label: 'Paragraph', icon: <AlignLeft size={15} /> },
                { type: 'button', label: 'Button', icon: <RectangleHorizontal size={15} /> },
                { type: 'image', label: 'Image', icon: <ImageIcon size={15} /> },
                { type: 'divider', label: 'Divider', icon: <Minus size={15} /> },
                { type: 'spacer', label: 'Spacer', icon: <MoveVertical size={15} /> },
                { type: 'video', label: 'Video', icon: <PlayCircle size={15} /> },
                { type: 'social', label: 'Social Icons', icon: <Share2 size={15} /> },
                { type: 'html', label: 'Custom HTML', icon: <Code2 size={15} /> },
                { type: 'menu', label: 'Nav Menu', icon: <Menu size={15} /> },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    if (present.sections.length === 0) {
                      dispatch({ type: 'ADD_SECTION', columnsCount: 1 });
                    }
                    const sec = present.sections[0] || { id: 'sec_1', columns: [{ id: 'col_1' }] };
                    dispatch({
                      type: 'ADD_BLOCK',
                      sectionId: sec.id,
                      columnId: sec.columns[0]?.id || 'col_1',
                      blockType: item.type as any,
                    });
                  }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                >
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* ADVANCED SECTION */}
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8b5cf6', margin: '0 0 10px 0' }}>
              Advanced & Commerce
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                { type: 'table', label: 'Table', icon: <Table size={15} /> },
                { type: 'icons', label: 'Icons', icon: <Star size={15} /> },
                { type: 'rating', label: 'Rating', icon: <StarHalf size={15} /> },
                { type: 'productCard', label: 'Product Card', icon: <Package size={15} /> },
                { type: 'productGrid', label: 'Product Grid', icon: <Grid2x2 size={15} /> },
                { type: 'coupon', label: 'Coupon', icon: <Ticket size={15} /> },
                { type: 'countdown', label: 'Countdown', icon: <Timer size={15} /> },
                { type: 'qrCode', label: 'QR Code', icon: <QrCode size={15} /> },
                { type: 'poll', label: 'Poll', icon: <BarChart2 size={15} /> },
                { type: 'conditional', label: 'Conditional', icon: <GitMerge size={15} /> },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    if (present.sections.length === 0) {
                      dispatch({ type: 'ADD_SECTION', columnsCount: 1 });
                    }
                    const sec = present.sections[0] || { id: 'sec_1', columns: [{ id: 'col_1' }] };
                    dispatch({
                      type: 'ADD_BLOCK',
                      sectionId: sec.id,
                      columnId: sec.columns[0]?.id || 'col_1',
                      blockType: item.type as any,
                    });
                  }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                >
                  <div style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Central Email Canvas ───────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            background: present.globalTheme.backgroundColor || '#f4f4f5',
            overflowY: 'auto',
            padding: 32,
            display: 'flex',
            justifyContent: 'center',
          }}
          onClick={() => dispatch({ type: 'SELECT_ITEM', selection: null })}
        >
          <div
            style={{
              width: '100%',
              maxWidth: previewMode === 'mobile' ? 375 : 640,
              background: '#ffffff',
              borderRadius: 10,
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
              minHeight: 500,
              transition: 'max-width 0.2s ease-in-out',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            {present.sections.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '80px 20px',
                  color: '#94a3b8',
                  fontSize: 14,
                }}
              >
                Canvas is empty. Click <strong>1 Column</strong> or a component from the left sidebar to start building.
              </div>
            ) : (
              present.sections.map((sec) => (
                <Section
                  key={sec.id}
                  section={sec}
                  selectedId={selectedId}
                  onSelectSection={() => dispatch({ type: 'SELECT_ITEM', selection: { type: 'section', id: sec.id } })}
                  onSelectColumn={(colId) => dispatch({ type: 'SELECT_ITEM', selection: { type: 'column', id: colId } })}
                  onSelectBlock={(blockId) => dispatch({ type: 'SELECT_ITEM', selection: { type: 'block', id: blockId } })}
                  onUpdateBlock={(blockId, updatedContent) => dispatch({ type: 'UPDATE_BLOCK', blockId, updatedContent })}
                  onAddBlock={(sectionId, columnId, blockType) => dispatch({ type: 'ADD_BLOCK', sectionId, columnId, blockType })}
                  onMoveBlock={(blockId, direction) => dispatch({ type: 'MOVE_BLOCK', blockId, direction })}
                  onDuplicateBlock={(blockId) => dispatch({ type: 'DUPLICATE_BLOCK', blockId })}
                  onDeleteBlock={(blockId) => dispatch({ type: 'DELETE_BLOCK', blockId })}
                  onMoveSection={(direction) => dispatch({ type: 'MOVE_SECTION', sectionId: sec.id, direction })}
                  onDuplicateSection={() => dispatch({ type: 'DUPLICATE_SECTION', sectionId: sec.id })}
                  onDeleteSection={() => dispatch({ type: 'DELETE_SECTION', sectionId: sec.id })}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Right Sidebar: Multi-Tab Properties & Utilities Panel ──── */}
        <div
          style={{
            width: 320,
            background: '#ffffff',
            borderLeft: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}
        >
          {/* Right Header Navigation Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <button
              type="button"
              onClick={() => setActiveRightTab('properties')}
              style={{
                flex: 1,
                padding: '12px 6px',
                border: 'none',
                background: activeRightTab === 'properties' ? '#ffffff' : 'transparent',
                borderBottom: activeRightTab === 'properties' ? '2px solid #2563eb' : 'none',
                color: activeRightTab === 'properties' ? '#2563eb' : '#64748b',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <Type size={14} /> Properties
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('theme')}
              style={{
                flex: 1,
                padding: '12px 6px',
                border: 'none',
                background: activeRightTab === 'theme' ? '#ffffff' : 'transparent',
                borderBottom: activeRightTab === 'theme' ? '2px solid #2563eb' : 'none',
                color: activeRightTab === 'theme' ? '#2563eb' : '#64748b',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <Palette size={14} /> Theme
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('ai')}
              style={{
                flex: 1,
                padding: '12px 6px',
                border: 'none',
                background: activeRightTab === 'ai' ? '#ffffff' : 'transparent',
                borderBottom: activeRightTab === 'ai' ? '2px solid #8b5cf6' : 'none',
                color: activeRightTab === 'ai' ? '#8b5cf6' : '#64748b',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <Sparkles size={14} /> AI
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('history')}
              style={{
                flex: 1,
                padding: '12px 6px',
                border: 'none',
                background: activeRightTab === 'history' ? '#ffffff' : 'transparent',
                borderBottom: activeRightTab === 'history' ? '2px solid #2563eb' : 'none',
                color: activeRightTab === 'history' ? '#2563eb' : '#64748b',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <History size={14} /> History
            </button>
          </div>

          {/* Right Tab Content Body */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {activeRightTab === 'properties' && (
              <>
                {selectedBlock ? (
                  (() => {
                    const onChange = (updatedContent: any) =>
                      dispatch({ type: 'UPDATE_BLOCK', blockId: selectedBlock.id, updatedContent });

                    switch (selectedBlock.type) {
                      case 'heading': return <HeadingProperties block={selectedBlock} onChange={onChange} />;
                      case 'paragraph': return <ParagraphProperties block={selectedBlock} onChange={onChange} />;
                      case 'button': return <ButtonProperties block={selectedBlock} onChange={onChange} />;
                      case 'image': return <ImageProperties block={selectedBlock} onChange={onChange} />;
                      case 'divider': return <DividerProperties block={selectedBlock} onChange={onChange} />;
                      case 'spacer': return <SpacerProperties block={selectedBlock} onChange={onChange} />;
                      case 'video': return <VideoProperties block={selectedBlock} onChange={onChange} />;
                      case 'social': return <SocialProperties block={selectedBlock} onChange={onChange} />;
                      case 'html': return <HtmlProperties block={selectedBlock} onChange={onChange} />;
                      case 'menu': return <MenuProperties block={selectedBlock} onChange={onChange} />;
                      case 'table': return <TableProperties block={selectedBlock} onChange={onChange} />;
                      case 'icons': return <IconsProperties block={selectedBlock} onChange={onChange} />;
                      case 'rating': return <RatingProperties block={selectedBlock} onChange={onChange} />;
                      case 'productCard': return <ProductCardProperties block={selectedBlock} onChange={onChange} />;
                      case 'productGrid': return <ProductGridProperties block={selectedBlock} onChange={onChange} />;
                      case 'coupon': return <CouponProperties block={selectedBlock} onChange={onChange} />;
                      case 'countdown': return <CountdownProperties block={selectedBlock} onChange={onChange} />;
                      case 'qrCode': return <QrCodeProperties block={selectedBlock} onChange={onChange} />;
                      case 'poll': return <PollProperties block={selectedBlock} onChange={onChange} />;
                      case 'conditional': return <ConditionalProperties block={selectedBlock} onChange={onChange} />;
                      default: return null;
                    }
                  })()
                ) : selectedSection ? (
                  <SectionProperties
                    section={selectedSection}
                    onUpdateSection={(updates) => dispatch({ type: 'UPDATE_SECTION', sectionId: selectedSection.id, updates })}
                    onAddColumn={() => dispatch({ type: 'ADD_COLUMN', sectionId: selectedSection.id })}
                    onRemoveColumn={(columnId) => dispatch({ type: 'REMOVE_COLUMN', sectionId: selectedSection.id, columnId })}
                    onUpdateColumn={(columnId, updates) => dispatch({ type: 'UPDATE_COLUMN', sectionId: selectedSection.id, columnId, updates })}
                  />
                ) : (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    Select any section or block on the canvas to inspect and edit properties.
                  </div>
                )}
              </>
            )}

            {activeRightTab === 'theme' && (
              <GlobalThemePanel
                theme={present.globalTheme}
                onUpdateTheme={(theme) => dispatch({ type: 'SET_THEME', theme })}
              />
            )}

            {activeRightTab === 'ai' && (
              <AIPanel
                templateData={present}
                onLoadGeneratedTemplate={(tmpl) => dispatch({ type: 'LOAD_TEMPLATE', template: tmpl })}
              />
            )}

            {activeRightTab === 'history' && (
              <VersionHistoryPanel
                templateId={templateId}
                currentTemplate={present}
                onRestoreVersion={(tmpl) => dispatch({ type: 'LOAD_TEMPLATE', template: tmpl })}
              />
            )}
          </div>
        </div>
      </div>

      {/* Export / Import Modal */}
      <ExportModal
        isOpen={exportModal.isOpen}
        mode={exportModal.mode}
        templateData={present}
        onClose={() => setExportModal((prev) => ({ ...prev, isOpen: false }))}
        onImportJSON={(importedData) => dispatch({ type: 'LOAD_TEMPLATE', template: importedData })}
      />

      {/* Discard Draft Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDiscardConfirmOpen}
        title="Discard Unsaved Edits"
        message="Are you sure you want to discard your unsaved edits and reload the initial template?"
        confirmLabel="Discard Edits"
        variant="danger"
        onConfirm={() => {
          localStorage.removeItem('ms_builder_draft');
          dispatch({ type: 'LOAD_TEMPLATE', template: initialBuilderState.present });
          dispatch({ type: 'MARK_SAVED' });
          showToast('Edits Discarded', 'Reverted template back to last saved state', 'info');
        }}
        onCancel={() => setIsDiscardConfirmOpen(false)}
      />
    </div>
  );
};
