import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Country, State as StateCity } from 'country-state-city';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PolicyModal } from '../components/ui/PolicyModal';
import { CustomSelect, SelectOption } from '../components/ui/CustomSelect';
import '../assets/auth.css';

interface BranchItem {
  name: string;
  location: string;
  address?: string;
}

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { checkSession } = useAuth();

  // Navigation State
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [policyModal, setPolicyModal] = useState<'tos' | 'privacy' | null>(null);

  // Step 1: Personal Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Step 2: Organization & HQ
  const [orgName, setOrgName] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [website, setWebsite] = useState('');
  const [logo, setLogo] = useState('');
  const [hqCity, setHqCity] = useState('');
  const [hqState, setHqState] = useState('');
  const [hqCountry, setHqCountry] = useState('IN');
  const [hqZip, setHqZip] = useState('');
  const [hqAddress, setHqAddress] = useState('');

  // Country & State Lists
  const [allCountries, setAllCountries] = useState<{ isoCode: string; name: string; phonecode: string }[]>([]);
  const [allStates, setAllStates] = useState<{ isoCode: string; name: string }[]>([]);

  // Step 3: Branches
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [branchName, setBranchName] = useState('');
  const [branchLocation, setBranchLocation] = useState('');
  const [branchAddress, setBranchAddress] = useState('');

  // Load countries
  useEffect(() => {
    try {
      const countries = Country.getAllCountries().map((c) => ({
        isoCode: c.isoCode,
        name: c.name,
        phonecode: c.phonecode,
      }));
      setAllCountries(countries);
    } catch (e) {
      // Fallback if country-state-city fails
    }
  }, []);

  // Update states when hqCountry changes
  useEffect(() => {
    if (!hqCountry) {
      setAllStates([]);
      return;
    }
    try {
      const states = StateCity.getStatesOfCountry(hqCountry).map((s) => ({
        isoCode: s.isoCode,
        name: s.name,
      }));
      setAllStates(states);
      setHqState('');
    } catch (e) {
      setAllStates([]);
    }
  }, [hqCountry]);

  // Password Validation Checkers
  const isLenPass = password.length >= 8;
  const isUpperPass = /[A-Z]/.test(password);
  const isLowerPass = /[a-z]/.test(password);
  const isNumPass = /[0-9]/.test(password);
  const isSpecialPass = /[^A-Za-z0-9]/.test(password);

  // Custom select option mappings
  const phoneCodeOptions: SelectOption[] = [
    { value: '+91', label: 'IN (+91)' },
    { value: '+1', label: 'US (+1)' },
    { value: '+44', label: 'UK (+44)' },
    { value: '+971', label: 'AE (+971)' },
    { value: '+65', label: 'SG (+65)' },
    { value: '+61', label: 'AU (+61)' },
    ...allCountries.map((c) => ({
      value: `+${c.phonecode}`,
      label: `${c.name} (+${c.phonecode})`,
      sublabel: c.isoCode,
    })),
  ];

  const countryOptions: SelectOption[] = allCountries.map((c) => ({
    value: c.isoCode,
    label: c.name,
    sublabel: c.isoCode,
  }));

  const stateOptions: SelectOption[] = allStates.map((s) => ({
    value: s.name,
    label: s.name,
  }));

  const industryOptions: SelectOption[] = [
    { value: 'Technology', label: 'Technology' },
    { value: 'E-commerce', label: 'E-commerce' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Education', label: 'Education' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Other', label: 'Other' },
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addBranch = () => {
    if (!branchName.trim() || !branchLocation.trim()) {
      setError('Branch Name and Location are required.');
      return;
    }
    setError(null);
    setBranches([
      ...branches,
      {
        name: branchName.trim(),
        location: branchLocation.trim(),
        address: branchAddress.trim(),
      },
    ]);
    setBranchName('');
    setBranchLocation('');
    setBranchAddress('');
  };

  const removeBranch = (index: number) => {
    setBranches(branches.filter((_, i) => i !== index));
  };

  // Validation & Navigation handlers
  const validateStep1 = () => {
    if (!firstName.trim()) {
      setError('First name is required.');
      return false;
    }
    if (!email.trim()) {
      setError('Email address is required.');
      return false;
    }
    if (!phone.trim()) {
      setError('Phone number is required.');
      return false;
    }
    if (!password) {
      setError('Password is required.');
      return false;
    }
    if (!isLenPass || !isUpperPass || !isLowerPass || !isNumPass || !isSpecialPass) {
      setError('Password must meet all security criteria.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!orgName.trim()) {
      setError('Organization Name is required.');
      return false;
    }
    if (!hqCity.trim()) {
      setError('HQ City is required.');
      return false;
    }
    if (!hqCountry) {
      setError('HQ Country is required.');
      return false;
    }
    setError(null);
    return true;
  };

  const goNextStep1 = () => {
    if (validateStep1()) setStep(2);
  };

  const goNextStep2 = () => {
    if (validateStep2()) setStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const payload = {
      name: `${firstName.trim()} ${lastName.trim()}`,
      email: email.trim(),
      password,
      orgName: orgName.trim(),
      logo,
      industry,
      website: website.trim(),
      location: {
        address: hqAddress.trim(),
        city: hqCity.trim(),
        state: hqState.trim(),
        country: hqCountry,
        zip: hqZip.trim(),
      },
      branches,
    };

    try {
      const res = await api.post('/api/auth/signup', payload);
      if (res.success || res.user || res.data) {
        setStep(4);
      } else {
        setError(res.error || 'Registration failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    await checkSession();
    navigate('/dashboard');
  };

  return (
    <div className="signup-root-wrap">
      <div className="signup-container">
        {/* Left Sidebar */}
        <aside className="signup-sidebar">
          <div>
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <span className="sidebar-logo-text">MailFlow</span>
            </div>

            <div className="sidebar-steps">
              <div className={`sidebar-step ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}>
                <div className="sidebar-step-circle">1</div>
                <span className="sidebar-step-label">Personal Details</span>
              </div>
              <div className={`sidebar-step ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>
                <div className="sidebar-step-circle">2</div>
                <span className="sidebar-step-label">Setup Your Organization</span>
              </div>
              <div className={`sidebar-step ${step === 3 ? 'active' : step > 3 ? 'done' : ''}`}>
                <div className="sidebar-step-circle">3</div>
                <span className="sidebar-step-label">Setup Branches</span>
              </div>
              <div className={`sidebar-step ${step === 4 ? 'active' : ''}`}>
                <div className="sidebar-step-circle">4</div>
                <span className="sidebar-step-label">Integration & Done</span>
              </div>
            </div>
          </div>

          <div className="sidebar-footer">
            <Link to="/login" className="sidebar-logout">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Logout
            </Link>
            <div className="sidebar-copyright">All rights reserved @ MailFlow</div>
          </div>
        </aside>

        {/* Right Content Area */}
        <div className="signup-content">
          {error && (
            <div className="shad-alert shad-alert-error" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: PERSONAL DETAILS */}
          {step === 1 && (
            <div className="own-fade">
              <div className="content-header">
                <div>
                  <h2 className="content-title">Hi! Let's Get to Know You!</h2>
                  <p className="content-subtitle">Just a few details to set up your account.</p>
                </div>
                <div className="content-step-indicator">Step 1 / 4</div>
              </div>

              <div className="signup-step-body">
                <div className="own-grid-2">
                  <div className="own-field">
                    <label className="own-label" htmlFor="firstName">
                      First Name <span className="required">*</span>
                    </label>
                    <div className="own-input-wrap">
                      <input
                        type="text"
                        id="firstName"
                        className="own-input"
                        placeholder="Enter your first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="own-field">
                    <label className="own-label" htmlFor="lastName">
                      Last Name
                    </label>
                    <div className="own-input-wrap">
                      <input
                        type="text"
                        id="lastName"
                        className="own-input"
                        placeholder="Enter your last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="own-field">
                  <label className="own-label" htmlFor="email">
                    Email <span className="required">*</span>
                  </label>
                  <div className="own-input-wrap">
                    <input
                      type="email"
                      id="email"
                      className="own-input"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="own-field">
                  <label className="own-label" htmlFor="phone">
                    Phone Number <span className="required">*</span>
                  </label>
                  <div className="phone-flex">
                    <div style={{ width: 130, flexShrink: 0 }}>
                      <CustomSelect
                        id="countryCode"
                        options={phoneCodeOptions}
                        value={countryCode}
                        onChange={setCountryCode}
                        searchable
                        searchPlaceholder="Search country code..."
                      />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      className="own-input"
                      style={{ flex: 1 }}
                      placeholder="Enter phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <p className="phone-hint">Enter 10 digits for selected country</p>
                </div>

                <div className="own-grid-2">
                  <div className="own-field">
                    <label className="own-label" htmlFor="password">
                      Password <span className="required">*</span>
                    </label>
                    <div className="own-input-wrap">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        className="own-input own-input-pw"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="own-pw-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="own-field">
                    <label className="own-label" htmlFor="confirmPw">
                      Confirm Password <span className="required">*</span>
                    </label>
                    <div className="own-input-wrap">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPw"
                        className="own-input own-input-pw"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="own-pw-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Security Checklist */}
                <div className="pw-checklist">
                  <div className={`pw-check-item ${isLenPass ? 'pass' : ''}`}>
                    <span className="pw-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    Min 8 characters
                  </div>
                  <div className={`pw-check-item ${isUpperPass ? 'pass' : ''}`}>
                    <span className="pw-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    Uppercase letter
                  </div>
                  <div className={`pw-check-item ${isLowerPass ? 'pass' : ''}`}>
                    <span className="pw-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    Lowercase letter
                  </div>
                  <div className={`pw-check-item ${isNumPass ? 'pass' : ''}`}>
                    <span className="pw-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    Number
                  </div>
                  <div className={`pw-check-item ${isSpecialPass ? 'pass' : ''}`}>
                    <span className="pw-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    Special character
                  </div>
                </div>

                <div className="shad-check-row" style={{ marginTop: 12, marginBottom: 12 }}>
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{ accentColor: 'var(--own-purple)' }}
                  />
                  <label className="shad-check-label" htmlFor="terms">
                    I agree to the{' '}
                    <a
                      href="#"
                      style={{ color: 'var(--own-purple)', fontWeight: 600 }}
                      onClick={(e) => {
                        e.preventDefault();
                        setPolicyModal('tos');
                      }}
                    >
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      href="#"
                      style={{ color: 'var(--own-purple)', fontWeight: 600 }}
                      onClick={(e) => {
                        e.preventDefault();
                        setPolicyModal('privacy');
                      }}
                    >
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>

              <div className="own-form-footer">
                <span className="own-required-text">* Required</span>
                <button type="button" className="own-btn-save" onClick={goNextStep1}>
                  Save and Continue
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="13" height="13">
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SETUP YOUR ORGANIZATION */}
          {step === 2 && (
            <div className="own-fade">
              <div className="content-header">
                <div>
                  <h2 className="content-title">Setup Your Organization</h2>
                  <p className="content-subtitle">Tell us about your organization — name, logo, industry and HQ.</p>
                </div>
                <div className="content-step-indicator">Step 2 / 4</div>
              </div>

              <div className="signup-step-body">
                {/* Logo Upload Zone */}
                <div className="own-field">
                  <label className="own-label">Organization Logo</label>
                  <div
                    className={`own-logo-dropzone ${logo ? 'has-logo' : ''}`}
                    onClick={() => document.getElementById('logoFile')?.click()}
                  >
                    {logo ? (
                      <img src={logo} className="own-logo-preview" alt="Logo preview" />
                    ) : (
                      <div className="own-logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="3" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                    <p className="logo-upload-title" style={{ fontSize: '0.8125rem', fontWeight: 700, margin: '4px 0 0 0' }}>
                      {logo ? 'Change logo' : 'Click to upload logo'}
                    </p>
                    <p className="logo-upload-sub" style={{ fontSize: '0.75rem', color: 'var(--own-muted)', margin: 0 }}>
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                  <input
                    type="file"
                    id="logoFile"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleLogoUpload}
                  />
                </div>

                <div className="own-field">
                  <label className="own-label" htmlFor="orgName">
                    Organization Name <span className="required">*</span>
                  </label>
                  <div className="own-input-wrap">
                    <input
                      type="text"
                      id="orgName"
                      className="own-input"
                      placeholder="Enter organization name"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="own-grid-2">
                  <div className="own-field">
                    <label className="own-label" htmlFor="industry">
                      Industry
                    </label>
                    <CustomSelect
                      id="industry"
                      options={industryOptions}
                      value={industry}
                      onChange={setIndustry}
                    />
                  </div>
                  <div className="own-field">
                    <label className="own-label" htmlFor="website">
                      Website
                    </label>
                    <div className="own-input-wrap">
                      <input
                        type="url"
                        id="website"
                        className="own-input"
                        placeholder="https://company.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Headquarters Location */}
                <div
                  style={{
                    background: '#f7f6fd',
                    border: '1px solid var(--own-border)',
                    borderRadius: 'var(--own-radius)',
                    padding: 16,
                    marginBottom: 10,
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--own-purple)',
                      margin: '0 0 12px 0',
                    }}
                  >
                    Headquarters Location
                  </p>
                  <div className="own-grid-2">
                    <div className="own-field">
                      <label className="own-label">
                        City <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="hqCity"
                        className="own-input"
                        placeholder="HQ City"
                        value={hqCity}
                        onChange={(e) => setHqCity(e.target.value)}
                      />
                    </div>
                    <div className="own-field">
                      <label className="own-label">State / Province</label>
                      <CustomSelect
                        id="hqState"
                        options={stateOptions}
                        value={hqState}
                        onChange={setHqState}
                        placeholder={allStates.length === 0 ? 'Select country first...' : 'Select state...'}
                        searchable={allStates.length > 5}
                        searchPlaceholder="Search state..."
                        disabled={allStates.length === 0}
                      />
                    </div>
                  </div>
                  <div className="own-grid-2">
                    <div className="own-field" style={{ marginBottom: 0 }}>
                      <label className="own-label">
                        Country <span className="required">*</span>
                      </label>
                      <CustomSelect
                        id="hqCountry"
                        options={countryOptions}
                        value={hqCountry}
                        onChange={(val) => setHqCountry(val)}
                        placeholder="Select country..."
                        searchable
                        searchPlaceholder="Search country..."
                      />
                    </div>
                    <div className="own-field" style={{ marginBottom: 0 }}>
                      <label className="own-label">Postal Code</label>
                      <input
                        type="text"
                        id="hqZip"
                        className="own-input"
                        placeholder="HQ Postal Code"
                        value={hqZip}
                        onChange={(e) => setHqZip(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="own-field" style={{ marginTop: 12, marginBottom: 0 }}>
                    <label className="own-label">Full Address</label>
                    <input
                      type="text"
                      id="hqAddress"
                      className="own-input"
                      placeholder="Street address, building..."
                      value={hqAddress}
                      onChange={(e) => setHqAddress(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="own-form-footer">
                <span className="own-required-text">* Required</span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="own-btn-save"
                    style={{ background: '#e0dbf0', color: 'var(--own-purple)', boxShadow: 'none' }}
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                  <button type="button" className="own-btn-save" onClick={goNextStep2}>
                    Save and Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SETUP BRANCHES */}
          {step === 3 && (
            <div className="own-fade">
              <div className="content-header">
                <div>
                  <h2 className="content-title">Setup Branches</h2>
                  <p className="content-subtitle">
                    Add other branches or offices. You can skip this and add them later in settings.
                  </p>
                </div>
                <div className="content-step-indicator">Step 3 / 4</div>
              </div>

              <div className="signup-step-body">
                {/* Add branch box */}
                <div
                  style={{
                    background: '#f7f6fd',
                    border: '1px solid var(--own-border)',
                    borderRadius: 'var(--own-radius)',
                    padding: 16,
                    marginBottom: 18,
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: 'var(--own-purple)',
                      textTransform: 'uppercase',
                      margin: '0 0 12px 0',
                    }}
                  >
                    Add a Branch Office
                  </p>
                  <div className="own-grid-2">
                    <div className="own-field">
                      <label className="own-label">
                        Branch Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="own-input"
                        placeholder="e.g. South Office"
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                      />
                    </div>
                    <div className="own-field">
                      <label className="own-label">
                        Location / City <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="own-input"
                        placeholder="e.g. Chennai"
                        value={branchLocation}
                        onChange={(e) => setBranchLocation(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="own-field" style={{ marginBottom: 12 }}>
                    <label className="own-label">Address (optional)</label>
                    <input
                      type="text"
                      className="own-input"
                      placeholder="Branch street address"
                      value={branchAddress}
                      onChange={(e) => setBranchAddress(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="own-btn-save"
                    style={{ height: 36, padding: '0 16px', fontSize: '0.8125rem' }}
                    onClick={addBranch}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="12" height="12">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Branch
                  </button>
                </div>

                {/* Rendered list of branches */}
                <div style={{ marginBottom: 20 }}>
                  {branches.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: 20,
                        fontSize: '0.8125rem',
                        color: 'var(--own-muted)',
                        border: '1px dashed var(--own-border)',
                        borderRadius: 'var(--own-radius-sm)',
                      }}
                    >
                      No branch offices added yet.
                    </div>
                  ) : (
                    branches.map((b, i) => (
                      <div key={i} className="branch-list-card">
                        <div className="branch-list-card-details">
                          <span className="branch-list-card-name">{b.name}</span>
                          <span className="branch-list-card-loc">
                            {b.location} {b.address ? `• ${b.address}` : ''}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="branch-list-remove"
                          onClick={() => removeBranch(i)}
                          title="Remove branch"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="own-form-footer">
                <span className="own-required-text">* Required</span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="own-btn-save"
                    style={{ background: '#e0dbf0', color: 'var(--own-purple)', boxShadow: 'none' }}
                    onClick={() => setStep(2)}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="own-btn-save"
                    disabled={loading}
                    onClick={handleSubmit}
                  >
                    {loading ? 'Creating Organization...' : 'Create Organization & Continue'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: INTEGRATION & DONE */}
          {step === 4 && (
            <div className="own-fade">
              <div className="content-header">
                <div>
                  <h2 className="content-title">Integration & Done</h2>
                  <p className="content-subtitle">Your organization workspace is created successfully! Let's get started.</p>
                </div>
                <div className="content-step-indicator">Step 4 / 4</div>
              </div>

              <div className="signup-step-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  <div className="own-success-card">
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        background: 'rgba(37, 99, 235, 0.1)',
                        color: 'var(--own-purple)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '0.875rem', fontWeight: 700 }}>Add customers</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--own-muted)' }}>
                        Import contacts via CSV upload or manual creation
                      </p>
                    </div>
                  </div>

                  <div className="own-success-card">
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        background: 'rgba(37, 99, 235, 0.1)',
                        color: 'var(--own-purple)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '0.875rem', fontWeight: 700 }}>Group into segments</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--own-muted)' }}>
                        Segment your customers dynamically using filters and rules
                      </p>
                    </div>
                  </div>

                  <div className="own-success-card">
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        background: 'rgba(37, 99, 235, 0.1)',
                        color: 'var(--own-purple)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '0.875rem', fontWeight: 700 }}>Launch email campaigns</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--own-muted)' }}>
                        Create template designs and send out to your target groups
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="own-form-footer" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="own-btn-save" onClick={handleFinish}>
                  Go to Dashboard
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="13" height="13">
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <PolicyModal type={policyModal} onClose={() => setPolicyModal(null)} />
    </div>
  );
};
