# FamilyLink — Modern Mobile-First Family Location Sharing App

**FamilyLink** is a clean, trustworthy family safety application that allows trusted family members to create private circles, share their live location with consent, view each other on an interactive map, save regular places (such as Home and School), track trips, and receive safety alerts.

> **IMPORTANT PRIVACY PRINCIPLE**: This is **NOT** a secret tracking or surveillance application. Every user knowingly consents to and controls location sharing, can see who is authorized to view their location, and can stop sharing anytime.

---

## 🌟 Key Features

1. **Clean, Mobile-First UI**
   - Built to feel like a native mobile application with soft shadows, rounded cards, bottom sheets, and clear typography.
   - Includes a desktop view simulator with mobile frame toggle and instant multi-member switcher to test pairwise user interactions.

2. **Main 4-Tab Navigation**
   - 🏠 **Home**: Dominant 70-80% interactive map with circular avatar markers, pulsing status badges (green active, blue moving, gray unavailable, red SOS), floating zoom and recenter controls, floating family list card, and emergency SOS button.
   - 👨‍👩‍👧 **Family**: Member list with live status badges, battery level %, and "+ Add Member" invite screen.
   - 📍 **Places**: Saved places (Home, School, Work, etc.) with customizable radius (50m - 500m geofence).
   - 👤 **Me**: Profile, explicit Location Sharing ON/OFF master toggle, duration timer (1 hr, 4 hr, until turned off), and granular "Who can see me" checklist.

3. **Consent & Privacy Architecture**
   - Backend enforces privacy: if a member turns location sharing OFF or excludes another member, coordinates are zeroed out at the API level (never leaked to the client).
   - Real Device Geolocation API (`navigator.geolocation.watchPosition`) + battery status (`navigator.getBattery()`).

4. **Member Location Card (Bottom Sheet)**
   - Tapping any member opens an iOS-style bottom sheet showing:
     - Name, role (Parent/Child), live status (Home, Work, Moving)
     - Battery level %
     - Quick actions: **[ Directions ]**, **[ Call ]**, **[ Message ]**
     - Today's Activity timeline (e.g. "8:20 AM Arrived at School", "6:40 PM Left School").

5. **Places & Geofencing Notifications**
   - Add Place with interactive map picker, radius slider, and arrival/departure toggles per family member.
   - Automatic activity generation and push alerts when a family member enters or leaves a place.

6. **Active Trip Tracking**
   - Start a trip with destination, ETA calculation, route line on the map, and real-time completion.

7. **Emergency SOS**
   - 2-second press-and-hold trigger with circular progress indicator to prevent accidental activation.
   - Instant alarm broadcasting location, time, battery level %, and 911 / emergency contact calling.

---

## 🚀 How to Run

### Development Mode (Recommended)
1. Start the backend server:
   ```bash
   node server/server.js
   ```
2. Start the frontend client:
   ```bash
   npm --prefix client run dev
   ```
3. Open your browser at:
   - **http://localhost:3000** (Vite dev server with Hot Module Reloading)
   - or **http://localhost:4000** (Express server with built bundle)

---

## 🧪 Testing the Complete User Flow

A dedicated end-to-end verification script is included to test the entire lifecycle:
```bash
node server/verify_flow.js
```
The test script automatically verifies:
1. User A registers and creates a family circle ("Johnson Circle").
2. User B registers and joins using the invite code.
3. User B enables location sharing and sends GPS coordinates.
4. User A sees User B on the map with live status and battery.
5. User B stops location sharing.
6. User A can no longer see User B's coordinates (verified redacted).
7. User B adds "Lincoln School" with arrival/departure notifications.
8. User B enables sharing and enters the school radius.
9. Geofence triggers: arrival activity logged and User A receives the notification.

---

## ⚙️ App Name Customization

The app name is defined centrally in `client/src/App.jsx`:
```javascript
export const APP_NAME = 'FamilyLink';
```
Change this variable to rename the application across all splash and header screens.
