import React, { useState, useEffect } from 'react';
import { Send, Plus, X, Trash2, MessageSquare, ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, CheckCircle2, Eye, AlertTriangle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Campaign, EmailTemplate, Segment, WhatsAppCampaign } from '../types';
import { api, campaignApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { WhatsAppCampaignModal } from '../components/campaigns/WhatsAppCampaignModal';

export const CampaignsPage: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [whatsAppCampaigns, setWhatsAppCampaigns] = useState<WhatsAppCampaign[]>([]);
  const [overallCounts, setOverallCounts] = useState<any>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);

  const [campaignTab, setCampaignTab] = useState<'all' | 'email' | 'whatsapp'>('all');
  const [page, setPage] = useState(1);
  const limit = 4;

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

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [campRes, tmplRes, segRes, settingsRes, waCampRes, ownChatListRes, ownChatCountRes] = await Promise.all([
        api.get('/api/campaigns').catch(() => ({ data: [] })),
        api.get('/api/templates').catch(() => ({ data: [] })),
        api.get('/api/segments').catch(() => ({ data: [] })),
        api.get('/api/settings').catch(() => ({ data: null })),
        api.post('/api/whatsapp/campaigns').catch(() => ({ data: [] })),
        campaignApi.getCampaigns(page, 30).catch(() => null),
        campaignApi.getOverallCount().catch(() => null),
      ]);

      setCampaigns(Array.isArray(campRes?.data) ? campRes.data : Array.isArray(campRes) ? campRes : []);
      setTemplates(Array.isArray(tmplRes?.data) ? tmplRes.data : Array.isArray(tmplRes) ? tmplRes : []);
      setSegments(Array.isArray(segRes?.data) ? segRes.data : Array.isArray(segRes) ? segRes : []);

      let waList: WhatsAppCampaign[] = Array.isArray(waCampRes?.data) ? waCampRes.data : Array.isArray(waCampRes) ? waCampRes : [];

      if (ownChatListRes) {
        const rawBulk = Array.isArray(ownChatListRes?.data?.bulkUploads)
          ? ownChatListRes.data.bulkUploads
          : Array.isArray(ownChatListRes?.bulkUploads)
          ? ownChatListRes.bulkUploads
          : Array.isArray(ownChatListRes?.campaigns)
          ? ownChatListRes.campaigns
          : Array.isArray(ownChatListRes?.data)
          ? ownChatListRes.data
          : Array.isArray(ownChatListRes)
          ? ownChatListRes
          : [];

        if (rawBulk.length > 0) {
          const remoteMapped: WhatsAppCampaign[] = rawBulk.map((c: any) => {
            const createdNum = Number(c.createdCount) || Number(c.totalCount) || 0;
            const failedNum = Number(c.failedCount) || 0;
            const isFinished = c.isFinished === true;
            const isAllFailed = isFinished && failedNum > 0 && failedNum >= createdNum;
            const isScheduled = c.status === 'scheduled' || c.publishMode === 'schedule';
            const isInProgress = !isFinished && !isScheduled;

            let finalStatus = 'completed';
            if (isInProgress) finalStatus = 'in_progress';
            else if (isScheduled) finalStatus = 'scheduled';
            else if (isAllFailed) finalStatus = 'failed';

            return {
              _id: c._id || c.id || `wa_${Math.random().toString(36).substring(2, 7)}`,
              name: c.name || c.campaignName || 'WhatsApp Bulk Campaign',
              templateId: c.templateId || 'WhatsApp Template',
              status: finalStatus,
              type: 'whatsapp' as const,
              csvFileKey: c.sourceUrl || c.csvFileKey,
              createdAt: c.createdAt || new Date().toISOString(),
              stats: {
                total: createdNum || 1,
                sent: isFinished ? Math.max(0, createdNum - failedNum) : 0,
                delivered: isFinished ? Math.max(0, createdNum - failedNum) : 0,
                read: 0,
                failed: failedNum,
              },
            };
          });

          // Merge without duplicating existing items
          const existingIds = new Set(remoteMapped.map(r => String(r._id)));
          const localOnly = waList.filter(l => !existingIds.has(String(l._id)));
          waList = [...remoteMapped, ...localOnly];
        }
      }

      setWhatsAppCampaigns(waList);

      if (ownChatCountRes) {
        setOverallCounts(ownChatCountRes.data || ownChatCountRes);
      }

      if (settingsRes && settingsRes.data) {
        if (settingsRes.data.senderName) setFromName(settingsRes.data.senderName);
        if (settingsRes.data.senderEmail) setFromEmail(settingsRes.data.senderEmail);
      }
    } catch (err: any) {
      if (!isSilent) showToast('Error loading campaigns', err.message, 'error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      loadData(true);
    }, 30000);
    return () => clearInterval(timer);
  }, [page]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !subject || !templateId || !fromEmail) {
      showToast('Required', 'Name, Subject, Template, and Sender Email are required', 'warning');
      return;
    }

    const cleanName = name.trim().toLowerCase();
    const existing = campaigns.find((c) => (c.name || '').trim().toLowerCase() === cleanName);
    if (existing) {
      showToast('Duplicate Name', 'A campaign with this name already exists. Duplicate campaign names are not allowed.', 'warning');
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
          {campaignTab !== 'email' && (
            <button
              className="btn btn-primary"
              onClick={() => setShowWhatsAppModal(true)}
              style={{
                gap: 6,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                borderColor: '#2563eb',
                fontWeight: 600
              }}
            >
              <MessageSquare style={{ width: 15, height: 15 }} /> Create WhatsApp Campaign
            </button>
          )}

          {campaignTab !== 'whatsapp' && (
            <button
              className={campaignTab === 'email' ? 'btn btn-primary' : 'btn btn-secondary'}
              onClick={() => handleOpenDrawer()}
              style={{ gap: 6, fontWeight: 600 }}
            >
              <Plus style={{ width: 15, height: 15 }} /> Create Email Campaign
            </button>
          )}
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          className={`btn btn-sm ${campaignTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setCampaignTab('all');
            setPage(1);
          }}
        >
          All ({campaigns.length + whatsAppCampaigns.length})
        </button>
        <button
          className={`btn btn-sm ${campaignTab === 'email' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setCampaignTab('email');
            setPage(1);
          }}
        >
          Email Campaigns ({campaigns.length})
        </button>
        <button
          className={`btn btn-sm ${campaignTab === 'whatsapp' ? 'btn-primary' : 'btn-secondary'}`}
          style={campaignTab === 'whatsapp' ? { background: '#2563eb', borderColor: '#2563eb', color: '#ffffff' } : {}}
          onClick={() => {
            setCampaignTab('whatsapp');
            setPage(1);
          }}
        >
          <MessageSquare style={{ width: 12, height: 12, marginRight: 4 }} /> WhatsApp Campaigns ({whatsAppCampaigns.length})
        </button>
      </div>

      {/* Campaigns List & Pagination Calculation */}
      {(() => {
        const getFilteredList = () => {
          if (campaignTab === 'email') {
            return campaigns.map((c) => ({ ...c, _itemType: 'email' }));
          }
          if (campaignTab === 'whatsapp') {
            return whatsAppCampaigns.map((wc) => ({ ...wc, _itemType: 'whatsapp' }));
          }
          const emailItems = campaigns.map((c) => ({ ...c, _itemType: 'email' }));
          const waItems = whatsAppCampaigns.map((wc) => ({ ...wc, _itemType: 'whatsapp' }));
          return [...emailItems, ...waItems].sort((a: any, b: any) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
          });
        };

        const filteredList = getFilteredList();
        const total = filteredList.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const paginatedList = filteredList.slice((page - 1) * limit, page * limit);

        return (
          <>
            <div id="campaignsList" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[1,2,3].map((i) => (
                    <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: '20px 24px', height: 110, animation: 'pulse 1.5s ease-in-out infinite', opacity: 0.7 }} />
                  ))}
                </div>
              ) : (
                <>
                  {paginatedList.map((item: any, idx) => {
                    if (item._itemType === 'email') {
                      const c = item;
                      const isDraft = c.status === 'draft';
                      const createdDate = c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '—';
                      const sentCount = c.stats?.sent || 0;
                      const failedCount = c.stats?.failed || 0;
                      const openedCount = c.stats?.opened || 0;
                      const clickedCount = c.stats?.clicked || 0;
                      const bouncedCount = c.stats?.bounced || 0;
                      const totalAudience = c.stats?.total || (sentCount + failedCount) || 0;
                      const deliveryPct = sentCount > 0 ? Math.round(((sentCount - bouncedCount) / sentCount) * 100) : 0;

                      const isFailedStatus = c.status === 'failed' || (sentCount === 0 && failedCount > 0);
                      const statusLabel = isFailedStatus ? 'failed' : (c.status || 'draft');
                      const statusBg = isFailedStatus ? '#FEF2F2' : (c.status === 'sent' || c.status === 'completed' ? '#DCFCE7' : c.status === 'scheduled' ? '#DBEAFE' : '#FEF3C7');
                      const statusColor = isFailedStatus ? '#DC2626' : (c.status === 'sent' || c.status === 'completed' ? '#15803D' : c.status === 'scheduled' ? '#1D4ED8' : '#B45309');

                      return (
                        <div
                          key={c._id ? `${c._id}-${idx}` : `camp-${idx}`}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderLeft: `4px solid ${isFailedStatus ? '#EF4444' : c.status === 'sent' || c.status === 'completed' ? '#10B981' : c.status === 'scheduled' ? '#2563EB' : '#F59E0B'}`,
                            borderRadius: 14,
                            padding: '20px 24px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                            transition: 'box-shadow 0.2s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)')}
                        >
                          {/* Card Top Row */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1, minWidth: 200 }}>
                              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Send style={{ width: 18, height: 18 }} />
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                  <span style={{ fontSize: 15.5, fontWeight: 700, color: '#0F172A' }}>{c.name}</span>
                                  <span style={{ padding: '2px 10px', borderRadius: 9999, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: statusBg, color: statusColor }}>
                                    {statusLabel}
                                  </span>
                                  <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 10.5, fontWeight: 600, background: '#F1F5F9', color: '#475569' }}>Email</span>
                                </div>
                                <div style={{ fontSize: 12.5, color: '#64748B', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                  <span>📧 Subject: <strong style={{ color: '#334155' }}>{c.subject || 'No subject'}</strong></span>
                                  <span>📅 {createdDate}</span>
                                  {totalAudience > 0 && <span>👥 {totalAudience} recipients</span>}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              {isDraft && (
                                <button className="btn btn-sm btn-primary" disabled={dispatchingId === c._id} onClick={() => handleSendCampaign(c._id)} style={{ borderRadius: 8, fontSize: 12.5 }}>
                                  {dispatchingId === c._id ? 'Sending…' : '▶ Send Now'}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => navigate(`/campaigns/${c._id}`)}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, background: '#EFF6FF', color: '#2563EB', border: '1.5px solid #BFDBFE', cursor: 'pointer', whiteSpace: 'nowrap' }}
                              >
                                <ExternalLink style={{ width: 13, height: 13 }} /> View Details
                              </button>
                              <button title="Delete" onClick={() => handleDeleteCampaign(c._id)} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEF2F2'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = '#FFFFFF'; }}
                              ><Trash2 style={{ width: 14, height: 14 }} /></button>
                            </div>
                          </div>

                          {/* Stats Row */}
                          {!isDraft && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                              {[
                                { label: 'Sent', value: sentCount, color: '#2563EB', bg: '#DBEAFE', icon: <Send style={{ width: 11, height: 11 }} /> },
                                { label: 'Failed', value: failedCount, color: '#DC2626', bg: '#FEF2F2', icon: <AlertTriangle style={{ width: 11, height: 11 }} /> },
                                { label: 'Opened', value: openedCount, color: '#16A34A', bg: '#DCFCE7', icon: <Eye style={{ width: 11, height: 11 }} /> },
                                { label: 'Clicked', value: clickedCount, color: '#7C3AED', bg: '#EDE9FE', icon: <CheckCircle2 style={{ width: 11, height: 11 }} /> },
                                { label: 'Bounced', value: bouncedCount, color: '#EF4444', bg: '#FEF2F2', icon: <AlertTriangle style={{ width: 11, height: 11 }} /> },
                                { label: 'Delivery %', value: `${deliveryPct}%`, color: '#059669', bg: '#D1FAE5', icon: <CheckCircle2 style={{ width: 11, height: 11 }} /> },
                              ].map(({ label, value, color, bg, icon }) => (
                                <div key={label} style={{ background: bg, borderRadius: 8, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <span style={{ color }}>{icon}</span>
                                  <span style={{ fontSize: 12.5, fontWeight: 700, color }}>{value}</span>
                                  <span style={{ fontSize: 10.5, color, opacity: 0.75, fontWeight: 600 }}>{label}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      // WhatsApp Campaign Card
                      const wc = item;
                      const createdDate = wc.createdAt
                        ? new Date(wc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Today';
                      const sentCount = wc.stats?.sent || 0;
                      const deliveredCount = wc.stats?.delivered || 0;
                      const readCount = wc.stats?.read || 0;
                      const failedCount = wc.stats?.failed || 0;
                      const totalCount = wc.stats?.total || sentCount;
                      const deliveryPct = totalCount > 0 ? Math.round((deliveredCount / totalCount) * 100) : 0;

                      return (
                        <div
                          key={wc._id ? `${wc._id}-${idx}` : `wacamp-${idx}`}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderLeft: '4px solid #2563EB',
                            borderRadius: 14,
                            padding: '20px 24px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                            transition: 'box-shadow 0.2s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.1)')}
                          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)')}
                        >
                          {/* Card Top Row */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1, minWidth: 200 }}>
                              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(37,99,235,0.08)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <MessageSquare style={{ width: 18, height: 18 }} />
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                  <span style={{ fontSize: 15.5, fontWeight: 700, color: '#0F172A' }}>{wc.name}</span>
                                  <span style={{ padding: '2px 10px', borderRadius: 9999, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', background: '#E0E7FF', color: '#3730A3' }}>WhatsApp Bulk</span>
                                  <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 10.5, fontWeight: 600, background: '#DCFCE7', color: '#15803D' }}>{wc.status || 'sent'}</span>
                                </div>
                                <div style={{ fontSize: 12.5, color: '#64748B', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                  <span>📋 Template: <strong style={{ color: '#334155' }}>{wc.templateId || 'Standard'}</strong></span>
                                  <span>📅 {createdDate}</span>
                                  {totalCount > 0 && <span><Users style={{ width: 11, height: 11, display: 'inline' }} /> <strong style={{ color: '#334155' }}>{totalCount}</strong> recipients</span>}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <button
                                type="button"
                                onClick={() => navigate(`/campaigns/${wc._id}`)}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, background: '#EFF6FF', color: '#2563EB', border: '1.5px solid #BFDBFE', cursor: 'pointer', whiteSpace: 'nowrap' }}
                              >
                                <ExternalLink style={{ width: 13, height: 13 }} /> View Details
                              </button>
                              <button title="Delete WhatsApp campaign" onClick={() => handleDeleteWhatsAppCampaign(wc._id)} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEF2F2'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = '#FFFFFF'; }}
                              ><Trash2 style={{ width: 14, height: 14 }} /></button>
                            </div>
                          </div>

                          {/* WhatsApp Stats Row */}
                          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                            {[
                              { label: 'Sent', value: sentCount, color: '#2563EB', bg: '#DBEAFE', icon: <Send style={{ width: 11, height: 11 }} /> },
                              { label: 'Delivered', value: deliveredCount, color: '#16A34A', bg: '#DCFCE7', icon: <CheckCircle2 style={{ width: 11, height: 11 }} /> },
                              { label: 'Read', value: readCount, color: '#7C3AED', bg: '#EDE9FE', icon: <Eye style={{ width: 11, height: 11 }} /> },
                              { label: 'Failed', value: failedCount, color: '#EF4444', bg: '#FEF2F2', icon: <AlertTriangle style={{ width: 11, height: 11 }} /> },
                              { label: 'Delivery %', value: `${deliveryPct}%`, color: '#059669', bg: '#D1FAE5', icon: <CheckCircle2 style={{ width: 11, height: 11 }} /> },
                            ].map(({ label, value, color, bg, icon }) => (
                              <div key={label} style={{ background: bg, borderRadius: 8, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
                                <span style={{ color }}>{icon}</span>
                                <span style={{ fontSize: 12.5, fontWeight: 700, color }}>{value}</span>
                                <span style={{ fontSize: 10.5, color, opacity: 0.75, fontWeight: 600 }}>{label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  })}

                  {total === 0 && (
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

            {/* Pagination Footer */}
            {total > 0 && (
              <div className="pagination-footer-card" style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>
                  Showing <strong>{(page - 1) * limit + 1}–{Math.min(page * limit, total)}</strong> of <strong>{total}</strong> campaigns
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ width: 36, height: 36, padding: 0, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Previous Page"><ChevronLeft style={{ width: 16, height: 16 }} /></button>
                  {Array.from({ length: totalPages }, (_, i) => {
                    const pNum = i + 1;
                    return (
                      <button key={pNum} onClick={() => setPage(pNum)} style={{ width: 36, height: 36, borderRadius: 8, border: pNum === page ? 'none' : '1px solid #E5E7EB', background: pNum === page ? '#2563EB' : '#FFFFFF', color: pNum === page ? '#FFFFFF' : '#475569', fontWeight: pNum === page ? 700 : 500, cursor: 'pointer', fontSize: 13 }}>{pNum}</button>
                    );
                  })}
                  <button className="btn btn-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={{ width: 36, height: 36, padding: 0, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Next Page"><ChevronRight style={{ width: 16, height: 16 }} /></button>
                </div>
              </div>
            )}
          </>
        );
      })()}

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
