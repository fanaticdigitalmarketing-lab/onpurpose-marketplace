const CompleteAutonomousWorkflow = require('./completeAutonomousWorkflow');
const { learnFromFix } = require('./multi-repo-brain');
const { getSuccessMetrics, getGlobalTopIssues } = require('./multi-repo-brain');
const { pickBestProject } = require('./startup-brain');
const { executeFocusStrategy } = require('./startup-brain');
const { executeMarketingAutomation } = require('./marketingEngine');

/**
 * Autonomous Startup Engine - Complete business growth automation
 * 
 * Full cycle: Fix bugs → Learn globally → Track performance → Pick best startup → Focus resources → Launch marketing → Grow strongest product
 */
class AutonomousStartupEngine {
  constructor() {
    this.workflow = new CompleteAutonomousWorkflow();
    this.cycleHistory = [];
    this.currentFocus = null;
  }

  /**
   * Execute complete autonomous startup growth cycle
   */
  async executeGrowthCycle() {
    console.log('🚀 Starting Autonomous Startup Growth Cycle...');
    console.log('===============================================');
    
    const cycleId = Date.now();
    const startTime = Date.now();
    
    try {
      // 1. Fix bugs
      console.log('🔧 Step 1: Fixing bugs...');
      const bugFixResults = await this.fixBugs();
      
      // 2. Learn globally
      console.log('🧠 Step 2: Learning globally...');
      const learningResults = await this.learnGlobally(bugFixResults);
      
      // 3. Track performance
      console.log('📊 Step 3: Tracking performance...');
      const performanceResults = await this.trackPerformance();
      
      // 4. Pick best startup
      console.log('🎯 Step 4: Picking best startup...');
      const startupSelection = await this.pickBestStartup();
      
      // 5. Focus resources
      console.log('🔍 Step 5: Focusing resources...');
      const focusResults = await this.focusResources(startupSelection);
      
      // 6. Launch marketing
      console.log('📣 Step 6: Launching marketing...');
      const marketingResults = await this.launchMarketing(startupSelection);
      
      // 7. Grow strongest product
      console.log('📈 Step 7: Growing strongest product...');
      const growthResults = await this.growStrongestProduct(startupSelection, marketingResults);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      const cycleResult = {
        cycleId,
        success: true,
        duration: `${duration}s`,
        steps: {
          bugFixes: bugFixResults,
          learning: learningResults,
          performance: performanceResults,
          startupSelection,
          resourceFocus: focusResults,
          marketing: marketingResults,
          growth: growthResults
        },
        timestamp: new Date().toISOString()
      };

      this.cycleHistory.push(cycleResult);
      this.currentFocus = startupSelection;

      console.log('🎉🎉🎉 AUTONOMOUS STARTUP GROWTH CYCLE COMPLETE! 🎉🎉🎉');
      console.log(`⏱️ Total duration: ${duration}s`);
      console.log(`🎯 Current focus: ${startupSelection.name}`);

      return cycleResult;

    } catch (error) {
      console.error('❌ Growth cycle failed:', error.message);
      
      const failedCycle = {
        cycleId,
        success: false,
        error: error.message,
        duration: ((Date.now() - startTime) / 1000).toFixed(2) + 's',
        timestamp: new Date().toISOString()
      };

      this.cycleHistory.push(failedCycle);
      
      return failedCycle;
    }
  }

  /**
   * Step 1: Fix bugs using autonomous workflow
   */
  async fixBugs() {
    console.log('🔧 Detecting and fixing system bugs...');
    
    // Simulate bug detection
    const issues = [
      {
        file: 'server.js',
        error: { type: 'missing_error_handling', severity: 'medium' }
      },
      {
        file: 'index.html',
        error: { type: 'missing_doctype', severity: 'high' }
      }
    ];

    const results = await this.workflow.executeBatchWorkflow(issues);
    
    console.log(`📊 Bug fixes: ${results.successful.length} successful, ${results.failed.length} failed`);
    
    return {
      issuesDetected: issues.length,
      fixesApplied: results.successful.length,
      fixesFailed: results.failed.length,
      successRate: results.successful.length > 0 ? (results.successful.length / issues.length * 100).toFixed(1) : 0
    };
  }

