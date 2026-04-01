// 🔍 REVIEWER AGENT
// Acts like a strict senior engineer validating code changes

const fs = require('fs');
const path = require('path');

class ReviewerAgent {
  constructor() {
    this.reviewCriteria = {
      syntax: { weight: 0.3, required: true },
      functionality: { weight: 0.25, required: true },
      security: { weight: 0.2, required: true },
      bestPractices: { weight: 0.15, required: false },
      performance: { weight: 0.1, required: false }
    };
    this.securityPatterns = this.initializeSecurityPatterns();
    this.bestPracticePatterns = this.initializeBestPracticePatterns();
  }

  initializeSecurityPatterns() {
    return [
      { pattern: /eval\s*\(/, severity: 'high', description: 'Use of eval() function' },
      { pattern: /new\s+Function\s*\(/, severity: 'high', description: 'Use of Function() constructor' },
      { pattern: /innerHTML\s*=/, severity: 'medium', description: 'Use of innerHTML (XSS risk)' },
      { pattern: /document\.write\s*\(/, severity: 'medium', description: 'Use of document.write()' },
      { pattern: /password\s*[:=]\s*['"`][^'"`]+['"`]/, severity: 'high', description: 'Hardcoded password' },
      { pattern: /secret\s*[:=]\s*['"`][^'"`]+['"`]/, severity: 'high', description: 'Hardcoded secret' },
      { pattern: /api[_-]?key\s*[:=]\s*['"`][^'"`]+['"`]/, severity: 'high', description: 'Hardcoded API key' },
      { pattern: /token\s*[:=]\s*['"`][^'"`]+['"`]/, severity: 'high', description: 'Hardcoded token' }
    ];
  }

  initializeBestPracticePatterns() {
    return [
      { pattern: /console\.(log|error|warn|info)/, severity: 'low', description: 'Console statement in production' },
      { pattern: /var\s+\w+\s*=/, severity: 'low', description: 'Use of var instead of let/const' },
      { pattern: /==\s*[^=]/, severity: 'low', description: 'Use of == instead of ===' },
      { pattern: /!=\s*[^=]/, severity: 'low', description: 'Use of != instead of !==' },
      { pattern: /function\s*\(\s*\)\s*{[\s\S]*?return\s*[^;]\s*;?\s*}/, severity: 'low', description: 'Missing semicolon in return statement' },
      { pattern: /catch\s*\(\s*\)\s*{[\s\S]*?}/, severity: 'medium', description: 'Empty catch block' },
      { pattern: /if\s*\([^)]+\)\s*{[\s\S]*?}/, severity: 'low', description: 'Missing else clause for conditional' }
    ];
  }

  async reviewFix(originalCode, updatedCode, issue) {
    console.log(`🔍 REVIEWER AGENT - Reviewing fix for ${issue.type} in ${issue.file}`);
    
    const review = {
      approved: false,
      overallScore: 0,
      criteria: {},
      issues: [],
      recommendations: [],
      securityIssues: [],
      bestPracticeIssues: [],
      summary: ''
    };

    try {
      // Step 1: Syntax validation
      review.criteria.syntax = await this.validateSyntax(updatedCode, issue);
      
      // Step 2: Functionality validation
      review.criteria.functionality = await this.validateFunctionality(originalCode, updatedCode, issue);
      
      // Step 3: Security validation
      review.criteria.security = await this.validateSecurity(updatedCode, issue);
      
      // Step 4: Best practices validation
      review.criteria.bestPractices = await this.validateBestPractices(updatedCode, issue);
      
      // Step 5: Performance validation
      review.criteria.performance = await this.validatePerformance(originalCode, updatedCode, issue);
      
      // Step 6: Calculate overall score
      review.overallScore = this.calculateOverallScore(review.criteria);
      
      // Step 7: Make approval decision
      review.approved = this.makeApprovalDecision(review);
      
      // Step 8: Generate summary
      review.summary = this.generateSummary(review, issue);
      
      console.log(`🔍 Review completed: ${review.approved ? 'APPROVED' : 'REJECTED'} (score: ${(review.overallScore * 100).toFixed(1)}%)`);
      
      return review;
      
    } catch (error) {
      console.error(`❌ Review failed: ${error.message}`);
      return {
        approved: false,
        overallScore: 0,
        criteria: {},
        issues: [`Review error: ${error.message}`],
        recommendations: [],
        securityIssues: [],
        bestPracticeIssues: [],
        summary: 'Review failed due to error'
      };
    }
  }

  async validateSyntax(code, issue) {
    const validation = {
      score: 0,
      issues: [],
      passed: false
    };

    try {
      if (issue.file.endsWith('.js')) {
        // JavaScript syntax validation
        new Function(code);
        validation.score = 1.0;
        validation.passed = true;
      } else if (issue.file.endsWith('.html')) {
        // Basic HTML syntax validation
        const tags = code.match(/<[^>]+>/g) || [];
        let openTags = 0;
        let syntaxErrors = 0;
        
        tags.forEach(tag => {
          if (tag.startsWith('</')) {
            openTags--;
          } else if (!tag.endsWith('/>') && !tag.includes('<!')) {
            openTags++;
          }
        });
        
        if (openTags === 0) {
          validation.score = 1.0;
          validation.passed = true;
        } else {
          validation.issues.push(`Unclosed tags: ${openTags}`);
          validation.score = Math.max(0, 1.0 - (openTags * 0.1));
        }
      } else {
        // For other file types, basic validation
        validation.score = 0.8;
        validation.passed = true;
      }
      
    } catch (error) {
      validation.issues.push(`Syntax error: ${error.message}`);
      validation.score = 0;
      validation.passed = false;
    }

    return validation;
  }

  async validateFunctionality(originalCode, updatedCode, issue) {
    const validation = {
      score: 0.8, // Start with good score
      issues: [],
      passed: false,
      changes: this.identifyChanges(originalCode, updatedCode)
    };

    // Check if the fix actually addresses the issue
    const addressesIssue = this.checkFixAddressesIssue(updatedCode, issue);
    if (!addressesIssue) {
      validation.issues.push('Fix does not address the identified issue');
      validation.score -= 0.5;
    }

    // Check if existing functionality is preserved
    const functionalityPreserved = this.checkFunctionalityPreserved(originalCode, updatedCode);
    if (!functionalityPreserved) {
      validation.issues.push('Existing functionality may be broken');
      validation.score -= 0.3;
    }

    // Check for regressions
    const regressions = this.checkForRegressions(originalCode, updatedCode);
    validation.issues.push(...regressions);
    validation.score -= regressions.length * 0.1;

    // Ensure minimum score
    validation.score = Math.max(0, validation.score);
    validation.passed = validation.score >= 0.6;

    return validation;
  }

  async validateSecurity(code, issue) {
    const validation = {
      score: 1.0,
      issues: [],
      passed: true,
      securityIssues: []
    };

    // Check for security patterns
    this.securityPatterns.forEach(pattern => {
      const matches = code.match(pattern.pattern);
      if (matches) {
        const issue = {
          type: pattern.description,
          severity: pattern.severity,
          occurrences: matches.length,
          lines: this.findLineNumbers(code, matches)
        };
        
        validation.securityIssues.push(issue);
        validation.issues.push(`Security issue: ${pattern.description} (${pattern.severity})`);
        
        // Deduct score based on severity
        const deduction = pattern.severity === 'high' ? 0.3 : pattern.severity === 'medium' ? 0.15 : 0.05;
        validation.score -= deduction * matches.length;
      }
    });

    // Check for additional security issues
    const additionalIssues = this.checkAdditionalSecurityIssues(code, issue);
    validation.securityIssues.push(...additionalIssues);
    validation.issues.push(...additionalIssues.map(issue => `Security: ${issue.description}`));

    // Ensure minimum score
    validation.score = Math.max(0, validation.score);
    validation.passed = validation.score >= 0.7;

    return validation;
  }

  async validateBestPractices(code, issue) {
    const validation = {
      score: 0.9, // Start with good score
      issues: [],
      passed: true,
      bestPracticeIssues: []
    };

    // Check for best practice patterns
    this.bestPracticePatterns.forEach(pattern => {
      const matches = code.match(pattern.pattern);
      if (matches) {
        const issue = {
          type: pattern.description,
          severity: pattern.severity,
          occurrences: matches.length,
          lines: this.findLineNumbers(code, matches)
        };
        
        validation.bestPracticeIssues.push(issue);
        validation.issues.push(`Best practice: ${pattern.description}`);
        
        // Deduct score based on severity
        const deduction = pattern.severity === 'high' ? 0.1 : pattern.severity === 'medium' ? 0.05 : 0.02;
        validation.score -= deduction * matches.length;
      }
    });

    // Check code quality metrics
    const qualityMetrics = this.checkCodeQuality(code);
    validation.issues.push(...qualityMetrics.issues);
    validation.score -= qualityMetrics.deduction;

    // Ensure minimum score
    validation.score = Math.max(0, validation.score);
    validation.passed = validation.score >= 0.6;

    return validation;
  }

  async validatePerformance(originalCode, updatedCode, issue) {
    const validation = {
      score: 0.9,
      issues: [],
      passed: true
    };

    // Check for performance issues
    const performanceIssues = this.checkPerformanceIssues(originalCode, updatedCode);
    validation.issues.push(...performanceIssues);
    validation.score -= performanceIssues.length * 0.1;

    // Check code complexity
    const complexity = this.checkCodeComplexity(updatedCode);
    if (complexity.tooComplex) {
      validation.issues.push(`Code complexity too high: ${complexity.complexity}`);
      validation.score -= 0.2;
    }

    // Ensure minimum score
    validation.score = Math.max(0, validation.score);
    validation.passed = validation.score >= 0.7;

    return validation;
  }

  identifyChanges(originalCode, updatedCode) {
    const originalLines = originalCode.split('\n');
    const updatedLines = updatedCode.split('\n');
    
    const changes = {
      additions: 0,
      modifications: 0,
      removals: 0,
      totalLines: Math.max(originalLines.length, updatedLines.length)
    };

    // Simple diff calculation
    const maxLines = Math.max(originalLines.length, updatedLines.length);
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i] || '';
      const updatedLine = updatedLines[i] || '';
      
      if (originalLine === '' && updatedLine !== '') {
        changes.additions++;
      } else if (originalLine !== '' && updatedLine === '') {
        changes.removals++;
      } else if (originalLine !== updatedLine) {
        changes.modifications++;
      }
    }

    return changes;
  }

  checkFixAddressesIssue(code, issue) {
    switch (issue.type) {
      case 'missing_try_catch':
        return code.includes('try') && code.includes('catch');
      
      case 'missing_form_validation':
        return code.includes('required');
      
      case 'console_error':
        return !code.includes('console.error') || code.includes('logger');
      
      case 'missing_charset':
        return code.includes('charset');
      
      case 'security_vulnerability':
        return !code.includes('eval') && !code.includes('new Function');
      
      case 'hardcoded_secrets':
        return code.includes('process.env');
      
      default:
        return true;
    }
  }

  checkFunctionalityPreserved(originalCode, updatedCode) {
    // Check if essential patterns are preserved
    const essentialPatterns = [
      /app\.(get|post|put|delete)/, // API routes
      /module\.exports/, // Exports
      /require\s*\(/, // Dependencies
      /function\s+\w+/, // Function definitions
      /const\s+\w+\s*=/, // Variable declarations
    ];

    for (const pattern of essentialPatterns) {
      const originalMatches = originalCode.match(pattern) || [];
      const updatedMatches = updatedCode.match(pattern) || [];
      
      if (updatedMatches.length < originalMatches.length) {
        return false;
      }
    }

    return true;
  }

  checkForRegressions(originalCode, updatedCode) {
    const regressions = [];
    
    // Check for potential regressions
    const regressionPatterns = [
      { pattern: /TODO|FIXME|XXX/, description: 'TODO comments left in code' },
      { pattern: /debugger/, description: 'Debugger statement left in code' },
      { pattern: /alert\s*\(/, description: 'Alert statement in production code' }
    ];

    regressionPatterns.forEach(pattern => {
      const matches = updatedCode.match(pattern.pattern);
      if (matches) {
        regressions.push(`Regression: ${pattern.description}`);
      }
    });

    return regressions;
  }

  findLineNumbers(code, matches) {
    const lines = code.split('\n');
    const lineNumbers = [];
    
    matches.forEach(match => {
      const index = code.indexOf(match);
      if (index !== -1) {
        const lineNumber = code.substring(0, index).split('\n').length;
        lineNumbers.push(lineNumber);
      }
    });
    
    return lineNumbers;
  }

  checkAdditionalSecurityIssues(code, issue) {
    const issues = [];
    
    // Check for SQL injection patterns
    if (code.includes('SELECT') && code.includes('+')) {
      issues.push({
        description: 'Potential SQL injection vulnerability',
        severity: 'high'
      });
    }
    
    // Check for XSS patterns
    if (code.includes('innerHTML') && code.includes('+')) {
      issues.push({
        description: 'Potential XSS vulnerability with innerHTML',
        severity: 'medium'
      });
    }
    
    // Check for hardcoded credentials
    if (code.match(/(username|user|pass)\s*[:=]\s*['"`][^'"`]+['"`]/i)) {
      issues.push({
        description: 'Hardcoded credentials detected',
        severity: 'high'
      });
    }
    
    return issues;
  }

  checkCodeQuality(code) {
    const issues = [];
    let deduction = 0;
    
    // Check line length
    const lines = code.split('\n');
    const longLines = lines.filter(line => line.length > 120);
    if (longLines.length > 0) {
      issues.push(`${longLines.length} lines exceed 120 characters`);
      deduction += longLines.length * 0.02;
    }
    
    // Check function length
    const functions = code.match(/function\s+\w+\s*\([^)]*\)\s*{[\s\S]*?}/g) || [];
    const longFunctions = functions.filter(func => func.split('\n').length > 50);
    if (longFunctions.length > 0) {
      issues.push(`${longFunctions.length} functions exceed 50 lines`);
      deduction += longFunctions.length * 0.05;
    }
    
    // Check nesting depth
    let maxNesting = 0;
    let currentNesting = 0;
    lines.forEach(line => {
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      currentNesting += openBraces - closeBraces;
      maxNesting = Math.max(maxNesting, currentNesting);
    });
    
    if (maxNesting > 5) {
      issues.push(`Maximum nesting depth: ${maxNesting} (recommended: ≤5)`);
      deduction += (maxNesting - 5) * 0.05;
    }
    
    return { issues, deduction };
  }

  checkPerformanceIssues(originalCode, updatedCode) {
    const issues = [];
    
    // Check for inefficient patterns
    const performancePatterns = [
      { pattern: /for\s*\([^)]*\)\s*{[^}]*\.length/g, description: 'Array.length in for loop' },
      { pattern: /document\.getElementById\s*\([^)]+\)\s*;?\s*document\.getElementById/g, description: 'Repeated DOM queries' },
      { pattern: /JSON\.parse\s*\([^)]+\)\s*;?\s*JSON\.parse/g, description: 'Repeated JSON parsing' }
    ];

    performancePatterns.forEach(pattern => {
      const matches = updatedCode.match(pattern.pattern);
      if (matches) {
        issues.push(`Performance issue: ${pattern.description}`);
      }
    });
    
    return issues;
  }

  checkCodeComplexity(code) {
    const lines = code.split('\n');
    let complexity = 0;
    
    // Calculate cyclomatic complexity
    lines.forEach(line => {
      const complexityKeywords = ['if', 'else', 'while', 'for', 'switch', 'case', 'catch', '&&', '||'];
      complexityKeywords.forEach(keyword => {
        if (line.includes(keyword)) {
          complexity++;
        }
      });
    });
    
    return {
      complexity,
      tooComplex: complexity > 50
    };
  }

  calculateOverallScore(criteria) {
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.entries(criteria).forEach(([criterion, result]) => {
      const weight = this.reviewCriteria[criterion]?.weight || 0;
      const score = result.score || 0;
      
      totalScore += score * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  makeApprovalDecision(review) {
    // Required criteria must pass
    const requiredCriteria = Object.entries(this.reviewCriteria)
      .filter(([_, config]) => config.required)
      .map(([criterion]) => criterion);
    
    for (const criterion of requiredCriteria) {
      if (!review.criteria[criterion]?.passed) {
        return false;
      }
    }
    
    // Overall score must be sufficient
    const minScore = 0.7;
    if (review.overallScore < minScore) {
      return false;
    }
    
    // No high-severity security issues
    const highSecurityIssues = review.securityIssues.filter(issue => issue.severity === 'high');
    if (highSecurityIssues.length > 0) {
      return false;
    }
    
    return true;
  }

  generateSummary(review, issue) {
    const status = review.approved ? 'APPROVED' : 'REJECTED';
    const score = (review.overallScore * 100).toFixed(1);
    
    let summary = `Review ${status} (Score: ${score}%)\n\n`;
    
    summary += `Criteria Results:\n`;
    Object.entries(review.criteria).forEach(([criterion, result]) => {
      const status = result.passed ? 'PASS' : 'FAIL';
      const score = (result.score * 100).toFixed(1);
      summary += `  ${criterion}: ${status} (${score}%)\n`;
    });
    
    if (review.issues.length > 0) {
      summary += `\nIssues Found:\n`;
      review.issues.slice(0, 5).forEach(issue => {
        summary += `  - ${issue}\n`;
      });
      
      if (review.issues.length > 5) {
        summary += `  ... and ${review.issues.length - 5} more\n`;
      }
    }
    
    if (review.securityIssues.length > 0) {
      summary += `\nSecurity Issues:\n`;
      review.securityIssues.forEach(issue => {
        summary += `  - ${issue.type} (${issue.severity})\n`;
      });
    }
    
    if (review.recommendations.length > 0) {
      summary += `\nRecommendations:\n`;
      review.recommendations.forEach(rec => {
        summary += `  - ${rec}\n`;
      });
    }
    
    return summary;
  }
}

module.exports = ReviewerAgent;
