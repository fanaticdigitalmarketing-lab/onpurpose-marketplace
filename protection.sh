#!/bin/bash
# 🔒 WEBSITE PROTECTION SCRIPT 🔒
# Created: March 31, 2026
# Purpose: Monitor and protect critical files from unauthorized changes

PROTECTED_FILES=(
    "railway.toml"
    "netlify.toml" 
    "_redirects"
    "index.html"
    "frontend/dashboard.html"
)

BACKUP_DIR="backups"
LOG_FILE="backups/protection.log"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_file_integrity() {
    local file="$1"
    local backup="$BACKUP_DIR/${file//\//_}.backup"
    
    if [ -f "$file" ] && [ -f "$backup" ]; then
        if ! cmp -s "$file" "$backup"; then
            log_message "⚠️  DETECTED CHANGE: $file has been modified!"
            log_message "🔄 Restoring backup..."
            cp "$backup" "$file"
            log_message "✅ File restored: $file"
            return 1
        fi
    fi
    return 0
}

main() {
    log_message "🔒 Starting protection check..."
    
    local changes_detected=0
    
    for file in "${PROTECTED_FILES[@]}"; do
        if ! check_file_integrity "$file"; then
            changes_detected=1
        fi
    done
    
    if [ $changes_detected -eq 0 ]; then
        log_message "✅ All protected files are intact"
    else
        log_message "🚨 Changes were detected and restored"
    fi
    
    log_message "🔒 Protection check completed"
}

# Run protection check
main
