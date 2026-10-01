import React, { useState } from 'react';
import { ArrowLeft, Users, CheckCircle2 } from 'lucide-react';

export default function ScreenCreateFamily({ onBack, onCreatedFamily, onSkip, currentUserId, currentUserName }) {
  const [familyName, setFamilyName] = useState(currentUserName ? `${currentUserName}'s Circle` : '');
  const [familyPhoto, setFamilyPhoto] = useState('👨‍👩‍👧‍👦');
  const [isCreated, setIsCreated] = useState(false);
  const [createdData, setCreatedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emojiOptions = ['👨‍👩‍👧‍👦', '🏡', '❤️', '🌟', '🛡️', '🍀'];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!familyName.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/family/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: familyName.trim(),
          photo: familyPhoto,
          userId: currentUserId || 'usr_mom'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create family circle');
      setCreatedData(data.family);
      setIsCreated(true);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', background: '#ffffff', overflowY: 'auto' }}>
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

      {!isCreated ? (
        <div style={{ marginTop: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
            Create your family
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', marginBottom: '24px' }}>
            Give your circle a name to get started.
          </p>

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="input-label">Family name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sharma Family"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                />
                <Users size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              </div>
            </div>

            <div>
              <label className="input-label">Circle Icon</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFamilyPhoto(emoji)}
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '14px',
                      border: familyPhoto === emoji ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                      background: familyPhoto === emoji ? '#eef2ff' : '#f8fafc',
                      fontSize: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '16px' }}>
              {loading ? 'Creating...' : 'Create Family'}
            </button>
          </form>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}
          >
            <CheckCircle2 size={44} />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
            Your family is ready.
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>
            "{createdData?.name || familyName}" has been created. Invite your family members to join.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <button className="btn-primary" onClick={() => onCreatedFamily(createdData)}>
              Invite Family
            </button>
            <button
              onClick={onSkip}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '14px',
                fontWeight: '600',
                padding: '12px',
                cursor: 'pointer'
              }}
            >
              Skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
