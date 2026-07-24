import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Sparkles, Upload, Eye, Link, Trash2, X, ArrowLeft } from 'lucide-react';
import { Asset } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ui/ConfirmModal';

export const AssetsPage: React.FC = () => {
  const { showToast } = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewingAsset, setViewingAsset] = useState<Asset | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // AI Modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/assets');
      setAssets(res.data || []);
    } catch (err: any) {
      showToast('Error loading assets', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataBase64 = reader.result as string;
      try {
        await api.post('/api/assets/upload', {
          filename: file.name,
          mimeType: file.type,
          dataBase64,
        });
        showToast('Success', 'Asset uploaded successfully', 'success');
        loadAssets();
      } catch (err: any) {
        showToast('Upload Error', err.message, 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAiImage = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      await api.post('/api/ai/generate-image', { prompt: aiPrompt });
      showToast('AI Image Created', 'Generated image saved to Asset Library', 'success');
      setShowAiModal(false);
      setAiPrompt('');
      loadAssets();
    } catch (err: any) {
      showToast('AI Generation Failed', err.message, 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    showToast('Copied', 'Asset URL copied to clipboard', 'success');
  };

  const handleDeleteAsset = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.delete(`/api/assets/${deleteConfirmId}`);
      showToast('Deleted', 'Asset removed', 'success');
      loadAssets();
    } catch (err: any) {
      showToast('Error deleting asset', err.message, 'error');
    }
  };

  return (
    <section className="page active" id="assets">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Asset Library</h1>
          <p className="page-description">Upload and manage images for your emails.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowAiModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Sparkles style={{ width: 14, height: 14 }} /> AI Generate Image
          </button>
          <label className="btn" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
            <Upload style={{ width: 14, height: 14 }} /> Upload Image
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      <div id="assetGrid" className="asset-grid">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13, gridColumn: '1 / -1' }}>
            Loading assets...
          </div>
        ) : assets.length === 0 ? (
          <div className="dashed-card" style={{ gridColumn: '1 / -1' }}>
            <div className="dashed-icon">
              <ImageIcon style={{ width: 20, height: 20 }} />
            </div>
            <p className="dashed-title">No assets found</p>
            <p className="dashed-desc">Upload your first image or generate one using Together AI.</p>
          </div>
        ) : (
          assets.map((ast, idx) => {
            const sizeKb = ast.size ? `${(ast.size / 1024).toFixed(1)} KB` : '12.4 KB';
            return (
              <div key={ast._id ? `${ast._id}-${idx}` : `ast-${idx}`} className="asset-item">
                <img src={ast.url} alt={ast.filename} />
                <div className="asset-actions">
                  <button
                    className="asset-action-btn"
                    title="View Image"
                    onClick={() => setViewingAsset(ast)}
                  >
                    <Eye style={{ width: 11, height: 11 }} />
                  </button>
                  <button
                    className="asset-action-btn"
                    title="Copy URL"
                    onClick={() => handleCopyUrl(ast.url)}
                  >
                    <Link style={{ width: 11, height: 11 }} />
                  </button>
                  <button
                    className="asset-action-btn"
                    title="Delete Asset"
                    onClick={() => setDeleteConfirmId(ast._id)}
                  >
                    <Trash2 style={{ width: 11, height: 11 }} />
                  </button>
                </div>
                <div className="asset-item-foot">
                  <div className="asset-name" title={ast.filename}>
                    {ast.filename}
                  </div>
                  <div className="asset-size">{sizeKb}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* AI Image Generator Slide-Over Drawer */}
      {showAiModal && (
        <div className="drawer-overlay active" style={{ display: 'block' }} onClick={() => setShowAiModal(false)}>
          <div className="drawer-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button type="button" className="drawer-back" onClick={() => setShowAiModal(false)}>
                  <ArrowLeft style={{ width: 18, height: 18 }} />
                </button>
                <h2 className="drawer-title">Together AI — Image Generator</h2>
              </div>
              <button type="button" className="drawer-close" onClick={() => setShowAiModal(false)}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <div className="drawer-body">
              <div className="drawer-section">
                <h3 className="drawer-section-title">PROMPT CONFIGURATION</h3>
                <div className="form-group">
                  <label className="form-label">IMAGE PROMPT</label>
                  <textarea
                    className="property-input"
                    rows={5}
                    placeholder="A sleek modern SaaS dashboard mockup with vibrant neon blue highlights..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="drawer-footer">
              <button className="btn btn-secondary" onClick={() => setShowAiModal(false)}>
                Cancel
              </button>
              <button className="btn" disabled={aiLoading} onClick={handleGenerateAiImage}>
                {aiLoading ? 'Generating...' : 'Generate Image'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Preview Modal */}
      {viewingAsset && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={() => setViewingAsset(null)}>
          <div className="modal-card" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Asset Preview — {viewingAsset.filename}</h2>
              <button className="modal-close" onClick={() => setViewingAsset(null)}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <img
                src={viewingAsset.url}
                alt={viewingAsset.filename}
                style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: 8, border: '1px solid var(--border)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontSize: 12, color: 'var(--text-muted)' }}>
                <span>Size: {viewingAsset.size ? `${(viewingAsset.size / 1024).toFixed(1)} KB` : '12.4 KB'}</span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopyUrl(viewingAsset.url)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Link style={{ width: 12, height: 12 }} /> Copy URL
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setViewingAsset(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        title="Delete Asset"
        message="Are you sure you want to delete this asset? Images used in active campaigns may stop loading."
        confirmText="Delete Asset"
        isDestructive={true}
        onConfirm={handleDeleteAsset}
        onClose={() => setDeleteConfirmId(null)}
      />
    </section>
  );
};
