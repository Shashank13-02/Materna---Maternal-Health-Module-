import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import AppIcon from '../components/AppIcon';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function OTPLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    const normalizedPhone = phone.replace(/[\s()-]/g, '');
    if (!/^\+?[1-9]\d{9,14}$/.test(normalizedPhone)) {
      setError('Enter a valid mobile number, for example +91 98765 43210.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/request-otp`, { phone_number: normalizedPhone });
      setPhone(normalizedPhone);
      setStep('otp');
      setCountdown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return;
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/verify-otp`, {
        phone_number: phone,
        otp_code: code,
      });
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('worker_id', res.data.worker_id);
      localStorage.setItem('worker_role', res.data.worker_role || 'ASHA');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-orbit login-orbit-one" aria-hidden="true" />
      <div className="login-orbit login-orbit-two" aria-hidden="true" />
      <main className="login-layout fade-in-up">
        <section className="login-story" aria-label="About the maternal health module">
          <div className="brand-mark"><AppIcon name="heart" size={28} strokeWidth={1.7} /></div>
          <p className="eyebrow">Maternal care companion</p>
          <h1>{t('app_name')}</h1>
          <p className="login-intro">{t('app_subtitle')}</p>
          <div className="trust-list">
            <div><span><AppIcon name="shield" size={18} /></span><p><strong>Development prototype</strong><small>Use test data in this staff workspace.</small></p></div>
            <div><span><AppIcon name="heart" size={18} /></span><p><strong>Whole-person care</strong><small>Physical health and emotional wellbeing together.</small></p></div>
            <div><span><AppIcon name="sync" size={18} /></span><p><strong>Works in the field</strong><small>Capture visits even with an unreliable connection.</small></p></div>
          </div>
        </section>

        <section className="login-panel">
          <div className="login-panel-header">
            <p className="eyebrow">Staff prototype access</p>
            <span className="secure-pill">Demo</span>
          </div>
          <Link className="btn btn-secondary btn-full mb-4" to="/wellbeing">For mothers: open my wellbeing check-in</Link>
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP}>
              <h2 className="text-heading" style={{ marginBottom: 4 }}>{t('login_title')}</h2>
              <p className="text-sm" style={{ marginBottom: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                {t('login_subtitle')}
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="phone-input">{t('phone_label')}</label>
                <input
                  id="phone-input"
                  className="input"
                  type="tel"
                  placeholder={t('phone_placeholder')}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  required
                />
                <p className="form-hint">Use a 10-digit mobile number. The development OTP is shown after you continue.</p>
              </div>

              {error && <p className="form-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</p>}

              <button
                id="send-otp-btn"
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading || !phone.trim()}
              >
                {loading ? <span className="spin">⟳</span> : null} {t('send_otp')} <span aria-hidden="true">→</span>
              </button>

              <p className="text-xs text-center" style={{ marginTop: 'var(--space-4)', color: 'var(--color-accent-amber)' }}>
                Development mode · OTP will be 123456
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setStep('phone'); setError(''); setOtp(['','','','','','']); }}
                style={{ marginBottom: 'var(--space-4)', padding: 0 }}
              >
                ← Back
              </button>

              <h2 className="text-heading" style={{ marginBottom: 4 }}>{t('otp_label')}</h2>
              <p className="text-sm" style={{ marginBottom: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
                {t('otp_sent', { phone })}
              </p>

              <div className="otp-input-row" style={{ marginBottom: 'var(--space-6)' }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    className="otp-digit"
                    id={`otp-digit-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    autoComplete="one-time-code"
                    aria-label={`OTP digit ${i + 1}`}
                  />
                ))}
              </div>

              {error && <p className="form-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</p>}

              <button
                id="verify-otp-btn"
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading || otp.join('').length < 6}
              >
                {loading ? <span className="spin">⟳</span> : <AppIcon name="check" size={18} />} {t('verify_otp')}
              </button>

              <div className="text-center" style={{ marginTop: 'var(--space-4)' }}>
                {countdown > 0 ? (
                  <p className="text-sm">Resend in {countdown}s</p>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleSendOTP}
                  >
                    {t('resend_otp')}
                  </button>
                )}
              </div>

              <p className="text-xs text-center" style={{ marginTop: 'var(--space-3)', color: 'var(--color-accent-amber)' }}>
                ⚡ {t('mock_hint')}
              </p>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
