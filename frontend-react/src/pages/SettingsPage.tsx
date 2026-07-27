import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, Save, Trash2, X, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { CustomField, OrgSettings } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();

  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination for Custom Fields
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [provider, setProvider] = useState('ses');
  const [senderName, setSenderName] = useState('Acme Corp');
  const [senderEmail, setSenderEmail] = useState('noreply@yourdomain.com');
  const [replyTo, setReplyTo] = useState('support@yourdomain.com');
  const [apiKey, setApiKey] = useState('');

  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');

  const [geminiKey, setGeminiKey] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldKey, setFieldKey] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [fieldHint, setFieldHint] = useState('');
  const [autoCreateSegment, setAutoCreateSegment] = useState(false);

  const totalFields = customFields.length;
  const totalPages = Math.ceil(totalFields / pageSize) || 1;
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFields);
  const paginatedFields = customFields.slice(startIndex, endIndex);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cfRes, setRes, segRes] = await Promise.all([
        api.get('/api/customfields').catch(() => ({ data: [] })),
        api.get('/api/settings').catch(() => ({ data: null })),
        api.get('/api/segments').catch(() => ({ data: [] })),
      ]);

      const segments = segRes.data || [];
      const fieldsWithLink = (cfRes.data || []).map((cf: any) => {
        const fieldKey = cf.name || cf.key || cf.label?.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const linkedSeg = cf.linkedSegment || segments.find((s: any) =>
          s.name === `${cf.label} Segment` ||
          s.conditions?.some((c: any) => c.attrKey === fieldKey || c.field === fieldKey)
        );
        return {
          ...cf,
          linkedSegment: linkedSeg ? { id: linkedSeg._id || linkedSeg.id, name: linkedSeg.name } : null,
        };
      });

      setCustomFields(fieldsWithLink);

      if (setRes.data) {
        const s = setRes.data;
        setProvider(s.provider || 'ses');
        setSenderName(s.senderName || 'Acme Corp');
        setSenderEmail(s.senderEmail || 'noreply@yourdomain.com');
        setReplyTo(s.replyTo || 'support@yourdomain.com');
      }
    } catch (err: any) {
      showToast('Error loading settings', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/api/settings', {
        provider,
        senderName,
        senderEmail,
        replyTo,
        apiKey,
        smtpHost,
        smtpPort: Number(smtpPort),
        smtpUser,
        smtpPass,
      });
      showToast('Settings Saved', 'Email configuration updated', 'success');
    } catch (err: any) {
      showToast('Error saving settings', err.message, 'error');
    }
  };

  const handleSendTestEmail = async () => {
    try {
      await api.post('/api/settings/test-email', { email: senderEmail });
      showToast('Test Sent', `Test email dispatched to ${senderEmail}`, 'success');
    } catch (err: any) {
      showToast('Test Failed', err.message, 'error');
    }
  };

  const handleSaveGeminiKey = async () => {
    try {
      await api.post('/api/settings/gemini-key', { key: geminiKey });
      showToast('Saved', 'Gemini API Key saved successfully', 'success');
    } catch (err: any) {
      showToast('Error saving key', err.message, 'error');
    }
  };

  const handleAddCustomField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldLabel || !fieldKey) return;
    try {
      const res = await api.post('/api/customfields', {
        label: fieldLabel,
        name: fieldKey,
        dataType: fieldType,
        hint: fieldHint,
        autoCreateSegment,
      });
      if (res.linkedSegment) {
        showToast(
          'Custom Field & Segment Created',
          `Field "${fieldLabel}" and linked segment "${res.linkedSegment.name}" created successfully.`,
          'success'
        );
      } else {
        showToast('Created', 'Custom field added successfully', 'success');
      }
      window.dispatchEvent(new CustomEvent('segments-updated'));
      setShowModal(false);
      setFieldLabel('');
      setFieldKey('');
      setFieldHint('');
      setAutoCreateSegment(false);
      setPage(1);
      loadData();
    } catch (err: any) {
      showToast('Error creating custom field', err.message, 'error');
    }
  };

  const handleDeleteCustomField = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/api/customfields/${deleteConfirmId}`);
      showToast('Deleted', 'Custom field removed', 'success');
      if (paginatedFields.length === 1 && safePage > 1) {
        setPage(safePage - 1);
      }
      loadData();
    } catch (err: any) {
      showToast('Error deleting field', err.message, 'error');
    }
  };

  return (
    <section className="page active" id="settings">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Settings</h1>
          <p className="page-description">Configure email provider, sender details, custom fields, and API keys.</p>
        </div>
      </div>

      {/* Custom Fields Manager */}
      <div className="settings-section" style={{ marginBottom: 16 }}>
        <div
          className="settings-section-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}
        >
          <div>
            <p className="settings-section-title">Custom Fields Manager</p>
            <p className="settings-section-desc">
              Define fields for personalization, segments, and customer attributes.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(true)}>
            <Plus style={{ width: 14, height: 14 }} /> Add Custom Field
          </button>
        </div>
        <div style={{ maxHeight: 480, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, position: 'relative' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: '#F8FAFC' }}>
                <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>Label</th>
                <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>System Key</th>
                <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>Data Type</th>
                <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>Hint</th>
                <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>Mandatory</th>
                <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>Default Value</th>
                <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>Segment Link</th>
                <th style={{ position: 'sticky', top: 0, zIndex: 10, background: '#F8FAFC', borderBottom: '1px solid var(--border)', textAlign: 'right', paddingRight: 20 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>
                    Loading custom fields…
                  </td>
                </tr>
              ) : paginatedFields.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>
                    No custom fields configured yet. Click "Add Custom Field" to create one.
                  </td>
                </tr>
              ) : (
                paginatedFields.map((cf: any, idx: number) => (
                  <tr key={cf._id ? `${cf._id}-${idx}` : (cf.name ? `${cf.name}-${idx}` : `cf-${idx}`)}>
                    <td>
                      <strong>{cf.label || cf.name || cf.key}</strong>
                    </td>
                    <td>
                      <code>{cf.name || cf.key}</code>
                    </td>
                    <td>
                      <span className="cf-type">{cf.dataType || cf.type || 'text'}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{cf.hint || '—'}</td>
                    <td>{cf.isMandatory ? 'Yes' : 'No'}</td>
                    <td>{cf.defaultValue != null ? String(cf.defaultValue) : '—'}</td>
                    <td>
                      {cf.linkedSegment ? (
                        <span
                          className="attr-badge"
                          style={{
                            background: 'rgba(34, 197, 94, 0.1)',
                            color: '#16a34a',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          Active ({cf.linkedSegment.name})
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>None</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: 20 }}>
                      <button
                        className="action-icon-btn btn-delete"
                        title="Delete Field"
                        onClick={() => setDeleteConfirmId(cf._id)}
                      >
                        <Trash2 style={{ width: 13, height: 13 }} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Custom Fields Pagination Footer */}
        {totalFields > 0 && (
          <div className="table-pagination" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <div className="pagination-left" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span>
                Showing {startIndex + 1}–{endIndex} of {totalFields} fields
              </span>
            </div>
            <div className="pagination-right">
              <button
                className="pag-nav-btn"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
                title="Previous Page"
              >
                <ChevronLeft style={{ width: 14, height: 14 }} />
              </button>
              <input
                type="number"
                className="pag-input"
                value={safePage}
                min={1}
                max={totalPages}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 1 && val <= totalPages) setPage(val);
                }}
              />
              <span className="pag-total">/ {totalPages}</span>
              <button
                className="pag-nav-btn"
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
                title="Next Page"
              >
                <ChevronRight style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid-3-2" style={{ gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Email Settings */}
        <div className="settings-section">
          <div className="settings-section-header">
            <p className="settings-section-title">Email Settings</p>
            <p className="settings-section-desc">Configure your email sending provider and identity.</p>
          </div>
          <div className="settings-body">
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="property-row">
                <span className="property-label">Provider</span>
                <select
                  className="property-select"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                >
                  <option value="ses">Amazon SES (Recommended)</option>
                  <option value="zepto">ZeptoMail</option>
                  <option value="smtp">SMTP</option>
                  <option value="sendgrid">SendGrid</option>
                  <option value="postmark">Postmark</option>
                  <option value="resend">Resend</option>
                </select>
              </div>

              <div className="property-row">
                <span className="property-label">Sender Name</span>
                <input
                  type="text"
                  className="property-input"
                  placeholder="Acme Corp"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                />
              </div>

              <div className="property-row">
                <span className="property-label">Sender Email</span>
                <input
                  type="email"
                  className="property-input"
                  placeholder="noreply@yourdomain.com"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                />
              </div>

              <div className="property-row">
                <span className="property-label">Reply-To</span>
                <input
                  type="email"
                  className="property-input"
                  placeholder="support@yourdomain.com"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                />
              </div>

              <div className="property-row">
                <span className="property-label">
                  {provider === 'zepto' ? 'Zepto API Key' : 'API Key'}
                </span>
                <input
                  type="password"
                  className="property-input"
                  placeholder={provider === 'zepto' ? 'Zoho-enczapikey ••••••' : 'API Key'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              {provider === 'ses' && (
                <p className="property-label" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: -6, marginBottom: 10 }}>
                  * Uses AWS SES credentials configured in your server's <code>.env</code> file.
                </p>
              )}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <p className="property-label" style={{ marginBottom: 10, color: 'var(--accent-purple)' }}>
                  SMTP (if not using Zepto)
                </p>
                <div className="property-row" style={{ marginBottom: 8 }}>
                  <span className="property-label">SMTP Host</span>
                  <input
                    type="text"
                    className="property-input"
                    placeholder="smtp.gmail.com"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                  />
                </div>
                <div className="property-row" style={{ marginBottom: 8 }}>
                  <span className="property-label">SMTP Port</span>
                  <input
                    type="number"
                    className="property-input"
                    placeholder="587"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                  />
                </div>
                <div className="property-row" style={{ marginBottom: 8 }}>
                  <span className="property-label">SMTP User</span>
                  <input
                    type="text"
                    className="property-input"
                    placeholder="user@gmail.com"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                  />
                </div>
                <div className="property-row">
                  <span className="property-label">SMTP Password</span>
                  <input
                    type="password"
                    className="property-input"
                    placeholder="••••••••"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>
                  Save Settings
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleSendTestEmail} style={{ flex: 1 }}>
                  Send Test Email
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* AI Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="settings-section">
            <div className="settings-section-header">
              <p className="settings-section-title">AI Settings</p>
              <p className="settings-section-desc">Enable AI email generation and analysis.</p>
            </div>
            <div className="settings-body">
              <p className="property-label" style={{ lineHeight: 1.6 }}>
                Add your Gemini API key to enable AI email generation, subject line suggestions, spam checks, and
                accessibility audits.
              </p>
              <div className="property-row">
                <span className="property-label">Gemini API Key</span>
                <input
                  type="password"
                  className="property-input"
                  placeholder="AIza…"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                />
              </div>
              <p className="property-label" style={{ fontSize: '10.5px' }}>
                Get free key at:{' '}
                <a
                  href="https://aistudio.google.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--accent-purple)' }}
                >
                  aistudio.google.com
                </a>
              </p>
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={handleSaveGeminiKey}>
                Save Gemini Key
              </button>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section-header">
              <p className="settings-section-title">Zepto Webhook</p>
              <p className="settings-section-desc">Point your Zepto webhook to track email events.</p>
            </div>
            <div className="settings-body">
              <code
                style={{
                  fontSize: 12,
                  color: 'var(--accent-purple)',
                  wordBreak: 'break-all',
                  display: 'block',
                  padding: 10,
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                }}
              >
                http://your-domain.com/api/campaigns/webhook/zepto
              </code>
            </div>
          </div>

          {/* System Configuration Status */}
          <div className="settings-section">
            <div className="settings-section-header">
              <p className="settings-section-title">System Configurations</p>
              <p className="settings-section-desc">Environment-level integrations configured in your .env file.</p>
            </div>
            <div className="settings-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>AWS S3 Storage</span>
                <span className="badge badge-success">
                  <CheckCircle style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} /> Configured
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Together AI (FLUX)</span>
                <span className="badge badge-success">
                  <CheckCircle style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} /> Configured
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Google Gemini</span>
                <span className="badge badge-success">
                  <CheckCircle style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} /> Configured
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Field Slide-Over Drawer */}
      {showModal && (
        <div className="drawer-overlay active" style={{ display: 'block' }} onClick={() => setShowModal(false)}>
          <div className="drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button type="button" className="drawer-back" onClick={() => setShowModal(false)}>
                  <ArrowLeft style={{ width: 18, height: 18 }} />
                </button>
                <h2 className="drawer-title">Add Custom Field</h2>
              </div>
              <button type="button" className="drawer-close" onClick={() => setShowModal(false)}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <form onSubmit={handleAddCustomField} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', margin: 0 }}>
              <div className="drawer-body">
                <div className="drawer-section">
                  <h3 className="drawer-section-title">FIELD PROPERTIES</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">FIELD LABEL *</label>
                      <input
                        type="text"
                        className="property-input"
                        required
                        placeholder="e.g., Company Size"
                        value={fieldLabel}
                        onChange={(e) => {
                          setFieldLabel(e.target.value);
                          if (!fieldKey) {
                            setFieldKey(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                          }
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">SYSTEM KEY *</label>
                      <input
                        type="text"
                        className="property-input"
                        required
                        placeholder="e.g., company_size"
                        value={fieldKey}
                        onChange={(e) => setFieldKey(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">DATA TYPE</label>
                      <select
                        className="property-select"
                        value={fieldType}
                        onChange={(e) => setFieldType(e.target.value)}
                      >
                        <option value="text">String / Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">HINT DESCRIPTION</label>
                      <input
                        type="text"
                        className="property-input"
                        placeholder="Optional description"
                        value={fieldHint}
                        onChange={(e) => setFieldHint(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                      <input
                        type="checkbox"
                        id="autoCreateSegment"
                        checked={autoCreateSegment}
                        onChange={(e) => setAutoCreateSegment(e.target.checked)}
                        style={{ width: 16, height: 16, cursor: 'pointer' }}
                      />
                      <label htmlFor="autoCreateSegment" className="form-label" style={{ marginBottom: 0, cursor: 'pointer', userSelect: 'none' }}>
                        Auto-create linked segment
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="drawer-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Add Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Professional Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        title="Delete Custom Field"
        message="Are you sure you want to delete this custom field? Any stored customer data for this attribute will be permanently removed."
        confirmText="Delete Field"
        isDestructive={true}
        onConfirm={handleDeleteCustomField}
        onClose={() => setDeleteConfirmId(null)}
      />
    </section>
  );
};
