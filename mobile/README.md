# Disaster Relief Mobile App

React Native mobile application built with Expo for iOS and Android.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:3001/api
EXPO_PUBLIC_DONATION_CONTRACT=0x...
EXPO_PUBLIC_BADGE_CONTRACT=0x...
```

3. Start the development server:
```bash
npm start
```

## Running on Device

### iOS
- Install Expo Go from App Store
- Scan QR code from terminal
- Or press `i` to open iOS simulator

### Android
- Install Expo Go from Google Play
- Scan QR code from terminal
- Or press `a` to open Android emulator

## Building for Production

### Using EAS Build

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login:
```bash
eas login
```

3. Configure:
```bash
eas build:configure
```

4. Build:
```bash
eas build --platform ios
eas build --platform android
```

## Project Structure

- `app/` - Expo Router screens and navigation
- `components/` - Reusable UI components
- `hooks/` - Custom React hooks
- `services/` - API and blockchain services
- `constants/` - App configuration and constants

## Key Features

- Wallet creation and import
- Location-based verification
- Crypto and fiat donations
- Profile management
- Transaction history

