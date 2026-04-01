const { generateFix } = require('./ai-fix-engine');
const { createBackup, rollback } = require('./rollback-manager');
const fs = require('fs');

/**
 * Enhanced Self-Learning Engine with AI fixes and safety
 */
class EnhancedSelfLearningEngine {
  constructor() {
    this.fixHistory = [];
    this.successRate = 0;
    this.learnedRules = [];
  }

  async executeFullCycle() {
    console.log('🚀 Starting Enhanced Self-Learning Engine cycle...');
    const startTime = Date.now();

    try {
      // 1. Detect issues
      const issues = await this.detectIssues();
      console.log(`🔍 Detected ${issues.length} issues`);

      // 2. Apply fixes with AI and safety
      const fixResults = await this.applyFixesWithSafety(issues);
      console.log(`🔧 Applied ${fixResults.successful.length} fixes`);

      // 3. Commit successful fixes
      await this.commitFixes(fixResults.successful);

      // 4. Update learning
      this.updateLearning(fixResults);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      return {
        success: true,
        issuesDetected: issues.length,
        fixesApplied: fixResults.successful.length,
        learnedRules: this.learnedRules.length,
        systemHealth: this.calculateHealth(),
        duration: `${duration}s`,
        fixResults
      };

    } catch (error) {
      console.error('❌ Engine cycle failed:', error.message);
      return {
        success: false,
        error: error.message,
        duration: ((Date.now() - startTime) / 1000).toFixed(2) + 's'
      };
    }
  }

  async applyFixesWithSafety(issues) {
    const results = { successful: [], failed: [] };

    for (const issue of issues) {
      try {
        // Create backup before fixing
        createBackup(issue.file);

        // Try AI fix first
        const aiFixedCode = await generateFix(issue.error, issue.file);
        
        if (aiFixedCode) {
          // Apply AI fix
          fs.writeFileSync(issue.file, aiFixedCode);
          
          // Test the fix
          const testResult = await this.testFix(issue.file);
          
          if (testResult.success) {
            results.successful.push({
              file: issue.file,
              error: issue.error,
              method: 'AI',
              fixedCode: aiFixedCode
            });
            console.log(`✅ AI fix applied: ${issue.file}`);
          } else {
            // Rollback failed AI fix
            rollback(issue.file);
            results.failed.push({
              file: issue.file,
              error: issue.error,
              method: 'AI',
              reason: 'Fix test failed'
            });
            console.log(`❌ AI fix failed, rolled back: ${issue.file}`);
          }
        } else {
          // Try pattern-based fix as fallback
          const patternFix = this.applyPatternFix(issue);
          if (patternFix) {
            results.successful.push({
              file: issue.file,
              error: issue.error,
              method: 'Pattern',
              fixedCode: patternFix
            });
            console.log(`✅ Pattern fix applied: ${issue.file}`);
          } else {
            results.failed.push({
              file: issue.file,
              error: issue.error,
              method: 'None',
              reason: 'No fix available'
            });
          }
        }

      } catch (error) {
        // Rollback on any error
        rollback(issue.file);
        results.failed.push({
          file: issue.file,
          error: issue.error,
          method: 'Error',
          reason: error.message
        });
        console.log(`❌ Fix error, rolled back: ${issue.file}`);
      }
    }

    return results;
  }

  async detectIssues() {
    // Simplified issue detection
    const issues = [];
    
    // Check common files
    const filesToCheck = ['server.js', 'package.json', 'index.html'];
    
    for (const file of filesToCheck) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Detect various issue types
        if (content.includes('console.error') && !content.includes('try')) {
          issues.push({
            file,
            error: { type: 'missing_error_handling', severity: 'medium' }
          });
        }
        
        if (file === 'index.html' && !content.includes('<!DOCTYPE html>')) {
          issues.push({
            file,
            error: { type: 'missing_doctype', severity: 'high' }
          });
        }
      }
    }
    
    return issues;
  }

  applyPatternFix(issue) {
    // Simple pattern-based fixes as fallback
    if (issue.error.type === 'missing_error_handling') {
      return this.addErrorHandling(issue.file);
    }
    
    if (issue.error.type === 'missing_doctype') {
      return this.addDoctype(issue.file);
    }
    
    return null;
  }

  addErrorHandling(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    // Simple error handling addition
    const fixedContent = content.replace(
      /(app\.(get|post|put|delete)\(['"`]([^'"`]+)['"`],\s*async\s*\(req,\s*res\)\s*=>\s*{)/g,
      '$1\n  try {'
    ).replace(
      /(}\s*$)/gm,
      '  } catch (error) {\n    console.error("API Error:", error);\n    res.status(500).json({ error: "Internal server error" });\n  }\n}'
    );
    
    return fixedContent !== content ? fixedContent : null;
  }

  addDoctype(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.startsWith('<!DOCTYPE html>')) {
      return '<!DOCTYPE html>\n' + content;
    }
    return null;
  }

  async testFix(filePath) {
    // Simple test - check if file is still valid
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Basic syntax check for JavaScript files
      if (filePath.endsWith('.js')) {
        new Function(content);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async commitFixes(fixes) {
    const { autoCommitFixes } = require('./autoCommitFixes');
    return await autoCommitFixes(fixes);
  }

  updateLearning(results) {
    // Update learned rules based on successful fixes
    results.successful.forEach(fix => {
      if (!this.learnedRules.find(rule => rule.type === fix.error.type)) {
        this.learnedRules.push({
          type: fix.error.type,
          method: fix.method,
          success: true,
          createdAt: new Date().toISOString()
        });
      }
    });
    
    // Calculate success rate
    const total = results.successful.length + results.failed.length;
    this.successRate = total > 0 ? (results.successful.length / total * 100).toFixed(1) : 0;
  }

  calculateHealth() {
    // Simple health calculation
    const baseHealth = 50;
    const fixBonus = Math.min(this.learnedRules.length * 2, 30);
    const successBonus = parseFloat(this.successRate) * 0.2;
    
    return Math.min(baseHealth + fixBonus + successBonus, 100).toFixed(0);
  }
}

module.exports = EnhancedSelfLearningEngine;
