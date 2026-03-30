# OnPurpose Windows PowerShell Deployment Script

Write-Host "🚀 OnPurpose Production Deployment" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the OnPurpose project root directory" -ForegroundColor Red
    exit 1
}

# Function to prompt for input with default
function Prompt-WithDefault {
    param(
        [string]$Prompt,
        [string]$Default = ""
    )
    
    if ($Default) {
        $input = Read-Host "$Prompt [$Default]"
        if ([string]::IsNullOrEmpty($input)) { return $Default }
        return $input
    } else {
        return Read-Host $Prompt
    }
}

# Function to generate secure password
function Generate-SecurePassword {
    $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    $password = ""
    for ($i = 0; $i -lt 32; $i++) {
        $password += $chars[(Get-Random -Maximum $chars.Length)]
    }
    return $password
}

Write-Host ""
Write-Host "📝 Configuration Setup" -ForegroundColor Yellow
Write-Host "======================" -ForegroundColor Yellow

# Choose deployment method
Write-Host ""
Write-Host "Choose deployment method:"
Write-Host "1. Heroku (Recommended - Managed hosting)"
Write-Host "2. Docker (Self-hosted containers)"
Write-Host "3. Manual (Configure manually)"
Write-Host ""

$deployMethod = Prompt-WithDefault "Select option (1-3)" "1"

