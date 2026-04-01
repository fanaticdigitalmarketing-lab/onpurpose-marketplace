// 🔧 SELF-IMPROVING FIXER AGENT
// Learns from success/failure and evolves strategies over time

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const AgentMemorySystem = require('./agentMemorySystem');

class SelfImprovingFixerAgent {
  constructor() {
    this.memorySystem = new AgentMemorySystem();
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.model = 'gpt-4o-mini';
    this.temperature = 0.2;
    
    // Adaptive thresholds
    this.baseConfidenceThreshold = 0.75;
    this.currentConfidenceThreshold = this.baseConfidenceThreshold;
    
    // Strategy evolution
    this.strategies = this.initializeStrategies();
    this.currentPromptTemplates = this.initializePromptTemplates();
  }

  initializeStrategies() {
    return [
      {
        name: 'try_catch_wrapper',
        description: 'Wrap async functions in try-catch blocks',
        applicableIssues: ['missing_try_catch'],
        successRate: 0.8,
        weight: 1.0,
        promptTemplate: 'try_catch_wrapper'
      },
      {
        name: 'form_validation_attributes',
        description: 'Add validation attributes to form inputs',
        applicableIssues: ['missing_form_validation'],
        successRate: 0.9,
        weight: 1.2,
        promptTemplate: 'form_validation'
      },
      {
        name: 'charset_meta_tag',
        description: 'Add UTF-8 charset meta tag to HTML',
        applicableIssues: ['missing_charset'],
        successRate: 0.95,
        weight: 1.5,
        promptTemplate: 'charset_fix'
      },
      {
        name: 'logging_replacement',
        description: 'Replace console.error with proper logging',
        applicableIssues: ['console_error'],
        successRate: 0.85,
        weight: 1.1,
        promptTemplate: 'logging_fix'
      },
      {
        name: 'security_hardening',
        description: 'Remove security vulnerabilities',
        applicableIssues: ['security_vulnerability'],
        successRate: 0.7,
        weight: 0.9,
        promptTemplate: 'security_fix'
      },
      {
        name: 'environment_variables',
        description: 'Move hardcoded secrets to environment variables',
        applicableIssues: ['hardcoded_secrets'],
        successRate: 0.9,
        weight: 1.3,
        promptTemplate: 'secrets_fix'
      },
      {
        name: 'comprehensive_rewrite',
        description: 'Complete function rewrite for complex issues',
        applicableIssues: ['*'],
        successRate: 0.6,
        weight: 0.7,
        promptTemplate: 'comprehensive_fix'
      }
    ];
  }

  initializePromptTemplates() {
    return {
      try_catch_wrapper: {
        base: 'You are fixing missing error handling in an async function.',
        instructions: [
          'Wrap the entire function body in try-catch',
          'Return appropriate error responses',
          'Log errors appropriately',
          'Maintain existing functionality'
        ],
        success_indicators: ['try', 'catch', 'error handling', 'status 500'],
        failure_indicators: ['console.error', 'unhandled', 'no catch']
      },
      
      form_validation: {
        base: 'You are adding validation to HTML forms.',
        instructions: [
          'Add required attributes to inputs',
          'Include pattern validation where appropriate',
          'Add minlength and maxlength',
          'Include helpful title attributes'
        ],
        success_indicators: ['required', 'pattern', 'minlength', 'maxlength'],
        failure_indicators: ['no validation', 'missing required']
      },
      
      charset_fix: {
        base: 'You are fixing missing charset in HTML.',
        instructions: [
          'Add UTF-8 charset meta tag',
          'Place it early in head section',
          'Ensure proper HTML structure'
        ],
        success_indicators: ['charset="UTF-8"', '<meta charset'],
        failure_indicators: ['no charset', 'wrong charset']
      },
      
      logging_fix: {
        base: 'You are replacing console.error with proper logging.',
        instructions: [
          'Replace console.error with logger.error',
          'Add proper logger import if needed',
          'Maintain error information',
          'Use structured logging'
        ],
        success_indicators: ['logger.error', 'structured logging'],
        failure_indicators: ['console.error', 'no logger']
      },
      
      security_fix: {
        base: 'You are fixing security vulnerabilities.',
        instructions: [
          'Remove eval() and Function() constructors',
          'Sanitize user inputs',
          'Use secure alternatives',
          'Add input validation'
        ],
        success_indicators: ['sanitized', 'secure', 'no eval'],
        failure_indicators: ['eval', 'Function', 'innerHTML']
      },
      
      secrets_fix: {
        base: 'You are moving hardcoded secrets to environment variables.',
        instructions: [
          'Replace hardcoded values with process.env',
          'Add fallback values for safety',
          'Document required environment variables',
          'Use proper naming conventions'
        ],
        success_indicators: ['process.env', 'environment variables'],
        failure_indicators: ['hardcoded', 'secret', 'password']
      },
      
      comprehensive_fix: {
        base: 'You are completely rewriting a function to fix complex issues.',
        instructions: [
          'Analyze the function purpose',
          'Rewrite with best practices',
          'Maintain API compatibility',
          'Add comprehensive error handling'
        ],
        success_indicators: ['rewritten', 'improved', 'best practices'],
        failure_indicators: ['broken', 'incompatible', 'regression']
      }
    };
  }

