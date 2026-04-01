// 🔁 SELF-IMPROVING AUTONOMOUS ENGINEERING SYSTEM
// Multi-agent system that learns and evolves over time

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SelfImprovingFixerAgent = require('./selfImprovingFixerAgent');
const AgentMemorySystem = require('./agentMemorySystem');
const PredictiveEngine = require('./predictiveEngine');
const MemoryGraph = require('./memoryGraph');
const SharedLearningSystem = require('./sharedLearningSystem');

class SelfImprovingOrchestrator {
  constructor() {
    this.memorySystem = new AgentMemorySystem();
    this.fixer = new SelfImprovingFixerAgent();
    
    // Other agents would also be self-improving versions
    this.predictiveEngine = new PredictiveEngine();
    this.memoryGraph = new MemoryGraph();
    this.sharedLearning = new SharedLearningSystem();
    
    this.results = {
      plannedTasks: [],
      fixAttempts: [],
      agentPerformance: {},
      learningMetrics: {},
      systemEvolution: {}
    };
  }

  async executeSelfImprovingCycle() {
    console.log('🧠 SELF-IMPROVING AUTONOMOUS ENGINEERING SYSTEM');
    console.log('='.repeat(80));
    console.log('Agents learn, evolve, and improve with every execution\n');

    try {
      // Phase 1: Load agent memory and learning data
      console.log('🧬 Phase 1 - Loading Agent Memory & Learning Data');
      await this.loadAgentMemory();

      // Phase 2: Predict issues with learned patterns
      console.log('🔮 Phase 2 - Enhanced Predictive Analysis');
      const predictions = await this.predictWithLearning();
      
      console.log('🔍 Phase 3 - Real Issue Detection');
      const realIssues = await this.detectRealIssues();
      
      const allIssues = [...predictions, ...realIssues];

      // Phase 3: Plan tasks with evolved strategies
      console.log('🧠 Phase 4 - Adaptive Task Planning');
      const tasks = this.planWithEvolution(allIssues);
      this.results.plannedTasks = tasks;

      // Phase 4: Execute with self-improving agents
      console.log('🤖 Phase 5 - Self-Improving Agent Execution');
      await this.executeWithLearning(tasks);

      // Phase 5: Update global learning and evolve strategies
      console.log('🧬 Phase 6 - Global Learning & Strategy Evolution');
      await this.updateGlobalLearning();

      // Phase 6: Generate evolution report
      console.log('📊 Phase 7 - Evolution Report Generation');
      this.generateEvolutionReport();

      return this.results;

    } catch (error) {
      console.error('💥 Self-improving system failed:', error.message);
      throw error;
    }
  }

