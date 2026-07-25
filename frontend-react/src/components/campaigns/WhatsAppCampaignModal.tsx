import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, 
  Upload, 
  Check, 
  AlertCircle, 
  FileText, 
  X, 
  ArrowRight, 
  ArrowLeft,
  Smartphone,
  Sliders,
  Sparkles,
  Layers,
  Send,
  Calendar,
  Clock,
  RotateCcw,
  CheckCircle2,
  Zap,
  Globe,
  Hash,
  Tag,
  Database,
  ChevronRight
} from 'lucide-react';
import { WhatsAppTemplate } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { WhatsAppPreview } from './WhatsAppPreview';
import { WhatsAppTemplateGallery } from './WhatsAppTemplateGallery';
import '../../assets/whatsapp-preview.css';

interface WhatsAppCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface VarMappingItem {
  componentType: 'HEADER' | 'BODY';
  varIndex: number;
  field: string;
  fallbackValue: string;
}

// Fallback Rich Sample Templates if backend returns empty or limited set
const DEMO_TEMPLATES: WhatsAppTemplate[] = [
  {
    _id: 'tpl_order_conf_01',
    id: 'tpl_order_confirmation',
    name: 'order_confirmation_v2',
    category: 'UTILITY',
    language: 'en_US',
    components: [
      { type: 'HEADER', format: 'TEXT', text: 'Order #{{1}} Confirmed!' },
      { type: 'BODY', text: 'Hello {{1}},\n\nThank you for shopping with us! Your order {{2}} for total {{3}} has been confirmed and is being processed.\n\nEstimated delivery: {{4}}.' },
      { type: 'FOOTER', text: 'Thank you for choosing our business.' },
      {
        type: 'BUTTONS',
        buttons: [
          { type: 'URL', text: 'Track Order', url: 'https://example.com/track' },
          { type: 'PHONE_NUMBER', text: 'Call Support', phone_number: '+18005550199' },
        ],
      },
    ],
  },
  {
    _id: 'tpl_flash_sale_02',
    id: 'tpl_flash_sale_promo',
    name: 'summer_flash_sale_vip',
    category: 'MARKETING',
    language: 'en_US',
    components: [
      { type: 'HEADER', format: 'IMAGE', text: 'Summer VIP Sale' },
      { type: 'BODY', text: 'Hi {{1}},\n\nGet exclusive 25% OFF on all items! Use code {{2}} at checkout.\n\nOffer valid for limited time.' },
      { type: 'FOOTER', text: 'Reply STOP to opt out of promotional messages.' },
      {
        type: 'BUTTONS',
        buttons: [
          { type: 'URL', text: 'Shop Now', url: 'https://example.com/sale' },
          { type: 'COPY_CODE', text: 'Copy Promo Code', example: 'VIP25' },
        ],
      },
    ],
  },
  {
    _id: 'tpl_delivery_video_03',
    id: 'tpl_delivery_update',
    name: 'delivery_out_for_shipment',
    category: 'UTILITY',
    language: 'en_US',
    components: [
      { type: 'HEADER', format: 'VIDEO', text: 'Out for Delivery' },
      { type: 'BODY', text: 'Hey {{1}},\n\nYour shipment {{2}} is out for delivery with courier {{3}}.' },
      { type: 'FOOTER', text: 'Track live location via button below.' },
      {
        type: 'BUTTONS',
        buttons: [
          { type: 'URL', text: 'View Live Map', url: 'https://example.com/map' },
          { type: 'QUICK_REPLY', text: 'Reschedule Delivery' },
        ],
      },
    ],
  },
  {
    _id: 'tpl_auth_otp_04',
    id: 'tpl_security_otp',
    name: 'account_verification_otp',
    category: 'AUTHENTICATION',
    language: 'en_US',
    components: [
      { type: 'HEADER', format: 'TEXT', text: 'Security Verification Code' },
      { type: 'BODY', text: 'Your verification code is {{1}}.\n\nIt expires in {{2}} minutes. Do not share this code with anyone.' },
      { type: 'FOOTER', text: 'Security Notice • Official Verification' },
      {
        type: 'BUTTONS',
        buttons: [
          { type: 'COPY_CODE', text: 'Copy OTP Code', example: '849204' },
        ],
      },
    ],
  },
  {
    _id: 'tpl_doc_receipt_05',
    id: 'tpl_pdf_invoice',
    name: 'invoice_statement_pdf',
    category: 'UTILITY',
    language: 'en_US',
    components: [
      { type: 'HEADER', format: 'DOCUMENT', text: 'Monthly Statement' },
      { type: 'BODY', text: 'Dear {{1}},\n\nYour monthly statement for period {{2}} is attached below. Total due: {{3}}.' },
      { type: 'FOOTER', text: 'Financial Services Dept.' },
      {
        type: 'BUTTONS',
        buttons: [
          { type: 'URL', text: 'Pay Online', url: 'https://example.com/pay' },
        ],
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────
   Step 3 – Premium Two-Panel Workspace (UI only, no logic)
   ───────────────────────────────────────────────────────── */
interface Step3PanelProps {
  templateList: WhatsAppTemplate[];
  selectedTemplateId: string;
  selectedTemplate: WhatsAppTemplate | null;
  variableMappings: VarMappingItem[];
  headers: string[];
  onSelectTemplate: (t: WhatsAppTemplate) => void;
  onUpdateMapping: (index: number, updated: Partial<VarMappingItem>) => void;
}

const Step3Panel: React.FC<Step3PanelProps> = ({
  templateList,
  selectedTemplateId,
  selectedTemplate,
  variableMappings,
  headers,
  onSelectTemplate,
  onUpdateMapping,
}) => {
  // ── Auto-scale: Figma "Fit to Frame" for the phone preview ──
  const outerRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLDivElement>(null);
  // Must match the CSS .wa-phone-frame width exactly
  const PHONE_NATURAL_W = 320;
  const PHONE_NATURAL_H = 660;

  const recalcScale = useCallback(() => {
    if (!outerRef.current || !scaleRef.current) return;

    // Available width inside the padded container (padding: 36px * 2 = 72px)
    const availW = outerRef.current.clientWidth - 72;

    // How much we can scale by width before overflowing
    const scaleByW = Math.min(1, availW / PHONE_NATURAL_W);

    // Available height inside the padded container (padding: 36px * 2 = 72px)
    const availH = outerRef.current.clientHeight - 72;
    // Scale to fit height only when we have a real measured height
    const scaleByH = availH > 0 ? Math.min(1, availH / PHONE_NATURAL_H) : 1;

    const scale = Math.min(scaleByW, scaleByH);
    scaleRef.current.style.transform = `scale(${scale})`;

    // Set the outer wrapper height to match the scaled phone frame
    const scaledH = Math.ceil(PHONE_NATURAL_H * scale);
    outerRef.current.style.minHeight = `${scaledH + 72}px`;
  }, []);

  // Recalculate whenever template or mappings change, and on resize
  useEffect(() => {
    const t = setTimeout(() => recalcScale(), 60);
    const ro = new ResizeObserver(() => recalcScale());
    if (outerRef.current)  ro.observe(outerRef.current);
    if (scaleRef.current)  ro.observe(scaleRef.current);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, [selectedTemplate, variableMappings, recalcScale]);

  // Helper: derive component type chips from template
  const getComponentChips = (tmpl: WhatsAppTemplate) => {
    const chips: { label: string; cls: string }[] = [];
    const header = tmpl.components.find(c => c.type === 'HEADER');
    const body = tmpl.components.find(c => c.type === 'BODY');
    const footer = tmpl.components.find(c => c.type === 'FOOTER');
    const buttons = tmpl.components.find(c => c.type === 'BUTTONS');
    if (header?.format === 'IMAGE') chips.push({ label: 'IMAGE', cls: 'image' });
    else if (header?.format === 'VIDEO') chips.push({ label: 'VIDEO', cls: 'video' });
    else if (header?.format === 'DOCUMENT') chips.push({ label: 'DOCUMENT', cls: 'document' });
    else if (header?.text) chips.push({ label: 'TEXT HEADER', cls: 'text' });
    if (body) chips.push({ label: 'BODY', cls: 'text' });
    if (footer) chips.push({ label: 'FOOTER', cls: 'text' });
    if (buttons) chips.push({ label: `${buttons.buttons?.length || 0} BUTTON(S)`, cls: 'button' });
    return chips;
  };

  return (
    <div className="wa-step3-grid">
      {/* ── LEFT PANEL: Template Browser ── */}
      <div className="wa-left-panel">
        <h4 className="wa-panel-heading">
          <Sparkles style={{ width: 15, height: 15, color: '#2563eb' }} />
          Select Approved Template
        </h4>

        <WhatsAppTemplateGallery
          templates={templateList}
          selectedTemplateId={selectedTemplateId}
          onSelectTemplate={onSelectTemplate}
        />
      </div>

      {/* ── RIGHT PANEL: Preview + Info + Variable Mapping ── */}
      <div className="wa-right-panel">

        {/* Preview Header */}
        <div className="wa-preview-section-label">
          <h4 className="wa-preview-section-title">
            <Smartphone style={{ width: 15, height: 15, color: '#2563eb' }} />
            Live WhatsApp Preview
          </h4>
          {selectedTemplate && (
            <span className="wa-preview-approved-badge">
              <span>✅</span> Approved
            </span>
          )}
        </div>

        {/* Auto-Fit Phone Preview Outer */}
        <div className="wa-preview-outer" ref={outerRef}>
          <div className="wa-preview-scale-wrapper" ref={scaleRef}>
            <WhatsAppPreview
              template={selectedTemplate}
              variableMappings={variableMappings}
            />
          </div>
        </div>

        {/* ── Template Information Card ── */}
        {selectedTemplate && (
          <div className="wa-info-card">
            <div className="wa-info-card-header">
              <h5 className="wa-info-card-title">{selectedTemplate.name}</h5>
              {selectedTemplate.category === 'MARKETING' && (
                <span className="wa-badge wa-badge-marketing">📣 Marketing</span>
              )}
              {selectedTemplate.category === 'UTILITY' && (
                <span className="wa-badge wa-badge-utility">📦 Utility</span>
              )}
              {(selectedTemplate.category === 'AUTHENTICATION' || selectedTemplate.category === 'AUTH') && (
                <span className="wa-badge wa-badge-auth">🛡 Auth</span>
              )}
            </div>

            <div className="wa-info-card-grid">
              <div className="wa-info-item">
                <span className="wa-info-label">
                  <Globe style={{ width: 10, height: 10 }} /> Language
                </span>
                <span className="wa-info-value">{selectedTemplate.language || 'en_US'}</span>
              </div>
              <div className="wa-info-item">
                <span className="wa-info-label">
                  <Hash style={{ width: 10, height: 10 }} /> Variables
                </span>
                <span className="wa-info-value">{variableMappings.length}</span>
              </div>
              <div className="wa-info-item">
                <span className="wa-info-label">
                  <Tag style={{ width: 10, height: 10 }} /> Status
                </span>
                <span className="wa-info-value" style={{ color: '#10b981' }}>✅ Approved</span>
              </div>
            </div>

            {/* Component Chips */}
            <div>
              <span className="wa-info-label" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Layers style={{ width: 10, height: 10 }} /> Components
              </span>
              <div className="wa-info-components-row">
                {getComponentChips(selectedTemplate).map((chip, i) => (
                  <span key={i} className={`wa-tag-chip ${chip.cls}`}>{chip.label}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Variable Mapping Settings Panel ── */}
        {selectedTemplate && variableMappings.length > 0 && (
          <div className="wa-vmap-card">
            <div className="wa-vmap-card-header">
              <h5 className="wa-vmap-card-title">
                <Sliders style={{ width: 14, height: 14, color: '#2563eb' }} />
                Map Variables to CSV Columns
              </h5>
              <span className="wa-vmap-count-pill">{variableMappings.length} variable{variableMappings.length !== 1 ? 's' : ''}</span>
            </div>

            <p style={{ margin: 0, fontSize: 11.5, color: '#64748b', lineHeight: 1.5 }}>
              Select the CSV column for each template placeholder. Fallback values are used when the field is empty.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {variableMappings.map((m, idx) => (
                <div key={idx} className="wa-vmap-row">
                  <div className="wa-vmap-row-top">
                    <span className="wa-vmap-var-label">
                      {'{{'}{m.varIndex}{'}}'}
                    </span>
                    <span className="wa-vmap-comp-tag">{m.componentType}</span>
                  </div>

                  <div className="wa-vmap-fields">
                    <div>
                      <div className="wa-vmap-field-label">
                        <Database style={{ width: 9, height: 9 }} /> CSV Column
                      </div>
                      <select
                        className="wa-vmap-select"
                        value={m.field}
                        onChange={(e) => onUpdateMapping(idx, { field: e.target.value })}
                      >
                        {headers.map((h, i) => (
                          <option key={`vmap-h-${h}-${i}`} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="wa-vmap-field-label">
                        <ChevronRight style={{ width: 9, height: 9 }} /> Fallback Value
                      </div>
                      <input
                        type="text"
                        className="wa-vmap-input"
                        placeholder="e.g., Valued Customer"
                        value={m.fallbackValue}
                        onChange={(e) => onUpdateMapping(idx, { fallbackValue: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   ReviewPhonePreview – auto-scaling phone for Step 4 Review
   Shares the same .wa-preview-outer container as Step3Panel
   ───────────────────────────────────────────────────────── */
interface ReviewPhonePreviewProps {
  template: WhatsAppTemplate | null;
  variableMappings: VarMappingItem[];
}

const ReviewPhonePreview: React.FC<ReviewPhonePreviewProps> = ({ template, variableMappings }) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLDivElement>(null);
  const PHONE_NATURAL_W = 320;
  const PHONE_NATURAL_H = 660;

  const recalcScale = useCallback(() => {
    if (!outerRef.current || !scaleRef.current) return;
    const availW = outerRef.current.clientWidth - 72;
    const availH = outerRef.current.clientHeight - 72;
    const scaleByW = Math.min(1, availW / PHONE_NATURAL_W);
    const scaleByH = availH > 0 ? Math.min(1, availH / PHONE_NATURAL_H) : 1;
    const scale = Math.min(scaleByW, scaleByH);
    scaleRef.current.style.transform = `scale(${scale})`;
    outerRef.current.style.minHeight = `${Math.ceil(PHONE_NATURAL_H * scale) + 72}px`;
  }, []);

  useEffect(() => {
    const t = setTimeout(() => recalcScale(), 60);
    const ro = new ResizeObserver(() => recalcScale());
    if (outerRef.current) ro.observe(outerRef.current);
    if (scaleRef.current) ro.observe(scaleRef.current);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, [template, variableMappings, recalcScale]);

  return (
    <div className="wa-preview-outer" ref={outerRef}>
      <div className="wa-preview-scale-wrapper" ref={scaleRef}>
        <WhatsAppPreview template={template} variableMappings={variableMappings} />
      </div>
    </div>
  );
};

export const WhatsAppCampaignModal: React.FC<WhatsAppCampaignModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);

  // Step 1 & 2: CSV Upload & Headers
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvFileKey, setCsvFileKey] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [nameColumn, setNameColumn] = useState('');
  const [phoneColumn, setPhoneColumn] = useState('');
  const [contactCount, setContactCount] = useState(4);

  // Step 3: Templates & Variable Mapping
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [variableMappings, setVariableMappings] = useState<VarMappingItem[]>([]);
  const [campaignName, setCampaignName] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Step 4: Schedule & Retry Settings
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:30');
  const [isRetryEnabled, setIsRetryEnabled] = useState(false);
  const [attempt1, setAttempt1] = useState<number>(2);
  const [attempt2, setAttempt2] = useState<number>(4);
  const [attempt3, setAttempt3] = useState<number>(6);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      if (!scheduleDate) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setScheduleDate(tomorrow.toISOString().split('T')[0]);
      }
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const res = await api.post('/api/whatsapp/templates');
      const rawList = Array.isArray(res?.waMsgTemplates)
        ? res.waMsgTemplates
        : Array.isArray(res?.data?.waMsgTemplates)
        ? res.data.waMsgTemplates
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];

      // Combine API templates with rich DEMO_TEMPLATES if API returns fallback or small set
      const combined = rawList.length > 0 ? rawList : DEMO_TEMPLATES;
      setTemplates(combined);

      // Auto-select first template if available
      if (combined.length > 0 && !selectedTemplate) {
        handleSelectTemplate(combined[0]);
      }
    } catch (err: any) {
      setTemplates(DEMO_TEMPLATES);
      if (!selectedTemplate) {
        handleSelectTemplate(DEMO_TEMPLATES[0]);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadCSV = async () => {
    if (!selectedFile) {
      showToast('File Required', 'Please select a CSV file to upload', 'warning');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await api.postFormData('/api/whatsapp/upload-csv-headers', formData);

      if (res.headers && Array.isArray(res.headers)) {
        setHeaders(res.headers);
        setCsvFileKey(res.csvFileKey || `key_${Date.now()}`);
        if (res.rowCount) {
          setContactCount(res.rowCount);
        }

        const suggestedName = res.suggestions?.nameColumn || res.headers.find((h: string) => /name/i.test(h)) || res.headers[0] || '';
        const suggestedPhone = res.suggestions?.phoneColumn || res.headers.find((h: string) => /phone|mobile/i.test(h)) || res.headers[1] || '';

        setNameColumn(suggestedName);
        setPhoneColumn(suggestedPhone);

        showToast('CSV Uploaded', `Extracted ${res.headers.length} header columns (${res.rowCount || 4} contacts)`, 'success');
        setStep(2);
      } else {
        throw new Error('Invalid header response from server');
      }
    } catch (err: any) {
      showToast('Upload Error', err.message || 'Failed to parse CSV headers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: WhatsAppTemplate) => {
    const tmplId = template._id || template.id || template.name;
    setSelectedTemplateId(tmplId);
    setSelectedTemplate(template);

    // Extract placeholders {{1}}, {{2}} or {{var}} from HEADER & BODY components
    const newMappings: VarMappingItem[] = [];

    template.components.forEach((comp) => {
      if (comp.type === 'HEADER' || comp.type === 'BODY') {
        const matches = (comp.text || '').match(/\{\{(.*?)\}\}/g);
        if (matches && matches.length > 0) {
          matches.forEach((m, idx) => {
            const suggestedHeader = idx === 0
              ? (nameColumn || headers[0] || 'name')
              : (phoneColumn || headers[1] || 'phoneNo');
            newMappings.push({
              componentType: comp.type as 'HEADER' | 'BODY',
              varIndex: idx + 1,
              field: suggestedHeader,
              fallbackValue: comp.type === 'HEADER' ? 'best Customer' : 'your address',
            });
          });
        }
      }
    });

    setVariableMappings(newMappings);
  };

  const handleUpdateMapping = (index: number, updated: Partial<VarMappingItem>) => {
    setVariableMappings((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updated };
      return copy;
    });
  };

  const validateVariableMappings = (): boolean => {
    if (!selectedTemplate) return true;
    for (const m of variableMappings) {
      if (!m.field || !m.field.trim()) {
        showToast(
          'Variable Mapping Required',
          `Please select a CSV column for ${m.componentType} {{${m.varIndex}}} in the selected template`,
          'warning'
        );
        return false;
      }
    }
    return true;
  };

  const buildTemplateVariableData = () => {
    if (!selectedTemplate) return [];

    const result: any[] = [];

    ['HEADER', 'BODY'].forEach((typeStr) => {
      const comp = selectedTemplate.components.find((c) => c.type === typeStr);
      if (comp) {
        const compMappings = variableMappings.filter(
          (m) => m.componentType === typeStr
        );

        const variables = compMappings.length > 0
          ? compMappings.map((m) => ({
              field: m.field.trim() || (typeStr === 'HEADER' ? nameColumn || 'name' : phoneColumn || 'phoneNo'),
              fallbackValue: m.fallbackValue ? m.fallbackValue.trim() : (typeStr === 'HEADER' ? 'best Customer' : 'your address'),
            }))
          : [
              {
                field: typeStr === 'HEADER' ? nameColumn || 'name' : phoneColumn || 'phoneNo',
                fallbackValue: typeStr === 'HEADER' ? 'best Customer' : 'your address',
              },
            ];

        if (typeStr === 'HEADER') {
          result.push({
            type: 'HEADER',
            format: comp.format || 'TEXT',
            show: true,
            variables,
          });
        } else if (typeStr === 'BODY') {
          result.push({
            type: 'BODY',
            show: true,
            variables,
          });
        }
      }
    });

    return result;
  };

  const handleTriggerCampaign = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!campaignName.trim()) {
      showToast('Campaign Name Required', 'Please enter a name for this WhatsApp campaign', 'warning');
      return;
    }
    if (!selectedTemplate) {
      showToast('Template Required', 'Please select a WhatsApp message template', 'warning');
      return;
    }
    if (!nameColumn || !phoneColumn) {
      showToast('Mapping Required', 'Please select Name and Phone columns', 'warning');
      return;
    }
    if (!validateVariableMappings()) {
      return;
    }

    if (publishMode === 'schedule' && !scheduleDate) {
      showToast('Schedule Date Required', 'Please select a date for scheduled delivery', 'warning');
      return;
    }

    setLoading(true);
    try {
      const templateVariableData = buildTemplateVariableData();
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

      // Schedule & Retry construction
      const formattedScheduleAt = publishMode === 'schedule' && scheduleDate
        ? `${scheduleDate}T${scheduleTime.length === 5 ? scheduleTime + ':00' : scheduleTime}`
        : undefined;

      const retries = isRetryEnabled ? [Number(attempt1), Number(attempt2), Number(attempt3)] : [];

      const campaignMeta: any = {
        name: campaignName.trim(),
        templateId: selectedTemplate._id || selectedTemplate.id || selectedTemplate.name,
        publishMode,
        isRetryEnabled,
        retries,
        tags,
        templateVariableData,
      };

      if (publishMode === 'schedule' && formattedScheduleAt) {
        campaignMeta.scheduleAt = formattedScheduleAt;
      }

      const payload = {
        csvFileKey,
        systemMapping: {
          nameColumn: nameColumn,
          phoneColumn: phoneColumn,
        },
        campaignMeta,
        campaignName: campaignName.trim(),
        templateId: selectedTemplate._id || selectedTemplate.id || selectedTemplate.name,
        nameColumn: nameColumn,
        phoneColumn: phoneColumn,
        contactCount,
      };

      const res = await api.post('/api/whatsapp/trigger-campaign', payload);

      showToast(
        publishMode === 'schedule' ? 'Campaign Scheduled' : 'Campaign Dispatched',
        res.message || (publishMode === 'schedule' ? 'WhatsApp campaign scheduled successfully!' : 'WhatsApp bulk campaign triggered successfully!'),
        'success'
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('Trigger Failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const templateList = Array.isArray(templates) ? templates : [];

  return (
    <div className="wa-fullpage-overlay">
      {/* SaaS Wizard Header */}
      <div className="wa-wizard-header">
        <div style={{ maxWidth: 1600, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)' }}>
              <MessageSquare style={{ width: 22, height: 22, color: '#ffffff' }} />
            </div>
            <div>
              <h2 style={{ color: '#ffffff', margin: 0, fontSize: 20, fontWeight: 800 }}>
                WhatsApp Bulk Campaign Studio
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>
                Upload audience CSV, choose approved WhatsApp templates & inspect live recipient previews
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <X style={{ width: 16, height: 16 }} /> Exit Studio
          </button>
        </div>
      </div>

      {/* Premium Stepper Bar */}
      <div className="wa-wizard-stepper">
        <div style={{ maxWidth: 1600, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          {[
            { n: 1, label: 'Upload CSV' },
            { n: 2, label: 'Column Mapping' },
            { n: 3, label: 'Template & Preview' },
            { n: 4, label: 'Review & Launch' },
          ].map(({ n, label }, i) => (
            <React.Fragment key={n}>
              <div className={`wa-step-item ${step === n ? 'active' : step > n ? 'completed' : ''}`}>
                <span className="wa-step-dot">
                  {step > n ? '✓' : n}
                </span>
                <span className="wa-step-label">{label}</span>
              </div>
              {i < 3 && <div className="wa-step-divider" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Full-Width Content Container */}
      <div className="wa-fullpage-container">
        <div style={{ flex: 1, padding: '28px 0' }}>
          {/* STEP 1: UPLOAD CSV */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 540, margin: '0 auto' }}>
              <div
                style={{
                  border: '2px dashed #2563eb',
                  borderRadius: 14,
                  padding: 40,
                  textAlign: 'center',
                  background: '#eff6ff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => document.getElementById('whatsapp-csv-file-input')?.click()}
              >
                <Upload style={{ width: 44, height: 44, color: '#2563eb', marginBottom: 12 }} />
                <h4 style={{ margin: '0 0 6px 0', fontSize: 16, color: '#0f172a', fontWeight: 700 }}>
                  Upload Contacts CSV File
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.4 }}>
                  Ensure your file includes columns for Contact Name and WhatsApp Phone Number (with country code).
                </p>

                <input
                  id="whatsapp-csv-file-input"
                  type="file"
                  accept=".csv"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>

              {selectedFile && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: '#e0f2fe',
                    border: '1px solid #7dd3fc',
                    borderRadius: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileText style={{ width: 20, height: 20, color: '#0284c7' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0369a1' }}>
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Check style={{ width: 20, height: 20, color: '#0284c7' }} />
                </div>
              )}
            </div>
          )}

          {/* STEP 2: COLUMN MAPPING */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 540, margin: '0 auto' }}>
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 700, color: '#0f172a' }}>
                  Extracted Header Columns ({headers.length}):
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {headers.map((h, i) => (
                    <span
                      key={i}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        padding: '3px 10px',
                        borderRadius: 6,
                        fontFamily: 'monospace',
                        fontSize: 12,
                        color: '#334155',
                      }}
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Contact Name Column <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  className="property-select"
                  value={nameColumn}
                  onChange={(e) => setNameColumn(e.target.value)}
                >
                  {headers.map((h, i) => (
                    <option key={`hdr-name-${h}-${i}`} value={h}>
                      {h} {h === nameColumn ? '(Auto-suggested)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  WhatsApp Phone Number Column <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  className="property-select"
                  value={phoneColumn}
                  onChange={(e) => setPhoneColumn(e.target.value)}
                >
                  {headers.map((h, i) => (
                    <option key={`hdr-phone-${h}-${i}`} value={h}>
                      {h} {h === phoneColumn ? '(Auto-suggested)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ── STEP 3: PREMIUM 2-PANEL TEMPLATE & LIVE PREVIEW ── */}
          {step === 3 && (
            <Step3Panel
              templateList={templateList}
              selectedTemplateId={selectedTemplateId}
              selectedTemplate={selectedTemplate}
              variableMappings={variableMappings}
              headers={headers}
              onSelectTemplate={handleSelectTemplate}
              onUpdateMapping={handleUpdateMapping}
            />
          )}

          {/* STEP 4: CAMPAIGN META, CAMPAIGN DELIVERY (SCHEDULE) & RETRY SETTINGS */}
          {step === 4 && (
            <div className="wa-wizard-grid" style={{ display: 'grid', gridTemplateColumns: '52% 48%', gap: 24, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* 1. Basic Metadata */}
                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                    Campaign Details
                  </h4>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      Campaign Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="property-input"
                      placeholder="e.g., Summer VIP Blast Campaign"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: 12 }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      Campaign Tags (Comma-separated)
                    </label>
                    <input
                      type="text"
                      className="property-input"
                      placeholder="e.g., promo, whatsapp, bulk"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                    />
                  </div>
                </div>

                {/* 2. DELIVERY & SCHEDULING MODE */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Send style={{ width: 16, height: 16, color: '#2563eb' }} /> Campaign Delivery Schedule
                  </h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: 12, color: '#64748b' }}>
                    Choose whether to dispatch messages immediately or schedule for a future date & time.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {/* Mode: Send Now */}
                    <div
                      onClick={() => setPublishMode('now')}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: publishMode === 'now' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: publishMode === 'now' ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: publishMode === 'now' ? '5px solid #2563eb' : '2px solid #cbd5e1',
                          background: '#ffffff',
                          boxSizing: 'border-box',
                        }}
                      />
                      <div>
                        <h5 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Send Immediately</h5>
                        <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>Dispatch campaign right away</p>
                      </div>
                    </div>

                    {/* Mode: Schedule for Later */}
                    <div
                      onClick={() => setPublishMode('schedule')}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        border: publishMode === 'schedule' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: publishMode === 'schedule' ? '#eff6ff' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: publishMode === 'schedule' ? '5px solid #2563eb' : '2px solid #cbd5e1',
                          background: '#ffffff',
                          boxSizing: 'border-box',
                        }}
                      />
                      <div>
                        <h5 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Schedule for Later</h5>
                        <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>Pick future date & time</p>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Date & Time Pickers */}
                  {publishMode === 'schedule' && (
                    <div style={{ marginTop: 14, background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', animation: 'waFadeIn 0.2s ease' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                            <Calendar style={{ width: 13, height: 13, color: '#2563eb' }} /> Date
                          </label>
                          <input
                            type="date"
                            className="property-input"
                            style={{ fontSize: 13 }}
                            value={scheduleDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setScheduleDate(e.target.value)}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                            <Clock style={{ width: 13, height: 13, color: '#2563eb' }} /> Time
                          </label>
                          <input
                            type="time"
                            className="property-input"
                            style={{ fontSize: 13 }}
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                          />
                        </div>
                      </div>

                      {scheduleDate && (
                        <p style={{ margin: '8px 0 0 0', fontSize: 11, color: '#2563eb', fontWeight: 600 }}>
                          🗓 Scheduled for: <code>{scheduleDate}T{scheduleTime.length === 5 ? scheduleTime + ':00' : scheduleTime}</code>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. RETRY SETTINGS SECTION */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <RotateCcw style={{ width: 16, height: 16, color: '#2563eb' }} /> Retry Settings
                      </h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#64748b' }}>
                        Automatically re-attempt delivery for undelivered contacts.
                      </p>
                    </div>

                    {/* Toggle Switch */}
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: isRetryEnabled ? '#2563eb' : '#64748b' }}>
                        {isRetryEnabled ? 'ON' : 'OFF'}
                      </span>
                      <div
                        onClick={() => setIsRetryEnabled(!isRetryEnabled)}
                        style={{
                          width: 44,
                          height: 24,
                          borderRadius: 12,
                          background: isRetryEnabled ? '#2563eb' : '#cbd5e1',
                          padding: 2,
                          transition: 'background 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: '#ffffff',
                            transform: isRetryEnabled ? 'translateX(20px)' : 'translateX(0px)',
                            transition: 'transform 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          }}
                        />
                      </div>
                    </label>
                  </div>

                  {/* Retry Configuration Dropdowns */}
                  {isRetryEnabled && (
                    <div style={{ marginTop: 14, background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', animation: 'waFadeIn 0.2s ease', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#334155' }}>
                        Configure Retry Attempts:
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
                            Attempt 1 after
                          </label>
                          <select
                            className="property-select"
                            style={{ fontSize: 12, padding: '6px' }}
                            value={attempt1}
                            onChange={(e) => setAttempt1(Number(e.target.value))}
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                              <option key={`att1-${h}`} value={h}>
                                {h} {h === 1 ? 'Hour' : 'Hours'}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
                            Attempt 2 after
                          </label>
                          <select
                            className="property-select"
                            style={{ fontSize: 12, padding: '6px' }}
                            value={attempt2}
                            onChange={(e) => setAttempt2(Number(e.target.value))}
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                              <option key={`att2-${h}`} value={h}>
                                {h} {h === 1 ? 'Hour' : 'Hours'}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>
                            Attempt 3 after
                          </label>
                          <select
                            className="property-select"
                            style={{ fontSize: 12, padding: '6px' }}
                            value={attempt3}
                            onChange={(e) => setAttempt3(Number(e.target.value))}
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                              <option key={`att3-${h}`} value={h}>
                                {h} {h === 1 ? 'Hour' : 'Hours'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary Box */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 10,
                    padding: 16,
                    fontSize: 13,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Audience CSV Key:</span>
                    <code style={{ fontSize: 11 }}>{csvFileKey}</code>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Recipient Phone Column:</span>
                    <strong>{phoneColumn}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Recipient Name Column:</span>
                    <strong>{nameColumn}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Selected Template ID:</span>
                    <span style={{ fontWeight: 700, color: '#2563eb' }}>
                      {selectedTemplate?._id || selectedTemplate?.id || selectedTemplate?.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile Preview Summary – reuses the same centered scale wrapper */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Smartphone style={{ width: 15, height: 15, color: '#2563eb' }} />
                  Target Message Preview
                </h4>
                <ReviewPhonePreview
                  template={selectedTemplate}
                  variableMappings={variableMappings}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SaaS Sticky Bottom Footer Bar */}
      <div className="wa-sticky-footer">
        <div style={{ width: '100%', maxWidth: 1600, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            {step > 1 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep((s) => (s - 1) as any)}
                disabled={loading}
                style={{ padding: '9px 18px', fontSize: 13, fontWeight: 600 }}
              >
                <ArrowLeft style={{ width: 15, height: 15 }} /> Back
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {step === 1 && (
              <button
                type="button"
                className="btn"
                style={{ background: '#2563eb', color: '#ffffff', fontWeight: 600, padding: '9px 20px' }}
                onClick={handleUploadCSV}
                disabled={loading || !selectedFile}
              >
                {loading ? 'Uploading CSV…' : 'Upload & Process Headers'}
                <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                className="btn"
                style={{ background: '#2563eb', color: '#ffffff', fontWeight: 600, padding: '9px 20px' }}
                onClick={() => {
                  if (!nameColumn || !phoneColumn) {
                    showToast('Mapping Required', 'Please select Name and Phone columns', 'warning');
                    return;
                  }
                  setStep(3);
                }}
              >
                Next: Select Template & Preview <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                className="btn"
                style={{ background: '#2563eb', color: '#ffffff', fontWeight: 600, padding: '9px 20px' }}
                onClick={() => {
                  if (!selectedTemplate) {
                    showToast('Template Required', 'Please select a WhatsApp template', 'warning');
                    return;
                  }
                  if (!validateVariableMappings()) {
                    return;
                  }
                  if (!campaignName) {
                    setCampaignName(`${selectedTemplate.name}_Blast_${new Date().toLocaleDateString('en-GB').replace(/\//g, '')}`);
                  }
                  setStep(4);
                }}
              >
                Next: Review & Launch <ArrowRight style={{ width: 15, height: 15 }} />
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                className="btn"
                style={{ background: '#2563eb', color: '#ffffff', fontWeight: 700, padding: '10px 24px', fontSize: 14 }}
                onClick={handleTriggerCampaign}
                disabled={loading}
              >
                {loading ? (publishMode === 'schedule' ? 'Scheduling Campaign…' : 'Dispatching Campaign…') : (publishMode === 'schedule' ? '📅 Schedule WhatsApp Campaign' : '🚀 Launch WhatsApp Bulk Campaign')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
