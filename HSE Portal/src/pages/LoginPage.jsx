import { useState } from 'react';
import BrandMark from '../components/BrandMark';
import { IconMail, IconLock, IconArrowRight, IconEye, IconEyeOff } from '../components/icons';

const VALID_EMAIL = 'admin';
const VALID_PASSWORD = 'admin123';

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
      setError('Invalid email or password. Try admin / admin123.');
      return;
    }
    setError('');
    setSubmitting(true);
    setTimeout(() => onLogin(remember), 350);
  };

  return (
    <div className="auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-brand"><BrandMark tone="light" /></div>
        <p className="auth-tagline">One platform for complete workplace safety management</p>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to SafeNexG to continue</p>

        <div className="field auth-field">
          <label><IconMail size={14} /> Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin"
            autoFocus
            autoComplete="username"
          />
        </div>

        <div className="field auth-field">
          <label><IconLock size={14} /> Password</label>
          <div className="auth-password-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            </button>
          </div>
        </div>

        {error ? <div className="auth-error">{error}</div> : null}

        <label className="auth-remember">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Remember me
        </label>

        <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
          {submitting ? 'Signing In…' : 'Sign In'} <IconArrowRight size={16} />
        </button>

        <div className="auth-links">
          <a href="#" onClick={(e) => e.preventDefault()}>Forgot your password?</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Create new account</a>
        </div>
      </form>
    </div>
  );
}
