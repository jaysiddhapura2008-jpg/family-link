import React, { useState } from 'react';
import { ArrowLeft, User, Phone, Mail, Lock } from 'lucide-react';

export default function ScreenAuth({ isLoginMode = false, onBack, onSuccess }) {
  const [isLogin, setIsLogin] = useState(isLoginMode);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? { email, password } : { name, phone, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onSuccess(data.user, data.families);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleMock = () => {
    // Convenient instant sign in for testing
    const demoUser = {
      id: 'usr_new_' + Date.now(),
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+1 555-0999',
      avatar: '👩',
      role: 'parent'
    };
    onSuccess(demoUser, []);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', background: '#ffffff', overflowY: 'auto' }}>
      {/* Top back button */}
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          alignSelf: 'flex-start',
          padding: '6px',
          color: '#475569',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '14px',
          fontWeight: '600'
        }}
      >
        <ArrowLeft size={20} /> Back
      </button>

      <div style={{ marginTop: '16px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
          {isLogin ? 'Welcome back' : 'Create your account'}
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
          {isLogin
            ? 'Sign in to see your family circle'
            : 'Join your family in a secure, private circle'}
        </p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {!isLogin && (
          <div>
            <label className="input-label">Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '40px' }}
              />
              <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
            </div>
          </div>
        )}

        {!isLogin && (
          <div>
            <label className="input-label">Phone number</label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                placeholder="+1 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '40px' }}
              />
              <Phone size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
            </div>
          </div>
        )}

        <div>
          <label className="input-label">Email</label>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              required
              placeholder="e.g. mom@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '40px' }}
            />
            <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
          </div>
        </div>

        <div>
          <label className="input-label">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '40px' }}
            />
            <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '10px' }}>
          {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Create Account'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0', gap: '8px' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        <button
          type="button"
          onClick={handleGoogleMock}
          className="btn-secondary"
          style={{ gap: '10px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          style={{
            background: 'none',
            border: 'none',
            marginTop: '8px',
            color: '#4f46e5',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          {isLogin
            ? "Don't have an account? Create one"
            : 'Already have an account? Log In'}
        </button>
      </form>
    </div>
  );
}
