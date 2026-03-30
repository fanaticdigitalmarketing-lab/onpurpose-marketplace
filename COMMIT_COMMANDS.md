# Git Commit Commands for OnPurpose Deployment

## **Option 1: Single Command (If Git Installed)**
```bash
git init && git add . && git commit -m "Deploy OnPurpose Phase 4 - NYC pilot launch ready with legal compliance, mobile services, and customer support" && git branch -M main && git remote add origin https://github.com/wisserd/queoper.git && git push -u origin main
```

## **Option 2: Step-by-Step Commands**
```bash
# Initialize repository
git init

# Add all files
git add .

# Commit with descriptive message
git commit -m "Deploy OnPurpose Phase 4 - NYC pilot launch ready with legal compliance, mobile services, and customer support"

# Set main branch
git branch -M main

# Add remote repository
git remote add origin https://github.com/wisserd/queoper.git

# Push to GitHub
git push -u origin main
```

## **Option 3: Alternative Commit Messages**
```bash
git commit -m "Complete OnPurpose platform deployment - Phase 4 legal compliance and NYC pilot ready"
```

```bash
git commit -m "OnPurpose NYC launch: Add legal docs, mobile services, customer support system"
```

```bash
git commit -m "Phase 4 complete: Terms of service, privacy policy, mobile notifications, location services"
```

## **Expected Result**
- Files uploaded to https://github.com/wisserd/queoper
- Netlify auto-deploys within 2-3 minutes
- Site accessible at https://queoper.netlify.app
- All legal pages functional
- NYC pilot launch ready
