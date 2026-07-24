import { TemplateData, SectionData, ColumnData, BuilderBlock } from './types';

export interface BuilderState {
  past: TemplateData[];
  present: TemplateData;
  future: TemplateData[];
  selectedId: { type: 'section' | 'column' | 'block'; id: string } | null;
  hasUnsavedChanges: boolean;
  saveStatus: 'saved' | 'unsaved' | 'autosaved';
}

export type BuilderAction =
  | { type: 'ADD_SECTION'; columnsCount: number }
  | { type: 'UPDATE_SECTION'; sectionId: string; updates: Partial<SectionData> }
  | { type: 'DELETE_SECTION'; sectionId: string }
  | { type: 'MOVE_SECTION'; sectionId: string; direction: 'up' | 'down' }
  | { type: 'DUPLICATE_SECTION'; sectionId: string }
  | { type: 'ADD_COLUMN'; sectionId: string }
  | { type: 'REMOVE_COLUMN'; sectionId: string; columnId: string }
  | { type: 'UPDATE_COLUMN'; sectionId: string; columnId: string; updates: Partial<ColumnData> }
  | { type: 'ADD_BLOCK'; sectionId: string; columnId: string; blockType: BuilderBlock['type'] }
  | { type: 'UPDATE_BLOCK'; blockId: string; updatedContent: any }
  | { type: 'DELETE_BLOCK'; blockId: string }
  | { type: 'MOVE_BLOCK'; blockId: string; direction: 'up' | 'down' }
  | { type: 'DUPLICATE_BLOCK'; blockId: string }
  | { type: 'SET_THEME'; theme: Partial<TemplateData['globalTheme']> }
  | { type: 'SET_NAME'; name: string }
  | { type: 'LOAD_TEMPLATE'; template: TemplateData }
  | { type: 'SELECT_ITEM'; selection: BuilderState['selectedId'] }
  | { type: 'MARK_SAVED' }
  | { type: 'MARK_AUTOSAVED' }
  | { type: 'RESET_TEMPLATE' }
  | { type: 'UNDO' }
  | { type: 'REDO' };

export const initialTemplateData: TemplateData = {
  name: 'Untitled Template',
  version: '2.0',
  globalTheme: {
    fontFamily: 'Inter, sans-serif',
    backgroundColor: '#f8fafc',
    textColor: '#18181b',
    linkColor: '#2563eb',
    buttonColor: '#2563eb',
    pageBackgroundColor: '#f3f4f6',
    pageBackgroundImage: '',
    pageBackgroundRepeat: 'no-repeat',
    pageBackgroundSize: 'cover',
    pageBackgroundPosition: 'center',
    pageBackgroundOpacity: 1,
    bodyBackgroundColor: '#ffffff',
    bodyBackgroundImage: '',
    bodyWidth: 600,
    bodyPadding: 24,
    bodyBorderRadius: 16,
    bodyShadow: '0 4px 20px rgba(0,0,0,0.06)',
  },
  variables: [
    { name: 'customer.name', fallback: 'there' },
    { name: 'customer.firstName', fallback: 'there' },
    { name: 'customer.email', fallback: '' },
    { name: 'org.name', fallback: 'our team' },
    { name: 'unsubscribe_link', fallback: '#' },
  ],
  sections: [
    {
      id: 'sec_1',
      background: '#ffffff',
      padding: '24px 20px',
      columns: [
        {
          id: 'col_1',
          width: '100%',
          components: [
            {
              id: 'heading_1',
              type: 'heading',
              content: {
                text: 'Welcome to Our Product Newsletter',
                tag: 'h1',
                fontSize: 30,
                fontWeight: '800',
                color: '#18181b',
                align: 'center',
                letterSpacing: -0.5,
                lineHeight: 1.25,
              },
            },
            {
              id: 'paragraph_1',
              type: 'paragraph',
              content: {
                text: 'Thank you for subscribing! Here are the latest feature updates and announcements from our team.',
                fontSize: 15,
                color: '#475569',
                align: 'center',
                lineHeight: 1.6,
              },
            },
            {
              id: 'button_1',
              type: 'button',
              content: {
                label: 'Explore Features',
                url: 'https://example.com',
                backgroundColor: '#8b5cf6',
                color: '#ffffff',
                borderRadius: 6,
                align: 'center',
                paddingX: 24,
                paddingY: 12,
                shadow: true,
              },
            },
          ],
        },
      ],
    },
  ],
  tracking: { openTracking: true, clickTracking: true },
  metadata: { aiPrompt: '', category: 'marketing', subject: '', preheader: '' },
};

export const initialBuilderState: BuilderState = {
  past: [],
  present: initialTemplateData,
  future: [],
  selectedId: { type: 'block', id: 'heading_1' },
  hasUnsavedChanges: false,
  saveStatus: 'saved',
};

