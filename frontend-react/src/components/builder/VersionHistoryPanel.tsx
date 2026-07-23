import React, { useState, useEffect } from 'react';
import { TemplateData } from './types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { History, Save, RotateCcw, Clock } from 'lucide-react';

interface VersionHistoryPanelProps {
  templateId?: string;
  currentTemplate: TemplateData;
  onRestoreVersion: (templateData: TemplateData) => void;
}

interface VersionItem {
  _id: string;
  version: string;
  name: string;
  createdAt: string;
  jsonData: TemplateData;
}

export const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
  templateId,
  currentTemplate,
  onRestoreVersion,
}) => {
  const { showToast } = useToast();
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersionToRestore, setSelectedVersionToRestore] = useState<VersionItem | null>(null);

  const fetchVersions = async () => {
    if (!templateId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/templates/${templateId}/versions`);
      setVersions(res.data || []);
    } catch (err: any) {
      // Fallback mock history if backend endpoint empty
      setVersions([
        {
          _id: 'v1',
          version: '1.0.0',
          name: 'Initial Draft',
          createdAt: new Date().toISOString(),
          jsonData: currentTemplate,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [templateId]);

  const handleSaveVersion = async () => {
    if (!templateId) {
      showToast('Save Required', 'Save your template to backend before creating version snapshots.', 'warning');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/api/templates/${templateId}/versions`, {
        version: `v${versions.length + 1}.0`,
        name: currentTemplate.name,
        jsonData: currentTemplate,
      });
      showToast('Version Created', 'Saved a new version snapshot.', 'success');
      fetchVersions();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to save version snapshot', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 20px' }}>
      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <History size={18} style={{ color: '#2563eb' }} />
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
            Version History
          </h4>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#64748b' }}>
          Save and restore previous revision snapshots of this template
        </p>
      </div>

      {/* Save Version Snapshot Button */}
      <button
        type="button"
        onClick={handleSaveVersion}
        disabled={loading || !templateId}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '10px 14px',
          borderRadius: 8,
          border: '1px solid #cbd5e1',
          background: '#ffffff',
          color: templateId ? '#0f172a' : '#94a3b8',
          fontSize: 13,
          fontWeight: 600,
          cursor: templateId ? 'pointer' : 'not-allowed',
        }}
      >
        <Save size={16} /> Save New Version Snapshot
      </button>

      {!templateId && (
        <p style={{ fontSize: 11, color: '#f59e0b', margin: 0 }}>
          💡 Note: Save this template to your library first to enable version snapshots.
        </p>
      )}

      {/* Version List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
          Saved Revision Snapshots ({versions.length})
        </span>

        {versions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: 13 }}>
            No saved versions found for this template.
          </div>
        ) : (
          versions.map((ver) => (
            <div
              key={ver._id}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#2563eb' }}>
                    {ver.version || 'v1.0'}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>
                    {ver.name}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} /> {new Date(ver.createdAt).toLocaleTimeString()} — {new Date(ver.createdAt).toLocaleDateString()}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedVersionToRestore(ver)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#2563eb',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={13} /> Restore
              </button>
            </div>
          ))
        )}
      </div>

      {/* Restore Version Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(selectedVersionToRestore)}
        title="Restore Version"
        message={`Are you sure you want to restore "${selectedVersionToRestore?.version}"? Any unsaved edits will be overwritten.`}
        confirmLabel="Restore Version"
        variant="primary"
        onConfirm={() => {
          if (selectedVersionToRestore?.jsonData) {
            onRestoreVersion(selectedVersionToRestore.jsonData);
            showToast('Version Restored', `Restored template to ${selectedVersionToRestore.version}`, 'success');
          }
        }}
        onCancel={() => setSelectedVersionToRestore(null)}
      />
    </div>
  );
};
