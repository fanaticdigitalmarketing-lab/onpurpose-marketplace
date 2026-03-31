@echo off
echo 🚀 Creating OnPurpose Clean Deployment Package...

REM Create clean directory
if exist onpurpose-backend-clean rmdir /s /q onpurpose-backend-clean
mkdir onpurpose-backend-clean
cd onpurpose-backend-clean

echo 📁 Copying essential files...

REM Copy essential backend files
copy ..\server.js .
copy ..\package.json .
copy ..\package-lock.json .
copy ..\Procfile .
copy ..\railway.json .
copy ..\.env.example .

REM Copy directories
xcopy ..\config config\ /e /i
xcopy ..\middleware middleware\ /e /i
xcopy ..\models models\ /e /i
xcopy ..\routes routes\ /e /i
xcopy ..\services services\ /e /i

echo 🗑️ Removing unnecessary files...

REM Remove any files with secrets
del /q *.md
del /q README.md
del /q DEPLOYMENT_*
del /q RAILWAY_*
del /q NETLIFY_*
del /q ENVIRONMENT_*
del /q FINAL_*

echo 📦 Creating deployment package...

REM Go back to parent directory
cd ..

REM Create zip file (requires PowerShell or 7-Zip)
powershell -command "Compress-Archive -Path 'onpurpose-backend-clean' -DestinationPath 'onpurpose-backend-clean.zip' -Force"

echo ✅ Clean deployment package created!
echo.
echo 📋 Next Steps:
echo 1. Extract onpurpose-backend-clean.zip
echo 2. Create new GitHub repository: onpurpose-backend-clean
echo 3. Upload files to new repository
echo 4. Connect Railway to new repository
echo 5. Set environment variables
echo 6. Deploy!
echo.
echo 🎯 Your clean backend is ready for Railway deployment!
pause
