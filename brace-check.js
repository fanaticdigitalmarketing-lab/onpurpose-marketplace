const fs = require('fs');
const content = fs.readFileSync('server.js', 'utf8');
const open = (content.match(/{/g) || []).length;
const close = (content.match(/}/g) || []).length;
console.log(`Open braces: ${open}, Close braces: ${close}, Difference: ${open - close}`);