  async generateFix(issue, fileContent) {
    console.log(`🔧 SELF-IMPROVING FIXER - Generating fix for ${issue.type} in ${issue.file}`);
    
    const startTime = Date.now();
    
    try {
      // Step 1: Select best strategy based on memory
      const strategy = this.selectBestStrategy(issue);
      
      if (!strategy) {
        return {
          success: false,
          reason: 'No suitable strategy found',
          confidence: 0,
          strategy: null
        };
      }
      
      console.log(`🧠 Using strategy: ${strategy.name} (success rate: ${(strategy.successRate * 100).toFixed(1)}%)`);
      
      // Step 2: Generate fix using evolved prompt
      const fixResult = await this.generateFixWithStrategy(issue, fileContent, strategy);
      
      // Step 3: Validate fix
      const validation = this.validateFix(fixResult, issue);
      
      if (!validation.isValid) {
        await this.recordFailure(issue, strategy, validation.reason, Date.now() - startTime);
        return {
          success: false,
          reason: validation.reason,
          confidence: 0,
          strategy: strategy.name
        };
      }
      
      // Step 4: Calculate confidence with learning
      const confidence = this.calculateAdaptiveConfidence(fixResult, issue, strategy);
      
      // Step 5: Check adaptive threshold
      if (confidence < this.currentConfidenceThreshold) {
        await this.recordFailure(issue, strategy, `Low confidence: ${confidence}`, Date.now() - startTime);
        return {
          success: false,
          reason: `Low confidence: ${confidence}`,
          confidence: confidence,
          strategy: strategy.name
        };
      }
      
      // Step 6: Record success
      await this.recordSuccess(issue, strategy, fixResult, Date.now() - startTime);
      
      console.log(`✅ Fix generated successfully (confidence: ${(confidence * 100).toFixed(1)}%)`);
      
      return {
        success: true,
        updatedCode: fixResult.code,
        originalCode: fileContent,
        confidence: confidence,
        explanation: fixResult.explanation,
        strategy: strategy.name,
        changes: this.identifyChanges(fileContent, fixResult.code),
        metadata: {
          issueType: issue.type,
          file: issue.file,
          model: this.model,
          strategy: strategy.name,
          successRate: strategy.successRate,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error(`❌ Fix generation failed: ${error.message}`);
      await this.recordFailure(issue, null, `Generation error: ${error.message}`, Date.now() - startTime);
      
      return {
        success: false,
        reason: `Generation error: ${error.message}`,
        confidence: 0,
        strategy: null
      };
    }
  }

  selectBestStrategy(issue) {
    // Get best strategy from memory
    const memoryStrategy = this.memorySystem.getBestStrategy('fixer', issue.type);
    
    if (memoryStrategy) {
      // Find corresponding strategy in our list
      const strategy = this.strategies.find(s => s.name === memoryStrategy.name);
      if (strategy) {
        // Update strategy with memory data
        strategy.successRate = memoryStrategy.successRate;
        strategy.weight = memoryStrategy.weight;
        return strategy;
      }
    }
    
    // Fallback to local strategy selection
    const applicableStrategies = this.strategies.filter(s => 
      s.applicableIssues.includes('*') || s.applicableIssues.includes(issue.type)
    );
    
    if (applicableStrategies.length === 0) {
      return null;
    }
    
    // Sort by weighted score
    applicableStrategies.sort((a, b) => {
      const scoreA = a.successRate * a.weight;
      const scoreB = b.successRate * b.weight;
      return scoreB - scoreA;
    });
    
    return applicableStrategies[0];
  }

  async generateFixWithStrategy(issue, fileContent, strategy) {
    // Get evolved prompt template
    const promptTemplate = this.evolvePromptTemplate(strategy);
    
    // Construct enhanced prompt
    const prompt = this.constructEnhancedPrompt(issue, fileContent, strategy, promptTemplate);
    
    // Call AI with evolved prompt
    const response = await this.callOpenAI(prompt);
    
    return this.parseResponse(response);
  }

  evolvePromptTemplate(strategy) {
    const baseTemplate = this.currentPromptTemplates[strategy.promptTemplate];
    
    if (!baseTemplate) {
      return {
        base: 'You are fixing a code issue.',
        instructions: ['Fix the identified issue'],
        success_indicators: ['fixed'],
        failure_indicators: ['broken']
      };
    }
    
    // Evolve template based on learning
    const evolvedTemplate = { ...baseTemplate };
    
    // Add learning-based modifications
    const failurePatterns = this.memorySystem.getFailurePatterns('fixer');
    const relevantFailures = failurePatterns.filter(p => 
      p.pattern.includes(strategy.name) || p.pattern.includes(strategy.promptTemplate)
    );
    
    if (relevantFailures.length > 0) {
      // Add instructions to avoid common failures
      relevantFailures.forEach(failure => {
        if (!evolvedTemplate.instructions.some(inst => inst.includes(failure.pattern))) {
          evolvedTemplate.instructions.push(`Avoid: ${failure.pattern}`);
        }
      });
    }
    
    return evolvedTemplate;
  }

  constructEnhancedPrompt(issue, fileContent, strategy, promptTemplate) {
    const isJavaScript = issue.file.endsWith('.js');
    const isHTML = issue.file.endsWith('.html');
    
    let prompt = `${promptTemplate.base}\n\n`;
    prompt += `ISSUE TYPE: ${issue.type}\n`;
    prompt += `ISSUE DESCRIPTION: ${issue.description}\n`;
    prompt += `FILE: ${issue.file}\n`;
    prompt += `STRATEGY: ${strategy.name}\n`;
    prompt += `STRATEGY SUCCESS RATE: ${(strategy.successRate * 100).toFixed(1)}%\n\n`;
    
    // Add context
    const context = this.extractContext(issue, fileContent);
    if (context) {
      prompt += `CONTEXT (lines ${context.startLine}-${context.endLine}):\n`;
      prompt += `\`\`\`${isJavaScript ? 'javascript' : isHTML ? 'html' : 'text'}\n`;
      prompt += context.lines.join('\n');
      prompt += `\n\`\`\`\n\n`;
    }
    
    // Add evolved instructions
    prompt += `INSTRUCTIONS:\n`;
    promptTemplate.instructions.forEach((instruction, index) => {
      prompt += `${index + 1}. ${instruction}\n`;
    });
    
    // Add learning-based guidance
    prompt += `\nLEARNING GUIDANCE:\n`;
    prompt += `1. Previous fixes with this strategy have ${(strategy.successRate * 100).toFixed(1)}% success rate\n`;
    prompt += `2. Focus on patterns that have worked before\n`;
    prompt += `3. Avoid approaches that have failed\n`;
    
    // Add success/failure indicators
    if (promptTemplate.success_indicators.length > 0) {
      prompt += `\nSUCCESS INDICATORS:\n`;
      promptTemplate.success_indicators.forEach(indicator => {
        prompt += `- Include: ${indicator}\n`;
      });
    }
    
    if (promptTemplate.failure_indicators.length > 0) {
      prompt += `\nAVOID:\n`;
      promptTemplate.failure_indicators.forEach(indicator => {
        prompt += `- Avoid: ${indicator}\n`;
      });
    }
    
    // Add response format
    prompt += `\nRESPONSE FORMAT:\n`;
    prompt += `---CODE---\n[complete updated file content]\n---EXPLANATION---\n[brief explanation of fix and strategy used]\n---STRATEGY-ANALYSIS---\n[analysis of why this strategy was chosen]\n---END---`;
    
    return prompt;
  }

  extractContext(issue, fileContent) {
    const lines = fileContent.split('\n');
    const contextLines = 20;
    
    let startLine = 0;
    let endLine = lines.length;
    
    if (issue.lineNumbers && issue.lineNumbers.length > 0) {
      const lineNumber = issue.lineNumbers[0];
      startLine = Math.max(0, lineNumber - contextLines);
      endLine = Math.min(lines.length, lineNumber + contextLines);
    }
    
    return {
      lines: lines.slice(startLine, endLine),
      startLine: startLine + 1,
      endLine: endLine + 1,
      totalLines: lines.length
    };
  }

  async callOpenAI(prompt) {
    if (!this.openaiApiKey) {
      return this.generateMockResponse(prompt);
    }
    
    try {
      const fetch = require('node-fetch');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert software engineer who generates precise, clean, and secure code fixes. Always return complete, working code and explain your strategy choices.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: this.temperature,
          max_tokens: 2000
        })
      });
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      
      return this.parseResponse(content);
      
    } catch (error) {
      console.error('OpenAI API call failed:', error.message);
      return this.generateMockResponse(prompt);
    }
  }

  parseResponse(content) {
    const codeMatch = content.match(/---CODE---\n([\s\S]*?)\n---EXPLANATION---/);
    const explanationMatch = content.match(/---EXPLANATION---\n([\s\S]*?)\n---STRATEGY-ANALYSIS---/);
    const strategyMatch = content.match(/---STRATEGY-ANALYSIS---\n([\s\S]*?)\n---END---/);
    
    return {
      code: codeMatch ? codeMatch[1].trim() : '',
      explanation: explanationMatch ? explanationMatch[1].trim() : 'AI-generated fix',
      strategyAnalysis: strategyMatch ? strategyMatch[1].trim() : 'Strategy chosen based on issue type'
    };
  }

  generateMockResponse(prompt) {
    // Generate intelligent mock responses based on strategy
    const strategyMatch = prompt.match(/STRATEGY: ([^\n]+)/);
    const strategy = strategyMatch ? strategyMatch[1] : 'unknown';
    
    const mockResponses = {
      'try_catch_wrapper': {
        code: `try {
  // Existing code here
  const result = await someOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { success: false, error: 'Internal server error' };
}`,
        explanation: 'Added try-catch wrapper for proper error handling',
        strategyAnalysis: 'Chose try-catch wrapper strategy based on high success rate (80%) for async error handling'
      },
      
      'form_validation_attributes': {
        code: `<input 
  type="text" 
  name="username" 
  required 
  minlength="2" 
  maxlength="50" 
  pattern="[a-zA-Z0-9]+" 
  title="Username must be 2-50 characters, letters and numbers only"
/>`,
        explanation: 'Added comprehensive validation attributes to form input',
        strategyAnalysis: 'Chose form validation strategy based on excellent success rate (90%) for HTML form issues'
      },
      
      'charset_meta_tag': {
        code: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title</title>
</head>`,
        explanation: 'Added UTF-8 charset meta tag to ensure proper character encoding',
        strategyAnalysis: 'Chose charset fix strategy based on outstanding success rate (95%) for HTML encoding issues'
      }
    };
    
    return mockResponses[strategy] || {
      code: '// Mock fix would appear here',
      explanation: 'Mock fix generated based on strategy analysis',
      strategyAnalysis: `Chose ${strategy} strategy based on available patterns`
    };
  }

  validateFix(fix, issue) {
    const validation = {
      isValid: true,
      issues: []
    };
    
    if (!fix.code || fix.code.trim() === '') {
      validation.isValid = false;
      validation.issues.push('Empty code response');
      return validation;
    }
    
    // Syntax validation
    if (issue.file.endsWith('.js')) {
      try {
        new Function(fix.code);
      } catch (error) {
        validation.isValid = false;
        validation.issues.push(`JavaScript syntax error: ${error.message}`);
        return validation;
      }
    }
    
    // Check if fix addresses issue
    const addressesIssue = this.checkFixAddressesIssue(fix.code, issue);
    if (!addressesIssue) {
      validation.isValid = false;
      validation.issues.push('Fix does not address the identified issue');
    }
    
    return validation;
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

  calculateAdaptiveConfidence(fix, issue, strategy) {
    let confidence = 0.5; // Base confidence
    
    // Strategy success rate influence
    confidence += strategy.successRate * 0.3;
    
    // Strategy weight influence
    confidence += (strategy.weight - 1.0) * 0.1;
    
    // Issue type familiarity
    const familiarityBonus = this.calculateFamiliarityBonus(issue.type, strategy);
    confidence += familiarityBonus;
    
    // Explanation quality
    if (fix.explanation && fix.explanation.length > 20) {
      confidence += 0.05;
    }
    
    // Recent performance adjustment
    const recentAdjustment = this.getRecentPerformanceAdjustment();
    confidence += recentAdjustment;
    
    return Math.min(1.0, Math.max(0, confidence));
  }

  calculateFamiliarityBonus(issueType, strategy) {
    // Check if this strategy has been successful with this issue type before
    const memoryPerformance = this.memorySystem.getAgentPerformance('fixer');
    if (!memoryPerformance) return 0;
    
    const relevantStrategies = memoryPerformance.strategies.filter(s => 
      s.name === strategy.name
    );
    
    if (relevantStrategies.length > 0) {
      return relevantStrategies[0].successRate * 0.1;
    }
    
    return 0;
  }

  getRecentPerformanceAdjustment() {
    const recentPerformance = this.memorySystem.getRecentSuccessRate();
    const overallPerformance = this.memorySystem.memory.globalMetrics.overallSuccessRate;
    
    if (overallPerformance === 0) return 0;
    
    const improvement = (recentPerformance - overallPerformance) / overallPerformance;
    return Math.max(-0.1, Math.min(0.1, improvement * 0.2));
  }

  identifyChanges(originalCode, updatedCode) {
    const changes = {
      additions: [],
      modifications: [],
      removals: []
    };
    
    const originalLines = originalCode.split('\n');
    const updatedLines = updatedCode.split('\n');
    
    updatedLines.forEach((line, index) => {
      if (index >= originalLines.length) {
        changes.additions.push({
          line: index + 1,
          content: line
        });
      } else if (originalLines[index] !== line) {
        changes.modifications.push({
          line: index + 1,
          original: originalLines[index],
          updated: line
        });
      }
    });
    
    originalLines.forEach((line, index) => {
      if (index >= updatedLines.length) {
        changes.removals.push({
          line: index + 1,
          content: line
        });
      }
    });
    
    return changes;
  }

  async recordSuccess(issue, strategy, fixResult, duration) {
    // Update memory system
    this.memorySystem.updateAgentPerformance('fixer', {
      success: true,
      strategy: strategy.name,
      issueType: issue.type,
      confidence: fixResult.confidence,
      duration: duration
    });
    
    // Update local strategy data
    const localStrategy = this.strategies.find(s => s.name === strategy.name);
    if (localStrategy) {
      localStrategy.successRate = this.memorySystem.memory.agents.fixer.strategies
        .find(s => s.name === strategy.name)?.successRate || localStrategy.successRate;
      localStrategy.weight = this.memorySystem.memory.agents.fixer.strategies
        .find(s => s.name === strategy.name)?.weight || localStrategy.weight;
    }
    
    // Add global pattern
    this.memorySystem.addGlobalPattern({
      type: issue.type,
      strategy: strategy.name,
      success: true,
      description: `Successfully fixed ${issue.type} using ${strategy.name}`
    });
    
    // Adjust confidence threshold based on performance
    this.adjustConfidenceThreshold();
    
    console.log(`🧠 Recorded success for strategy: ${strategy.name}`);
  }

  async recordFailure(issue, strategy, reason, duration) {
    // Update memory system
    this.memorySystem.updateAgentPerformance('fixer', {
      success: false,
      strategy: strategy?.name || 'unknown',
      issueType: issue.type,
      reason: reason,
      duration: duration
    });
    
    // Update local strategy data
    if (strategy) {
      const localStrategy = this.strategies.find(s => s.name === strategy.name);
      if (localStrategy) {
        localStrategy.successRate = this.memorySystem.memory.agents.fixer.strategies
          .find(s => s.name === strategy.name)?.successRate || localStrategy.successRate;
        localStrategy.weight = this.memorySystem.memory.agents.fixer.strategies
          .find(s => s.name === strategy.name)?.weight || localStrategy.weight;
      }
    }
    
    // Add global pattern
    this.memorySystem.addGlobalPattern({
      type: issue.type,
      strategy: strategy?.name || 'unknown',
      success: false,
      description: `Failed to fix ${issue.type}: ${reason}`
    });
    
    // Adjust confidence threshold based on performance
    this.adjustConfidenceThreshold();
    
    console.log(`🧠 Recorded failure: ${reason}`);
  }

  adjustConfidenceThreshold() {
    const performance = this.memorySystem.memory.agents.fixer.performance;
    
    if (performance.successRate > 0.9) {
      // High performance - can be more lenient
      this.currentConfidenceThreshold = this.baseConfidenceThreshold * 0.9;
    } else if (performance.successRate < 0.6) {
      // Low performance - be more strict
      this.currentConfidenceThreshold = this.baseConfidenceThreshold * 1.1;
    } else {
      // Reset to base
      this.currentConfidenceThreshold = this.baseConfidenceThreshold;
    }
    
    console.log(`🎯 Adjusted confidence threshold to: ${(this.currentConfidenceThreshold * 100).toFixed(1)}%`);
  }

  getPerformanceMetrics() {
    return {
      currentThreshold: this.currentConfidenceThreshold,
      strategies: this.strategies.map(s => ({
        name: s.name,
        successRate: s.successRate,
        weight: s.weight,
        applicableIssues: s.applicableIssues
      })),
      memoryPerformance: this.memorySystem.getAgentPerformance('fixer'),
      adaptiveThresholds: this.memorySystem.getAdaptiveThresholds('fixer')
    };
  }

  generateLearningReport() {
    const performance = this.memorySystem.getAgentPerformance('fixer');
    
    return {
      agent: 'fixer',
      timestamp: new Date().toISOString(),
      performance: performance,
      strategies: this.strategies,
      adaptiveThresholds: this.currentConfidenceThreshold,
      topStrategies: performance.topStrategies,
      failurePatterns: performance.failurePatterns,
      recommendations: this.generateSelfRecommendations()
    };
  }

  generateSelfRecommendations() {
    const recommendations = [];
    const performance = this.memorySystem.getAgentPerformance('fixer');
    
    if (performance.successRate < 0.7) {
      recommendations.push({
        priority: 'high',
        type: 'performance_improvement',
        message: 'Consider reviewing and improving fix strategies',
        action: 'Analyze failure patterns and adjust approach'
      });
    }
    
    const topFailure = performance.failurePatterns[0];
    if (topFailure && topFailure.count > 5) {
      recommendations.push({
        priority: 'medium',
        type: 'failure_pattern',
        message: `High failure rate for: ${topFailure.pattern}`,
        action: 'Develop specialized strategy for this pattern'
      });
    }
    
    if (this.currentConfidenceThreshold > this.baseConfidenceThreshold * 1.05) {
      recommendations.push({
        priority: 'low',
        type: 'threshold_adjustment',
        message: 'Confidence threshold is elevated due to low performance',
        action: 'Focus on improving fix quality to lower threshold'
      });
    }
    
    return recommendations;
  }
}

module.exports = SelfImprovingFixerAgent;
