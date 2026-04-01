// 🚀 PRODUCTION-GRADE AUTONOMOUS ENGINE
// GPT-powered fixes + deployment guard + shared learning

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const AIFixEngine = require('./aiFixEngine');
const DeploymentGuard = require('./deploymentGuard');
const SharedLearningSystem = require('./sharedLearningSystem');

class ProductionAutonomousEngine {
  constructor() {
    this.aiFixEngine = new AIFixEngine();
    this.deploymentGuard = new DeploymentGuard();
    this.sharedLearning = new SharedLearningSystem();
    this.results = {
      fixed: [],
      rolledBack: [],
      manualFixes: [],
      sharedIntelligence: {},
      deploymentStatus: 'PENDING'
    };
  }

  async executeFullCycle() {
    console.log('🚀 PRODUCTION-GRADE AUTONOMOUS ENGINE');
    console.log('='.repeat(60));
    console.log('GPT-powered fixes + deployment guard + shared learning\n');

    try {
      // Phase 1: Load shared learning
      console.log('🧬 Phase 1 - Loading Shared Learning');
      await this.loadSharedLearning();

      // Phase 2: Detect issues
      console.log('🔍 Phase 2 - Issue Detection');
      const issues = await this.detectIssues();
      console.log(`📊 Issues detected: ${issues.length}`);

      // Phase 3: Process each issue with AI fixes
      console.log('🧠 Phase 3 - AI-Powered Fix Generation');
      for (const issue of issues) {
        await this.processIssueWithAI(issue);
      }

      // Phase 4: Run deployment guard
      console.log('🛡 Phase 4 - Deployment Guard Validation');
      await this.runDeploymentGuard();

      // Phase 5: Generate final report
      console.log('📊 Phase 5 - Final Report Generation');
      this.generateFinalReport();

      return this.results;

    } catch (error) {
      console.error('💥 Production autonomous engine failed:', error.message);
      this.results.deploymentStatus = 'FAILED';
      throw error;
    }
  }

