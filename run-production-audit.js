// INTEGRATED PRODUCTION AUDIT EXECUTION
// Self-Learning Hotfix Engine + Production Audit System

const SelfLearningHotfixEngine = require('./self-learning-hotfix-engine');
const ProductionAuditSystem = require('./production-audit-system-v2');

class IntegratedProductionAudit {
  constructor() {
    this.engine = new SelfLearningHotfixEngine();
    this.audit = new ProductionAuditSystem(this.engine);
    this.results = {
      selfLearning: {},
      production: {},
      overall: {}
    };
  }

  async executeFullAudit() {
    console.log('🚀 INTEGRATED PRODUCTION AUDIT');
    console.log('='.repeat(50));
    console.log('Self-Learning Engine + Production Audit System\n');

    try {
      // Phase 1: Run Self-Learning Hotfix Engine
      console.log('🧠 PHASE 1 - SELF-LEARNING HOTFIX ENGINE');
      console.log('-'.repeat(40));
      
      const selfLearningResults = await this.engine.executeFullCycle();
      this.results.selfLearning = selfLearningResults;
      
      console.log('\n✅ Self-Learning Engine: COMPLETED');
      console.log(`📊 Rules Created: ${selfLearningResults.evolutionReport?.totalRules || 0}`);
      console.log(`🔧 Fixes Applied: ${selfLearningResults.evolutionReport?.totalFixes || 0}`);
      console.log(`📈 Success Rate: ${selfLearningResults.evolutionReport?.successRate || 0}%`);

      // Phase 2: Run Production Audit System
      console.log('\n🔍 PHASE 2 - PRODUCTION AUDIT SYSTEM');
      console.log('-'.repeat(40));
      
      const productionResults = await this.audit.runFullAudit();
      this.results.production = productionResults;

      // Phase 3: Generate Overall Assessment
      console.log('\n📊 PHASE 3 - OVERALL ASSESSMENT');
      console.log('-'.repeat(40));
      
      this.generateOverallAssessment();

      return this.results;

    } catch (error) {
      console.error('\n❌ Integrated audit failed:', error.message);
      
      // If production audit fails, exit with error code
      if (error.message.includes('DEPLOYMENT BLOCKED')) {
        process.exit(1);
      }
      
      throw error;
    }
  }

  generateOverallAssessment() {
    const slResults = this.results.selfLearning;
    const prodResults = this.results.production;

    // Calculate combined metrics
    const slSuccess = slResults.evolutionReport?.successRate || 0;
    const prodSuccess = prodResults.stats?.successRate || 0;
    const combinedSuccess = Math.round((slSuccess + prodSuccess) / 2);

    const totalIssues = (slResults.evolutionReport?.totalFixes || 0) + (prodResults.stats?.totalIssues || 0);
    const criticalIssues = prodResults.stats?.critical || 0;

    this.results.overall = {
      combinedSuccess,
      totalIssues,
      criticalIssues,
      selfLearningMetrics: {
        rulesCreated: slResults.evolutionReport?.totalRules || 0,
        fixesApplied: slResults.evolutionReport?.totalFixes || 0,
        successRate: slResults.evolutionReport?.successRate || 0
      },
      productionMetrics: {
        totalIssues: prodResults.stats?.totalIssues || 0,
        autoFixed: prodResults.stats?.autoFixed || 0,
        manual: prodResults.stats?.manual || 0,
        critical: prodResults.stats?.critical || 0,
        successRate: prodResults.stats?.successRate || 0
      }
    };

    console.log('\n🎯 OVERALL RESULTS');
    console.log('=================');
    console.log(`📊 Combined Success Rate: ${combinedSuccess}%`);
    console.log(`🔢 Total Issues Addressed: ${totalIssues}`);
    console.log(`🚨 Critical Issues: ${criticalIssues}`);

    if (criticalIssues === 0) {
      console.log('\n✅ SYSTEM IS PRODUCTION READY');
      console.log('🚀 Safe to deploy to production');
    } else {
      console.log('\n❌ SYSTEM NOT READY FOR PRODUCTION');
      console.log(`🚨 ${criticalIssues} critical issues must be resolved`);
    }

    // Save results
    this.saveResults();
  }

  saveResults() {
    const reportData = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        combinedSuccess: this.results.overall.combinedSuccess,
        totalIssues: this.results.overall.totalIssues,
        criticalIssues: this.results.overall.criticalIssues,
        productionReady: this.results.overall.criticalIssues === 0
      }
    };

    try {
      fs.writeFileSync('production-audit-results.json', JSON.stringify(reportData, null, 2));
      console.log('\n📄 Results saved to: production-audit-results.json');
    } catch (error) {
      console.error('Error saving results:', error.message);
    }
  }
}

// Execute the integrated audit
const audit = new IntegratedProductionAudit();

audit.executeFullAudit().then((results) => {
  console.log('\n🎉 INTEGRATED PRODUCTION AUDIT COMPLETED');
  
  if (results.overall.criticalIssues === 0) {
    console.log('✅ System is ready for production deployment');
  } else {
    console.log('❌ System needs fixes before production deployment');
  }
}).catch((error) => {
  console.error('\n💥 INTEGRATED AUDIT FAILED:', error.message);
  process.exit(1);
});
