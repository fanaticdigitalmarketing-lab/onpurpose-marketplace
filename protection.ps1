# 🔒 WEBSITE PROTECTION SCRIPT (PowerShell) 🔒
# Created: March 31, 2026
# Purpose: Monitor and protect critical files from unauthorized changes

$PROTECTED_FILES = @(
    "railway.toml",
    "netlify.toml", 
    "_redirects",
    "index.html",
    "frontend/dashboard.html"
)

$BACKUP_DIR = "backups"
$LOG_FILE = "backups\protection.log"

function Log-Message {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $Message"
    Write-Output $logEntry
    Add-Content -Path $LOG_FILE -Value $logEntry
}

function Test-FileIntegrity {
    param([string]$File)
    $backupFile = "$BACKUP_DIR\$($File.Replace('/', '_')).backup"
    
    if ((Test-Path $File) -and (Test-Path $backupFile)) {
        if ((Get-FileHash $File).Hash -ne (Get-FileHash $backupFile).Hash) {
            Log-Message "⚠️  DETECTED CHANGE: $File has been modified!"
            Log-Message "🔄 Restoring backup..."
            Copy-Item $backupFile $File -Force
            Log-Message "✅ File restored: $File"
            return $false
        }
    }
    return $true
}

function Main {
    Log-Message "🔒 Starting protection check..."
    
    $changesDetected = $false
    
    foreach ($file in $PROTECTED_FILES) {
        if (-not (Test-FileIntegrity $file)) {
            $changesDetected = $true
        }
    }
    
    if (-not $changesDetected) {
        Log-Message "✅ All protected files are intact"
    } else {
        Log-Message "🚨 Changes were detected and restored"
    }
    
    Log-Message "🔒 Protection check completed"
}

# Run protection check
Main
