// 🧠 PREDICTIVE BUG DETECTION ENGINE
// Detects issues BEFORE they happen

const fs = require('fs');
const path = require('path');

class PredictiveEngine {
  constructor() {
    this.fixHistory = [];
    this.learnedRules = [];
    this.riskPatterns = new Map();
    this.loadHistoricalData();
  }

  loadHistoricalData() {
    try {
      // Load fix history
      if (fs.existsSync('fix-history.json')) {
        const historyData = JSON.parse(fs.readFileSync('fix-history.json', 'utf8'));
        this.fixHistory = historyData.fixes || [];
      }

      // Load learned rules
      if (fs.existsSync('autonomous-rules.json')) {
        const rulesData = JSON.parse(fs.readFileSync('autonomous-rules.json', 'utf8'));
        this.learnedRules = rulesData.uniqueRules || [];
      }

      // Load shared learning
      if (fs.existsSync('shared-learning.json')) {
        const sharedData = JSON.parse(fs.readFileSync('shared-learning.json', 'utf8'));
        this.learnedRules.push(...sharedData.ruleClusters.map(cluster => ({
          type: cluster.type,
          pattern: cluster.patterns[0],
          action: cluster.fixes[0],
          successRate: cluster.successRate,
          usageCount: cluster.usageCount
        })));
      }

      this.analyzeRiskPatterns();
      console.log(`📊 Loaded ${this.fixHistory.length} fixes and ${this.learnedRules.length} rules`);
    } catch (error) {
      console.error('Error loading historical data:', error.message);
    }
  }

  analyzeRiskPatterns() {
    // Count issue frequencies
    const issueFrequency = new Map();
    
    this.fixHistory.forEach(fix => {
      const issueType = fix.issueType || fix.type;
      issueFrequency.set(issueType, (issueFrequency.get(issueType) || 0) + 1);
    });

    this.learnedRules.forEach(rule => {
      const issueType = rule.type;
      issueFrequency.set(issueType, (issueFrequency.get(issueType) || 0) + (rule.usageCount || 1));
    });

    // Identify high-frequency patterns
    const totalIssues = Array.from(issueFrequency.values()).reduce((sum, count) => sum + count, 0);
    
    issueFrequency.forEach((count, issueType) => {
      const frequency = count / totalIssues;
      const riskLevel = this.calculateRiskLevel(frequency, count);
      
      this.riskPatterns.set(issueType, {
        frequency,
        count,
        riskLevel,
        patterns: this.extractPatterns(issueType)
      });
    });
  }

  calculateRiskLevel(frequency, count) {
    if (frequency > 0.3 || count > 20) return 'HIGH';
    if (frequency > 0.1 || count > 10) return 'MEDIUM';
    return 'LOW';
  }

  extractPatterns(issueType) {
    const patterns = [];
    
    // Extract patterns from historical fixes
    this.fixHistory.forEach(fix => {
      if (fix.issueType === issueType && fix.context) {
        patterns.push(fix.context);
      }
    });

    // Extract patterns from learned rules
    this.learnedRules.forEach(rule => {
      if (rule.type === issueType && rule.pattern) {
        patterns.push(rule.pattern);
      }
    });

    return [...new Set(patterns)];
  }

