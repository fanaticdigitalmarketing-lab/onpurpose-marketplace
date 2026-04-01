// PRODUCTION AUDIT SYSTEM
// Integrates with SelfLearningHotfixEngine for comprehensive production readiness

const fs = require('fs');
const path = require('path');

class ProductionAuditSystem {
  constructor(selfLearningEngine) {
    this.engine = selfLearningEngine;
    this.auditResults = {
      security: {},
      performance: {},
      accessibility: {},
      codeQuality: {},
      deployment: {},
      overall: {}
    };
    this.issues = [];
    this.fixes = [];
    this.blockers = [];
  }

  // Main audit execution
  async runFullAudit() {
    console.log('🔍 PRODUCTION AUDIT SYSTEM - FULL COMPREHENSIVE AUDIT');
    console.log('=' .repeat(60));
    
    try {
      // Phase 1: Security Audit
      await this.performSecurityAudit();
      
      // Phase 2: Performance Audit
      await this.performPerformanceAudit();
      
      // Phase 3: Accessibility Audit
      await this.performAccessibilityAudit();
      
      // Phase 4: Code Quality Audit
      await this.performCodeQualityAudit();
      
      // Phase 5: Deployment Readiness Audit
      await this.performDeploymentAudit();
      
      // Phase 6: Generate Final Report
      this.generateFinalReport();
      
      return this.auditResults;
      
    } catch (error) {
      console.error('❌ Production audit failed:', error.message);
      throw error;
    }
  }

  // Phase 1: Security Audit
  async performSecurityAudit() {
    console.log('\n🔒 PHASE 1 - SECURITY AUDIT');
    console.log('-'.repeat(40));
    
    const securityIssues = [];
    
    // Check API input validation
    const apiValidationIssues = await this.checkAPIValidation();
    securityIssues.push(...apiValidationIssues);
    
    // Check error handling consistency
    const errorHandlingIssues = await this.checkErrorHandling();
    securityIssues.push(...errorHandlingIssues);
    
    // Check authentication security
    const authIssues = await this.checkAuthenticationSecurity();
    securityIssues.push(...authIssues);
    
    // Check CORS configuration
    const corsIssues = await this.checkCORSConfiguration();
    securityIssues.push(...corsIssues);
    
    // Check rate limiting
    const rateLimitIssues = await this.checkRateLimiting();
    securityIssues.push(...rateLimitIssues);
    
    this.auditResults.security = {
      issues: securityIssues,
      score: this.calculateSecurityScore(securityIssues),
      status: securityIssues.filter(i => i.severity === 'critical').length === 0 ? 'PASS' : 'FAIL'
    };
    
    console.log(`🔒 Security Score: ${this.auditResults.security.score}/100`);
    console.log(`🔒 Security Status: ${this.auditResults.security.status}`);
  }

  async checkAPIValidation() {
    const issues = [];
    
    try {
      const serverContent = fs.readFileSync('server.js', 'utf8');
      
      // Check for express-validator
      if (!serverContent.includes('express-validator')) {
        issues.push({
          type: 'missing_validation_library',
          severity: 'critical',
          file: 'server.js',
          description: 'express-validator library not installed',
          fix: 'npm install express-validator',
          code: 'const { body, validationResult } = require("express-validator");'
        });
      }
      
      // Check API routes for validation
      const apiRoutes = serverContent.match(/app\.(get|post|put|delete)\s*\([^)]+\)\s*,\s*async/g) || [];
      
      for (const route of apiRoutes) {
        const routeStart = serverContent.indexOf(route);
        const routeBlock = serverContent.substring(routeStart, routeStart + 500);
        
        if (routeBlock.includes('req.body') && !routeBlock.includes('validationResult')) {
          issues.push({
            type: 'missing_input_validation',
            severity: 'critical',
            file: 'server.js',
            description: 'API route missing input validation',
            fix: 'Add express-validator middleware',
            code: route.trim()
          });
        }
      }
      
    } catch (error) {
      console.error('Error checking API validation:', error.message);
    }
    
