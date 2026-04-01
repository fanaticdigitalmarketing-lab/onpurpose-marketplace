@echo off
echo === ONPURPOSE BUILD AND DEPLOY ===
echo.

echo STEP 1: Clean any existing build...
if exist "build" rmdir /s /q "build"
if exist "onpurpose-web\build" rmdir /s /q "onpurpose-web\build"

echo STEP 2: Create build directory...
mkdir build
echo Build directory created.

echo STEP 3: Copy frontend files to build...
xcopy "frontend\*" "build\" /E /I /Y
echo Frontend files copied.

echo STEP 4: Copy root files if needed...
if exist "index.html" copy "index.html" "build\"
if exist "_redirects" copy "_redirects" "build\"
if exist "netlify.toml" copy "netlify.toml" "build\"

echo STEP 5: Verify build contents...
dir build

echo.
echo === BUILD COMPLETE ===
echo.
echo Ready to deploy with:
echo netlify deploy --prod --dir=build --force
echo.
pause
