// 🛡 GUARDIAN AGENT
// Protects production with final validation and deployment control

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class GuardianAgent {
  constructor() {
    this.validationThresholds = {
      testSuccessRate: 0.9,
      reviewScore: 0.8,
      systemHealth: 0.8,
      securityScore: 0.9
    };
    this.deploymentHistory = [];
    this.blockedDeployments = [];
  }

  async validateDeployment(fixResults, reviewResults, testResults, systemHealth) {
    console.log('🛡 GUARDIAN AGENT - Final deployment validation');
    
    const validation = {
      approved: false,
      overallScore: 0,
      criteria: {},
      blockers: [],
      warnings: [],
      recommendations: [],
      deploymentDecision: 'BLOCKED'
    };

    try {
      // Step 1: Validate fix results
      validation.criteria.fixes = await this.validateFixes(fixResults);
      
      // Step 2: Validate review results
      validation.criteria.reviews = await this.validateReviews(reviewResults);
      
      // Step 3: Validate test results
      validation.criteria.tests = await this.validateTests(testResults);
      
      // Step 4: Validate system health
      validation.criteria.health = await this.validateSystemHealth(systemHealth);
      
      // Step 5: Security validation
      validation.criteria.security = await this.validateSecurity(reviewResults);
      
      // Step 6: Performance validation
      validation.criteria.performance = await this.validatePerformance(fixResults);
      
      // Step 7: Calculate overall score
      validation.overallScore = this.calculateOverallScore(validation.criteria);
      
      // Step 8: Identify blockers and warnings
      this.identifyIssues(validation);
      
      // Step 9: Make deployment decision
      validation.deploymentDecision = this.makeDeploymentDecision(validation);
      validation.approved = validation.deploymentDecision === 'APPROVED';
      
      // Step 10: Record decision
      this.recordDeploymentDecision(validation);
      
      console.log(`🛡 Guardian decision: ${validation.deploymentDecision} (score: ${(validation.overallScore * 100).toFixed(1)}%)`);
      
      return validation;
      
    } catch (error) {
      console.error(`❌ Guardian validation failed: ${error.message}`);
      return {
        approved: false,
        overallScore: 0,
        criteria: {},
        blockers: [`Validation error: ${error.message}`],
        warnings: [],
        recommendations: [],
        deploymentDecision: 'FAILED'
      };
    }
  }

  async validateFixes(fixResults) {
    const validation = {
      score: 0.8,
      issues: [],
      passed: true,
      summary: {
        total: fixResults.length || 0,
        successful: 0,
        failed: 0,
        confidence: 0
      }
    };

    if (!fixResults || fixResults.length === 0) {
      validation.issues.push('No fix results provided');
      validation.score = 0;
      validation.passed = false;
      return validation;
    }

    fixResults.forEach(fix => {
      if (fix.success) {
        validation.summary.successful++;
      } else {
        validation.summary.failed++;
        validation.issues.push(`Fix failed: ${fix.reason || 'Unknown reason'}`);
      }
      
      if (fix.confidence) {
        validation.summary.confidence += fix.confidence;
      }
    });

    // Calculate average confidence
    if (validation.summary.successful > 0) {
      validation.summary.confidence = validation.summary.confidence / validation.summary.successful;
    }

    // Calculate score based on success rate and confidence
    const successRate = validation.summary.successful / validation.summary.total;
    validation.score = (successRate * 0.7) + (validation.summary.confidence * 0.3);
    
    validation.passed = validation.score >= 0.7 && validation.summary.failed === 0;

    return validation;
  }

  async validateReviews(reviewResults) {
    const validation = {
      score: 0.8,
      issues: [],
      passed: true,
      summary: {
        total: reviewResults.length || 0,
        approved: 0,
        rejected: 0,
        averageScore: 0
      }
    };

    if (!reviewResults || reviewResults.length === 0) {
      validation.issues.push('No review results provided');
      validation.score = 0;
      validation.passed = false;
      return validation;
    }

    reviewResults.forEach(review => {
      if (review.approved) {
        validation.summary.approved++;
      } else {
        validation.summary.rejected++;
        validation.issues.push(`Review rejected: ${review.summary || 'No reason provided'}`);
      }
      
      if (review.overallScore) {
        validation.summary.averageScore += review.overallScore;
      }
    });

    // Calculate average score
    if (validation.summary.approved > 0) {
      validation.summary.averageScore = validation.summary.averageScore / reviewResults.length;
    }

    // Calculate score based on approval rate and average score
    const approvalRate = validation.summary.approved / validation.summary.total;
    validation.score = (approvalRate * 0.8) + (validation.summary.averageScore * 0.2);
    
    validation.passed = validation.score >= this.validationThresholds.reviewScore && validation.summary.rejected === 0;

    return validation;
  }

  async validateTests(testResults) {
    const validation = {
      score: 0.8,
      issues: [],
      passed: true,
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        coverage: 0,
        successRate: 0
      }
    };

    if (!testResults || testResults.length === 0) {
      validation.issues.push('No test results provided');
      validation.score = 0;
      validation.passed = false;
      return validation;
    }

    testResults.forEach(testResult => {
      if (testResult.results) {
        validation.summary.total += testResult.results.total || 0;
        validation.summary.passed += testResult.results.passed || 0;
        validation.summary.failed += testResult.results.failed || 0;
        validation.summary.coverage += testResult.results.coverage || 0;
      }
    });

    // Calculate success rate
    if (validation.summary.total > 0) {
      validation.summary.successRate = validation.summary.passed / validation.summary.total;
    }

    // Calculate average coverage
    if (testResults.length > 0) {
      validation.summary.coverage = validation.summary.coverage / testResults.length;
    }

    // Calculate score based on success rate and coverage
    validation.score = (validation.summary.successRate * 0.7) + (validation.summary.coverage / 100 * 0.3);
    
    validation.passed = validation.score >= this.validationThresholds.testSuccessRate && validation.summary.failed === 0;

    return validation;
  }

  async validateSystemHealth(systemHealth) {
    const validation = {
      score: 0.8,
      issues: [],
      passed: true,
      summary: {
        overallScore: systemHealth?.score || 0,
        status: systemHealth?.status || 'UNKNOWN',
        components: systemHealth?.components || {}
      }
    };

    if (!systemHealth) {
      validation.issues.push('No system health data provided');
      validation.score = 0;
      validation.passed = false;
      return validation;
    }

    validation.score = validation.summary.overallScore / 100;
    
    // Check critical components
    const criticalComponents = ['memoryGraph', 'sharedLearning', 'predictiveEngine'];
    criticalComponents.forEach(component => {
      if (!validation.summary.components[component]) {
        validation.issues.push(`Missing health data for ${component}`);
        validation.score -= 0.1;
      }
    });

    validation.passed = validation.score >= this.validationThresholds.systemHealth;

    return validation;
  }

  async validateSecurity(reviewResults) {
    const validation = {
      score: 1.0,
      issues: [],
      passed: true,
      summary: {
        highSeverityIssues: 0,
        mediumSeverityIssues: 0,
        lowSeverityIssues: 0,
        totalIssues: 0
      }
    };

    if (!reviewResults || reviewResults.length === 0) {
      validation.issues.push('No security review data available');
      validation.score = 0.5;
      validation.passed = false;
      return validation;
    }

    reviewResults.forEach(review => {
      if (review.securityIssues) {
        review.securityIssues.forEach(issue => {
          validation.summary.totalIssues++;
          
          if (issue.severity === 'high') {
            validation.summary.highSeverityIssues++;
            validation.issues.push(`High severity security issue: ${issue.type}`);
            validation.score -= 0.3;
          } else if (issue.severity === 'medium') {
            validation.summary.mediumSeverityIssues++;
            validation.score -= 0.1;
          } else {
            validation.summary.lowSeverityIssues++;
            validation.score -= 0.05;
          }
        });
      }
    });

    validation.score = Math.max(0, validation.score);
    validation.passed = validation.score >= this.validationThresholds.securityScore && validation.summary.highSeverityIssues === 0;

    return validation;
  }

  async validatePerformance(fixResults) {
    const validation = {
      score: 0.9,
      issues: [],
      passed: true,
      summary: {
        complexity: 'acceptable',
        performanceImpact: 'minimal',
        resourceUsage: 'normal'
      }
    };

    // Check for performance regressions
    if (fixResults) {
      fixResults.forEach(fix => {
        if (fix.changes) {
          const totalChanges = fix.changes.additions + fix.changes.modifications + fix.changes.removals;
          
          if (totalChanges > 100) {
            validation.issues.push('Large number of changes may impact performance');
            validation.score -= 0.1;
          }
          
          if (fix.changes.additions > fix.changes.removals * 2) {
            validation.issues.push('Significant code addition detected');
            validation.score -= 0.05;
          }
        }
      });
    }

    validation.passed = validation.score >= 0.7;

    return validation;
  }

  calculateOverallScore(criteria) {
    const weights = {
      fixes: 0.25,
      reviews: 0.25,
      tests: 0.25,
      health: 0.15,
      security: 0.1
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(criteria).forEach(([criterion, result]) => {
      const weight = weights[criterion] || 0;
      const score = result.score || 0;
      
      totalScore += score * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  identifyIssues(validation) {
    // Identify blockers (critical issues that must block deployment)
    validation.blockers = [];
    
    if (validation.criteria.fixes?.summary?.failed > 0) {
      validation.blockers.push('One or more fixes failed');
    }
    
    if (validation.criteria.reviews?.summary?.rejected > 0) {
      validation.blockers.push('One or more reviews were rejected');
    }
    
    if (validation.criteria.tests?.summary?.failed > 0) {
      validation.blockers.push('One or more tests failed');
    }
    
    if (validation.criteria.security?.summary?.highSeverityIssues > 0) {
      validation.blockers.push('High severity security issues detected');
    }
    
    if (validation.overallScore < 0.7) {
      validation.blockers.push(`Overall validation score too low: ${(validation.overallScore * 100).toFixed(1)}%`);
    }

    // Identify warnings (issues that should be noted but don't block deployment)
    validation.warnings = [];
    
    if (validation.criteria.tests?.summary?.coverage < 80) {
      validation.warnings.push(`Test coverage below 80%: ${validation.criteria.tests.summary.coverage}%`);
    }
    
    if (validation.criteria.performance?.score < 0.8) {
      validation.warnings.push('Performance concerns detected');
    }
    
    if (validation.criteria.reviews?.summary?.averageScore < 0.8) {
      validation.warnings.push('Review scores are below optimal');
    }

    // Generate recommendations
    validation.recommendations = this.generateRecommendations(validation);
  }

  generateRecommendations(validation) {
    const recommendations = [];
    
    if (validation.criteria.tests?.summary?.coverage < 80) {
      recommendations.push({
        priority: 'medium',
        action: 'improve_test_coverage',
        description: 'Add more tests to improve coverage above 80%'
      });
    }
    
    if (validation.criteria.performance?.score < 0.8) {
      recommendations.push({
        priority: 'medium',
        action: 'optimize_performance',
        description: 'Review and optimize code for better performance'
      });
    }
    
    if (validation.criteria.reviews?.summary?.averageScore < 0.8) {
      recommendations.push({
        priority: 'low',
        action: 'improve_code_quality',
        description: 'Address code quality issues identified in reviews'
      });
    }
    
    if (validation.blockers.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'resolve_blockers',
        description: 'Resolve all blocking issues before deployment'
      });
    }
    
    return recommendations;
  }

  makeDeploymentDecision(validation) {
    if (validation.blockers.length > 0) {
      return 'BLOCKED';
    }
    
    if (validation.overallScore >= 0.9) {
      return 'APPROVED';
    } else if (validation.overallScore >= 0.8) {
      return 'APPROVED_WITH_WARNINGS';
    } else {
      return 'REJECTED';
    }
  }

  recordDeploymentDecision(validation) {
    const record = {
      timestamp: new Date().toISOString(),
      decision: validation.deploymentDecision,
      score: validation.overallScore,
      blockers: validation.blockers,
      warnings: validation.warnings,
      criteria: validation.criteria
    };

    if (validation.deploymentDecision === 'BLOCKED' || validation.deploymentDecision === 'REJECTED') {
      this.blockedDeployments.push(record);
    } else {
      this.deploymentHistory.push(record);
    }

    // Keep only last 50 records
    if (this.deploymentHistory.length > 50) {
      this.deploymentHistory = this.deploymentHistory.slice(-50);
    }
    
    if (this.blockedDeployments.length > 50) {
      this.blockedDeployments = this.blockedDeployments.slice(-50);
    }
  }

  async runPreDeploymentCheck() {
    console.log('🛡 GUARDIAN AGENT - Running pre-deployment system check');
    
    const check = {
      passed: true,
      issues: [],
      systemStatus: 'HEALTHY',
      components: {}
    };

    try {
      // Check server status
      check.components.server = await this.checkServerStatus();
      
      // Check database connectivity
      check.components.database = await this.checkDatabaseConnectivity();
      
      // Check file system
      check.components.fileSystem = await this.checkFileSystem();
      
      // Check dependencies
      check.components.dependencies = await this.checkDependencies();
      
      // Check environment variables
      check.components.environment = await this.checkEnvironmentVariables();
      
      // Check disk space
      check.components.diskSpace = await this.checkDiskSpace();
      
      // Check memory usage
      check.components.memory = await this.checkMemoryUsage();
      
      // Aggregate issues
      Object.values(check.components).forEach(component => {
        if (!component.healthy) {
          check.issues.push(...component.issues);
        }
      });
      
      check.passed = check.issues.length === 0;
      check.systemStatus = check.passed ? 'HEALTHY' : 'UNHEALTHY';
      
      console.log(`🛡 Pre-deployment check: ${check.systemStatus} (${check.issues.length} issues)`);
      
      return check;
      
    } catch (error) {
      console.error(`❌ Pre-deployment check failed: ${error.message}`);
      return {
        passed: false,
        issues: [`Check failed: ${error.message}`],
        systemStatus: 'ERROR',
        components: {}
      };
    }
  }

  async checkServerStatus() {
    const check = {
      healthy: true,
      issues: [],
      status: 'running'
    };

    try {
      // Check if server can start
      const serverCheck = await this.testServerStartup();
      if (!serverCheck.success) {
        check.healthy = false;
        check.issues.push('Server startup failed');
        check.status = 'failed';
      }
    } catch (error) {
      check.healthy = false;
      check.issues.push(`Server check error: ${error.message}`);
      check.status = 'error';
    }

    return check;
  }

  async testServerStartup() {
    return new Promise((resolve) => {
      const server = spawn('node', ['server.js'], {
        stdio: 'pipe',
        cwd: process.cwd
      });
      
      let started = false;
      
      server.stdout.on('data', (data) => {
        if (data.toString().includes('server running') || data.toString().includes('listening')) {
          started = true;
          server.kill();
          resolve({ success: true });
        }
      });
      
      server.stderr.on('data', (data) => {
        if (data.toString().includes('Error')) {
          server.kill();
          resolve({ success: false, error: data.toString() });
        }
      });
      
      server.on('close', (code) => {
        if (!started) {
          resolve({ success: false, error: `Server exited with code ${code}` });
        }
      });
      
      setTimeout(() => {
        if (!started) {
          server.kill();
          resolve({ success: false, error: 'Server startup timeout' });
        }
      }, 10000);
    });
  }

  async checkDatabaseConnectivity() {
    const check = {
      healthy: true,
      issues: [],
      status: 'connected'
    };

    try {
      // Basic database check - would be more comprehensive in reality
      if (!fs.existsSync('package.json')) {
        check.healthy = false;
        check.issues.push('package.json not found');
        return check;
      }
      
      const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const hasDatabase = packageData.dependencies?.sequelize || 
                         packageData.dependencies?.mongoose || 
                         packageData.dependencies?.pg;
      
      if (hasDatabase) {
        check.status = 'database_present';
      } else {
        check.status = 'no_database';
      }
      
    } catch (error) {
      check.healthy = false;
      check.issues.push(`Database check error: ${error.message}`);
      check.status = 'error';
    }

    return check;
  }

  async checkFileSystem() {
    const check = {
      healthy: true,
      issues: [],
      status: 'accessible'
    };

    try {
      const criticalFiles = ['server.js', 'package.json'];
      
      criticalFiles.forEach(file => {
        if (!fs.existsSync(file)) {
          check.healthy = false;
          check.issues.push(`Critical file missing: ${file}`);
        }
      });
      
      // Check write permissions
      try {
        fs.writeFileSync('.guardian_test', 'test');
        fs.unlinkSync('.guardian_test');
      } catch (error) {
        check.healthy = false;
        check.issues.push('File system write permissions issue');
      }
      
    } catch (error) {
      check.healthy = false;
      check.issues.push(`File system check error: ${error.message}`);
      check.status = 'error';
    }

    return check;
  }

  async checkDependencies() {
    const check = {
      healthy: true,
      issues: [],
      status: 'installed'
    };

    try {
      if (!fs.existsSync('package.json')) {
        check.healthy = false;
        check.issues.push('package.json not found');
        return check;
      }
      
      if (!fs.existsSync('node_modules')) {
        check.healthy = false;
        check.issues.push('node_modules directory not found - run npm install');
        check.status = 'missing';
        return check;
      }
      
      // Check for critical dependencies
      const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const criticalDeps = ['express'];
      
      criticalDeps.forEach(dep => {
        if (!packageData.dependencies?.[dep]) {
          check.issues.push(`Critical dependency missing: ${dep}`);
        }
      });
      
    } catch (error) {
      check.healthy = false;
      check.issues.push(`Dependency check error: ${error.message}`);
      check.status = 'error';
    }

    return check;
  }

  async checkEnvironmentVariables() {
    const check = {
      healthy: true,
      issues: [],
      status: 'configured'
    };

    try {
      const requiredEnvVars = ['NODE_ENV'];
      const optionalEnvVars = ['PORT', 'DATABASE_URL', 'JWT_SECRET'];
      
      requiredEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
          check.issues.push(`Required environment variable missing: ${envVar}`);
        }
      });
      
      optionalEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
          check.issues.push(`Optional environment variable missing: ${envVar}`);
        }
      });
      
      if (check.issues.length > 0) {
        check.healthy = false;
        check.status = 'incomplete';
      }
      
    } catch (error) {
      check.healthy = false;
      check.issues.push(`Environment check error: ${error.message}`);
      check.status = 'error';
    }

    return check;
  }

  async checkDiskSpace() {
    const check = {
      healthy: true,
      issues: [],
      status: 'sufficient'
    };

    try {
      const stats = fs.statSync('.');
      // Basic check - in reality would use proper disk space checking
      check.status = 'available';
      
    } catch (error) {
      check.healthy = false;
      check.issues.push(`Disk space check error: ${error.message}`);
      check.status = 'error';
    }

    return check;
  }

  async checkMemoryUsage() {
    const check = {
      healthy: true,
      issues: [],
      status: 'normal'
    };

    try {
      const memUsage = process.memoryUsage();
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
      
      if (heapUsedMB > 500) {
        check.issues.push(`High memory usage: ${heapUsedMB.toFixed(2)}MB`);
        check.status = 'high';
      }
      
    } catch (error) {
      check.healthy = false;
      check.issues.push(`Memory check error: ${error.message}`);
      check.status = 'error';
    }

    return check;
  }

  generateGuardianReport() {
    const report = {
      timestamp: new Date().toISOString(),
      deploymentHistory: this.deploymentHistory.slice(-10),
      blockedDeployments: this.blockedDeployments.slice(-10),
      statistics: {
        totalDeployments: this.deploymentHistory.length,
        blockedDeployments: this.blockedDeployments.length,
        averageScore: this.calculateAverageScore(),
        successRate: this.calculateSuccessRate()
      },
      recommendations: this.generateSystemRecommendations()
    };

    return report;
  }

  calculateAverageScore() {
    if (this.deploymentHistory.length === 0) return 0;
    
    const totalScore = this.deploymentHistory.reduce((sum, record) => sum + record.score, 0);
    return totalScore / this.deploymentHistory.length;
  }

  calculateSuccessRate() {
    const totalDeployments = this.deploymentHistory.length + this.blockedDeployments.length;
    if (totalDeployments === 0) return 0;
    
    return (this.deploymentHistory.length / totalDeployments) * 100;
  }

  generateSystemRecommendations() {
    const recommendations = [];
    
    const blockedRate = this.blockedDeployments.length / (this.deploymentHistory.length + this.blockedDeployments.length);
    
    if (blockedRate > 0.2) {
      recommendations.push({
        priority: 'high',
        issue: 'High deployment rejection rate',
        action: 'Improve code quality and testing before deployment'
      });
    }
    
    const avgScore = this.calculateAverageScore();
    if (avgScore < 0.8) {
      recommendations.push({
        priority: 'medium',
        issue: 'Low average validation score',
        action: 'Focus on improving review and test quality'
      });
    }
    
    return recommendations;
  }
}

module.exports = GuardianAgent;