    return issues;
  }

  async checkErrorHandling() {
    const issues = [];
    
    try {
      const serverContent = fs.readFileSync('server.js', 'utf8');
      
      // Check for consistent error response format
      const errorResponses = serverContent.match(/res\.status\(\d+\)\.json\([^)]+\)/g) || [];
      
      for (const response of errorResponses) {
        if (!response.includes('success') && !response.includes('error')) {
          issues.push({
            type: 'inconsistent_error_response',
            severity: 'medium',
            file: 'server.js',
            description: 'Inconsistent error response format',
            fix: 'Use { success: false, error: message } format',
            code: response.trim()
          });
        }
      }
      
      // Check for unhandled promises
      const thenChains = serverContent.match(/\.then\s*\([^)]+\)\s*(?!\s*\.catch)/g) || [];
      
      for (const chain of thenChains) {
        issues.push({
          type: 'unhandled_promise',
          severity: 'high',
          file: 'server.js',
          description: 'Promise chain without .catch()',
          fix: 'Add .catch() block for error handling',
          code: chain.trim()
        });
      }
      
    } catch (error) {
      console.error('Error checking error handling:', error.message);
    }
    
    return issues;
  }

  async checkAuthenticationSecurity() {
    const issues = [];
    
    try {
      const serverContent = fs.readFileSync('server.js', 'utf8');
      
      // Check JWT secret strength
      if (serverContent.includes('JWT_SECRET') && serverContent.includes('fallback-secret')) {
        issues.push({
          type: 'weak_jwt_secret',
          severity: 'critical',
          file: 'server.js',
          description: 'Using fallback JWT secret in production',
          fix: 'Set strong JWT_SECRET in environment variables',
          code: 'process.env.JWT_SECRET || "fallback-secret"'
        });
      }
      
      // Check password hashing
      if (!serverContent.includes('bcrypt.hash')) {
        issues.push({
          type: 'missing_password_hashing',
          severity: 'critical',
          file: 'server.js',
          description: 'Password hashing not implemented',
          fix: 'Use bcrypt for password hashing',
          code: 'const hashedPassword = await bcrypt.hash(password, 12);'
        });
      }
      
      // Check token expiration
      if (!serverContent.includes('expiresIn')) {
        issues.push({
          type: 'missing_token_expiration',
          severity: 'medium',
          file: 'server.js',
          description: 'JWT tokens missing expiration',
          fix: 'Add expiresIn to JWT tokens',
          code: 'jwt.sign(payload, secret, { expiresIn: "1h" })'
        });
      }
      
    } catch (error) {
      console.error('Error checking authentication security:', error.message);
    }
    
    return issues;
  }

  async checkCORSConfiguration() {
    const issues = [];
    
    try {
      const serverContent = fs.readFileSync('server.js', 'utf8');
      
      // Check if CORS is configured
      if (!serverContent.includes('cors()')) {
        issues.push({
          type: 'missing_cors',
          severity: 'high',
          file: 'server.js',
          description: 'CORS not configured',
          fix: 'Add CORS middleware',
          code: 'app.use(cors());'
        });
      }
      
      // Check for wildcard origins
      if (serverContent.includes('origin: "*"') || serverContent.includes('origin: "*"')) {
        issues.push({
          type: 'wildcard_cors',
          severity: 'medium',
          file: 'server.js',
          description: 'Wildcard CORS origin in production',
          fix: 'Specify allowed origins',
          code: 'origin: ["https://onpurpose.earth"]'
        });
      }
      
    } catch (error) {
      console.error('Error checking CORS configuration:', error.message);
    }
    
    return issues;
  }

  async checkRateLimiting() {
    const issues = [];
    
    try {
      const serverContent = fs.readFileSync('server.js', 'utf8');
      
      // Check if rate limiting is configured
      if (!serverContent.includes('rateLimit')) {
        issues.push({
          type: 'missing_rate_limiting',
          severity: 'medium',
          file: 'server.js',
          description: 'Rate limiting not configured',
          fix: 'Add express-rate-limit middleware',
          code: 'const rateLimit = require("express-rate-limit");'
        });
      }
      
    } catch (error) {
      console.error('Error checking rate limiting:', error.message);
    }
    
    return issues;
  }

  // Phase 2: Performance Audit
  async performPerformanceAudit() {
    console.log('\n⚡ PHASE 2 - PERFORMANCE AUDIT');
    console.log('-'.repeat(40));
    
    const performanceIssues = [];
    
    // Check file sizes
    const fileSizeIssues = await this.checkFileSizes();
    performanceIssues.push(...fileSizeIssues);
    
    // Check inline CSS/JS
    const inlineIssues = await this.checkInlineAssets();
    performanceIssues.push(...inlineIssues);
    
    // Check database queries
    const dbIssues = await this.checkDatabasePerformance();
    performanceIssues.push(...dbIssues);
    
    // Check caching
    const cacheIssues = await this.checkCaching();
    performanceIssues.push(...cacheIssues);
    
    this.auditResults.performance = {
      issues: performanceIssues,
      score: this.calculatePerformanceScore(performanceIssues),
      status: performanceIssues.filter(i => i.severity === 'critical').length === 0 ? 'PASS' : 'FAIL'
    };
    
    console.log(`⚡ Performance Score: ${this.auditResults.performance.score}/100`);
    console.log(`⚡ Performance Status: ${this.auditResults.performance.status}`);
  }

  async checkFileSizes() {
    const issues = [];
    
    const files = ['index.html', 'frontend/index.html', 'frontend/dashboard.html'];
    
    for (const file of files) {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const sizeKB = Math.round(stats.size / 1024);
        
        if (sizeKB > 100) {
          issues.push({
            type: 'large_file',
            severity: sizeKB > 200 ? 'critical' : 'medium',
            file,
            description: `Large file (${sizeKB}KB)`,
            fix: 'Split into smaller files or externalize CSS/JS',
            code: `Size: ${sizeKB}KB`
          });
        }
      }
    }
    
    return issues;
  }

  async checkInlineAssets() {
    const issues = [];
    
    const files = ['index.html', 'frontend/index.html', 'frontend/dashboard.html'];
    
    for (const file of files) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        const inlineStyles = (content.match(/<style[^>]*>/g) || []).length;
        const inlineScripts = (content.match(/<script[^>]*>/g) || []).length;
        
        if (inlineStyles > 0 || inlineScripts > 0) {
          issues.push({
            type: 'inline_assets',
            severity: 'medium',
            file,
            description: `Inline CSS/JS detected`,
            fix: 'Move to external .css and .js files',
            code: `Styles: ${inlineStyles}, Scripts: ${inlineScripts}`
          });
        }
      }
    }
    
    return issues;
  }

  async checkDatabasePerformance() {
    const issues = [];
    
    try {
      const serverContent = fs.readFileSync('server.js', 'utf8');
      
      // Check for N+1 query problems
      if (serverContent.includes('findAll') && !serverContent.includes('include')) {
        issues.push({
          type: 'potential_n_plus_one',
          severity: 'medium',
          file: 'server.js',
          description: 'Potential N+1 query problem',
          fix: 'Use eager loading with include',
          code: 'Service.findAll({ include: [{ model: User }] })'
        });
      }
      
      // Check for missing indexes
      if (serverContent.includes('where') && !serverContent.includes('index')) {
        issues.push({
          type: 'missing_database_indexes',
          severity: 'low',
          file: 'server.js',
          description: 'Consider adding database indexes',
          fix: 'Add indexes to frequently queried fields',
          code: 'User.addIndex({ fields: ["email"] })'
        });
      }
      
    } catch (error) {
      console.error('Error checking database performance:', error.message);
    }
    
    return issues;
  }

  async checkCaching() {
    const issues = [];
    
    try {
      const serverContent = fs.readFileSync('server.js', 'utf8');
      
      // Check for caching headers
      if (!serverContent.includes('Cache-Control') && !serverContent.includes('ETag')) {
        issues.push({
          type: 'missing_caching',
          severity: 'low',
          file: 'server.js',
          description: 'No caching headers configured',
          fix: 'Add caching headers for static assets',
          code: 'res.set("Cache-Control", "public, max-age=31536000");'
        });
      }
      
    } catch (error) {
      console.error('Error checking caching:', error.message);
    }
    
    return issues;
  }

  // Phase 3: Accessibility Audit
  async performAccessibilityAudit() {
    console.log('\n♿ PHASE 3 - ACCESSIBILITY AUDIT');
    console.log('-'.repeat(40));
    
    const accessibilityIssues = [];
    
    // Check for alt attributes
    const altIssues = await this.checkAltAttributes();
    accessibilityIssues.push(...altIssues);
    
    // Check for aria labels
    const ariaIssues = await this.checkAriaLabels();
    accessibilityIssues.push(...ariaIssues);
    
    // Check for form labels
    const labelIssues = await this.checkFormLabels();
    accessibilityIssues.push(...labelIssues);
    
    // Check for keyboard navigation
    const keyboardIssues = await this.checkKeyboardNavigation();
    accessibilityIssues.push(...keyboardIssues);
    
    this.auditResults.accessibility = {
      issues: accessibilityIssues,
      score: this.calculateAccessibilityScore(accessibilityIssues),
      status: accessibilityIssues.filter(i => i.severity === 'critical').length === 0 ? 'PASS' : 'FAIL'
    };
    
    console.log(`♿ Accessibility Score: ${this.auditResults.accessibility.score}/100`);
    console.log(`♿ Accessibility Status: ${this.auditResults.accessibility.status}`);
  }

  async checkAltAttributes() {
    const issues = [];
    
    const files = ['index.html', 'frontend/index.html'];
    
    for (const file of files) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        const images = content.match(/<img[^>]*>/g) || [];
        
        for (const img of images) {
          if (!img.includes('alt=')) {
            issues.push({
              type: 'missing_alt_attribute',
              severity: 'high',
              file,
              description: 'Image missing alt attribute',
              fix: 'Add descriptive alt attribute',
              code: img.trim()
            });
          }
        }
      }
    }
    
    return issues;
  }

  async checkAriaLabels() {
    const issues = [];
    
    const files = ['index.html', 'frontend/index.html', 'frontend/dashboard.html'];
    
    for (const file of files) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        const buttons = content.match(/<button[^>]*>([^<]+)<\/button>/g) || [];
        
        for (const button of buttons) {
          if (!button.includes('aria-') && button.includes('onclick')) {
            issues.push({
              type: 'missing_aria_label',
              severity: 'medium',
              file,
              description: 'Interactive element missing aria attributes',
              fix: 'Add aria-label or aria-describedby',
              code: button.trim()
            });
          }
        }
      }
    }
    
    return issues;
  }

  async checkFormLabels() {
    const issues = [];
    
    const files = ['index.html', 'frontend/index.html'];
    
    for (const file of files) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        const inputs = content.match(/<input[^>]*>/g) || [];
        
        for (const input of inputs) {
          if (!input.includes('id=') || !content.includes(`for="${input.match(/id="([^"]+)"/)?.[1]}"`)) {
            issues.push({
              type: 'missing_form_label',
              severity: 'medium',
              file,
              description: 'Form input missing associated label',
              fix: 'Add label with for attribute or use aria-label',
              code: input.trim()
            });
          }
        }
      }
    }
    
    return issues;
  }

  async checkKeyboardNavigation() {
    const issues = [];
    
    const files = ['index.html', 'frontend/index.html'];
    
    for (const file of files) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        if (!content.includes('tabindex') && content.includes('onclick')) {
          issues.push({
            type: 'missing_keyboard_navigation',
            severity: 'low',
            file,
            description: 'Interactive elements may not be keyboard accessible',
            fix: 'Add tabindex attributes or ensure natural tab order',
            code: 'Add tabindex="0" to interactive elements'
          });
        }
      }
    }
    
    return issues;
  }

  // Phase 4: Code Quality Audit
  async performCodeQualityAudit() {
    console.log('\n📊 PHASE 4 - CODE QUALITY AUDIT');
    console.log('-'.repeat(40));
    
    const qualityIssues = [];
    
    // Check for code duplication
    const duplicationIssues = await this.checkCodeDuplication();
    qualityIssues.push(...duplicationIssues);
    
    // Check for TODO comments
    const todoIssues = await this.checkTODOComments();
    qualityIssues.push(...todoIssues);
    
    // Check for console.log statements
    const consoleIssues = await this.checkConsoleStatements();
    qualityIssues.push(...consoleIssues);
    
    // Check for unused dependencies
    const dependencyIssues = await this.checkUnusedDependencies();
    qualityIssues.push(...dependencyIssues);
    
    this.auditResults.codeQuality = {
      issues: qualityIssues,
      score: this.calculateCodeQualityScore(qualityIssues),
      status: qualityIssues.filter(i => i.severity === 'critical').length === 0 ? 'PASS' : 'FAIL'
    };
    
    console.log(`📊 Code Quality Score: ${this.auditResults.codeQuality.score}/100`);
    console.log(`📊 Code Quality Status: ${this.auditResults.codeQuality.status}`);
  }

  async checkCodeDuplication() {
    const issues = [];
    
    // Check for duplicate rules in learned-rules.json
    try {
      if (fs.existsSync('learned-rules.json')) {
        const rulesContent = fs.readFileSync('learned-rules.json', 'utf8');
        const rules = JSON.parse(rulesContent);
        
        const ruleMap = new Map();
        
        for (const rule of rules) {
          if (rule.trigger && rule.action) {
            const key = `${rule.trigger}:${rule.action}`;
            if (ruleMap.has(key)) {
              issues.push({
                type: 'duplicate_rule',
                severity: 'low',
                file: 'learned-rules.json',
                description: 'Duplicate rule detected',
                fix: 'Remove duplicate rule entries',
                code: `Rule: ${rule.trigger} - ${rule.action}`
              });
            }
            ruleMap.set(key, rule);
          }
        }
      }
    } catch (error) {
      console.error('Error checking code duplication:', error.message);
    }
    
    return issues;
  }

  async checkTODOComments() {
    const issues = [];
    
    const files = ['server.js', 'self-learning-hotfix-engine.js'];
    
    for (const file of files) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        const todos = content.match(/\/\/\s*TODO|\/\*\s*TODO|\*\s*TODO/g) || [];
        
        for (const todo of todos) {
          issues.push({
            type: 'todo_comment',
            severity: 'low',
            file,
            description: 'TODO comment found',
            fix: 'Complete TODO or remove comment',
            code: todo.trim()
          });
        }
      }
    }
    
    return issues;
  }

  async checkConsoleStatements() {
    const issues = [];
    
    const files = ['server.js', 'self-learning-hotfix-engine.js'];
    
    for (const file of files) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        const consoleLogs = content.match(/console\.(log|error|warn|info)/g) || [];
        
        for (const log of consoleLogs) {
          if (log === 'console.log' && file === 'server.js') {
            issues.push({
              type: 'console_log_statement',
              severity: 'low',
              file,
              description: 'console.log statement in production code',
              fix: 'Replace with proper logging or remove',
              code: log.trim()
            });
          }
        }
      }
    }
    
    return issues;
  }

  async checkUnusedDependencies() {
    const issues = [];
    
    try {
      const packageContent = fs.readFileSync('package.json', 'utf8');
      const packageData = JSON.parse(packageContent);
      
      const serverContent = fs.existsSync('server.js') ? fs.readFileSync('server.js', 'utf8') : '';
      
      for (const dep of Object.keys(packageData.dependencies || {})) {
        if (!serverContent.includes(`require('${dep}')`) && !serverContent.includes(`require("${dep}")`)) {
          issues.push({
            type: 'unused_dependency',
            severity: 'low',
            file: 'package.json',
            description: `Unused dependency: ${dep}`,
            fix: 'Remove unused dependency or add to devDependencies',
            code: dep
          });
        }
      }
    } catch (error) {
      console.error('Error checking unused dependencies:', error.message);
    }
    
    return issues;
  }

  // Phase 5: Deployment Readiness Audit
  async performDeploymentAudit() {
    console.log('\n🚀 PHASE 5 - DEPLOYMENT READINESS AUDIT');
    console.log('-'.repeat(40));
    
    const deploymentIssues = [];
    
    // Check environment variables
    const envIssues = await this.checkEnvironmentVariables();
    deploymentIssues.push(...envIssues);
    
    // Check deployment configuration
    const configIssues = await this.checkDeploymentConfiguration();
    deploymentIssues.push(...configIssues);
    
    // Check health endpoint
    const healthIssues = await this.checkHealthEndpoint();
    deploymentIssues.push(...healthIssues);
    
    // Check production settings
    const prodIssues = await this.checkProductionSettings();
    deploymentIssues.push(...prodIssues);
    
    this.auditResults.deployment = {
      issues: deploymentIssues,
      score: this.calculateDeploymentScore(deploymentIssues),
      status: deploymentIssues.filter(i => i.severity === 'critical').length === 0 ? 'PASS' : 'FAIL'
    };
    
    console.log(`🚀 Deployment Score: ${this.auditResults.deployment.score}/100`);
    console.log(`🚀 Deployment Status: ${this.auditResults.deployment.status}`);
  }

  async checkEnvironmentVariables() {
    const issues = [];
    
    try {
      const envContent = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';
      
      const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'STRIPE_SECRET_KEY'];
      
      for (const varName of requiredVars) {
        if (!envContent.includes(`${varName}=`)) {
          issues.push({
            type: 'missing_env_variable',
            severity: 'critical',
            file: '.env',
            description: `Missing required environment variable: ${varName}`,
            fix: `Add ${varName} to .env file`,
            code: varName
          });
        }
      }
      
      // Check for default secrets
      if (envContent.includes('fallback-secret') || envContent.includes('your-secret-key')) {
        issues.push({
          type: 'default_secret',
          severity: 'critical',
          file: '.env',
          description: 'Using default/placeholder secrets',
          fix: 'Replace with strong, unique secrets',
          code: 'Replace default values'
        });
      }
      
    } catch (error) {
      console.error('Error checking environment variables:', error.message);
    }
    
    return issues;
  }

  async checkDeploymentConfiguration() {
    const issues = [];
    
    // Check railway.toml
    if (!fs.existsSync('railway.toml')) {
      issues.push({
        type: 'missing_railway_config',
        severity: 'high',
        file: 'railway.toml',
        description: 'Railway deployment configuration missing',
        fix: 'Create railway.toml with proper configuration',
        code: '[deploy]\nstartCommand = "node server.js"'
      });
    }
    
    // Check netlify.toml
    if (!fs.existsSync('netlify.toml')) {
      issues.push({
        type: 'missing_netlify_config',
        severity: 'high',
        file: 'netlify.toml',
        description: 'Netlify deployment configuration missing',
        fix: 'Create netlify.toml with proper configuration',
        code: '[[redirects]]\nfrom = "/api/*"\nto = "https://backend-url/api/:splat"'
      });
    }
    
    // Check _redirects
    if (!fs.existsSync('_redirects')) {
      issues.push({
        type: 'missing_redirects',
        severity: 'medium',
        file: '_redirects',
        description: 'API routing redirects missing',
        fix: 'Create _redirects file for API routing',
        code: '/api/* https://backend-url/api/:splat 200'
      });
    }
    
    return issues;
  }

  async checkHealthEndpoint() {
    const issues = [];
    
    try {
      const serverContent = fs.readFileSync('server.js', 'utf8');
      
      if (!serverContent.includes('app.get(\'/health\'')) {
        issues.push({
          type: 'missing_health_endpoint',
          severity: 'medium',
          file: 'server.js',
          description: 'Health check endpoint missing',
          fix: 'Add /health endpoint for monitoring',
          code: 'app.get("/health", (req, res) => { res.json({ status: "ok" }); });'
        });
      }
      
    } catch (error) {
      console.error('Error checking health endpoint:', error.message);
    }
    
    return issues;
  }

  async checkProductionSettings() {
    const issues = [];
    
    try {
      const packageContent = fs.readFileSync('package.json', 'utf8');
      const packageData = JSON.parse(packageContent);
      
      // Check for production scripts
      if (!packageData.scripts?.start) {
        issues.push({
          type: 'missing_start_script',
          severity: 'medium',
          file: 'package.json',
          description: 'Missing start script for production',
          fix: 'Add start script to package.json',
          code: '"start": "node server.js"'
        });
      }
      
      // Check engine requirements
      if (!packageData.engines?.node) {
        issues.push({
          type: 'missing_node_engine',
          severity: 'low',
          file: 'package.json',
          description: 'Node.js engine version not specified',
          fix: 'Add engines.node to package.json',
          code: '"engines": { "node": ">=18.0.0" }'
        });
      }
      
    } catch (error) {
      console.error('Error checking production settings:', error.message);
    }
    
    return issues;
  }

  // Calculate scores for each category
  calculateSecurityScore(issues) {
    const weights = { critical: 25, high: 15, medium: 8, low: 3 };
    const totalWeight = issues.reduce((sum, issue) => sum + (weights[issue.severity] || 1), 0);
    return Math.max(0, 100 - totalWeight);
  }

  calculatePerformanceScore(issues) {
    const weights = { critical: 20, high: 12, medium: 6, low: 2 };
    const totalWeight = issues.reduce((sum, issue) => sum + (weights[issue.severity] || 1), 0);
    return Math.max(0, 100 - totalWeight);
  }

  calculateAccessibilityScore(issues) {
    const weights = { critical: 20, high: 15, medium: 8, low: 3 };
    const totalWeight = issues.reduce((sum, issue) => sum + (weights[issue.severity] || 1), 0);
    return Math.max(0, 100 - totalWeight);
  }

  calculateCodeQualityScore(issues) {
    const weights = { critical: 15, high: 10, medium: 5, low: 2 };
    const totalWeight = issues.reduce((sum, issue) => sum + (weights[issue.severity] || 1), 0);
    return Math.max(0, 100 - totalWeight);
  }

  calculateDeploymentScore(issues) {
    const weights = { critical: 30, high: 20, medium: 10, low: 5 };
    const totalWeight = issues.reduce((sum, issue) => sum + (weights[issue.severity] || 1), 0);
    return Math.max(0, 100 - totalWeight);
  }

  // Generate final comprehensive report
  generateFinalReport() {
    console.log('\n📊 PHASE 6 - FINAL COMPREHENSIVE REPORT');
    console.log('='.repeat(60));
    
    // Calculate overall score
    const scores = [
      this.auditResults.security.score,
      this.auditResults.performance.score,
      this.auditResults.accessibility.score,
      this.auditResults.codeQuality.score,
      this.auditResults.deployment.score
    ];
    
    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    
    // Determine overall status
    const allStatuses = [
      this.auditResults.security.status,
      this.auditResults.performance.status,
      this.auditResults.accessibility.status,
      this.auditResults.codeQuality.status,
      this.auditResults.deployment.status
    ];
    
    const overallStatus = allStatuses.every(status => status === 'PASS') ? 'PRODUCTION READY' : 'NEEDS IMPROVEMENT';
    
    // Count total issues
    const totalIssues = Object.values(this.auditResults).reduce((sum, category) => {
      return sum + (category.issues?.length || 0);
    }, 0);
    
    const criticalIssues = Object.values(this.auditResults).reduce((sum, category) => {
      return sum + (category.issues?.filter(i => i.severity === 'critical').length || 0);
    }, 0);
    
    this.auditResults.overall = {
      score: overallScore,
      status: overallStatus,
      totalIssues,
      criticalIssues,
      categoryScores: {
        security: this.auditResults.security.score,
        performance: this.auditResults.performance.score,
        accessibility: this.auditResults.accessibility.score,
        codeQuality: this.auditResults.codeQuality.score,
        deployment: this.auditResults.deployment.score
      }
    };
    
    // Display results
    console.log(`\n🎯 OVERALL SCORE: ${overallScore}/100`);
    console.log(`🎯 OVERALL STATUS: ${overallStatus}`);
    console.log(`📊 TOTAL ISSUES: ${totalIssues}`);
    console.log(`🚨 CRITICAL ISSUES: ${criticalIssues}`);
    
    console.log('\n📈 CATEGORY BREAKDOWN:');
    console.log(`   🔒 Security: ${this.auditResults.security.score}/100 (${this.auditResults.security.status})`);
    console.log(`   ⚡ Performance: ${this.auditResults.performance.score}/100 (${this.auditResults.performance.status})`);
    console.log(`   ♿ Accessibility: ${this.auditResults.accessibility.score}/100 (${this.auditResults.accessibility.status})`);
    console.log(`   📊 Code Quality: ${this.auditResults.codeQuality.score}/100 (${this.auditResults.codeQuality.status})`);
    console.log(`   🚀 Deployment: ${this.auditResults.deployment.score}/100 (${this.auditResults.deployment.status})`);
    
    // Show critical issues
    if (criticalIssues > 0) {
      console.log('\n🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:');
      Object.values(this.auditResults).forEach(category => {
        if (category.issues) {
          category.issues.filter(issue => issue.severity === 'critical').forEach(issue => {
            console.log(`   ❌ ${issue.file}: ${issue.description}`);
            console.log(`      Fix: ${issue.fix}`);
          });
        }
      });
    }
    
    // Production readiness verdict
    if (overallStatus === 'PRODUCTION READY') {
      console.log('\n✅ PRODUCTION READINESS: APPROVED');
      console.log('   System is ready for production deployment');
      console.log('   All critical and high-severity issues resolved');
    } else {
      console.log('\n❌ PRODUCTION READINESS: NOT APPROVED');
      console.log('   System requires fixes before production deployment');
      console.log(`   ${criticalIssues} critical issues must be resolved`);
    }
    
    // Save detailed report
    this.saveDetailedReport();
  }

  saveDetailedReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      auditResults: this.auditResults,
      engineStats: this.engine ? {
        learnedRules: this.engine.learnedRules?.length || 0,
        fixHistory: this.engine.fixHistory?.length || 0,
        successRate: this.engine.calculateSuccessRate?.() || 0
      } : null
    };
    
    try {
      fs.writeFileSync('production-audit-report.json', JSON.stringify(reportData, null, 2));
      console.log('\n📄 Detailed report saved to: production-audit-report.json');
    } catch (error) {
      console.error('Error saving detailed report:', error.message);
    }
  }
}

module.exports = ProductionAuditSystem;
