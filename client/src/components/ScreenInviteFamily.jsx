import React, { useState } from 'react';
import { Share2, QrCode, Phone, Check, Copy } from 'lucide-react';

export default function ScreenInviteFamily({ family, onDone }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneSent, setPhoneSent] = useState(false);

  const inviteCode = family?.code || 'SHARMA-789';
  const inviteUrl = `${window.location.origin}/join?code=${inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendPhone = (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setPhoneSent(true);
    setTimeout(() => {
      setPhoneSent(false);
      setShowPhoneModal(false);
      setPhoneNumber('');
    }, 1500);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', background: '#ffffff', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
          Invite your family
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px' }}>
          Share your private family circle code with trusted family members.
        </p>

        {/* Invite Code Badge */}
        <div
          style={{
            margin: '20px auto 0 auto',
            background: '#f8fafc',
            border: '2px dashed #cbd5e1',
            borderRadius: '16px',
            padding: '12px 20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '2px', color: '#4f46e5' }}>
            {inviteCode}
          </span>
          <button
            onClick={handleCopyLink}
            style={{
              background: '#eef2ff',
              border: 'none',
              padding: '6px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#4f46e5',
              fontWeight: '700',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* 3 Main Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
        <button
          onClick={handleCopyLink}
          className="btn-secondary"
          style={{ justifyContent: 'flex-start', padding: '16px 20px', gap: '14px' }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#eef2ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Share2 size={20} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Share Invite Link</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Send via WhatsApp, Messages, or Email</div>
          </div>
        </button>

        <button
          onClick={() => setShowQR(!showQR)}
          className="btn-secondary"
          style={{ justifyContent: 'flex-start', padding: '16px 20px', gap: '14px' }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#f0fdf4',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <QrCode size={20} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Show QR Code</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Scan instantly with a phone camera</div>
          </div>
        </button>

        <button
          onClick={() => setShowPhoneModal(true)}
          className="btn-secondary"
          style={{ justifyContent: 'flex-start', padding: '16px 20px', gap: '14px' }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#f0f9ff',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Phone size={20} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Invite by Phone</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Send direct SMS invite</div>
          </div>
        </button>
      </div>

      {/* QR Code display */}
      {showQR && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '24px'
          }}
        >
          <div
            style={{
              width: '160px',
              height: '160px',
              background: '#ffffff',
              margin: '0 auto 12px auto',
              padding: '12px',
              borderRadius: '16px',
              border: '1px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* SVG mock QR Code */}
            <svg width="130" height="130" viewBox="0 0 100 100">
              <rect width="100" height="100" fill="white" />
              <rect x="10" y="10" width="30" height="30" fill="black" />
              <rect x="15" y="15" width="20" height="20" fill="white" />
              <rect x="20" y="20" width="10" height="10" fill="black" />
              <rect x="60" y="10" width="30" height="30" fill="black" />
              <rect x="65" y="15" width="20" height="20" fill="white" />
              <rect x="70" y="20" width="10" height="10" fill="black" />
              <rect x="10" y="60" width="30" height="30" fill="black" />
              <rect x="15" y="65" width="20" height="20" fill="white" />
              <rect x="20" y="70" width="10" height="10" fill="black" />
              <rect x="50" y="50" width="15" height="15" fill="black" />
              <rect x="70" y="60" width="20" height="10" fill="black" />
              <rect x="50" y="75" width="25" height="15" fill="black" />
            </svg>
          </div>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
            Scan with FamilyLink to join {family?.name || 'this family'}
          </p>
        </div>
      )}

      {/* Phone Invite Modal */}
      {showPhoneModal && (
        <div className="bottom-sheet-backdrop" onClick={() => setShowPhoneModal(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>Invite by Phone</h3>
            <form onSubmit={handleSendPhone} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="tel"
                required
                placeholder="Enter phone number (+1 555 0103)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="input-field"
              />
              <button type="submit" className="btn-primary">
                {phoneSent ? 'Invite Sent! ✓' : 'Send SMS Invite'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div style={{ marginTop: 'auto', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
          You can invite people later from Family.
        </p>
        <button className="btn-primary" onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
}
