@echo off
echo OnPurpose GitHub Upload Commands
echo ================================

echo Step 1: Initialize Git Repository
git init

echo Step 2: Add all files
git add .

echo Step 3: Commit changes
git commit -m "Deploy OnPurpose Phase 4 - NYC pilot launch ready with legal compliance, mobile services, and customer support"

echo Step 4: Set main branch
git branch -M main

echo Step 5: Add remote repository
git remote add origin https://github.com/wisserd/queoper.git

echo Step 6: Push to GitHub
git push -u origin main

echo.
echo Upload complete! Netlify will auto-deploy within 2-3 minutes.
echo Test site at: https://queoper.netlify.app
pause
