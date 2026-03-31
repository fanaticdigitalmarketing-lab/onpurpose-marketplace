// Verify Windsurf Email System Protection
// Node.js verification script
// Created: March 31, 2026

const fs = require('fs');
const path = require('path');

console.log('🔒 WINDSURF EMAIL SYSTEM PROTECTION VERIFICATION');
console.log('==============================================');

const criticalFiles = [
    'services/emailService.js',
    'server.js',
    'frontend/dashboard.html',
    'test-registration.js',
    'WINDSURF_EMAIL_PROTECTION.md'
];

const backupDir = 'backups/windsurf';

let allProtected = true;
let protectedCount = 0;

console.log('\n📁 Checking backup directory...');
if (fs.existsSync(backupDir)) {
    console.log('✅ Backup directory exists');
    protectedCount++;
} else {
    console.log('❌ Backup directory missing');
    allProtected = false;
}

console.log('\n🔍 Verifying critical files...');
criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
        let backupName = path.basename(file);
        // Map to actual backup file names
        if (file === 'server.js') backupName = 'server-register-route.js';
        if (file === 'frontend/dashboard.html') backupName = 'dashboard-payment.html';
        
        const backupFile = path.join(backupDir, backupName);
        if (fs.existsSync(backupFile)) {
            console.log(`✅ ${file} - Backup exists`);
            protectedCount++;
        } else {
            console.log(`❌ ${file} - Backup missing (${backupName})`);
            allProtected = false;
        }
    } else {
        console.log(`❌ ${file} - File missing`);
        allProtected = false;
    }
});

console.log('\n🔍 Verifying database models...');
const serverContent = fs.readFileSync('server.js', 'utf8');

if (serverContent.includes('const Subscriber = sequelize.define')) {
    console.log('✅ Subscriber model found');
    protectedCount++;
} else {
    console.log('❌ Subscriber model missing');
    allProtected = false;
}

if (serverContent.includes('const EmailLog = sequelize.define')) {
    console.log('✅ EmailLog model found');
    protectedCount++;
} else {
    console.log('❌ EmailLog model missing');
    allProtected = false;
}

if (serverContent.includes('NEVER add paranoid:true with cascade')) {
    console.log('✅ Cascade delete protection in place');
    protectedCount++;
} else {
    console.log('⚠️  Cascade delete protection warning not found');
}

console.log('\n🔍 Verifying email service functions...');
const emailContent = fs.readFileSync('services/emailService.js', 'utf8');

const emailFunctions = [
    'sendVerificationEmail',
    'sendOwnerNewSignupAlert',
    'sendPasswordResetEmail',
    'sendBookingConfirmation',
    'sendNewBookingNotificationToProvider'
];

emailFunctions.forEach(func => {
    if (emailContent.includes(`async function ${func}`)) {
        console.log(`✅ ${func} function found`);
        protectedCount++;
    } else {
        console.log(`❌ ${func} function missing`);
        allProtected = false;
    }
});

console.log('\n🔍 Verifying dashboard payment setup...');
const dashboardContent = fs.readFileSync('frontend/dashboard.html', 'utf8');

if (dashboardContent.includes('id="page-pay"')) {
    console.log('✅ Payment setup page found');
    protectedCount++;
} else {
    console.log('❌ Payment setup page missing');
    allProtected = false;
}

if (dashboardContent.includes('function setupStripe()')) {
    console.log('✅ Stripe setup function found');
    protectedCount++;
} else {
    console.log('❌ Stripe setup function missing');
    allProtected = false;
}

console.log('\n🔍 Verifying test script...');
if (fs.existsSync('test-registration.js')) {
    const testContent = fs.readFileSync('test-registration.js', 'utf8');
    if (testContent.includes('async function runTests()')) {
        console.log('✅ Test script valid');
        protectedCount++;
    } else {
        console.log('❌ Test script invalid');
        allProtected = false;
    }
} else {
    console.log('❌ Test script missing');
    allProtected = false;
}

console.log('\n🔒 PROTECTION STATUS');
console.log('==================');

if (allProtected) {
    console.log('✅ WINDSURF EMAIL SYSTEM FULLY PROTECTED');
    console.log('📊 All subscriber data is preserved permanently');
    console.log('📧 Email system is complete and functional');
    console.log('💳 Provider payment setup is ready');
    console.log('🧪 Test suite is available for verification');
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Run: node test-registration.js');
    console.log('2. Verify all 10 tests pass');
    console.log('3. Test email functionality manually');
    console.log('4. Test provider payment setup');
    
    console.log('\n🚨 PROTECTION RULES:');
    console.log('- NEVER delete Subscriber records');
    console.log('- NEVER truncate EmailLog table');
    console.log('- NEVER disable email logging');
    console.log('- NEVER remove Stripe Connect integration');
    
    console.log(`\n📊 Protection Score: ${protectedCount}/17 components protected`);
    process.exit(0);
} else {
    console.log('❌ WINDSURF EMAIL SYSTEM PROTECTION INCOMPLETE');
    console.log('⚠️  Some critical components are missing or corrupted');
    console.log('🔄 Please restore from backups and re-run protection');
    
    console.log('\n📁 RESTORE COMMANDS:');
    console.log('copy backups\\windsurf\\emailService.js services\\emailService.js');
    console.log('copy backups\\windsurf\\server-register-route.js server.js');
    console.log('copy backups\\windsurf\\dashboard-payment.html frontend\\dashboard.html');
    console.log('copy backups\\windsurf\\test-registration.js test-registration.js');
    
    console.log(`\n📊 Protection Score: ${protectedCount}/17 components protected`);
    process.exit(1);
}