const MAX_HISTORY = 50;

export function createBlockInstance(type: BuilderBlock['type']): BuilderBlock {
  const id = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  switch (type) {
    case 'heading':
      return { id, type: 'heading', content: { text: 'New Heading', tag: 'h2', fontSize: 26, fontWeight: '700', color: '#18181b', align: 'center', letterSpacing: 0, lineHeight: 1.3 } };
    case 'paragraph':
      return { id, type: 'paragraph', content: { text: 'Write your content here...', fontSize: 15, color: '#334155', align: 'left', lineHeight: 1.6 } };
    case 'button':
      return { id, type: 'button', content: { label: 'Click Here', url: '#', backgroundColor: '#8b5cf6', color: '#ffffff', borderRadius: 6, align: 'center', paddingX: 24, paddingY: 12, shadow: true } };
    case 'image':
      return { id, type: 'image', content: { url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80', alt: 'Image', linkUrl: '', borderRadius: 8, align: 'center' } };
    case 'divider':
      return { id, type: 'divider', content: { style: 'solid', thickness: 1, color: '#e2e8f0', paddingTop: 16, paddingBottom: 16 } };
    case 'spacer':
      return { id, type: 'spacer', content: { height: 32 } };
    case 'video':
      return { id, type: 'video', content: { thumbnailUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80', videoUrl: 'https://youtube.com', alt: 'Video', borderRadius: 8 } };
    case 'social':
      return { id, type: 'social', content: { iconSize: 24, align: 'center', iconColor: '#8b5cf6', links: [{ platform: 'twitter', url: '#' }, { platform: 'linkedin', url: '#' }, { platform: 'instagram', url: '#' }] } };
    case 'html':
      return { id, type: 'html', content: { html: '<div style="padding:16px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;text-align:center;">Custom HTML Content</div>' } };
    case 'menu':
      return { id, type: 'menu', content: { align: 'center', color: '#8b5cf6', fontSize: 14, separator: '|', links: [{ label: 'Home', url: '#' }, { label: 'Shop', url: '#' }, { label: 'Contact', url: '#' }] } };
    case 'table':
      return { id, type: 'table', content: { headerBg: '#f1f5f9', headerTextColor: '#0f172a', stripedRows: true, borderColor: '#cbd5e1', headers: ['Item', 'Quantity', 'Price'], rows: [['Plan A', '1', '$29.00'], ['Plan B', '2', '$58.00']] } };
    case 'icons':
      return { id, type: 'icons', content: { iconSize: 24, align: 'center', iconColor: '#8b5cf6', icons: [{ name: 'shield' }, { name: 'truck' }, { name: 'gift' }] } };
    case 'rating':
      return { id, type: 'rating', content: { maxStars: 5, ratingValue: 4.5, url: '#', color: '#f59e0b', size: 24, align: 'center' } };
    case 'productCard':
      return { id, type: 'productCard', content: { imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', title: 'Wireless Headphones', price: '$199.00', oldPrice: '$249.00', description: 'Active noise cancellation headphones.', ctaLabel: 'Shop Now', ctaUrl: '#', ctaColor: '#8b5cf6', borderRadius: 10 } };
    case 'productGrid':
      return { id, type: 'productGrid', content: { columns: 2, products: [{ imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80', title: 'Watch', price: '$120.00', linkUrl: '#' }, { imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80', title: 'Sneakers', price: '$85.00', linkUrl: '#' }] } };
    case 'coupon':
      return { id, type: 'coupon', content: { headline: 'SPECIAL PROMO DISCOUNT', headlineColor: '#18181b', discount: '20% OFF', code: 'SAVE20NOW', subtext: 'Use at checkout', backgroundColor: '#f8fafc', borderColor: '#8b5cf6' } };
    case 'countdown':
      return { id, type: 'countdown', content: { deadline: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16), label: 'Limited Offer Ends In:', backgroundColor: '#0f172a', accentColor: '#8b5cf6' } };
    case 'qrCode':
      return { id, type: 'qrCode', content: { url: 'https://example.com', size: 140, caption: 'Scan code', align: 'center' } };
    case 'poll':
      return { id, type: 'poll', content: { question: 'How satisfied are you?', align: 'center', options: [{ emoji: '😍', label: 'Very Satisfied', url: '#' }, { emoji: '🙂', label: 'Satisfied', url: '#' }] } };
    case 'conditional':
      return { id, type: 'conditional', content: { condition: "user.plan === 'pro'", ifTrueContent: '🎉 Pro Member Offer: 50% Off!', ifFalseContent: '⚡ Upgrade to Pro today!' } };
    default:
      return { id, type: 'heading', content: { text: 'New Block', tag: 'h2', fontSize: 24, fontWeight: '700', color: '#18181b', align: 'left', letterSpacing: 0, lineHeight: 1.3 } };
  }
}

export function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'RESET_TEMPLATE':
      return {
        ...state,
        past: [],
        present: {
          ...initialTemplateData,
          name: 'Untitled Template',
          sections: [],
        },
        future: [],
        selectedId: null,
        hasUnsavedChanges: false,
        saveStatus: 'saved',
      };

    case 'UNDO': {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, state.past.length - 1);
      return {
        ...state,
        past: newPast,
        present: previous,
        future: [state.present, ...state.future],
        hasUnsavedChanges: true,
        saveStatus: 'unsaved',
      };
    }

    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        ...state,
        past: [...state.past, state.present],
        present: next,
        future: newFuture,
        hasUnsavedChanges: true,
        saveStatus: 'unsaved',
      };
    }

    case 'MARK_SAVED':
      return {
        ...state,
        hasUnsavedChanges: false,
        saveStatus: 'saved',
      };

    case 'MARK_AUTOSAVED':
      return {
        ...state,
        saveStatus: 'autosaved',
      };

    case 'SELECT_ITEM':
      return {
        ...state,
        selectedId: action.selection,
      };

    default: {
      const nextPast = [...state.past, JSON.parse(JSON.stringify(state.present))];
      if (nextPast.length > MAX_HISTORY) nextPast.shift();

      let newPresent: TemplateData = state.present;
      let newSelection = state.selectedId;

      switch (action.type) {
        case 'SET_NAME':
          newPresent = { ...state.present, name: action.name };
          break;

        case 'SET_THEME':
          newPresent = {
            ...state.present,
            globalTheme: { ...state.present.globalTheme, ...action.theme },
          };
          break;

        case 'LOAD_TEMPLATE':
          newPresent = action.template;
          newSelection = null;
          break;

        case 'ADD_SECTION': {
          const secId = `sec_${Date.now()}`;
          const colsCount = action.columnsCount || 1;
          const colWidth = `${(100 / colsCount).toFixed(2)}%`;
          const newColumns: ColumnData[] = Array.from({ length: colsCount }, (_, i) => ({
            id: `col_${secId}_${i + 1}`,
            width: colWidth,
            components: [],
          }));

          const newSection: SectionData = {
            id: secId,
            background: '#ffffff',
            padding: '24px 20px',
            columns: newColumns,
          };

          newPresent = {
            ...state.present,
            sections: [...state.present.sections, newSection],
          };
          newSelection = { type: 'section', id: secId };
          break;
        }

        case 'UPDATE_SECTION': {
          newPresent = {
            ...state.present,
            sections: state.present.sections.map((sec: SectionData) =>
              sec.id === action.sectionId ? { ...sec, ...action.updates } : sec
            ),
          };
          break;
        }

        case 'DELETE_SECTION': {
          newPresent = {
            ...state.present,
            sections: state.present.sections.filter((sec: SectionData) => sec.id !== action.sectionId),
          };
          if (state.selectedId?.id === action.sectionId) {
            newSelection = null;
          }
          break;
        }

        case 'MOVE_SECTION': {
          const idx = state.present.sections.findIndex((s: SectionData) => s.id === action.sectionId);
          if (idx < 0) break;
          const targetIdx = action.direction === 'up' ? idx - 1 : idx + 1;
          if (targetIdx < 0 || targetIdx >= state.present.sections.length) break;

          const updatedSecs = [...state.present.sections];
          const [moved] = updatedSecs.splice(idx, 1);
          updatedSecs.splice(targetIdx, 0, moved);

          newPresent = { ...state.present, sections: updatedSecs };
          break;
        }

        case 'DUPLICATE_SECTION': {
          const sec = state.present.sections.find((s: SectionData) => s.id === action.sectionId);
          if (!sec) break;
          const clonedSec: SectionData = JSON.parse(JSON.stringify(sec));
          const newSecId = `sec_${Date.now()}`;
          clonedSec.id = newSecId;
          clonedSec.columns.forEach((col: ColumnData, cIdx: number) => {
            col.id = `col_${newSecId}_${cIdx + 1}`;
            col.components.forEach((comp: BuilderBlock) => {
              comp.id = `${comp.type}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            });
          });

          const secIdx = state.present.sections.findIndex((s: SectionData) => s.id === action.sectionId);
          const newSecs = [...state.present.sections];
          newSecs.splice(secIdx + 1, 0, clonedSec);

          newPresent = { ...state.present, sections: newSecs };
          newSelection = { type: 'section', id: newSecId };
          break;
        }

        case 'ADD_COLUMN': {
          newPresent = {
            ...state.present,
            sections: state.present.sections.map((sec: SectionData) => {
              if (sec.id !== action.sectionId) return sec;
              const newColId = `col_${sec.id}_${sec.columns.length + 1}`;
              const updatedCols = [...sec.columns, { id: newColId, width: '50%', components: [] }];
              const colWidth = `${(100 / updatedCols.length).toFixed(2)}%`;
              return {
                ...sec,
                columns: updatedCols.map((c: ColumnData) => ({ ...c, width: colWidth })),
              };
            }),
          };
          break;
        }

        case 'REMOVE_COLUMN': {
          newPresent = {
            ...state.present,
            sections: state.present.sections.map((sec: SectionData) => {
              if (sec.id !== action.sectionId || sec.columns.length <= 1) return sec;
              const updatedCols = sec.columns.filter((c: ColumnData) => c.id !== action.columnId);
              const colWidth = `${(100 / updatedCols.length).toFixed(2)}%`;
              return {
                ...sec,
                columns: updatedCols.map((c: ColumnData) => ({ ...c, width: colWidth })),
              };
            }),
          };
          break;
        }

        case 'UPDATE_COLUMN': {
          newPresent = {
            ...state.present,
            sections: state.present.sections.map((sec: SectionData) => {
              if (sec.id !== action.sectionId) return sec;
              return {
                ...sec,
                columns: sec.columns.map((col: ColumnData) =>
                  col.id === action.columnId ? { ...col, ...action.updates } : col
                ),
              };
            }),
          };
          break;
        }

        case 'ADD_BLOCK': {
          const newBlock = createBlockInstance(action.blockType);
          newPresent = {
            ...state.present,
            sections: state.present.sections.map((sec: SectionData) => {
              if (sec.id !== action.sectionId) return sec;
              return {
                ...sec,
                columns: sec.columns.map((col: ColumnData) => {
                  if (col.id !== action.columnId) return col;
                  return { ...col, components: [...col.components, newBlock] };
                }),
              };
            }),
          };
          newSelection = { type: 'block', id: newBlock.id };
          break;
        }

        case 'UPDATE_BLOCK': {
          newPresent = {
            ...state.present,
            sections: state.present.sections.map((sec: SectionData) => ({
              ...sec,
              columns: sec.columns.map((col: ColumnData) => ({
                ...col,
                components: col.components.map((comp: BuilderBlock) =>
                  comp.id === action.blockId
                    ? { ...comp, content: action.updatedContent }
                    : comp
                ),
              })),
            })),
          };
          break;
        }

        case 'DELETE_BLOCK': {
          newPresent = {
            ...state.present,
            sections: state.present.sections.map((sec: SectionData) => ({
              ...sec,
              columns: sec.columns.map((col: ColumnData) => ({
                ...col,
                components: col.components.filter((comp: BuilderBlock) => comp.id !== action.blockId),
              })),
            })),
          };
          if (state.selectedId?.id === action.blockId) {
            newSelection = null;
          }
          break;
        }

        case 'MOVE_BLOCK': {
          newPresent = {
            ...state.present,
            sections: state.present.sections.map((sec: SectionData) => ({
              ...sec,
              columns: sec.columns.map((col: ColumnData) => {
                const bIdx = col.components.findIndex((c: BuilderBlock) => c.id === action.blockId);
                if (bIdx < 0) return col;
                const targetIdx = action.direction === 'up' ? bIdx - 1 : bIdx + 1;
                if (targetIdx < 0 || targetIdx >= col.components.length) return col;

                const updatedComps = [...col.components];
                const [moved] = updatedComps.splice(bIdx, 1);
                updatedComps.splice(targetIdx, 0, moved);

                return { ...col, components: updatedComps };
              }),
            })),
          };
          break;
        }

        case 'DUPLICATE_BLOCK': {
          let duplicatedId = '';
          newPresent = {
            ...state.present,
            sections: state.present.sections.map((sec: SectionData) => ({
              ...sec,
              columns: sec.columns.map((col: ColumnData) => {
                const bIdx = col.components.findIndex((c: BuilderBlock) => c.id === action.blockId);
                if (bIdx < 0) return col;
                const orig = col.components[bIdx];
                const cloned: BuilderBlock = JSON.parse(JSON.stringify(orig));
                cloned.id = `${cloned.type}_${Date.now()}`;
                duplicatedId = cloned.id;

                const updatedComps = [...col.components];
                updatedComps.splice(bIdx + 1, 0, cloned);
                return { ...col, components: updatedComps };
              }),
            })),
          };
          if (duplicatedId) {
            newSelection = { type: 'block', id: duplicatedId };
          }
          break;
        }
      }

      return {
        ...state,
        past: nextPast,
        present: newPresent,
        future: [],
        selectedId: newSelection,
        hasUnsavedChanges: true,
        saveStatus: 'unsaved',
      };
    }
  }
}
