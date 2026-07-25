import React, { useState } from 'react';
import { TemplateData } from './types';
import { exportHTML } from './exportHTML';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Sparkles, FileText, AlertCircle, CheckCircle2, ShieldCheck, Accessibility } from 'lucide-react';

interface AIPanelProps {
  templateData: TemplateData;
  onLoadGeneratedTemplate: (template: TemplateData) => void;
  onAppendGeneratedBlock: (html: string) => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({
  templateData,
  onLoadGeneratedTemplate,
  onAppendGeneratedBlock,
}) => {
  const { showToast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  // AI Output States
  const [subjectLines, setSubjectLines] = useState<string[]>([]);
  const [spamAnalysis, setSpamAnalysis] = useState<any | null>(null);
  const [accessibilityResults, setAccessibilityResults] = useState<any | null>(null);

  // 1. Generate Full Template with AI
  const handleGenerateTemplate = async () => {
    if (!prompt.trim()) {
      showToast('Prompt required', 'Please describe the email template you want to generate.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/ai/generate', {
        prompt,
        context: { orgName: templateData.name || 'MailFlow' },
      });
      if (res && res.html) {
        onAppendGeneratedBlock(res.html);
        showToast('Content Generated', 'AI email content generated and appended to canvas.', 'success');
      } else if (res && res.data && res.data.sections) {
        onLoadGeneratedTemplate(res.data);
        showToast('Template Generated', 'Together AI generated a new email layout.', 'success');
      } else {
        showToast('AI Error', 'No HTML content returned from AI generation.', 'error');
      }
    } catch (err: any) {
      showToast('AI Error', err.message || 'Failed to generate design', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Generate Subject Lines
  const handleGenerateSubjects = async () => {
    setLoading(true);
    try {
      const htmlContent = exportHTML(templateData);
      const res = await api.post('/api/ai/subject-lines', {
        html: htmlContent,
        campaignName: templateData.name || 'Email Marketing Campaign',
      });
      const lines = res.lines || res.subjects || (res.data && res.data.lines);
      if (Array.isArray(lines) && lines.length > 0) {
        setSubjectLines(lines);
        showToast('Subjects Generated', 'Generated subject line suggestions.', 'success');
      } else {
        showToast('AI Error', 'No subject lines returned.', 'error');
      }
    } catch (err: any) {
      showToast('AI Error', err.message || 'Failed to generate subject lines', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. Spam Score Checker
  const handleCheckSpamScore = async () => {
    setLoading(true);
    try {
      const htmlContent = exportHTML(templateData);
      const subject = templateData.metadata?.subject || templateData.name || '';
      const res = await api.post('/api/ai/analyze', {
        html: htmlContent,
        subject,
      });
      const analysis = res.analysis || res.data;
      if (analysis) {
        setSpamAnalysis(analysis);
        showToast('Spam Check Complete', 'Spam deliverability score calculated.', 'success');
      } else {
        showToast('AI Error', 'No analysis data returned.', 'error');
      }
    } catch (err: any) {
      showToast('AI Error', err.message || 'Failed to analyze deliverability', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 4. Accessibility Audit
  const handleCheckAccessibility = async () => {
    setLoading(true);
    try {
      const htmlContent = exportHTML(templateData);
      const res = await api.post('/api/ai/accessibility', {
        html: htmlContent,
      });
      const result = res.result || res.data;
      if (result) {
        setAccessibilityResults(result);
        showToast('Accessibility Audit', 'WCAG email standards check complete.', 'success');
      } else {
        showToast('AI Error', 'No accessibility audit data returned.', 'error');
      }
    } catch (err: any) {
      showToast('AI Error', err.message || 'Failed accessibility check', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '16px 20px' }}>
      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} style={{ color: '#8b5cf6' }} />
          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
            Together AI Assistant
          </h4>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#64748b' }}>
          Generate design layouts, subject lines, spam checks & accessibility audits
        </p>
      </div>

      {/* ── AI Layout Generator ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
          Design Generator
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Create a monthly newsletter announcing a 20% discount on summer collection with a CTA button"
          rows={4}
          style={{ width: '100%', padding: '10px 12px', fontSize: 13, borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
        />
        <button
          type="button"
          onClick={handleGenerateTemplate}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
          }}
        >
          <Sparkles size={16} />
          {loading ? 'Generating...' : 'Generate AI Email Design'}
        </button>
      </div>

      {/* ── AI Quick Actions Grid ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
          AI Quality Audits & Utilities
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button
            type="button"
            onClick={handleGenerateSubjects}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 10px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#0f172a',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <FileText size={15} style={{ color: '#2563eb' }} />
            <span>Subject Lines</span>
          </button>

          <button
            type="button"
            onClick={handleCheckSpamScore}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 10px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#0f172a',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <ShieldCheck size={15} style={{ color: '#16a34a' }} />
            <span>Spam Score</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleCheckAccessibility}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '10px 10px',
            borderRadius: 6,
            border: '1px solid #cbd5e1',
            background: '#f8fafc',
            color: '#0f172a',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Accessibility size={15} style={{ color: '#8b5cf6' }} />
          <span>Accessibility Audit (WCAG)</span>
        </button>
      </div>

      {/* Subject Line Results */}
      {subjectLines.length > 0 && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
            Suggested Subject Lines
          </span>
          {subjectLines.map((subj, idx) => (
            <div key={idx} style={{ fontSize: 13, padding: '6px 10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 6, fontWeight: 500 }}>
              {subj}
            </div>
          ))}
        </div>
      )}

      {/* Spam Analysis Results */}
      {spamAnalysis && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>
              Deliverability Score: {spamAnalysis.score !== undefined ? `${spamAnalysis.score}/100` : `${Math.max(0, 100 - (spamAnalysis.spamScore || 0) * 10)}/100`}
            </span>
            <CheckCircle2 size={16} style={{ color: '#16a34a' }} />
          </div>
          {spamAnalysis.spamLevel && (
            <div style={{ fontSize: 12, fontWeight: 600, color: '#15803d' }}>
              Spam Level: <span style={{ textTransform: 'uppercase' }}>{spamAnalysis.spamLevel}</span> ({spamAnalysis.spamScore || 0}/10)
            </div>
          )}
          {spamAnalysis.warnings?.map((w: string, i: number) => (
            <p key={`w-${i}`} style={{ margin: 0, fontSize: 12, color: '#15803d' }}>
              • {w}
            </p>
          ))}
          {spamAnalysis.issues?.map((iss: string, i: number) => (
            <p key={`iss-${i}`} style={{ margin: 0, fontSize: 12, color: '#dc2626' }}>
              • Issue: {iss}
            </p>
          ))}
          {spamAnalysis.suggestions?.map((sug: string, i: number) => (
            <p key={`sug-${i}`} style={{ margin: 0, fontSize: 12, color: '#15803d' }}>
              • Suggestion: {sug}
            </p>
          ))}
        </div>
      )}

      {/* Accessibility Results */}
      {accessibilityResults && (
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>
              WCAG Score: {accessibilityResults.score}/100 {accessibilityResults.grade ? `(Grade ${accessibilityResults.grade})` : ''}
            </span>
            <AlertCircle size={16} style={{ color: '#d97706' }} />
          </div>
          {accessibilityResults.issues?.map((iss: any, i: number) => (
            <p key={`acc-iss-${i}`} style={{ margin: 0, fontSize: 12, color: '#b45309' }}>
              • {typeof iss === 'string' ? iss : `${iss.severity ? `[${iss.severity.toUpperCase()}] ` : ''}${iss.description || iss.rule}`}
            </p>
          ))}
          {accessibilityResults.passed?.map((p: string, i: number) => (
            <p key={`acc-pass-${i}`} style={{ margin: 0, fontSize: 12, color: '#15803d' }}>
              ✓ Passed: {p}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

