import React from 'react';
import { UserPlus, ChevronRight, BatteryCharging, ShieldAlert } from 'lucide-react';

export default function ScreenFamily({
  currentFamily,
  members = [],
  onSelectMember,
  onAddMember,
  onOpenSOS
}) {
  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'recently';
    const diffMin = Math.round((Date.now() - new Date(isoString).getTime()) / 60000);
    if (diffMin <= 1) return '1 min ago';
    if (diffMin < 60) return `${diffMin} min ago`;
    return `${Math.round(diffMin / 60)}h ago`;
  };

  const getStatusIndicator = (member) => {
    const loc = member.location;
    if (member.privacy?.locationSharingEnabled === false) {
      return {
        dot: '#94a3b8',
        text: 'Sharing turned off',
        badgeBg: '#f1f5f9',
        badgeColor: '#64748b'
      };
    }
    if (!loc || !loc.latitude) {
      return {
        dot: '#94a3b8',
        text: 'Location unavailable',
        badgeBg: '#f1f5f9',
        badgeColor: '#64748b'
      };
    }
    if (loc.isOffline || !loc.isLive) {
      return {
        dot: '#f59e0b',
        text: loc.lastSeenText || 'Offline',
        badgeBg: '#fffbeb',
        badgeColor: '#d97706'
      };
    }
    if (loc.status === 'Moving' || (loc.speed && loc.speed > 5)) {
      return {
        dot: '#0284c7',
        text: 'Moving',
        badgeBg: '#e0f2fe',
        badgeColor: '#0284c7'
      };
    }
    return {
      dot: '#10b981',
      text: loc.status || 'Active',
      badgeBg: '#ecfdf5',
      badgeColor: '#10b981'
    };
  };

  return (
    <div className="scroll-content">
      {/* Top Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>My Family</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <span style={{ fontSize: '18px' }}>{currentFamily?.photo || '👨‍👩‍👧‍👦'}</span>
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#4f46e5' }}>
            {currentFamily?.name || 'Family Circle'}
          </span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>• {members.length} members</span>
        </div>
      </div>

      {/* Member Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {members.map((member) => {
          const status = getStatusIndicator(member);
          const loc = member.location;

          return (
            <div
              key={member.id}
              onClick={() => onSelectMember(member)}
              className="card"
              style={{
                cursor: 'pointer',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    position: 'relative',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}
                >
                  {member.avatar || '👤'}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '0px',
                      right: '0px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: status.dot,
                      border: '2px solid white'
                    }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                      {member.name}
                    </h4>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: status.badgeColor,
                        background: status.badgeBg,
                        padding: '2px 6px',
                        borderRadius: '6px'
                      }}
                    >
                      {status.text}
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Last updated {formatTimeAgo(loc?.lastUpdated)}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {loc?.battery && (
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#16a34a' }}>
                    {loc.battery}%
                  </span>
                )}
                <ChevronRight size={18} color="#94a3b8" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Button: [ + Add Member ] */}
      <button className="btn-primary" onClick={onAddMember}>
        <UserPlus size={18} />
        <span>+ Add Member</span>
      </button>
    </div>
  );
}
