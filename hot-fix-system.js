// OnPurpose Mobile Platform Hot Fix System
// Only for critical bugs and security patches
// DO NOT use for feature development

const fs = require('fs');
const path = require('path');

// Load protection manifest
const manifest = JSON.parse(fs.readFileSync('mobile-protection-manifest.json', 'utf8'));

console.log('\n🔧 OnPurpose Mobile Hot Fix System');
console.log('=================================\n');

// Hot fix validation
function validateHotFix(files, reason) {
  console.log('📝 Hot Fix Request:', reason);
  console.log('📁 Files to modify:', files.length);
  
  // Check if files are protected
  const protectedFiles = files.filter(f => 
    manifest.protected_files.includes(f) ||
    manifest.protected_dirs.some(dir => f.startsWith(dir))
  );
  
  if (protectedFiles.length > 0) {
    console.log('\n⚠️  WARNING: Modifying protected files:');
    protectedFiles.forEach(f => console.log('  -', f));
    console.log('\n❌ HOT FIX BLOCKED - Protected files cannot be modified');
    console.log('🔒 Use emergency override only for critical security issues');
    return false;
  }
  
  // Check if changes are allowed
  const allowedReasons = [
    'critical bug fix',
    'security patch', 
    'store rejection fix',
    'crash fix',
    'urgent compatibility'
  ];
  
  const isAllowed = allowedReasons.some(reason =>
    reason.toLowerCase().includes(reason.toLowerCase())
  );
  
  if (!isAllowed) {
    console.log('\n❌ HOT FIX BLOCKED - Reason not allowed');
    console.log('📋 Allowed reasons:', allowedReasons.join(', '));
    return false;
  }
  
  console.log('\n✅ HOT FIX APPROVED');
  return true;
}

// Emergency override (for critical security only)
function emergencyOverride(reason, files) {
  console.log('\n🚨 EMERGENCY OVERRIDE ACTIVATED');
  console.log('⚠️  This should only be used for critical security issues');
  console.log('📝 Reason:', reason);
  console.log('📁 Files:', files.join(', '));
  
  // Create emergency backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = `emergency-backup-${timestamp}`;
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      const backupPath = path.join(backupDir, path.basename(file));
      fs.copyFileSync(file, backupPath);
      console.log('📦 Backed up:', file, '→', backupPath);
    }
  });
  
  console.log('\n✅ Emergency backup created:', backupDir);
  console.log('🔓 Override granted - proceed with caution');
  return true;
}

// Export for use in scripts
module.exports = { validateHotFix, emergencyOverride };

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node hot-fix-system.js "reason" file1.js file2.html ...');
    console.log('       node hot-fix-system.js --emergency "reason" file1.js ...');
    process.exit(1);
  }
  
  const isEmergency = args[0] === '--emergency';
  const reason = isEmergency ? args[1] : args[0];
  const files = isEmergency ? args.slice(2) : args.slice(1);
  
  if (isEmergency) {
    emergencyOverride(reason, files);
  } else {
    validateHotFix(files, reason);
  }
}
