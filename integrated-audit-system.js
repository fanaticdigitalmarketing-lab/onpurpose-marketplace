// INTEGRATED AUDIT SYSTEM
// Combines Self-Learning Hotfix Engine with Production Audit System

const fs = require('fs');
const SelfLearningHotfixEngine = require('./self-learning-hotfix-engine');
const ProductionAuditSystem = require('./production-audit-system');

class IntegratedAuditSystem {
  constructor() {
    this.engine = new SelfLearningHotfixEngine();
    this.audit = new ProductionAuditSystem(this.engine);
    this.results = {
      selfLearning: {},
      production: {},
      overall: {}
    };
  }

  // Execute complete integrated audit
  async executeCompleteAudit() {
    console.log('🚀 INTEGRATED AUDIT SYSTEM - COMPLETE SYSTEM ANALYSIS');
    console.log('=' .repeat(80));
    console.log('Combining Self-Learning Engine with Production Audit...\n');

    try {
      // Phase 1: Run Self-Learning Hotfix Engine
      console.log('🧠 PHASE 1 - SELF-LEARNING HOTFIX ENGINE');
      console.log('-'.repeat(50));
      
      const selfLearningResults = await this.engine.executeFullCycle();
      this.results.selfLearning = selfLearningResults;
      
      if (selfLearningResults.success) {
        console.log('✅ Self-Learning Engine: COMPLETED SUCCESSFULLY');
        console.log(`   Rules Created: ${selfLearningResults.evolutionReport.totalRules}`);
        console.log(`   Fixes Applied: ${selfLearningResults.evolutionReport.totalFixes}`);
        console.log(`   Success Rate: ${selfLearningResults.evolutionReport.successRate}%`);
      } else {
        console.log('❌ Self-Learning Engine: FAILED');
        console.log('   Continuing with production audit...');
      }

      // Phase 2: Run Production Audit System
      console.log('\n🔍 PHASE 2 - PRODUCTION AUDIT SYSTEM');
      console.log('-'.repeat(50));
      
      const productionResults = await this.audit.runFullAudit();
      this.results.production = productionResults;
      
      // Phase 3: Generate Integrated Analysis
      console.log('\n📊 PHASE 3 - INTEGRATED ANALYSIS');
      console.log('-'.repeat(50));
      
      this.generateIntegratedAnalysis();
      
      // Phase 4: Final Recommendations
      console.log('\n🎯 PHASE 4 - FINAL RECOMMENDATIONS');
      console.log('-'.repeat(50));
      
      this.generateFinalRecommendations();
      
      return this.results;

    } catch (error) {
      console.error('❌ Integrated audit failed:', error.message);
      throw error;
    }
  }

  generateIntegratedAnalysis() {
    const slResults = this.results.selfLearning;
    const prodResults = this.results.production;

    // Calculate combined health score
    const slHealth = slResults.evolutionReport?.successRate || 0;
    const prodHealth = prodResults.overall?.score || 0;
    const combinedHealth = Math.round((slHealth + prodHealth) / 2);

    // Analyze issue correlation
    const correlation = this.analyzeIssueCorrelation();

    // System readiness assessment
    const readiness = this.assessSystemReadiness();

    this.results.overall = {
      combinedHealth,
      correlation,
      readiness,
      selfLearningMetrics: {
        rulesCreated: slResults.evolutionReport?.totalRules || 0,
        fixesApplied: slResults.evolutionReport?.totalFixes || 0,
        successRate: slResults.evolutionReport?.successRate || 0
      },
      productionMetrics: {
        overallScore: prodResults.overall?.score || 0,
        totalIssues: prodResults.overall?.totalIssues || 0,
        criticalIssues: prodResults.overall?.criticalIssues || 0,
        categoryScores: prodResults.overall?.categoryScores || {}
      }
    };

    console.log(`📊 COMBINED HEALTH SCORE: ${combinedHealth}/100`);
    console.log(`🔗 ISSUE CORRELATION: ${correlation.issues} correlated issues`);
    console.log(`🚀 SYSTEM READINESS: ${readiness.status}`);
  }

