import React, { useReducer, useState, useEffect } from 'react';
import { builderReducer, initialBuilderState, initialTemplateData, BuilderState } from './builderReducer';
import { Section } from './Section';
import { ExportModal } from './ExportModal';
import { TemplatesPanel } from './TemplatesPanel';
import { AIPanel } from './AIPanel';
import { VersionHistoryPanel } from './VersionHistoryPanel';
import { SectionProperties } from './properties/SectionProperties';
import { BlockPropertyInspector } from './properties/BlockPropertyInspector';
import { ALL_BUILDER_BLOCKS } from './BlockPicker';
import { EntryChoiceModal } from './EntryChoiceModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { exportHTML } from './exportHTML';

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
  Tablet,
  Smartphone,
  ZoomIn,
  Layout,
  LayoutGrid,
  Type,
  Sparkles,
  History,
  Columns,
  Columns2,
  Columns3,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  FilePlus,
  Search,
} from 'lucide-react';

interface MailBuilderProps {
  initialTemplateId?: string;
}

// Helper to check if a valid draft exists in localStorage (used for lazy init)
const getRestoredBuilderState = (): BuilderState | null => {
  try {
    const rawDraft = localStorage.getItem('ms_builder_draft');
    if (rawDraft) {
      const savedDraft = JSON.parse(rawDraft);
      if (savedDraft && Array.isArray(savedDraft.sections) && savedDraft.sections.length > 0) {
        let pastHist: any[] = [];
        let futureHist: any[] = [];
        let selId: any = null;
        try {
          const rawPast = localStorage.getItem('ms_builder_past');
          if (rawPast) pastHist = JSON.parse(rawPast);
          const rawFut = localStorage.getItem('ms_builder_future');
          if (rawFut) futureHist = JSON.parse(rawFut);
          const rawSel = localStorage.getItem('ms_builder_selected_id');
          if (rawSel) selId = JSON.parse(rawSel);
        } catch (e) {}
        return {
          past: Array.isArray(pastHist) ? pastHist : [],
          present: savedDraft,
          future: Array.isArray(futureHist) ? futureHist : [],
          selectedId: selId || null,
          clipboardBlock: null,
          hasUnsavedChanges: false,
          saveStatus: 'autosaved',
        };
      }
    }
  } catch (e) {}
  return null;
};

