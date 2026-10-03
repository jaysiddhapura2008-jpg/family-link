import React from 'react';
import MapView from './MapView.jsx';
import FamilyCard from './FamilyCard.jsx';

export default function ScreenHome({
  currentUser,
  currentFamily,
  members = [],
  places = [],
  sosAlerts = [],
  selectedMember = null,
  unreadCount = 0,
  onOpenNotifications,
  onOpenProfile,
  onFamilySelect,
  onSelectMember,
  onSelectPlace,
  onViewAllFamily,
  onOpenSOS
}) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Main Interactive Map occupying full viewport */}

      {/* Main Interactive Map occupying full viewport */}
      <div style={{ width: '100%', height: '100%' }}>
        <MapView
          members={members}
          places={places}
          sosAlerts={sosAlerts}
          selectedMember={selectedMember}
          currentUserId={currentUser?.id}
          userLocation={members.find((m) => m.id === currentUser?.id)?.location}
          onSelectMember={onSelectMember}
          onSelectPlace={onSelectPlace}
        />
      </div>

      {/* Safe accessible Floating SOS Button */}
      <button
        className="sos-floating-btn"
        onClick={onOpenSOS}
        title="Emergency SOS"
      >
        SOS
      </button>

      {/* Bottom Floating Family Card */}
      <FamilyCard
        members={members}
        selectedMemberId={selectedMember?.id}
        onSelectMember={onSelectMember}
        onViewAll={onViewAllFamily}
      />
    </div>
  );
}
