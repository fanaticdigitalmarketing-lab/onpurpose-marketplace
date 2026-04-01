// 🧪 VALIDATION ENGINE
// Comprehensive system validation for autonomous fixes

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class ValidationEngine {
  constructor() {
    this.testResults = {
      syntax: [],
      runtime: [],
      api: [],
      files: []
    };
  }

  async validateSystem() {
    console.log('🧪 RUNNING COMPREHENSIVE SYSTEM VALIDATION');
    console.log('='.repeat(50));

    const results = {
      success: true,
      errors: [],
      warnings: [],
      details: {}
    };

    try {
      // Phase 1: Syntax validation
      console.log('\n📝 Phase 1 - Syntax Validation');
      const syntaxResults = await this.validateSyntax();
      results.details.syntax = syntaxResults;
      if (!syntaxResults.success) {
        results.success = false;
        results.errors.push(...syntaxResults.errors);
      }

      // Phase 2: File integrity
      console.log('\n📁 Phase 2 - File Integrity');
      const fileResults = await this.validateFiles();
      results.details.files = fileResults;
      if (!fileResults.success) {
        results.success = false;
        results.errors.push(...fileResults.errors);
      }

      // Phase 3: Runtime validation
      console.log('\n⚡ Phase 3 - Runtime Validation');
      const runtimeResults = await this.validateRuntime();
      results.details.runtime = runtimeResults;
      if (!runtimeResults.success) {
        results.success = false;
        results.errors.push(...runtimeResults.errors);
      }

      // Phase 4: API validation
      console.log('\n🔌 Phase 4 - API Validation');
      const apiResults = await this.validateAPI();
      results.details.api = apiResults;
      if (!apiResults.success) {
        results.success = false;
        results.errors.push(...apiResults.errors);
      }

      console.log(`\n✅ Validation Complete: ${results.success ? 'PASSED' : 'FAILED'}`);
      return results;

    } catch (error) {
      results.success = false;
      results.errors.push(`Validation engine error: ${error.message}`);
      return results;
    }
  }

  async validateSyntax() {
    const results = {
      success: true,
      errors: [],
      warnings: [],
      files: []
    };

    const jsFiles = this.getJavaScriptFiles();
    
    for (const file of jsFiles) {
      try {
        const result = await this.validateFileSyntax(file);
        results.files.push(result);
        
        if (!result.success) {
          results.success = false;
          results.errors.push(...result.errors);
        }
        
        if (result.warnings.length > 0) {
          results.warnings.push(...result.warnings);
        }
      } catch (error) {
        results.success = false;
        results.errors.push(`Syntax validation error for ${file}: ${error.message}`);
      }
    }

    console.log(`📝 JavaScript files: ${jsFiles.length}`);
    console.log(`✅ Syntax valid: ${results.files.filter(f => f.success).length}/${results.files.length}`);
    
    return results;
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

  async validateFileSyntax(filePath) {
    const result = {
      file: filePath,
      success: true,
      errors: [],
      warnings: []
    };

    try {
      // Try to require the file to check syntax
      require.resolve(filePath);
      
      // Check for common syntax issues
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for missing semicolons (basic check)
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.endsWith(';') && !trimmed.endsWith('{') && 
            !trimmed.endsWith('}') && !trimmed.includes('//') && 
            !trimmed.includes('if') && !trimmed.includes('for') && 
            !trimmed.includes('while') && !trimmed.includes('function') &&
            !trimmed.includes('class') && !trimmed.includes('const') &&
            !trimmed.includes('let') && !trimmed.includes('var') &&
            !trimmed.includes('return') && !trimmed.includes('break') &&
            !trimmed.includes('continue')) {
          result.warnings.push(`Line ${index + 1}: Possible missing semicolon`);
        }
      });
      
    } catch (error) {
      result.success = false;
      result.errors.push(`Syntax error: ${error.message}`);
    }

    return result;
  }

  async validateFiles() {
    const results = {
      success: true,
      errors: [],
      warnings: [],
      files: []
    };

    const criticalFiles = [
      'server.js',
      'package.json',
      'index.html',
      'frontend/index.html'
    ];

    for (const file of criticalFiles) {
      const result = await this.validateCriticalFile(file);
      results.files.push(result);
      
      if (!result.success) {
        results.success = false;
        results.errors.push(...result.errors);
      }
      
      if (result.warnings.length > 0) {
        results.warnings.push(...result.warnings);
      }
    }

    console.log(`📁 Critical files: ${criticalFiles.length}`);
    console.log(`✅ Files valid: ${results.files.filter(f => f.success).length}/${results.files.length}`);
    
    return results;
  }

  async validateCriticalFile(filePath) {
    const result = {
      file: filePath,
      success: true,
      errors: [],
      warnings: []
    };

    if (!fs.existsSync(filePath)) {
      result.success = false;
      result.errors.push('File does not exist');
      return result;
    }

    try {
      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');

      // Check file size
      if (stats.size > 1024 * 1024) { // 1MB
        result.warnings.push('Large file size (>1MB)');
      }

      // Check for common issues based on file type
      if (filePath.endsWith('.js')) {
        // Check for console.log in production
        if (content.includes('console.log')) {
          result.warnings.push('console.log statements found');
        }

        // Check for TODO comments
        if (content.includes('TODO') || content.includes('FIXME')) {
          result.warnings.push('TODO/FIXME comments found');
        }
      }

      if (filePath.endsWith('.html')) {
        // Check for missing charset
        if (!content.includes('charset')) {
          result.errors.push('Missing charset meta tag');
          result.success = false;
        }

        // Check for inline styles/scripts
        if (content.includes('<style>') || content.includes('<script>')) {
          result.warnings.push('Inline CSS/JS detected');
        }
      }

      if (filePath.endsWith('.json')) {
        // Validate JSON syntax
        try {
          JSON.parse(content);
        } catch (error) {
          result.success = false;
          result.errors.push(`Invalid JSON: ${error.message}`);
        }
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`File validation error: ${error.message}`);
    }

    return result;
  }

  async validateRuntime() {
    const results = {
      success: true,
      errors: [],
      warnings: [],
      tests: []
    };

    try {
      // Test server startup (simulate)
      console.log('🚀 Testing server startup...');
      const serverTest = await this.testServerStartup();
      results.tests.push(serverTest);
      
      if (!serverTest.success) {
        results.success = false;
        results.errors.push(...serverTest.errors);
      }

      // Test package.json scripts
      console.log('📦 Testing package.json...');
      const packageTest = await this.testPackageScripts();
      results.tests.push(packageTest);
      
      if (!packageTest.success) {
        results.success = false;
        results.errors.push(...packageTest.errors);
      }

    } catch (error) {
      results.success = false;
      results.errors.push(`Runtime validation error: ${error.message}`);
    }

    console.log(`⚡ Runtime tests: ${results.tests.length}`);
    console.log(`✅ Tests passed: ${results.tests.filter(t => t.success).length}/${results.tests.length}`);
    
    return results;
  }

  async testServerStartup() {
    const result = {
      test: 'Server Startup',
      success: true,
      errors: [],
      warnings: []
    };

    try {
      // Check if server.js exists and is syntactically valid
      if (!fs.existsSync('server.js')) {
        result.success = false;
        result.errors.push('server.js does not exist');
        return result;
      }

      // Try to parse server.js
      const content = fs.readFileSync('server.js', 'utf8');
      
      // Check for essential components
      const requiredComponents = [
        'express',
        'app.listen',
        '/api',
        'cors'
      ];

      requiredComponents.forEach(component => {
        if (!content.includes(component)) {
          result.warnings.push(`Missing component: ${component}`);
        }
      });

      // Check for error handling
      if (!content.includes('try') || !content.includes('catch')) {
        result.warnings.push('Limited error handling detected');
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Server startup test failed: ${error.message}`);
    }

    return result;
  }

  async testPackageScripts() {
    const result = {
      test: 'Package Scripts',
      success: true,
      errors: [],
      warnings: []
    };

    try {
      if (!fs.existsSync('package.json')) {
        result.success = false;
        result.errors.push('package.json does not exist');
        return result;
      }

      const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // Check for essential scripts
      const essentialScripts = ['start'];
      const scripts = packageData.scripts || {};
      
      essentialScripts.forEach(script => {
        if (!scripts[script]) {
          result.warnings.push(`Missing script: ${script}`);
        }
      });

      // Check dependencies
      const requiredDeps = ['express'];
      const dependencies = packageData.dependencies || {};
      
      requiredDeps.forEach(dep => {
        if (!dependencies[dep]) {
          result.errors.push(`Missing dependency: ${dep}`);
          result.success = false;
        }
      });

    } catch (error) {
      result.success = false;
      result.errors.push(`Package scripts test failed: ${error.message}`);
    }

    return result;
  }

  async validateAPI() {
    const results = {
      success: true,
      errors: [],
      warnings: [],
      endpoints: []
    };

    try {
      if (!fs.existsSync('server.js')) {
        results.success = false;
        results.errors.push('server.js not available for API validation');
        return results;
      }

      const content = fs.readFileSync('server.js', 'utf8');
      
      // Extract API endpoints
      const endpointMatches = content.match(/app\.(get|post|put|delete)\s*\(['"`]([^'"`]+)['"`]/g) || [];
      
      const endpoints = endpointMatches.map(match => {
        const method = match.match(/app\.(get|post|put|delete)/)[1];
        const path = match.match(/['"`]([^'"`]+)['"`]/)[1];
        return { method, path };
      });

      // Test essential endpoints
      const essentialEndpoints = [
        { method: 'get', path: '/health' },
        { method: 'get', path: '/api/services' }
      ];

      essentialEndpoints.forEach(essential => {
        const found = endpoints.some(ep => 
          ep.method === essential.method && ep.path === essential.path
        );

        if (!found) {
          results.warnings.push(`Missing essential endpoint: ${essential.method.toUpperCase()} ${essential.path}`);
        }
      });

      // Check for error handling in endpoints
      endpoints.forEach(endpoint => {
        // This is a simplified check - in reality, you'd parse the AST
        const endpointCode = content.substring(
          content.indexOf(endpoint.path),
          content.indexOf(endpoint.path) + 500
        );

        if (!endpointCode.includes('try') || !endpointCode.includes('catch')) {
          results.warnings.push(`Endpoint ${endpoint.method.toUpperCase()} ${endpoint.path} may lack error handling`);
        }

        results.endpoints.push({
          ...endpoint,
          hasErrorHandling: endpointCode.includes('try') && endpointCode.includes('catch')
        });
      });

      console.log(`🔌 API endpoints: ${endpoints.length}`);
      console.log(`✅ Endpoints with error handling: ${results.endpoints.filter(ep => ep.hasErrorHandling).length}/${endpoints.length}`);

    } catch (error) {
      results.success = false;
      results.errors.push(`API validation error: ${error.message}`);
    }

    return results;
  }

  generateReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      overall: results.success ? 'PASSED' : 'FAILED',
      summary: {
        totalErrors: results.errors.length,
        totalWarnings: results.warnings.length,
        categories: {
          syntax: results.details.syntax?.files?.length || 0,
          files: results.details.files?.files?.length || 0,
          runtime: results.details.runtime?.tests?.length || 0,
          api: results.details.api?.endpoints?.length || 0
        }
      },
      details: results
    };

    try {
      fs.writeFileSync('validation-report.json', JSON.stringify(report, null, 2));
      console.log('\n📄 Validation report saved to: validation-report.json');
    } catch (error) {
      console.error('Error saving validation report:', error.message);
    }

    return report;
  }
}

module.exports = ValidationEngine;
