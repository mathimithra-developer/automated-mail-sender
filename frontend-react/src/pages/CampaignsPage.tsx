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
        api.post('/api/whatsapp/campaigns').catch(() => ({ data: [] })),
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
        <div className="page-header-left">
          <h1 className="page-title">Campaigns</h1>
          <p className="page-description">Send targeted email and WhatsApp bulk campaigns & track performance.</p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            style={{
              borderColor: '#2563eb',
              color: '#2563eb',
              background: 'rgba(37, 99, 235, 0.06)',
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
          style={campaignTab === 'whatsapp' ? { background: '#2563eb', borderColor: '#2563eb', color: '#ffffff' } : {}}
          onClick={() => setCampaignTab('whatsapp')}
        >
          <MessageSquare style={{ width: 12, height: 12, marginRight: 4 }} /> WhatsApp Campaigns ({whatsAppCampaigns.length})
        </button>
      </div>

      {/* Campaigns List */}
      <div id="campaignsList" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                const createdDate = c.createdAt
                  ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '21 Jul 2026';

                return (
                  <div
                    key={c._id ? `${c._id}-${idx}` : `camp-${idx}`}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderLeft: `4px solid ${
                        c.status === 'completed'
                          ? '#10b981'
                          : c.status === 'scheduled'
                          ? '#2563eb'
                          : '#f59e0b'
                      }`,
                      borderRadius: 12,
                      padding: '20px 24px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                      flexWrap: 'wrap',
                      transition: 'all 0.2s ease-in-out',
                    }}
                    className="hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flex: 1, minWidth: 260 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 10,
                          background: 'rgba(37, 99, 235, 0.08)',
                          color: '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Send style={{ width: 18, height: 18 }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{c.name}</span>
                          <span
                            style={{
                              padding: '2px 10px',
                              borderRadius: 9999,
                              fontSize: 11,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              background:
                                c.status === 'completed'
                                  ? '#dcfce7'
                                  : c.status === 'scheduled'
                                  ? '#dbeafe'
                                  : '#fef3c7',
                              color:
                                c.status === 'completed'
                                  ? '#15803d'
                                  : c.status === 'scheduled'
                                  ? '#1d4ed8'
                                  : '#b45309',
                            }}
                          >
                            {c.status || 'draft'}
                          </span>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 9999,
                              fontSize: 11,
                              fontWeight: 600,
                              background: '#f1f5f9',
                              color: '#475569',
                            }}
                          >
                            Email
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>
                          Subject: {c.subject || 'No subject'}
                        </p>
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                          Created: {createdDate}
                        </p>
                      </div>
                    </div>

                    {!isDraft ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 8, padding: '6px 14px', textAlign: 'center', minWidth: 70 }}>
                          <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{c.stats?.sent || 0}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sent</span>
                        </div>
                        <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 8, padding: '6px 14px', textAlign: 'center', minWidth: 70 }}>
                          <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#2563eb' }}>{c.stats?.opened || 0}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Opened</span>
                        </div>
                        <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 8, padding: '6px 14px', textAlign: 'center', minWidth: 70 }}>
                          <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#16a34a' }}>{c.stats?.clicked || 0}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Clicked</span>
                        </div>
                        <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 8, padding: '6px 14px', textAlign: 'center', minWidth: 70 }}>
                          <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#ef4444' }}>{c.stats?.bounced || 0}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bounced</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>0 recipients</span>
                        <button
                          className="btn btn-sm btn-primary"
                          disabled={dispatchingId === c._id}
                          onClick={() => handleSendCampaign(c._id)}
                        >
                          {dispatchingId === c._id ? 'Sending…' : 'Send Now'}
                        </button>
                      </div>
                    )}

                    <button
                      title="Delete campaign"
                      onClick={() => handleDeleteCampaign(c._id)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ef4444';
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                        e.currentTarget.style.borderColor = '#fee2e2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#94a3b8';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }}
                    >
                      <Trash2 style={{ width: 15, height: 15 }} />
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
                  <div
                    key={wc._id ? `${wc._id}-${idx}` : `wacamp-${idx}`}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderLeft: '4px solid #2563eb',
                      borderRadius: 12,
                      padding: '20px 24px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                      flexWrap: 'wrap',
                      transition: 'all 0.2s ease-in-out',
                    }}
                    className="hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flex: 1, minWidth: 260 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 10,
                          background: 'rgba(37, 99, 235, 0.08)',
                          color: '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <MessageSquare style={{ width: 18, height: 18 }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{wc.name}</span>
                          <span
                            style={{
                              padding: '2px 10px',
                              borderRadius: 9999,
                              fontSize: 11,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              background: '#e0e7ff',
                              color: '#3730a3',
                            }}
                          >
                            WhatsApp Bulk
                          </span>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 9999,
                              fontSize: 11,
                              fontWeight: 600,
                              background: '#dcfce7',
                              color: '#15803d',
                            }}
                          >
                            {wc.status || 'sent'}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: '#475569', margin: 0, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span>Template: <code style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: 4 }}>{wc.templateId}</code></span>
                          {wc.csvFileKey && (
                            <>
                              <span>•</span>
                              <span>CSV Key:</span>
                              <code
                                title={wc.csvFileKey}
                                style={{
                                  background: '#f1f5f9',
                                  padding: '1px 5px',
                                  borderRadius: 4,
                                  maxWidth: 160,
                                  display: 'inline-block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  verticalAlign: 'bottom',
                                }}
                              >
                                {wc.csvFileKey}
                              </code>
                            </>
                          )}
                        </p>
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                          Triggered: {createdDate}
                        </p>
                      </div>
                    </div>

                    {/* Analytics Stat Chips */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 8, padding: '6px 14px', textAlign: 'center', minWidth: 70 }}>
                        <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{wc.stats?.sent || 0}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sent</span>
                      </div>
                      <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 8, padding: '6px 14px', textAlign: 'center', minWidth: 70 }}>
                        <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#16a34a' }}>{wc.stats?.delivered || 0}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Delivered</span>
                      </div>
                      <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 8, padding: '6px 14px', textAlign: 'center', minWidth: 70 }}>
                        <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#2563eb' }}>{wc.stats?.read || 0}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Read</span>
                      </div>
                      <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 8, padding: '6px 14px', textAlign: 'center', minWidth: 70 }}>
                        <span style={{ display: 'block', fontSize: 15, fontWeight: 700, color: '#ef4444' }}>{wc.stats?.failed || 0}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Failed</span>
                      </div>
                    </div>

                    <button
                      title="Delete WhatsApp campaign"
                      onClick={() => handleDeleteWhatsAppCampaign(wc._id)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#ef4444';
                        e.currentTarget.style.backgroundColor = '#fef2f2';
                        e.currentTarget.style.borderColor = '#fee2e2';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#94a3b8';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }}
                    >
                      <Trash2 style={{ width: 15, height: 15 }} />
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