  async predictIssues(codebase) {
    const predictions = [];
    const files = this.getCodebaseFiles(codebase);

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const filePredictions = this.analyzeFile(file, content);
        predictions.push(...filePredictions);
      } catch (error) {
        console.error(`Error analyzing ${file}:`, error.message);
      }
    }

    // Sort by probability
    predictions.sort((a, b) => b.probability - a.probability);

    return predictions;
  }

  getCodebaseFiles(codebase) {
    const files = [];
    
    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (item.endsWith('.js') || item.endsWith('.html')) {
          files.push(fullPath);
        }
      });
    };
    
    scanDirectory(codebase || process.cwd());
    return files;
  }

  analyzeFile(filePath, content) {
    const predictions = [];
    const fileExtension = path.extname(filePath);

    // Analyze for each risk pattern
    this.riskPatterns.forEach((riskData, issueType) => {
      const riskFactors = this.calculateRiskFactors(filePath, content, issueType, riskData);
      
      if (riskFactors.probability > 0.3) {
        predictions.push({
          file: filePath,
          riskType: issueType,
          probability: riskFactors.probability,
          riskLevel: riskData.riskLevel,
          recommendation: this.generateRecommendation(issueType, riskFactors),
          factors: riskFactors.factors,
          lineNumbers: riskFactors.lineNumbers
        });
      }
    });

    return predictions;
  }

  calculateRiskFactors(filePath, content, issueType, riskData) {
    const factors = [];
    let probability = 0.1; // Base probability
    const lineNumbers = [];

    switch (issueType) {
      case 'missing_try_catch':
      case 'api_error_handling':
        // Check for async routes without try-catch
        const asyncRoutes = content.match(/app\.(get|post|put|delete)\s*\([^)]+\)\s*,\s*async/g) || [];
        asyncRoutes.forEach((route, index) => {
          const routeIndex = content.indexOf(route);
          const contextStart = Math.max(0, routeIndex - 5);
          const contextEnd = Math.min(content.length, routeIndex + 500);
          const context = content.substring(contextStart, contextEnd);
          
          if (!context.includes('try') || !context.includes('catch')) {
            probability += 0.4;
            factors.push('Async route without try-catch');
            lineNumbers.push(this.getLineNumber(content, routeIndex));
          }
        });
        break;

      case 'missing_form_validation':
        // Check for forms without validation
        const forms = content.match(/<form[^>]*>/g) || [];
        forms.forEach((form, index) => {
          if (!form.includes('required')) {
            probability += 0.3;
            factors.push('Form without required attribute');
            lineNumbers.push(this.getLineNumber(content, content.indexOf(form)));
          }
        });
        break;

      case 'console_error':
        // Check for console.error statements
        const consoleErrors = content.match(/console\.error/g) || [];
        if (consoleErrors.length > 0) {
          probability += 0.2 * consoleErrors.length;
          factors.push(`Found ${consoleErrors.length} console.error statements`);
          
          // Find line numbers
          let lastIndex = 0;
          for (let i = 0; i < consoleErrors.length; i++) {
            const index = content.indexOf('console.error', lastIndex);
            if (index !== -1) {
              lineNumbers.push(this.getLineNumber(content, index));
              lastIndex = index + 1;
            }
          }
        }
        break;

      case 'missing_charset':
        // Check for missing charset in HTML
        if (filePath.endsWith('.html') && !content.includes('charset')) {
          probability += 0.8;
          factors.push('HTML file missing charset meta tag');
        }
        break;

      case 'hardcoded_secrets':
        // Check for hardcoded secrets
        const secretPatterns = [
          /(password|secret|key)\s*[:=]\s*['"`][^'"`]+['"`]/gi,
          /api[_-]?key\s*[:=]\s*['"`][^'"`]+['"`]/gi,
          /token\s*[:=]\s*['"`][^'"`]+['"`]/gi
        ];
        
        secretPatterns.forEach(pattern => {
          const matches = content.match(pattern) || [];
          if (matches.length > 0) {
            probability += 0.6 * matches.length;
            factors.push(`Found ${matches.length} potential hardcoded secrets`);
          }
        });
        break;
    }

    // Adjust probability based on historical frequency
    const frequencyMultiplier = 1 + (riskData.frequency * 2);
    probability = Math.min(probability * frequencyMultiplier, 1.0);

    return {
      probability: Math.round(probability * 100) / 100,
      factors: [...new Set(factors)],
      lineNumbers: [...new Set(lineNumbers)]
    };
  }

  getLineNumber(content, index) {
    const beforeIndex = content.substring(0, index);
    return beforeIndex.split('\n').length;
  }

  generateRecommendation(issueType, riskFactors) {
    const recommendations = {
      'missing_try_catch': 'Add try-catch blocks to all async routes for proper error handling',
      'api_error_handling': 'Implement comprehensive error handling for all API endpoints',
      'missing_form_validation': 'Add required and pattern attributes to form inputs for validation',
      'console_error': 'Replace console.error statements with proper logging system',
      'missing_charset': 'Add UTF-8 charset meta tag to HTML head section',
      'hardcoded_secrets': 'Move hardcoded secrets to environment variables'
    };

    const baseRecommendation = recommendations[issueType] || 'Review and fix the identified issue';
    
    if (riskFactors.lineNumbers.length > 0) {
      return `${baseRecommendation} (lines: ${riskFactors.lineNumbers.join(', ')})`;
    }
    
    return baseRecommendation;
  }

  getHighRiskIssues() {
    const highRiskIssues = [];
    
    this.riskPatterns.forEach((riskData, issueType) => {
      if (riskData.riskLevel === 'HIGH') {
        highRiskIssues.push({
          type: issueType,
          frequency: riskData.frequency,
          count: riskData.count,
          patterns: riskData.patterns
        });
      }
    });

    return highRiskIssues.sort((a, b) => b.frequency - a.frequency);
  }

  generatePredictiveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalRiskPatterns: this.riskPatterns.size,
      highRiskIssues: this.getHighRiskIssues(),
      riskDistribution: this.getRiskDistribution(),
      recommendations: this.generateSystemRecommendations()
    };

    return report;
  }

  getRiskDistribution() {
    const distribution = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    
    this.riskPatterns.forEach(riskData => {
      distribution[riskData.riskLevel]++;
    });

    return distribution;
  }

  generateSystemRecommendations() {
    const recommendations = [];
    const highRiskIssues = this.getHighRiskIssues();

    highRiskIssues.forEach(issue => {
      recommendations.push({
        priority: 'HIGH',
        issue: issue.type,
        action: `Implement systematic fix for ${issue.type} (occurred ${issue.count} times)`,
        impact: 'High - frequently occurring issue'
      });
    });

    return recommendations;
  }

  updateRiskPatterns(newFix) {
    const issueType = newFix.issueType || newFix.type;
    
    if (!this.riskPatterns.has(issueType)) {
      this.riskPatterns.set(issueType, {
        frequency: 0,
        count: 0,
        riskLevel: 'LOW',
        patterns: []
      });
    }

    const riskData = this.riskPatterns.get(issueType);
    riskData.count++;
    riskData.frequency = riskData.count / (this.fixHistory.length + this.learnedRules.length);
    riskData.riskLevel = this.calculateRiskLevel(riskData.frequency, riskData.count);
    
    if (newFix.context && !riskData.patterns.includes(newFix.context)) {
      riskData.patterns.push(newFix.context);
    }
  }
}

module.exports = PredictiveEngine;
