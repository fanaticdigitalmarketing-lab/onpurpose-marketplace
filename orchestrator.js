// 🔁 MASTER ORCHESTRATOR
// Coordinates all specialized agents in the multi-agent autonomous engineering system

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PlannerAgent = require('./plannerAgent');
const FixerAgent = require('./fixerAgent');
const ReviewerAgent = require('./reviewerAgent');
const TesterAgent = require('./testerAgent');
const GuardianAgent = require('./guardianAgent');
const PredictiveEngine = require('./predictiveEngine');
const MemoryGraph = require('./memoryGraph');
const SharedLearningSystem = require('./sharedLearningSystem');

class Orchestrator {
  constructor() {
    this.planner = new PlannerAgent();
    this.fixer = new FixerAgent();
    this.reviewer = new ReviewerAgent();
    this.tester = new TesterAgent();
    this.guardian = new GuardianAgent();
    
    this.predictiveEngine = new PredictiveEngine();
    this.memoryGraph = new MemoryGraph();
    this.sharedLearning = new SharedLearningSystem();
    
    this.results = {
      plannedTasks: [],
      fixAttempts: [],
      reviewResults: [],
      testResults: [],
      deploymentDecision: null,
      sharedIntelligence: {},
      systemHealth: 0
    };
  }

  async executeFullAutonomousCycle() {
    console.log('🔁 MULTI-AGENT AUTONOMOUS ENGINEERING SYSTEM');
    console.log('='.repeat(80));
    console.log('Planner + Fixer + Reviewer + Tester + Guardian agents collaborating\n');

    try {
      // Phase 1: Load intelligence systems
      console.log('🧬 Phase 1 - Loading Intelligence Systems');
      await this.loadIntelligenceSystems();

      // Phase 2: Predict issues and detect real issues
      console.log('🔮 Phase 2 - Predictive Issue Detection');
      const predictions = await this.predictIssues();
      
      console.log('🔍 Phase 3 - Real Issue Detection');
      const realIssues = await this.detectRealIssues();
      
      const allIssues = [...predictions, ...realIssues];

      // Phase 3: Planner creates task assignments
      console.log('🧠 Phase 4 - Agent Task Planning');
      const tasks = this.planner.planTasks(allIssues, predictions);
      this.results.plannedTasks = tasks;

      // Phase 4: Execute tasks through agent pipeline
      console.log('🤖 Phase 5 - Multi-Agent Task Execution');
      await this.executeAgentPipeline(tasks);

      // Phase 5: Guardian final validation
      console.log('🛡 Phase 6 - Guardian Final Validation');
      await this.guardianValidation();

      // Phase 6: Update shared intelligence
      console.log('🧬 Phase 7 - Shared Intelligence Updates');
      await this.updateSharedIntelligence();

      // Phase 7: Generate final report
      console.log('📊 Phase 8 - Final Report Generation');
      this.generateFinalReport();

      return this.results;

    } catch (error) {
      console.error('💥 Multi-agent system failed:', error.message);
      throw error;
    }
  }

  async loadIntelligenceSystems() {
    try {
      // Load shared learning
      const localRules = this.loadLocalRules();
      this.sharedLearning.mergeWithLocalRules(localRules);
      
      console.log(`📚 Loaded ${this.sharedLearning.sharedData.ruleClusters.length} shared learning clusters`);
      console.log(`🧬 Memory graph: ${this.memoryGraph.graph.nodes.length} nodes, ${this.memoryGraph.graph.edges.length} edges`);
      
      this.results.sharedIntelligence = {
        sharedLearning: this.sharedLearning.sharedData.ruleClusters.length,
        memoryGraph: this.memoryGraph.graph.nodes.length,
        memoryEdges: this.memoryGraph.graph.edges.length
      };
      
    } catch (error) {
      console.error('Error loading intelligence systems:', error.message);
    }
  }

  loadLocalRules() {
    try {
      if (fs.existsSync('autonomous-rules.json')) {
        const data = JSON.parse(fs.readFileSync('autonomous-rules.json', 'utf8'));
        return data.uniqueRules || [];
      }
    } catch (error) {
      console.error('Error loading local rules:', error.message);
    }
    return [];
  }

