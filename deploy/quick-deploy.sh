#!/bin/bash

# OnPurpose Quick Deployment Script
set -e

echo "🚀 OnPurpose Quick Deployment"
echo "============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the OnPurpose project root directory"
    exit 1
fi

# Function to prompt for input with default
prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local result
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " result
        echo "${result:-$default}"
    else
        read -p "$prompt: " result
        echo "$result"
    fi
}

# Function to generate secure password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

echo ""
echo "📝 Configuration Setup"
echo "======================"

# Choose deployment method
echo ""
echo "Choose deployment method:"
echo "1. Heroku (Recommended - Managed hosting)"
echo "2. Docker (Self-hosted containers)"
echo "3. Manual (Configure manually)"
echo ""

DEPLOY_METHOD=$(prompt_with_default "Select option (1-3)" "1")

case $DEPLOY_METHOD in
    1)
        DEPLOYMENT="heroku"
        ;;
    2)
        DEPLOYMENT="docker"
        ;;
    3)
        DEPLOYMENT="manual"
        ;;
    *)
        echo "❌ Invalid selection"
        exit 1
        ;;
esac

echo ""
echo "🔑 API Keys Configuration"
echo "========================"

# Stripe configuration
echo ""
echo "Stripe Configuration (get from https://dashboard.stripe.com/apikeys):"
STRIPE_PK=$(prompt_with_default "Stripe Publishable Key (pk_live_...)" "")
STRIPE_SK=$(prompt_with_default "Stripe Secret Key (sk_live_...)" "")
STRIPE_WH=$(prompt_with_default "Stripe Webhook Secret (whsec_...)" "")

# Email configuration
echo ""
echo "Email Configuration:"
echo "1. SendGrid (Recommended)"
echo "2. Gmail"
echo "3. Custom SMTP"

EMAIL_PROVIDER=$(prompt_with_default "Select email provider (1-3)" "1")

case $EMAIL_PROVIDER in
    1)
        EMAIL_HOST="smtp.sendgrid.net"
        EMAIL_PORT="587"
        EMAIL_USER="apikey"
        EMAIL_PASS=$(prompt_with_default "SendGrid API Key" "")
        ;;
    2)
        EMAIL_HOST="smtp.gmail.com"
        EMAIL_PORT="587"
        EMAIL_USER=$(prompt_with_default "Gmail address" "")
        EMAIL_PASS=$(prompt_with_default "Gmail App Password (16 chars)" "")
        ;;
    3)
        EMAIL_HOST=$(prompt_with_default "SMTP Host" "")
        EMAIL_PORT=$(prompt_with_default "SMTP Port" "587")
        EMAIL_USER=$(prompt_with_default "SMTP Username" "")
        EMAIL_PASS=$(prompt_with_default "SMTP Password" "")
        ;;
esac

EMAIL_FROM=$(prompt_with_default "From email address" "noreply@onpurpose.app")

# Domain configuration
echo ""
DOMAIN=$(prompt_with_default "Your domain (e.g., onpurpose.app)" "localhost:3000")

# Generate JWT secret
JWT_SECRET=$(generate_password)

echo ""
echo "📄 Creating environment file..."

# Create .env.production file
cat > .env.production << EOF
# Production Environment Configuration
NODE_ENV=production
PORT=3000

# Authentication
JWT_SECRET=$JWT_SECRET

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=$STRIPE_PK
STRIPE_SECRET_KEY=$STRIPE_SK
STRIPE_WEBHOOK_SECRET=$STRIPE_WH

# Email Configuration
EMAIL_HOST=$EMAIL_HOST
EMAIL_PORT=$EMAIL_PORT
EMAIL_USER=$EMAIL_USER
EMAIL_PASS=$EMAIL_PASS
EMAIL_FROM=$EMAIL_FROM

# App Configuration
APP_URL=https://$DOMAIN
CORS_ORIGIN=https://$DOMAIN
RATE_LIMIT_MAX=50
LOG_LEVEL=warn

# Security
SSL_CERT_PATH=/etc/ssl/certs/certificate.crt
SSL_KEY_PATH=/etc/ssl/private/private.key
EOF

echo "✅ Environment file created: .env.production"

# Execute deployment based on method
echo ""
echo "🚀 Starting Deployment"
echo "====================="

