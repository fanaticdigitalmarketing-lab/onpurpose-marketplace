# OnPurpose Mobile App

A premium React Native app for the OnPurpose human services marketplace.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx expo start
```

3. Download Expo Go from the App Store on your iPhone
4. Scan the QR code that appears in the terminal
5. The app will open on your phone instantly

## Features

- ✅ Beautiful authentication (login/register)
- ✅ Browse services with category filters
- ✅ Service cards with gradients and trust badges
- ✅ Booking management (upcoming/completed/cancelled)
- ✅ User profile with editable fields
- ✅ Provider dashboard (for service providers)
- ✅ Premium UI with custom design system
- ✅ Bottom tab navigation
- ✅ Pull-to-refresh and loading states

## Architecture

- **Expo Router** for file-based navigation
- **Expo** for managed React Native development
- **Axios** for API communication
- **AsyncStorage** for token persistence
- **Custom design system** with colors and typography

## API Configuration

Update `API_URL` in `lib/constants.js` to point to your Railway backend:

```javascript
export const API_URL = 'https://your-app.railway.app';
```

## Fonts (Optional)

The app uses system fonts by default. To use custom Google Fonts:

1. Download Playfair Display and DM Sans fonts
2. Place them in `assets/fonts/`
3. Update font references in `lib/constants.js`

## Screens

- **Auth**: Login & registration with email/password
- **Home**: Browse services with search and filters
- **Bookings**: Manage bookings with status tracking
- **Profile**: User profile with editable fields
- **Provider**: Dashboard for service providers

## Components

- **Logo**: Custom OnPurpose logo component
- **Button**: Reusable button with variants
- **ServiceCard**: Beautiful service listing cards
- **BookingCard**: Booking management cards

## Design System

- Colors: Navy, blue, and neutral palette
- Typography: Serif for headings, sans-serif for body
- Components follow iOS design patterns
- Smooth animations and haptic feedback
