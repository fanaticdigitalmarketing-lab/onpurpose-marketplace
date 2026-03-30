# OnPurpose Quick Start Guide

## Step 1: Install Node.js
1. Go to https://nodejs.org
2. Download the LTS version (recommended)
3. Run the installer with default settings
4. Restart your terminal/command prompt

## Step 2: Verify Installation
Open a new terminal and run:
```bash
node --version
npm --version
```

## Step 3: Install OnPurpose Dependencies
```bash
cd c:\Users\tyler\CascadeProjects\OnPurpose
npm install
```

## Step 4: Set Up Environment
```bash
copy .env.development .env
```

## Step 5: Start the Backend Server
```bash
npm start
```
The API will be available at: http://localhost:3000

## Step 6: Start Admin Dashboard (New Terminal)
```bash
cd admin
npm install
npm start
```
The admin dashboard will be available at: http://localhost:3001

## Step 7: Test the Setup
- Visit http://localhost:3000/health (should show API status)
- Visit http://localhost:3001 (admin dashboard login)
- Use demo credentials: admin@onpurpose.app / admin123

## Mobile App (Optional)
```bash
cd mobile
npm install
npx expo start
```

## Next Steps After Installation
Once Node.js is installed, I'll automatically:
1. Install all dependencies
2. Set up the database
3. Start the backend server
4. Launch the admin dashboard
5. Test all endpoints

Just let me know when Node.js is installed!
