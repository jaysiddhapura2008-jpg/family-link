import React from 'react';
import { ArrowLeft, Shield, Check, Clock, AlertCircle } from 'lucide-react';

export default function ScreenLocationSharingSettings({
  privacy,
  members = [],
  currentUserId,
  onBack,
  onUpdatePrivacy
}) {
  const isSharing = privacy?.locationSharingEnabled ?? true;
  const allowedMemberIds = privacy?.allowedMemberIds || [];
  const duration = privacy?.shareDuration || 'always';

  const otherMembers = members.filter((m) => m.id !== currentUserId);

  const handleToggleSharing = (enabled) => {
    onUpdatePrivacy({
      locationSharingEnabled: enabled,
      shareUntil: enabled && duration !== 'always' ? calculateExpiry(duration) : null
    });
  };

  const handleDurationChange = (dur) => {
    onUpdatePrivacy({
      shareDuration: dur,
      shareUntil: dur === 'always' ? null : calculateExpiry(dur)
    });
  };

  const calculateExpiry = (dur) => {
    const hours = dur === '1h' ? 1 : dur === '4h' ? 4 : 0;
    return hours ? new Date(Date.now() + hours * 3600000).toISOString() : null;
  };

  const handleToggleMember = (memberId) => {
    const newAllowed = allowedMemberIds.includes(memberId)
      ? allowedMemberIds.filter((id) => id !== memberId)
      : [...allowedMemberIds, memberId];

    onUpdatePrivacy({ allowedMemberIds: newAllowed });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ffffff', overflowY: 'auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#475569' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Location Sharing</h2>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Prominent Status Banner */}
        <div
          style={{
            background: isSharing ? '#ecfdf5' : '#fef2f2',
            border: isSharing ? '1.5px solid #a7f3d0' : '1.5px solid #fecaca',
            borderRadius: '20px',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '24px'
          }}
        >
          <div style={{ fontSize: '28px', marginBottom: '6px' }}>
            {isSharing ? '🟢' : '🔴'}
          </div>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '800',
              color: isSharing ? '#065f46' : '#991b1b',
              marginBottom: '4px'
            }}
          >
            {isSharing ? 'Location Sharing ON' : 'Location Sharing OFF'}
          </h3>
          <p
            style={{
              fontSize: '13px',
              color: isSharing ? '#047857' : '#b91c1c',
              marginBottom: '16px'
            }}
          >
            {isSharing
              ? 'Your family can see your current location.'
              : 'Your family cannot see your current location.'}
          </p>

          <button
            onClick={() => handleToggleSharing(!isSharing)}
            className={isSharing ? 'btn-secondary' : 'btn-primary'}
            style={{
              width: 'auto',
              display: 'inline-flex',
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: '700',
              borderColor: isSharing ? '#fca5a5' : 'transparent',
              color: isSharing ? '#dc2626' : '#ffffff'
            }}
          >
            {isSharing ? 'Stop Sharing' : 'Turn On'}
          </button>
        </div>

        {/* Share Duration Selector */}
        {isSharing && (
          <div style={{ marginBottom: '28px' }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} />
              <span>Share for:</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '8px' }}>
              {[
                { id: '1h', label: '1 hour' },
                { id: '4h', label: '4 hours' },
                { id: 'always', label: 'Until I turn off' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleDurationChange(opt.id)}
                  style={{
                    padding: '10px 4px',
                    borderRadius: '12px',
                    border: duration === opt.id ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                    background: duration === opt.id ? '#eef2ff' : '#f8fafc',
                    color: duration === opt.id ? '#4f46e5' : '#334155',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Who Can See Me */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <label className="input-label" style={{ margin: 0 }}>Who can see me?</label>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {allowedMemberIds.length} of {otherMembers.length} selected
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {otherMembers.map((member) => {
              const isChecked = allowedMemberIds.includes(member.id);
              return (
                <div
                  key={member.id}
                  onClick={() => handleToggleMember(member.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '22px' }}>{member.avatar || '👤'}</span>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{member.name}</h4>
                      <p style={{ fontSize: '11px', color: '#64748b' }}>{member.role || 'Family Member'}</p>
                    </div>
                  </div>

                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '8px',
                      background: isChecked ? '#10b981' : '#ffffff',
                      border: isChecked ? 'none' : '2px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
                    }}
                  >
                    {isChecked && <Check size={16} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
