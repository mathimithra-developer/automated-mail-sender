import React, { useState, useEffect } from 'react';
import { TemplateData } from './types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Layout, Clock, Play, Trash2, Sparkles } from 'lucide-react';

interface TemplatesPanelProps {
  onLoadTemplate: (templateData: TemplateData, templateId: string) => void;
  currentTemplateId?: string;
}

interface TemplateItem {
  _id: string;
  name: string;
  subject: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// ── BUILT-IN STARTER TEMPLATES LIBRARIES ─────────────────────────────────────
const STARTER_TEMPLATES: { name: string; category: string; description: string; data: TemplateData }[] = [
  {
    name: 'Welcome Email',
    category: 'Onboarding',
    description: 'Warm greeting with hero banner, benefits list & CTA button',
    data: {
      name: 'Welcome Email',
      version: '2.0',
      globalTheme: { fontFamily: 'Inter, sans-serif', backgroundColor: '#f8fafc', textColor: '#18181b', linkColor: '#2563eb', buttonColor: '#2563eb', bodyBackgroundColor: '#ffffff', bodyWidth: 600, bodyPadding: 24, bodyBorderRadius: 16 },
      variables: [{ name: 'customer.firstName', fallback: 'there' }],
      tracking: { openTracking: true, clickTracking: true },
      metadata: { aiPrompt: '', category: 'onboarding', subject: 'Welcome to our community! 👋', preheader: '' },
      sections: [
        {
          id: 'sec_starter_welcome_1',
          background: '#ffffff',
          padding: '20px',
          columns: [
            {
              id: 'col_s1',
              width: '100%',
              components: [
                { id: 'b_welcome_logo', type: 'logo', content: { url: 'https://via.placeholder.com/150x40?text=BrandLogo', alt: 'Logo', linkUrl: '', maxWidth: 150, align: 'center', paddingY: 10 } },
                { id: 'b_welcome_greet', type: 'greeting', content: { greeting: 'Welcome aboard', variable: 'customer.firstName', emoji: '🎉', fontSize: 24, color: '#0f172a', align: 'center' } },
                { id: 'b_welcome_banner', type: 'heroBanner', content: { imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80', title: 'We are thrilled to have you here', subtitle: 'Explore powerful features to automate your communications', ctaLabel: 'Get Started Now', ctaUrl: '#', ctaColor: '#2563eb', overlayColor: 'rgba(15, 23, 42, 0.7)', align: 'center', height: 280 } },
                { id: 'b_welcome_benefits', type: 'benefitsList', content: { icon: '✅', iconColor: '#10b981', items: ['Access unlimited email campaigns', 'Create smart automated flow triggers', '24/7 dedicated customer support'], fontSize: 14 } },
                { id: 'b_welcome_btn', type: 'buttonCard', content: { icon: '🎯', heading: 'Complete Your Setup', description: 'Take 2 minutes to customize your profile and settings.', ctaLabel: 'Go to Dashboard', ctaUrl: '#', bgColor: '#f0f6ff', accentColor: '#2563eb' } },
                { id: 'b_welcome_footer', type: 'footer', content: { companyName: 'MailFlow Platform Inc.', address: '100 Tech Way, San Francisco, CA', unsubscribeUrl: '#', privacyUrl: '#', copyrightText: '© 2026 MailFlow Inc.', textColor: '#64748b', align: 'center' } },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    name: 'Newsletter Digest',
    category: 'Newsletter',
    description: 'Header, feature highlights, stat counter & footer',
    data: {
      name: 'Newsletter Digest',
      version: '2.0',
      globalTheme: { fontFamily: 'Inter, sans-serif', backgroundColor: '#f8fafc', textColor: '#18181b', linkColor: '#2563eb', buttonColor: '#2563eb', bodyBackgroundColor: '#ffffff', bodyWidth: 600, bodyPadding: 24, bodyBorderRadius: 16 },
      variables: [{ name: 'customer.firstName', fallback: 'Subscriber' }],
      tracking: { openTracking: true, clickTracking: true },
      metadata: { aiPrompt: '', category: 'newsletter', subject: 'Weekly SaaS & Tech Digest #42 🚀', preheader: '' },
      sections: [
        {
          id: 'sec_starter_news_1',
          background: '#ffffff',
          padding: '20px',
          columns: [
            {
              id: 'col_s2',
              width: '100%',
              components: [
                { id: 'b_news_hdr', type: 'newsletterHeader', content: { logoUrl: '', title: 'Weekly Tech Digest', subtitle: 'Handpicked insights for software builders & marketers', issueDate: 'Issue #42 • July 2026', bgColor: '#ffffff', accentColor: '#2563eb' } },
                { id: 'b_news_callout', type: 'callout', content: { icon: '🔥', title: 'Top Story: AI Automation Trends', description: 'Discover how modern teams leverage autonomous workflows to double output.', ctaLabel: 'Read Full Article', ctaUrl: '#', bgColor: '#eff6ff', borderColor: '#bfdbfe', accentColor: '#2563eb' } },
                { id: 'b_news_stats', type: 'statistics', content: { stats: [{ label: 'Active Readers', value: '120K+' }, { label: 'Avg Read Time', value: '4 mins' }, { label: 'User Rating', value: '4.9 ★' }], bgColor: '#f8fafc', accentColor: '#2563eb' } },
                { id: 'b_news_quote', type: 'quote', content: { quote: 'The single best weekly newsletter in tech right now.', author: 'Alex Rivera', role: 'CTO at CloudCorp', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', bgColor: '#f8fafc', accentColor: '#2563eb' } },
                { id: 'b_news_footer', type: 'footer', content: { companyName: 'Tech Digest Media', address: 'San Francisco, CA', unsubscribeUrl: '#', privacyUrl: '#', copyrightText: '© 2026 Tech Digest', textColor: '#64748b', align: 'center' } },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    name: 'Product Launch & Offer',
    category: 'Promotional',
    description: 'Countdown timer, promo coupon, multi-features & pricing card',
    data: {
      name: 'Product Launch & Offer',
      version: '2.0',
      globalTheme: { fontFamily: 'Inter, sans-serif', backgroundColor: '#f8fafc', textColor: '#18181b', linkColor: '#2563eb', buttonColor: '#2563eb', bodyBackgroundColor: '#ffffff', bodyWidth: 600, bodyPadding: 24, bodyBorderRadius: 16 },
      variables: [],
      tracking: { openTracking: true, clickTracking: true },
      metadata: { aiPrompt: '', category: 'promotional', subject: '⚡ Special Launch Offer: 30% OFF Limited Time!', preheader: '' },
      sections: [
        {
          id: 'sec_starter_offer_1',
          background: '#ffffff',
          padding: '20px',
          columns: [
            {
              id: 'col_s3',
              width: '100%',
              components: [
                { id: 'b_offer_badge', type: 'badge', content: { text: 'EXCLUSIVE LAUNCH OFFER', bgColor: '#fef3c7', textColor: '#d97706', size: 'medium', align: 'center' } },
                { id: 'b_offer_head', type: 'heading', content: { text: 'Introducing MailFlow Pro 2.0', tag: 'h1', fontSize: 28, fontWeight: '800', color: '#0f172a', align: 'center', letterSpacing: 0, lineHeight: 1.25 } },
                { id: 'b_offer_timer', type: 'countdown', content: { deadline: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16), label: 'Special Launch Price Ends In:', backgroundColor: '#0f172a', accentColor: '#2563eb' } },
                { id: 'b_offer_coupon', type: 'coupon', content: { headline: 'LIMITED TIME PROMO CODE', headlineColor: '#0f172a', discount: '30% OFF', code: 'LAUNCH30NOW', subtext: 'Apply coupon code during checkout', backgroundColor: '#f0f6ff', borderColor: '#2563eb' } },
                { id: 'b_offer_pricing', type: 'pricingCard', content: { planName: 'Pro Early Access', price: '$29', period: '/month (normally $49)', features: ['Unlimited Campaigns', 'Full Block Library', 'Priority 24/7 Support'], ctaLabel: 'Claim 30% Discount', ctaUrl: '#', isPopular: true, bgColor: '#ffffff', accentColor: '#2563eb' } },
              ],
            },
          ],
        },
      ],
    },
  },
];

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
  onLoadTemplate,
  currentTemplateId,
}) => {
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'starters' | 'saved'>('saved');
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplateToLoad, setSelectedTemplateToLoad] = useState<any>(null);
  const [selectedTemplateToDelete, setSelectedTemplateToDelete] = useState<TemplateItem | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/templates?all=true');
      setTemplates(res.data || []);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to load saved templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'saved') {
      fetchTemplates();
    }
  }, [activeSubTab]);

  const handleConfirmLoad = async () => {
    if (!selectedTemplateToLoad) return;

    // Check if loading built-in starter
    if (selectedTemplateToLoad.data) {
      onLoadTemplate(selectedTemplateToLoad.data, '');
      showToast('Loaded', `Starter template "${selectedTemplateToLoad.name}" loaded`, 'success');
      setSelectedTemplateToLoad(null);
      return;
    }

    // Otherwise load saved template from API
    try {
      const res = await api.get(`/api/templates/${selectedTemplateToLoad._id}`);
      if (res.data) {
        let jsonData = res.data.jsonData;
        if (!jsonData) {
          jsonData = {
            name: res.data.name || 'Loaded Template',
            version: '2.0',
            globalTheme: { fontFamily: 'Inter, sans-serif', backgroundColor: '#f8fafc', textColor: '#18181b', linkColor: '#2563eb', buttonColor: '#2563eb', bodyBackgroundColor: '#ffffff', bodyWidth: 600, bodyPadding: 24, bodyBorderRadius: 16 },
            variables: [],
            sections: [
              {
                id: `sec_${Date.now()}`,
                background: '#ffffff',
                padding: '24px 20px',
                columns: [{ id: `col_${Date.now()}`, width: '100%', components: [{ id: `html_${Date.now()}`, type: 'html', content: { html: res.data.htmlContent || '<p>Blank template</p>' } }] }],
              },
            ],
            tracking: { openTracking: true, clickTracking: true },
            metadata: { aiPrompt: '', category: res.data.category || 'marketing', subject: res.data.subject || '', preheader: res.data.preheader || '' },
          };
        }
        onLoadTemplate(jsonData, selectedTemplateToLoad._id);
        showToast('Loaded', `Template "${res.data.name}" loaded successfully`, 'success');
      }
    } catch (err: any) {
      showToast('Load Error', err.message || 'Failed to load template', 'error');
    } finally {
      setSelectedTemplateToLoad(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTemplateToDelete) return;
    try {
      await api.delete(`/api/templates/${selectedTemplateToDelete._id}`);
      showToast('Deleted', `Template "${selectedTemplateToDelete.name}" deleted`, 'success');
      setTemplates((prev) => prev.filter((t) => t._id !== selectedTemplateToDelete._id));
    } catch (err: any) {
      showToast('Delete Error', err.message || 'Failed to delete template', 'error');
    } finally {
      setSelectedTemplateToDelete(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 20px' }}>
      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layout size={18} style={{ color: '#2563eb' }} />
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
            Template Library
          </h4>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#64748b' }}>
          Select pre-built starter layouts or load your saved templates
        </p>
      </div>

      {/* Sub-navigation Tabs */}
      <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 6, padding: 2, gap: 2 }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('starters')}
          style={{
            flex: 1,
            border: 'none',
            background: activeSubTab === 'starters' ? '#ffffff' : 'transparent',
            color: activeSubTab === 'starters' ? '#2563eb' : '#64748b',
            fontWeight: 700,
            fontSize: 12,
            padding: '6px',
            borderRadius: 4,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Sparkles size={13} /> Starter Designs
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('saved')}
          style={{
            flex: 1,
            border: 'none',
            background: activeSubTab === 'saved' ? '#ffffff' : 'transparent',
            color: activeSubTab === 'saved' ? '#2563eb' : '#64748b',
            fontWeight: 700,
            fontSize: 12,
            padding: '6px',
            borderRadius: 4,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <Layout size={13} /> My Templates
        </button>
      </div>

      {/* SUB-TAB 1: STARTER TEMPLATES */}
      {activeSubTab === 'starters' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {STARTER_TEMPLATES.map((tmpl, idx) => (
            <div
              key={`starter-${idx}`}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{tmpl.name}</span>
                <span style={{ fontSize: 10, fontWeight: 700, background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 12 }}>{tmpl.category}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{tmpl.description}</p>
              <button
                type="button"
                onClick={() => setSelectedTemplateToLoad(tmpl)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: 4,
                }}
              >
                <Play size={12} fill="#ffffff" /> Load Starter Layout
              </button>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 2: SAVED USER TEMPLATES */}
      {activeSubTab === 'saved' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: 13 }}>
              Loading saved templates...
            </div>
          ) : templates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: 13 }}>
              No saved templates found. Use "Save Template" in the header to save designs.
            </div>
          ) : (
            templates.map((tmpl) => (
              <div
                key={tmpl._id}
                style={{
                  background: '#f8fafc',
                  border: tmpl._id === currentTemplateId ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0, marginRight: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tmpl.name}
                  </span>
                  <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {tmpl.updatedAt ? new Date(tmpl.updatedAt).toLocaleDateString() : 'Recently'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => setSelectedTemplateToLoad(tmpl)}
                    title="Load Template"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '5px 10px',
                      borderRadius: 6,
                      border: '1px solid #2563eb',
                      background: '#2563eb',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Play size={12} fill="#ffffff" /> Load
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTemplateToDelete(tmpl)}
                    title="Delete Template"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '6px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#ef4444',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Load Template Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(selectedTemplateToLoad)}
        title="Load Template"
        message={`Load '${selectedTemplateToLoad?.name}'? Current canvas content will be replaced.`}
        confirmLabel="Load Template"
        variant="primary"
        onConfirm={handleConfirmLoad}
        onCancel={() => setSelectedTemplateToLoad(null)}
      />

      {/* Delete Template Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(selectedTemplateToDelete)}
        title="Delete Template"
        message={`Are you sure you want to delete "${selectedTemplateToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setSelectedTemplateToDelete(null)}
      />
    </div>
  );
};
