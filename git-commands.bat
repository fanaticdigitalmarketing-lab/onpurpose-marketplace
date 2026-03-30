@echo off
echo Setting up Git repository for OnPurpose...

git init
git config user.name "Tyler"
git config user.email "tyler@onpurpose.app"
git add .
git commit -m "Production-ready OnPurpose marketplace with Stripe payments and automatic tax"

echo.
echo After creating GitHub repository, run:
echo git remote add origin https://github.com/YOUR_USERNAME/OnPurpose.git
echo git branch -M main
echo git push -u origin main
echo.
echo Replace YOUR_USERNAME with your actual GitHub username
pause
