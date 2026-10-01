import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function FamilyCard({
  members = [],
  selectedMemberId,
  onSelectMember,
  onViewAll
}) {
  const getStatusBadge = (member) => {
    const loc = member.location;
    if (member.privacy?.locationSharingEnabled === false) {
      return { text: 'Sharing off', color: '#94a3b8', bg: '#f1f5f9' };
    }
    if (!loc || !loc.latitude) {
      return { text: 'Unavailable', color: '#94a3b8', bg: '#f1f5f9' };
    }
    if (loc.isOffline || !loc.isLive) {
      return { text: loc.lastSeenText || 'Offline', color: '#d97706', bg: '#fffbeb' };
    }
    if (loc.status === 'Moving' || (loc.speed && loc.speed > 5)) {
      return { text: 'Moving', color: '#0284c7', bg: '#e0f2fe' };
    }
    return { text: loc.status || 'Active', color: '#10b981', bg: '#ecfdf5' };
  };

  return (
    <div className="bottom-family-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Family</span>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>({members.length})</span>
        </div>
        <button
          onClick={onViewAll}
          style={{
            background: 'none',
            border: 'none',
            color: '#4f46e5',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}
        >
          View All <ChevronRight size={14} />
        </button>
      </div>

      <div className="member-pill-row">
        {members.map((member) => {
          const badge = getStatusBadge(member);
          const isSelected = selectedMemberId === member.id;

          return (
            <div
              key={member.id}
              className={`member-pill ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectMember(member)}
            >
              <span style={{ fontSize: '20px' }}>{member.avatar || '👤'}</span>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: '60px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap' }}>
                  {member.name.split(' ')[0]}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: badge.color,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {badge.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
