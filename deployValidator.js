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
  const failed = results.fixResults.filter(f => !f.success);

  if (failed.length > 2) {
    throw new Error("❌ Too many failed fixes — deploy blocked");
  }

  if (results.evolutionReport.successRate < 85) {
    throw new Error("❌ Low confidence — deploy blocked");
  }

  console.log("🟢 Deployment approved");
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