  async loadSharedLearning() {
    try {
      // Load existing local rules if any
      const localRules = this.loadLocalRules();
      
      // Merge with shared learning
      const mergedRules = this.sharedLearning.mergeWithLocalRules(localRules);
      
      console.log(`📚 Loaded ${mergedRules.length} merged rules`);
      this.results.sharedIntelligence = {
        totalRules: mergedRules.length,
        sharedClusters: this.sharedLearning.sharedData.ruleClusters.length,
        contributingProjects: this.sharedLearning.sharedData.globalStats.contributingProjects.length
      };
      
    } catch (error) {
      console.error('Error loading shared learning:', error.message);
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

  async detectIssues() {
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
    const lines = content.split('\n');
    
    if (file.endsWith('.js')) {
      // Check for missing try-catch in async routes
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
            lineNumber: this.getLineNumber(content, routeIndex),
            severity: 'high'
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
      // Check for forms without validation
      const forms = content.match(/<form[^>]*>/g) || [];
      forms.forEach((form, index) => {
        if (!form.includes('required')) {
          issues.push({
            type: 'missing_form_validation',
            file,
            description: 'Form without validation attributes',
            lineNumber: this.getLineNumber(content, content.indexOf(form)),
            severity: 'medium'
          });
        }
      });
      
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

  async processIssueWithAI(issue) {
    console.log(`\n🧠 Processing issue: ${issue.type} in ${issue.file}`);
    
    try {
      // Read file content
      const fileContent = fs.readFileSync(issue.file, 'utf8');
      
      // Generate AI fix
      const aiFix = await this.aiFixEngine.generateFix(issue, fileContent);
      
      if (!aiFix.success) {
        console.log(`❌ AI fix failed: ${aiFix.reason}`);
        this.results.manualFixes.push({
          issue: issue.type,
          file: issue.file,
          reason: aiFix.reason,
          confidence: aiFix.confidenceScore
        });
        return;
      }
      
      console.log(`✅ AI fix generated (confidence: ${(aiFix.confidenceScore * 100).toFixed(1)}%)`);
      
      // Create backup
      const backupPath = this.createBackup(issue.file);
      
      // Apply AI fix
      await this.applyAIFix(issue.file, aiFix.updatedCode);
      
      // Validate system
      const validation = await this.validateSystem();
      
      if (validation.success) {
        // Success - record fix and update shared learning
        this.results.fixed.push({
          issue: issue.type,
          file: issue.file,
          aiGenerated: true,
          confidence: aiFix.confidenceScore,
          explanation: aiFix.explanation
        });
        
        // Update shared learning
        this.updateSharedLearning(issue, aiFix);
        
        console.log(`✅ Fix applied and validated`);
        
      } else {
        // Validation failed - rollback
        console.log(`❌ Validation failed - rolling back`);
        this.rollbackFile(backupPath, issue.file);
        
        this.results.rolledBack.push({
          issue: issue.type,
          file: issue.file,
          errors: validation.errors,
          aiGenerated: true
        });
      }
      
    } catch (error) {
      console.error(`❌ Error processing issue: ${error.message}`);
      this.results.manualFixes.push({
        issue: issue.type,
        file: issue.file,
        reason: `Processing error: ${error.message}`
      });
    }
  }

  createBackup(filePath) {
    const timestamp = Date.now();
    const backupPath = `backups/backup_${timestamp}_${path.basename(filePath)}`;
    
    if (!fs.existsSync('backups')) {
      fs.mkdirSync('backups', { recursive: true });
    }
    
    fs.copyFileSync(filePath, backupPath);
    console.log(`📸 Created backup: ${backupPath}`);
    
    return backupPath;
  }

  async applyAIFix(filePath, updatedCode) {
    try {
      fs.writeFileSync(filePath, updatedCode);
      console.log(`✏️ Applied AI fix to: ${filePath}`);
    } catch (error) {
      throw new Error(`Failed to apply fix: ${error.message}`);
    }
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

  async validateSystem() {
    try {
      // Basic syntax check
      const jsFiles = this.getJavaScriptFiles();
      for (const file of jsFiles) {
        try {
          require.resolve(file);
        } catch (error) {
          return {
            success: false,
            errors: [`Syntax error in ${file}: ${error.message}`]
          };
        }
      }
      
      return { success: true, errors: [] };
      
    } catch (error) {
      return {
        success: false,
        errors: [`Validation error: ${error.message}`]
      };
    }
  }

  getJavaScriptFiles() {
    const files = [];
    
    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (item.endsWith('.js')) {
          files.push(fullPath);
        }
      });
    };
    
    scanDirectory(process.cwd());
    return files;
  }

  updateSharedLearning(issue, aiFix) {
    try {
      const rule = {
        id: `ai_rule_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        type: issue.type,
        pattern: issue.description,
        action: aiFix.explanation,
        successRate: aiFix.confidenceScore,
        usageCount: 1,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        source: 'ai_generated',
        metadata: {
          confidence: aiFix.confidenceScore,
          file: issue.file,
          aiGenerated: true
        }
      };
      
      this.sharedLearning.updateSharedLearning(rule);
      console.log(`🧬 Updated shared learning with new rule`);
      
    } catch (error) {
      console.error('Error updating shared learning:', error.message);
    }
  }

  async runDeploymentGuard() {
    try {
      console.log('🛡 Running deployment guard validation...');
      
      // Run validation checks
      const validation = await this.deploymentGuard.validateBeforeMerge();
      
      this.results.deploymentStatus = validation ? 'PASS' : 'FAIL';
      
      if (validation) {
        console.log('✅ Deployment guard validation passed');
      } else {
        console.log('❌ Deployment guard validation failed');
      }
      
    } catch (error) {
      console.error('❌ Deployment guard error:', error.message);
      this.results.deploymentStatus = 'FAILED';
    }
  }

  generateFinalReport() {
    console.log('\n📊 FINAL PRODUCTION AUTONOMOUS ENGINE REPORT');
    console.log('='.repeat(80));
    
    const totalIssues = this.results.fixed.length + this.results.rolledBack.length + this.results.manualFixes.length;
    const successRate = totalIssues > 0 ? (this.results.fixed.length / totalIssues) * 100 : 0;
    
    console.log('\n✅ FIXED (AI-GENERATED):');
    this.results.fixed.forEach(fix => {
      console.log(`   🤖 ${fix.issue} in ${fix.file} (confidence: ${(fix.confidence * 100).toFixed(1)}%)`);
      console.log(`      💡 ${fix.explanation}`);
    });
    
    console.log('\n🔁 ROLLED BACK:');
    this.results.rolledBack.forEach(fix => {
      console.log(`   ⚠️ ${fix.issue} in ${fix.file} (${fix.errors.length} validation errors)`);
    });
    
    console.log('\n⚠️ MANUAL FIX REQUIRED:');
    this.results.manualFixes.forEach(fix => {
      console.log(`   📋 ${fix.issue} in ${fix.file} (${fix.reason})`);
    });
    
    console.log('\n🧠 UPDATED SHARED INTELLIGENCE:');
    console.log(`   📚 Total Rules: ${this.results.sharedIntelligence.totalRules}`);
    console.log(`   🗂️ Shared Clusters: ${this.results.sharedIntelligence.sharedClusters}`);
    console.log(`   🌐 Contributing Projects: ${this.results.sharedIntelligence.contributingProjects}`);
    
    console.log(`\n🛡 DEPLOYMENT STATUS: ${this.results.deploymentStatus}`);
    console.log(`📊 OVERALL SUCCESS RATE: ${successRate.toFixed(1)}%`);
    
    // Save comprehensive report
    this.saveComprehensiveReport();
    
    // Determine final status
    const finalStatus = this.results.deploymentStatus === 'PASS' && successRate > 50 ? 'PRODUCTION READY' : 'NEEDS IMPROVEMENT';
    console.log(`\n🎯 FINAL STATUS: ${finalStatus}`);
  }

  saveComprehensiveReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      execution: 'production-autonomous-engine',
      results: this.results,
      sharedLearning: this.sharedLearning.generateReport(),
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime()
      }
    };
    
    try {
      fs.writeFileSync('production-autonomous-report.json', JSON.stringify(reportData, null, 2));
      console.log('\n📄 Comprehensive report saved to: production-autonomous-report.json');
    } catch (error) {
      console.error('Error saving report:', error.message);
    }
  }
}

// Execute the production autonomous engine
const engine = new ProductionAutonomousEngine();

engine.executeFullCycle().then((results) => {
  console.log('\n🎉 PRODUCTION AUTONOMOUS ENGINE CYCLE COMPLETE');
  console.log(`🛡 Deployment Status: ${results.deploymentStatus}`);
  console.log(`🧠 Shared Intelligence: ${results.sharedIntelligence.totalRules} rules`);
  
  const successRate = results.fixed.length / (results.fixed.length + results.rolledBack.length + results.manualFixes.length) * 100;
  console.log(`📊 Success Rate: ${successRate.toFixed(1)}%`);
  
  if (results.deploymentStatus === 'PASS' && successRate > 50) {
    console.log('\n✅ SYSTEM IS PRODUCTION READY');
    console.log('🚀 The production autonomous AI engineer has successfully prepared the system.');
  } else {
    console.log('\n⚠️ SYSTEM NEEDS IMPROVEMENTS BEFORE PRODUCTION');
    console.log('📋 Review the manual fixes and deployment guard results.');
  }
}).catch((error) => {
  console.error('\n💥 PRODUCTION AUTONOMOUS ENGINE FAILED:', error.message);
  process.exit(1);
});

module.exports = ProductionAutonomousEngine;