  analyzeIssueCorrelation() {
    const correlation = {
      issues: 0,
      details: []
    };

    // Analyze if self-learning fixes addressed production issues
    const slFixes = this.results.selfLearning.fixHistory || [];
    const prodIssues = this.results.production.overall?.totalIssues || 0;

    // Check for overlapping issues
    const slFixTypes = new Set(slFixes.map(fix => fix.error?.type).filter(Boolean));
    const prodIssueTypes = new Set();

    // Collect production issue types
    Object.values(this.results.production).forEach(category => {
      if (category.issues) {
        category.issues.forEach(issue => {
          prodIssueTypes.add(issue.type);
        });
      }
    });

    // Find correlations
    slFixTypes.forEach(fixType => {
      if (prodIssueTypes.has(fixType)) {
        correlation.issues++;
        correlation.details.push({
          type: fixType,
          status: 'Self-learning addressed production issue'
        });
      }
    });

    return correlation;
  }

  assessSystemReadiness() {
    const slSuccess = this.results.selfLearning.success;
    const prodStatus = this.results.production.overall?.status;
    const criticalIssues = this.results.production.overall?.criticalIssues || 0;
    const combinedHealth = this.results.overall.combinedHealth;

    let status = 'NOT_READY';
    let confidence = 'LOW';
    let blockers = [];

    if (!slSuccess) {
      blockers.push('Self-learning engine failed');
    }

    if (prodStatus !== 'PRODUCTION READY') {
      blockers.push('Production audit failed');
    }

    if (criticalIssues > 0) {
      blockers.push(`${criticalIssues} critical issues`);
    }

    if (combinedHealth >= 85 && blockers.length === 0) {
      status = 'PRODUCTION_READY';
      confidence = 'HIGH';
    } else if (combinedHealth >= 70 && blockers.length <= 1) {
      status = 'NEEDS_IMPROVEMENT';
      confidence = 'MEDIUM';
    } else {
      status = 'NOT_READY';
      confidence = 'LOW';
    }

    return {
      status,
      confidence,
      blockers,
      combinedHealth
    };
  }

  generateFinalRecommendations() {
    const { combinedHealth, readiness, correlation } = this.results.overall;

    console.log(`🎯 FINAL ASSESSMENT: ${readiness.status}`);
    console.log(`📊 Confidence Level: ${readiness.confidence}`);
    console.log(`🔗 Correlated Issues: ${correlation.issues}`);

    if (readiness.blockers.length > 0) {
      console.log('\n🚨 BLOCKERS TO RESOLVE:');
      readiness.blockers.forEach((blocker, index) => {
        console.log(`   ${index + 1}. ${blocker}`);
      });
    }

    console.log('\n📋 RECOMMENDED ACTIONS:');

    if (combinedHealth < 50) {
      console.log('   🔴 IMMEDIATE ACTIONS REQUIRED:');
      console.log('      1. Address all critical security issues');
      console.log('      2. Fix broken API routes and error handling');
      console.log('      3. Implement proper input validation');
      console.log('      4. Run self-learning engine again after fixes');
    } else if (combinedHealth < 80) {
      console.log('   🟡 IMPROVEMENTS NEEDED:');
      console.log('      1. Fix remaining critical and high-severity issues');
      console.log('      2. Improve accessibility compliance');
      console.log('      3. Optimize performance issues');
      console.log('      4. Complete deployment configuration');
    } else {
      console.log('   🟢 OPTIMIZATION OPPORTUNITIES:');
      console.log('      1. Fine-tune performance optimizations');
      console.log('      2. Enhance accessibility features');
      console.log('      3. Improve code quality metrics');
      console.log('      4. Consider advanced monitoring');
    }

    // Self-learning specific recommendations
    if (this.results.selfLearning.success) {
      console.log('\n🧠 SELF-LEARNING RECOMMENDATIONS:');
      console.log('   ✅ Keep self-learning engine active for continuous improvement');
      console.log('   ✅ Monitor rule effectiveness and optimize');
      console.log('   ✅ Schedule regular audit cycles');
    } else {
      console.log('\n🧠 SELF-LEARNING RECOMMENDATIONS:');
      console.log('   ❌ Fix self-learning engine issues before production');
      console.log('   ❌ Ensure rule creation and fix application work');
      console.log('   ❌ Test learning system with known issues');
    }

    // Production specific recommendations
    const prodScore = this.results.production.overall?.score || 0;
    if (prodScore < 70) {
      console.log('\n🚀 PRODUCTION RECOMMENDATIONS:');
      console.log('   ❌ Address critical production issues first');
      console.log('   ❌ Complete security hardening');
      console.log('   ❌ Implement proper monitoring and logging');
    } else {
      console.log('\n🚀 PRODUCTION RECOMMENDATIONS:');
      console.log('   ✅ System is production-ready');
      console.log('   ✅ Deploy with monitoring enabled');
      console.log('   ✅ Schedule regular production audits');
    }

    // Next steps
    console.log('\n🔄 NEXT STEPS:');
    
    if (readiness.status === 'NOT_READY') {
      console.log('   1. Fix all critical blockers');
      console.log('   2. Re-run integrated audit');
      console.log('   3. Address remaining issues');
      console.log('   4. Achieve production readiness');
    } else if (readiness.status === 'NEEDS_IMPROVEMENT') {
      console.log('   1. Address remaining issues');
      console.log('   2. Optimize system performance');
      console.log('   3. Complete accessibility improvements');
      console.log('   4. Prepare for production deployment');
    } else {
      console.log('   1. Deploy to production');
      console.log('   2. Enable monitoring and alerting');
      console.log('   3. Schedule regular maintenance');
      console.log('   4. Continue self-learning optimization');
    }

    // Save comprehensive report
    this.saveIntegratedReport();
  }

  saveIntegratedReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        combinedHealth: this.results.overall.combinedHealth,
        readiness: this.results.overall.readiness,
        correlation: this.results.overall.correlation,
        selfLearningMetrics: this.results.overall.selfLearningMetrics,
        productionMetrics: this.results.overall.productionMetrics
      },
      recommendations: this.generateRecommendationsForReport()
    };

    try {
      fs.writeFileSync('integrated-audit-report.json', JSON.stringify(reportData, null, 2));
      console.log('\n📄 Integrated report saved to: integrated-audit-report.json');
    } catch (error) {
      console.error('Error saving integrated report:', error.message);
    }
  }

  generateRecommendationsForReport() {
    const { readiness, combinedHealth } = this.results.overall;
    
    const recommendations = {
      immediate: [],
      shortTerm: [],
      longTerm: []
    };

    if (readiness.status === 'NOT_READY') {
      recommendations.immediate = [
        'Fix all critical security issues',
        'Resolve self-learning engine failures',
        'Implement proper input validation',
        'Fix broken API routes'
      ];
    } else if (readiness.status === 'NEEDS_IMPROVEMENT') {
      recommendations.immediate = [
        'Address remaining critical issues',
        'Complete accessibility compliance'
      ];
      recommendations.shortTerm = [
        'Optimize performance issues',
        'Improve code quality metrics'
      ];
    } else {
      recommendations.shortTerm = [
        'Deploy to production with monitoring',
        'Enable continuous self-learning'
      ];
      recommendations.longTerm = [
        'Implement advanced monitoring',
        'Optimize for scale',
        'Enhance automation'
      ];
    }

    return recommendations;
  }
}

// Execute integrated audit
const integratedSystem = new IntegratedAuditSystem();

integratedSystem.executeCompleteAudit().then((results) => {
  console.log('\n✅ INTEGRATED AUDIT COMPLETED SUCCESSFULLY');
  console.log(`🎯 Final Status: ${results.overall.readiness.status}`);
  console.log(`📊 Combined Health: ${results.overall.combinedHealth}/100`);
  
  if (results.overall.readiness.status === 'PRODUCTION_READY') {
    console.log('\n🚀 SYSTEM IS READY FOR PRODUCTION DEPLOYMENT');
  } else {
    console.log('\n⚠️ SYSTEM NEEDS IMPROVEMENTS BEFORE PRODUCTION');
  }
}).catch((error) => {
  console.error('\n❌ Integrated audit failed:', error.message);
  process.exit(1);
});

module.exports = IntegratedAuditSystem;
