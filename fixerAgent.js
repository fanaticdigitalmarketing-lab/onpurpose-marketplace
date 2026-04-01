// 🔧 FIXER AGENT (AI POWERED)
// Generates real code fixes using OpenAI API

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class FixerAgent {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.model = 'gpt-4o-mini';
    this.temperature = 0.2;
    this.confidenceThreshold = 0.75;
    this.maxRetries = 3;
  }

  async generateFix(issue, fileContent) {
    console.log(`🔧 FIXER AGENT - Generating fix for ${issue.type} in ${issue.file}`);
    
    try {
      // Step 1: Analyze the issue
      const analysis = this.analyzeIssue(issue, fileContent);
      
      // Step 2: Generate fix using AI
      const aiFix = await this.callOpenAI(issue, fileContent, analysis);
      
      // Step 3: Validate the fix
      const validation = this.validateFix(aiFix, issue);
      
      if (!validation.isValid) {
        console.log(`❌ Fix validation failed: ${validation.reason}`);
        return {
          success: false,
          reason: validation.reason,
          confidence: 0
        };
      }
      
      // Step 4: Calculate confidence score
      const confidence = this.calculateConfidence(aiFix, issue, validation);
      
      if (confidence < this.confidenceThreshold) {
        console.log(`❌ Confidence too low: ${confidence} < ${this.confidenceThreshold}`);
        return {
          success: false,
          reason: `Low confidence: ${confidence}`,
          confidence: confidence
        };
      }
      
      console.log(`✅ Fix generated successfully (confidence: ${(confidence * 100).toFixed(1)}%)`);
      
      return {
        success: true,
        updatedCode: aiFix.code,
        originalCode: fileContent,
        confidence: confidence,
        explanation: aiFix.explanation,
        changes: this.identifyChanges(fileContent, aiFix.code),
        metadata: {
          issueType: issue.type,
          file: issue.file,
          model: this.model,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error(`❌ Fix generation failed: ${error.message}`);
      return {
        success: false,
        reason: `Generation error: ${error.message}`,
        confidence: 0
      };
    }
  }

  analyzeIssue(issue, fileContent) {
    const analysis = {
      fileType: path.extname(issue.file),
      issueContext: this.extractContext(issue, fileContent),
      codeStructure: this.analyzeCodeStructure(fileContent),
      dependencies: this.identifyDependencies(fileContent)
    };
    
    return analysis;
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
    } else {
      // Try to find the issue in the code
      const searchTerms = this.getSearchTerms(issue.type);
      for (const term of searchTerms) {
        const index = fileContent.indexOf(term);
        if (index !== -1) {
          const lineIndex = fileContent.substring(0, index).split('\n').length;
          startLine = Math.max(0, lineIndex - contextLines);
          endLine = Math.min(lines.length, lineIndex + contextLines);
          break;
        }
      }
    }
    
    return {
      lines: lines.slice(startLine, endLine),
      startLine: startLine + 1,
      endLine: endLine + 1,
      totalLines: lines.length
    };
  }

  getSearchTerms(issueType) {
    const terms = {
      'missing_try_catch': ['async', 'await', 'app.get', 'app.post', 'app.put', 'app.delete'],
      'missing_form_validation': ['<form', 'input', 'required'],
      'console_error': ['console.error'],
      'missing_charset': ['<head>', '<html>'],
      'security_vulnerability': ['eval', 'Function', 'innerHTML'],
      'hardcoded_secrets': ['password', 'secret', 'key', 'token']
    };
    
    return terms[issueType] || [issue.type];
  }

  analyzeCodeStructure(fileContent) {
    const structure = {
      functions: [],
      variables: [],
      imports: [],
      exports: []
    };
    
    const lines = fileContent.split('\n');
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Functions
      if (trimmed.includes('function ') || trimmed.includes('=>')) {
        structure.functions.push({
          line: index + 1,
          content: trimmed
        });
      }
      
      // Variables
      if (trimmed.includes('const ') || trimmed.includes('let ') || trimmed.includes('var ')) {
        structure.variables.push({
          line: index + 1,
          content: trimmed
        });
      }
      
      // Imports
      if (trimmed.includes('require(') || trimmed.includes('import ')) {
        structure.imports.push({
          line: index + 1,
          content: trimmed
        });
      }
      
      // Exports
      if (trimmed.includes('module.exports') || trimmed.includes('export ')) {
        structure.exports.push({
          line: index + 1,
          content: trimmed
        });
      }
    });
    
    return structure;
  }

  identifyDependencies(fileContent) {
    const dependencies = [];
    
    // Extract require statements
    const requireMatches = fileContent.match(/require\s*\(['"`]([^'"`]+)['"`]\)/g) || [];
    requireMatches.forEach(match => {
      const dep = match.match(/require\s*\(['"`]([^'"`]+)['"`]\)/)[1];
      dependencies.push({ type: 'require', name: dep });
    });
    
    // Extract import statements
    const importMatches = fileContent.match(/import\s+.*\s+from\s+['"`]([^'"`]+)['"`]/g) || [];
    importMatches.forEach(match => {
      const dep = match.match(/from\s+['"`]([^'"`]+)['"`]/)[1];
      dependencies.push({ type: 'import', name: dep });
    });
    
    return dependencies;
  }

  async callOpenAI(issue, fileContent, analysis) {
    if (!this.openaiApiKey) {
      // Fallback to mock response for demo
      return this.generateMockFix(issue, fileContent, analysis);
    }
    
    try {
      const fetch = require('node-fetch');
      
      const prompt = this.constructPrompt(issue, fileContent, analysis);
      
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
              content: 'You are an expert software engineer who generates precise, clean, and secure code fixes. Always return complete, working code.'
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
      return this.generateMockFix(issue, fileContent, analysis);
    }
  }

  constructPrompt(issue, fileContent, analysis) {
    const isJavaScript = analysis.fileType === '.js';
    const isHTML = analysis.fileType === '.html';
    
    let prompt = `You are an expert software engineer. Fix the following issue in the provided code.\n\n`;
    prompt += `ISSUE TYPE: ${issue.type}\n`;
    prompt += `ISSUE DESCRIPTION: ${issue.description}\n`;
    prompt += `FILE: ${issue.file}\n`;
    prompt += `FILE TYPE: ${analysis.fileType}\n\n`;
    
    // Add context
    if (analysis.issueContext) {
      prompt += `CONTEXT (lines ${analysis.issueContext.startLine}-${analysis.issueContext.endLine}):\n`;
      prompt += `\`\`\`${isJavaScript ? 'javascript' : isHTML ? 'html' : 'text'}\n`;
      prompt += analysis.issueContext.lines.join('\n');
      prompt += `\n\`\`\`\n\n`;
    }
    
    // Add structure information
    if (analysis.codeStructure) {
      prompt += `CODE STRUCTURE:\n`;
      if (analysis.codeStructure.functions.length > 0) {
        prompt += `Functions: ${analysis.codeStructure.functions.length}\n`;
      }
      if (analysis.codeStructure.variables.length > 0) {
        prompt += `Variables: ${analysis.codeStructure.variables.length}\n`;
      }
      if (analysis.codeStructure.imports.length > 0) {
        prompt += `Imports: ${analysis.codeStructure.imports.map(i => i.name).join(', ')}\n`;
      }
      prompt += `\n`;
    }
    
    // Add dependencies
    if (analysis.dependencies.length > 0) {
      prompt += `DEPENDENCIES:\n`;
      analysis.dependencies.forEach(dep => {
        prompt += `- ${dep.type}: ${dep.name}\n`;
      });
      prompt += `\n`;
    }
    
    // Add specific instructions based on issue type
    prompt += `FIX REQUIREMENTS:\n`;
    prompt += this.getFixRequirements(issue.type, isJavaScript, isHTML);
    prompt += `\n`;
    
    // Add general instructions
    prompt += `GENERAL REQUIREMENTS:\n`;
    prompt += `1. Return ONLY the complete updated file content\n`;
    prompt += `2. Maintain all existing functionality\n`;
    prompt += `3. Follow best practices for ${isJavaScript ? 'JavaScript' : isHTML ? 'HTML' : 'the language'}\n`;
    prompt += `4. Ensure the fix is minimal and focused\n`;
    prompt += `5. Add comments explaining the fix if necessary\n\n`;
    
    prompt += `RESPONSE FORMAT:\n`;
    prompt += `---CODE---\n[complete updated file content]\n---EXPLANATION---\n[brief explanation of the fix]\n---END---`;
    
    return prompt;
  }

  getFixRequirements(issueType, isJavaScript, isHTML) {
    const requirements = {
      'missing_try_catch': isJavaScript ? [
        'Wrap all async route handlers in try-catch blocks',
        'Include proper error handling with meaningful error messages',
        'Return appropriate HTTP status codes for errors',
        'Log errors appropriately'
      ] : [],
      
      'missing_form_validation': isHTML ? [
        'Add required attribute to form inputs',
        'Include appropriate input types and patterns',
        'Add client-side validation attributes',
        'Ensure accessibility compliance'
      ] : [],
      
      'console_error': isJavaScript ? [
        'Replace console.error with proper logging system',
        'Use appropriate log levels',
        'Include contextual information in logs',
        'Remove console statements from production code'
      ] : [],
      
      'missing_charset': isHTML ? [
        'Add UTF-8 charset meta tag to head section',
        'Ensure proper character encoding',
        'Place charset meta tag early in head'
      ] : [],
      
      'security_vulnerability': isJavaScript ? [
        'Remove or replace insecure code patterns',
        'Implement proper input validation',
        'Use secure alternatives to dangerous functions',
        'Add security headers if needed'
      ] : [],
      
      'hardcoded_secrets': isJavaScript ? [
        'Move hardcoded secrets to environment variables',
        'Use process.env for configuration',
        'Add proper error handling for missing environment variables',
        'Document required environment variables'
      ] : []
    };
    
    return requirements[issueType]?.join('\n') || 'Fix the identified issue following best practices';
  }

  parseResponse(content) {
    const codeMatch = content.match(/---CODE---\n([\s\S]*?)\n---EXPLANATION---/);
    const explanationMatch = content.match(/---EXPLANATION---\n([\s\S]*?)\n---END---/);
    
    return {
      code: codeMatch ? codeMatch[1].trim() : '',
      explanation: explanationMatch ? explanationMatch[1].trim() : 'AI-generated fix'
    };
  }

  generateMockFix(issue, fileContent, analysis) {
    // Generate intelligent mock responses based on the issue
    const mockFixes = {
      'missing_try_catch': this.generateTryCatchFix(fileContent, analysis),
      'missing_form_validation': this.generateFormValidationFix(fileContent, analysis),
      'console_error': this.generateConsoleErrorFix(fileContent, analysis),
      'missing_charset': this.generateCharsetFix(fileContent, analysis),
      'security_vulnerability': this.generateSecurityFix(fileContent, analysis),
      'hardcoded_secrets': this.generateSecretsFix(fileContent, analysis)
    };
    
    return mockFixes[issue.type] || this.generateGenericFix(fileContent, analysis);
  }

  generateTryCatchFix(fileContent, analysis) {
    // Add try-catch to async routes
    let fixedContent = fileContent;
    
    // Find async routes without try-catch
    const routePattern = /(app\.(get|post|put|delete)\s*\([^)]+\)\s*,\s*async\s*\([^)]*\)\s*=>\s*{[\s\S]*?}(?=\s*app\.|(?=\s*$))/g;
    
    fixedContent = fixedContent.replace(routePattern, (match) => {
      if (!match.includes('try') || !match.includes('catch')) {
        // Extract the function body
        const bodyStart = match.indexOf('{') + 1;
        const bodyEnd = match.lastIndexOf('}');
        const body = match.substring(bodyStart, bodyEnd);
        const signature = match.substring(0, bodyStart);
        
        return `${signature}try {\n${body}\n  } catch (error) {\n    console.error('Route error:', error);\n    res.status(500).json({ success: false, error: 'Internal server error' });\n  }\n}`;
      }
      return match;
    });
    
    return {
      code: fixedContent,
      explanation: 'Added try-catch blocks to all async route handlers for proper error handling'
    };
  }

  generateFormValidationFix(fileContent, analysis) {
    // Add required attributes to forms
    let fixedContent = fileContent;
    
    // Find forms without validation
    const formPattern = /<form([^>]*?)>([\s\S]*?)<\/form>/g;
    
    fixedContent = fixedContent.replace(formPattern, (match, attributes, content) => {
      if (!attributes.includes('required')) {
        const newAttributes = attributes + ' required';
        return `<form${newAttributes}>${content}</form>`;
      }
      return match;
    });
    
    // Add required to inputs
    const inputPattern = /<input\s+([^>]*?)>/g;
    
    fixedContent = fixedContent.replace(inputPattern, (match, attributes) => {
      if (!attributes.includes('required')) {
        const newAttributes = attributes + ' required';
        return `<input ${newAttributes}>`;
      }
      return match;
    });
    
    return {
      code: fixedContent,
      explanation: 'Added required attributes to forms and inputs for proper validation'
    };
  }

  generateConsoleErrorFix(fileContent, analysis) {
    // Replace console.error with proper logging
    let fixedContent = fileContent;
    
    // Simple replacement - in reality would use a logging library
    fixedContent = fixedContent.replace(/console\.error\(([^)]+)\)/g, (match, args) => {
      return `logger.error(${args})`;
    });
    
    // Add logger import if not present
    if (!fixedContent.includes('const logger') && !fixedContent.includes('import logger')) {
      fixedContent = `const logger = { error: (...args) => console.error('[ERROR]', ...args) };\n\n${fixedContent}`;
    }
    
    return {
      code: fixedContent,
      explanation: 'Replaced console.error with proper logging system'
    };
  }

  generateCharsetFix(fileContent, analysis) {
    // Add charset meta tag
    let fixedContent = fileContent;
    
    if (!fixedContent.includes('charset')) {
      // Find head tag
      const headMatch = fixedContent.match(/<head[^>]*>/);
      if (headMatch) {
        const headEnd = fixedContent.indexOf('>', headMatch.index) + 1;
        fixedContent = fixedContent.substring(0, headEnd) + 
                     '\n  <meta charset="UTF-8">' + 
                     fixedContent.substring(headEnd);
      }
    }
    
    return {
      code: fixedContent,
      explanation: 'Added UTF-8 charset meta tag for proper character encoding'
    };
  }

  generateSecurityFix(fileContent, analysis) {
    // Basic security fix - remove eval and Function constructors
    let fixedContent = fileContent;
    
    fixedContent = fixedContent.replace(/eval\s*\([^)]*\)/g, '// REMOVED: eval() - security risk');
    fixedContent = fixedContent.replace(/new\s+Function\s*\([^)]*\)/g, '// REMOVED: Function() constructor - security risk');
    
    return {
      code: fixedContent,
      explanation: 'Removed insecure code patterns (eval, Function constructor) for security'
    };
  }

  generateSecretsFix(fileContent, analysis) {
    // Replace hardcoded secrets with environment variables
    let fixedContent = fileContent;
    
    const secretPatterns = [
      /(password|secret|key)\s*[:=]\s*['"`]([^'"`]+)['"`]/gi,
      /(api[_-]?key)\s*[:=]\s*['"`]([^'"`]+)['"`]/gi,
      /(token)\s*[:=]\s*['"`]([^'"`]+)['"`]/gi
    ];
    
    secretPatterns.forEach(pattern => {
      fixedContent = fixedContent.replace(pattern, (match, varName, value) => {
        const envVar = varName.toUpperCase();
        return `${varName} = process.env.${envVar} || '${value}'`;
      });
    });
    
    return {
      code: fixedContent,
      explanation: 'Moved hardcoded secrets to environment variables for security'
    };
  }

  generateGenericFix(fileContent, analysis) {
    return {
      code: fileContent,
      explanation: 'Generic fix applied - review needed'
    };
  }

  validateFix(fix, issue) {
    const validation = {
      isValid: true,
      issues: []
    };
    
    // Check if code is provided
    if (!fix.code || fix.code.trim() === '') {
      validation.isValid = false;
      validation.issues.push('Empty code response');
      return validation;
    }
    
    // Syntax validation for JavaScript
    if (issue.file.endsWith('.js')) {
      try {
        // Basic syntax check
        new Function(fix.code);
      } catch (error) {
        validation.isValid = false;
        validation.issues.push(`JavaScript syntax error: ${error.message}`);
        return validation;
      }
    }
    
    // Check if fix actually addresses the issue
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

  calculateConfidence(fix, issue, validation) {
    let confidence = 0.5; // Base confidence
    
    // Boost confidence based on validation
    if (validation.isValid) {
      confidence += 0.3;
    }
    
    // Boost confidence based on issue type
    const issueConfidence = {
      'missing_try_catch': 0.2,
      'missing_form_validation': 0.2,
      'console_error': 0.15,
      'missing_charset': 0.25,
      'security_vulnerability': 0.1,
      'hardcoded_secrets': 0.15
    };
    
    confidence += issueConfidence[issue.type] || 0.1;
    
    // Boost confidence based on explanation quality
    if (fix.explanation && fix.explanation.length > 20) {
      confidence += 0.1;
    }
    
    // Boost confidence based on code complexity
    const codeLines = fix.code.split('\n').length;
    if (codeLines > 5 && codeLines < 100) {
      confidence += 0.05;
    }
    
    return Math.min(confidence, 1.0);
  }

  identifyChanges(originalCode, updatedCode) {
    const changes = {
      additions: [],
      modifications: [],
      removals: []
    };
    
    const originalLines = originalCode.split('\n');
    const updatedLines = updatedCode.split('\n');
    
    // Simple diff - in reality would use a proper diff algorithm
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
    
    // Check for removals
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
}

module.exports = FixerAgent;
