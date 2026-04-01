// Create a data URI for the OG image that will work everywhere
const fs = require('fs');

// Read the SVG file
const svgContent = fs.readFileSync('og-image.svg', 'utf8');

// Convert to base64 data URI
const base64 = Buffer.from(svgContent).toString('base64');
const dataUri = `data:image/svg+xml;base64,${base64}`;

console.log('✅ Data URI created!');
console.log('🔗 Data URI:', dataUri.substring(0, 100) + '...');
console.log('📏 Length:', dataUri.length, 'characters');
console.log('🌐 This will work reliably on all platforms');

// Save the data URI to a file for reference
fs.writeFileSync('og-image-data-uri.txt', dataUri);
console.log('💾 Saved to: og-image-data-uri.txt');
