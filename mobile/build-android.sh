#!/bin/bash

# OnPurpose Android Build Script
set -e

echo "🤖 Building OnPurpose Android App..."

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

# Build for Android
echo "🔨 Starting Android build..."
eas build --platform android --profile preview

echo "✅ Android build submitted!"
echo "📱 Check build status: https://expo.dev/accounts/[your-account]/projects/onpurpose/builds"
echo "📥 Download APK when ready for testing"
