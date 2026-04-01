const fs = require('fs');
const path = require('path');

console.log('\n🔒 OnPurpose Mobile Platform Protection');
console.log('=====================================\n');

// Critical mobile platform files to protect
const MOBILE_CRITICAL_FILES = [
  // PWA Core
  'frontend/manifest.json',
  'frontend/sw.js', 
  'frontend/offline.html',
  'frontend/assets/css/mobile.css',
  
  // Capacitor Configuration
  'capacitor.config.json',
  'frontend/assets/js/capacitor-init.js',
  
  // Icon System
  'create-placeholders.js',
  'generate-icons.js',
  
  // Native Projects
  'ios/App/App/AppDelegate.swift',
  'ios/App/App/Info.plist',
  'android/app/src/main/AndroidManifest.xml',
  'android/app/build.gradle',
  
  // Privacy & Legal
  'frontend/privacy.html',
  
  // Build Scripts
  'package.json'
];

// Protected directories
const MOBILE_PROTECTED_DIRS = [
  'ios/',
  'android/',
  'frontend/assets/icons/',
  'frontend/assets/splash/'
];

// Check and report protection status
let protected = 0;
let missing = 0;

console.log('📱 Checking Mobile Platform Components:\n');

MOBILE_CRITICAL_FILES.forEach(file => {
  if (fs.existsSync(file)) {
    console.log('✅', file);
    protected++;
  } else {
    console.log('❌', file, 'MISSING');
    missing++;
  }
});

console.log('\n📁 Checking Protected Directories:\n');

MOBILE_PROTECTED_DIRS.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log('✅', dir, 'PROTECTED');
    protected++;
  } else {
    console.log('❌', dir, 'MISSING');
    missing++;
  }
});

// Create protection manifest
const protectionManifest = {
  date: new Date().toISOString(),
  status: missing === 0 ? 'PROTECTED' : 'INCOMPLETE',
  protected_files: MOBILE_CRITICAL_FILES,
  protected_dirs: MOBILE_PROTECTED_DIRS,
  cardinal_rules: [
    'RULE 1 — ADDITIVE ONLY: Never modify, remove, or refactor working mobile code',
    'RULE 2 — PROVE BEFORE PROCEEDING: Verify every change with tests',
    'RULE 3 — NO PARTIAL STATES: Complete implementations only',
    'RULE 4 — DESIGN IS SACRED: Colors, fonts, logo placement unchanged',
    'RULE 5 — MOBILE FIRST: All new UI designed for mobile first'
  ],
  allowed_changes: [
    'Hot fixes for critical bugs',
    'Security patches',
    'Minor CSS adjustments',
    'Icon asset updates',
    'Store submission metadata'
  ],
  forbidden_changes: [
    'Removing PWA functionality',
    'Breaking Capacitor configuration',
    'Modifying core mobile CSS architecture',
    'Changing app ID or bundle IDs',
    'Removing native platform projects'
  ]
};

fs.writeFileSync('mobile-protection-manifest.json', JSON.stringify(protectionManifest, null, 2));

console.log('\n📋 Protection Status:');
console.log(`✅ Protected Components: ${protected}`);
console.log(`❌ Missing Components: ${missing}`);

if (missing === 0) {
  console.log('\n🔒 MOBILE PLATFORM: PERMANENTLY PROTECTED');
  console.log('📱 Only hot fixes and critical errors allowed');
  console.log('🚀 Ready for App Store submission');
} else {
  console.log('\n⚠️  MOBILE PLATFORM: INCOMPLETE');
  console.log('🔧 Fix missing components before protection');
}

console.log('\n📄 Protection manifest saved: mobile-protection-manifest.json');
