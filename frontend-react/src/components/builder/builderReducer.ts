import { TemplateData, SectionData, ColumnData, BuilderBlock } from './types';
import { htmlToSections } from './htmlToBuilderBlocks';

export interface BuilderState {
  past: TemplateData[];
  present: TemplateData;
  future: TemplateData[];
  selectedId: { type: 'section' | 'column' | 'block'; id: string } | null;
  clipboardBlock: BuilderBlock | null;
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
  | { type: 'ADD_BLOCK'; sectionId: string; columnId: string; blockType: BuilderBlock['type']; targetIndex?: number }
  | { type: 'UPDATE_BLOCK'; blockId: string; updatedContent: any }
  | { type: 'DELETE_BLOCK'; blockId: string }
  | { type: 'MOVE_BLOCK'; blockId: string; direction: 'up' | 'down' }
  | { type: 'MOVE_BLOCK_TO_COLUMN'; blockId: string; targetSectionId: string; targetColumnId: string; targetIndex?: number }
  | {
      type: 'SPLIT_SECTION_WITH_BLOCK';
      sectionId: string;
      targetColumnId: string;
      position: 'left' | 'right';
      blockType?: BuilderBlock['type'];
      blockId?: string;
    }
  | { type: 'DUPLICATE_BLOCK'; blockId: string }
  | { type: 'TOGGLE_LOCK_BLOCK'; blockId: string }
  | { type: 'COPY_BLOCK'; blockId: string }
  | { type: 'PASTE_BLOCK' }
  | { type: 'SET_THEME'; theme: Partial<TemplateData['globalTheme']> }
  | { type: 'SET_NAME'; name: string }
  | { type: 'LOAD_TEMPLATE'; template: TemplateData }
  | {
      type: 'RESTORE_FULL_SESSION';
      present: TemplateData;
      past?: TemplateData[];
      future?: TemplateData[];
      selectedId?: BuilderState['selectedId'];
    }
  | { type: 'SELECT_ITEM'; selection: BuilderState['selectedId'] }
  | { type: 'MARK_SAVED' }
  | { type: 'MARK_AUTOSAVED' }
  | { type: 'RESET_TEMPLATE' }
  | { type: 'APPEND_AI_HTML_BLOCK'; html: string }
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
                backgroundColor: '#2563eb',
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
  clipboardBlock: null,
  hasUnsavedChanges: false,
  saveStatus: 'saved',
};

const MAX_HISTORY = 50;

