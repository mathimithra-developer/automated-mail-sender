import React, { useState } from 'react';
import { TemplateData } from './types';
import { exportHTML } from './exportHTML';
import { Copy, Check, Upload, X, Code, FileText } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface ExportModalProps {
  isOpen: boolean;
  mode: 'html' | 'json' | 'import';
  templateData: TemplateData;
  onClose: () => void;
  onImportJSON: (importedData: TemplateData) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  mode: initialMode,
  templateData,
  onClose,
  onImportJSON,
}) => {
  const { showToast } = useToast();
  const [activeMode, setActiveMode] = useState<'html' | 'json' | 'import'>(initialMode);
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');

  React.useEffect(() => {
    setActiveMode(initialMode);
  }, [initialMode]);

  if (!isOpen) return null;

  const htmlContent = exportHTML(templateData);
  const jsonContent = JSON.stringify(templateData, null, 2);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied to clipboard', 'Code copied successfully', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunImport = () => {
    try {
      const parsed = JSON.parse(importText);
      if (!parsed.sections || !Array.isArray(parsed.sections)) {
        throw new Error('Invalid template schema: missing "sections" array');
      }
      onImportJSON(parsed);
      showToast('Template Imported', 'JSON template loaded into canvas', 'success');
      onClose();
    } catch (err: any) {
      showToast('Import Failed', err.message || 'Invalid JSON format', 'error');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99995,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 12,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          width: '100%',
          maxWidth: 680,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Tabs */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 3, borderRadius: 8 }}>
            <button
              type="button"
              onClick={() => setActiveMode('html')}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: 'none',
                background: activeMode === 'html' ? '#ffffff' : 'transparent',
                color: activeMode === 'html' ? '#2563eb' : '#64748b',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Code size={15} /> HTML Code
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('json')}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: 'none',
                background: activeMode === 'json' ? '#ffffff' : 'transparent',
                color: activeMode === 'json' ? '#2563eb' : '#64748b',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <FileText size={15} /> JSON Schema
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('import')}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: 'none',
                background: activeMode === 'import' ? '#ffffff' : 'transparent',
                color: activeMode === 'import' ? '#2563eb' : '#64748b',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Upload size={15} /> Import JSON
            </button>
          </div>

          <button
            onClick={onClose}
            style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
          {activeMode === 'html' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                  Compiled table-based email HTML ready for sending or ESP integration:
                </p>
                <button
                  type="button"
                  onClick={() => handleCopy(htmlContent)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: copied ? '#16a34a' : '#2563eb',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy HTML'}
                </button>
              </div>

              <textarea
                readOnly
                value={htmlContent}
                rows={16}
                style={{
                  width: '100%',
                  padding: 12,
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  background: '#0f172a',
                  color: '#38bdf8',
                  resize: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {activeMode === 'json' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                  Full template JSON data schema:
                </p>
                <button
                  type="button"
                  onClick={() => handleCopy(jsonContent)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: copied ? '#16a34a' : '#2563eb',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy JSON'}
                </button>
              </div>

              <textarea
                readOnly
                value={jsonContent}
                rows={16}
                style={{
                  width: '100%',
                  padding: 12,
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  background: '#0f172a',
                  color: '#a78bfa',
                  resize: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {activeMode === 'import' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                Paste template JSON schema below to load it directly onto the canvas:
              </p>

              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='Paste JSON schema here... e.g. { "name": "My Template", "sections": [...] }'
                rows={14}
                style={{
                  width: '100%',
                  padding: 12,
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#0f172a',
                  resize: 'none',
                  boxSizing: 'border-box',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRunImport}
                  disabled={!importText.trim()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: importText.trim() ? 1 : 0.6,
                  }}
                >
                  Load Template JSON
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
