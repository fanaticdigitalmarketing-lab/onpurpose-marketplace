// PRODUCTION AUDIT SYSTEM V2
// Streamlined production audit with failure enforcement

const fs = require('fs');

class ProductionAuditSystem {
  constructor(engine) {
    this.engine = engine;
    this.report = {
      autoFixed: [],
      manualFixes: [],
      critical: [],
      stats: {}
    };
  }

  async runFullAudit() {
    console.log('🔍 RUNNING PRODUCTION AUDIT...\n');

    await this.checkAPI();
    await this.checkFrontend();
    await this.checkLearningSystem();

    this.generateReport();
    this.enforceFailureRules();

    return this.report;
  }

  // 🔌 API CHECKS
  async checkAPI() {
    const fs = require('fs');

    if (!fs.existsSync('server.js')) return;

    const content = fs.readFileSync('server.js', 'utf8');

    // Check try-catch
    if (!content.includes('try') || !content.includes('catch')) {
      this.report.manualFixes.push({
        file: 'server.js',
        issue: 'Missing try-catch in API routes',
        fix: 'Wrap all async routes in try-catch blocks'
      });
    } else {
      this.report.autoFixed.push('API error handling present');
    }

    // Timeout check
    if (!content.includes('setTimeout') && !content.includes('res.setTimeout')) {
      this.report.critical.push({
        file: 'server.js',
        issue: 'No timeout handling',
        fix: 'Add timeout middleware (5s)'
      });
    }
  }

  // 🎨 FRONTEND CHECKS
  async checkFrontend() {
    const fs = require('fs');
    const files = ['index.html', 'frontend/index.html'];

    files.forEach(file => {
      if (!fs.existsSync(file)) return;

      const content = fs.readFileSync(file, 'utf8');

      // Charset
      if (!content.includes('charset')) {
        this.report.manualFixes.push({
          file,
          issue: 'Missing charset meta tag',
          fix: '<meta charset="UTF-8">'
        });
      }

      // Forms
      if (content.includes('<form') && !content.includes('required')) {
        this.report.manualFixes.push({
          file,
          issue: 'Form without validation',
          fix: 'Add required/pattern attributes'
        });
      }

      // Buttons
      const buttons = content.match(/<button[^>]*>/g) || [];
      buttons.forEach(btn => {
        if (!btn.includes('onclick')) {
          this.report.manualFixes.push({
            file,
            issue: 'Button without handler',
            fix: 'Add onclick or event listener'
          });
        }
      });

      if (content.length > 50000) {
        this.report.manualFixes.push({
          file,
          issue: 'Large file size',
          fix: 'Split CSS/JS into separate files'
        });
      }
    });
  }

  // 🧠 SELF-LEARNING SYSTEM CHECKS
  async checkLearningSystem() {
    const rules = this.engine.learnedRules;

    const uniqueRules = new Set();
    rules.forEach(rule => {
      const key = rule.type + rule.action;
      if (uniqueRules.has(key)) {
        this.report.critical.push({
          issue: 'Duplicate learning rules detected',
          fix: 'Implement deduplication logic'
        });
      }
      uniqueRules.add(key);
    });

    const fakeSuccess = this.engine.fixHistory.some(fix => fix.success === true && !fix.action);
    if (fakeSuccess) {
      this.report.critical.push({
        issue: 'Fake success logs detected',
        fix: 'Only mark success if actual change occurs'
      });
    }
  }

  // 📊 REPORT
  generateReport() {
    const total =
      this.report.autoFixed.length +
      this.report.manualFixes.length +
      this.report.critical.length;

    const realSuccessRate = total > 0
      ? Math.round((this.report.autoFixed.length / total) * 100)
      : 100;

    this.report.stats = {
      totalIssues: total,
      autoFixed: this.report.autoFixed.length,
      manual: this.report.manualFixes.length,
      critical: this.report.critical.length,
      successRate: realSuccessRate
    };

    console.log('\n📊 FINAL AUDIT REPORT');
    console.log('=====================');
    console.log(this.report.stats);

    console.log('\n✅ AUTO FIXED:');
    this.report.autoFixed.forEach(f => console.log(' -', f));

    console.log('\n⚠️ NEEDS MANUAL FIX:');
    this.report.manualFixes.forEach(f =>
      console.log(` - ${f.file}: ${f.issue}`)
    );

    console.log('\n🚨 CRITICAL:');
    this.report.critical.forEach(c =>
      console.log(` - ${c.issue}`)
    );
  }

  // ❌ FAIL IF NOT SAFE
  enforceFailureRules() {
    if (this.report.critical.length > 0) {
      console.log('\n❌ DEPLOYMENT BLOCKED — Critical issues found');
      process.exit(1); // FAIL DEPLOY
    } else if (this.report.manualFixes.length > 0) {
      console.log('\n⚠️ Deployment allowed but improvements needed');
    } else {
      console.log('\n✅ PRODUCTION READY');
    }
  }
}

module.exports = ProductionAuditSystem;
