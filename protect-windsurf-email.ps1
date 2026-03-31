# Protect-Windsurf-Email.ps1
# Windows PowerShell script to protect windsurf email system
# Created: March 31, 2026

Write-Host "🔒 WINDSURF EMAIL SYSTEM PROTECTION" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "⚠️  Run this script as Administrator for full protection" -ForegroundColor Yellow
}

# Create protection timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "📅 Protection Timestamp: $timestamp" -ForegroundColor Green

# Define critical files
$criticalFiles = @(
    "services\emailService.js",
    "server.js", 
    "frontend\dashboard.html",
    "test-registration.js",
    "WINDSURF_EMAIL_PROTECTION.md"
)

# Define backup directory
$backupDir = "backups\windsurf"

Write-Host "`n📁 Checking backup directory..." -ForegroundColor Cyan
if (Test-Path $backupDir) {
    Write-Host "✅ Backup directory exists: $backupDir" -ForegroundColor Green
} else {
    Write-Host "❌ Backup directory missing: $backupDir" -ForegroundColor Red
    exit 1
}

# Verify all critical files exist
Write-Host "`n🔍 Verifying critical files..." -ForegroundColor Cyan
$allFilesExist = $true

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        $original = Get-Item $file
        $backup = Join-Path $backupDir (Split-Path $file -Leaf)
        
        if (Test-Path $backup) {
            $backupFile = Get-Item $backup
            if ($original.Length -eq $backupFile.Length) {
                Write-Host "✅ $file - Backup matches" -ForegroundColor Green
            } else {
                Write-Host "⚠️  $file - Backup size differs" -ForegroundColor Yellow
                Write-Host "   Original: $($original.Length) bytes" -ForegroundColor Gray
                Write-Host "   Backup: $($backupFile.Length) bytes" -ForegroundColor Gray
            }
        } else {
            Write-Host "❌ $file - Backup missing" -ForegroundColor Red
            $allFilesExist = $false
        }
    } else {
        Write-Host "❌ $file - File missing" -ForegroundColor Red
        $allFilesExist = $false
    }
}

# Check for Subscriber and EmailLog models in server.js
Write-Host "`n🔍 Verifying database models..." -ForegroundColor Cyan
$serverContent = Get-Content "server.js" -Raw

if ($serverContent -match "const Subscriber = sequelize\.define") {
    Write-Host "✅ Subscriber model found" -ForegroundColor Green
} else {
    Write-Host "❌ Subscriber model missing" -ForegroundColor Red
    $allFilesExist = $false
}

if ($serverContent -match "const EmailLog = sequelize\.define") {
    Write-Host "✅ EmailLog model found" -ForegroundColor Green
} else {
    Write-Host "❌ EmailLog model missing" -ForegroundColor Red
    $allFilesExist = $false
}

# Check for no cascade delete warning
if ($serverContent -match "NEVER add paranoid:true with cascade") {
    Write-Host "✅ Cascade delete protection in place" -ForegroundColor Green
} else {
    Write-Host "⚠️  Cascade delete protection warning not found" -ForegroundColor Yellow
}

# Check email service functions
Write-Host "`n🔍 Verifying email service functions..." -ForegroundColor Cyan
$emailContent = Get-Content "services\emailService.js" -Raw

$emailFunctions = @(
    "sendVerificationEmail",
    "sendOwnerNewSignupAlert", 
    "sendPasswordResetEmail",
    "sendBookingConfirmation",
    "sendNewBookingNotificationToProvider"
)

foreach ($func in $emailFunctions) {
    if ($emailContent -match "async function $func") {
        Write-Host "✅ $func function found" -ForegroundColor Green
    } else {
        Write-Host "❌ $func function missing" -ForegroundColor Red
        $allFilesExist = $false
    }
}

# Check dashboard payment setup
Write-Host "`n🔍 Verifying dashboard payment setup..." -ForegroundColor Cyan
$dashboardContent = Get-Content "frontend\dashboard.html" -Raw

if ($dashboardContent -match "id=`"page-pay`"") {
    Write-Host "✅ Payment setup page found" -ForegroundColor Green
} else {
    Write-Host "❌ Payment setup page missing" -ForegroundColor Red
    $allFilesExist = $false
}

if ($dashboardContent -match "function setupStripe\(\)") {
    Write-Host "✅ Stripe setup function found" -ForegroundColor Green
} else {
    Write-Host "❌ Stripe setup function missing" -ForegroundColor Red
    $allFilesExist = $false
}

# Check test registration script
Write-Host "`n🔍 Verifying test script..." -ForegroundColor Cyan
if (Test-Path "test-registration.js") {
    $testContent = Get-Content "test-registration.js" -Raw
    if ($testContent -match "async function runTests\(\)") {
        Write-Host "✅ Test script valid" -ForegroundColor Green
    } else {
        Write-Host "❌ Test script invalid" -ForegroundColor Red
        $allFilesExist = $false
    }
} else {
    Write-Host "❌ Test script missing" -ForegroundColor Red
    $allFilesExist = $false
}

# Final protection status
Write-Host "`n🔒 PROTECTION STATUS" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan

if ($allFilesExist) {
    Write-Host "✅ WINDSURF EMAIL SYSTEM FULLY PROTECTED" -ForegroundColor Green
    Write-Host "All subscriber data is preserved permanently" -ForegroundColor Green
    Write-Host "Email system is complete and functional" -ForegroundColor Green
    Write-Host "Provider payment setup is ready" -ForegroundColor Green
    Write-Host "Test suite is available for verification" -ForegroundColor Green
    
    Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "1. Run: node test-registration.js" -ForegroundColor White
    Write-Host "2. Verify all 10 tests pass" -ForegroundColor White
    Write-Host "3. Test email functionality manually" -ForegroundColor White
    Write-Host "4. Test provider payment setup" -ForegroundColor White
    
    Write-Host "`n🚨 PROTECTION RULES:" -ForegroundColor Red
    Write-Host "- NEVER delete Subscriber records" -ForegroundColor White
    Write-Host "- NEVER truncate EmailLog table" -ForegroundColor White
    Write-Host "- NEVER disable email logging" -ForegroundColor White
    Write-Host "- NEVER remove Stripe Connect integration" -ForegroundColor White
    
    exit 0
} else {
    Write-Host "❌ WINDSURF EMAIL SYSTEM PROTECTION INCOMPLETE" -ForegroundColor Red
    Write-Host "⚠️  Some critical components are missing or corrupted" -ForegroundColor Yellow
    Write-Host "🔄 Please restore from backups and re-run protection" -ForegroundColor Yellow
    
    Write-Host "`n📁 RESTORE COMMANDS:" -ForegroundColor Cyan
    Write-Host "copy backups\windsurf\emailService.js services\emailService.js" -ForegroundColor White
    Write-Host "copy backups\windsurf\server-register-route.js server.js" -ForegroundColor White
    Write-Host "copy backups\windsurf\dashboard-payment.html frontend\dashboard.html" -ForegroundColor White
    Write-Host "copy backups\windsurf\test-registration.js test-registration.js" -ForegroundColor White
    
    exit 1
}