  /**
   * Step 2: Learn globally from all fixes
   */
  async learnGlobally(bugFixResults) {
    console.log('🧠 Learning from fix results...');
    
    // Process all fix results for learning
    const allFixes = [
      ...bugFixResults.fixes?.successful || [],
      ...bugFixResults.fixes?.failed || []
    ];

    let learningCount = 0;
    for (const fix of allFixes) {
      if (fix) {
        learnFromFix(fix);
        learningCount++;
      }
    }

    console.log(`📚 Processed ${learningCount} fixes for global learning`);
    
    return {
      fixesProcessed: learningCount,
      globalPatterns: getGlobalTopIssues().length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Step 3: Track performance metrics
   */
  async trackPerformance() {
    console.log('📊 Tracking system performance...');
    
    const metrics = getSuccessMetrics();
    const topIssues = getGlobalTopIssues();
    
    const performance = {
      successMetrics: metrics,
      topIssues: topIssues.slice(0, 5),
      overallHealth: this.calculateSystemHealth(metrics),
      trends: this.analyzeTrends(metrics)
    };

    console.log(`📈 System health: ${performance.overallHealth}%`);
    console.log(`🎯 Success rate: ${metrics.successRate}%`);
    
    return performance;
  }

  /**
   * Step 4: Pick best startup to focus on
   */
  async pickBestStartup() {
    console.log('🎯 Selecting best startup for focus...');
    
    const startup = pickBestProject();
    const insights = executeFocusStrategy();
    
    console.log(`🚀 Selected: ${startup.name} (Priority: ${startup.priority})`);
    
    return {
      project: startup,
      insights,
      selectionRationale: `Highest score (${startup.score}) with ${startup.priority} priority`
    };
  }

  /**
   * Step 5: Focus resources on selected startup
   */
  async focusResources(startupSelection) {
    console.log(`🔍 Focusing resources on ${startupSelection.project.name}...`);
    
    const focusPlan = {
      startup: startupSelection.project.name,
      priority: startupSelection.project.priority,
      focusArea: startupSelection.insights.focusArea,
      resourceAllocation: this.calculateResourceAllocation(startupSelection.project),
      timeline: this.generateFocusTimeline(startupSelection.project),
      expectedOutcomes: this.defineExpectedOutcomes(startupSelection.project)
    };

    console.log(`💰 Resource allocation: $${focusPlan.resourceAllocation.budget}`);
    console.log(`⏰ Focus timeline: ${focusPlan.timeline.duration}`);
    
    return focusPlan;
  }

  /**
   * Step 6: Launch marketing for focused startup
   */
  async launchMarketing(startupSelection) {
    console.log(`📣 Launching marketing for ${startupSelection.project.name}...`);
    
    const marketingResults = executeMarketingAutomation(startupSelection.project);
    
    console.log(`🚀 Campaign launched: ${marketingResults.campaign.id}`);
    console.log(`📚 Content pieces: ${marketingResults.contentLibrary.length}`);
    console.log(`💰 Marketing budget: $${marketingResults.strategy.budget}`);
    
    return marketingResults;
  }

  /**
   * Step 7: Grow strongest product with focused efforts
   */
  async growStrongestProduct(startupSelection, marketingResults) {
    console.log(`📈 Growing ${startupSelection.project.name} with focused efforts...`);
    
    const growthPlan = {
      product: startupSelection.project.name,
      marketingCampaign: marketingResults.campaign.id,
      growthTargets: this.setGrowthTargets(startupSelection.project),
      monitoring: this.setupGrowthMonitoring(startupSelection.project),
      optimization: this.defineOptimizationStrategy(startupSelection.project)
    };

    console.log(`🎯 Growth targets: ${JSON.stringify(growthPlan.growthTargets)}`);
    console.log(`📊 Monitoring: ${growthPlan.monitoring.metrics.join(', ')}`);
    
    return growthPlan;
  }

  /**
   * Calculate system health based on metrics
   */
  calculateSystemHealth(metrics) {
    const successRate = parseFloat(metrics.successRate) || 0;
    const totalFixes = metrics.totalFixes || 0;
    
    // Health calculation: success rate weighted by experience
    const experienceBonus = Math.min(totalFixes * 0.1, 20);
    const health = Math.min(successRate + experienceBonus, 100);
    
    return health.toFixed(1);
  }

  /**
   * Analyze performance trends
   */
  analyzeTrends(metrics) {
    const trends = {
      improving: metrics.successRate > 80,
      stable: metrics.successRate >= 70 && metrics.successRate <= 80,
      declining: metrics.successRate < 70,
      recommendation: this.getTrendRecommendation(metrics.successRate)
    };

    return trends;
  }

  /**
   * Get trend-based recommendations
   */
  getTrendRecommendation(successRate) {
    if (successRate > 90) return "Excellent performance - maintain current strategies";
    if (successRate > 80) return "Good performance - consider optimization";
    if (successRate > 70) return "Acceptable - needs improvement focus";
    return "Poor performance - requires immediate attention";
  }

  /**
   * Calculate resource allocation for startup
   */
  calculateResourceAllocation(project) {
    const baseBudget = 1000;
    const multiplier = project.score / 100;
    const budget = Math.round(baseBudget * multiplier);
    
    return {
      budget,
      allocation: {
        marketing: 0.4,
        development: 0.35,
        operations: 0.15,
        growth: 0.1
      }
    };
  }

  /**
   * Generate focus timeline
   */
  generateFocusTimeline(project) {
    const intensity = project.priority === 'HIGH' ? 'aggressive' : 'steady';
    const duration = project.priority === 'HIGH' ? '12 weeks' : '8 weeks';
    
    return {
      intensity,
      duration,
      milestones: [
        { week: 2, milestone: "Marketing launch complete" },
        { week: 4, milestone: "Initial user acquisition target" },
        { week: 8, milestone: "Revenue growth milestone" },
        { week: parseInt(duration) || 8, milestone: "Full cycle review" }
      ]
    };
  }

  /**
   * Define expected outcomes
   */
  defineExpectedOutcomes(project) {
    return {
      userGrowth: Math.round(project.users * 1.5),
      revenueGrowth: Math.round(project.revenue * 1.3),
      engagementIncrease: "25%",
      marketExpansion: "2 new segments"
    };
  }

  /**
   * Set growth targets
   */
  setGrowthTargets(project) {
    return {
      users: Math.round(project.users * 2),
      revenue: Math.round(project.revenue * 1.5),
      growth: Math.min(project.growth + 10, 50),
      marketShare: "15%"
    };
  }

  /**
   * Setup growth monitoring
   */
  setupGrowthMonitoring(project) {
    return {
      metrics: ["User acquisition", "Revenue growth", "Engagement rate", "Market share"],
      frequency: "weekly",
      alerts: {
        userGrowthBelow: "10%",
        revenueDecline: "5%",
        engagementDrop: "15%"
      }
    };
  }

  /**
   * Define optimization strategy
   */
  defineOptimizationStrategy(project) {
    return {
      focus: project.growth > 15 ? "Scale operations" : "Accelerate growth",
      tactics: [
        "A/B testing marketing campaigns",
        "User experience optimization",
        "Conversion rate improvement",
        "Community building initiatives"
      ],
      reviewCycle: "bi-weekly"
    };
  }

  /**
   * Get cycle history and insights
   */
  getCycleHistory() {
    return {
      cycles: this.cycleHistory,
      currentFocus: this.currentFocus,
      totalCycles: this.cycleHistory.length,
      successRate: this.calculateCycleSuccessRate(),
      insights: this.generateCycleInsights()
    };
  }

  /**
   * Calculate cycle success rate
   */
  calculateCycleSuccessRate() {
    if (this.cycleHistory.length === 0) return 0;
    
    const successful = this.cycleHistory.filter(cycle => cycle.success).length;
    return (successful / this.cycleHistory.length * 100).toFixed(1);
  }

  /**
   * Generate insights from cycle history
   */
  generateCycleInsights() {
    const insights = [];
    
    if (this.cycleHistory.length > 0) {
      const lastCycle = this.cycleHistory[this.cycleHistory.length - 1];
      
      if (lastCycle.success) {
        insights.push("Last cycle completed successfully");
        insights.push(`Current focus: ${this.currentFocus?.name || 'None'}`);
      } else {
        insights.push("Last cycle failed - review error logs");
      }
      
      insights.push(`Overall success rate: ${this.calculateCycleSuccessRate()}%`);
    }
    
    return insights;
  }
}

module.exports = AutonomousStartupEngine;
