const API_BASE = 'http://localhost:4000/api';

async function runTests() {
  console.log('=== VERIFYING 3 NEW FAMILYLINK FEATURES ===\n');

  // TEST 1: CIRCLE-ONLY LIVE LOCATION VISIBILITY
  console.log('1. Testing Circle-Only Live Location Visibility...');
  
  // Register User A (Circle 1)
  const resA = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Rohan Sharma', email: `rohan_${Date.now()}@example.com`, role: 'parent' })
  });
  const dataA = await resA.json();
  const userA = dataA.user;

  // Create Circle 1
  const resFam1 = await fetch(`${API_BASE}/family/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Rohan Circle', userId: userA.id })
  });
  const fam1 = (await resFam1.json()).family;

  // User A enables location sharing
  await fetch(`${API_BASE}/privacy/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: userA.id,
      familyId: fam1.id,
      locationSharingEnabled: true
    })
  });

  // User A sends location
  await fetch(`${API_BASE}/location/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: userA.id,
      familyId: fam1.id,
      latitude: 28.6139,
      longitude: 77.2090,
      status: 'Active'
    })
  });

  // Register User C (An outsider, NOT in Circle 1)
  const resC = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Stranger John', email: `stranger_${Date.now()}@example.com`, role: 'parent' })
  });
  const userC = (await resC.json()).user;

  // User C tries to view Circle 1 members & locations
  const resStrangerView = await fetch(`${API_BASE}/family/${fam1.id}/members?userId=${userC.id}`);
  const strangerData = await resStrangerView.json();

  if (strangerData.members.length === 0) {
    console.log('✓ PASS: Non-circle user (Stranger John) was blocked from viewing Circle 1 locations/members (returned 0 members)');
  } else {
    throw new Error('FAIL: Non-circle user received members data!');
  }

  // User A views own circle
  const resMemberView = await fetch(`${API_BASE}/family/${fam1.id}/members?userId=${userA.id}`);
  const memberData = await resMemberView.json();
  const seenMember = memberData.members.find(m => m.id === userA.id);

  if (seenMember && seenMember.location?.latitude === 28.6139) {
    console.log(`✓ PASS: Circle member sees live location marker (${seenMember.location.latitude}, ${seenMember.location.longitude})`);
  } else {
    throw new Error('FAIL: Circle member cannot see own location');
  }

  // TEST 2: ONBOARDING PLACE CATEGORIES WITH DETAILED ADDRESS
  console.log('\n2. Testing Onboarding Place Categories with Detailed Address...');
  const onboardingPlaces = [
    {
      category: 'Home',
      name: 'Home',
      address: 'Flat 402, Block B, Connaught Place, New Delhi',
      icon: '🏠',
      latitude: 28.6139,
      longitude: 77.2090,
      radius: 150
    },
    {
      category: 'Work',
      name: 'Office (Tech Park)',
      address: 'Tower 4, Barakhamba Road, Connaught Place, New Delhi',
      icon: '💼',
      latitude: 28.6318,
      longitude: 77.2194,
      radius: 150
    },
    {
      category: 'School',
      name: 'Delhi Public School',
      address: 'Sector 12, R.K. Puram, New Delhi',
      icon: '🏫',
      latitude: 28.5710,
      longitude: 77.1820,
      radius: 120
    }
  ];

  const resBatch = await fetch(`${API_BASE}/places/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      familyId: fam1.id,
      createdBy: userA.id,
      places: onboardingPlaces
    })
  });
  const batchData = await resBatch.json();

  if (batchData.success && batchData.count === 3) {
    console.log(`✓ PASS: Successfully saved ${batchData.count} onboarding place categories with detailed addresses`);
    console.log(`       - ${batchData.places[0].name} (${batchData.places[0].category}): ${batchData.places[0].address}`);
    console.log(`       - ${batchData.places[1].name} (${batchData.places[1].category}): ${batchData.places[1].address}`);
  } else {
    throw new Error('FAIL: Batch places save failed');
  }

  // TEST 3: AUTOMATIC TRIP & DESTINATION ANNOUNCEMENT
  console.log('\n3. Testing Automatic Trip & Destination Announcement...');
  // User starts trip towards "Work" (by name or coordinates)
  const resTrip = await fetch(`${API_BASE}/trips/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      familyId: fam1.id,
      userId: userA.id,
      userName: userA.name,
      destinationName: 'Office (Tech Park)',
      destLat: 28.6318,
      destLng: 77.2194
    })
  });
  const tripData = await resTrip.json();
  const trip = tripData.trip;

  console.log(`✓ Generated Announcement: "${trip.announcement}"`);
  if (trip.announcement && trip.announcement.includes('Heading to') && trip.announcement.includes('Tower 4, Barakhamba Road')) {
    console.log('✓ PASS: Destination coordinates automatically matched configured category and detailed address');
  } else {
    throw new Error(`FAIL: Announcement missing detailed address or format: ${trip.announcement}`);
  }

  // Check activity feed for the announcement
  const resAct = await fetch(`${API_BASE}/activity/${fam1.id}`);
  const actData = await resAct.json();
  const tripActivity = actData.activities.find(a => a.type === 'trip_start');

  if (tripActivity && tripActivity.text.includes(trip.announcement)) {
    console.log(`✓ PASS: Announcement automatically published to Circle Activity Feed: "${tripActivity.text}"`);
  } else {
    throw new Error('FAIL: Announcement not found in activity feed');
  }

  console.log('\n==================================================');
  console.log('🎉 ALL 3 REQUESTED FEATURES FULLY VERIFIED & WORKING!');
  console.log('==================================================\n');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