  async loadAgentMemory() {
    try {
      // Load shared learning
      const localRules = this.loadLocalRules();
      this.sharedLearning.mergeWithLocalRules(localRules);
      
      // Load agent performance data
      const agentPerformance = this.memorySystem.getAllAgentPerformance();
      
      console.log(`📚 Loaded agent memory for ${Object.keys(agentPerformance).length} agents`);
      console.log(`🧬 Memory graph: ${this.memoryGraph.graph.nodes.length} nodes, ${this.memoryGraph.graph.edges.length} edges`);
      
      this.results.agentPerformance = agentPerformance;
      this.results.learningMetrics = {
        sharedLearning: this.sharedLearning.sharedData.ruleClusters.length,
        memoryGraph: this.memoryGraph.graph.nodes.length,
        agentMemory: Object.keys(agentPerformance).length
      };
      
    } catch (error) {
      console.error('Error loading agent memory:', error.message);
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

  async predictWithLearning() {
    try {
      const predictions = await this.predictiveEngine.predictIssues(process.cwd());
      
      // Enhance predictions with learned patterns
      const enhancedPredictions = predictions.map(prediction => {
        const learnedPattern = this.findLearnedPattern(prediction.riskType);
        if (learnedPattern) {
          return {
            ...prediction,
            learnedConfidence: learnedPattern.successRate,
            recommendedStrategy: learnedPattern.bestStrategy,
            historicalOccurrences: learnedPattern.occurrences
          };
        }
        return prediction;
      });
      
      console.log(`🔮 Predicted ${enhancedPredictions.length} issues with learning enhancement`);
      
      return enhancedPredictions;
    } catch (error) {
      console.error('Error in predictive analysis:', error.message);
      return [];
    }
  }

  findLearnedPattern(riskType) {
    const patterns = this.memorySystem.memory.patterns.filter(p => p.type === riskType);
    if (patterns.length === 0) return null;
    
    // Return pattern with highest success rate
    return patterns.reduce((best, current) => 
      current.successRate > best.successRate ? current : best
    );
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
            lineNumbers: [this.getLineNumber(content, routeIndex)],
            learnedPattern: this.findLearnedPattern('missing_try_catch')
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
          severity: 'medium',
          learnedPattern: this.findLearnedPattern('console_error')
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
          severity: 'medium',
          learnedPattern: this.findLearnedPattern('missing_charset')
        });
      }
    }
    
    return issues;
  }

  getLineNumber(content, index) {
    const beforeIndex = content.substring(0, index);
    return beforeIndex.split('\n').length;
  }

  planWithEvolution(issues) {
    console.log(`🧠 Planning ${issues.length} tasks with evolved strategies`);
    
    const tasks = issues.map((issue, index) => {
      const task = {
        id: `task_${index + 1}`,
        issue: issue,
        priority: this.calculateEvolvedPriority(issue),
        assignedAgent: 'fixer', // Would be more sophisticated with all agents
        strategy: this.selectEvolvedStrategy(issue),
        learnedPattern: issue.learnedPattern,
        estimatedSuccess: this.estimateSuccess(issue),
        evolution: {
          basedOnLearning: !!issue.learnedPattern,
          confidenceBoost: issue.learnedPattern ? issue.learnedPattern.successRate * 0.2 : 0,
          strategyWeight: 1.0
        }
      };
      
      return task;
    });
    
    // Sort by evolved priority
    tasks.sort((a, b) => b.priority - a.priority);
    
    return tasks;
  }

  calculateEvolvedPriority(issue) {
    let priority = 50; // Base priority
    
    // Severity-based priority
    if (issue.severity === 'critical') priority += 40;
    else if (issue.severity === 'high') priority += 30;
    else if (issue.severity === 'medium') priority += 20;
    else if (issue.severity === 'low') priority += 10;
    
    // File-based priority
    if (issue.file === 'server.js') priority += 20;
    else if (issue.file.includes('index.html')) priority += 10;
    
    // Learning-based priority boost
    if (issue.learnedPattern) {
      priority += issue.learnedPattern.successRate * 15;
    }
    
    // Issue type priority
    const issueTypePriority = {
      'missing_try_catch': 25,
      'security_vulnerability': 30,
      'missing_form_validation': 15,
      'console_error': 10,
      'missing_charset': 5
    };
    
    if (issueTypePriority[issue.type]) {
      priority += issueTypePriority[issue.type];
    }
    
    return Math.min(100, priority);
  }

  selectEvolvedStrategy(issue) {
    // Get best strategy from memory
    const memoryStrategy = this.memorySystem.getBestStrategy('fixer', issue.type);
    
    if (memoryStrategy) {
      return {
        name: memoryStrategy.name,
        successRate: memoryStrategy.successRate,
        weight: memoryStrategy.weight,
        source: 'memory',
        confidence: memoryStrategy.successRate * memoryStrategy.weight
      };
    }
    
    // Fallback to default strategy
    return {
      name: 'default',
      successRate: 0.7,
      weight: 1.0,
      source: 'default',
      confidence: 0.7
    };
  }

  estimateSuccess(issue) {
    let successEstimate = 0.7; // Base estimate
    
    // Learning-based adjustment
    if (issue.learnedPattern) {
      successEstimate = issue.learnedPattern.successRate;
    }
    
    // File complexity adjustment
    if (issue.file === 'server.js') successEstimate -= 0.1;
    else if (issue.file.includes('index.html')) successEstimate += 0.05;
    
    // Issue type adjustment
    const issueTypeSuccess = {
      'missing_try_catch': 0.85,
      'missing_form_validation': 0.9,
      'console_error': 0.8,
      'missing_charset': 0.95,
      'security_vulnerability': 0.6,
      'hardcoded_secrets': 0.85
    };
    
    if (issueTypeSuccess[issue.type]) {
      successEstimate = (successEstimate + issueTypeSuccess[issue.type]) / 2;
    }
    
    return Math.min(1.0, Math.max(0, successEstimate));
  }

  async executeWithLearning(tasks) {
    console.log(`🤖 Executing ${tasks.length} tasks with self-improving agents`);
    
    for (const task of tasks) {
      await this.executeTaskWithLearning(task);
    }
  }

  async executeTaskWithLearning(task) {
    console.log(`\n🤖 Executing task: ${task.issue.type} in ${task.issue.file}`);
    console.log(`   🧠 Strategy: ${task.strategy.name} (success rate: ${(task.strategy.successRate * 100).toFixed(1)}%)`);
    console.log(`   📊 Estimated success: ${(task.estimatedSuccess * 100).toFixed(1)}%`);
    
    const taskResult = {
      taskId: task.id,
      issue: task.issue,
      strategy: task.strategy,
      startTime: new Date().toISOString(),
      success: false,
      fixResult: null,
      learning: {
        confidenceBefore: task.estimatedSuccess,
        confidenceAfter: 0,
        strategyEvolution: null
      }
    };

    try {
      // Execute fix with self-improving fixer
      const fileContent = fs.readFileSync(task.issue.file, 'utf8');
      taskResult.fixResult = await this.fixer.generateFix(task.issue, fileContent);
      
      if (taskResult.fixResult.success) {
        taskResult.success = true;
        taskResult.learning.confidenceAfter = taskResult.fixResult.confidence;
        
        // Apply fix
        await this.applyFix(task, taskResult);
        
        console.log(`✅ Task completed successfully`);
        console.log(`   📈 Confidence: ${(task.estimatedSuccess * 100).toFixed(1)}% → ${(taskResult.fixResult.confidence * 100).toFixed(1)}%`);
        
        // Record learning
        await this.recordTaskLearning(task, taskResult, true);
        
      } else {
        console.log(`❌ Fixer failed: ${taskResult.fixResult.reason}`);
        console.log(`   📉 Confidence: ${(task.estimatedSuccess * 100).toFixed(1)}% → 0%`);
        
        // Record learning from failure
        await this.recordTaskLearning(task, taskResult, false);
      }
      
      this.results.fixAttempts.push(taskResult);

    } catch (error) {
      console.error(`❌ Task execution failed: ${error.message}`);
      taskResult.success = false;
      await this.recordTaskLearning(task, taskResult, false);
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
      
      taskResult.backupPath = backupPath;
      
      // Update memory graph
      this.memoryGraph.addMemory(task.issue, {
        type: 'solution',
        action: taskResult.fixResult.explanation,
        success: true,
        confidence: taskResult.fixResult.confidence,
        strategy: task.strategy.name
      });
      
    } catch (error) {
      console.error(`❌ Failed to apply fix: ${error.message`);
      
      // Rollback if needed
      if (taskResult.backupPath) {
        this.rollbackFile(taskResult.backupPath, task.issue.file);
      }
      
      throw error;
    }
  }

  createBackup(filePath) {
    const timestamp = Date.now();
    const backupDir = 'self-improving-backups';
    
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

  async recordTaskLearning(task, taskResult, success) {
    // Update agent memory
    this.memorySystem.updateAgentPerformance('fixer', {
      success: success,
      strategy: task.strategy.name,
      issueType: task.issue.type,
      confidence: success ? taskResult.fixResult.confidence : 0,
      duration: Date.now() - new Date(taskResult.startTime).getTime(),
      reason: success ? null : taskResult.fixResult?.reason
    });
    
    // Update global patterns
    this.memorySystem.addGlobalPattern({
      type: task.issue.type,
      strategy: task.strategy.name,
      success: success,
      description: success ? 
        `Successfully fixed ${task.issue.type} using ${task.strategy.name}` :
        `Failed to fix ${task.issue.type} using ${task.strategy.name}: ${taskResult.fixResult?.reason}`
    });
    
    // Calculate learning metrics
    taskResult.learning.strategyEvolution = this.calculateStrategyEvolution(task, taskResult);
    
    console.log(`🧠 Recorded learning: ${success ? 'SUCCESS' : 'FAILURE'}`);
  }

  calculateStrategyEvolution(task, taskResult) {
    const beforeConfidence = task.learning.confidenceBefore;
    const afterConfidence = taskResult.learning.confidenceAfter;
    
    return {
      strategy: task.strategy.name,
      confidenceChange: afterConfidence - beforeConfidence,
      performanceImprovement: afterConfidence > beforeConfidence,
      learningDirection: afterConfidence > beforeConfidence ? 'positive' : 'negative',
      magnitude: Math.abs(afterConfidence - beforeConfidence)
    };
  }

  async updateGlobalLearning() {
    console.log('🧬 Updating global learning and evolving strategies...');
    
    try {
      // Update shared learning with successful fixes
      const successfulFixes = this.results.fixAttempts.filter(task => task.success);
      
      successfulFixes.forEach(task => {
        this.sharedLearning.updateSharedLearning({
          type: task.issue.type,
          pattern: task.issue.description,
          action: task.fixResult.explanation,
          successRate: task.fixResult.confidence,
          usageCount: 1,
          strategy: task.strategy.name
        });
      });
      
      // Update global metrics
      this.memorySystem.updateGlobalMetrics(this.results);
      
      // Calculate system evolution metrics
      this.results.systemEvolution = this.calculateSystemEvolution();
      
      console.log(`🧬 Updated shared learning with ${successfulFixes.length} new rules`);
      console.log(`📊 System evolution: ${this.results.systemEvolution.improvementRate > 0 ? 'IMPROVING' : 'STABLE'}`);
      
    } catch (error) {
      console.error('Error updating global learning:', error.message);
    }
  }

  calculateSystemEvolution() {
    const globalMetrics = this.memorySystem.memory.globalMetrics;
    const agentPerformance = this.memorySystem.getAllAgentPerformance();
    
    // Calculate improvement rate
    const improvementRate = globalMetrics.improvementRate;
    
    // Calculate learning velocity
    const learningVelocity = this.calculateLearningVelocity();
    
    // Calculate strategy evolution
    const strategyEvolution = this.calculateStrategyEvolution();
    
    return {
      improvementRate: improvementRate,
      learningVelocity: learningVelocity,
      strategyEvolution: strategyEvolution,
      overallHealth: globalMetrics.systemHealth,
      totalCycles: globalMetrics.totalCycles,
      agentPerformance: agentPerformance
    };
  }

  calculateLearningVelocity() {
    // How quickly the system is learning
    const recentSuccess = this.memorySystem.getRecentSuccessRate();
    const overallSuccess = this.memorySystem.memory.globalMetrics.overallSuccessRate;
    
    return recentSuccess - overallSuccess;
  }

  calculateStrategyEvolution() {
    // How strategies are evolving
    const strategies = this.memorySystem.memory.agents.fixer.strategies;
    
    const totalStrategies = strategies.length;
    const successfulStrategies = strategies.filter(s => s.successRate > 0.8).length;
    const evolvingStrategies = strategies.filter(s => s.weight > 1.2).length;
    
    return {
      total: totalStrategies,
      successful: successfulStrategies,
      evolving: evolvingStrategies,
      evolutionRate: evolvingStrategies / totalStrategies
    };
  }

  generateEvolutionReport() {
    console.log('\n📊 SELF-IMPROVING SYSTEM EVOLUTION REPORT');
    console.log('='.repeat(80));
    
    console.log('\n🧠 PLANNED TASKS (WITH LEARNING):');
    this.results.plannedTasks.forEach(task => {
      console.log(`   📋 ${task.issue.type} in ${task.issue.file}`);
      console.log(`      🧠 Strategy: ${task.strategy.name} (${(task.strategy.successRate * 100).toFixed(1)}% success)`);
      console.log(`      📊 Estimated success: ${(task.estimatedSuccess * 100).toFixed(1)}%`);
      if (task.learnedPattern) {
        console.log(`      🧬 Learned pattern: ${task.learnedPattern.occurrences} occurrences`);
      }
    });
    
    console.log('\n🔧 FIX ATTEMPTS (WITH LEARNING):');
    const successfulFixes = this.results.fixAttempts.filter(task => task.success);
    const failedFixes = this.results.fixAttempts.filter(task => !task.success);
    
    successfulFixes.forEach(fix => {
      console.log(`   ✅ ${fix.issue.type} in ${fix.issue.file}`);
      console.log(`      📈 Confidence: ${(fix.learning.confidenceBefore * 100).toFixed(1)}% → ${(fix.learning.confidenceAfter * 100).toFixed(1)}%`);
      console.log(`      🧠 Strategy: ${fix.strategy.name} (${(fix.strategy.successRate * 100).toFixed(1)}% success)`);
      if (fix.learning.strategyEvolution) {
        console.log(`      📊 Evolution: ${fix.learning.strategyEvolution.learningDirection} (${(fix.learning.strategyEvolution.magnitude * 100).toFixed(1)}% change)`);
      }
    });
    
    failedFixes.forEach(fix => {
      console.log(`   ❌ ${fix.issue.type} in ${fix.issue.file}`);
      console.log(`      📉 Confidence: ${(fix.learning.confidenceBefore * 100).toFixed(1)}% → 0%`);
      console.log(`      🧠 Strategy: ${fix.strategy.name} (${(fix.strategy.successRate * 100).toFixed(1)}% success)`);
      console.log(`      ❌ Reason: ${fix.fixResult.reason}`);
    });
    
    console.log('\n🧬 SYSTEM EVOLUTION:');
    const evolution = this.results.systemEvolution;
    console.log(`   📈 Improvement Rate: ${(evolution.improvementRate * 100).toFixed(2)}%`);
    console.log(`   🚀 Learning Velocity: ${(evolution.learningVelocity * 100).toFixed(2)}%`);
    console.log(`   🧬 Strategy Evolution: ${(evolution.strategyEvolution.evolutionRate * 100).toFixed(1)}%`);
    console.log(`   🛡 System Health: ${(evolution.overallHealth * 100).toFixed(1)}%`);
    console.log(`   🔄 Total Cycles: ${evolution.totalCycles}`);
    
    console.log('\n🧠 SHARED INTELLIGENCE:');
    console.log(`   📚 Shared Learning: ${this.results.learningMetrics.sharedLearning} clusters`);
    console.log(`   🧬 Memory Graph: ${this.results.learningMetrics.memoryGraph} nodes`);
    console.log(`   🤖 Agent Memory: ${this.results.learningMetrics.agentMemory} agents`);
    
    // Agent performance
    console.log('\n📊 AGENT PERFORMANCE:');
    const fixerPerformance = this.memorySystem.getAgentPerformance('fixer');
    console.log(`   🔧 Fixer:`);
    console.log(`      📈 Success Rate: ${(fixerPerformance.successRate * 100).toFixed(1)}%`);
    console.log(`      🧠 Top Strategy: ${fixerPerformance.topStrategies[0]?.name || 'N/A'}`);
    console.log(`      ⚖️ Average Confidence: ${(fixerPerformance.averageConfidence * 100).toFixed(1)}%`);
    
    // Save comprehensive evolution report
    this.saveEvolutionReport();
  }

  saveEvolutionReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      execution: 'self-improving-autonomous-engineering-system',
      results: this.results,
      systemEvolution: this.results.systemEvolution,
      agentPerformance: this.memorySystem.getAllAgentPerformance(),
      learningReport: this.memorySystem.generateLearningReport(),
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime()
      }
    };
    
    try {
      fs.writeFileSync('self-improving-report.json', JSON.stringify(reportData, null, 2));
      console.log('\n📄 Evolution report saved to: self-improving-report.json');
    } catch (error) {
      console.error('Error saving evolution report:', error.message);
    }
  }

  getPerformanceMetrics() {
    return {
      systemEvolution: this.results.systemEvolution,
      agentPerformance: this.memorySystem.getAllAgentPerformance(),
      learningMetrics: this.results.learningMetrics,
      fixerMetrics: this.fixer.getPerformanceMetrics(),
      adaptiveThresholds: this.memorySystem.getAdaptiveThresholds('fixer')
    };
  }
}

