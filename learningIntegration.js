const { learnFromFix } = require('./multi-repo-brain');

/**
 * Learning Integration Module
 * Integrates learning capabilities into the autonomous workflow
 */

/**
 * Process fix results and learn from all fixes
 * @param {Array} fixResults - Array of fix results from the autonomous workflow
 */
function processFixResults(fixResults) {
  console.log(`🧠 Processing ${fixResults.length} fix results for learning...`);
  
  let successfulFixes = 0;
  let failedFixes = 0;
  
  for (const fix of fixResults) {
    learnFromFix(fix);
    
    if (fix.success) {
      successfulFixes++;
      console.log(`✅ Learned from successful fix: ${fix.file} (${fix.error?.type || 'unknown'})`);
    } else {
      failedFixes++;
      console.log(`❌ Learned from failed fix: ${fix.file} (${fix.error?.type || 'unknown'})`);
    }
  }
  
  console.log(`📊 Learning Summary:`);
  console.log(`   • Successful fixes: ${successfulFixes}`);
  console.log(`   • Failed fixes: ${failedFixes}`);
  console.log(`   • Total processed: ${fixResults.length}`);
  
  return {
    processed: fixResults.length,
    successful: successfulFixes,
    failed: failedFixes
  };
}

/**
 * Enhanced learning with batch processing
 * @param {Object} batchResults - Results from batch workflow execution
 */
function processBatchLearning(batchResults) {
  console.log('🧠 Processing batch learning data...');
  
  const allFixes = [
    ...batchResults.successful.map(fix => ({ ...fix, success: true })),
    ...batchResults.failed.map(fix => ({ ...fix, success: false, reason: fix.reason }))
  ];
  
  return processFixResults(allFixes);
}

/**
 * Learning integration for autonomous workflow
 * @param {Object} workflowResult - Result from complete autonomous workflow
 */
function integrateWorkflowLearning(workflowResult) {
  if (!workflowResult.fixResults) {
    console.log('⚠️ No fix results to learn from');
    return null;
  }
  
  console.log('🧠 Integrating workflow learning...');
  
  const learningSummary = processFixResults(workflowResult.fixResults);
  
  // Add learning metadata to workflow result
  workflowResult.learning = {
    processed: learningSummary.processed,
    successful: learningSummary.successful,
    failed: learningSummary.failed,
    timestamp: new Date().toISOString()
  };
  
  return workflowResult;
}

/**
 * Real-time learning during workflow execution
 * @param {Object} fix - Single fix result
 */
function learnFromSingleFix(fix) {
  console.log(`🧠 Real-time learning from fix: ${fix.file}`);
  
  learnFromFix(fix);
  
  return {
    learned: true,
    fix: {
      file: fix.file,
      type: fix.error?.type || 'unknown',
      success: fix.success,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Learning analytics and insights
 */
function getLearningInsights() {
  const { getSuccessMetrics, getGlobalTopIssues, getCrossRepoInsights } = require('./multi-repo-brain');
  
  const metrics = getSuccessMetrics();
  const topIssues = getGlobalTopIssues();
  const crossRepo = getCrossRepoInsights();
  
  console.log('📊 Learning Analytics:');
  console.log(`   • Success Rate: ${metrics.successRate}%`);
  console.log(`   • Total Fixes: ${metrics.totalFixes}`);
  console.log(`   • Top Issues: ${topIssues.length} patterns tracked`);
  console.log(`   • Cross-Repo Patterns: ${crossRepo.length} identified`);
  
  return {
    successMetrics: metrics,
    topIssues,
    crossRepoPatterns: crossRepo,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  processFixResults,
  processBatchLearning,
  integrateWorkflowLearning,
  learnFromSingleFix,
  getLearningInsights
};
