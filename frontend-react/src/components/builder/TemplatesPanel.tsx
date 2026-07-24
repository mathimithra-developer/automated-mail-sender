import React, { useState, useEffect } from 'react';
import { TemplateData } from './types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Layout, Clock, Play, Trash2 } from 'lucide-react';

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

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
  onLoadTemplate,
  currentTemplateId,
}) => {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplateToLoad, setSelectedTemplateToLoad] = useState<TemplateItem | null>(null);
  const [selectedTemplateToDelete, setSelectedTemplateToDelete] = useState<TemplateItem | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/templates?all=true');
      setTemplates(res.data || []);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to load templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleConfirmLoad = async () => {
    if (!selectedTemplateToLoad) return;
    try {
      const res = await api.get(`/api/templates/${selectedTemplateToLoad._id}`);
      if (res.data) {
        let jsonData = res.data.jsonData;
        if (!jsonData) {
          // Fallback if template doesn't have jsonData (e.g. seeded templates)
          jsonData = {
            name: res.data.name || 'Loaded Template',
            version: '2.0',
            globalTheme: {
              fontFamily: 'Inter, sans-serif',
              backgroundColor: '#f8fafc',
              textColor: '#18181b',
              linkColor: '#2563eb',
              buttonColor: '#2563eb',
              pageBackgroundColor: '#f3f4f6',
              bodyBackgroundColor: '#ffffff',
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
                id: `sec_${Date.now()}`,
                background: '#ffffff',
                padding: '24px 20px',
                columns: [
                  {
                    id: `col_${Date.now()}`,
                    width: '100%',
                    components: [
                      {
                        id: `html_${Date.now()}`,
                        type: 'html',
                        content: {
                          html: res.data.htmlContent || '<p>Blank template</p>',
                        },
                      },
                    ],
                  },
                ],
              },
            ],
            tracking: { openTracking: true, clickTracking: true },
            metadata: {
              aiPrompt: '',
              category: res.data.category || 'marketing',
              subject: res.data.subject || '',
              preheader: res.data.preheader || '',
            },
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
            Saved Templates
          </h4>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#64748b' }}>
          Load or delete existing saved templates in your library
        </p>
      </div>

      {/* Templates List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: 13 }}>
            Loading templates...
          </div>
        ) : templates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: 13 }}>
            No saved templates found.
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

      {/* Load Template Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(selectedTemplateToLoad)}
        title="Load Template"
        message={`Load '${selectedTemplateToLoad?.name}'? Current canvas will be replaced.`}
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
