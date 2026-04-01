/**
 * Deployment validation system
 * Ensures system quality before allowing deployment
 */

/**
 * Validates system results before deployment
 * @param {Object} results - Results from Self-Learning Engine execution
 * @returns {boolean} - True if validation passes
 * @throws {Error} - If validation fails
 */
function validateBeforeDeploy(results) {
  console.log('🔍 Running deployment validation...');
  
  // Check for failed fixes
  const failedFixes = results.fixResults ? results.fixResults.filter(f => !f.success) : [];
  
  if (failedFixes.length > 0) {
    const failedTypes = failedFixes.map(f => f.error?.type || 'unknown').join(', ');
    throw new Error(`❌ Deployment blocked: ${failedFixes.length} fixes failed (${failedTypes})`);
  }

  // Check success rate
  const successRate = results.evolutionReport?.successRate || 0;
  if (successRate < 80) {
    throw new Error(`❌ Deployment blocked: Low success rate (${successRate}% < 80%)`);
  }

  // Check system health
  const systemHealth = results.systemHealth || 0;
  if (systemHealth < 50) {
    throw new Error(`❌ Deployment blocked: Low system health (${systemHealth}/100 < 50)`);
  }

  // Check for critical errors
  const criticalErrors = results.fixResults ? results.fixResults.filter(f => 
    f.error && f.error.severity === 'critical'
  ) : [];
  
  if (criticalErrors.length > 0) {
    throw new Error(`❌ Deployment blocked: ${criticalErrors.length} critical errors detected`);
  }

  // Validate learned rules count
  const learnedRules = results.learnedRules || 0;
  if (learnedRules < 10) {
    console.log(`⚠️ Warning: Low learned rules count (${learnedRules} < 10)`);
  }

  // Validate fix history
  const fixHistory = results.fixHistory || [];
  if (fixHistory.length === 0) {
    console.log(`⚠️ Warning: No fix history available`);
  }

  console.log('✅ Deployment validation passed!');
  console.log(`📊 Validation Summary:`);
  console.log(`   • Success Rate: ${successRate}%`);
  console.log(`   • System Health: ${systemHealth}/100`);
  console.log(`   • Failed Fixes: ${failedFixes.length}`);
  console.log(`   • Critical Errors: ${criticalErrors.length}`);
  console.log(`   • Learned Rules: ${learnedRules}`);
  
  return true;
}

/**
 * Comprehensive validation with detailed reporting
 * @param {Object} results - Engine execution results
 * @returns {Object} - Detailed validation report
 */
function comprehensiveValidation(results) {
  console.log('🔍 Running comprehensive deployment validation...');
  
  const report = {
    passed: true,
    warnings: [],
    errors: [],
    metrics: {}
  };

  // Success rate validation
  const successRate = results.evolutionReport?.successRate || 0;
  report.metrics.successRate = successRate;
  
  if (successRate < 80) {
    report.errors.push(`Success rate too low: ${successRate}%`);
    report.passed = false;
  } else if (successRate < 90) {
    report.warnings.push(`Success rate could be improved: ${successRate}%`);
  }

  // System health validation
  const systemHealth = results.systemHealth || 0;
  report.metrics.systemHealth = systemHealth;
  
  if (systemHealth < 50) {
    report.errors.push(`System health too low: ${systemHealth}/100`);
    report.passed = false;
  } else if (systemHealth < 70) {
    report.warnings.push(`System health could be improved: ${systemHealth}/100`);
  }

  // Failed fixes validation
  const failedFixes = results.fixResults ? results.fixResults.filter(f => !f.success) : [];
  report.metrics.failedFixes = failedFixes.length;
  
  if (failedFixes.length > 0) {
    report.errors.push(`${failedFixes.length} fixes failed`);
    report.passed = false;
  }

  // Critical errors validation
  const criticalErrors = results.fixResults ? results.fixResults.filter(f => 
    f.error && f.error.severity === 'critical'
  ) : [];
  report.metrics.criticalErrors = criticalErrors.length;
  
  if (criticalErrors.length > 0) {
    report.errors.push(`${criticalErrors.length} critical errors detected`);
    report.passed = false;
  }

  // Learning metrics
  report.metrics.learnedRules = results.learnedRules || 0;
  report.metrics.fixHistory = results.fixHistory?.length || 0;

  // Generate summary
  if (report.passed) {
    console.log('✅ Comprehensive validation passed!');
  } else {
    console.log('❌ Comprehensive validation failed!');
  }

  console.log(`📊 Validation Report:`);
  console.log(`   • Status: ${report.passed ? 'PASSED' : 'FAILED'}`);
  console.log(`   • Errors: ${report.errors.length}`);
  console.log(`   • Warnings: ${report.warnings.length}`);
  
  if (report.errors.length > 0) {
    console.log(`\n❌ Errors:`);
    report.errors.forEach(error => console.log(`   • ${error}`));
  }
  
  if (report.warnings.length > 0) {
    console.log(`\n⚠️ Warnings:`);
    report.warnings.forEach(warning => console.log(`   • ${warning}`));
  }

  return report;
}

module.exports = {
  validateBeforeDeploy,
  comprehensiveValidation
};