switch ($deployMethod) {
    "1" { $deployment = "heroku" }
    "2" { $deployment = "docker" }
    "3" { $deployment = "manual" }
    default {
        Write-Host "❌ Invalid selection" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🔑 API Keys Configuration" -ForegroundColor Yellow
Write-Host "========================" -ForegroundColor Yellow

# Stripe configuration
Write-Host ""
Write-Host "Stripe Configuration (get from https://dashboard.stripe.com/apikeys):"
$stripePK = Prompt-WithDefault "Stripe Publishable Key (pk_live_...)" ""
$stripeSK = Prompt-WithDefault "Stripe Secret Key (sk_live_...)" ""
$stripeWH = Prompt-WithDefault "Stripe Webhook Secret (whsec_...)" ""

# Email configuration
Write-Host ""
Write-Host "Email Configuration:"
Write-Host "1. SendGrid (Recommended)"
Write-Host "2. Gmail"
Write-Host "3. Custom SMTP"

$emailProvider = Prompt-WithDefault "Select email provider (1-3)" "1"

switch ($emailProvider) {
    "1" {
        $emailHost = "smtp.sendgrid.net"
        $emailPort = "587"
        $emailUser = "apikey"
        $emailPass = Prompt-WithDefault "SendGrid API Key" ""
    }
    "2" {
        $emailHost = "smtp.gmail.com"
        $emailPort = "587"
        $emailUser = Prompt-WithDefault "Gmail address" ""
        $emailPass = Prompt-WithDefault "Gmail App Password (16 chars)" ""
    }
    "3" {
        $emailHost = Prompt-WithDefault "SMTP Host" ""
        $emailPort = Prompt-WithDefault "SMTP Port" "587"
        $emailUser = Prompt-WithDefault "SMTP Username" ""
        $emailPass = Prompt-WithDefault "SMTP Password" ""
    }
}

$emailFrom = Prompt-WithDefault "From email address" "noreply@onpurpose.app"

# Domain configuration
Write-Host ""
$domain = Prompt-WithDefault "Your domain (e.g., onpurpose.app)" "localhost:3000"

# Generate JWT secret
$jwtSecret = Generate-SecurePassword

Write-Host ""
Write-Host "📄 Creating environment file..." -ForegroundColor Yellow

# Create .env.production file
$envContent = @"
# Production Environment Configuration
NODE_ENV=production
PORT=3000

# Authentication
JWT_SECRET=$jwtSecret

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=$stripePK
STRIPE_SECRET_KEY=$stripeSK
STRIPE_WEBHOOK_SECRET=$stripeWH

# Email Configuration
EMAIL_HOST=$emailHost
EMAIL_PORT=$emailPort
EMAIL_USER=$emailUser
EMAIL_PASS=$emailPass
EMAIL_FROM=$emailFrom

# App Configuration
APP_URL=https://$domain
CORS_ORIGIN=https://$domain
RATE_LIMIT_MAX=50
LOG_LEVEL=warn

# Security
SSL_CERT_PATH=/etc/ssl/certs/certificate.crt
SSL_KEY_PATH=/etc/ssl/private/private.key
"@

$envContent | Out-File -FilePath ".env.production" -Encoding UTF8
Write-Host "✅ Environment file created: .env.production" -ForegroundColor Green

# Execute deployment based on method
Write-Host ""
Write-Host "🚀 Starting Deployment" -ForegroundColor Yellow
Write-Host "=====================" -ForegroundColor Yellow

switch ($deployment) {
    "heroku" {
        Write-Host "Deploying to Heroku..." -ForegroundColor Cyan
        
        # Check if Heroku CLI is installed
        try {
            heroku --version | Out-Null
        } catch {
            Write-Host "❌ Heroku CLI not found. Please install it first:" -ForegroundColor Red
            Write-Host "https://devcenter.heroku.com/articles/heroku-cli"
            exit 1
        }
        
        $appName = Prompt-WithDefault "Heroku app name (or auto-generate)" "onpurpose-$(Get-Date -Format 'yyyyMMddHHmmss')"
        
        Write-Host "Creating Heroku app: $appName" -ForegroundColor Cyan
        heroku create $appName --region us
        
        Write-Host "Adding PostgreSQL..." -ForegroundColor Cyan
        heroku addons:create heroku-postgresql:mini --app $appName
        
        Write-Host "Adding SendGrid..." -ForegroundColor Cyan
        heroku addons:create sendgrid:starter --app $appName
        
        Write-Host "Setting environment variables..." -ForegroundColor Cyan
        heroku config:set NODE_ENV=production --app $appName
        heroku config:set JWT_SECRET="$jwtSecret" --app $appName
        heroku config:set STRIPE_PUBLISHABLE_KEY="$stripePK" --app $appName
        heroku config:set STRIPE_SECRET_KEY="$stripeSK" --app $appName
        heroku config:set STRIPE_WEBHOOK_SECRET="$stripeWH" --app $appName
        heroku config:set EMAIL_HOST="$emailHost" --app $appName
        heroku config:set EMAIL_PORT="$emailPort" --app $appName
        heroku config:set EMAIL_USER="$emailUser" --app $appName
        heroku config:set EMAIL_PASS="$emailPass" --app $appName
        heroku config:set EMAIL_FROM="$emailFrom" --app $appName
        heroku config:set CORS_ORIGIN="https://$appName.herokuapp.com" --app $appName
        
        Write-Host "Deploying application..." -ForegroundColor Cyan
        git add .
        git commit -m "Production deployment"
        heroku git:remote -a $appName
        git push heroku main
        
        Write-Host "Running database migrations..." -ForegroundColor Cyan
        heroku run npx sequelize-cli db:migrate --app $appName
        
        Write-Host "Seeding database..." -ForegroundColor Cyan
        heroku run npx sequelize-cli db:seed:all --app $appName
        
        Write-Host ""
        Write-Host "🎉 Heroku Deployment Complete!" -ForegroundColor Green
        Write-Host "==============================" -ForegroundColor Green
        Write-Host "App URL: https://$appName.herokuapp.com"
        Write-Host "Webhook URL: https://$appName.herokuapp.com/api/payment/webhook"
        Write-Host ""
        Write-Host "Next steps:"
        Write-Host "1. Configure webhook URL in Stripe dashboard"
        Write-Host "2. Test the application"
        Write-Host "3. Set up custom domain (optional)"
        
        heroku open --app $appName
    }
    
    "docker" {
        Write-Host "Deploying with Docker..." -ForegroundColor Cyan
        
        try {
            docker --version | Out-Null
        } catch {
            Write-Host "❌ Docker not found. Please install Docker first." -ForegroundColor Red
            exit 1
        }
        
        Write-Host "Building and starting containers..." -ForegroundColor Cyan
        docker-compose -f docker-compose.yml up -d --build
        
        Write-Host "Waiting for database to be ready..." -ForegroundColor Cyan
        Start-Sleep -Seconds 10
        
        Write-Host "Running database migrations..." -ForegroundColor Cyan
        docker-compose exec app npx sequelize-cli db:migrate
        
        Write-Host "Seeding database..." -ForegroundColor Cyan
        docker-compose exec app npx sequelize-cli db:seed:all
        
        Write-Host ""
        Write-Host "🎉 Docker Deployment Complete!" -ForegroundColor Green
        Write-Host "==============================" -ForegroundColor Green
        Write-Host "App URL: http://localhost:3000 (configure SSL for production)"
        Write-Host "Webhook URL: https://$domain/api/payment/webhook"
        Write-Host ""
        Write-Host "Next steps:"
        Write-Host "1. Configure SSL certificates"
        Write-Host "2. Set up domain and DNS"
        Write-Host "3. Configure webhook URL in Stripe dashboard"
    }
    
    "manual" {
        Write-Host ""
        Write-Host "🎉 Manual Configuration Complete!" -ForegroundColor Green
        Write-Host "=================================" -ForegroundColor Green
        Write-Host "Environment file created: .env.production"
        Write-Host ""
        Write-Host "Next steps:"
        Write-Host "1. Set up your production database"
        Write-Host "2. Configure SSL certificates"
        Write-Host "3. Deploy to your hosting provider"
        Write-Host "4. Run: npm install && npm start"
        Write-Host "5. Configure webhook URL: https://$domain/api/payment/webhook"
    }
}

Write-Host ""
Write-Host "📋 Post-Deployment Checklist:" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow
Write-Host "□ Test application functionality"
Write-Host "□ Configure Stripe webhook URL"
Write-Host "□ Test payment processing"
Write-Host "□ Test email notifications"
Write-Host "□ Set up monitoring alerts"
Write-Host "□ Configure domain and SSL"
Write-Host "□ Run production tests: node deploy/production-test.js https://$domain"
Write-Host ""
Write-Host "🔗 Useful Links:" -ForegroundColor Yellow
Write-Host "================" -ForegroundColor Yellow
Write-Host "Stripe Dashboard: https://dashboard.stripe.com/"
Write-Host "Stripe Webhooks: https://dashboard.stripe.com/webhooks"
Write-Host "SSL Test: https://www.ssllabs.com/ssltest/"
Write-Host ""
Write-Host "✅ Deployment script completed successfully!" -ForegroundColor Green
