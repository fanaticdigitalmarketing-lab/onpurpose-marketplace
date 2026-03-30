// Simple test script to verify Node.js environment
const fs = require('fs');

console.log('=== Node.js Environment Test ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform, process.arch);
console.log('Current directory:', process.cwd());

// Test file system access
try {
  const testFile = 'test-write.txt';
  fs.writeFileSync(testFile, 'Test write operation');
  console.log('✓ File system write test passed');
  fs.unlinkSync(testFile);
} catch (error) {
  console.error('✗ File system access error:', error.message);
}

// Test environment variables
console.log('\nEnvironment Variables:');
['NODE_ENV', 'PATH', 'USERPROFILE', 'APPDATA'].forEach(env => {
  console.log(`${env}:`, process.env[env] ? '✓ Set' : '✗ Not set');
});

console.log('\nTest completed.');
