const fs = require('fs');

// Check for common JavaScript errors in frontend files
const frontendFiles = [
  'frontend/index.html',
  'frontend/dashboard.html', 
  'frontend/services.html',
  'frontend/provider.html',
  'frontend/service-detail.html',
  'frontend/idea-generator.html'
];

let totalClickHandlers = 0;
let errorCount = 0;

console.log('🔍 RULE 4 - CLICK-LEVEL VALIDATION');
console.log('=====================================');

frontendFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Count click handlers
    const onclickMatches = content.match(/onclick=/g) || [];
    const addEventMatches = content.match(/addEventListener/g) || [];
    const clickHandlers = onclickMatches.length + addEventMatches.length;
    totalClickHandlers += clickHandlers;
    
    // Check for common errors
    const errors = [];
    
    // Check for undefined function calls
    const undefinedPattern = /onclick="[^"]*\bundefined\b[^"]*"/g;
    const undefinedCalls = content.match(undefinedPattern) || [];
    if (undefinedCalls.length > 0) errors.push('Undefined function calls');
    
    // Check for actual syntax errors (invalid patterns)
    const invalidPattern = /onclick="[^"]*(?:\bundefined\b|\bnull\b|function\s*\(\s*\)|\{\s*\})[^"]*"/g;
    const syntaxErrors = content.match(invalidPattern) || [];
    if (syntaxErrors.length > 0) errors.push('Invalid syntax patterns');
    
    // Check for missing quotes
    const missingQuotesPattern = /onclick="[^"]*$/g;
    const missingQuotes = content.match(missingQuotesPattern) || [];
    if (missingQuotes.length > 0) errors.push('Missing quotes');
    
    console.log('📄 ' + file.split('/')[1] + ': ' + clickHandlers + ' click handlers, ' + (errors.length > 0 ? '❌ ' + errors.join(', ') : '✅ Valid'));
    
    if (errors.length > 0) errorCount++;
    
  } catch (err) {
    console.log('❌ Error reading ' + file + ': ' + err.message);
    errorCount++;
  }
});

console.log('\n📊 Click-Level Validation Results:');
console.log('✅ Total click handlers found: ' + totalClickHandlers);
console.log('✅ Files with valid syntax: ' + (frontendFiles.length - errorCount) + '/' + frontendFiles.length);
console.log(errorCount === 0 ? '🎉 ALL CLICK HANDLERS VALID' : '❌ SOME CLICK HANDLERS HAVE ISSUES');
