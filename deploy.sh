#!/bin/bash

# OnPurpose Deployment Script
set -e

echo "🚀 Starting OnPurpose deployment..."

# Check if required environment variables are set
required_vars=("DATABASE_URL" "JWT_SECRET" "STRIPE_SECRET_KEY" "CLOUDINARY_CLOUD_NAME")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var environment variable is not set"
        exit 1
    fi
done

# Build and start services
echo "📦 Building Docker images..."
docker-compose build --no-cache

echo "🗄️ Starting database..."
docker-compose up -d db redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🔄 Running database setup..."
docker-compose exec -T db psql -U onpurpose -d onpurpose -f /docker-entrypoint-initdb.d/schema.sql || true

# Start application services
echo "🚀 Starting application services..."
docker-compose up -d app nginx

# Health check
echo "🏥 Performing health check..."
sleep 5
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Deployment successful! OnPurpose is running at http://localhost"
else
    echo "❌ Health check failed. Check logs with: docker-compose logs"
    exit 1
fi

echo "📊 Service status:"
docker-compose ps

echo "🎉 Deployment complete!"
echo "📝 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
