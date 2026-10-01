import React, { useState } from 'react';
import { ArrowLeft, Share2, QrCode, Phone, Clock, Copy, Check } from 'lucide-react';

export default function ScreenAddMember({ currentFamily, onBack }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const inviteCode = currentFamily?.code || 'SHARMA-789';
  const inviteUrl = `${window.location.origin}/join?code=${inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#475569' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Add family member</h2>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Invite someone you trust to {currentFamily?.name || 'your family'}.
          </p>
          <div
            style={{
              marginTop: '12px',
              background: '#f8fafc',
              border: '2px dashed #cbd5e1',
              borderRadius: '16px',
              padding: '12px 18px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '2px', color: '#4f46e5' }}>
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

        {/* 3 Main Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          <button
            onClick={handleCopyLink}
            className="btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '14px 18px', gap: '14px' }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Share2 size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Share Invite Link</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Send through any messaging app</div>
            </div>
          </button>

          <button
            onClick={() => setShowQR(!showQR)}
            className="btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '14px 18px', gap: '14px' }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>QR Code</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Scan directly with phone camera</div>
            </div>
          </button>

          <button
            onClick={() => alert(`SMS invite link created for code ${inviteCode}`)}
            className="btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '14px 18px', gap: '14px' }}
          >
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Phone size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Invite by Phone</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Send an SMS with invitation code</div>
            </div>
          </button>
        </div>

        {/* QR preview */}
        {showQR && (
          <div style={{ textAlign: 'center', marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '16px' }}>
            <div style={{ width: '130px', height: '130px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '12px', margin: '0 auto 8px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={100} color="#0f172a" />
            </div>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Scan with camera to join circle</p>
          </div>
        )}

        {/* Pending Invitations Section */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#475569', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pending Invitations
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={16} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>+1 555-0105 (Uncle Dave)</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Sent 2 hours ago</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', background: '#fef3c7', padding: '2px 8px', borderRadius: '6px' }}>
                Pending
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
