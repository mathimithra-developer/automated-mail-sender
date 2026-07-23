import React, { useState, useEffect } from 'react';
import { Send, Plus, X, Trash2, Eye, MousePointer, AlertTriangle, HelpCircle, ArrowLeft } from 'lucide-react';
import { Campaign, EmailTemplate, Segment } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export const CampaignsPage: React.FC = () => {
  const { showToast } = useToast();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [animateDrawer, setAnimateDrawer] = useState(false);

  const handleOpenDrawer = () => {
    setShowModal(true);
    setTimeout(() => {
      setAnimateDrawer(true);
    }, 10);
  };

  const handleCloseDrawer = () => {
    setAnimateDrawer(false);
    setTimeout(() => {
      setShowModal(false);
    }, 250);
  };

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [audienceType, setAudienceType] = useState<'all' | 'segment'>('all');
  const [segmentId, setSegmentId] = useState('');
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [sendAction, setSendAction] = useState<'send_now' | 'schedule' | 'draft'>('send_now');

  const getIsoStringLocal = () => {
    const nowPlusHour = new Date(Date.now() + 3600000);
    return new Date(nowPlusHour.getTime() - (nowPlusHour.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  };

  const [scheduledAt, setScheduledAt] = useState(getIsoStringLocal());

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive?: boolean;
    confirmText?: string;
    onConfirm: () => void;
  } | null>(null);

  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [campRes, tmplRes, segRes, settingsRes] = await Promise.all([
        api.get('/api/campaigns'),
        api.get('/api/templates'),
        api.get('/api/segments'),
        api.get('/api/settings').catch(() => ({ data: null })),
      ]);

      setCampaigns(campRes.data || []);
      setTemplates(tmplRes.data || []);
      setSegments(segRes.data || []);

      if (settingsRes && settingsRes.data) {
        setFromName(settingsRes.data.senderName || '');
        setFromEmail(settingsRes.data.senderEmail || '');
      }
    } catch (err: any) {
      showToast('Error loading campaigns', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !subject || !templateId || !fromEmail) {
      showToast('Required', 'Name, Subject, Template, and Sender Email are required', 'warning');
      return;
    }

    try {
      const payload: any = {
        name,
        subject,
        template: templateId,
        audienceType,
        fromName,
        fromEmail,
      };

      if (audienceType === 'segment') {
        payload.segment = segmentId;
      }

      if (sendAction === 'schedule') {
        if (!scheduledAt) {
          showToast('Scheduled time required', 'Please pick a date & time', 'warning');
          return;
        }
        payload.scheduledAt = new Date(scheduledAt).toISOString();
        payload.status = 'scheduled';
      }

      const res = await api.post('/api/campaigns', payload);
      const newCampaign = res.data;

      handleCloseDrawer();
      setName('');
      setSubject('');
      setTemplateId('');
      setSegmentId('');
      setSendAction('send_now');
      setScheduledAt(getIsoStringLocal());

      if (sendAction === 'send_now') {
        showToast('Campaign Created', 'Sending emails now...', 'info');
        setDispatchingId(newCampaign._id);
        try {
          const sendRes = await api.post(`/api/campaigns/${newCampaign._id}/send`);
          showToast('Campaign Sent', `Dispatched to ${sendRes.sentCount || 0} contacts`, 'success');
        } catch (sendErr: any) {
          showToast('Send Error', sendErr.message, 'error');
        } finally {
          setDispatchingId(null);
        }
      } else if (sendAction === 'schedule') {
        showToast('Campaign Scheduled', `Campaign scheduled for ${new Date(payload.scheduledAt).toLocaleString()}`, 'success');
      } else {
        showToast('Campaign Created', 'Draft campaign created successfully', 'success');
      }

      loadData();
    } catch (err: any) {
      showToast('Error creating campaign', err.message, 'error');
    }
  };

  const handleSendCampaign = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Send Campaign',
      message: 'Are you sure you want to send this campaign to all target recipients now?',
      isDestructive: false,
      confirmText: 'Send Now',
      onConfirm: async () => {
        setDispatchingId(id);
        try {
          const res = await api.post(`/api/campaigns/${id}/send`);
          showToast('Campaign Sent', `Dispatched to ${res.sentCount || 0} contacts`, 'success');
          loadData();
        } catch (err: any) {
          showToast('Send Error', err.message, 'error');
        } finally {
          setDispatchingId(null);
        }
      }
    });
  };

  const handleDeleteCampaign = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Campaign',
      message: 'Are you sure you want to permanently delete this campaign? This action cannot be undone.',
      isDestructive: true,
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await api.delete(`/api/campaigns/${id}`);
          showToast('Deleted', 'Campaign removed', 'success');
          loadData();
        } catch (err: any) {
          showToast('Error deleting campaign', err.message, 'error');
        }
      }
    });
  };

  return (
    <section id="campaigns" className="page active">
      <div className="page-header">
        <div>
          <p className="breadcrumb">
            <Send style={{ width: 12, height: 12 }} /> Campaigns
          </p>
          <h1 className="page-title">Campaigns</h1>
          <p className="page-description">Send targeted emails and track performance.</p>
        </div>
        <button className="btn" onClick={handleOpenDrawer}>
          <Plus style={{ width: 14, height: 14 }} /> New Campaign
        </button>
      </div>

      {/* Campaigns List */}
      <div id="campaignsList" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
            Loading campaigns…
          </div>
        ) : campaigns.length === 0 ? (
          <div className="dashed-card">
            <div className="dashed-icon">
              <Send style={{ width: 20, height: 20 }} />
            </div>
            <p className="dashed-title">No campaigns yet</p>
            <p className="dashed-desc">Create your first campaign to start sending emails.</p>
          </div>
        ) : (
          campaigns.map((c) => {
            const isDraft = c.status === 'draft';
            const statusClass =
              c.status === 'completed'
                ? 'status-badge-sent'
                : c.status === 'scheduled'
                ? 'status-badge-scheduled'
                : 'status-badge-draft';

            const createdDate = c.createdAt
              ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : '21 Jul 2026';

            return (
              <div key={c._id} className="camp-card">
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1, minWidth: 200 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--primary-subtle)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Send style={{ width: 16, height: 16 }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: 14, color: 'var(--text)' }}>{c.name}</strong>
                      <span className={`status-badge ${statusClass}`}>{c.status || 'draft'}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                      Subject: {c.subject || 'No subject'}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-subtle)', margin: '2px 0 0 0' }}>
                      Created: {createdDate}
                    </p>
                  </div>
                </div>

                {/* Stats row or Draft actions */}
                {!isDraft ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="camp-stat-tile">
                      <span className="camp-stat-num">{c.stats?.sent || 0}</span>
                      <span className="camp-stat-label">Sent</span>
                    </div>
                    <div className="camp-stat-tile">
                      <span className="camp-stat-num">{c.stats?.opened || 0}</span>
                      <span className="camp-stat-label">Opened</span>
                    </div>
                    <div className="camp-stat-tile">
                      <span className="camp-stat-num">{c.stats?.clicked || 0}</span>
                      <span className="camp-stat-label">Clicked</span>
                    </div>
                    <div className="camp-stat-tile">
                      <span className="camp-stat-num">{c.stats?.bounced || 0}</span>
                      <span className="camp-stat-label">Bounced</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span className="camp-stat-recipients">0 recipients</span>
                    <button
                      className="btn btn-sm"
                      disabled={dispatchingId === c._id}
                      onClick={() => handleSendCampaign(c._id)}
                    >
                      {dispatchingId === c._id ? 'Sending…' : 'Send Now'}
                    </button>
                  </div>
                )}

                <button
                  className="action-icon-btn btn-delete"
                  title="Delete campaign"
                  style={{ marginLeft: 8 }}
                  onClick={() => handleDeleteCampaign(c._id)}
                >
                  <Trash2 style={{ width: 14, height: 14 }} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Create Campaign Right Drawer */}
      {showModal && (
        <div className={`drawer-overlay ${animateDrawer ? 'active' : ''}`} style={{ display: 'block' }} onClick={handleCloseDrawer}>
          <div className="drawer-card" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCreateCampaign} className="drawer-form">
              <div className="drawer-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button type="button" className="drawer-back" onClick={handleCloseDrawer}>
                    <ArrowLeft style={{ width: 18, height: 18 }} />
                  </button>
                  <h2 className="drawer-title">New Campaign</h2>
                </div>
                <button type="button" className="drawer-close" onClick={handleCloseDrawer}>
                  <X style={{ width: 18, height: 18 }} />
                </button>
              </div>

              <div className="drawer-body">
                {/* Campaign Details */}
                <div className="drawer-section">
                  <h3 className="drawer-section-title">CAMPAIGN DETAILS</h3>
                  <div className="property-row">
                    <span className="property-label">Campaign Name *</span>
                    <input
                      type="text"
                      className="property-input"
                      required
                      placeholder="July Newsletter"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="property-row">
                    <span className="property-label">Subject Line *</span>
                    <input
                      type="text"
                      className="property-input"
                      required
                      placeholder="Check out what's new..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div className="property-row">
                    <span className="property-label">Template *</span>
                    <select
                      className="property-select"
                      required
                      value={templateId}
                      onChange={(e) => setTemplateId(e.target.value)}
                    >
                      <option value="">— No template —</option>
                      {templates.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Audience Targeting */}
                <div className="drawer-section">
                  <h3 className="drawer-section-title">AUDIENCE</h3>
                  <div className="property-row">
                    <span className="property-label">Audience Type</span>
                    <select
                      className="property-select"
                      value={audienceType}
                      onChange={(e) => setAudienceType(e.target.value as any)}
                    >
                      <option value="segment">Segment</option>
                      <option value="all">All Active Contacts</option>
                    </select>
                  </div>

                  {audienceType === 'segment' && (
                    <div className="property-row">
                      <span className="property-label">Segment</span>
                      <select
                        className="property-select"
                        required
                        value={segmentId}
                        onChange={(e) => setSegmentId(e.target.value)}
                      >
                        <option value="">— All —</option>
                        {segments.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name} ({(s as any).cachedCount || 0})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Sender Information */}
                <div className="drawer-section">
                  <h3 className="drawer-section-title">SENDER INFORMATION</h3>
                  <div className="property-row">
                    <span className="property-label">From Name</span>
                    <input
                      type="text"
                      className="property-input"
                      placeholder="Acme Corp"
                      value={fromName}
                      onChange={(e) => setFromName(e.target.value)}
                    />
                  </div>

                  <div className="property-row">
                    <span className="property-label">From Email *</span>
                    <input
                      type="email"
                      className="property-input"
                      required
                      placeholder="noreply@acme.com"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="drawer-section">
                  <h3 className="drawer-section-title">DELIVERY OPTIONS</h3>
                  <div className="property-row">
                    <span className="property-label">Send Action</span>
                    <select
                      className="property-select"
                      value={sendAction}
                      onChange={(e) => setSendAction(e.target.value as any)}
                    >
                      <option value="send_now">Send Immediately</option>
                      <option value="schedule">Schedule for Specific Time</option>
                      <option value="draft">Save as Draft / Send Later</option>
                    </select>
                  </div>

                  {sendAction === 'schedule' && (
                    <div className="property-row">
                      <span className="property-label">Scheduled Time *</span>
                      <input
                        type="datetime-local"
                        className="property-input"
                        required
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="drawer-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseDrawer}>
                  Cancel
                </button>
                <button type="submit" className="btn">
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Professional Confirmation Dialog */}
      {confirmDialog && (
        <ConfirmModal
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          isDestructive={confirmDialog.isDestructive}
          onConfirm={confirmDialog.onConfirm}
          onClose={() => setConfirmDialog(null)}
        />
      )}
    </section>
  );
};
