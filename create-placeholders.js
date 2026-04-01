// Simple placeholder generator without canvas dependency
const fs = require('fs');
const path = require('path');

console.log('OnPurpose Icon Placeholder Generator');
console.log('====================================');
console.log('');

function createEmptyPlaceholder(size, outputPath) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  // Create empty PNG files as placeholders
  fs.writeFileSync(outputPath, Buffer.alloc(0));
  console.log(`Placeholder: ${outputPath} (${size}×${size})`);
}

// Create icon placeholders
[72,96,128,144,152,192,384,512].forEach(s => {
  createEmptyPlaceholder(s, `frontend/assets/icons/icon-${s}.png`);
});

// Create splash screen placeholders
[[430,932],[393,852],[390,844],[375,812]].forEach(([w,h]) => {
  createEmptyPlaceholder(Math.max(w,h), `frontend/assets/splash/splash-${w}x${h}.png`);
});

console.log('');
console.log('✅ Placeholder directories and files created');
console.log('⚠️  Replace with real icons before App Store submission');
console.log('');
console.log('To generate real icons:');
console.log('1. Install: npm install -g @capacitor/assets');
console.log('2. Run: npx @capacitor/assets generate --assetPath ./frontend/assets/logo.png --iconBackgroundColor "#1a2744" --splashBackgroundColor "#1a2744"');
