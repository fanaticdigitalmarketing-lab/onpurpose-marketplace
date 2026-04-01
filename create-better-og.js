// Create a better OG image using a simple, reliable approach
const https = require('https');
const fs = require('fs');

// Create a simple SVG with proper encoding
const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#000000;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#111827;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="text" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Electric blue glow effect -->
  <rect x="0" y="0" width="1200" height="630" fill="#3b82f6" opacity="0.1"/>
  
  <!-- Main Title -->
  <text x="600" y="200" font-family="Arial, sans-serif" font-size="72" font-weight="bold" text-anchor="middle" fill="white">
    OnPurpose
  </text>
  
  <!-- Subtitle with gradient -->
  <text x="600" y="320" font-family="Arial, sans-serif" font-size="48" font-weight="bold" text-anchor="middle" fill="url(#text)">
    Idea Service Income
  </text>
  
  <!-- Tagline -->
  <text x="600" y="420" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#9ca3af">
    Turn your skills into real income instantly
  </text>
  
  <!-- Subtle decorative elements -->
  <circle cx="100" cy="100" r="50" fill="#3b82f6" opacity="0.2"/>
  <circle cx="1100" cy="530" r="70" fill="#2563eb" opacity="0.15"/>
  <circle cx="150" cy="500" r="30" fill="#3b82f6" opacity="0.25"/>
  <circle cx="1050" cy="150" r="40" fill="#2563eb" opacity="0.2"/>
</svg>`;

// Write SVG to file
fs.writeFileSync('og-image-simple.svg', svgContent);
console.log('✅ Simple OG image SVG created!');
console.log('📁 File: og-image-simple.svg');
console.log('🎨 Dark background with electric blue gradient text');
console.log('📏 Size: 1200x630');
console.log('🌐 No special characters - will work everywhere');

// Create a data URI
const base64 = Buffer.from(svgContent).toString('base64');
const dataUri = `data:image/svg+xml;base64,${base64}`;

console.log('🔗 Data URI length:', dataUri.length);
console.log('💾 Ready to use in meta tags');

// Save the data URI
fs.writeFileSync('og-image-uri.txt', dataUri);
console.log('📁 Saved to: og-image-uri.txt');
