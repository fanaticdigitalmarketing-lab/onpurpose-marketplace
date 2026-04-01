// Quick fix for remaining issues
const fs = require('fs');

console.log('🔧 QUICK FIX FOR REMAINING ISSUES');

// Fix remaining CSS issues in other frontend files
const files = [
  'frontend/index.html',
  'frontend/dashboard.html',
  'frontend/services.html',
  'frontend/provider.html',
  'frontend/service-detail.html'
];

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Fix common CSS syntax issues
    let fixed = content;
    
    // Fix missing semicolons in CSS rules
    fixed = fixed.replace(/\.([a-zA-Z-]+)\{([^}]+)\}/g, (match, className, rules) => {
      // Add semicolons to rules that don't have them
      const fixedRules = rules.replace(/([^;}])\s*}/g, '$1;}');
      return `.${className}{${fixedRules}}`;
    });
    
    // Fix broken CSS properties
    fixed = fixed.replace(/([a-zA-Z-]+):\s*([^;{}]+)\s*}/g, '$1: $2;}');
    
    if (fixed !== content) {
      fs.writeFileSync(file, fixed);
      console.log(`✅ Fixed CSS issues in ${file}`);
    } else {
      console.log(`✅ No issues found in ${file}`);
    }
    
  } catch (error) {
    console.log(`❌ Error fixing ${file}: ${error.message}`);
  }
});

console.log('\n🎉 QUICK FIX COMPLETE');
