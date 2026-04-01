// 📦 GLOBAL MEMORY SYSTEM
// Tracks agent performance, strategies, and learning patterns

const fs = require('fs');
const path = require('path');

class AgentMemorySystem {
  constructor() {
    this.memoryFile = 'agentMemory.json';
    this.memory = this.loadMemory();
  }

  loadMemory() {
    try {
      if (fs.existsSync(this.memoryFile)) {
        const data = fs.readFileSync(this.memoryFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading agent memory:', error.message);
    }
    
    // Return default structure
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      agents: {
        fixer: {
          attempts: 0,
          successes: 0,
          failures: 0,
          strategies: [],
          lastUpdated: new Date().toISOString(),
          performance: {
            successRate: 0,
            averageConfidence: 0,
            averageTime: 0,
            failurePatterns: []
          }
        },
        reviewer: {
          attempts: 0,
          successes: 0,
          failures: 0,
          strategies: [],
          lastUpdated: new Date().toISOString(),
          performance: {
            successRate: 0,
            averageScore: 0,
            averageTime: 0,
            rejectionReasons: []
          }
        },
        tester: {
          attempts: 0,
          successes: 0,
          failures: 0,
          strategies: [],
          lastUpdated: new Date().toISOString(),
          performance: {
            successRate: 0,
            averageCoverage: 0,
            averageTime: 0,
            commonFailures: []
          }
        },
        planner: {
          attempts: 0,
          successes: 0,
          failures: 0,
          strategies: [],
          lastUpdated: new Date().toISOString(),
          performance: {
            successRate: 0,
            averagePriority: 0,
            averageTime: 0,
            planningErrors: []
          }
        },
        guardian: {
          attempts: 0,
          successes: 0,
          failures: 0,
          strategies: [],
          lastUpdated: new Date().toISOString(),
          performance: {
            approvalRate: 0,
            averageScore: 0,
            averageTime: 0,
            blockingReasons: []
          }
        }
      },
      patterns: [],
      globalMetrics: {
        totalCycles: 0,
        overallSuccessRate: 0,
        systemHealth: 0,
        improvementRate: 0
      }
    };
  }

  saveMemory() {
    try {
      this.memory.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.memoryFile, JSON.stringify(this.memory, null, 2));
      console.log('💾 Agent memory saved');
    } catch (error) {
      console.error('Error saving agent memory:', error.message);
    }
  }

  updateAgentPerformance(agentType, result) {
    const agent = this.memory.agents[agentType];
    if (!agent) return;

    // Update basic metrics
    agent.attempts++;
    if (result.success) {
      agent.successes++;
    } else {
      agent.failures++;
    }

    // Update performance metrics
    agent.performance.successRate = agent.successes / agent.attempts;
    
    // Update strategy performance
    if (result.strategy) {
      this.updateStrategyPerformance(agent, result.strategy, result.success);
    }

    // Update failure patterns
    if (!result.success && result.reason) {
      this.updateFailurePatterns(agent, result.reason, result.issueType);
    }

    // Update timing
    if (result.duration) {
      this.updateTimingMetrics(agent, result.duration);
    }

    agent.lastUpdated = new Date().toISOString();
    this.saveMemory();
  }

  updateStrategyPerformance(agent, strategy, success) {
    let strategyData = agent.strategies.find(s => s.name === strategy);
    
    if (!strategyData) {
      strategyData = {
        name: strategy,
        attempts: 0,
        successes: 0,
        failures: 0,
        successRate: 0,
        weight: 1.0,
        lastUsed: null,
        createdAt: new Date().toISOString()
      };
      agent.strategies.push(strategyData);
    }

    strategyData.attempts++;
    if (success) {
      strategyData.successes++;
    } else {
      strategyData.failures++;
    }

    strategyData.successRate = strategyData.successes / strategyData.attempts;
    strategyData.lastUsed = new Date().toISOString();

    // Adjust weight based on performance
    this.adjustStrategyWeight(strategyData);
  }

