const fs = require('fs');

try {
  const learned = require('./learned-rules.json');
  const history = require('./fix-history.json');
  
  console.log('📊 SELF-LEARNING ENGINE STATISTICS');
  console.log('================================');
  
  console.log('🧠 LEARNED RULES:');
  console.log(`   Total Rules: ${learned.length}`);
  console.log(`   File Size: ${(JSON.stringify(learned).length / 1024).toFixed(2)} KB`);
  
  console.log('\n🔧 FIX HISTORY:');
  console.log(`   Total Fixes: ${history.length}`);
  console.log(`   File Size: ${(JSON.stringify(history).length / 1024).toFixed(2)} KB`);
  
  console.log('\n📈 RULE BREAKDOWN:');
  const ruleTypes = {};
  learned.forEach(rule => {
    ruleTypes[rule.type] = (ruleTypes[rule.type] || 0) + 1;
  });
  Object.entries(ruleTypes).forEach(([type, count]) => {
    console.log(`   ${type}: ${count} rules`);
  });
  
  console.log('\n🎯 TRIGGER BREAKDOWN:');
  const triggers = {};
  learned.forEach(rule => {
    triggers[rule.trigger] = (triggers[rule.trigger] || 0) + 1;
  });
  Object.entries(triggers)
    .sort((a, b) => b[1] - a[1])
    .forEach(([trigger, count]) => {
      console.log(`   ${trigger}: ${count} rules`);
    });
  
  console.log('\n✅ SUCCESS RATE:');
  const successfulFixes = history.filter(fix => fix.success).length;
  console.log(`   Successful Fixes: ${successfulFixes}/${history.length} (${((successfulFixes/history.length)*100).toFixed(1)}%)`);
  
  console.log('\n⏰ LATEST ACTIVITY:');
  const latestFix = history[history.length - 1];
  console.log(`   Last Fix: ${latestFix.timestamp}`);
  console.log(`   Error Type: ${latestFix.error.type}`);
  console.log(`   Success: ${latestFix.success}`);
  
  console.log('\n🔍 TOP ERROR TYPES:');
  const errorTypes = {};
  history.forEach(fix => {
    errorTypes[fix.error.type] = (errorTypes[fix.error.type] || 0) + 1;
  });
  Object.entries(errorTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([type, count]) => {
      console.log(`   ${type}: ${count} fixes`);
    });
  
  console.log('\n📁 FILES MODIFIED:');
  const files = {};
  history.forEach(fix => {
    if (fix.error.file) {
      files[fix.error.file] = (files[fix.error.file] || 0) + 1;
    }
  });
  Object.entries(files)
    .sort((a, b) => b[1] - a[1])
    .forEach(([file, count]) => {
      console.log(`   ${file}: ${count} fixes`);
    });
  
} catch (error) {
  console.error('❌ Error analyzing engine data:', error.message);
}
