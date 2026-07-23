import React, { useState, useEffect } from 'react';
import { Send, Plus, X, Trash2, MessageSquare, Upload, ArrowLeft } from 'lucide-react';
import { Campaign, EmailTemplate, Segment, WhatsAppCampaign } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { WhatsAppCampaignModal } from '../components/campaigns/WhatsAppCampaignModal';

export const CampaignsPage: React.FC = () => {
  const { showToast } = useToast();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [whatsAppCampaigns, setWhatsAppCampaigns] = useState<WhatsAppCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);

  const [campaignTab, setCampaignTab] = useState<'all' | 'email' | 'whatsapp'>('all');

  // Email Drawer
  const [showModal, setShowModal] = useState(false);
  const [animateDrawer, setAnimateDrawer] = useState(false);

  // WhatsApp Modal
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

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
  const [fromName, setFromName] = useState('Stellar Commerce');
  const [fromEmail, setFromEmail] = useState('noreply@stellarcommerce.in');
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
      const [campRes, tmplRes, segRes, settingsRes, waCampRes] = await Promise.all([
        api.get('/api/campaigns').catch(() => ({ data: [] })),
        api.get('/api/templates').catch(() => ({ data: [] })),
        api.get('/api/segments').catch(() => ({ data: [] })),
        api.get('/api/settings').catch(() => ({ data: null })),
        api.get('/api/whatsapp/campaigns').catch(() => ({ data: [] })),
      ]);

      setCampaigns(Array.isArray(campRes?.data) ? campRes.data : Array.isArray(campRes) ? campRes : []);
      setTemplates(Array.isArray(tmplRes?.data) ? tmplRes.data : Array.isArray(tmplRes) ? tmplRes : []);
      setSegments(Array.isArray(segRes?.data) ? segRes.data : Array.isArray(segRes) ? segRes : []);
      setWhatsAppCampaigns(Array.isArray(waCampRes?.data) ? waCampRes.data : Array.isArray(waCampRes) ? waCampRes : []);

      if (settingsRes && settingsRes.data) {
        if (settingsRes.data.senderName) setFromName(settingsRes.data.senderName);
        if (settingsRes.data.senderEmail) setFromEmail(settingsRes.data.senderEmail);
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

  const handleDeleteWhatsAppCampaign = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete WhatsApp Campaign',
      message: 'Are you sure you want to permanently delete this WhatsApp campaign record?',
      isDestructive: true,
      confirmText: 'Delete Campaign',
      onConfirm: async () => {
        try {
          await api.delete(`/api/whatsapp/campaigns/${id}`);
          showToast('Deleted', 'WhatsApp campaign removed', 'success');
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
          <p className="page-description">Send targeted email and WhatsApp bulk campaigns & track performance.</p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            style={{
              borderColor: '#128C7E',
              color: '#128C7E',
              background: 'rgba(37, 211, 102, 0.08)',
              fontWeight: 600,
            }}
            onClick={() => setShowWhatsAppModal(true)}
          >
            <MessageSquare style={{ width: 14, height: 14 }} /> Upload WhatsApp CSV
          </button>
          <button className="btn btn-primary" onClick={handleOpenDrawer}>
            <Plus style={{ width: 14, height: 14 }} /> New Campaign
          </button>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          className={`btn btn-sm ${campaignTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setCampaignTab('all')}
        >
          All ({campaigns.length + whatsAppCampaigns.length})
        </button>
        <button
          className={`btn btn-sm ${campaignTab === 'email' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setCampaignTab('email')}
        >
          Email Campaigns ({campaigns.length})
        </button>
        <button
          className={`btn btn-sm ${campaignTab === 'whatsapp' ? 'btn-primary' : 'btn-secondary'}`}
          style={campaignTab === 'whatsapp' ? { background: '#128C7E', borderColor: '#128C7E', color: '#ffffff' } : {}}
          onClick={() => setCampaignTab('whatsapp')}
        >
          <MessageSquare style={{ width: 12, height: 12, marginRight: 4 }} /> WhatsApp Campaigns ({whatsAppCampaigns.length})
        </button>
      </div>

      {/* Campaigns List */}
      <div id="campaignsList" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
            Loading campaigns…
          </div>
        ) : (
          <>
            {/* Render Email Campaigns if Tab is 'all' or 'email' */}
            {(campaignTab === 'all' || campaignTab === 'email') &&
              campaigns.map((c, idx) => {
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
                  <div key={c._id ? `${c._id}-${idx}` : `camp-${idx}`} className="camp-card">
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
                          <span className="status-badge" style={{ background: '#f1f5f9', color: '#475569' }}>Email</span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                          Subject: {c.subject || 'No subject'}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-subtle)', margin: '2px 0 0 0' }}>
                          Created: {createdDate}
                        </p>
                      </div>
                    </div>

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
              })}

            {/* Render WhatsApp Campaigns if Tab is 'all' or 'whatsapp' */}
            {(campaignTab === 'all' || campaignTab === 'whatsapp') &&
              whatsAppCampaigns.map((wc, idx) => {
                const createdDate = wc.createdAt
                  ? new Date(wc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Today';

                return (
                  <div key={wc._id ? `${wc._id}-${idx}` : `wacamp-${idx}`} className="camp-card" style={{ borderLeft: '4px solid #128C7E' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1, minWidth: 200 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(37, 211, 102, 0.15)',
                          color: '#128C7E',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <MessageSquare style={{ width: 18, height: 18 }} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: 14, color: 'var(--text)' }}>{wc.name}</strong>
                          <span
                            className="status-badge"
                            style={{
                              background: 'rgba(37, 211, 102, 0.15)',
                              color: '#128C7E',
                              border: '1px solid rgba(37, 211, 102, 0.3)',
                              fontWeight: 700,
                            }}
                          >
                            WhatsApp Bulk
                          </span>
                          <span className="status-badge status-badge-sent">
                            {wc.status || 'sent'}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                          Template: <code>{wc.templateId}</code> {wc.csvFileKey ? `• CSV Key: ${wc.csvFileKey}` : ''}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-subtle)', margin: '2px 0 0 0' }}>
                          Triggered: {createdDate}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <div className="camp-stat-tile">
                        <span className="camp-stat-num" style={{ color: '#128C7E' }}>
                          {wc.stats?.sent || 0}
                        </span>
                        <span className="camp-stat-label">Sent</span>
                      </div>
                      <div className="camp-stat-tile">
                        <span className="camp-stat-num" style={{ color: '#16a34a' }}>
                          {wc.stats?.delivered || 0}
                        </span>
                        <span className="camp-stat-label">Delivered</span>
                      </div>
                      <div className="camp-stat-tile">
                        <span className="camp-stat-num" style={{ color: '#2563eb' }}>
                          {wc.stats?.read || 0}
                        </span>
                        <span className="camp-stat-label">Read</span>
                      </div>
                      <div className="camp-stat-tile">
                        <span className="camp-stat-num" style={{ color: '#ef4444' }}>
                          {wc.stats?.failed || 0}
                        </span>
                        <span className="camp-stat-label">Failed</span>
                      </div>
                    </div>

                    <button
                      className="action-icon-btn btn-delete"
                      title="Delete WhatsApp campaign"
                      style={{ marginLeft: 8 }}
                      onClick={() => handleDeleteWhatsAppCampaign(wc._id)}
                    >
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                );
              })}

            {campaigns.length === 0 && whatsAppCampaigns.length === 0 && (
              <div className="dashed-card">
                <div className="dashed-icon">
                  <Send style={{ width: 20, height: 20 }} />
                </div>
                <p className="dashed-title">No campaigns found</p>
                <p className="dashed-desc">Create an email or WhatsApp CSV campaign to start reaching your audience.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* WhatsApp Campaign Modal */}
      <WhatsAppCampaignModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        onSuccess={loadData}
      />

      {/* New Campaign Modal Drawer matching exact screenshot design */}
      {showModal && (
        <div
          className={`drawer-overlay ${animateDrawer ? 'active' : ''}`}
          style={{ display: 'block' }}
          onClick={handleCloseDrawer}
        >
          <div
            className={`drawer-card ${animateDrawer ? 'open' : ''}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 520,
              maxWidth: '92vw',
              display: 'flex',
              flexDirection: 'column',
              height: '100vh',
              borderRadius: '12px 0 0 12px',
              overflow: 'hidden',
              background: '#ffffff',
            }}
          >
            {/* Drawer Header: ArrowLeft + New Campaign + X */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
                background: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                  title="Back"
                >
                  <ArrowLeft style={{ width: 18, height: 18 }} />
                </button>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  New Campaign
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseDrawer}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
                title="Close"
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div
                className="modal-body"
                style={{
                  padding: 24,
                  overflowY: 'auto',
                  flex: 1,
                  background: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                }}
              >
                {/* CARD 1: CAMPAIGN DETAILS */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      color: '#475569',
                      textTransform: 'uppercase',
                    }}
                  >
                    CAMPAIGN DETAILS
                  </span>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                      Campaign Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="property-input"
                      placeholder="July Newsletter"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                      Subject Line <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="property-input"
                      placeholder="Check out what's new..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                      Template <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      className="property-select"
                      value={templateId}
                      onChange={(e) => setTemplateId(e.target.value)}
                      required
                    >
                      <option value="">— No template —</option>
                      {templates.map((t, idx) => (
                        <option key={t._id ? `${t._id}-${idx}` : `tmpl-${idx}`} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* CARD 2: AUDIENCE */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      color: '#475569',
                      textTransform: 'uppercase',
                    }}
                  >
                    AUDIENCE
                  </span>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                      Audience Type
                    </label>
                    <select
                      className="property-select"
                      value={audienceType}
                      onChange={(e: any) => setAudienceType(e.target.value)}
                    >
                      <option value="all">All Active Contacts</option>
                      <option value="segment">Target Segment</option>
                    </select>
                  </div>

                  {audienceType === 'segment' && (
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                        Select Segment <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select
                        className="property-select"
                        value={segmentId}
                        onChange={(e) => setSegmentId(e.target.value)}
                        required
                      >
                        <option value="">-- Select Segment --</option>
                        {segments.map((s, idx) => (
                          <option key={s._id ? `${s._id}-${idx}` : `seg-${idx}`} value={s._id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* CARD 3: SENDER INFORMATION */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      color: '#475569',
                      textTransform: 'uppercase',
                    }}
                  >
                    SENDER INFORMATION
                  </span>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                      From Name
                    </label>
                    <input
                      type="text"
                      className="property-input"
                      placeholder="Stellar Commerce"
                      value={fromName}
                      onChange={(e) => setFromName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                      From Email <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      className="property-input"
                      placeholder="noreply@stellarcommerce.in"
                      value={fromEmail}
                      onChange={(e) => setFromEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* CARD 4: DELIVERY OPTIONS */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      color: '#475569',
                      textTransform: 'uppercase',
                    }}
                  >
                    DELIVERY OPTIONS
                  </span>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                      Send Action
                    </label>
                    <select
                      className="property-select"
                      value={sendAction}
                      onChange={(e: any) => setSendAction(e.target.value)}
                    >
                      <option value="send_now">Send Immediately</option>
                      <option value="schedule">Schedule for Later</option>
                      <option value="draft">Save as Draft</option>
                    </select>
                  </div>

                  {sendAction === 'schedule' && (
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                        Scheduled Date & Time <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="datetime-local"
                        className="property-input"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer Controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 12,
                  padding: '16px 24px',
                  borderTop: '1px solid #e2e8f0',
                  background: '#ffffff',
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseDrawer}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    padding: '8px 22px',
                    borderRadius: 6,
                    background: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 13,
                    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                  }}
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
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
