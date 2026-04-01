// 🚀 AUTONOMOUS SYSTEM EXECUTOR
// Main execution script for the fully autonomous self-learning system

const fs = require('fs');
const AutonomousSystemEngine = require('./autonomous-system-engine');
const ValidationEngine = require('./validation-engine');

class AutonomousSystemExecutor {
  constructor() {
    this.autonomousEngine = new AutonomousSystemEngine();
    this.validationEngine = new ValidationEngine();
    this.results = {
      autonomous: {},
      validation: {},
      overall: {}
    };
  }

  async execute() {
    console.log('🚀 AUTONOMOUS SYSTEM EXECUTOR - STARTING');
    console.log('='.repeat(80));
    console.log('AI Rule Clustering + GitHub PR + Rollback Protection\n');

    try {
      // Phase 1: Run Autonomous System
      console.log('🧠 PHASE 1 - AUTONOMOUS SYSTEM EXECUTION');
      console.log('-'.repeat(50));
      
      const autonomousResults = await this.autonomousEngine.executeFullCycle();
      this.results.autonomous = autonomousResults;

      // Phase 2: Comprehensive Validation
      console.log('\n🧪 PHASE 2 - COMPREHENSIVE VALIDATION');
      console.log('-'.repeat(50));
      
      const validationResults = await this.validationEngine.validateSystem();
      this.results.validation = validationResults;

      // Phase 3: Generate Final Report
      console.log('\n📊 PHASE 3 - FINAL SYSTEM REPORT');
      console.log('-'.repeat(50));
      
      this.generateFinalReport();

      return this.results;

    } catch (error) {
      console.error('\n💥 AUTONOMOUS SYSTEM EXECUTOR FAILED:', error.message);
      throw error;
    }
  }