  adjustStrategyWeight(strategyData) {
    const baseWeight = 1.0;
    const performanceBonus = strategyData.successRate * 0.5;
    const recentBonus = this.getRecentPerformanceBonus(strategyData);
    
    strategyData.weight = Math.max(0.1, Math.min(3.0, baseWeight + performanceBonus + recentBonus));
  }

  getRecentPerformanceBonus(strategyData) {
    // Bonus for recent successes
    if (!strategyData.lastUsed) return 0;
    
    const daysSinceLastUse = (Date.now() - new Date(strategyData.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastUse < 7 && strategyData.successRate > 0.8) {
      return 0.3;
    }
    
    return 0;
  }

  updateFailurePatterns(agent, reason, issueType) {
    const pattern = `${reason}:${issueType}`;
    let patternData = agent.performance.failurePatterns.find(p => p.pattern === pattern);
    
    if (!patternData) {
      patternData = {
        pattern: pattern,
        count: 0,
        lastOccurrence: null
      };
      agent.performance.failurePatterns.push(patternData);
    }

    patternData.count++;
    patternData.lastOccurrence = new Date().toISOString();
  }

  updateTimingMetrics(agent, duration) {
    if (!agent.performance.averageTime) {
      agent.performance.averageTime = duration;
    } else {
      // Exponential moving average
      const alpha = 0.3;
      agent.performance.averageTime = alpha * duration + (1 - alpha) * agent.performance.averageTime;
    }
  }

  getBestStrategy(agentType, issueType) {
    const agent = this.memory.agents[agentType];
    if (!agent || agent.strategies.length === 0) {
      return null;
    }

    // Filter strategies by issue type if applicable
    let candidateStrategies = agent.strategies;
    
    if (issueType) {
      const issueSpecificStrategies = agent.strategies.filter(s => 
        s.issueTypes && s.issueTypes.includes(issueType)
      );
      
      if (issueSpecificStrategies.length > 0) {
        candidateStrategies = issueSpecificStrategies;
      }
    }

    // Sort by weighted score (success rate * weight * recent usage)
    candidateStrategies.sort((a, b) => {
      const scoreA = a.successRate * a.weight * this.getRecencyScore(a);
      const scoreB = b.successRate * b.weight * this.getRecencyScore(b);
      return scoreB - scoreA;
    });

    return candidateStrategies[0] || null;
  }

  getRecencyScore(strategyData) {
    if (!strategyData.lastUsed) return 0.5;
    
    const daysSinceLastUse = (Date.now() - new Date(strategyData.lastUsed).getTime()) / (1000 * 60 * 60 * 24);
    
    // Recent usage gets bonus, very old usage gets penalty
    if (daysSinceLastUse < 1) return 1.2;
    if (daysSinceLastUse < 7) return 1.0;
    if (daysSinceLastUse < 30) return 0.8;
    return 0.6;
  }

  addGlobalPattern(pattern) {
    const existingPattern = this.memory.patterns.find(p => p.type === pattern.type);
    
    if (existingPattern) {
      existingPattern.occurrences++;
      existingPattern.lastSeen = new Date().toISOString();
      
      // Update success rate
      if (pattern.success !== undefined) {
        const totalSuccess = (existingPattern.successRate * (existingPattern.occurrences - 1)) + (pattern.success ? 1 : 0);
        existingPattern.successRate = totalSuccess / existingPattern.occurrences;
      }
    } else {
      this.memory.patterns.push({
        ...pattern,
        occurrences: 1,
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString()
      });
    }
    
    this.saveMemory();
  }

  getFailurePatterns(agentType) {
    const agent = this.memory.agents[agentType];
    if (!agent) return [];
    
    return agent.performance.failurePatterns
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  getSuccessPatterns(agentType) {
    const agent = this.memory.agents[agentType];
    if (!agent) return [];
    
    return agent.strategies
      .filter(s => s.successRate > 0.7)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 10);
  }

  getAgentPerformance(agentType) {
    const agent = this.memory.agents[agentType];
    if (!agent) return null;
    
    return {
      ...agent.performance,
      strategies: agent.strategies.map(s => ({
        name: s.name,
        successRate: s.successRate,
        weight: s.weight,
        attempts: s.attempts
      })),
      topStrategies: agent.strategies
        .sort((a, b) => b.successRate * b.weight - a.successRate * a.weight)
        .slice(0, 5),
      failurePatterns: this.getFailurePatterns(agentType)
    };
  }

  getAllAgentPerformance() {
    const performance = {};
    
    Object.keys(this.memory.agents).forEach(agentType => {
      performance[agentType] = this.getAgentPerformance(agentType);
    });
    
    return performance;
  }

  updateGlobalMetrics(cycleResults) {
    this.memory.globalMetrics.totalCycles++;
    
    // Calculate overall success rate
    const totalAttempts = Object.values(this.memory.agents).reduce((sum, agent) => sum + agent.attempts, 0);
    const totalSuccesses = Object.values(this.memory.agents).reduce((sum, agent) => sum + agent.successes, 0);
    
    this.memory.globalMetrics.overallSuccessRate = totalAttempts > 0 ? totalSuccesses / totalAttempts : 0;
    
    // Update system health (based on recent performance)
    this.memory.globalMetrics.systemHealth = this.calculateSystemHealth();
    
    // Calculate improvement rate
    this.memory.globalMetrics.improvementRate = this.calculateImprovementRate();
    
    this.saveMemory();
  }

  calculateSystemHealth() {
    const recentCycles = 10; // Consider last 10 cycles
    let healthScore = 0;
    let agentCount = 0;
    
    Object.values(this.memory.agents).forEach(agent => {
      if (agent.attempts > 0) {
        healthScore += agent.performance.successRate;
        agentCount++;
      }
    });
    
    return agentCount > 0 ? healthScore / agentCount : 0;
  }

  calculateImprovementRate() {
    // Simple improvement calculation based on recent vs overall performance
    const recentSuccess = this.getRecentSuccessRate();
    const overallSuccess = this.memory.globalMetrics.overallSuccessRate;
    
    if (overallSuccess === 0) return 0;
    
    return (recentSuccess - overallSuccess) / overallSuccess;
  }

  getRecentSuccessRate() {
    // Calculate success rate for recent attempts (last 20% of total attempts)
    const totalAttempts = Object.values(this.memory.agents).reduce((sum, agent) => sum + agent.attempts, 0);
    const recentThreshold = Math.floor(totalAttempts * 0.8);
    
    let recentSuccesses = 0;
    let recentAttempts = 0;
    
    Object.values(this.memory.agents).forEach(agent => {
      // This is simplified - in reality would track individual attempt timestamps
      if (agent.attempts > recentThreshold) {
        recentAttempts += agent.attempts - recentThreshold;
        recentSuccesses += agent.successes - Math.floor(agent.successes * recentThreshold / agent.attempts);
      }
    });
    
    return recentAttempts > 0 ? recentSuccesses / recentAttempts : this.memory.globalMetrics.overallSuccessRate;
  }

  getAdaptiveThresholds(agentType) {
    const agent = this.memory.agents[agentType];
    if (!agent) return {};
    
    const baseThresholds = {
      fixer: { confidence: 0.75, maxRetries: 3 },
      reviewer: { score: 0.8, strictness: 0.7 },
      tester: { coverage: 0.8, passRate: 0.9 },
      planner: { priority: 70, complexity: 'medium' },
      guardian: { score: 0.8, strictness: 0.9 }
    };
    
    const thresholds = baseThresholds[agentType] || {};
    const performance = agent.performance;
    
    // Adapt thresholds based on performance
    if (performance.successRate > 0.9) {
      // High performance - can be more lenient
      if (thresholds.confidence) thresholds.confidence *= 0.9;
      if (thresholds.score) thresholds.score *= 0.9;
      if (thresholds.strictness) thresholds.strictness *= 0.9;
    } else if (performance.successRate < 0.6) {
      // Low performance - be more strict
      if (thresholds.confidence) thresholds.confidence *= 1.1;
      if (thresholds.score) thresholds.score *= 1.1;
      if (thresholds.strictness) thresholds.strictness *= 1.1;
    }
    
    return thresholds;
  }

  generateLearningReport() {
    const report = {
      timestamp: new Date().toISOString(),
      globalMetrics: this.memory.globalMetrics,
      agentPerformance: this.getAllAgentPerformance(),
      topPatterns: this.getTopPatterns(),
      recommendations: this.generateRecommendations(),
      learningTrends: this.analyzeLearningTrends()
    };
    
    return report;
  }

  getTopPatterns() {
    return this.memory.patterns
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 20)
      .map(pattern => ({
        type: pattern.type,
        occurrences: pattern.occurrences,
        successRate: pattern.successRate,
        description: pattern.description
      }));
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Analyze each agent
    Object.entries(this.memory.agents).forEach(([agentType, agent]) => {
      if (agent.performance.successRate < 0.7) {
        recommendations.push({
          priority: 'high',
          agent: agentType,
          type: 'performance_improvement',
          message: `${agentType} success rate is ${(agent.performance.successRate * 100).toFixed(1)}% - review strategies`
        });
      }
      
      // Check for failure patterns
      const topFailure = agent.performance.failurePatterns[0];
      if (topFailure && topFailure.count > 5) {
        recommendations.push({
          priority: 'medium',
          agent: agentType,
          type: 'failure_pattern',
          message: `${agentType} frequently fails on: ${topFailure.pattern}`
        });
      }
    });
    
    // Global recommendations
    if (this.memory.globalMetrics.improvementRate < 0) {
      recommendations.push({
        priority: 'high',
        agent: 'system',
        type: 'declining_performance',
        message: 'System performance is declining - review all strategies'
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  analyzeLearningTrends() {
    const trends = {
      improving: [],
      declining: [],
      stable: []
    };
    
    Object.entries(this.memory.agents).forEach(([agentType, agent]) => {
      if (agent.attempts < 10) return; // Not enough data
      
      const recentPerformance = this.getRecentPerformanceForAgent(agent);
      const overallPerformance = agent.performance.successRate;
      
      const difference = recentPerformance - overallPerformance;
      
      if (difference > 0.1) {
        trends.improving.push({
          agent: agentType,
          improvement: difference,
          recentRate: recentPerformance,
          overallRate: overallPerformance
        });
      } else if (difference < -0.1) {
        trends.declining.push({
          agent: agentType,
          decline: Math.abs(difference),
          recentRate: recentPerformance,
          overallRate: overallPerformance
        });
      } else {
        trends.stable.push({
          agent: agentType,
          rate: overallPerformance
        });
      }
    });
    
    return trends;
  }

  getRecentPerformanceForAgent(agent) {
    // Simplified recent performance calculation
    // In reality would track individual attempt timestamps
    const recentWeight = 0.3;
    return agent.performance.successRate * (1 - recentWeight) + agent.performance.successRate * recentWeight;
  }

  exportMemory() {
    return {
      ...this.memory,
      exportTimestamp: new Date().toISOString(),
      statistics: this.getMemoryStatistics()
    };
  }

  getMemoryStatistics() {
    const totalStrategies = Object.values(this.memory.agents)
      .reduce((sum, agent) => sum + agent.strategies.length, 0);
    
    const totalPatterns = this.memory.patterns.length;
    
    const averageSuccessRate = Object.values(this.memory.agents)
      .reduce((sum, agent) => sum + agent.performance.successRate, 0) / 5;
    
    return {
      totalStrategies,
      totalPatterns,
      averageSuccessRate,
      totalCycles: this.memory.globalMetrics.totalCycles,
      systemHealth: this.memory.globalMetrics.systemHealth
    };
  }
}

module.exports = AgentMemorySystem;
