// 📊 INTELLIGENCE DASHBOARD API
// Exposes system intelligence through REST endpoints

const express = require('express');
const PredictiveEngine = require('./predictiveEngine');
const MemoryGraph = require('./memoryGraph');
const SharedLearningSystem = require('./sharedLearningSystem');

class IntelligenceDashboardAPI {
  constructor() {
    this.app = express();
    this.predictiveEngine = new PredictiveEngine();
    this.memoryGraph = new MemoryGraph();
    this.sharedLearning = new SharedLearningSystem();
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });
  }

  setupRoutes() {
    // Health endpoint
    this.app.get('/api/intelligence/health', (req, res) => {
      try {
        const health = this.calculateSystemHealth();
        res.json({
          success: true,
          data: health,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Predictions endpoint
    this.app.get('/api/intelligence/predictions', async (req, res) => {
      try {
        const codebase = req.query.codebase || process.cwd();
        const predictions = await this.predictiveEngine.predictIssues(codebase);
        
        res.json({
          success: true,
          data: {
            predictions: predictions,
            summary: this.summarizePredictions(predictions),
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Rules endpoint
    this.app.get('/api/intelligence/rules', (req, res) => {
      try {
        const rules = this.getSystemRules();
        const filters = req.query;
        
        let filteredRules = rules;
        
        if (filters.type) {
          filteredRules = filteredRules.filter(rule => rule.type === filters.type);
        }
        
        if (filters.minSuccessRate) {
          filteredRules = filteredRules.filter(rule => 
            (rule.successRate || 0) >= parseFloat(filters.minSuccessRate)
          );
        }
        
        if (filters.limit) {
          filteredRules = filteredRules.slice(0, parseInt(filters.limit));
        }
        
        res.json({
          success: true,
          data: {
            rules: filteredRules,
            total: rules.length,
            filtered: filteredRules.length,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // History endpoint
    this.app.get('/api/intelligence/history', (req, res) => {
      try {
        const history = this.getSystemHistory();
        const filters = req.query;
        
        let filteredHistory = history;
        
        if (filters.days) {
          const cutoffDate = new Date(Date.now() - parseInt(filters.days) * 24 * 60 * 60 * 1000);
          filteredHistory = filteredHistory.filter(item => 
            new Date(item.timestamp) > cutoffDate
          );
        }
        
        if (filters.type) {
          filteredHistory = filteredHistory.filter(item => item.type === filters.type);
        }
        
        res.json({
          success: true,
          data: {
            history: filteredHistory,
            total: history.length,
            filtered: filteredHistory.length,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Memory graph endpoint
    this.app.get('/api/intelligence/memory', (req, res) => {
      try {
        const memoryData = this.memoryGraph.exportGraph();
        
        res.json({
          success: true,
          data: memoryData
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Best fixes endpoint
    this.app.get('/api/intelligence/best-fixes/:issueType', (req, res) => {
      try {
        const { issueType } = req.params;
        const bestFix = this.memoryGraph.findBestFix(issueType);
        
        if (!bestFix) {
          return res.status(404).json({
            success: false,
            error: 'No fix found for this issue type'
          });
        }
        
        res.json({
          success: true,
          data: bestFix
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Recommendations endpoint
    this.app.get('/api/intelligence/recommendations', (req, res) => {
      try {
        const recommendations = this.generateRecommendations();
        
        res.json({
          success: true,
          data: {
            recommendations: recommendations,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Statistics endpoint
    this.app.get('/api/intelligence/statistics', (req, res) => {
      try {
        const stats = this.getComprehensiveStatistics();
        
        res.json({
          success: true,
          data: stats
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Learning insights endpoint
    this.app.get('/api/intelligence/insights', (req, res) => {
      try {
        const insights = this.sharedLearning.getLearningInsights();
        
        res.json({
          success: true,
          data: insights
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }

  calculateSystemHealth() {
    const memoryStats = this.memoryGraph.getGraphStatistics();
    const sharedStats = this.sharedLearning.sharedData.globalStats;
    const predictiveReport = this.predictiveEngine.generatePredictiveReport();
    
    // Calculate health score (0-100)
    let healthScore = 50; // Base score
    
    // Memory graph health
    if (memoryStats.averageSuccessRate > 0.8) healthScore += 20;
    if (memoryStats.averageWeight > 0.7) healthScore += 10;
    
    // Shared learning health
    if (sharedStats.averageSuccessRate > 0.8) healthScore += 15;
    if (sharedStats.contributingProjects.length > 1) healthScore += 5;
    
    // Predictive engine health
    if (predictiveReport.highRiskIssues.length < 5) healthScore += 10;
    
    healthScore = Math.min(100, Math.max(0, healthScore));
    
    return {
      score: Math.round(healthScore),
      status: healthScore > 80 ? 'EXCELLENT' : healthScore > 60 ? 'GOOD' : healthScore > 40 ? 'FAIR' : 'POOR',
      components: {
        memoryGraph: {
          nodes: memoryStats.totalNodes,
          edges: memoryStats.totalEdges,
          averageSuccessRate: memoryStats.averageSuccessRate,
          averageWeight: memoryStats.averageWeight
        },
        sharedLearning: {
          totalRules: sharedStats.totalRules,
          totalUsage: sharedStats.totalUsage,
          averageSuccessRate: sharedStats.averageSuccessRate,
          contributingProjects: sharedStats.contributingProjects.length
        },
        predictiveEngine: {
          riskPatterns: predictiveReport.totalRiskPatterns,
          highRiskIssues: predictiveReport.highRiskIssues.length,
          riskDistribution: predictiveReport.riskDistribution
        }
      },
      lastUpdated: new Date().toISOString()
    };
  }

  summarizePredictions(predictions) {
    const summary = {
      total: predictions.length,
      highRisk: predictions.filter(p => p.riskLevel === 'HIGH').length,
      mediumRisk: predictions.filter(p => p.riskLevel === 'MEDIUM').length,
      lowRisk: predictions.filter(p => p.riskLevel === 'LOW').length,
      averageProbability: predictions.reduce((sum, p) => sum + p.probability, 0) / predictions.length || 0,
      topRiskTypes: this.getTopRiskTypes(predictions)
    };
    
    return summary;
  }

  getTopRiskTypes(predictions) {
    const riskCounts = {};
    
    predictions.forEach(prediction => {
      riskCounts[prediction.riskType] = (riskCounts[prediction.riskType] || 0) + 1;
    });
    
    return Object.entries(riskCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }

  getSystemRules() {
    const rules = [];
    
    // Get rules from memory graph
    const memoryVisualization = this.memoryGraph.visualizeGraph();
    memoryVisualization.nodes.forEach(node => {
      if (node.type === 'solution') {
        rules.push({
          id: node.id,
          type: node.label,
          successRate: 0.8, // Default, would be calculated from edges
          usageCount: 0,
          source: 'memory_graph',
          metadata: node.metadata
        });
      }
    });
    
    // Get rules from shared learning
    this.sharedLearning.sharedData.ruleClusters.forEach(cluster => {
      rules.push({
        id: cluster.id,
        type: cluster.type,
        successRate: cluster.successRate,
        usageCount: cluster.usageCount,
        source: 'shared_learning',
        metadata: {
          contributingProjects: cluster.contributingProjects,
          createdAt: cluster.createdAt
        }
      });
    });
    
    return rules;
  }

  getSystemHistory() {
    const history = [];
    
    // Get fix history
    try {
      if (require('fs').existsSync('fix-history.json')) {
        const fixHistory = JSON.parse(require('fs').readFileSync('fix-history.json', 'utf8'));
        fixHistory.fixes?.forEach(fix => {
          history.push({
            id: fix.id,
            type: fix.issueType || 'unknown',
            action: 'fix_applied',
            success: fix.success !== false,
            timestamp: fix.timestamp || new Date().toISOString(),
            file: fix.file,
            source: 'fix_history'
          });
        });
      }
    } catch (error) {
      console.error('Error loading fix history:', error.message);
    }
    
    // Get memory graph edges as history
    this.memoryGraph.graph.edges.forEach(edge => {
      const fromNode = this.memoryGraph.graph.nodes.find(n => n.id === edge.from);
      const toNode = this.memoryGraph.graph.nodes.find(n => n.id === edge.to);
      
      if (fromNode && toNode) {
        history.push({
          id: edge.id,
          type: fromNode.label,
          action: toNode.label,
          success: edge.successCount > 0,
          timestamp: edge.lastUsed,
          usageCount: edge.usageCount,
          successCount: edge.successCount,
          source: 'memory_graph'
        });
      }
    });
    
    // Sort by timestamp
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return history;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Get memory graph recommendations
    const memoryRecommendations = this.memoryGraph.generateRecommendations();
    recommendations.push(...memoryRecommendations);
    
    // Get predictive engine recommendations
    const predictiveReport = this.predictiveEngine.generatePredictiveReport();
    predictiveReport.recommendations?.forEach(rec => {
      recommendations.push({
        ...rec,
        source: 'predictive_engine'
      });
    });
    
    // Sort by priority
    const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    
    return recommendations;
  }

  getComprehensiveStatistics() {
    const memoryStats = this.memoryGraph.getGraphStatistics();
    const sharedStats = this.sharedLearning.sharedData.globalStats;
    const predictiveReport = this.predictiveEngine.generatePredictiveReport();
    
    return {
      timestamp: new Date().toISOString(),
      memoryGraph: memoryStats,
      sharedLearning: sharedStats,
      predictiveEngine: predictiveReport,
      system: {
        totalRules: memoryStats.totalNodes + sharedStats.totalRules,
        totalUsage: memoryStats.totalUsage + sharedStats.totalUsage,
        averageSuccessRate: ((memoryStats.averageSuccessRate * memoryStats.totalEdges) + 
                           (sharedStats.averageSuccessRate * sharedStats.totalRules)) / 
                          (memoryStats.totalEdges + sharedStats.totalRules) || 0,
        contributingProjects: sharedStats.contributingProjects.length,
        riskPatterns: predictiveReport.totalRiskPatterns
      }
    };
  }

  start(port = 3001) {
    this.app.listen(port, () => {
      console.log(`📊 Intelligence Dashboard API running on port ${port}`);
      console.log(`🔗 Available endpoints:`);
      console.log(`   GET /api/intelligence/health`);
      console.log(`   GET /api/intelligence/predictions`);
      console.log(`   GET /api/intelligence/rules`);
      console.log(`   GET /api/intelligence/history`);
      console.log(`   GET /api/intelligence/memory`);
      console.log(`   GET /api/intelligence/best-fixes/:issueType`);
      console.log(`   GET /api/intelligence/recommendations`);
      console.log(`   GET /api/intelligence/statistics`);
      console.log(`   GET /api/intelligence/insights`);
    });
  }
}

module.exports = IntelligenceDashboardAPI;