export const MailBuilder: React.FC<MailBuilderProps> = ({ initialTemplateId }) => {
  const { showToast } = useToast();

  // Lazy initializer: restore state from localStorage synchronously on mount
  const [state, dispatch] = useReducer(builderReducer, initialBuilderState, (defaultState) => {
    if (initialTemplateId) return defaultState;
    return getRestoredBuilderState() || defaultState;
  });
  const { past, present, future, selectedId, hasUnsavedChanges, saveStatus } = state;

  // Track whether the reducer was lazily initialized from a saved draft
  const [wasRestoredOnMount] = useState<boolean>(() => {
    if (initialTemplateId) return false;
    return getRestoredBuilderState() !== null;
  });

  // Entry Choice Modal State — skip modal if we already restored a draft on mount
  const [isEntryModalOpen, setIsEntryModalOpen] = useState<boolean>(() => {
    if (initialTemplateId) return false;
    // If a saved draft exists in localStorage, don't show the entry modal
    try {
      const rawDraft = localStorage.getItem('ms_builder_draft');
      if (rawDraft) {
        const parsed = JSON.parse(rawDraft);
        if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
          return false;
        }
      }
    } catch (e) {}
    return true;
  });

  // Local UI Modes
  const [activeRightTab, setActiveRightTab] = useState<'properties' | 'templates' | 'ai' | 'history'>('properties');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(false);
  const [showRightSidebar, setShowRightSidebar] = useState<boolean>(false);
  const [exportModal, setExportModal] = useState<{ isOpen: boolean; mode: 'html' | 'json' | 'import' }>({
    isOpen: false,
    mode: 'html',
  });
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const [isNewConfirmOpen, setIsNewConfirmOpen] = useState(false);
  const [isCatalogCollapsed, setIsCatalogCollapsed] = useState<boolean>(false);
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [templateId, setTemplateId] = useState<string | undefined>(() => {
    if (initialTemplateId) return initialTemplateId;
    // Restore template ID from localStorage if a draft was restored
    try {
      const savedId = localStorage.getItem('ms_builder_template_id');
      if (savedId) return savedId;
    } catch (e) {}
    return undefined;
  });

  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({
    'Basic Content': false,
    'Cards & Callouts': false,
    'Lists & Timelines': false,
    'Commerce & Pricing': false,
    'Footers & Headers': false,
    'Advanced': false,
  });

  const presentRef = React.useRef(present);
  const templateIdRef = React.useRef(templateId);
  const hasUnsavedRef = React.useRef(hasUnsavedChanges);

  useEffect(() => {
    presentRef.current = present;
  }, [present]);

  useEffect(() => {
    templateIdRef.current = templateId;
  }, [templateId]);

  useEffect(() => {
    hasUnsavedRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // Saved Draft Name State for Entry Choice Modal
  const [savedDraftName, setSavedDraftName] = useState<string | null>(() => {
    try {
      const raw = localStorage.getItem('ms_builder_draft');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.sections?.length > 0) {
          return parsed.name || localStorage.getItem('ms_builder_name') || 'Untitled Template';
        }
      }
    } catch (e) {}
    return null;
  });

  const pastRef = React.useRef(past);
  const futureRef = React.useRef(future);
  const selectedIdRef = React.useRef(selectedId);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    pastRef.current = past;
  }, [past]);

  useEffect(() => {
    futureRef.current = future;
  }, [future]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  // Helper to format current time as HH:MM
  const getFormattedTime = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Listen for canvas block additions guidance highlight
  useEffect(() => {
    const handleHighlight = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.sectionId && detail?.columnId) {
        setActiveAddTarget({ sectionId: detail.sectionId, columnId: detail.columnId });
      }
      setIsCatalogCollapsed(false);
      const catalogEl = document.querySelector('.builder-left-sidebar');
      if (catalogEl) {
        catalogEl.classList.remove('catalog-highlight-pulse');
        void (catalogEl as HTMLElement).offsetWidth; // trigger reflow
        catalogEl.classList.add('catalog-highlight-pulse');
        setTimeout(() => {
          catalogEl.classList.remove('catalog-highlight-pulse');
        }, 1500);
      }
      showToast('Add Block', 'Select a block from the Block Catalog to add it here', 'info');
    };
    window.addEventListener('highlight-block-catalog', handleHighlight);
    return () => window.removeEventListener('highlight-block-catalog', handleHighlight);
  }, [showToast]);

  // 1. Auto-restore previously edited draft on mount if no initialTemplateId
  // Note: The actual state restore now happens via lazy useReducer initializer.
  // This effect only handles the toast notification and last-saved-time display.
  useEffect(() => {
    if (initialTemplateId) return;
    if (!wasRestoredOnMount) return;

    setLastSavedTime(getFormattedTime());
    showToast(
      'Session Restored',
      `Restored editing session for "${present.name || 'Untitled Template'}"`,
      'info'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTemplateId, wasRestoredOnMount]);

  // 2. Load existing template from server if initialTemplateId prop passed
  useEffect(() => {
    if (!initialTemplateId) return;
    const fetchTemplate = async () => {
      try {
        setIsSaving(true);
        const res = await api.get(`/api/templates/${initialTemplateId}`);
        if (res.data && res.data.jsonData) {
          dispatch({ type: 'LOAD_TEMPLATE', template: res.data.jsonData });
          setTemplateId(initialTemplateId);
          setIsEntryModalOpen(false);
          setLastSavedTime(getFormattedTime());
          try {
            localStorage.setItem('ms_builder_draft', JSON.stringify(res.data.jsonData));
            localStorage.setItem('ms_builder_name', res.data.jsonData.name || 'Untitled Template');
            localStorage.setItem('ms_builder_template_id', initialTemplateId);
          } catch (e) {}
        }
      } catch (err: any) {
        showToast('Error', 'Failed to load template data', 'error');
      } finally {
        setIsSaving(false);
      }
    };
    fetchTemplate();
  }, [initialTemplateId]);

  // Global Keyboard Shortcuts & beforeunload listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          dispatch({ type: 'REDO' });
        } else {
          dispatch({ type: 'UNDO' });
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        dispatch({ type: 'REDO' });
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && selectedId?.type === 'block') {
        dispatch({ type: 'COPY_BLOCK', blockId: selectedId.id });
        showToast('Copied', 'Block copied to clipboard', 'info');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v' && state.clipboardBlock) {
        dispatch({ type: 'PASTE_BLOCK' });
        showToast('Pasted', 'Block pasted', 'info');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedId?.type === 'block') {
        e.preventDefault();
        dispatch({ type: 'DUPLICATE_BLOCK', blockId: selectedId.id });
      } else if (e.key === 'Delete' && selectedId?.type === 'block') {
        dispatch({ type: 'DELETE_BLOCK', blockId: selectedId.id });
      }
    };

    const handleBeforeUnload = () => {
      if (presentRef.current && presentRef.current.sections?.length > 0) {
        try {
          localStorage.setItem('ms_builder_draft', JSON.stringify(presentRef.current));
          localStorage.setItem('ms_builder_past', JSON.stringify(pastRef.current));
          localStorage.setItem('ms_builder_future', JSON.stringify(futureRef.current));
          if (selectedIdRef.current) {
            localStorage.setItem('ms_builder_selected_id', JSON.stringify(selectedIdRef.current));
          }
          if (templateIdRef.current) {
            localStorage.setItem('ms_builder_template_id', templateIdRef.current);
          }
        } catch (e) {}
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [selectedId, state.clipboardBlock]);

  // 3. Continuous local auto-save & server sync on edits
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    setIsSaving(true);
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('ms_builder_draft', JSON.stringify(present));
        localStorage.setItem('ms_builder_name', present.name || 'Untitled Template');
        localStorage.setItem('ms_builder_past', JSON.stringify(past));
        localStorage.setItem('ms_builder_future', JSON.stringify(future));
        if (selectedId) {
          localStorage.setItem('ms_builder_selected_id', JSON.stringify(selectedId));
        }
        if (templateId) {
          localStorage.setItem('ms_builder_template_id', templateId);
        } else {
          localStorage.removeItem('ms_builder_template_id');
        }
        dispatch({ type: 'MARK_AUTOSAVED' });
        setSavedDraftName(present.name || 'Untitled Template');
        setLastSavedTime(getFormattedTime());
      } catch (e) {}
      setIsSaving(false);
    }, 400);

    let serverTimer: any = null;
    if (templateId) {
      serverTimer = setTimeout(async () => {
        try {
          await api.patch(`/api/templates/${templateId}`, {
            name: present.name,
            subject: present.metadata?.subject || present.name,
            htmlContent: '',
            jsonData: present,
          });
          setLastSavedTime(getFormattedTime());
        } catch (e) {}
      }, 1500);
    }

    return () => {
      clearTimeout(timer);
      if (serverTimer) clearTimeout(serverTimer);
    };
  }, [present, past, future, selectedId, hasUnsavedChanges, templateId]);

  // 4. Synchronous save on unmount (e.g. user clicks Assets tab in sidebar)
  useEffect(() => {
    return () => {
      const curPresent = presentRef.current;
      const curPast = pastRef.current;
      const curFut = futureRef.current;
      const curSel = selectedIdRef.current;
      const curId = templateIdRef.current;
      const isUnsaved = hasUnsavedRef.current;

      if (curPresent && Array.isArray(curPresent.sections) && curPresent.sections.length > 0) {
        try {
          localStorage.setItem('ms_builder_draft', JSON.stringify(curPresent));
          localStorage.setItem('ms_builder_name', curPresent.name || 'Untitled Template');
          localStorage.setItem('ms_builder_past', JSON.stringify(curPast));
          localStorage.setItem('ms_builder_future', JSON.stringify(curFut));
          if (curSel) {
            localStorage.setItem('ms_builder_selected_id', JSON.stringify(curSel));
          }
          if (curId) {
            localStorage.setItem('ms_builder_template_id', curId);
          }
        } catch (e) {}

        if (curId && isUnsaved) {
          api
            .patch(`/api/templates/${curId}`, {
              name: curPresent.name,
              subject: curPresent.metadata?.subject || curPresent.name,
              htmlContent: '',
              jsonData: curPresent,
            })
            .catch(() => {});
        }
      }
    };
  }, []);

  // Auto-scroll canvas smoothly to newly added or selected block/section
  useEffect(() => {
    if (!selectedId?.id) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`builder-item-${selectedId.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [selectedId?.id]);

  // Handle Entry Choice Options
  const handleSelectNewTemplate = () => {
    try {
      localStorage.removeItem('ms_builder_draft');
      localStorage.removeItem('ms_builder_name');
      localStorage.removeItem('ms_builder_template_id');
      localStorage.removeItem('ms_builder_past');
      localStorage.removeItem('ms_builder_future');
      localStorage.removeItem('ms_builder_selected_id');
    } catch (e) {}
    setSavedDraftName(null);
    dispatch({ type: 'RESET_TEMPLATE' });
    setTemplateId(undefined);
    setIsEntryModalOpen(false);
    showToast('New Blank Canvas', 'Canvas cleared. Add blocks from the catalog to build your email.', 'info');
  };

  const handleSelectSampleTemplate = () => {
    try {
      localStorage.removeItem('ms_builder_draft');
      localStorage.removeItem('ms_builder_name');
      localStorage.removeItem('ms_builder_template_id');
    } catch (e) {}
    setSavedDraftName(null);
    dispatch({ type: 'LOAD_TEMPLATE', template: initialTemplateData });
    setTemplateId(undefined);
    setIsEntryModalOpen(false);
    showToast('Sample Loaded', 'Loaded default newsletter layout', 'success');
  };

  const handleResumeDraft = () => {
    try {
      const rawDraft = localStorage.getItem('ms_builder_draft');
      if (rawDraft) {
        const savedDraft = JSON.parse(rawDraft);
        let pastHist: any[] = [];
        let futureHist: any[] = [];
        let selId: any = null;
        try {
          const rp = localStorage.getItem('ms_builder_past'); if (rp) pastHist = JSON.parse(rp);
          const rf = localStorage.getItem('ms_builder_future'); if (rf) futureHist = JSON.parse(rf);
          const rs = localStorage.getItem('ms_builder_selected_id'); if (rs) selId = JSON.parse(rs);
        } catch (e) {}
        dispatch({ type: 'RESTORE_FULL_SESSION', present: savedDraft, past: pastHist, future: futureHist, selectedId: selId });
        const savedId = localStorage.getItem('ms_builder_template_id');
        if (savedId) setTemplateId(savedId);
        setIsEntryModalOpen(false);
        setLastSavedTime(getFormattedTime());
        showToast('Draft Resumed', `Resumed editing "${savedDraft.name || 'Untitled Template'}"`, 'success');
      }
    } catch (e) {
      showToast('Error', 'Failed to resume draft', 'error');
    }
  };

  // Save to Backend API
  const handleSaveToServer = async () => {
    try {
      setIsSaving(true);
      const compiledHtml = exportHTML(present);
      const payload = {
        name: present.name || 'Untitled Template',
        subject: present.metadata?.subject || present.name || 'Email Template',
        htmlContent: compiledHtml,
        jsonData: present,
      };

      if (templateId) {
        await api.patch(`/api/templates/${templateId}`, payload);
        showToast('Saved', 'Template updated successfully', 'success');
      } else {
        const res = await api.post('/api/templates', payload);
        const newId = res.data?._id || res.data?.id;
        if (newId) {
          setTemplateId(newId);
          try {
            localStorage.setItem('ms_builder_template_id', newId);
          } catch (e) {}
        }
        showToast('Saved', 'New template saved to library', 'success');
      }

      try {
        localStorage.setItem('ms_builder_draft', JSON.stringify(present));
        localStorage.setItem('ms_builder_name', present.name || 'Untitled Template');
      } catch (e) {}

      setLastSavedTime(getFormattedTime());
      dispatch({ type: 'MARK_SAVED' });
    } catch (err: any) {
      showToast('Save Error', err.response?.data?.message || err.message || 'Failed to save template', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset/New Template button in toolbar
  const handleNewTemplateClick = () => {
    if (present.sections.length > 0) {
      setIsNewConfirmOpen(true);
    } else {
      setIsEntryModalOpen(true);
    }
  };

  // Find currently selected block/section/column
  let selectedBlock: any = null;
  let selectedSection: any = null;

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
        break;
      }
    }
  }

  // Filtered block catalog items
  const filteredCatalogBlocks = ALL_BUILDER_BLOCKS.filter(
    (b) =>
      b.label.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      b.type.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      b.category.toLowerCase().includes(catalogSearch.toLowerCase())
  );

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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: 56,
          minHeight: 56,
          maxHeight: 56,
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          gap: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          zIndex: 20,
          whiteSpace: 'nowrap',
          overflowX: 'auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Left Side: Title & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="text"
              value={present.name || 'Untitled Template'}
              onChange={(e) => dispatch({ type: 'SET_NAME', name: e.target.value })}
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#0f172a',
                border: '1px solid transparent',
                borderRadius: 6,
                padding: '4px 6px',
                outline: 'none',
                background: 'transparent',
                transition: 'all 0.15s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.background = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'transparent';
                e.target.style.background = 'transparent';
              }}
            />
          </div>

          <div className="mobile-builder-toggle-group">
            <button
              type="button"
              className={`mobile-builder-toggle ${showLeftSidebar ? 'active' : ''}`}
              onClick={() => {
                setShowLeftSidebar(!showLeftSidebar);
                setShowRightSidebar(false);
              }}
              title="Toggle block catalog sidebar"
            >
              <LayoutGrid size={14} />
              <span>Blocks</span>
            </button>
            <button
              type="button"
              className={`mobile-builder-toggle ${showRightSidebar ? 'active' : ''}`}
              onClick={() => {
                setShowRightSidebar(!showRightSidebar);
                setShowLeftSidebar(false);
              }}
              title="Toggle builder properties sidebar"
            >
              <Settings size={14} />
              <span>Properties</span>
            </button>
          </div>

          {/* Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600 }}>
            {isSaving ? (
              <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706' }} /> Saving...
              </span>
            ) : saveStatus === 'saved' ? (
              <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} /> Saved {lastSavedTime ? `(${lastSavedTime})` : ''}
              </span>
            ) : saveStatus === 'autosaved' ? (
              <span style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb' }} /> Auto-saved {lastSavedTime ? `(${lastSavedTime})` : ''}
              </span>
            ) : (
              <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706' }} /> Unsaved changes
              </span>
            )}
          </div>
        </div>

        {/* Action Controls - Single Row Luxury Alignment */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap', justifyContent: 'flex-end', flexShrink: 0 }}>
          {/* Device View Toggles */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 6, padding: 2, gap: 2, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setPreviewMode('desktop')}
              style={{
                border: 'none',
                background: previewMode === 'desktop' ? '#ffffff' : 'transparent',
                color: previewMode === 'desktop' ? '#2563eb' : '#64748b',
                padding: '4px 7px',
                borderRadius: 4,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Desktop view (600px)"
            >
              <Monitor size={14} />
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('tablet')}
              style={{
                border: 'none',
                background: previewMode === 'tablet' ? '#ffffff' : 'transparent',
                color: previewMode === 'tablet' ? '#2563eb' : '#64748b',
                padding: '4px 7px',
                borderRadius: 4,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Tablet view (480px)"
            >
              <Tablet size={14} />
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('mobile')}
              style={{
                border: 'none',
                background: previewMode === 'mobile' ? '#ffffff' : 'transparent',
                color: previewMode === 'mobile' ? '#2563eb' : '#64748b',
                padding: '4px 7px',
                borderRadius: 4,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Mobile view (360px)"
            >
              <Smartphone size={14} />
            </button>
          </div>

          {/* Zoom Level Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f1f5f9', borderRadius: 6, padding: '2px 6px', flexShrink: 0 }}>
            <ZoomIn size={13} style={{ color: '#64748b' }} />
            <select
              value={zoomScale}
              onChange={(e) => setZoomScale(parseFloat(e.target.value))}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: 11,
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value={0.5}>50%</option>
              <option value={0.75}>75%</option>
              <option value={1}>100%</option>
              <option value={1.25}>125%</option>
              <option value={1.5}>150%</option>
            </select>
          </div>

          <div style={{ width: 1, height: 16, background: '#e2e8f0', flexShrink: 0 }} />

          {/* Undo / Redo */}
          <button
            type="button"
            disabled={past.length === 0}
            onClick={() => dispatch({ type: 'UNDO' })}
            style={{
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: past.length === 0 ? '#cbd5e1' : '#0f172a',
              padding: '5px 8px',
              borderRadius: 6,
              cursor: past.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
              flexShrink: 0,
            }}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={13} /> Undo
          </button>
          <button
            type="button"
            disabled={future.length === 0}
            onClick={() => dispatch({ type: 'REDO' })}
            style={{
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: future.length === 0 ? '#cbd5e1' : '#0f172a',
              padding: '5px 8px',
              borderRadius: 6,
              cursor: future.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
              flexShrink: 0,
            }}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={13} /> Redo
          </button>

          <div style={{ width: 1, height: 16, background: '#e2e8f0', flexShrink: 0 }} />

          {/* Export Options */}
          <button
            type="button"
            onClick={() => setExportModal({ isOpen: true, mode: 'html' })}
            style={{
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              padding: '5px 8px',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            <Code2 size={13} /> HTML
          </button>

          <button
            type="button"
            onClick={() => setExportModal({ isOpen: true, mode: 'json' })}
            style={{
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              padding: '5px 8px',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            <Download size={13} /> JSON
          </button>

          <button
            type="button"
            onClick={() => setExportModal({ isOpen: true, mode: 'import' })}
            style={{
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              padding: '5px 8px',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            <Upload size={13} /> Import
          </button>

          <div style={{ width: 1, height: 16, background: '#e2e8f0', flexShrink: 0 }} />

          <button
            type="button"
            onClick={() => {
              setActiveRightTab('templates');
              setShowRightSidebar(true);
            }}
            style={{
              border: '1px solid #2563eb',
              background: '#eff6ff',
              color: '#2563eb',
              padding: '5px 9px',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
              flexShrink: 0,
            }}
            title="Load your saved templates library"
          >
            <Layout size={13} /> Load Template
          </button>

          <button
            type="button"
            onClick={handleNewTemplateClick}
            style={{
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              padding: '5px 9px',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
              flexShrink: 0,
            }}
            title="Start fresh blank template"
          >
            <FilePlus size={13} /> New Template
          </button>

          {/* Primary Action Buttons: Discard & Save */}
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={() => setIsDiscardConfirmOpen(true)}
              style={{
                border: '1px solid #fee2e2',
                background: '#fef2f2',
                color: '#ef4444',
                padding: '5px 9px',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              <RotateCcw size={13} /> Discard
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveToServer}
            disabled={isSaving}
            style={{
              border: 'none',
              background: isSaving ? '#93c5fd' : '#2563eb',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: 6,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(37,99,235,0.2)',
            }}
          >
            <Save size={14} /> {isSaving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </header>

      {/* ── 2. Middle Body: Catalog + Canvas + Properties ───────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* ── Left Sidebar Catalog (SEARCHABLE CATEGORIZED BLOCKS) ── */}
        <div className={`builder-left-sidebar ${showLeftSidebar ? 'open' : ''} ${isCatalogCollapsed ? 'collapsed' : ''}`}>
          {/* Header */}
          <div
            style={{
              padding: isCatalogCollapsed ? '12px 8px' : '12px 16px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCatalogCollapsed ? 'center' : 'space-between',
              background: '#ffffff',
            }}
          >
            {!isCatalogCollapsed && (
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                Block Catalog
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsCatalogCollapsed((prev) => !prev)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2px 6px',
                borderRadius: 4,
              }}
              title={isCatalogCollapsed ? 'Expand Catalog' : 'Collapse Catalog'}
            >
              {isCatalogCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {!isCatalogCollapsed && (
            <div style={{ padding: '10px 16px 0 16px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 9, color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search blocks..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
                    fontSize: 12,
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          )}

          <div className="builder-sidebar-scroll" style={{ padding: '12px 16px 40px 16px', flex: 1, overflowY: 'auto' }}>
            {/* LAYOUT SECTIONS */}
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#2563eb', margin: '0 0 8px 0' }}>
              Layout Structure
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 16 }}>
              {[1, 2, 3].map((cols) => (
                <button
                  key={`layout-cols-${cols}`}
                  type="button"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'section', columnsCount: cols }));
                  }}
                  onClick={() => dispatch({ type: 'ADD_SECTION', columnsCount: cols })}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 11, fontWeight: 600, cursor: 'grab' }}
                >
                  {cols === 1 && <Columns size={16} style={{ color: '#2563eb' }} />}
                  {cols === 2 && <Columns2 size={16} style={{ color: '#2563eb' }} />}
                  {cols === 3 && <Columns3 size={16} style={{ color: '#2563eb' }} />}
                  <span>{cols} {cols === 1 ? 'Col' : 'Cols'}</span>
                </button>
              ))}
            </div>

            {/* CONTENT BLOCKS GRID BY CATEGORIES */}
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', margin: '16px 0 8px 0' }}>
              Content Blocks ({filteredCatalogBlocks.length})
            </p>

            {(() => {
              const categoriesList: ('Basic Content' | 'Cards & Callouts' | 'Lists & Timelines' | 'Commerce & Pricing' | 'Footers & Headers' | 'Advanced')[] = [
                'Basic Content',
                'Cards & Callouts',
                'Lists & Timelines',
                'Commerce & Pricing',
                'Footers & Headers',
                'Advanced',
              ];

              return categoriesList.map((catName) => {
                const catItems = filteredCatalogBlocks.filter((b) => b.category === catName);
                if (catItems.length === 0) return null;

                const isCollapsed = collapsedCategories[catName];
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
                  <div key={catName} style={{ marginBottom: 12 }}>
                    <button
                      type="button"
                      onClick={() => setCollapsedCategories((prev) => ({ ...prev, [catName]: !prev[catName] }))}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: 'none',
                        background: 'transparent',
                        padding: '6px 0',
                        cursor: 'pointer',
                        textAlign: 'left',
                        outline: 'none',
                      }}
                    >
                      <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: accentColor }}>
                        {catName} ({catItems.length})
                      </span>
                      <ChevronDown
                        size={12}
                        style={{
                          color: accentColor,
                          transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                        }}
                      />
                    </button>

                    {!isCollapsed && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 4 }}>
                        {catItems.map((item, idx) => (
                          <button
                            key={`cat-${item.type}-${idx}`}
                            type="button"
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'block', blockType: item.type }));
                            }}
                            onClick={() => {
                              if (activeAddTarget) {
                                dispatch({
                                  type: 'ADD_BLOCK',
                                  sectionId: activeAddTarget.sectionId,
                                  columnId: activeAddTarget.columnId,
                                  blockType: item.type as any,
                                });
                                setActiveAddTarget(null);
                              } else {
                                if (present.sections.length === 0) {
                                  dispatch({ type: 'ADD_SECTION', columnsCount: 1 });
                                }
                                const targetSec = present.sections[present.sections.length - 1] || present.sections[0];
                                if (targetSec) {
                                  dispatch({
                                    type: 'ADD_BLOCK',
                                    sectionId: targetSec.id,
                                    columnId: targetSec.columns[0]?.id || 'col_1',
                                    blockType: item.type as any,
                                  });
                                }
                              }
                            }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: 10.5, fontWeight: 600, cursor: 'grab' }}
                          >
                            <div style={{ width: 26, height: 26, borderRadius: 6, background: `${accentColor}15`, color: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {item.icon}
                            </div>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* ── Central Email Canvas ───────────────────────────────────── */}
        {(() => {
          const {
            pageBackgroundColor = '#f3f4f6',
            pageBackgroundImage = '',
            pageBackgroundRepeat = 'no-repeat',
            pageBackgroundSize = 'cover',
            pageBackgroundPosition = 'center',
            pageBackgroundOpacity = 1,
            bodyBackgroundColor = '#ffffff',
            bodyBackgroundImage = '',
            bodyWidth = 600,
            bodyPadding = 24,
            bodyBorderRadius = 16,
            bodyShadow = '0 4px 20px rgba(0,0,0,0.06)',
          } = present.globalTheme;

          const activeWidth = previewMode === 'mobile' ? 360 : previewMode === 'tablet' ? 480 : bodyWidth || 600;

          return (
            <div
              className="builder-canvas-scroll"
              style={{
                flex: 1,
                backgroundColor: pageBackgroundColor,
                backgroundImage: pageBackgroundImage ? `url(${pageBackgroundImage})` : 'none',
                backgroundRepeat: pageBackgroundRepeat,
                backgroundSize: pageBackgroundSize,
                backgroundPosition: pageBackgroundPosition,
                opacity: pageBackgroundOpacity,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '32px 16px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box',
                width: '100%',
              }}
              onClick={() => dispatch({ type: 'SELECT_ITEM', selection: null })}
            >
              <div
                className="builder-center-card"
                style={{
                  width: '100%',
                  maxWidth: activeWidth,
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.2s ease, max-width 0.2s ease',
                  backgroundColor: bodyBackgroundColor,
                  backgroundImage: bodyBackgroundImage ? `url(${bodyBackgroundImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: bodyBorderRadius,
                  boxShadow: bodyShadow === 'none' ? 'none' : bodyShadow,
                  padding: `${bodyPadding}px`,
                  minHeight: 500,
                  boxSizing: 'border-box',
                  overflowX: 'hidden',
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
                    Canvas is empty. Click <strong>1 Col</strong> or drag a block from the left catalog to start building.
                  </div>
                ) : (
                  present.sections.map((sec, idx) => (
                    <Section
                      key={sec.id ? `${sec.id}-${idx}` : `sec-${idx}`}
                      section={sec}
                      selectedId={selectedId}
                      onSelectSection={() => dispatch({ type: 'SELECT_ITEM', selection: { type: 'section', id: sec.id } })}
                      onSelectColumn={(colId) => dispatch({ type: 'SELECT_ITEM', selection: { type: 'column', id: colId } })}
                      onSelectBlock={(blockId) => dispatch({ type: 'SELECT_ITEM', selection: { type: 'block', id: blockId } })}
                      onUpdateBlock={(blockId, updatedContent) => dispatch({ type: 'UPDATE_BLOCK', blockId, updatedContent })}
                      onAddBlock={(sectionId, columnId, blockType, targetIndex) => dispatch({ type: 'ADD_BLOCK', sectionId, columnId, blockType, targetIndex })}
                      onMoveBlockToColumn={(blockId, targetSectionId, targetColumnId, targetIndex) => dispatch({ type: 'MOVE_BLOCK_TO_COLUMN', blockId, targetSectionId, targetColumnId, targetIndex })}
                      onSplitSectionWithBlock={(sectionId, targetColumnId, position, blockType, blockId) => dispatch({ type: 'SPLIT_SECTION_WITH_BLOCK', sectionId, targetColumnId, position, blockType, blockId })}
                      onMoveBlock={(blockId, direction) => dispatch({ type: 'MOVE_BLOCK', blockId, direction })}
                      onDuplicateBlock={(blockId) => dispatch({ type: 'DUPLICATE_BLOCK', blockId })}
                      onToggleLockBlock={(blockId) => dispatch({ type: 'TOGGLE_LOCK_BLOCK', blockId })}
                      onDeleteBlock={(blockId) => dispatch({ type: 'DELETE_BLOCK', blockId })}
                      onMoveSection={(direction) => dispatch({ type: 'MOVE_SECTION', sectionId: sec.id, direction })}
                      onDuplicateSection={() => dispatch({ type: 'DUPLICATE_SECTION', sectionId: sec.id })}
                      onDeleteSection={() => dispatch({ type: 'DELETE_SECTION', sectionId: sec.id })}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })()}

        {/* ── Right Sidebar: Multi-Tab Properties & Utilities Panel ──── */}
        <div className={`builder-right-sidebar ${showRightSidebar ? 'open' : ''}`}>
          {/* Right Header Navigation Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', width: '100%', flexShrink: 0, overflow: 'hidden', boxSizing: 'border-box' }}>
            <button
              type="button"
              onClick={() => setActiveRightTab('properties')}
              style={{
                flex: 1,
                padding: '12px 2px',
                border: 'none',
                background: activeRightTab === 'properties' ? '#ffffff' : 'transparent',
                borderBottom: activeRightTab === 'properties' ? '2px solid #2563eb' : 'none',
                color: activeRightTab === 'properties' ? '#2563eb' : '#64748b',
                fontWeight: 600,
                fontSize: 11,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}
            >
              <Type size={13} /> Properties
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('templates')}
              style={{
                flex: 1,
                padding: '12px 2px',
                border: 'none',
                background: activeRightTab === 'templates' ? '#ffffff' : 'transparent',
                borderBottom: activeRightTab === 'templates' ? '2px solid #2563eb' : 'none',
                color: activeRightTab === 'templates' ? '#2563eb' : '#64748b',
                fontWeight: 600,
                fontSize: 11,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}
            >
              <Layout size={13} /> Templates
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('ai')}
              style={{
                flex: 1,
                padding: '12px 2px',
                border: 'none',
                background: activeRightTab === 'ai' ? '#ffffff' : 'transparent',
                borderBottom: activeRightTab === 'ai' ? '2px solid #8b5cf6' : 'none',
                color: activeRightTab === 'ai' ? '#8b5cf6' : '#64748b',
                fontWeight: 600,
                fontSize: 11,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}
            >
              <Sparkles size={13} /> AI
            </button>
            <button
              type="button"
              onClick={() => setActiveRightTab('history')}
              style={{
                flex: 1,
                padding: '12px 2px',
                border: 'none',
                background: activeRightTab === 'history' ? '#ffffff' : 'transparent',
                borderBottom: activeRightTab === 'history' ? '2px solid #2563eb' : 'none',
                color: activeRightTab === 'history' ? '#2563eb' : '#64748b',
                fontWeight: 600,
                fontSize: 11,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}
            >
              <History size={13} /> History
            </button>
          </div>

          {/* Right Tab Content Body */}
          <div className="builder-properties-scroll" style={{ flex: 1, overflowY: 'auto' }}>
            {activeRightTab === 'properties' && (
              <>
                {selectedBlock ? (
                  <BlockPropertyInspector
                    block={selectedBlock}
                    onChange={(updatedContent) => dispatch({ type: 'UPDATE_BLOCK', blockId: selectedBlock.id, updatedContent })}
                    onToggleLock={() => dispatch({ type: 'TOGGLE_LOCK_BLOCK', blockId: selectedBlock.id })}
                  />
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

            {activeRightTab === 'templates' && (
              <TemplatesPanel
                currentTemplateId={templateId}
                onLoadTemplate={(jsonData, id) => {
                  dispatch({ type: 'LOAD_TEMPLATE', template: jsonData });
                  setTemplateId(id);
                  try {
                    localStorage.setItem('ms_builder_draft', JSON.stringify(jsonData));
                    localStorage.setItem('ms_builder_name', jsonData.name || 'Untitled Template');
                    if (id) {
                      localStorage.setItem('ms_builder_template_id', id);
                    } else {
                      localStorage.removeItem('ms_builder_template_id');
                    }
                    setSavedDraftName(jsonData.name || 'Untitled Template');
                  } catch (e) {}
                }}
              />
            )}

            {activeRightTab === 'ai' && (
              <AIPanel
                templateData={present}
                onLoadGeneratedTemplate={(tmpl) => {
                  dispatch({ type: 'LOAD_TEMPLATE', template: tmpl });
                  try {
                    localStorage.setItem('ms_builder_draft', JSON.stringify(tmpl));
                    localStorage.setItem('ms_builder_name', tmpl.name || 'AI Generated Template');
                  } catch (e) {}
                }}
                onAppendGeneratedBlock={(html) => dispatch({ type: 'APPEND_AI_HTML_BLOCK', html })}
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

      {/* Backdrop overlay for Mail Builder drawers on mobile */}
      {(showLeftSidebar || showRightSidebar) && (
        <div
          className="builder-overlay"
          onClick={() => {
            setShowLeftSidebar(false);
            setShowRightSidebar(false);
          }}
        />
      )}

      {/* Initial Entry Choice Modal */}
      <EntryChoiceModal
        isOpen={isEntryModalOpen}
        onSelectNew={handleSelectNewTemplate}
        onSelectSample={handleSelectSampleTemplate}
        onResumeDraft={savedDraftName ? handleResumeDraft : undefined}
        draftName={savedDraftName || undefined}
        onClose={() => setIsEntryModalOpen(false)}
      />

      {/* Export / Import Modal */}
      <ExportModal
        isOpen={exportModal.isOpen}
        mode={exportModal.mode}
        templateData={present}
        onClose={() => setExportModal((prev) => ({ ...prev, isOpen: false }))}
        onImportJSON={(importedData) => dispatch({ type: 'LOAD_TEMPLATE', template: importedData })}
      />

      {/* Start New Template Confirm Dialog */}
      <ConfirmDialog
        isOpen={isNewConfirmOpen}
        title="Start New Template"
        message="Choose 'New Template' to clear the canvas or 'Load Sample' to load the default template. Unsaved changes will be lost."
        confirmLabel="Choose Entry Mode"
        variant="primary"
        onConfirm={() => {
          setIsNewConfirmOpen(false);
          setIsEntryModalOpen(true);
        }}
        onCancel={() => setIsNewConfirmOpen(false)}
      />

      {/* Discard Draft Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDiscardConfirmOpen}
        title="Discard Unsaved Edits"
        message="Are you sure you want to discard your unsaved edits and reset the canvas?"
        confirmLabel="Discard Edits"
        variant="danger"
        onConfirm={() => {
          try {
            localStorage.removeItem('ms_builder_draft');
            localStorage.removeItem('ms_builder_name');
            localStorage.removeItem('ms_builder_template_id');
            localStorage.removeItem('ms_builder_past');
            localStorage.removeItem('ms_builder_future');
            localStorage.removeItem('ms_builder_selected_id');
          } catch (e) {}
          setSavedDraftName(null);
          setTemplateId(undefined);
          dispatch({ type: 'RESET_TEMPLATE' });
          setIsDiscardConfirmOpen(false);
          showToast('Edits Discarded', 'Unsaved changes discarded and canvas reset', 'info');
        }}
        onCancel={() => setIsDiscardConfirmOpen(false)}
      />
    </div>
  );
};