// Execute the self-improving autonomous system
const orchestrator = new SelfImprovingOrchestrator();

orchestrator.executeSelfImprovingCycle().then((results) => {
  console.log('\n🎉 SELF-IMPROVING AUTONOMOUS ENGINEERING SYSTEM CYCLE COMPLETE');
  console.log(`🧠 Planned Tasks: ${results.plannedTasks.length}`);
  console.log(`🔧 Successful Fixes: ${results.fixAttempts.filter(t => t.success).length}`);
  console.log(`❌ Failed Fixes: ${results.fixAttempts.filter(t => !t.success).length}`);
  console.log(`🧬 System Evolution: ${results.systemEvolution.improvementRate > 0 ? 'IMPROVING' : 'STABLE'}`);
  console.log(`📈 Improvement Rate: ${(results.systemEvolution.improvementRate * 100).toFixed(2)}%`);
  console.log(`🛡 System Health: ${(results.systemEvolution.overallHealth * 100).toFixed(1)}%`);
  
  const evolution = results.systemEvolution;
  console.log('\n📊 SYSTEM EVOLUTION METRICS:');
  console.log(`   🚀 Learning Velocity: ${(evolution.learningVelocity * 100).toFixed(2)}%`);
  console.log(`   🧬 Strategy Evolution: ${(evolution.strategyEvolution.evolutionRate * 100).toFixed(1)}%`);
  console.log(`   🔄 Total Cycles: ${evolution.totalCycles}`);
  
  if (evolution.improvementRate > 0) {
    console.log('\n✅ SYSTEM IS IMPROVING');
    console.log('🧠 The self-improving autonomous system is getting smarter and more effective.');
  } else {
    console.log('\n⚠️ SYSTEM IS STABLE');
    console.log('📊 System performance is consistent - monitoring for improvement opportunities.');
  }
}).catch((error) => {
  console.error('\n💥 SELF-IMPROVING AUTONOMOUS ENGINEERING SYSTEM FAILED:', error.message);
  process.exit(1);
});

module.exports = SelfImprovingOrchestrator;
