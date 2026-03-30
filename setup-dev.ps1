# OnPurpose Development Setup Script for Windows
Write-Host "🚀 Setting up OnPurpose for local development..." -ForegroundColor Green

# Check if Node.js is installed
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found. Installing Node.js..." -ForegroundColor Red
    # Try to install Node.js using winget if available
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        winget install OpenJS.NodeJS
    } else {
        Write-Host "📥 Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
        Start-Process "https://nodejs.org"
        exit 1
    }
}

# Check if npm is available
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Write-Host "✅ npm is available: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm not found" -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Blue
npm install

# Copy environment file
if (!(Test-Path ".env")) {
    Copy-Item ".env.development" ".env"
    Write-Host "✅ Environment file created (.env)" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file already exists" -ForegroundColor Yellow
}

# Create database directory
if (!(Test-Path "database")) {
    New-Item -ItemType Directory -Path "database"
    Write-Host "✅ Database directory created" -ForegroundColor Green
}

Write-Host "🎉 Setup complete! Next steps:" -ForegroundColor Green
Write-Host "1. Run: npm run dev (to start the backend server)" -ForegroundColor Cyan
Write-Host "2. Open: http://localhost:3000/health (to test the API)" -ForegroundColor Cyan
Write-Host "3. Run: cd admin && npm install && npm start (for admin dashboard)" -ForegroundColor Cyan
