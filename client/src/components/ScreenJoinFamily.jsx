import React, { useState } from 'react';
import { ArrowLeft, KeyRound } from 'lucide-react';

export default function ScreenJoinFamily({ onBack, onJoined, currentUserId }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/family/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          userId: currentUserId || 'usr_mom'
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to join family');
      }

      onJoined(data.family);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', background: '#ffffff' }}>
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

      <div style={{ marginTop: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
          Join Family
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', marginBottom: '24px' }}>
          Enter the invitation code shared by a family member.
        </p>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="input-label">Invitation Code</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                placeholder="e.g. SHARMA-789"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="input-field"
                style={{ paddingLeft: '40px', letterSpacing: '1px', textTransform: 'uppercase' }}
              />
              <KeyRound size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
              Tip: The code looks like "SHARMA-789"
            </p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '12px' }}>
            {loading ? 'Joining circle...' : 'Join Family'}
          </button>
        </form>
      </div>
    </div>
  );
}
