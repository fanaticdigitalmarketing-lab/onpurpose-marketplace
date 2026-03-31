#!/bin/bash

# OnPurpose Clean Deployment Script
# This script creates a clean deployment package for Railway

echo "🚀 Creating OnPurpose Clean Deployment Package..."

# Create clean directory
mkdir -p onpurpose-backend-clean
cd onpurpose-backend-clean

echo "📁 Copying essential files..."

# Copy essential backend files
cp ../server.js .
cp ../package.json .
cp ../package-lock.json .
cp ../Procfile .
cp ../railway.json .
cp ../.env.example .

# Copy directories
cp -r ../config .
cp -r ../middleware .
cp -r ../models .
cp -r ../routes .
cp -r ../services .

echo "🗑️ Removing unnecessary files..."

# Remove any files with secrets
rm -f *.md
rm -f README.md
rm -f DEPLOYMENT_*
rm -f RAILWAY_*
rm -f NETLIFY_*
rm -f ENVIRONMENT_*
rm -f FINAL_*

echo "📦 Creating deployment package..."

# Create zip file
cd ..
zip -r onpurpose-backend-clean.zip onpurpose-backend-clean/

echo "✅ Clean deployment package created!"
echo ""
echo "📋 Next Steps:"
echo "1. Extract onpurpose-backend-clean.zip"
echo "2. Create new GitHub repository: onpurpose-backend-clean"
echo "3. Upload files to new repository"
echo "4. Connect Railway to new repository"
echo "5. Set environment variables"
echo "6. Deploy!"
echo ""
echo "🎯 Your clean backend is ready for Railway deployment!"