  async predictIssues() {
    try {
      const predictions = await this.predictiveEngine.predictIssues(process.cwd());
      
      console.log(`🔮 Predicted ${predictions.length} issues before occurrence`);
      
      return predictions;
    } catch (error) {
      console.error('Error in predictive analysis:', error.message);
      return [];
    }
  }

  async detectRealIssues() {
    const issues = [];
    const files = this.getScanFiles();
    
    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const fileIssues = this.analyzeFile(file, content);
        issues.push(...fileIssues);
      } catch (error) {
        console.error(`Error analyzing ${file}:`, error.message);
      }
    });
    
    console.log(`🔍 Detected ${issues.length} real issues`);
    return issues;
  }

  getScanFiles() {
    return [
      'server.js',
      'index.html',
      'frontend/index.html',
      'frontend/dashboard.html',
      'package.json'
    ].filter(file => fs.existsSync(file));
  }

  analyzeFile(file, content) {
    const issues = [];
    
    if (file.endsWith('.js')) {
      // Check for missing try-catch
      const asyncRoutes = content.match(/app\.(get|post|put|delete)\s*\([^)]+\)\s*,\s*async/g) || [];
      asyncRoutes.forEach((route, index) => {
        const routeIndex = content.indexOf(route);
        const contextStart = Math.max(0, routeIndex - 5);
        const contextEnd = Math.min(content.length, routeIndex + 500);
        const context = content.substring(contextStart, contextEnd);
        
        if (!context.includes('try') || !context.includes('catch')) {
          issues.push({
            type: 'missing_try_catch',
            file,
            description: 'Async route without try-catch',
            severity: 'high',
            lineNumbers: [this.getLineNumber(content, routeIndex)]
          });
        }
      });
      
      // Check for console.error
      const consoleErrors = content.match(/console\.error/g) || [];
      if (consoleErrors.length > 0) {
        issues.push({
          type: 'console_error',
          file,
          description: 'Console.error statements found',
          count: consoleErrors.length,
          severity: 'medium'
        });
      }
    }
    
    if (file.endsWith('.html')) {
      // Check for missing charset
      if (!content.includes('charset')) {
        issues.push({
          type: 'missing_charset',
          file,
          description: 'Missing charset meta tag',
          severity: 'medium'
        });
      }
    }
    
    return issues;
  }

  getLineNumber(content, index) {
    const beforeIndex = content.substring(0, index);
    return beforeIndex.split('\n').length;
  }

  async executeAgentPipeline(tasks) {
    console.log(`🤖 Executing ${tasks.length} tasks through agent pipeline`);
    
    for (const task of tasks) {
      await this.executeTask(task);
    }
  }

  async executeTask(task) {
    console.log(`\n🤖 Executing task: ${task.issue.type} in ${task.issue.file} (priority: ${task.priority})`);
    
    const taskResult = {
      taskId: task.id,
      issue: task.issue,
      agent: task.assignedAgent,
      strategy: task.strategy,
      startTime: new Date().toISOString(),
      success: false,
      fixResult: null,
      reviewResult: null,
      testResult: null,
      applied: false,
      prCreated: false,
      autoMerged: false
    };

    try {
      // Step 1: Fixer generates fix
      if (task.assignedAgent === 'fixer') {
        const fileContent = fs.readFileSync(task.issue.file, 'utf8');
        taskResult.fixResult = await this.fixer.generateFix(task.issue, fileContent);
        
        if (!taskResult.fixResult.success) {
          console.log(`❌ Fixer failed: ${taskResult.fixResult.reason}`);
          this.results.fixAttempts.push(taskResult);
          return;
        }
        
        console.log(`✅ Fixer generated fix (confidence: ${(taskResult.fixResult.confidence * 100).toFixed(1)}%)`);
      }

      // Step 2: Reviewer validates fix
      if (taskResult.fixResult && taskResult.fixResult.success) {
        taskResult.reviewResult = await this.reviewer.reviewFix(
          taskResult.fixResult.originalCode,
          taskResult.fixResult.updatedCode,
          task.issue
        );
        
        if (!taskResult.reviewResult.approved) {
          console.log(`❌ Reviewer rejected fix (score: ${(taskResult.reviewResult.overallScore * 100).toFixed(1)}%)`);
          this.results.fixAttempts.push(taskResult);
          return;
        }
        
        console.log(`✅ Reviewer approved fix (score: ${(taskResult.reviewResult.overallScore * 100).toFixed(1)}%)`);
      }

      // Step 3: Tester generates and runs tests
      if (taskResult.reviewResult && taskResult.reviewResult.approved) {
        taskResult.testResult = await this.tester.generateAndRunTests(
          taskResult.fixResult.updatedCode,
          task.issue
        );
        
        if (!taskResult.testResult.success) {
          console.log(`❌ Tester failed (${taskResult.testResult.testResults.failed} tests failed)`);
          this.results.fixAttempts.push(taskResult);
          return;
        }
        
        console.log(`✅ Tester passed (${taskResult.testResult.testResults.passed}/${taskResult.testResult.testResults.total} tests)`);
      }

      // Step 4: Apply fix if all agents approve
      if (taskResult.testResult && taskResult.testResult.success) {
        await this.applyFix(task, taskResult);
        taskResult.success = true;
        console.log(`✅ Task completed successfully`);
      }

      this.results.fixAttempts.push(taskResult);

    } catch (error) {
      console.error(`❌ Task execution failed: ${error.message}`);
      taskResult.success = false;
      this.results.fixAttempts.push(taskResult);
    }
  }

  async applyFix(task, taskResult) {
    try {
      // Create backup
      const backupPath = this.createBackup(task.issue.file);
      
      // Apply fix
      fs.writeFileSync(task.issue.file, taskResult.fixResult.updatedCode);
      console.log(`✏️ Applied fix to: ${task.issue.file}`);
      
      taskResult.applied = true;
      taskResult.backupPath = backupPath;
      
      // Create PR (mock)
      taskResult.prCreated = await this.createPR(task, taskResult);
      
      // Auto-merge if safe
      if (taskResult.prCreated && this.shouldAutoMerge(task, taskResult)) {
        taskResult.autoMerged = await this.autoMergePR(taskResult.prCreated);
        console.log(`🔀 Auto-merged PR: #${taskResult.prCreated}`);
      }
      
      // Update memory graph
      this.memoryGraph.addMemory(task.issue, {
        type: 'solution',
        action: taskResult.fixResult.explanation,
        success: true,
        confidence: taskResult.fixResult.confidence
      });
      
    } catch (error) {
      console.error(`❌ Failed to apply fix: ${error.message}`);
      
      // Rollback if needed
      if (taskResult.backupPath) {
        this.rollbackFile(taskResult.backupPath, task.issue.file);
      }
      
      throw error;
    }
  }

  createBackup(filePath) {
    const timestamp = Date.now();
    const backupDir = 'agent-backups';
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupPath = path.join(backupDir, `backup_${timestamp}_${path.basename(filePath)}`);
    
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, backupPath);
      console.log(`📸 Created backup: ${backupPath}`);
    }
    
    return backupPath;
  }

  rollbackFile(backupPath, originalPath) {
    try {
      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, originalPath);
        console.log(`🔄 Rolled back: ${originalPath}`);
      }
    } catch (error) {
      console.error(`Error rolling back ${originalPath}:`, error.message);
    }
  }

  async createPR(task, taskResult) {
    // Mock PR creation
    const prNumber = Math.floor(Math.random() * 10000);
    console.log(`🎯 Created PR: #${prNumber}`);
    return prNumber;
  }

  shouldAutoMerge(task, taskResult) {
    // Auto-merge if all agents approve and confidence is high
    return taskResult.fixResult.confidence > 0.85 &&
           taskResult.reviewResult.overallScore > 0.8 &&
           taskResult.testResult.success &&
           task.priority >= 70;
  }

  async autoMergePR(prNumber) {
    // Mock auto-merge
    console.log(`🔀 Auto-merged PR: #${prNumber}`);
    return true;
  }

  async guardianValidation() {
    console.log('🛡 Guardian performing final validation...');
    
    try {
      // Extract results for guardian
      const fixResults = this.results.fixAttempts
        .filter(task => task.fixResult)
        .map(task => task.fixResult);
      
      const reviewResults = this.results.fixAttempts
        .filter(task => task.reviewResult)
        .map(task => task.reviewResult);
      
      const testResults = this.results.fixAttempts
        .filter(task => task.testResult)
        .map(task => task.testResult.testResults);
      
      const systemHealth = this.calculateSystemHealth();
      
      // Run guardian validation
      const guardianResult = await this.guardian.validateDeployment(
        fixResults,
        reviewResults,
        testResults,
        systemHealth
      );
      
      this.results.deploymentDecision = guardianResult;
      
      console.log(`🛡 Guardian decision: ${guardianResult.deploymentDecision}`);
      console.log(`🛡 Overall score: ${(guardianResult.overallScore * 100).toFixed(1)}%`);
      
      if (guardianResult.blockers.length > 0) {
        console.log(`🚫 Blockers:`);
        guardianResult.blockers.forEach(blocker => console.log(`   - ${blocker}`));
      }
      
      if (guardianResult.warnings.length > 0) {
        console.log(`⚠️ Warnings:`);
        guardianResult.warnings.forEach(warning => console.log(`   - ${warning}`));
      }
      
      return guardianResult;
      
    } catch (error) {
      console.error('❌ Guardian validation failed:', error.message);
      return {
        approved: false,
        deploymentDecision: 'FAILED',
        blockers: [`Guardian validation error: ${error.message}`],
        warnings: []
      };
    }
  }

  calculateSystemHealth() {
    const memoryStats = this.memoryGraph.getGraphStatistics();
    const sharedStats = this.sharedLearning.sharedData.globalStats;
    
    let healthScore = 50; // Base score
    
    // Memory graph health
    if (memoryStats.averageSuccessRate > 0.8) healthScore += 20;
    if (memoryStats.averageWeight > 0.7) healthScore += 10;
    
    // Shared learning health
    if (sharedStats.averageSuccessRate > 0.8) healthScore += 15;
    if (sharedStats.contributingProjects.length > 1) healthScore += 5;
    
    return {
      score: Math.min(100, healthScore),
      status: healthScore > 80 ? 'EXCELLENT' : healthScore > 60 ? 'GOOD' : 'FAIR',
      components: {
        memoryGraph: {
          nodes: memoryStats.totalNodes,
          edges: memoryStats.totalEdges,
          averageSuccessRate: memoryStats.averageSuccessRate
        },
        sharedLearning: {
          totalRules: sharedStats.totalRules,
          averageSuccessRate: sharedStats.averageSuccessRate,
          contributingProjects: sharedStats.contributingProjects.length
        }
      }
    };
  }

  async updateSharedIntelligence() {
    try {
      // Update shared learning with successful fixes
      const successfulFixes = this.results.fixAttempts.filter(task => task.success);
      
      successfulFixes.forEach(task => {
        this.sharedLearning.updateSharedLearning({
          type: task.issue.type,
          pattern: task.issue.description,
          action: task.fixResult.explanation,
          successRate: task.fixResult.confidence,
          usageCount: 1
        });
      });
      
      // Update results
      this.results.sharedIntelligence.updatedRules = successfulFixes.length;
      this.results.systemHealth = this.calculateSystemHealth().score;
      
      console.log(`🧬 Updated shared learning with ${successfulFixes.length} new rules`);
      
    } catch (error) {
      console.error('Error updating shared intelligence:', error.message);
    }
  }

  generateFinalReport() {
    console.log('\n📊 MULTI-AGENT AUTONOMOUS ENGINEERING SYSTEM REPORT');
    console.log('='.repeat(80));
    
    console.log('\n🧠 PLANNED TASKS:');
    this.results.plannedTasks.forEach(task => {
      console.log(`   📋 ${task.issue.type} in ${task.issue.file} (priority: ${task.priority}, agent: ${task.assignedAgent})`);
    });
    
    console.log('\n🔧 FIX ATTEMPTS:');
    const successfulFixes = this.results.fixAttempts.filter(task => task.success);
    const failedFixes = this.results.fixAttempts.filter(task => !task.success);
    
    successfulFixes.forEach(fix => {
      console.log(`   ✅ ${fix.issue.type} in ${fix.issue.file} (confidence: ${(fix.fixResult.confidence * 100).toFixed(1)}%)`);
    });
    
    failedFixes.forEach(fix => {
      console.log(`   ❌ ${fix.issue.type} in ${fix.issue.file} (${fix.fixResult?.reason || 'Unknown failure'})`);
    });
    
    console.log('\n🔍 REVIEW RESULTS:');
    this.results.fixAttempts.forEach(task => {
      if (task.reviewResult) {
        console.log(`   ${task.reviewResult.approved ? '✅' : '❌'} ${task.issue.type} (score: ${(task.reviewResult.overallScore * 100).toFixed(1)}%)`);
      }
    });
    
    console.log('\n🧪 TEST RESULTS:');
    this.results.fixAttempts.forEach(task => {
      if (task.testResult) {
        const testResults = task.testResult.testResults;
        console.log(`   ${task.testResult.success ? '✅' : '❌'} ${task.issue.type} (${testResults.passed}/${testResults.total} tests)`);
      }
    });
    
    console.log('\n🛡 DEPLOYMENT DECISION:');
    if (this.results.deploymentDecision) {
      console.log(`   ${this.results.deploymentDecision.deploymentDecision}`);
      console.log(`   Score: ${(this.results.deploymentDecision.overallScore * 100).toFixed(1)}%`);
      
      if (this.results.deploymentDecision.blockers.length > 0) {
        console.log('   Blockers:');
        this.results.deploymentDecision.blockers.forEach(blocker => {
          console.log(`     - ${blocker}`);
        });
      }
    }
    
    console.log('\n🧠 SHARED INTELLIGENCE:');
    console.log(`   📚 Shared Learning: ${this.results.sharedIntelligence.sharedLearning} clusters`);
    console.log(`   🧬 Memory Graph: ${this.results.sharedIntelligence.memoryGraph} nodes`);
    console.log(`   🔄 Updated Rules: ${this.results.sharedIntelligence.updatedRules || 0}`);
    
    console.log(`\n🛡 SYSTEM HEALTH: ${this.results.systemHealth.toFixed(1)}/100`);
    
    // Save comprehensive report
    this.saveComprehensiveReport();
  }

  saveComprehensiveReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      execution: 'multi-agent-autonomous-engineering-system',
      results: this.results,
      agentPerformance: this.calculateAgentPerformance(),
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime()
      }
    };
    
    try {
      fs.writeFileSync('multi-agent-report.json', JSON.stringify(reportData, null, 2));
      console.log('\n📄 Comprehensive report saved to: multi-agent-report.json');
    } catch (error) {
      console.error('Error saving report:', error.message);
    }
  }

  calculateAgentPerformance() {
    const performance = {
      planner: {
        tasksPlanned: this.results.plannedTasks.length,
        averagePriority: this.calculateAveragePriority()
      },
      fixer: {
        attempts: this.results.fixAttempts.length,
        successRate: this.calculateFixerSuccessRate(),
        averageConfidence: this.calculateAverageConfidence()
      },
      reviewer: {
        reviews: this.results.fixAttempts.filter(t => t.reviewResult).length,
        approvalRate: this.calculateApprovalRate(),
        averageScore: this.calculateAverageReviewScore()
      },
      tester: {
        testSuites: this.results.fixAttempts.filter(t => t.testResult).length,
        successRate: this.calculateTestSuccessRate(),
        averageCoverage: this.calculateAverageCoverage()
      },
      guardian: {
        decision: this.results.deploymentDecision?.deploymentDecision || 'UNKNOWN',
        score: this.results.deploymentDecision?.overallScore || 0,
        blockers: this.results.deploymentDecision?.blockers?.length || 0
      }
    };
    
    return performance;
  }

  calculateAveragePriority() {
    if (this.results.plannedTasks.length === 0) return 0;
    const total = this.results.plannedTasks.reduce((sum, task) => sum + task.priority, 0);
    return total / this.results.plannedTasks.length;
  }

  calculateFixerSuccessRate() {
    const fixerTasks = this.results.fixAttempts.filter(task => task.fixResult);
    if (fixerTasks.length === 0) return 0;
    const successful = fixerTasks.filter(task => task.fixResult.success).length;
    return (successful / fixerTasks.length) * 100;
  }

  calculateAverageConfidence() {
    const successfulFixes = this.results.fixAttempts.filter(task => task.fixResult?.success);
    if (successfulFixes.length === 0) return 0;
    const total = successfulFixes.reduce((sum, task) => sum + task.fixResult.confidence, 0);
    return total / successfulFixes.length;
  }

  calculateApprovalRate() {
    const reviews = this.results.fixAttempts.filter(task => task.reviewResult);
    if (reviews.length === 0) return 0;
    const approved = reviews.filter(task => task.reviewResult.approved).length;
    return (approved / reviews.length) * 100;
  }

  calculateAverageReviewScore() {
    const reviews = this.results.fixAttempts.filter(task => task.reviewResult);
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, task) => sum + task.reviewResult.overallScore, 0);
    return total / reviews.length;
  }

  calculateTestSuccessRate() {
    const tests = this.results.fixAttempts.filter(task => task.testResult);
    if (tests.length === 0) return 0;
    const successful = tests.filter(task => task.testResult.success).length;
    return (successful / tests.length) * 100;
  }

  calculateAverageCoverage() {
    const tests = this.results.fixAttempts.filter(task => task.testResult?.testResults);
    if (tests.length === 0) return 0;
    const total = tests.reduce((sum, task) => sum + (task.testResult.testResults.coverage || 0), 0);
    return total / tests.length;
  }
}

