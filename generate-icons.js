const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('OnPurpose Icon Generator');
console.log('========================');
console.log('');
console.log('To generate all required icons and splash screens,');
console.log('you need to provide a source image:');
console.log('  1024×1024 PNG of the OnPurpose logo');
console.log('  (use frontend/assets/logo.png scaled up)');
console.log('');
console.log('Then run:');
console.log('  npm install -g @capacitor/assets');
console.log('  npx @capacitor/assets generate --assetPath ./frontend/assets/logo.png');
console.log('     --iconBackgroundColor "#1a2744"');
console.log('     --splashBackgroundColor "#1a2744"');
console.log('');
console.log('Required outputs:');
const icons = [72,96,128,144,152,192,384,512];
icons.forEach(s => console.log(`  frontend/assets/icons/icon-${s}.png (${s}×${s})`));
console.log('');
console.log('Required splash screens:');
[
  'splash-430x932.png  (iPhone 14 Pro Max)',
  'splash-393x852.png  (iPhone 14 Pro)',
  'splash-390x844.png  (iPhone 14)',
  'splash-375x812.png  (iPhone 13 mini)',
].forEach(s => console.log('  frontend/assets/splash/' + s));
console.log('');

// Create placeholder PNGs using data URIs
// These are navy squares that will work as placeholders
// Replace with real branded icons before App Store submission

const { createCanvas } = require('canvas');

function createPlaceholder(size, outputPath) {
  try {
    const canvas = createCanvas(size, size);
    const ctx    = canvas.getContext('2d');
    // Navy background
    ctx.fillStyle = '#1a2744';
    ctx.fillRect(0, 0, size, size);
    // Blue rounded square (icon bg)
    const pad = size * 0.12;
    ctx.fillStyle = '#2563d4';
    ctx.beginPath();
    ctx.roundRect(pad, pad, size-pad*2, size-pad*2, size*0.18);
    ctx.fill();
    // "OP" text
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.floor(size*0.3)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('OP', size/2, size/2);
    const buf = canvas.toBuffer('image/png');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, buf);
    console.log(`Created: ${outputPath}`);
  } catch(e) {
    // canvas not installed — create empty placeholder
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, Buffer.alloc(0));
    console.log(`Placeholder: ${outputPath} (install canvas for real icons)`);
  }
}

[72,96,128,144,152,192,384,512].forEach(s =>
  createPlaceholder(s, `frontend/assets/icons/icon-${s}.png`)
);

[[430,932],[393,852],[390,844],[375,812]].forEach(([w,h]) =>
  createPlaceholder(Math.max(w,h), `frontend/assets/splash/splash-${w}x${h}.png`)
);

console.log('\nDone! Replace placeholders with real branded assets before submission.');
