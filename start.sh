#!/bin/bash

# OnPurpose Marketplace Deployment Script
# This script handles the deployment of the OnPurpose marketplace

set -e  # Exit on any error

echo "🚀 Starting OnPurpose Marketplace Deployment..."

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is required"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ ERROR: JWT_SECRET environment variable is required"
    exit 1
fi

# Set default values
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-3000}
export CORS_ORIGIN=${CORS_ORIGIN:-*}
export RATE_LIMIT_MAX=${RATE_LIMIT_MAX:-100}

echo "📡 Environment: $NODE_ENV"
echo "🌐 Port: $PORT"
echo "🔐 CORS Origin: $CORS_ORIGIN"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run database migrations if needed
echo "🗃️ Running database migrations..."
npm run migrate 2>/dev/null || echo "No migrations to run"

# Start the application
echo "🎯 Starting OnPurpose API server..."
exec npm start