// Execute the multi-agent autonomous system
const orchestrator = new Orchestrator();

orchestrator.executeFullAutonomousCycle().then((results) => {
  console.log('\n🎉 MULTI-AGENT AUTONOMOUS ENGINEERING SYSTEM CYCLE COMPLETE');
  console.log(`🧠 Planned Tasks: ${results.plannedTasks.length}`);
  console.log(`🔧 Successful Fixes: ${results.fixAttempts.filter(t => t.success).length}`);
  console.log(`🔍 Approved Reviews: ${results.fixAttempts.filter(t => t.reviewResult?.approved).length}`);
  console.log(`🧪 Passed Tests: ${results.fixAttempts.filter(t => t.testResult?.success).length}`);
  console.log(`🛡 Deployment Decision: ${results.deploymentDecision?.deploymentDecision || 'UNKNOWN'}`);
  console.log(`🧠 System Health: ${results.systemHealth.toFixed(1)}/100`);
  
  const agentPerformance = orchestrator.calculateAgentPerformance();
  console.log('\n📊 AGENT PERFORMANCE:');
  console.log(`   🧠 Planner: ${agentPerformance.planner.tasksPlanned} tasks planned`);
  console.log(`   🔧 Fixer: ${agentPerformance.fixer.successRate.toFixed(1)}% success rate`);
  console.log(`   🔍 Reviewer: ${agentPerformance.reviewer.approvalRate.toFixed(1)}% approval rate`);
  console.log(`   🧪 Tester: ${agentPerformance.tester.successRate.toFixed(1)}% success rate`);
  console.log(`   🛡 Guardian: ${agentPerformance.guardian.decision} (${(agentPerformance.guardian.score * 100).toFixed(1)}% score)`);
  
  if (results.deploymentDecision?.approved) {
    console.log('\n✅ MULTI-AGENT SYSTEM DEPLOYMENT APPROVED');
    console.log('🚀 The collaborative AI engineering team has successfully prepared the system for deployment.');
  } else {
    console.log('\n⚠️ MULTI-AGENT SYSTEM DEPLOYMENT BLOCKED');
    console.log('📋 Review guardian blockers and agent recommendations.');
  }
}).catch((error) => {
  console.error('\n💥 MULTI-AGENT AUTONOMOUS ENGINEERING SYSTEM FAILED:', error.message);
  process.exit(1);
});

module.exports = Orchestrator;
