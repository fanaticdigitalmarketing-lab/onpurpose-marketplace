const { commitFix } = require('./github-auto-fix');
const fs = require('fs');

/**
 * Automatically commits successful fixes to GitHub
 * @param {Array} fixResults - Array of fix results from Self-Learning Engine
 */
async function autoCommitFixes(fixResults) {
  console.log(`🔄 Starting auto-commit for ${fixResults.length} fix results...`);
  
  const successfulCommits = [];
  const failedCommits = [];
  
  for (const fix of fixResults) {
    if (fix.success && fix.file) {
      try {
        const content = fs.readFileSync(fix.file, 'utf8');

        const commitResult = await commitFix(
          fix.file,
          content,
          `🤖 Auto-fix: ${fix.error.type}` 
        );
        
        successfulCommits.push({
          file: fix.file,
          errorType: fix.error.type,
          commit: commitResult
        });
        
        console.log(`✅ Auto-committed fix for: ${fix.file} (${fix.error.type})`);
        
      } catch (error) {
        failedCommits.push({
          file: fix.file,
          errorType: fix.error.type,
          error: error.message
        });
        
        console.error(`❌ Failed to auto-commit fix for: ${fix.file}`, error.message);
      }
    } else {
      console.log(`⏭️ Skipping fix - no file or unsuccessful: ${fix.error?.type || 'unknown'}`);
    }
  }
  
  // Summary
  console.log(`\n📊 Auto-commit Summary:`);
  console.log(`   ✅ Successful commits: ${successfulCommits.length}`);
  console.log(`   ❌ Failed commits: ${failedCommits.length}`);
  
  if (successfulCommits.length > 0) {
    console.log(`\n🎉 Successfully committed fixes:`);
    successfulCommits.forEach(commit => {
      console.log(`   • ${commit.file} - ${commit.errorType}`);
    });
  }
  
  if (failedCommits.length > 0) {
    console.log(`\n⚠️ Failed commits:`);
    failedCommits.forEach(fail => {
      console.log(`   • ${fail.file} - ${fail.errorType}: ${fail.error}`);
    });
  }
  
  return {
    successful: successfulCommits,
    failed: failedCommits,
    total: fixResults.length
  };
}

module.exports = { autoCommitFixes };