case $DEPLOYMENT in
    "heroku")
        echo "Deploying to Heroku..."
        
        # Check if Heroku CLI is installed
        if ! command -v heroku &> /dev/null; then
            echo "❌ Heroku CLI not found. Please install it first:"
            echo "https://devcenter.heroku.com/articles/heroku-cli"
            exit 1
        fi
        
        APP_NAME=$(prompt_with_default "Heroku app name (or auto-generate)" "onpurpose-$(date +%s)")
        
        echo "Creating Heroku app: $APP_NAME"
        heroku create $APP_NAME --region us || echo "App might already exist"
        
        echo "Adding PostgreSQL..."
        heroku addons:create heroku-postgresql:mini --app $APP_NAME || echo "Addon might already exist"
        
        echo "Adding SendGrid..."
        heroku addons:create sendgrid:starter --app $APP_NAME || echo "Addon might already exist"
        
        echo "Setting environment variables..."
        heroku config:set NODE_ENV=production --app $APP_NAME
        heroku config:set JWT_SECRET="$JWT_SECRET" --app $APP_NAME
        heroku config:set STRIPE_PUBLISHABLE_KEY="$STRIPE_PK" --app $APP_NAME
        heroku config:set STRIPE_SECRET_KEY="$STRIPE_SK" --app $APP_NAME
        heroku config:set STRIPE_WEBHOOK_SECRET="$STRIPE_WH" --app $APP_NAME
        heroku config:set EMAIL_HOST="$EMAIL_HOST" --app $APP_NAME
        heroku config:set EMAIL_PORT="$EMAIL_PORT" --app $APP_NAME
        heroku config:set EMAIL_USER="$EMAIL_USER" --app $APP_NAME
        heroku config:set EMAIL_PASS="$EMAIL_PASS" --app $APP_NAME
        heroku config:set EMAIL_FROM="$EMAIL_FROM" --app $APP_NAME
        heroku config:set CORS_ORIGIN="https://$APP_NAME.herokuapp.com" --app $APP_NAME
        
        echo "Deploying application..."
        git add .
        git commit -m "Production deployment" || echo "No changes to commit"
        heroku git:remote -a $APP_NAME
        git push heroku main || git push heroku master
        
        echo "Running database migrations..."
        heroku run npx sequelize-cli db:migrate --app $APP_NAME
        
        echo "Seeding database..."
        heroku run npx sequelize-cli db:seed:all --app $APP_NAME
        
        echo ""
        echo "🎉 Heroku Deployment Complete!"
        echo "=============================="
        echo "App URL: https://$APP_NAME.herokuapp.com"
        echo "Webhook URL: https://$APP_NAME.herokuapp.com/api/payment/webhook"
        echo ""
        echo "Next steps:"
        echo "1. Configure webhook URL in Stripe dashboard"
        echo "2. Test the application"
        echo "3. Set up custom domain (optional)"
        
        heroku open --app $APP_NAME
        ;;
        
    "docker")
        echo "Deploying with Docker..."
        
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker not found. Please install Docker first."
            exit 1
        fi
        
        echo "Building and starting containers..."
        docker-compose -f docker-compose.yml up -d --build
        
        echo "Waiting for database to be ready..."
        sleep 10
        
        echo "Running database migrations..."
        docker-compose exec app npx sequelize-cli db:migrate
        
        echo "Seeding database..."
        docker-compose exec app npx sequelize-cli db:seed:all
        
        echo ""
        echo "🎉 Docker Deployment Complete!"
        echo "=============================="
        echo "App URL: http://localhost:3000 (configure SSL for production)"
        echo "Webhook URL: https://$DOMAIN/api/payment/webhook"
        echo ""
        echo "Next steps:"
        echo "1. Configure SSL certificates"
        echo "2. Set up domain and DNS"
        echo "3. Configure webhook URL in Stripe dashboard"
        ;;
        
    "manual")
        echo ""
        echo "🎉 Manual Configuration Complete!"
        echo "================================="
        echo "Environment file created: .env.production"
        echo ""
        echo "Next steps:"
        echo "1. Set up your production database"
        echo "2. Configure SSL certificates"
        echo "3. Deploy to your hosting provider"
        echo "4. Run: npm install && npm start"
        echo "5. Configure webhook URL: https://$DOMAIN/api/payment/webhook"
        ;;
esac

echo ""
echo "📋 Post-Deployment Checklist:"
echo "============================="
echo "□ Test application functionality"
echo "□ Configure Stripe webhook URL"
echo "□ Test payment processing"
echo "□ Test email notifications"
echo "□ Set up monitoring alerts"
echo "□ Configure domain and SSL"
echo "□ Run production tests: node deploy/production-test.js https://$DOMAIN"
echo ""
echo "🔗 Useful Links:"
echo "================"
echo "Stripe Dashboard: https://dashboard.stripe.com/"
echo "Stripe Webhooks: https://dashboard.stripe.com/webhooks"
echo "SSL Test: https://www.ssllabs.com/ssltest/"
echo ""
echo "✅ Deployment script completed successfully!"
