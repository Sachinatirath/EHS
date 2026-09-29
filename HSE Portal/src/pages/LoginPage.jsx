import { useState } from 'react';
import emblem from '../assets/brand/emblem.png';
import wordmark from '../assets/brand/wordmark.png';
import loginBg from '../assets/login-bg.jpg';
import {
  IconUser, IconLock, IconEye, IconEyeOff, IconShieldCheck, IconCloud, IconBell, IconHeadset,
} from '../components/icons';
import {
  WorkPermitIcon, SafetyAuditIcon, IncidentIcon, TrainingIcon, ComplianceIcon, AnalyticsIcon,
} from './LoginFeatureIcons';

const VALID_EMAIL = 'admin';
const VALID_PASSWORD = 'admin123';

const FEATURES = [
  { label: 'Work Permits', icon: WorkPermitIcon },
  { label: 'Safety Audits', icon: SafetyAuditIcon },
  { label: 'Incident Reporting', icon: IncidentIcon },
  { label: 'Training Management', icon: TrainingIcon },
  { label: 'Compliance & Tracking', icon: ComplianceIcon },
  { label: 'Analytics & Dashboard', icon: AnalyticsIcon },
];

const HIGHLIGHTS = [
  { title: 'Secure & Reliable', sub: 'Built for a Safer Workplace', icon: IconShieldCheck },
  { title: 'Cloud Based', sub: 'Access Anywhere', icon: IconCloud },
  { title: 'Real-time Notifications', sub: 'Stay Updated Always', icon: IconBell },
  { title: '24/7 Support', sub: "We're Here to Help", icon: IconHeadset },
  { title: 'Data Security', sub: 'Your Data is Protected', icon: IconLock },
];

const GoogleLogo = () => (
  <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

const MicrosoftLogo = () => (
  <svg viewBox="0 0 22 22" width="18" height="18" aria-hidden="true">
    <rect x="0" y="0" width="10" height="10" fill="#F25022" />
    <rect x="12" y="0" width="10" height="10" fill="#7FBA00" />
    <rect x="0" y="12" width="10" height="10" fill="#00A4EF" />
    <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
  </svg>
);

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim() !== VALID_EMAIL || password !== VALID_PASSWORD) {
      setError('Invalid username or password. Try admin / admin123.');
      return;
    }
    setError('');
    setSubmitting(true);
    setTimeout(() => onLogin(remember), 350);
  };

  const notAvailable = (what) => setError(`${what} sign-in is not enabled yet. Please use your username and password.`);

  return (
    <div className="login-page">
      <div className="login-stage">
        {/* Glossy blue sweep behind the card with green ribbons and a peek of the factory, as in the artwork. */}
        <svg className="login-swoosh" viewBox="0 0 640 780" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="sw-blue" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#1e5cc8" />
              <stop offset="0.45" stopColor="#0d3a8e" />
              <stop offset="1" stopColor="#082a6e" />
            </linearGradient>
            <linearGradient id="sw-green" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8fd14f" />
              <stop offset="0.55" stopColor="#3fa34d" />
              <stop offset="1" stopColor="#3fa34d" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="sw-green-r" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#3fa34d" stopOpacity="0" />
              <stop offset="0.5" stopColor="#3fa34d" />
              <stop offset="1" stopColor="#8fd14f" />
            </linearGradient>
            <pattern id="sw-photo" patternUnits="userSpaceOnUse" x="0" y="0" width="640" height="780">
              <image href={loginBg} x="-260" y="-40" width="900" height="840" preserveAspectRatio="xMaxYMid slice" />
            </pattern>
          </defs>
          <path d="M104 0C44 110 12 215 16 330V780H640V0Z" fill="url(#sw-blue)" />
          <path d="M300 0C215 210 205 520 300 780H380C280 520 290 220 385 0Z" fill="#fff" opacity="0.06" />
          <path d="M470 0C430 180 440 420 520 640L560 780H600C500 520 480 250 540 0Z" fill="#fff" opacity="0.05" />
          <path d="M640 352C602 366 588 410 588 470V690C606 700 624 702 640 698Z" fill="url(#sw-photo)" />
          <path d="M588 482C588 414 604 370 640 352" fill="none" stroke="url(#sw-green-r)" strokeWidth="10" strokeLinecap="round" />
          <path d="M120 -6C58 104 22 212 22 330" fill="none" stroke="url(#sw-green)" strokeWidth="14" strokeLinecap="round" />
          <path d="M104 -6C46 104 12 212 14 330" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="3" />
        </svg>

        <section className="login-hero">
          <div className="login-logo">
            <img className="login-emblem" src={emblem} alt="" />
            <span className="login-logo-divider" />
            <img className="login-wordmark" src={wordmark} alt="SafeNexG Innovation — Online Safety Management System" />
          </div>

          <h1 className="login-headline">
            Smart Safety.
            <span>Stronger Tomorrow.</span>
          </h1>
          <span className="login-headline-rule" />
          <p className="login-lead">Manage permits, audits, incidents, training and more with our all-in-one EHS solution.</p>

          <ul className="login-features">
            {FEATURES.map(({ label, icon: Icon }) => (
              <li key={label} className="login-feature">
                <Icon size={46} />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </section>

        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-avatar"><IconUser size={34} strokeWidth={1.7} /></div>
          <h2 className="login-title">Welcome Back!</h2>
          <p className="login-subtitle">Sign in to your <strong>SafeNexG Innovation</strong> account</p>

          <div className="login-field">
            <label htmlFor="login-user">Username / Email</label>
            <div className="login-input">
              <IconUser size={18} />
              <input
                id="login-user"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your username or email"
                autoFocus
                autoComplete="username"
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="login-pass">Password</label>
            <div className="login-input">
              <IconLock size={18} />
              <input
                id="login-pass"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
          </div>

          <div className="login-row">
            <label className="login-remember">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            <a href="#" onClick={(e) => { e.preventDefault(); setError('Please contact your administrator to reset your password.'); }}>
              Forgot Password?
            </a>
          </div>

          {error ? <div className="auth-error">{error}</div> : null}

          <button type="submit" className="login-submit" disabled={submitting}>
            <IconLock size={18} /> {submitting ? 'Signing In…' : 'Sign In'}
          </button>

          <div className="login-or"><span>or continue with</span></div>

          <div className="login-sso">
            <button type="button" onClick={() => notAvailable('Google')}><GoogleLogo /> Google</button>
            <button type="button" onClick={() => notAvailable('Microsoft')}><MicrosoftLogo /> Microsoft</button>
          </div>

          <p className="login-foot">
            Don&apos;t have an account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); setError('Please contact your administrator to create an account.'); }}>
              Contact Administrator
            </a>
          </p>
        </form>
      </div>

      <footer className="login-bar">
        <ul className="login-highlights">
          {HIGHLIGHTS.map(({ title, sub, icon: Icon }) => (
            <li key={title}>
              <Icon size={34} strokeWidth={1.6} />
              <div>
                <strong>{title}</strong>
                <span>{sub}</span>
              </div>
            </li>
          ))}
        </ul>
        <p className="login-copy">© {new Date().getFullYear()} <span>SafeNexG Innovation</span>. All rights reserved.</p>
      </footer>
    </div>
  );
}