  generateFinalReport() {
    const auto = this.results.autonomous;
    const validation = this.results.validation;

    // Calculate overall success rate
    const totalIssues = (auto.autoFixed?.length || 0) + (auto.rolledBack?.length || 0) + (auto.manualFixes?.length || 0);
    const successRate = totalIssues > 0 ? ((auto.autoFixed?.length || 0) / totalIssues) * 100 : 0;

    // Determine overall status
    const overallSuccess = validation.success && successRate > 50;

    this.results.overall = {
      success: overallSuccess,
      successRate: successRate,
      status: overallSuccess ? 'PRODUCTION READY' : 'NEEDS IMPROVEMENT',
      summary: {
        autonomous: {
          autoFixed: auto.autoFixed?.length || 0,
          rolledBack: auto.rolledBack?.length || 0,
          manualFixes: auto.manualFixes?.length || 0,
          ruleClusters: auto.ruleClusters?.totalRules || 0,
          realSuccessRate: auto.realSuccessRate || 0
        },
        validation: {
          passed: validation.success,
          errors: validation.errors?.length || 0,
          warnings: validation.warnings?.length || 0
        }
      }
    };

    // Display results
    console.log('\n🎯 OVERALL SYSTEM STATUS');
    console.log('=====================');
    console.log(`📊 Status: ${this.results.overall.status}`);
    console.log(`✅ Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`🧠 Rule Clusters: ${auto.ruleClusters?.totalRules || 0}`);
    console.log(`🧪 Validation: ${validation.success ? 'PASSED' : 'FAILED'}`);

    console.log('\n✅ AUTO FIXED (PR Created):');
    (auto.autoFixed || []).forEach(fix => {
      console.log(`   🎉 ${fix.issue} in ${fix.file}`);
    });

    console.log('\n🔁 ROLLED BACK FIXES:');
    (auto.rolledBack || []).forEach(fix => {
      console.log(`   ⚠️ ${fix.issue} in ${fix.file} (${fix.errors?.length || 0} errors)`);
    });

    console.log('\n⚠️ NEEDS MANUAL FIX:');
    (auto.manualFixes || []).forEach(fix => {
      console.log(`   📋 ${fix.issue} in ${fix.file} (${fix.reason})`);
    });

    console.log('\n🧠 LEARNING STATISTICS:');
    console.log(`   📚 Total Rules: ${auto.ruleClusters?.totalRules || 0}`);
    console.log(`   🗂️ Rule Clusters: ${auto.ruleClusters?.clusters || 0}`);
    console.log(`   📈 Avg Usage: ${(auto.ruleClusters?.averageUsage || 0).toFixed(2)}`);
    console.log(`   🎯 Avg Success Rate: ${(auto.ruleClusters?.averageSuccessRate || 0).toFixed(2)}%`);

    console.log('\n🧪 VALIDATION RESULTS:');
    console.log(`   ✅ Syntax: ${validation.details?.syntax?.success ? 'PASS' : 'FAIL'}`);
    console.log(`   📁 Files: ${validation.details?.files?.success ? 'PASS' : 'FAIL'}`);
    console.log(`   ⚡ Runtime: ${validation.details?.runtime?.success ? 'PASS' : 'FAIL'}`);
    console.log(`   🔌 API: ${validation.details?.api?.success ? 'PASS' : 'FAIL'}`);

    if (validation.errors.length > 0) {
      console.log('\n❌ VALIDATION ERRORS:');
      validation.errors.forEach(error => {
        console.log(`   ❌ ${error}`);
      });
    }

    if (validation.warnings.length > 0) {
      console.log('\n⚠️ VALIDATION WARNINGS:');
      validation.warnings.forEach(warning => {
        console.log(`   ⚠️ ${warning}`);
      });
    }

    // Production readiness assessment
    console.log('\n🚀 PRODUCTION READINESS ASSESSMENT:');
    if (overallSuccess) {
      console.log('✅ SYSTEM IS PRODUCTION READY');
      console.log('   • Autonomous fixes applied successfully');
      console.log('   • System validation passed');
      console.log('   • Rule clustering working effectively');
      console.log('   • No critical issues detected');
    } else {
      console.log('❌ SYSTEM NOT READY FOR PRODUCTION');
      console.log('   • Validation failed or low success rate');
      console.log('   • Manual fixes required');
      console.log('   • Review rolled back fixes');
      console.log('   • Address validation errors');
    }

    // Save comprehensive report
    this.saveComprehensiveReport();
  }

  saveComprehensiveReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      execution: 'autonomous-system-full-cycle',
      results: this.results,
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime()
      },
      recommendations: this.generateRecommendations()
    };

    try {
      fs.writeFileSync('autonomous-system-execution-report.json', JSON.stringify(reportData, null, 2));
      console.log('\n📄 Comprehensive report saved to: autonomous-system-execution-report.json');
    } catch (error) {
      console.error('Error saving comprehensive report:', error.message);
    }
  }

  generateRecommendations() {
    const recommendations = [];
    const auto = this.results.autonomous;
    const validation = this.results.validation;

    // Autonomous system recommendations
    if (auto.realSuccessRate < 50) {
      recommendations.push({
        type: 'critical',
        category: 'autonomous',
        message: 'Low autonomous success rate detected. Review rule clustering logic.'
      });
    }

    if (auto.rolledBack && auto.rolledBack.length > 0) {
      recommendations.push({
        type: 'warning',
        category: 'autonomous',
        message: `${auto.rolledBack.length} fixes were rolled back. Review fix validation logic.`
      });
    }

    if (auto.manualFixes && auto.manualFixes.length > 0) {
      recommendations.push({
        type: 'info',
        category: 'autonomous',
        message: `${auto.manualFixes.length} issues need manual attention. Review manual fix queue.`
      });
    }

    // Validation recommendations
    if (!validation.success) {
      recommendations.push({
        type: 'critical',
        category: 'validation',
        message: 'System validation failed. Address critical validation errors before production.'
      });
    }

    if (validation.warnings && validation.warnings.length > 5) {
      recommendations.push({
        type: 'warning',
        category: 'validation',
        message: 'Multiple validation warnings detected. Consider addressing for better system health.'
      });
    }

    // Rule clustering recommendations
    if (auto.ruleClusters && auto.ruleClusters.averageSuccessRate < 70) {
      recommendations.push({
        type: 'info',
        category: 'learning',
        message: 'Rule success rate could be improved. Consider refining rule patterns.'
      });
    }

    return recommendations;
  }
}

// Execute the autonomous system
const executor = new AutonomousSystemExecutor();

executor.execute().then((results) => {
  console.log('\n🎉 AUTONOMOUS SYSTEM EXECUTION COMPLETE');
  console.log(`🎯 Final Status: ${results.overall.status}`);
  console.log(`📊 Success Rate: ${results.overall.successRate.toFixed(1)}%`);
  
  if (results.overall.success) {
    console.log('\n✅ SYSTEM IS READY FOR PRODUCTION DEPLOYMENT');
    console.log('🚀 The autonomous AI engineer has successfully prepared the system.');
  } else {
    console.log('\n⚠️ SYSTEM NEEDS IMPROVEMENTS BEFORE PRODUCTION');
    console.log('📋 Review the manual fixes and validation errors.');
  }
}).catch((error) => {
  console.error('\n💥 AUTONOMOUS SYSTEM EXECUTION FAILED:', error.message);
  process.exit(1);
});

module.exports = AutonomousSystemExecutor;
