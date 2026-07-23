import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import '../assets/auth.css';

import { PolicyModal } from '../components/ui/PolicyModal';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { checkSession } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [policyModal, setPolicyModal] = useState<'tos' | 'privacy' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/api/auth/login', { email, password, rememberMe });
      if (res.success) {
        await checkSession();
        navigate('/dashboard');
      } else {
        setError(res.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-bg"></div>

      <nav className="auth-topbar">
        <div className="auth-panel-logo">
          <div className="auth-panel-logo-icon" style={{ background: 'var(--auth-primary)', border: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
              <rect x="2" y="4" width="20" height="16" rx="3" />
              <path d="M2 8l10 7 10-7" />
            </svg>
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--auth-text)' }}>MailFlow</span>
        </div>
        <Link to="/signup" className="shad-btn shad-btn-outline shad-btn-sm" style={{ width: 'auto', padding: '0 14px' }}>
          Create account
        </Link>
      </nav>

      <div className="auth-root">
        <aside className="auth-panel">
          <div className="auth-panel-logo">
            <div className="auth-panel-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="M2 8l10 7 10-7" />
              </svg>
            </div>
            <span className="auth-panel-logo-text">MailFlow</span>
            <span className="auth-panel-logo-badge">Pro</span>
          </div>

          <div className="auth-panel-hero">
            <div className="auth-panel-tag">
              <span className="auth-panel-tag-dot"></span>
              Trusted by 2,000+ organizations
            </div>
            <h1 className="auth-panel-title">
              Email marketing<br /><span>that converts</span>
            </h1>
            <p className="auth-panel-desc">
              Orchestrate beautiful campaigns, build smart customer segments, and track every open and click — all in one place.
            </p>
            <div className="auth-panel-features">
              <div className="auth-panel-feature">
                <div className="auth-panel-feature-icon" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="auth-panel-feature-body">
                  <strong>Customer Segmentation</strong>
                  <span>Target the right audience with dynamic rule-based segments</span>
                </div>
              </div>
              <div className="auth-panel-feature">
                <div className="auth-panel-feature-icon" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <div className="auth-panel-feature-body">
                  <strong>Real-time Analytics</strong>
                  <span>Open rates, clicks, and conversions tracked live</span>
                </div>
              </div>
              <div className="auth-panel-feature">
                <div className="auth-panel-feature-icon" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </div>
                <div className="auth-panel-feature-body">
                  <strong>Smart Campaigns</strong>
                  <span>Schedule, automate, and A/B test email campaigns</span>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-panel-stats">
            <div>
              <div className="auth-panel-stat-val">98.7%</div>
              <div className="auth-panel-stat-lbl">Delivery Rate</div>
            </div>
            <div>
              <div className="auth-panel-stat-val">2M+</div>
              <div className="auth-panel-stat-lbl">Emails Sent</div>
            </div>
            <div>
              <div className="auth-panel-stat-val">4.9★</div>
              <div className="auth-panel-stat-lbl">Rating</div>
            </div>
          </div>
        </aside>

        <div className="auth-form-area">
          <div className="auth-form-card">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ background: 'var(--auth-primary)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)', marginBottom: '14px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="M2 8l10 7 10-7" />
                </svg>
              </div>
              <div style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--auth-primary)', fontSize: '0.75rem', fontWeight: 600, padding: '5px 12px', borderRadius: '99px', marginBottom: '14px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', background: 'var(--auth-primary)', borderRadius: '50%' }}></span>
                Welcome to MailFlow
              </div>
              <h1 className="auth-card-title" style={{ margin: '0 0 6px 0', fontSize: '1.5rem' }}>Welcome back</h1>
              <p className="auth-card-desc" style={{ margin: 0, fontSize: '0.875rem' }}>Sign in to your organization's dashboard</p>
            </div>

            {error && (
              <div className="shad-alert shad-alert-error" style={{ display: 'flex' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="shad-field">
                <label className="shad-label" htmlFor="email" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--auth-primary)' }}>
                    <rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 8l10 7 10-7" />
                  </svg>
                  Email Address <span className="required">*</span>
                </label>
                <div className="shad-input-wrap">
                  <input
                    type="email"
                    id="email"
                    className="shad-input"
                    style={{ paddingLeft: '14px' }}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="shad-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="shad-label" htmlFor="password" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--auth-primary)' }}>
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Password <span className="required">*</span>
                  </label>
                  <a href="#" style={{ fontSize: '0.75rem', color: 'var(--auth-primary)', textDecoration: 'none', fontWeight: 500 }} onClick={(e) => e.preventDefault()}>
                    Forgot password?
                  </a>
                </div>
                <div className="shad-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="shad-input"
                    style={{ paddingLeft: '14px' }}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="shad-pw-toggle"
                    style={{ right: '12px' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="shad-check-row" style={{ marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="shad-check-label" htmlFor="rememberMe">
                  Keep me signed in for 30 days
                </label>
              </div>

              <button type="submit" className="shad-btn" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                  <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>

            <div className="auth-footer">
              Don't have an account? <Link to="/signup">Register</Link>
            </div>
            <div className="auth-footer" style={{ marginTop: '10px', fontSize: '0.7rem' }}>
              By signing in, you agree to our{' '}
              <a href="#" style={{ color: 'var(--auth-primary)' }} onClick={(e) => { e.preventDefault(); setPolicyModal('tos'); }}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" style={{ color: 'var(--auth-primary)' }} onClick={(e) => { e.preventDefault(); setPolicyModal('privacy'); }}>
                Privacy Policy
              </a>.
            </div>
          </div>
        </div>
      </div>

      <PolicyModal type={policyModal} onClose={() => setPolicyModal(null)} />
    </>
  );
};
