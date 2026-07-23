import React, { useState, useEffect } from 'react';
import { MessageSquare, Upload, Check, AlertCircle, FileText, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { WhatsAppTemplate } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface WhatsAppCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface VarMappingItem {
  componentType: 'HEADER' | 'BODY';
  varIndex: number; // e.g. 1, 2
  field: string;
  fallbackValue: string;
}

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
  const [templateSearch, setTemplateSearch] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/api/whatsapp/templates');
      const rawList = Array.isArray(res?.waMsgTemplates)
        ? res.waMsgTemplates
        : Array.isArray(res?.data?.waMsgTemplates)
        ? res.data.waMsgTemplates
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      setTemplates(rawList);
    } catch (err: any) {
      setTemplates([]);
      showToast('Error loading WhatsApp templates', err.message, 'error');
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

    // Extract placeholders {{1}}, {{2}} from HEADER & BODY components
    const newMappings: VarMappingItem[] = [];

    template.components.forEach((comp) => {
      if (comp.type === 'HEADER' || comp.type === 'BODY') {
        const matches = (comp.text || '').match(/\{\{(\d+)\}\}/g);
        if (matches) {
          const uniqueIndexes = Array.from(new Set(matches.map((m) => parseInt(m.replace(/[^\d]/g, ''), 10))));
          uniqueIndexes.sort((a, b) => a - b).forEach((idx) => {
            newMappings.push({
              componentType: comp.type as 'HEADER' | 'BODY',
              varIndex: idx,
              field: headers[0] || 'name',
              fallbackValue: comp.type === 'HEADER' ? 'Customer' : 'Valued Member',
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

  const buildTemplateVariableData = () => {
    if (!selectedTemplate) return [];

    const result: any[] = [];

    // Group mappings by componentType
    ['HEADER', 'BODY'].forEach((typeStr) => {
      const comp = selectedTemplate.components.find((c) => c.type === typeStr);
      if (comp) {
        const compMappings = variableMappings.filter((m) => m.componentType === typeStr);
        if (compMappings.length > 0) {
          result.push({
            type: typeStr,
            format: comp.format || 'TEXT',
            show: true,
            variables: compMappings.map((m) => ({
              field: m.field,
              fallbackValue: m.fallbackValue,
            })),
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

    setLoading(true);
    try {
      const templateVariableData = buildTemplateVariableData();
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

      const payload = {
        campaignName: campaignName.trim(),
        templateId: selectedTemplate._id || selectedTemplate.id || selectedTemplate.name,
        csvFileKey,
        nameColumn,
        phoneColumn,
        templateVariableData,
        tags,
        contactCount,
      };

      const res = await api.post('/api/whatsapp/trigger-campaign', payload);

      showToast('Campaign Dispatched', res.message || 'WhatsApp bulk campaign triggered successfully!', 'success');
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
  const filteredTemplates = templateList.filter(
    (t) =>
      (t.name || '').toLowerCase().includes(templateSearch.toLowerCase()) ||
      (t.category || '').toLowerCase().includes(templateSearch.toLowerCase())
  );

  return (
    <div className="modal-overlay">
      <div
        className="modal-card"
        style={{
          maxWidth: 680,
          width: '90%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 12,
        }}
      >
        {/* Modal Header */}
        <div
          className="modal-header"
          style={{
            background: 'linear-gradient(135deg, #075E54 0%, #128C7E 100%)',
            color: '#ffffff',
            padding: '16px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MessageSquare style={{ width: 22, height: 22, color: '#25D366' }} />
            <div>
              <h2 className="modal-title" style={{ color: '#ffffff', margin: 0, fontSize: 18 }}>
                New WhatsApp Bulk Campaign
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                Upload CSV, map columns & trigger OwnChat bulk messages
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} style={{ color: '#ffffff' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Wizard Steps Bar */}
        <div
          style={{
            display: 'flex',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '10px 20px',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <div style={{ color: step === 1 ? '#128C7E' : '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>1. Upload CSV</span>
          </div>
          <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
          <div style={{ color: step === 2 ? '#128C7E' : '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>2. Column Mapping</span>
          </div>
          <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
          <div style={{ color: step === 3 ? '#128C7E' : '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>3. Template & Variables</span>
          </div>
          <span style={{ margin: '0 8px', color: '#cbd5e1' }}>/</span>
          <div style={{ color: step === 4 ? '#128C7E' : '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>4. Launch</span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {/* STEP 1: UPLOAD CSV */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: 10,
                  padding: 30,
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer',
                }}
                onClick={() => document.getElementById('whatsapp-csv-file-input')?.click()}
              >
                <Upload style={{ width: 36, height: 36, color: '#128C7E', marginBottom: 10 }} />
                <h4 style={{ margin: '0 0 6px 0', fontSize: 15, color: '#0f172a' }}>
                  Select a CSV file containing contact list
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                  Must contain Name and WhatsApp Phone Number columns
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
                    padding: '10px 14px',
                    background: 'rgba(37, 211, 102, 0.1)',
                    border: '1px solid rgba(37, 211, 102, 0.3)',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText style={{ width: 18, height: 18, color: '#128C7E' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Check style={{ width: 18, height: 18, color: '#16a34a' }} />
                </div>
              )}
            </div>
          )}

          {/* STEP 2: COLUMN MAPPING */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#f1f5f9', padding: 12, borderRadius: 6, fontSize: 13 }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 700, color: '#0f172a' }}>
                  Detected Headers ({headers.length}):
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {headers.map((h, i) => (
                    <span
                      key={i}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontFamily: 'monospace',
                        fontSize: 11,
                      }}
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Name Column <span style={{ color: '#ef4444' }}>*</span>
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
                  Phone Column <span style={{ color: '#ef4444' }}>*</span>
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

          {/* STEP 3: TEMPLATE SELECTION & VARIABLE MAPPING */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Select Approved WhatsApp Template <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="property-input"
                  placeholder="Filter templates by name or category..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  style={{ marginBottom: 8 }}
                />
                <select
                  className="property-select"
                  value={selectedTemplateId}
                  onChange={(e) => {
                    const tmpl = templates.find((t) => (t._id || t.id || t.name) === e.target.value);
                    if (tmpl) handleSelectTemplate(tmpl);
                  }}
                >
                  <option value="">-- Choose WhatsApp Template ({filteredTemplates.length} available) --</option>
                  {filteredTemplates.map((t, idx) => {
                    const idVal = t._id || t.id || t.name;
                    return (
                      <option key={`${idVal}-${idx}`} value={idVal}>
                        {t.name} ({t.category || 'UTILITY'})
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedTemplate && (
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: 14,
                  }}
                >
                  <p style={{ margin: '0 0 8px 0', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    Template Components Preview:
                  </p>
                  {selectedTemplate.components.map((c, i) => (
                    <div key={i} style={{ marginBottom: 6, fontSize: 12, color: '#475569' }}>
                      <strong style={{ color: '#128C7E' }}>{c.type}:</strong> {c.text}
                    </div>
                  ))}
                </div>
              )}

              {/* Variable Mappings */}
              {selectedTemplate && variableMappings.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    Map Template Variables to CSV Columns & Fallbacks:
                  </p>
                  {variableMappings.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 1fr 1fr',
                        gap: 8,
                        alignItems: 'center',
                        background: '#f8fafc',
                        padding: 10,
                        borderRadius: 6,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#128C7E' }}>
                        {m.componentType} {'{{' + m.varIndex + '}}'}
                      </span>

                      <select
                        className="property-select"
                        style={{ fontSize: 12 }}
                        value={m.field}
                        onChange={(e) => handleUpdateMapping(idx, { field: e.target.value })}
                      >
                        {headers.map((h, i) => (
                          <option key={`hdr-map-${h}-${i}`} value={h}>
                            Map from: {h}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        className="property-input"
                        style={{ fontSize: 12 }}
                        placeholder="Fallback Value"
                        value={m.fallbackValue}
                        onChange={(e) => handleUpdateMapping(idx, { fallbackValue: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: CAMPAIGN META & TRIGGER */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Campaign Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  className="property-input"
                  placeholder="e.g., Summer Sale WhatsApp Announcement"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Campaign Tags
                </label>
                <input
                  type="text"
                  className="property-input"
                  placeholder="e.g., promo, whatsapp, sale"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>

              {/* Summary Card */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: 14,
                  fontSize: 13,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>CSV Key:</span>
                  <code style={{ fontSize: 11 }}>{csvFileKey}</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Name / Phone Mapping:</span>
                  <span>
                    <strong>{nameColumn}</strong> / <strong>{phoneColumn}</strong>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Selected Template:</span>
                  <span style={{ fontWeight: 700, color: '#128C7E' }}>{selectedTemplate?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Mapped Variables:</span>
                  <span>{variableMappings.length} variable(s)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', padding: '12px 20px' }}>
          {step > 1 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep((s) => (s - 1) as any)}
              disabled={loading}
            >
              <ArrowLeft style={{ width: 14, height: 14 }} /> Back
            </button>
          )}

          {step === 1 && (
            <button
              type="button"
              className="btn"
              style={{ background: '#128C7E', color: '#ffffff' }}
              onClick={handleUploadCSV}
              disabled={loading || !selectedFile}
            >
              {loading ? 'Uploading CSV…' : 'Upload & Process Headers'}
              <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          )}

          {step === 2 && (
            <button
              type="button"
              className="btn"
              style={{ background: '#128C7E', color: '#ffffff' }}
              onClick={() => {
                if (!nameColumn || !phoneColumn) {
                  showToast('Mapping Required', 'Please select Name and Phone columns', 'warning');
                  return;
                }
                setStep(3);
              }}
            >
              Next: Select Template <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              className="btn"
              style={{ background: '#128C7E', color: '#ffffff' }}
              onClick={() => {
                if (!selectedTemplate) {
                  showToast('Template Required', 'Please select a WhatsApp template', 'warning');
                  return;
                }
                if (!campaignName) {
                  setCampaignName(`${selectedTemplate.name}_Blast_${new Date().toLocaleDateString('en-GB').replace(/\//g, '')}`);
                }
                setStep(4);
              }}
            >
              Next: Review & Launch <ArrowRight style={{ width: 14, height: 14 }} />
            </button>
          )}

          {step === 4 && (
            <button
              type="button"
              className="btn"
              style={{ background: '#25D366', color: '#0f172a', fontWeight: 800 }}
              onClick={handleTriggerCampaign}
              disabled={loading}
            >
              {loading ? 'Dispatching Campaign…' : '🚀 Send WhatsApp Bulk Campaign'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
