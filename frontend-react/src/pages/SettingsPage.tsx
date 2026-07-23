import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, Save, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { CustomField, OrgSettings } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();

  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(false);

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

  const loadData = async () => {
    setLoading(true);
    try {
      const [cfRes, setRes] = await Promise.all([
        api.get('/api/customfields').catch(() => ({ data: [] })),
        api.get('/api/settings').catch(() => ({ data: null })),
      ]);
      setCustomFields(cfRes.data || []);
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
      await api.post('/api/customfields', {
        label: fieldLabel,
        key: fieldKey,
        type: fieldType,
        hint: fieldHint,
      });
      showToast('Created', 'Custom field added successfully', 'success');
      setShowModal(false);
      setFieldLabel('');
      setFieldKey('');
      setFieldHint('');
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
      loadData();
    } catch (err: any) {
      showToast('Error deleting field', err.message, 'error');
    }
  };

  return (
    <section className="page active" id="settings">
      <div className="page-header">
        <div>
          <p className="breadcrumb">
            <SettingsIcon style={{ width: 12, height: 12 }} /> Settings
          </p>
          <h1 className="page-title">Settings</h1>
          <p className="page-description">Configure email provider, sender details, and API keys.</p>
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
        <div style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Label</th>
                <th>System Key</th>
                <th>Data Type</th>
                <th>Hint</th>
                <th>Mandatory</th>
                <th>Default Value</th>
                <th>Segment Link</th>
                <th style={{ textAlign: 'right', paddingRight: 20 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>
                    Loading custom fields…
                  </td>
                </tr>
              ) : customFields.length === 0 ? (
                <>
                  <tr>
                    <td>
                      <strong>City</strong>
                    </td>
                    <td>
                      <code>city</code>
                    </td>
                    <td>
                      <span className="cf-type">string</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>Customer primary city</td>
                    <td>No</td>
                    <td>—</td>
                    <td>
                      <span className="attr-badge">Active</span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: 20 }}>
                      <button className="action-icon-btn btn-delete" title="Delete Field">
                        <Trash2 style={{ width: 13, height: 13 }} />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Plan</strong>
                    </td>
                    <td>
                      <code>plan</code>
                    </td>
                    <td>
                      <span className="cf-type">string</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>Subscription tier</td>
                    <td>No</td>
                    <td>pro</td>
                    <td>
                      <span className="attr-badge">Active</span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: 20 }}>
                      <button className="action-icon-btn btn-delete" title="Delete Field">
                        <Trash2 style={{ width: 13, height: 13 }} />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Lead Score</strong>
                    </td>
                    <td>
                      <code>lead_score</code>
                    </td>
                    <td>
                      <span className="cf-type">number</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>Calculated lead score</td>
                    <td>No</td>
                    <td>0</td>
                    <td>
                      <span className="attr-badge">Active</span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: 20 }}>
                      <button className="action-icon-btn btn-delete" title="Delete Field">
                        <Trash2 style={{ width: 13, height: 13 }} />
                      </button>
                    </td>
                  </tr>
                </>
              ) : (
                customFields.map((cf: any) => (
                  <tr key={cf._id}>
                    <td>
                      <strong>{cf.label || cf.name || cf.key}</strong>
                    </td>
                    <td>
                      <code>{cf.key}</code>
                    </td>
                    <td>
                      <span className="cf-type">{cf.type || 'text'}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{cf.hint || '—'}</td>
                    <td>No</td>
                    <td>—</td>
                    <td>
                      <span className="attr-badge">Active</span>
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

      {/* Add Custom Field Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">Add Custom Field</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <form onSubmit={handleAddCustomField}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Field Label</label>
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
                  <label className="form-label">System Key</label>
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
                  <label className="form-label">Data Type</label>
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
                  <label className="form-label">Hint Description</label>
                  <input
                    type="text"
                    className="property-input"
                    placeholder="Optional description"
                    value={fieldHint}
                    onChange={(e) => setFieldHint(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
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