export function createBlockInstance(type: BuilderBlock['type']): BuilderBlock {
  const id = `${type}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  switch (type) {
    case 'logo':
      return { id, type: 'logo', content: { url: 'https://via.placeholder.com/150x40?text=Company+Logo', alt: 'Company Logo', linkUrl: 'https://example.com', maxWidth: 160, align: 'center', paddingY: 12 } };
    case 'greeting':
      return { id, type: 'greeting', content: { greeting: 'Hello', variable: 'customer.firstName', emoji: '👋', fontSize: 20, color: '#0f172a', align: 'left' } };
    case 'heading':
      return { id, type: 'heading', content: { text: '✨ New Feature Release', tag: 'h2', fontSize: 26, fontWeight: '700', color: '#18181b', align: 'center', letterSpacing: 0, lineHeight: 1.3, fontFamily: 'inherit' } };
    case 'text':
      return { id, type: 'text', content: { text: 'Enter simple inline text here.', fontSize: 14, color: '#334155', align: 'left', fontFamily: 'inherit', fontWeight: '400', lineHeight: 1.5 } };
    case 'paragraph':
      return { id, type: 'paragraph', content: { text: 'Write your content here. Double-click or use the inspector to format text.', fontSize: 15, color: '#334155', align: 'left', lineHeight: 1.6, fontFamily: 'inherit' } };
    case 'button':
      return { id, type: 'button', content: { label: 'Click Here', url: '#', backgroundColor: '#2563eb', color: '#ffffff', borderRadius: 6, align: 'center', paddingX: 24, paddingY: 12, shadow: true, size: 'medium', variant: 'solid' } };
    case 'dualButton':
      return { id, type: 'dualButton', content: { primaryLabel: 'Get Started', primaryUrl: '#', primaryBg: '#2563eb', primaryColor: '#ffffff', secondaryLabel: 'Learn More', secondaryUrl: '#', secondaryBg: '#f1f5f9', secondaryColor: '#334155', align: 'center' } };
    case 'image':
      return { id, type: 'image', content: { url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80', alt: 'Image', linkUrl: '', borderRadius: 8, align: 'center', shadow: true, caption: '' } };
    case 'heroBanner':
      return { id, type: 'heroBanner', content: { imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1000&auto=format&fit=crop&q=80', title: 'Transform Your Business Today', subtitle: 'Powerful tools for modern growth and automation', ctaLabel: 'Get Started Free', ctaUrl: '#', ctaColor: '#2563eb', overlayColor: 'rgba(15, 23, 42, 0.65)', align: 'center', height: 320 } };
    case 'divider':
      return { id, type: 'divider', content: { style: 'solid', thickness: 1, color: '#e2e8f0', paddingTop: 16, paddingBottom: 16 } };
    case 'spacer':
      return { id, type: 'spacer', content: { height: 32 } };
    case 'video':
      return { id, type: 'video', content: { thumbnailUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80', videoUrl: 'https://youtube.com', alt: 'Video', borderRadius: 8 } };
    case 'emojiRow':
      return { id, type: 'emojiRow', content: { emoji: '🚀', text: '', size: 28, align: 'center' } };
    case 'callout':
      return { id, type: 'callout', content: { icon: '🚀', title: 'New Feature Announcement', description: 'Copy and paste nodes instantly across all campaign workflows.', ctaLabel: 'Learn More', ctaUrl: '#', bgColor: '#eff6ff', borderColor: '#bfdbfe', accentColor: '#2563eb' } };
    case 'infoCard':
      return { id, type: 'infoCard', content: { icon: '💡', title: 'Pro Tip for Creators', description: 'Personalized subject lines increase click rates by 26%.', buttonLabel: 'Read Guide', buttonUrl: '#', bgColor: '#f8fafc', align: 'center' } };
    case 'featureCard':
      return { id, type: 'featureCard', content: { icon: '⚡', title: 'Instant Delivery', description: 'Reach thousands of recipients in seconds with 99.9% uptime.', ctaLabel: 'View Specs', ctaUrl: '#', bgColor: '#ffffff', borderColor: '#e2e8f0' } };
    case 'multiFeature':
      return { id, type: 'multiFeature', content: { columns: 3, items: [{ icon: '🚀', title: 'Fast Setup', description: 'Ready in under 2 mins' }, { icon: '🔒', title: 'Secure & Encrypted', description: 'Enterprise privacy standard' }, { icon: '📊', title: 'Real-time Analytics', description: 'Detailed open & click rates' }] } };
    case 'benefitsList':
      return { id, type: 'benefitsList', content: { icon: '✅', iconColor: '#10b981', items: ['No setup fee or credit card required', 'Unlimited automated campaign flows', '24/7 Priority support hotline'], fontSize: 14 } };
    case 'bulletList':
      return { id, type: 'bulletList', content: { bulletStyle: 'check', bulletColor: '#2563eb', items: ['Automated email triggers', 'Dynamic subscriber segmentation', 'Custom domain authentication'], fontSize: 14 } };
    case 'numberedSteps':
      return { id, type: 'numberedSteps', content: { steps: [{ stepNumber: 1, title: 'Connect CSV Audience', description: 'Upload your recipient list file' }, { stepNumber: 2, title: 'Customize Content', description: 'Use rich drag-and-drop elements' }, { stepNumber: 3, title: 'Launch Campaign', description: 'Schedule or send instantly' }], accentColor: '#2563eb' } };
    case 'timeline':
      return { id, type: 'timeline', content: { events: [{ date: 'Q1 2026', title: 'Mail Builder 2.0 Launch', description: 'Introducing modular block design' }, { date: 'Q2 2026', title: 'WhatsApp Integration', description: 'Multi-channel messaging hub' }], accentColor: '#2563eb' } };
    case 'quote':
      return { id, type: 'quote', content: { quote: 'This builder completely transformed our newsletter engagement and saved us 10+ hours every week.', author: 'Sarah Jenkins', role: 'Head of Marketing at Acme Corp', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', bgColor: '#f8fafc', accentColor: '#2563eb' } };
    case 'faqAccordion':
      return { id, type: 'faqAccordion', content: { items: [{ question: 'How do I customize the template?', answer: 'Click on any section or block to customize text, colors, fonts, and links.' }, { question: 'Are emails responsive on mobile?', answer: 'Yes! All blocks automatically scale cleanly on mobile devices.' }], bgColor: '#ffffff', borderColor: '#e2e8f0' } };
    case 'social':
      return { id, type: 'social', content: { iconSize: 24, align: 'center', iconColor: '#2563eb', links: [{ platform: 'twitter', url: '#' }, { platform: 'linkedin', url: '#' }, { platform: 'instagram', url: '#' }, { platform: 'youtube', url: '#' }] } };
    case 'footer':
      return { id, type: 'footer', content: { companyName: 'Acme Technologies Inc.', address: '123 Business Way, Suite 400, San Francisco, CA 94107', unsubscribeUrl: '{{unsubscribe_link}}', privacyUrl: '#', copyrightText: '© 2026 Acme Inc. All rights reserved.', textColor: '#64748b', align: 'center' } };
    case 'signature':
      return { id, type: 'signature', content: { name: 'David Miller', role: 'Founder & CEO', company: 'MailFlow Platform', email: 'david@example.com', phone: '+1 (800) 555-0199', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80', accentColor: '#2563eb' } };
    case 'pricingCard':
      return { id, type: 'pricingCard', content: { planName: 'Pro Plan', price: '$49', period: '/month', features: ['Unlimited Campaigns', 'Advanced AI Assistant', 'Priority Email Support', 'Custom Branding'], ctaLabel: 'Upgrade Now', ctaUrl: '#', isPopular: true, bgColor: '#ffffff', accentColor: '#2563eb' } };
    case 'container':
      return { id, type: 'container', content: { title: 'Container Box Title', description: 'Group content inside a styled container card.', bgColor: '#f8fafc', borderColor: '#cbd5e1', borderRadius: 12, padding: 20 } };
    case 'alertBox':
      return { id, type: 'alertBox', content: { variant: 'info', title: 'System Notice', message: 'Scheduled maintenance will take place on Sunday at 2 AM UTC.' } };
    case 'code':
      return { id, type: 'code', content: { code: 'const sendMail = async (user) => {\n  await api.dispatch({ to: user.email });\n};', language: 'javascript', bgColor: '#0f172a', textColor: '#38bdf8' } };
    case 'variable':
      return { id, type: 'variable', content: { variableName: 'customer.firstName', fallback: 'Valued Customer', label: 'First Name', align: 'left' } };
    case 'buttonCard':
      return { id, type: 'buttonCard', content: { icon: '🎯', heading: 'Ready to Get Started?', description: 'Join over 10,000+ businesses using our email automation tool.', ctaLabel: 'Create Account Now', ctaUrl: '#', bgColor: '#f0f6ff', accentColor: '#2563eb' } };
    case 'highlightBox':
      return { id, type: 'highlightBox', content: { icon: '⭐', heading: 'VIP Subscriber Perk', text: 'Enjoy early access to our annual product sale before anyone else.', ctaLabel: 'Claim VIP Perk', ctaUrl: '#', bgColor: '#2563eb', textColor: '#ffffff' } };
    case 'checklist':
      return { id, type: 'checklist', content: { title: 'Pre-launch Checklist', items: [{ text: 'Upload contact list CSV', checked: true }, { text: 'Map personalization variables', checked: true }, { text: 'Send test preview email', checked: false }], checkColor: '#10b981' } };
    case 'iconText':
      return { id, type: 'iconText', content: { icon: '⚡', iconColor: '#2563eb', heading: 'Lightning Fast Setup', description: 'Get your campaigns launched in minutes without coding.', align: 'left' } };
    case 'badge':
      return { id, type: 'badge', content: { text: 'NEW RELEASE', bgColor: '#dcfce7', textColor: '#15803d', size: 'medium', align: 'center' } };
    case 'statistics':
      return { id, type: 'statistics', content: { stats: [{ label: 'Active Users', value: '500K+' }, { label: 'Deliverability', value: '99.9%' }, { label: 'Support Rate', value: '5 Stars' }], bgColor: '#f8fafc', accentColor: '#2563eb' } };
    case 'newsletterHeader':
      return { id, type: 'newsletterHeader', content: { logoUrl: '', title: 'Weekly SaaS Digest', subtitle: 'Curated insights for tech founders & marketers', issueDate: 'Issue #42 • July 2026', bgColor: '#ffffff', accentColor: '#2563eb' } };
    case 'bannerCta':
      return { id, type: 'bannerCta', content: { headline: 'Unlock 30% Discount Today', subheadline: 'Upgrade your subscription before the end of the month', ctaLabel: 'Claim Discount', ctaUrl: '#', imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80', bgColor: '#0f172a' } };
    case 'html':
      return { id, type: 'html', content: { html: '<div style="padding:16px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;text-align:center;">Custom HTML Content</div>' } };
    case 'menu':
      return { id, type: 'menu', content: { align: 'center', color: '#2563eb', fontSize: 14, separator: '|', links: [{ label: 'Home', url: '#' }, { label: 'Shop', url: '#' }, { label: 'Contact', url: '#' }] } };
    case 'table':
      return { id, type: 'table', content: { headerBg: '#f1f5f9', headerTextColor: '#0f172a', stripedRows: true, borderColor: '#cbd5e1', headers: ['Item', 'Quantity', 'Price'], rows: [['Plan A', '1', '$29.00'], ['Plan B', '2', '$58.00']] } };
    case 'icons':
      return { id, type: 'icons', content: { iconSize: 24, align: 'center', iconColor: '#2563eb', icons: [{ name: 'shield' }, { name: 'truck' }, { name: 'gift' }] } };
    case 'rating':
      return { id, type: 'rating', content: { maxStars: 5, ratingValue: 4.5, url: '#', color: '#f59e0b', size: 24, align: 'center' } };
    case 'productCard':
      return { id, type: 'productCard', content: { imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', title: 'Wireless Headphones', price: '$199.00', oldPrice: '$249.00', description: 'Active noise cancellation headphones.', ctaLabel: 'Shop Now', ctaUrl: '#', ctaColor: '#2563eb', borderRadius: 10 } };
    case 'productGrid':
      return { id, type: 'productGrid', content: { columns: 2, products: [{ imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80', title: 'Watch', price: '$120.00', linkUrl: '#' }, { imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80', title: 'Sneakers', price: '$85.00', linkUrl: '#' }] } };
    case 'coupon':
      return { id, type: 'coupon', content: { headline: 'SPECIAL PROMO DISCOUNT', headlineColor: '#18181b', discount: '20% OFF', code: 'SAVE20NOW', subtext: 'Use at checkout', backgroundColor: '#f8fafc', borderColor: '#2563eb' } };
    case 'countdown':
      return { id, type: 'countdown', content: { deadline: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16), label: 'Limited Offer Ends In:', backgroundColor: '#0f172a', accentColor: '#2563eb' } };
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

    case 'COPY_BLOCK': {
      let blockToCopy: BuilderBlock | null = null;
      for (const sec of state.present.sections) {
        for (const col of sec.columns) {
          const found = col.components.find(c => c.id === action.blockId);
          if (found) {
            blockToCopy = JSON.parse(JSON.stringify(found));
            break;
          }
        }
      }
      return {
        ...state,
        clipboardBlock: blockToCopy,
      };
    }

    case 'PASTE_BLOCK': {
      if (!state.clipboardBlock) return state;
      const cloned: BuilderBlock = JSON.parse(JSON.stringify(state.clipboardBlock));
      cloned.id = `${cloned.type}_${Date.now()}`;
      cloned.isLocked = false;

      let pasted = false;
      let newSelection = state.selectedId;

      const updatedSections = state.present.sections.map((sec) => ({
        ...sec,
        columns: sec.columns.map((col) => {
          if (pasted) return col;
          const idx = col.components.findIndex((c) => c.id === state.selectedId?.id);
          if (idx >= 0) {
            pasted = true;
            newSelection = { type: 'block', id: cloned.id };
            const updated = [...col.components];
            updated.splice(idx + 1, 0, cloned);
            return { ...col, components: updated };
          }
          return col;
        }),
      }));

      if (!pasted) {
        const lastSec = updatedSections[updatedSections.length - 1];
        if (lastSec && lastSec.columns.length > 0) {
          const lastCol = lastSec.columns[lastSec.columns.length - 1];
          lastCol.components.push(cloned);
          newSelection = { type: 'block', id: cloned.id };
        }
      }

      return {
        ...state,
        past: [...state.past, JSON.parse(JSON.stringify(state.present))],
        present: { ...state.present, sections: updatedSections },
        selectedId: newSelection,
        hasUnsavedChanges: true,
        saveStatus: 'unsaved',
      };
    }

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
          return {
            ...state,
            past: [],
            present: action.template,
            future: [],
            selectedId: null,
            hasUnsavedChanges: false,
            saveStatus: 'saved',
          };

        case 'RESTORE_FULL_SESSION':
          return {
            ...state,
            present: action.present,
            past: Array.isArray(action.past) ? action.past : [],
            future: Array.isArray(action.future) ? action.future : [],
            selectedId: action.selectedId || null,
            hasUnsavedChanges: true,
            saveStatus: 'autosaved',
          };

        case 'APPEND_AI_HTML_BLOCK': {
          const generatedSections = htmlToSections(action.html);
          if (generatedSections.length === 0) break;

          const firstBlockId = generatedSections[0]?.columns[0]?.components[0]?.id;
          newPresent = {
            ...state.present,
            sections: [...state.present.sections, ...generatedSections],
          };
          if (firstBlockId) {
            newSelection = { type: 'block', id: firstBlockId };
          }
          break;
        }

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
              comp.isLocked = false;
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
                  const newComps = [...col.components];
                  if (typeof action.targetIndex === 'number') {
                    newComps.splice(action.targetIndex, 0, newBlock);
                  } else {
                    newComps.push(newBlock);
                  }
                  return { ...col, components: newComps };
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
                components: col.components.map((comp: BuilderBlock) => {
                  if (comp.id !== action.blockId) return comp;
                  // If block is locked, prevent updating content unless unlocking
                  if (comp.isLocked) return comp;
                  return { ...comp, content: action.updatedContent };
                }),
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
                components: col.components.filter((comp: BuilderBlock) => {
                  if (comp.id === action.blockId && comp.isLocked) {
                    return true; // Locked block cannot be deleted
                  }
                  return comp.id !== action.blockId;
                }),
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
                const targetComp = col.components[bIdx];
                if (targetComp.isLocked) return col; // Locked block cannot be moved

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

        case 'MOVE_BLOCK_TO_COLUMN': {
          const { blockId, targetSectionId, targetColumnId, targetIndex } = action;
          let blockToMove: BuilderBlock | null = null;
          
          const updatedSections = state.present.sections.map((section: SectionData) => {
            const updatedColumns = section.columns.map((col: ColumnData) => {
              const bIdx = col.components.findIndex((b: BuilderBlock) => b.id === blockId);
              if (bIdx > -1) {
                if (col.components[bIdx].isLocked) return col;
                const newComps = [...col.components];
                const [moved] = newComps.splice(bIdx, 1);
                blockToMove = moved;
                return { ...col, components: newComps };
              }
              return col;
            });
            return { ...section, columns: updatedColumns };
          });

          if (!blockToMove) {
            newPresent = state.present;
            break;
          }

          const finalSections = updatedSections.map((section: SectionData) => {
            if (section.id !== targetSectionId) return section;
            const updatedColumns = section.columns.map((col: ColumnData) => {
              if (col.id !== targetColumnId) return col;
              const newComps = [...col.components];
              if (typeof targetIndex === 'number') {
                newComps.splice(targetIndex, 0, blockToMove!);
              } else {
                newComps.push(blockToMove!);
              }
              return { ...col, components: newComps };
            });
            return { ...section, columns: updatedColumns };
          });

          newPresent = {
            ...state.present,
            sections: finalSections,
          };
          break;
        }

        case 'SPLIT_SECTION_WITH_BLOCK': {
          const { sectionId, targetColumnId, position, blockType, blockId } = action;
          
          let blockToInsert: BuilderBlock | null = null;
          
          // 1. Resolve the block to insert
          if (blockType) {
            blockToInsert = createBlockInstance(blockType);
          } else if (blockId) {
            state.present.sections.forEach((sec: SectionData) => {
              sec.columns.forEach((col: ColumnData) => {
                const idx = col.components.findIndex((c: BuilderBlock) => c.id === blockId);
                if (idx > -1) {
                  blockToInsert = col.components[idx];
                }
              });
            });
          }
          
          if (!blockToInsert) {
            newPresent = state.present;
            break;
          }
          
          // 2. Perform removal if moving
          const cleanedSections = state.present.sections.map((sec: SectionData) => {
            return {
              ...sec,
              columns: sec.columns.map((col: ColumnData) => {
                if (blockId) {
                  const filtered = col.components.filter((c: BuilderBlock) => c.id !== blockId);
                  if (filtered.length !== col.components.length) {
                    return { ...col, components: filtered };
                  }
                }
                return col;
              })
            };
          });
          
          // 3. Create the new column containing the block
          const newColId = `col_${sectionId}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
          const newColumn: ColumnData = {
            id: newColId,
            width: '50%',
            components: [blockToInsert],
          };
          
          // 4. Insert new column relative to targetColumnId and recalculate widths
          newPresent = {
            ...state.present,
            sections: cleanedSections.map((sec: SectionData) => {
              if (sec.id !== sectionId) return sec;
              
              const targetIdx = sec.columns.findIndex((c: ColumnData) => c.id === targetColumnId);
              if (targetIdx < 0) return sec;
              
              const updatedCols = [...sec.columns];
              if (position === 'left') {
                updatedCols.splice(targetIdx, 0, newColumn);
              } else {
                updatedCols.splice(targetIdx + 1, 0, newColumn);
              }
              
              // Recalculate widths to be equal
              const colWidth = `${(100 / updatedCols.length).toFixed(2)}%`;
              return {
                ...sec,
                columns: updatedCols.map((c: ColumnData) => ({ ...c, width: colWidth })),
              };
            })
          };
          
          newSelection = { type: 'block', id: blockToInsert.id };
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
                if (orig.isLocked) return col; // Locked block cannot be duplicated

                const cloned: BuilderBlock = JSON.parse(JSON.stringify(orig));
                cloned.id = `${cloned.type}_${Date.now()}`;
                cloned.isLocked = false;
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

        case 'TOGGLE_LOCK_BLOCK': {
          newPresent = {
            ...state.present,
            sections: state.present.sections.map((sec) => ({
              ...sec,
              columns: sec.columns.map((col) => ({
                ...col,
                components: col.components.map((comp) =>
                  comp.id === action.blockId ? { ...comp, isLocked: !comp.isLocked } : comp
                ),
              })),
            })),
          };
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
