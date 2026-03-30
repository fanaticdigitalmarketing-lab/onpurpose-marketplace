#!/bin/bash

# Heroku deployment script for OnPurpose
set -e

echo "🚀 Starting Heroku deployment for OnPurpose..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Please install it first:"
    echo "https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Login to Heroku (if not already logged in)
echo "🔐 Checking Heroku authentication..."
heroku auth:whoami || heroku login

# Create Heroku app (replace 'your-app-name' with desired name)
APP_NAME=${1:-onpurpose-app-$(date +%s)}
echo "📱 Creating Heroku app: $APP_NAME"
heroku create $APP_NAME --region us

# Add PostgreSQL addon
echo "🗄️ Adding PostgreSQL database..."
heroku addons:create heroku-postgresql:mini --app $APP_NAME

# Add SendGrid addon for email
echo "📧 Adding SendGrid for email..."
heroku addons:create sendgrid:starter --app $APP_NAME

# Add Papertrail for logging
echo "📊 Adding Papertrail for logging..."
heroku addons:create papertrail:choklad --app $APP_NAME

# Set environment variables
echo "⚙️ Setting environment variables..."
heroku config:set NODE_ENV=production --app $APP_NAME
heroku config:set JWT_SECRET=$(openssl rand -base64 32) --app $APP_NAME
heroku config:set RATE_LIMIT_MAX=50 --app $APP_NAME
heroku config:set LOG_LEVEL=warn --app $APP_NAME

# Get database URL
DATABASE_URL=$(heroku config:get DATABASE_URL --app $APP_NAME)
echo "✅ Database URL configured: ${DATABASE_URL:0:30}..."

# Set CORS origin
heroku config:set CORS_ORIGIN=https://$APP_NAME.herokuapp.com --app $APP_NAME

echo "⚠️  IMPORTANT: You need to manually set these environment variables:"
echo "   heroku config:set STRIPE_PUBLISHABLE_KEY=pk_live_... --app $APP_NAME"
echo "   heroku config:set STRIPE_SECRET_KEY=sk_live_... --app $APP_NAME"
echo "   heroku config:set STRIPE_WEBHOOK_SECRET=whsec_... --app $APP_NAME"
echo ""
echo "   SendGrid will be auto-configured, but you can also set:"
echo "   heroku config:set EMAIL_FROM=noreply@yourdomain.com --app $APP_NAME"

# Deploy the app
echo "🚀 Deploying to Heroku..."
git add .
git commit -m "Deploy to Heroku" || echo "No changes to commit"
heroku git:remote -a $APP_NAME
git push heroku main

# Run database migrations
echo "🗄️ Running database migrations..."
heroku run npx sequelize-cli db:migrate --app $APP_NAME

# Seed the database
echo "🌱 Seeding database with initial data..."
heroku run npx sequelize-cli db:seed:all --app $APP_NAME

# Open the app
echo "🎉 Deployment complete!"
echo "App URL: https://$APP_NAME.herokuapp.com"
echo "Opening app in browser..."
heroku open --app $APP_NAME

echo ""
echo "📋 Next steps:"
echo "1. Configure your domain name in Heroku dashboard"
echo "2. Set up SSL certificate (automatic with custom domain)"
echo "3. Configure Stripe webhook URL: https://$APP_NAME.herokuapp.com/api/payment/webhook"
echo "4. Test the application thoroughly"
echo "5. Set up monitoring alerts in Heroku dashboard"
