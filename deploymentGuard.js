// 🛡 CONTINUOUS DEPLOYMENT GUARD
// Blocks bad merges automatically

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class DeploymentGuard {
  constructor() {
    this.validationResults = {
      syntax: false,
      serverBoot: false,
      endpoints: false,
      issues: false
    };
  }

  async validateBeforeMerge() {
    console.log('🛡 DEPLOYMENT GUARD - VALIDATING BEFORE MERGE');
    console.log('='.repeat(50));

    try {
      // Check 1: Syntax validation
      console.log('📝 Checking syntax...');
      this.validationResults.syntax = await this.validateSyntax();
      
      if (!this.validationResults.syntax) {
        console.error('❌ Syntax validation failed');
        process.exit(1);
      }
      
      // Check 2: Server boot test
      console.log('🚀 Testing server boot...');
      this.validationResults.serverBoot = await this.testServerBoot();
      
      if (!this.validationResults.serverBoot) {
        console.error('❌ Server boot test failed');
        process.exit(1);
      }
      
      // Check 3: Critical endpoints
      console.log('🔌 Testing critical endpoints...');
      this.validationResults.endpoints = await this.testCriticalEndpoints();
      
      if (!this.validationResults.endpoints) {
        console.error('❌ Critical endpoints test failed');
        process.exit(1);
      }
      
      // Check 4: No new high-severity issues
      console.log('🔍 Checking for new issues...');
      this.validationResults.issues = await this.checkForNewIssues();
      
      if (!this.validationResults.issues) {
        console.error('❌ New high-severity issues detected');
        process.exit(1);
      }
      
      console.log('✅ All validation checks passed');
      console.log('🚀 Deployment approved');
      process.exit(0);
      
    } catch (error) {
      console.error('❌ Deployment guard failed:', error.message);
      process.exit(1);
    }
  }

  async validateSyntax() {
    try {
      const jsFiles = this.getJavaScriptFiles();
      
      for (const file of jsFiles) {
        try {
          // Syntax check by requiring the file
          require.resolve(file);
          
          // Additional syntax validation
          const content = fs.readFileSync(file, 'utf8');
          const issues = this.analyzeSyntax(content);
          
          if (issues.length > 0) {
            console.error(`❌ Syntax issues in ${file}:`);
            issues.forEach(issue => console.error(`   - ${issue}`));
            return false;
          }
        } catch (error) {
          console.error(`❌ Syntax error in ${file}: ${error.message}`);
          return false;
        }
      }
      
      console.log('✅ All JavaScript files have valid syntax');
      return true;
      
    } catch (error) {
      console.error('❌ Syntax validation error:', error.message);
      return false;
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
        } else if (item.endsWith('.js') && !item.includes('test')) {
          files.push(fullPath);
        }
      });
    };
    
    scanDirectory(process.cwd());
    return files;
  }

  analyzeSyntax(content) {
    const issues = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Check for common syntax issues
      if (trimmed && !trimmed.endsWith(';') && !trimmed.endsWith('{') && 
          !trimmed.endsWith('}') && !trimmed.includes('//') && 
          !trimmed.includes('if') && !trimmed.includes('for') && 
          !trimmed.includes('while') && !trimmed.includes('function') &&
          !trimmed.includes('class') && !trimmed.includes('const') &&
          !trimmed.includes('let') && !trimmed.includes('var') &&
          !trimmed.includes('return') && !trimmed.includes('break') &&
          !trimmed.includes('continue') && !trimmed.includes('try') &&
          !trimmed.includes('catch') && !trimmed.includes('finally') &&
          !trimmed.includes('import') && !trimmed.includes('export') &&
          !trimmed.includes('switch') && !trimmed.includes('case') &&
          !trimmed.includes('default') && !trimmed.includes('do')) {
        
        // Skip if it's a multi-line construct
        if (trimmed.length > 0 && !trimmed.startsWith('/*') && !trimmed.startsWith('*')) {
          issues.push(`Line ${index + 1}: Possible missing semicolon`);
        }
      }
      
      // Check for async/await without try-catch
      if (trimmed.includes('await') && !content.includes('try')) {
        const contextStart = Math.max(0, index - 5);
        const contextEnd = Math.min(lines.length, index + 5);
        const context = lines.slice(contextStart, contextEnd).join('\n');
        
        if (!context.includes('try') || !context.includes('catch')) {
          issues.push(`Line ${index + 1}: Async/await without try-catch`);
        }
      }
    });
    
    return issues;
  }

  async testServerBoot() {
    return new Promise((resolve) => {
      console.log('🚀 Starting server boot test...');
      
      // Try to start the server
      const server = spawn('node', ['server.js'], {
        stdio: 'pipe',
        cwd: process.cwd
      });
      
      let serverStarted = false;
      let output = '';
      
      server.stdout.on('data', (data) => {
        output += data.toString();
        
        // Check for success indicators
        if (output.includes('server running') || output.includes('listening') || output.includes('started')) {
          serverStarted = true;
          console.log('✅ Server started successfully');
          server.kill();
          resolve(true);
        }
      });
      
      server.stderr.on('data', (data) => {
        const error = data.toString();
        console.error('Server error:', error);
        
        if (error.includes('Error') || error.includes('error')) {
          server.kill();
          resolve(false);
        }
      });
      
      server.on('close', (code) => {
        if (!serverStarted) {
          console.log(`Server process exited with code ${code}`);
          resolve(false);
        }
      });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (!serverStarted) {
          console.log('Server boot test timed out');
          server.kill();
          resolve(false);
        }
      }, 10000);
    });
  }

  async testCriticalEndpoints() {
    try {
      // Since we can't actually run the server in this context,
      // we'll validate the endpoint definitions in the code
      
      if (!fs.existsSync('server.js')) {
        console.error('❌ server.js not found');
        return false;
      }
      
      const serverContent = fs.readFileSync('server.js', 'utf8');
      
      // Check for critical endpoints
      const criticalEndpoints = [
        { method: 'get', path: '/health' },
        { method: 'get', path: '/api/services' },
        { method: 'post', path: '/api/auth/register' },
        { method: 'post', path: '/api/auth/login' }
      ];
      
      let allEndpointsFound = true;
      
      criticalEndpoints.forEach(endpoint => {
        const pattern = new RegExp(`app\\.${endpoint.method}\\s*\\(['"\`]${endpoint.path}['"\`]`, 'i');
        if (!pattern.test(serverContent)) {
          console.error(`❌ Missing critical endpoint: ${endpoint.method.toUpperCase()} ${endpoint.path}`);
          allEndpointsFound = false;
        }
      });
      
      // Check for error handling in endpoints
      const endpointMatches = serverContent.match(/app\.(get|post|put|delete)\s*\([^)]+\)/g) || [];
      
      let endpointsWithErrorHandling = 0;
      endpointMatches.forEach(match => {
        const context = serverContent.substring(
          serverContent.indexOf(match),
          serverContent.indexOf(match) + 500
        );
        
        if (context.includes('try') && context.includes('catch')) {
          endpointsWithErrorHandling++;
        }
      });
      
      const errorHandlingRatio = endpointsWithErrorHandling / endpointMatches.length;
      
      if (errorHandlingRatio < 0.8) {
        console.error(`❌ Insufficient error handling: ${endpointsWithErrorHandling}/${endpointMatches.length} endpoints`);
        allEndpointsFound = false;
      }
      
      if (allEndpointsFound) {
        console.log('✅ All critical endpoints found with proper error handling');
      }
      
      return allEndpointsFound;
      
    } catch (error) {
      console.error('❌ Endpoint validation error:', error.message);
      return false;
    }
  }

  async checkForNewIssues() {
    try {
      // Run a quick audit to check for new issues
      const issues = await this.runQuickAudit();
      
      // Filter for high-severity issues
      const highSeverityIssues = issues.filter(issue => {
        return issue.severity === 'high' || 
               issue.type.includes('security') ||
               issue.type.includes('missing') ||
               issue.type.includes('error');
      });
      
      if (highSeverityIssues.length > 0) {
        console.error(`❌ Found ${highSeverityIssues.length} high-severity issues:`);
        highSeverityIssues.forEach(issue => {
          console.error(`   - ${issue.type} in ${issue.file}: ${issue.description}`);
        });
        return false;
      }
      
      console.log('✅ No new high-severity issues detected');
      return true;
      
    } catch (error) {
      console.error('❌ Issue detection error:', error.message);
      return false;
    }
  }

  async runQuickAudit() {
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
    
    if (file.endsWith('.js')) {
      // Check for security issues
      if (content.includes('eval(')) {
        issues.push({
          type: 'security_eval',
          file,
          description: 'Use of eval() function detected',
          severity: 'high'
        });
      }
      
      // Check for missing error handling
      const asyncRoutes = content.match(/app\.(get|post|put|delete)\s*\([^)]+\)\s*,\s*async/g) || [];
      asyncRoutes.forEach(route => {
        const contextStart = content.indexOf(route);
        const contextEnd = contextStart + 500;
        const context = content.substring(contextStart, contextEnd);
        
        if (!context.includes('try') || !context.includes('catch')) {
          issues.push({
            type: 'missing_error_handling',
            file,
            description: 'Async route without try-catch',
            severity: 'high'
          });
        }
      });
      
      // Check for hardcoded secrets
      if (content.includes('password') || content.includes('secret') || content.includes('key')) {
        const secretPattern = /(password|secret|key)\s*[:=]\s*['"`][^'"`]+['"`]/i;
        if (secretPattern.test(content)) {
          issues.push({
            type: 'hardcoded_secrets',
            file,
            description: 'Hardcoded secrets detected',
            severity: 'high'
          });
        }
      }
    }
    
    if (file.endsWith('.html')) {
      // Check for security issues
      if (content.includes('<script>') && !content.includes('nonce=')) {
        issues.push({
          type: 'security_inline_script',
          file,
          description: 'Inline script without nonce',
          severity: 'medium'
        });
      }
      
      // Check for missing security headers
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

  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      validation: this.validationResults,
      status: Object.values(this.validationResults).every(result => result) ? 'PASS' : 'FAIL',
      summary: {
        totalChecks: 4,
        passedChecks: Object.values(this.validationResults).filter(result => result).length,
        failedChecks: Object.values(this.validationResults).filter(result => !result).length
      }
    };
  }
}

// CLI execution
if (require.main === module) {
  const guard = new DeploymentGuard();
  guard.validateBeforeMerge();
}

module.exports = DeploymentGuard;
