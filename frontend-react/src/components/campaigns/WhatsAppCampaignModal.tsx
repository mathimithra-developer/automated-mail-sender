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
  ChevronRight,
  Search,
  RefreshCw,
  Users,
  ArrowUpDown,
  Loader2,
  Undo,
  Info,
  Eye,
  CheckCircle
} from 'lucide-react';
import { WhatsAppTemplate, Segment } from '../../types';
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
  componentType: 'HEADER' | 'BODY' | 'BUTTONS';
  varIndex: number;
  buttonIndex?: number;
  buttonType?: string;
  buttonName?: string;
  url?: string;
  field: string;
  fallbackValue: string;
  cardIndex?: number;
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
          { type: 'URL', text: 'Track Order', url: 'https://example.com/track/{{1}}' },
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
          { type: 'URL', text: 'View Live Map', url: 'https://example.com/map/{{1}}' },
          { type: 'QUICK_REPLY', text: 'Reschedule Delivery' },
        ],
      },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT – WhatsAppCampaignModal (5-step flow)
   ═══════════════════════════════════════════════════════════ */
export const WhatsAppCampaignModal: React.FC<WhatsAppCampaignModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [launchSuccess, setLaunchSuccess] = useState(false);

  // Discard-confirmation dialog state
  const [discardConfirm, setDiscardConfirm] = useState(false);
  
  // Launch-confirmation dialog state
  const [launchConfirm, setLaunchConfirm] = useState(false);

  // Step 1: Segment Selection
  const [segments, setSegments] = useState<any[]>([]);
  const [segmentsLoading, setSegmentsLoading] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<any | null>(null);
  const [segmentSearch, setSegmentSearch] = useState('');
  const [segmentSort, setSegmentSort] = useState<'name' | 'count' | 'date'>('date');
  const [segmentProcessing, setSegmentProcessing] = useState(false);

  // Customer Preview Modal (Step 1)
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerModalLoading, setCustomerModalLoading] = useState(false);
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerPage, setCustomerPage] = useState(1);
  const customerLimit = 10;

  // CSV state (auto-populated from segment)
  const [csvFileKey, setCsvFileKey] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [nameColumn, setNameColumn] = useState('');
  const [phoneColumn, setPhoneColumn] = useState('');
  const [emailColumn, setEmailColumn] = useState('');
  const [companyColumn, setCompanyColumn] = useState('');
  const [contactCount, setContactCount] = useState(0);

  // Step 3 & 4: Templates & Variable Mapping
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [variableMappings, setVariableMappings] = useState<VarMappingItem[]>([]);
  const [campaignName, setCampaignName] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Step 5: Schedule & Retry Settings
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:30');
  const [isRetryEnabled, setIsRetryEnabled] = useState(false);
  const [attempt1, setAttempt1] = useState<number>(2);
  const [attempt2, setAttempt2] = useState<number>(4);
  const [attempt3, setAttempt3] = useState<number>(6);

  // ── Helper: returns true if the user has begun filling anything in ──
  const hasUnsavedChanges = useCallback(() => {
    return !!selectedSegment || !!selectedTemplate || !!campaignName.trim() || step > 1;
  }, [selectedSegment, selectedTemplate, campaignName, step]);

  // ── Reset the entire wizard to factory-fresh state ──
  const resetWizard = useCallback(() => {
    setStep(1);
    setLoading(false);
    setLaunchSuccess(false);
    setDiscardConfirm(false);
    setLaunchConfirm(false);

    // Step 1
    setSelectedSegment(null);
    setSegmentSearch('');
    setSegmentSort('date');
    setSegmentProcessing(false);

    // Customer modal
    setShowCustomerModal(false);
    setCustomerModalLoading(false);
    setCustomerList([]);
    setCustomerSearch('');
    setCustomerPage(1);

    // CSV Mapping
    setCsvFileKey('');
    setHeaders([]);
    setNameColumn('');
    setPhoneColumn('');
    setEmailColumn('');
    setCompanyColumn('');
    setContactCount(0);

    // Step 3 & 4
    setSelectedTemplateId('');
    setSelectedTemplate(null);
    setVariableMappings([]);
    setCampaignName('');
    setTagsInput('');

    // Step 5
    setPublishMode('now');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduleDate(tomorrow.toISOString().split('T')[0]);
    setScheduleTime('09:30');
    setIsRetryEnabled(false);
    setAttempt1(2);
    setAttempt2(4);
    setAttempt3(6);

    // Clear any localStorage/sessionStorage drafts
    try {
      const draftKeys = Object.keys(localStorage).filter(k => k.startsWith('wa_campaign_draft'));
      draftKeys.forEach(k => localStorage.removeItem(k));
      const sDraftKeys = Object.keys(sessionStorage).filter(k => k.startsWith('wa_campaign_draft'));
      sDraftKeys.forEach(k => sessionStorage.removeItem(k));
    } catch (_) {
      // Storage access might be blocked in some environments
    }
  }, []);

  // ── On open: always start fresh (with unsaved-changes guard) ──
  const prevIsOpen = useRef(false);
  useEffect(() => {
    const justOpened = isOpen && !prevIsOpen.current;
    prevIsOpen.current = isOpen;

    if (justOpened) {
      // Always fetch latest segments & templates
      fetchSegments();
      fetchTemplates();

      if (hasUnsavedChanges()) {
        // User had an in-progress draft — ask before nuking it
        setDiscardConfirm(true);
      } else {
        // Clean open: reset immediately
        resetWizard();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchSegments = async () => {
    setSegmentsLoading(true);
    try {
      const res = await api.get('/api/segments?all=true');
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setSegments(list);
    } catch (err) {
      console.warn('Failed to fetch segments:', err);
      setSegments([]);
    } finally {
      setSegmentsLoading(false);
    }
  };

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

      const combined = rawList.length > 0 ? rawList : DEMO_TEMPLATES;
      setTemplates(combined);
      // Never auto-select a template on open — the user must choose explicitly
    } catch (err: any) {
      setTemplates(DEMO_TEMPLATES);
      // Never auto-select a template on open
    }
  };

  // Segment Selection: auto-generate CSV from segment export
  const handleSelectSegment = async (segment: any) => {
    if (selectedSegment?._id === segment._id) return;
    setSelectedSegment(segment);
    setSegmentProcessing(true);

    try {
      const response = await fetch(`/api/segments/${segment._id}/export`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to export segment CSV');
      const csvText = await response.text();

      const blob = new Blob([csvText], { type: 'text/csv' });
      const file = new File([blob], `segment-${segment.name.replace(/[^a-z0-9]/gi, '_')}.csv`, { type: 'text/csv' });

      const formData = new FormData();
      formData.append('file', file);

      const res = await api.postFormData('/api/whatsapp/upload-csv-headers', formData);

      if (res.headers && Array.isArray(res.headers)) {
        setHeaders(res.headers);
        setCsvFileKey(res.csvFileKey || `key_${Date.now()}`);
        setContactCount(res.rowCount || segment.cachedCount || segment.calculatedCount || 0);

        const suggestedName = res.suggestions?.nameColumn || res.headers.find((h: string) => /name/i.test(h)) || res.headers[0] || '';
        const suggestedPhone = res.suggestions?.phoneColumn || res.headers.find((h: string) => /phone|mobile/i.test(h)) || res.headers[1] || '';
        const suggestedEmail = res.headers.find((h: string) => /email/i.test(h)) || '';
        const suggestedCompany = res.headers.find((h: string) => /company/i.test(h)) || '';

        setNameColumn(suggestedName);
        setPhoneColumn(suggestedPhone);
        setEmailColumn(suggestedEmail);
        setCompanyColumn(suggestedCompany);

        showToast('Segment Ready', `${segment.name} — ${res.rowCount || contactCount} contacts loaded`, 'success');
      } else {
        throw new Error('Invalid response from CSV processing');
      }
    } catch (err: any) {
      showToast('Segment Error', err.message || 'Failed to process segment', 'error');
      setSelectedSegment(null);
    } finally {
      setSegmentProcessing(false);
    }
  };

  // View Segment Customers Modal (Step 1 Preview)
  const parseCSV = (csvText: string) => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];
    
    const splitCSVLine = (line: string) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^["']|["']$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      return result;
    };

    const headers = splitCSVLine(lines[0]);
    const rows: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = splitCSVLine(lines[i]);
      const obj: any = {};
      headers.forEach((h, idx) => {
        obj[h.toLowerCase()] = values[idx] || '';
      });
      
      const name = obj.name || obj.fullname || obj.first_name || obj.firstname || '';
      const phone = obj.phone || obj.phoneno || obj.mobile || obj.phone_number || '';
      const email = obj.email || obj.email_address || '';
      const tags = obj.tags || obj.tag || '';
      const status = obj.status || 'Active';
      
      rows.push({ name, phone, email, tags, status });
    }
    return rows;
  };

  const handleViewCustomers = async (segment: any) => {
    setShowCustomerModal(true);
    setCustomerModalLoading(true);
    setCustomerList([]);
    setCustomerPage(1);
    setCustomerSearch('');

    try {
      const response = await fetch(`/api/segments/${segment._id}/export`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to load customers');
      const csvText = await response.text();
      const parsed = parseCSV(csvText);
      setCustomerList(parsed);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to load segment contacts', 'error');
    } finally {
      setCustomerModalLoading(false);
    }
  };

  // Template Selection
  const handleSelectTemplate = async (template: WhatsAppTemplate) => {
    const tmplId = template._id || template.id || template.name;
    setSelectedTemplateId(tmplId);
    setSelectedTemplate(template);

    let newMappings: VarMappingItem[] = [];
    let apiSuccess = false;

    try {
      const res = await api.post('/api/whatsapp/templates/get-variables-template-data', { templateId: tmplId });
      const varTemplates = res?.data?.variableTemplate || res?.variableTemplate;
      
      if (Array.isArray(varTemplates)) {
        varTemplates.forEach((comp: any) => {
          const type = comp.type;
          
          if ((type === 'HEADER' || type === 'BODY') && Array.isArray(comp.variables)) {
            comp.variables.forEach((v: any, vIdx: number) => {
              const suggestedHeader = type === 'HEADER'
                ? (nameColumn || headers[0] || 'name')
                : (vIdx === 0
                    ? (nameColumn || headers[0] || 'name')
                    : (vIdx === 1
                        ? (phoneColumn || headers[1] || 'phoneNo')
                        : (headers[vIdx] || '')));
              
              newMappings.push({
                componentType: type,
                varIndex: vIdx + 1,
                field: suggestedHeader,
                fallbackValue: comp.type === 'HEADER' ? 'Customer' : '',
              });
            });
          } else if (type === 'BUTTONS' && Array.isArray(comp.variables)) {
            comp.variables.forEach((v: any, vIdx: number) => {
              newMappings.push({
                componentType: 'BUTTONS',
                varIndex: vIdx + 1,
                buttonIndex: comp.buttonIndex,
                buttonType: comp.buttonType,
                buttonName: comp.buttonName,
                url: comp.url,
                field: nameColumn || headers[0] || 'name',
                fallbackValue: comp.buttonType === 'COPY_CODE' ? 'WELCOME20' : 'shop',
              });
            });
          } else if (type === 'CAROUSEL' && Array.isArray(comp.cards)) {
            comp.cards.forEach((card: any, cardIdx: number) => {
              if (Array.isArray(card.templateVariables)) {
                card.templateVariables.forEach((cardComp: any) => {
                  const cType = cardComp.type;
                  if ((cType === 'HEADER' || cType === 'BODY') && Array.isArray(cardComp.variables)) {
                    cardComp.variables.forEach((v: any, vIdx: number) => {
                      const suggestedHeader = cType === 'HEADER'
                        ? (nameColumn || headers[0] || 'name')
                        : (vIdx === 0
                            ? (nameColumn || headers[0] || 'name')
                            : (vIdx === 1
                                ? (phoneColumn || headers[1] || 'phoneNo')
                                : (headers[vIdx] || '')));
                      
                      newMappings.push({
                        componentType: cType,
                        varIndex: vIdx + 1,
                        cardIndex: cardIdx,
                        field: suggestedHeader,
                        fallbackValue: cType === 'HEADER' ? 'https://example.com/image.png' : '',
                      });
                    });
                  } else if (cType === 'BUTTONS' && Array.isArray(cardComp.variables)) {
                    cardComp.variables.forEach((v: any, vIdx: number) => {
                      newMappings.push({
                        componentType: 'BUTTONS',
                        varIndex: vIdx + 1,
                        cardIndex: cardIdx,
                        buttonIndex: cardComp.buttonIndex,
                        buttonType: cardComp.buttonType,
                        buttonName: cardComp.buttonName,
                        url: cardComp.url,
                        field: nameColumn || headers[0] || 'name',
                        fallbackValue: cardComp.buttonType === 'COPY_CODE' ? 'WELCOME20' : 'shop',
                      });
                    });
                  }
                });
              }
            });
          }
        });
        apiSuccess = true;
      }
    } catch (err) {
      console.warn('Failed to fetch template variables from API, falling back to regex parsing:', err);
    }

    if (!apiSuccess) {
      newMappings = [];
      template.components.forEach((comp, compIdx) => {
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
                fallbackValue: comp.type === 'HEADER' ? 'Customer' : '',
              });
            });
          }
        } else if (comp.type === 'BUTTONS' && Array.isArray(comp.buttons)) {
          comp.buttons.forEach((btn: any, btnIdx: number) => {
            const btnText = btn.text || btn.title || '';
            const btnUrl = btn.url || '';
            const btnType = btn.type || '';
            const urlMatches = btnUrl.match(/\{\{(.*?)\}\}/g);
            if (urlMatches && urlMatches.length > 0) {
              urlMatches.forEach((m: string, vIdx: number) => {
                newMappings.push({
                  componentType: 'BUTTONS',
                  varIndex: vIdx + 1,
                  buttonIndex: btnIdx,
                  buttonType: btnType,
                  buttonName: btnText,
                  url: btnUrl,
                  field: nameColumn || headers[0] || 'name',
                  fallbackValue: 'shop',
                });
              });
            }
          });
        } else if (comp.type === 'CAROUSEL' && Array.isArray((comp as any).cards)) {
          ((comp as any).cards || []).forEach((card: any, cardIdx: number) => {
            if (Array.isArray(card.components)) {
              card.components.forEach((cardComp: any) => {
                if (cardComp.type === 'HEADER' || cardComp.type === 'BODY') {
                  const matches = (cardComp.text || '').match(/\{\{(.*?)\}\}/g);
                  const isMediaHeader = cardComp.type === 'HEADER' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(cardComp.format);
                  
                  if (matches && matches.length > 0) {
                    matches.forEach((m: string, idx: number) => {
                      const suggestedHeader = idx === 0
                        ? (nameColumn || headers[0] || 'name')
                        : (phoneColumn || headers[1] || 'phoneNo');
                      newMappings.push({
                        componentType: cardComp.type,
                        varIndex: idx + 1,
                        cardIndex: cardIdx,
                        field: suggestedHeader,
                        fallbackValue: cardComp.type === 'HEADER' ? 'Customer' : '',
                      });
                    });
                  } else if (isMediaHeader) {
                    newMappings.push({
                      componentType: 'HEADER',
                      varIndex: 1,
                      cardIndex: cardIdx,
                      field: nameColumn || headers[0] || 'name',
                      fallbackValue: cardComp.example?.header_handle?.[0] || '',
                    });
                  }
                } else if (cardComp.type === 'BUTTONS' && Array.isArray(cardComp.buttons)) {
                  cardComp.buttons.forEach((btn: any, btnIdx: number) => {
                    const btnText = btn.text || btn.title || '';
                    const btnUrl = btn.url || '';
                    const btnType = btn.type || '';
                    const urlMatches = btnUrl.match(/\{\{(.*?)\}\}/g);
                    if (urlMatches && urlMatches.length > 0) {
                      urlMatches.forEach((m: string, vIdx: number) => {
                        newMappings.push({
                          componentType: 'BUTTONS',
                          varIndex: vIdx + 1,
                          cardIndex: cardIdx,
                          buttonIndex: btnIdx,
                          buttonType: btnType,
                          buttonName: btnText,
                          url: btnUrl,
                          field: nameColumn || headers[0] || 'name',
                          fallbackValue: 'shop',
                        });
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }

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
          `Please select a CSV column for ${m.cardIndex !== undefined ? `Card ${m.cardIndex + 1} ` : ''}${m.componentType} {{${m.varIndex}}} in the selected template`,
          'warning'
        );
        return false;
      }
    }
    return true;
  };

  const buildTemplateVariableData = () => {
    if (!selectedTemplate) return [];

    const hasCarousel = selectedTemplate.components.some(c => c.type === 'CAROUSEL');

    if (hasCarousel) {
      const result: any[] = [];
      
      // Top level components (e.g. BODY)
      ['HEADER', 'BODY'].forEach((typeStr) => {
        const comp = selectedTemplate.components.find((c) => c.type === typeStr);
        if (comp) {
          const compMappings = variableMappings.filter(
            (m) => m.componentType === typeStr && m.cardIndex === undefined
          );

          if (compMappings.length > 0) {
            result.push({
              type: typeStr,
              format: typeStr === 'HEADER' ? comp.format || 'TEXT' : undefined,
              show: true,
              variables: compMappings.map((m) => ({
                field: m.field.trim(),
                fallbackValue: m.fallbackValue ? m.fallbackValue.trim() : '',
              })),
            });
          }
        }
      });

      // Carousel component
      const carouselComp = selectedTemplate.components.find(c => c.type === 'CAROUSEL');
      if (carouselComp && Array.isArray((carouselComp as any).cards)) {
        const cardsData = ((carouselComp as any).cards || []).map((card: any, cardIdx: number) => {
          const templateVariables: any[] = [];

          if (Array.isArray(card.components)) {
            card.components.forEach((cardComp: any) => {
              if (cardComp.type === 'HEADER' || cardComp.type === 'BODY') {
                const compMappings = variableMappings.filter(
                  (m) => m.componentType === cardComp.type && m.cardIndex === cardIdx
                );

                if (compMappings.length > 0) {
                  templateVariables.push({
                    type: cardComp.type,
                    format: cardComp.type === 'HEADER' ? cardComp.format || 'IMAGE' : undefined,
                    show: true,
                    variables: compMappings.map((m) => ({
                      field: m.field.trim(),
                      fallbackValue: m.fallbackValue ? m.fallbackValue.trim() : '',
                    })),
                  });
                }
              } else if (cardComp.type === 'BUTTONS' && Array.isArray(cardComp.buttons)) {
                cardComp.buttons.forEach((btn: any, btnIdx: number) => {
                  const btnMappings = variableMappings.filter(
                    (m) => m.componentType === 'BUTTONS' && m.cardIndex === cardIdx && m.buttonIndex === btnIdx
                  );
                  if (btnMappings.length > 0) {
                    const firstMap = btnMappings[0];
                    templateVariables.push({
                      type: 'BUTTONS',
                      buttonType: firstMap.buttonType,
                      buttonName: firstMap.buttonName,
                      buttonIndex: btnIdx,
                      url: firstMap.url,
                      show: true,
                      variables: btnMappings.map((m) => ({
                        field: m.field.trim(),
                        fallbackValue: m.fallbackValue ? m.fallbackValue.trim() : '',
                      })),
                    });
                  }
                });
              }
            });
          }

          return {
            templateVariables,
            templateDetails: {}
          };
        });

        result.push({
          type: 'CAROUSEL',
          cards: cardsData
        });
      }

      return result;
    }

    const result: any[] = [];

    // Header & Body components variables
    ['HEADER', 'BODY'].forEach((typeStr) => {
      const comp = selectedTemplate.components.find((c) => c.type === typeStr);
      if (comp) {
        const compMappings = variableMappings.filter(
          (m) => m.componentType === typeStr
        );

        if (compMappings.length > 0) {
          result.push({
            type: typeStr,
            format: typeStr === 'HEADER' ? comp.format || 'TEXT' : undefined,
            show: true,
            variables: compMappings.map((m) => ({
              field: m.field.trim(),
              fallbackValue: m.fallbackValue ? m.fallbackValue.trim() : '',
            })),
          });
        }
      }
    });

    // Buttons component variables
    const buttonIndices = Array.from(new Set(
      variableMappings
        .filter((m) => m.componentType === 'BUTTONS')
        .map((m) => m.buttonIndex)
    ));

    buttonIndices.forEach((btnIdx) => {
      if (btnIdx === undefined) return;
      const btnMappings = variableMappings.filter(
        (m) => m.componentType === 'BUTTONS' && m.buttonIndex === btnIdx
      );
      if (btnMappings.length > 0) {
        const firstMap = btnMappings[0];
        result.push({
          type: 'BUTTONS',
          buttonType: firstMap.buttonType,
          buttonName: firstMap.buttonName,
          buttonIndex: btnIdx,
          url: firstMap.url,
          show: true,
          variables: btnMappings.map((m) => ({
            field: m.field.trim(),
            fallbackValue: m.fallbackValue ? m.fallbackValue.trim() : '',
          })),
        });
      }
    });

    return result;
  };

  const handleTriggerCampaign = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

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
    setLaunchConfirm(false);
    try {
      const templateVariableData = buildTemplateVariableData();
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

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

      if (formattedScheduleAt) {
        campaignMeta.scheduleAt = formattedScheduleAt;
      }

      const payload: any = {
        csvFileKey,
        systemMapping: { nameColumn, phoneColumn },
        campaignMeta,
        contactCount,
        campaignName: campaignName.trim(),
        templateId: selectedTemplate._id || selectedTemplate.id || selectedTemplate.name,
        nameColumn,
        phoneColumn,
        segmentId: selectedSegment?._id || selectedSegment?.id,
      };

      await api.post('/api/whatsapp/trigger-campaign', payload);

      setLaunchSuccess(true);
      showToast(
        publishMode === 'schedule' ? '📅 Campaign Scheduled' : '🚀 Campaign Launched',
        `WhatsApp campaign "${campaignName}" has been ${publishMode === 'schedule' ? 'scheduled' : 'dispatched'} successfully!`,
        'success'
      );

      setTimeout(() => {
        onSuccess();
        onClose();
        resetWizard();
      }, 1500);
    } catch (err: any) {
      showToast('Launch Error', err.message || 'Failed to trigger WhatsApp campaign', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAttempt = () => {
    if (hasUnsavedChanges() && !launchSuccess) {
      setDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!selectedSegment) {
        showToast('Segment Required', 'Please select a customer segment to target', 'warning');
        return;
      }
      if (!csvFileKey || headers.length === 0) {
        showToast('CSV Not Ready', 'Customer details are still being processed. Please wait.', 'warning');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!nameColumn || !phoneColumn) {
        showToast('Mapping Required', 'Please map the required Name and Phone fields', 'warning');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!selectedTemplate) {
        showToast('Template Required', 'Please select a template to preview', 'warning');
        return;
      }
      // Set default campaign name on templates selection
      if (!campaignName) {
        const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '');
        const cleanSegName = selectedSegment?.name ? selectedSegment.name.replace(/[^a-z0-9]/gi, '_') : 'Blast';
        setCampaignName(`${selectedTemplate.name}_${cleanSegName}_${today}`);
      }
      setStep(4);
    } else if (step === 4) {
      if (!validateVariableMappings()) {
        return;
      }
      setStep(5);
    } else if (step === 5) {
      setLaunchConfirm(true);
    }
  };

  // Helper metadata calculators for Step 4 Left Panel
  const getTemplateMediaType = (tmpl: WhatsAppTemplate) => {
    const header = tmpl.components.find(c => c.type === 'HEADER');
    if (!header) return 'TEXT';
    return header.format || 'TEXT';
  };

  const getTemplateButtonsCount = (tmpl: WhatsAppTemplate) => {
    const buttonsComp = tmpl.components.find(c => c.type === 'BUTTONS');
    return buttonsComp?.buttons?.length || 0;
  };

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

  // Filtered & sorted segments
  const filteredSegments = segments
    .filter((s) => {
      if (!segmentSearch.trim()) return true;
      const q = segmentSearch.toLowerCase();
      return (s.name || '').toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (segmentSort === 'name') return (a.name || '').localeCompare(b.name || '');
      if (segmentSort === 'count') return (b.cachedCount || 0) - (a.cachedCount || 0);
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });

  // Client-side filtering & paging for segment customers
  const filteredCustomers = customerList.filter(c => {
    if (!customerSearch.trim()) return true;
    const q = customerSearch.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.tags || '').toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredCustomers.length / customerLimit) || 1;
  const paginatedCustomers = filteredCustomers.slice((customerPage - 1) * customerLimit, customerPage * customerLimit);

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  // ── Render Discard Draft Modal Overlay ──
  if (discardConfirm) {
    return (
      <div className="wa-launch-confirm-overlay">
        <div className="wa-launch-confirm-card">
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
            }}>
              ⚠️
            </div>
          </div>
          <h3 style={{ margin: '0 0 8px', textAlign: 'center', fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: -0.4 }}>
            Discard current campaign?
          </h3>
          <p style={{ margin: '0 0 28px', textAlign: 'center', fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
            Your current draft has unsaved changes.
            <br />
            Starting a new campaign will permanently discard them.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={() => {
                setDiscardConfirm(false);
                onClose();
              }}
              style={{
                flex: 1, height: 44, borderRadius: 10,
                border: '1.5px solid #e2e8f0',
                background: '#f8fafc',
                color: '#475569', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                resetWizard();
              }}
              style={{
                flex: 1, height: 44, borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: '0 4px 12px rgba(239,68,68,0.35)',
              }}
            >
              Discard &amp; Create New
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render Launch confirmation Dialog (Step 5) ──
  if (launchConfirm && selectedTemplate) {
    return (
      <div className="wa-launch-confirm-overlay">
        <div className="wa-launch-confirm-card" style={{ maxWidth: 480 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
            }}>
              🚀
            </div>
          </div>
          <h3 style={{ margin: '0 0 8px', textAlign: 'center', fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: -0.4 }}>
            Launch Campaign?
          </h3>
          <p style={{ margin: '0 0 20px', textAlign: 'center', fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
            Confirm launch details below before broadcasting messages to subscribers.
          </p>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#64748b' }}>Campaign:</span><strong style={{ color: '#0f172a' }}>{campaignName}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#64748b' }}>Segment:</span><strong style={{ color: '#0f172a' }}>{selectedSegment?.name}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#64748b' }}>Recipients:</span><strong style={{ color: '#0f172a' }}>{contactCount.toLocaleString()}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: '#64748b' }}>Template:</span><strong style={{ color: '#0f172a' }}>{selectedTemplate.name}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#64748b' }}>Delivery:</span>
              <strong style={{ color: publishMode === 'schedule' ? '#2563eb' : '#059669' }}>
                {publishMode === 'schedule' ? `📅 Scheduled (${scheduleDate} ${scheduleTime})` : '🚀 Instant'}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={() => setLaunchConfirm(false)}
              className="btn btn-secondary"
              style={{ flex: 1, height: 44, fontSize: 14, fontWeight: 700 }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleTriggerCampaign()}
              className="btn btn-primary"
              style={{ flex: 1, height: 44, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 style={{ width: 16, height: 16, animation: 'spin 0.6s linear infinite' }} />
                  Processing...
                </>
              ) : (
                <>Confirm &amp; Launch</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="wa-fullpage-overlay">
      {/* ── Wizard Header ── */}
      <div className="wa-wizard-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>✅</span>
            <h3 style={{ margin: 0, color: '#ffffff', fontSize: 17, fontWeight: 800, letterSpacing: -0.3 }}>
              Create New Campaign
            </h3>
          </div>
          <button
            onClick={handleCloseAttempt}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: 8,
              padding: '6px 8px',
              cursor: 'pointer',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </div>

      {/* ── Stepper (5-step configuration) ── */}
      <div className="wa-wizard-stepper">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {[
            { n: 1, label: '① Choose Segment' },
            { n: 2, label: '② Map CSV Headers' },
            { n: 3, label: '③ Select Template' },
            { n: 4, label: '④ Template Variables' },
            { n: 5, label: '⑤ Review & Launch' },
          ].map(({ n, label }, i) => (
            <React.Fragment key={n}>
              <div className={`wa-step-item ${step === n ? 'active' : step > n ? 'completed' : ''}`}>
                <span className="wa-step-dot">
                  {step > n ? '✓' : n}
                </span>
                <span className="wa-step-label">{label}</span>
              </div>
              {i < 4 && <div className="wa-step-divider" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="wa-fullpage-container">
        <div style={{ flex: 1, padding: '28px 0' }}>

          {/* ═══════ STEP 1: CHOOSE SEGMENT ═══════ */}
          {step === 1 && (
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  <Users style={{ width: 22, height: 22, color: '#2563eb', verticalAlign: 'middle', marginRight: 8 }} />
                  My Customer Segments
                </h3>
                <p style={{ margin: 0, fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
                  Choose an existing customer segment to target. Contacts will be compiled automatically behind the scenes.
                </p>
              </div>

              {/* Toolbar: Search + Sort */}
              <div className="wa-segment-toolbar" style={{ marginBottom: 20 }}>
                <div className="wa-search-wrapper">
                  <Search className="wa-search-icon" />
                  <input
                    type="text"
                    className="wa-search-input"
                    placeholder="Search segments by name or description..."
                    value={segmentSearch}
                    onChange={(e) => setSegmentSearch(e.target.value)}
                  />
                  {segmentSearch && (
                    <button className="wa-search-clear" onClick={() => setSegmentSearch('')}>
                      <X style={{ width: 12, height: 12 }} />
                    </button>
                  )}
                </div>

                <button
                  className="wa-segment-toolbar-btn"
                  onClick={() => setSegmentSort(segmentSort === 'name' ? 'count' : segmentSort === 'count' ? 'date' : 'name')}
                  style={{ textTransform: 'capitalize' }}
                >
                  <ArrowUpDown style={{ width: 14, height: 14 }} />
                  Sort: {segmentSort}
                </button>
              </div>

              {segmentsLoading ? (
                <div className="wa-segment-grid">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="wa-segment-skeleton" />
                  ))}
                </div>
              ) : filteredSegments.length === 0 ? (
                <div className="wa-empty-state" style={{ padding: '64px 32px' }}>
                  <div style={{ fontSize: 42, marginBottom: 12 }}>👥</div>
                  <h4 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>No Customer Segments Found</h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                    Try adjusting your search query, or create segments in the Contacts tab first.
                  </p>
                </div>
              ) : (
                <div className="wa-segment-grid">
                  {filteredSegments.map((s) => {
                    const isSelected = selectedSegment?._id === s._id;
                    const evalDate = s.lastEvaluatedAt || s.updatedAt || s.createdAt;
                    
                    return (
                      <div
                        key={s._id}
                        className={`wa-segment-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectSegment(s)}
                      >
                        {segmentProcessing && isSelected && (
                          <div className="wa-segment-loading-overlay">
                            <div className="wa-spinner" />
                            <span>Exporting segment data...</span>
                          </div>
                        )}

                        <div className="wa-segment-card-top">
                          <h4 className="wa-segment-card-name">{s.name}</h4>
                          {isSelected ? (
                            <div className="wa-segment-check">
                              <Check style={{ width: 13, height: 13 }} />
                            </div>
                          ) : (
                            <div className="wa-segment-radio" />
                          )}
                        </div>

                        <p className="wa-segment-card-desc">{s.description || 'No description provided.'}</p>

                        <div style={{ flex: 1 }} />

                        <div className="wa-segment-card-meta">
                          <div className="wa-segment-card-meta-item">
                            👥 <span className="count">{(s.cachedCount || s.calculatedCount || 0).toLocaleString()}</span>
                          </div>
                          {evalDate && (
                            <div className="wa-segment-card-meta-item">
                              📅 <span>{formatTimeAgo(evalDate)}</span>
                            </div>
                          )}
                        </div>

                        {isSelected && (
                          <button
                            type="button"
                            className="wa-segment-toolbar-btn"
                            style={{
                              marginTop: 10,
                              width: '100%',
                              justifyContent: 'center',
                              height: 34,
                              background: '#f8fafc',
                              fontSize: 12
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewCustomers(s);
                            }}
                          >
                            <Eye style={{ width: 13, height: 13 }} /> View Customers
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══════ STEP 2: MAP CSV HEADERS ═══════ */}
          {step === 2 && (
            <div className="wa-csv-map-page">
              <div className="wa-csv-map-hero">
                <div className="wa-csv-map-hero-icon">
                  <Database style={{ width: 22, height: 22, color: '#ffffff' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 800, color: '#1e3a8a' }}>Map CSV Columns to System Fields</h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                    Associate columns from your compiled customer segment list with default system placeholders. These mappings will be used for recipient details and personalization.
                  </p>
                </div>
              </div>

              <div className="wa-csv-required-cols">
                {/* Name Mapping */}
                <div className={`wa-csv-col-card ${nameColumn ? 'mapped' : 'unmapped'}`}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span className="wa-csv-col-label">
                      Name Column <span className="required-star">*</span>
                    </span>
                    <span className={`wa-csv-col-badge ${nameColumn ? 'ok' : 'warn'}`}>
                      {nameColumn ? '✓ Mapped' : '⚠️ Unmapped'}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                      Select Column in CSV
                    </div>
                    <select
                      className="wa-vmap-select"
                      value={nameColumn}
                      onChange={(e) => setNameColumn(e.target.value)}
                    >
                      <option value="">-- Choose Name Column --</option>
                      {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    Variables reference: <code style={{ color: '#2563eb', fontWeight: 'bold' }}>{'{'}{'{'}name{'}'}{'}'}</code> or <code style={{ color: '#2563eb', fontWeight: 'bold' }}>{'{'}{'{'}1{'}'}{'}'}</code>
                  </div>
                </div>

                {/* Phone Mapping */}
                <div className={`wa-csv-col-card ${phoneColumn ? 'mapped' : 'unmapped'}`}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span className="wa-csv-col-label">
                      Phone Column <span className="required-star">*</span>
                    </span>
                    <span className={`wa-csv-col-badge ${phoneColumn ? 'ok' : 'warn'}`}>
                      {phoneColumn ? '✓ Mapped' : '⚠️ Unmapped'}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                      Select Column in CSV
                    </div>
                    <select
                      className="wa-vmap-select"
                      value={phoneColumn}
                      onChange={(e) => setPhoneColumn(e.target.value)}
                    >
                      <option value="">-- Choose Phone Column --</option>
                      {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    Variables reference: <code style={{ color: '#2563eb', fontWeight: 'bold' }}>{'{'}{'{'}phone{'}'}{'}'}</code> or <code style={{ color: '#2563eb', fontWeight: 'bold' }}>{'{'}{'{'}2{'}'}{'}'}</code>
                  </div>
                </div>
              </div>



              {/* Detected Headers */}
              <div className="wa-csv-headers-section">
                <div className="wa-csv-headers-title">
                  <Database style={{ width: 15, height: 15, color: '#2563eb' }} />
                  Detected CSV Columns in Selected Segment ({headers.length})
                </div>
                <div className="wa-csv-header-pills">
                  {headers.map((h) => {
                    const isName = h === nameColumn;
                    const isPhone = h === phoneColumn;
                    return (
                      <span
                        key={h}
                        className={`wa-csv-header-pill ${isName ? 'is-name' : isPhone ? 'is-phone' : ''}`}
                      >
                        {h} {isName ? ' (Name)' : isPhone ? ' (Phone)' : ''}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══════ STEP 3: TEMPLATE SELECTION ═══════ */}
          {step === 3 && (
            <div className="wa-tpl-select-page">
              <div className="wa-tpl-select-left">
                <WhatsAppTemplateGallery
                  templates={templates}
                  selectedTemplateId={selectedTemplateId}
                  onSelectTemplate={handleSelectTemplate}
                />
              </div>

              <div className="wa-tpl-select-right">
                <div className="wa-preview-section-label">
                  <h5 className="wa-preview-section-title">
                    <Smartphone style={{ width: 15, height: 15, color: '#2563eb' }} />
                    Template Live Preview
                  </h5>
                  {selectedTemplate && (
                    <span className="wa-preview-approved-badge">
                      ✅ {selectedTemplate.category || 'Utility'}
                    </span>
                  )}
                </div>

                <div className="wa-preview-outer" style={{ minHeight: 480 }}>
                  <div style={{ width: 390, transform: 'scale(0.82)', transformOrigin: 'top center' }}>
                    <WhatsAppPreview
                      template={selectedTemplate}
                      variableMappings={[]}
                    />
                  </div>
                </div>

                {/* Inline Action Buttons below phone preview */}
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button
                    type="button"
                    className="wa-segment-toolbar-btn"
                    style={{ flex: 1, justifyContent: 'center' }}
                    disabled={!selectedTemplate}
                    onClick={() => {
                      setSelectedTemplate(null);
                      setSelectedTemplateId('');
                      setVariableMappings([]);
                    }}
                  >
                    Clear Selection
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{
                      flex: 2,
                      height: 42,
                      fontWeight: 700,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                    disabled={!selectedTemplate}
                    onClick={handleNextStep}
                  >
                    Select Template <ArrowRight style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ STEP 4: TEMPLATE VARIABLES ═══════ */}
          {step === 4 && selectedTemplate && (
            <div className="wa-varmap-page">
              <div className="wa-varmap-left">
                {/* Active Template Meta Card */}
                <div className="wa-active-tpl-card">
                  <div className="wa-active-tpl-name">
                    <MessageSquare style={{ width: 18, height: 18 }} />
                    Active Template: {selectedTemplate.name}
                  </div>
                  
                  <div className="wa-active-tpl-meta">
                    <div className="wa-active-tpl-meta-item">
                      <span className="wa-active-tpl-meta-label">Language</span>
                      <span className="wa-active-tpl-meta-value">{selectedTemplate.language || 'en_US'}</span>
                    </div>
                    <div className="wa-active-tpl-meta-item">
                      <span className="wa-active-tpl-meta-label">Category</span>
                      <span className="wa-active-tpl-meta-value">{selectedTemplate.category || 'UTILITY'}</span>
                    </div>
                    <div className="wa-active-tpl-meta-item">
                      <span className="wa-active-tpl-meta-label">Variables</span>
                      <span className="wa-active-tpl-meta-value">{variableMappings.length} mapped</span>
                    </div>
                  </div>

                  <div className="wa-active-tpl-chips">
                    <span className="wa-active-tpl-chip">Media: {getTemplateMediaType(selectedTemplate)}</span>
                    <span className="wa-active-tpl-chip">Buttons: {getTemplateButtonsCount(selectedTemplate)}</span>
                    {getComponentChips(selectedTemplate).map((c, idx) => (
                      <span key={idx} className="wa-active-tpl-chip">{c.label}</span>
                    ))}
                  </div>

                  {/* Change Template link that resets only template parameters */}
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    style={{
                      alignSelf: 'flex-start',
                      background: 'none',
                      border: 'none',
                      color: '#ffffff',
                      textDecoration: 'underline',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                      marginTop: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Undo style={{ width: 12, height: 12 }} />
                    ← Change Selected Template
                  </button>
                </div>

                {/* Variable Form Bindings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="wa-varmap-section-card">
                    <div className="wa-varmap-section-header">
                      <div className="wa-varmap-section-icon body">
                        <Sliders style={{ width: 16, height: 16 }} />
                      </div>
                      <span className="wa-varmap-section-title">Map Variables to CSV Columns</span>
                      <span className="wa-varmap-section-count">{variableMappings.length} Placeholders</span>
                    </div>

                    <div className="wa-varmap-section-body">
                      {variableMappings.length === 0 ? (
                        <div className="wa-varmap-no-vars">
                          ✅ No dynamic variables detected in this template. Proceed to final review.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          {variableMappings.map((m, idx) => {
                            const baseLabel = m.componentType === 'BUTTONS' 
                              ? `${m.buttonType || 'Button'} "${m.buttonName || ''}"`
                              : `${m.componentType} Template`;

                            const label = m.cardIndex !== undefined
                              ? `Card ${m.cardIndex + 1} • ${baseLabel}`
                              : baseLabel;

                            return (
                              <div key={idx} className="wa-varmap-var-row">
                                <div className="wa-varmap-var-row-top">
                                  <span className="wa-varmap-var-index">
                                    {'{'}{'{'}{m.varIndex}{'}'}{'}'}
                                  </span>
                                  <span className="wa-varmap-var-comp">{label}</span>
                                </div>

                                <div className="wa-varmap-var-fields">
                                  <div>
                                    <label className="wa-varmap-var-field-label">CSV Column</label>
                                    <select
                                      className="wa-vmap-select"
                                      value={m.field}
                                      onChange={(e) => handleUpdateMapping(idx, { field: e.target.value })}
                                    >
                                      <option value="">-- Choose Column --</option>
                                      {headers.map((h) => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="wa-varmap-var-field-label">Fallback Value</label>
                                    <input
                                      type="text"
                                      className="wa-vmap-input"
                                      placeholder="Default text if empty..."
                                      value={m.fallbackValue}
                                      onChange={(e) => handleUpdateMapping(idx, { fallbackValue: e.target.value })}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 Sticky Right Phone Preview */}
              <div className="wa-varmap-right">
                <div className="wa-preview-section-label">
                  <h5 className="wa-preview-section-title">
                    <Smartphone style={{ width: 15, height: 15, color: '#2563eb' }} />
                    Live Substitute Preview
                  </h5>
                </div>

                <div className="wa-preview-outer" style={{ minHeight: 460 }}>
                  <div style={{ width: 390, transform: 'scale(0.82)', transformOrigin: 'top center' }}>
                    <WhatsAppPreview
                      template={selectedTemplate}
                      variableMappings={variableMappings}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ STEP 5: REVIEW & LAUNCH ═══════ */}
          {step === 5 && selectedTemplate && (
            <div className="wa-review-page">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
                {/* Campaign Settings card */}
                <div className="wa-review-section">
                  <h4 className="wa-review-section-title">
                    <Zap style={{ width: 16, height: 16, color: '#2563eb' }} />
                    Campaign Settings
                  </h4>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 13 }}>
                      Campaign Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="wa-vmap-input"
                      style={{ height: 40 }}
                      placeholder="e.g., Summer VIP Blast"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: 13 }}>
                      Tags <span style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>(comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      className="wa-vmap-input"
                      style={{ height: 40 }}
                      placeholder="e.g., promo, active, vip"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                    />
                  </div>
                </div>

                {/* Summary mini cards */}
                <div className="wa-review-section">
                  <h4 className="wa-review-section-title">
                    <FileText style={{ width: 16, height: 16, color: '#2563eb' }} />
                    Campaign Details Summary
                  </h4>

                  <div className="wa-review-grid">
                    <div className="wa-review-mini-card">
                      <span className="label">Target Segment</span>
                      <span className="value">{selectedSegment?.name || '—'}</span>
                    </div>
                    <div className="wa-review-mini-card">
                      <span className="label">Estimated Recipients</span>
                      <span className="value">{contactCount.toLocaleString()}</span>
                    </div>
                    <div className="wa-review-mini-card">
                      <span className="label">Template Name</span>
                      <span className="value">{selectedTemplate.name}</span>
                    </div>
                    <div className="wa-review-mini-card">
                      <span className="label">Category</span>
                      <span className="value">{selectedTemplate.category || 'UTILITY'}</span>
                    </div>
                    <div className="wa-review-mini-card">
                      <span className="label">Language</span>
                      <span className="value">{selectedTemplate.language || 'en_US'}</span>
                    </div>
                    <div className="wa-review-mini-card">
                      <span className="label">Mappings Count</span>
                      <span className="value">{variableMappings.length} variables</span>
                    </div>
                  </div>

                  {/* Change Template link back to Step 3 */}
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    style={{
                      alignSelf: 'flex-start',
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      textDecoration: 'underline',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Undo style={{ width: 12, height: 12 }} />
                    Change Selected Template (Preserves mapping inputs)
                  </button>
                </div>

                {/* Delivery Settings Card */}
                <div className="wa-review-section">
                  <h4 className="wa-review-section-title">
                    <Calendar style={{ width: 16, height: 16, color: '#2563eb' }} />
                    Delivery Settings &amp; Schedule
                  </h4>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      className={`wa-filter-chip ${publishMode === 'now' ? 'active' : ''}`}
                      onClick={() => setPublishMode('now')}
                    >
                      <Send style={{ width: 13, height: 13 }} /> Send Now
                    </button>
                    <button
                      type="button"
                      className={`wa-filter-chip ${publishMode === 'schedule' ? 'active' : ''}`}
                      onClick={() => setPublishMode('schedule')}
                    >
                      <Calendar style={{ width: 13, height: 13 }} /> Schedule Dispatch
                    </button>
                  </div>

                  {publishMode === 'schedule' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                      <div>
                        <div className="wa-vmap-field-label"><Calendar style={{ width: 9, height: 9 }} /> Schedule Date</div>
                        <input type="date" className="wa-vmap-input" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                      </div>
                      <div>
                        <div className="wa-vmap-field-label"><Clock style={{ width: 9, height: 9 }} /> Dispatch Time</div>
                        <input type="time" className="wa-vmap-input" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                      </div>
                    </div>
                  )}

                  {/* Retry options */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                    <input
                      type="checkbox"
                      id="wa-retry-toggle"
                      checked={isRetryEnabled}
                      onChange={(e) => setIsRetryEnabled(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: '#2563eb' }}
                    />
                    <label htmlFor="wa-retry-toggle" style={{ fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                      <RotateCcw style={{ width: 13, height: 13, verticalAlign: 'middle', marginRight: 4 }} />
                      Enable Auto-Retry Dispatch
                    </label>
                  </div>

                  {isRetryEnabled && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 6 }}>
                      {[
                        { label: 'Attempt 1 (hrs)', val: attempt1, set: setAttempt1 },
                        { label: 'Attempt 2 (hrs)', val: attempt2, set: setAttempt2 },
                        { label: 'Attempt 3 (hrs)', val: attempt3, set: setAttempt3 },
                      ].map((a) => (
                        <div key={a.label}>
                          <div className="wa-vmap-field-label">{a.label}</div>
                          <input type="number" min={1} max={48} className="wa-vmap-input" value={a.val} onChange={(e) => a.set(Number(e.target.value))} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 5 Sticky Right Preview Panel */}
              <div className="wa-review-sticky-right">
                <div className="wa-preview-section-label">
                  <h5 className="wa-preview-section-title">
                    <Smartphone style={{ width: 15, height: 15, color: '#2563eb' }} />
                    Final Preview
                  </h5>
                </div>

                <div className="wa-preview-outer" style={{ minHeight: 460 }}>
                  <div style={{ width: 390, transform: 'scale(0.82)', transformOrigin: 'top center' }}>
                    <WhatsAppPreview
                      template={selectedTemplate}
                      variableMappings={variableMappings}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className={`wa-launch-btn ${launchSuccess ? 'success' : ''}`}
                  onClick={handleNextStep}
                  disabled={loading || launchSuccess}
                >
                  {launchSuccess ? (
                    <>
                      <CheckCircle2 style={{ width: 20, height: 20 }} />
                      Launched Successfully!
                    </>
                  ) : loading ? (
                    <>
                      <Loader2 style={{ width: 18, height: 18, animation: 'spin 0.6s linear infinite' }} />
                      Dispatching bulk campaign...
                    </>
                  ) : (
                    <>
                      {publishMode === 'schedule' ? (
                        <>📅 Schedule WhatsApp Campaign</>
                      ) : (
                        <>🚀 Launch Bulk Campaign</>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Sticky Navigation Footer ── */}
      <div className="wa-sticky-footer">
        <div>
          {step > 1 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep((prev) => (prev - 1) as any)}
              disabled={loading}
              style={{ padding: '9px 18px', fontSize: 13, fontWeight: 600 }}
            >
              <ArrowLeft style={{ width: 15, height: 15 }} /> Back
            </button>
          )}
        </div>

        <div className="wa-footer-left-info" style={{ textAlign: 'center' }}>
          <span>
            {selectedSegment ? `Selected: ${selectedSegment.name} (${contactCount.toLocaleString()} recs)` : 'No Segment Chosen'}
          </span>
          <span>
            {selectedTemplate ? `Template: ${selectedTemplate.name}` : 'No Template Selected'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCloseAttempt}
            style={{ padding: '9px 18px', fontSize: 13, fontWeight: 600 }}
          >
            Cancel Flow
          </button>

          {step < 5 ? (
            <button
              type="button"
              className="btn"
              style={{
                background: '#2563eb',
                color: '#ffffff',
                fontWeight: 600,
                padding: '9px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              onClick={handleNextStep}
              disabled={
                segmentProcessing ||
                (step === 1 && !selectedSegment) ||
                (step === 2 && (!nameColumn || !phoneColumn)) ||
                (step === 3 && !selectedTemplate)
              }
            >
              Next step <ArrowRight style={{ width: 15, height: 15 }} />
            </button>
          ) : (
            <button
              type="button"
              className="btn"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontWeight: 700,
                padding: '9px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(16,185,129,0.25)'
              }}
              onClick={() => handleTriggerCampaign()}
              disabled={loading || launchSuccess || !campaignName.trim()}
            >
              🚀 Launch Broadcast
            </button>
          )}
        </div>
      </div>

      {/* ── Read-only Customer list modal (rendered overlay) ── */}
      {showCustomerModal && (
        <div className="wa-customer-modal-overlay">
          <div className="wa-customer-modal">
            <div className="wa-customer-modal-header">
              <h4 className="wa-customer-modal-title">
                <Users style={{ width: 18, height: 18 }} />
                Audience Preview: {selectedSegment?.name} ({(selectedSegment?.cachedCount || 0).toLocaleString()} contacts)
              </h4>
              <button
                className="wa-customer-modal-close"
                onClick={() => setShowCustomerModal(false)}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <div className="wa-customer-modal-toolbar">
              <div className="wa-search-wrapper" style={{ maxWidth: 400 }}>
                <Search className="wa-search-icon" />
                <input
                  type="text"
                  className="wa-search-input"
                  placeholder="Search contacts by name, email, tags..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setCustomerPage(1);
                  }}
                  style={{ height: 38 }}
                />
                {customerSearch && (
                  <button className="wa-search-clear" onClick={() => setCustomerSearch('')}>
                    <X style={{ width: 12, height: 12 }} />
                  </button>
                )}
              </div>
            </div>

            <div className="wa-customer-modal-body">
              {customerModalLoading ? (
                <div style={{ padding: '64px 0', textAlign: 'center', color: '#64748b' }}>
                  <Loader2 style={{ width: 32, height: 32, margin: '0 auto 12px', animation: 'spin 0.6s linear infinite', color: '#2563eb' }} />
                  <span>Loading compiled audience list...</span>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div style={{ padding: '64px 32px', textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>No Contacts Found</h4>
                  <p style={{ margin: 0, fontSize: 13 }}>Try different keywords or check segment filters.</p>
                </div>
              ) : (
                <table className="wa-customer-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Tags</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCustomers.map((c, idx) => (
                      <tr key={idx}>
                        <td><strong>{c.name || '—'}</strong></td>
                        <td style={{ fontFamily: 'monospace' }}>{c.phone || '—'}</td>
                        <td>{c.email || '—'}</td>
                        <td>
                          {c.tags ? (
                            c.tags.split(',').map((tag: string) => (
                              <span key={tag} className="wa-tag-chip" style={{ marginRight: 4 }}>
                                {tag.trim()}
                              </span>
                            ))
                          ) : (
                            <span className="wa-tag-chip" style={{ opacity: 0.6 }}>default</span>
                          )}
                        </td>
                        <td>
                          <span className="wa-badge wa-badge-approved" style={{ padding: '2px 8px', textTransform: 'capitalize', fontSize: 10 }}>
                            {c.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="wa-customer-modal-footer">
              <span style={{ fontSize: 13, color: '#64748b' }}>
                Showing {filteredCustomers.length === 0 ? 0 : (customerPage - 1) * customerLimit + 1} to{' '}
                {Math.min(customerPage * customerLimit, filteredCustomers.length)} of {filteredCustomers.length} contacts
              </span>

              <div className="wa-customer-pagination">
                <button
                  className="wa-customer-page-btn"
                  disabled={customerPage === 1}
                  onClick={() => setCustomerPage(prev => Math.max(1, prev - 1))}
                >
                  ←
                </button>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>
                  Page {customerPage} of {totalPages}
                </span>
                <button
                  className="wa-customer-page-btn"
                  disabled={customerPage === totalPages}
                  onClick={() => setCustomerPage(prev => Math.min(totalPages, prev + 1))}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
