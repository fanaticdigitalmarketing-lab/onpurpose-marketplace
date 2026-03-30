#!/bin/bash

# OnPurpose iOS Build Script
set -e

echo "🍎 Building OnPurpose iOS App..."

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "Installing EAS CLI..."
    npm install -g @expo/eas-cli
fi

# Login to Expo (if not already logged in)
echo "📱 Checking Expo authentication..."
eas whoami || eas login

# Configure project if needed
if [ ! -f "eas.json" ]; then
    echo "⚙️ Configuring EAS build..."
    eas build:configure
fi

# Build for iOS
echo "🔨 Starting iOS build..."
eas build --platform ios --profile preview

echo "✅ iOS build submitted!"
echo "📱 Check build status: https://expo.dev/accounts/[your-account]/projects/onpurpose/builds"
echo "📥 Install via TestFlight when ready"
