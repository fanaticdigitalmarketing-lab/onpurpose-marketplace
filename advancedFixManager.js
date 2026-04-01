const { generateFix } = require('./ai-fix-engine');
const { createBackup, rollback } = require('./rollback-manager');
const fs = require('fs');

/**
 * Advanced Fix Manager with AI-powered fixes and safety
 */
class AdvancedFixManager {
  constructor() {
    this.fixHistory = [];
    this.successCount = 0;
    this.failureCount = 0;
  }

  async applyAdvancedFix(error) {
    try {
      const file = error.file;

      if (!file || !fs.existsSync(file)) {
        console.log("❌ File not found:", file);
        return { success: false, reason: "File not found" };
      }

      // 1. Backup before touching anything
      createBackup(file);

      // 2. Generate AI fix
      const fixedCode = await generateFix(error, file);

      if (!fixedCode) {
        console.log("❌ AI fix generation failed");
        rollback(file);
        return { success: false, reason: "AI fix generation failed" };
      }

      // 3. Apply fix
      fs.writeFileSync(file, fixedCode);

      // 4. Validate file after fix
      const isValid = this.validateFile(file);

      if (!isValid) {
        console.log("❌ Fix broke file — rolling back...");
        rollback(file);
        this.failureCount++;
        return { success: false, reason: "Fix validation failed" };
      }

      console.log("✅ AI fix applied:", file);
      this.successCount++;

      // Track successful fix
      this.fixHistory.push({
        file,
        error: error.type,
        method: 'AI',
        success: true,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        file,
        method: 'AI',
        validation: 'passed'
      };

    } catch (err) {
      console.error("❌ Fix failed:", err.message);
      
      // Rollback on any error
      if (error.file) {
        rollback(error.file);
      }
      
      this.failureCount++;
      
      // Track failed fix
      this.fixHistory.push({
        file: error.file,
        error: error.type,
        method: 'AI',
        success: false,
        reason: err.message,
        timestamp: new Date().toISOString()
      });

      return { success: false, reason: err.message };
    }
  }

  validateFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Basic validation based on file type
      if (filePath.endsWith('.js')) {
        // JavaScript syntax validation
        new Function(content);
        return true;
      }
      
      if (filePath.endsWith('.json')) {
        // JSON syntax validation
        JSON.parse(content);
        return true;
      }
      
      if (filePath.endsWith('.html')) {
        // Basic HTML validation
        return content.includes('<html') && content.includes('</html>');
      }
      
      // For other files, just check if it's not empty
      return content.length > 0;
      
    } catch (error) {
      console.error("❌ File validation failed:", error.message);
      return false;
    }
  }

  async applyBatchFixes(errors) {
    console.log(`🔄 Starting batch fix for ${errors.length} errors...`);
    
    const results = {
      successful: [],
      failed: [],
      total: errors.length
    };

    for (const error of errors) {
      const result = await this.applyAdvancedFix(error);
      
      if (result.success) {
        results.successful.push(result);
      } else {
        results.failed.push({
          error,
          reason: result.reason
        });
      }
    }

    console.log(`📊 Batch fix completed:`);
    console.log(`   ✅ Successful: ${results.successful.length}`);
    console.log(`   ❌ Failed: ${results.failed.length}`);

    return results;
  }

  getSuccessRate() {
    const total = this.successCount + this.failureCount;
    return total > 0 ? (this.successCount / total * 100).toFixed(1) : 0;
  }

  getFixHistory() {
    return this.fixHistory;
  }

  getStats() {
    return {
      successCount: this.successCount,
      failureCount: this.failureCount,
      successRate: this.getSuccessRate(),
      totalFixes: this.fixHistory.length
    };
  }

  resetStats() {
    this.fixHistory = [];
    this.successCount = 0;
    this.failureCount = 0;
    console.log("📊 Fix statistics reset");
  }
}

module.exports = AdvancedFixManager;
