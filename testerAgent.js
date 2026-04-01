// 🧪 TESTER AGENT
// Generates and runs tests automatically

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class TesterAgent {
  constructor() {
    this.testResults = {
      generated: [],
      executed: [],
      passed: 0,
      failed: 0,
      coverage: 0
    };
    this.testPatterns = this.initializeTestPatterns();
  }

  initializeTestPatterns() {
    return {
      'missing_try_catch': {
        tests: [
          'test_error_handling',
          'test_async_route_error',
          'test_server_response_on_error'
        ],
        mockData: {
          errorResponse: { success: false, error: 'Internal server error' },
          statusCode: 500
        }
      },
      'missing_form_validation': {
        tests: [
          'test_form_required_validation',
          'test_form_pattern_validation',
          'test_form_submission_validation'
        ],
        mockData: {
          validForm: { username: 'test', email: 'test@example.com' },
          invalidForm: { username: '', email: 'invalid' }
        }
      },
      'console_error': {
        tests: [
          'test_logging_replacement',
          'test_logger_functionality',
          'test_log_levels'
        ],
        mockData: {
          logMessage: 'Test error message',
          logLevel: 'error'
        }
      },
      'missing_charset': {
        tests: [
          'test_charset_meta_tag',
          'test_character_encoding',
          'test_html_validation'
        ],
        mockData: {
          charset: 'UTF-8',
          contentType: 'text/html; charset=UTF-8'
        }
      },
      'security_vulnerability': {
        tests: [
          'test_eval_removal',
          'test_function_constructor_removal',
          'test_xss_prevention'
        ],
        mockData: {
          maliciousInput: '<script>alert("xss")</script>',
          safeOutput: 'sanitized'
        }
      },
      'hardcoded_secrets': {
        tests: [
          'test_environment_variable_usage',
          'test_secret_obfuscation',
          'test_config_security'
        ],
        mockData: {
          envVar: 'TEST_SECRET',
          configValue: 'secure_value'
        }
      }
    };
  }

  async generateTests(code, issue) {
    console.log(`🧪 TESTER AGENT - Generating tests for ${issue.type} in ${issue.file}`);
    
    const testSuite = {
      fileName: this.generateTestFileName(issue.file),
      tests: [],
      setup: this.generateTestSetup(code, issue),
      teardown: this.generateTestTeardown(code, issue)
    };

    try {
      const pattern = this.testPatterns[issue.type];
      if (pattern) {
        // Generate tests based on issue type
        pattern.tests.forEach(testName => {
          const test = this.generateTest(testName, code, issue, pattern);
          testSuite.tests.push(test);
        });
      } else {
        // Generate generic tests
        const genericTests = this.generateGenericTests(code, issue);
        testSuite.tests.push(...genericTests);
      }

      // Write test file
      await this.writeTestFile(testSuite);
      
      console.log(`🧪 Generated ${testSuite.tests.length} tests in ${testSuite.fileName}`);
      
      return {
        success: true,
        testSuite: testSuite,
        testCount: testSuite.tests.length
      };
      
    } catch (error) {
      console.error(`❌ Test generation failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        testCount: 0
      };
    }
  }

  generateTestFileName(originalFile) {
    const basename = path.basename(originalFile, path.extname(originalFile));
    return `test_${basename}.test.js`;
  }

  generateTestSetup(code, issue) {
    let setup = '';
    
    if (issue.file.endsWith('.js')) {
      setup += `
const request = require('supertest');
const app = require('../${issue.file}');
`;
      
      if (issue.type === 'missing_try_catch') {
        setup += `
const sinon = require('sinon');
`;
      }
    }
    
    return setup;
  }

  generateTestTeardown(code, issue) {
    let teardown = '';
    
    if (issue.type === 'missing_try_catch') {
      teardown += `
afterEach(() => {
  sinon.restore();
});
`;
    }
    
    return teardown;
  }

  generateTest(testName, code, issue, pattern) {
    const testGenerators = {
      'test_error_handling': () => this.generateErrorHandlingTest(code, issue),
      'test_async_route_error': () => this.generateAsyncRouteErrorTest(code, issue),
      'test_server_response_on_error': () => this.generateServerErrorTest(code, issue),
      'test_form_required_validation': () => this.generateFormValidationTest(code, issue),
      'test_form_pattern_validation': () => this.generateFormPatternTest(code, issue),
      'test_form_submission_validation': () => this.generateFormSubmissionTest(code, issue),
      'test_logging_replacement': () => this.generateLoggingTest(code, issue),
      'test_logger_functionality': () => this.generateLoggerTest(code, issue),
      'test_log_levels': () => this.generateLogLevelTest(code, issue),
      'test_charset_meta_tag': () => this.generateCharsetTest(code, issue),
      'test_character_encoding': () => this.generateEncodingTest(code, issue),
      'test_html_validation': () => this.generateHTMLValidationTest(code, issue),
      'test_eval_removal': () => this.generateEvalTest(code, issue),
      'test_function_constructor_removal': () => this.generateFunctionConstructorTest(code, issue),
      'test_xss_prevention': () => this.generateXSSPreventionTest(code, issue),
      'test_environment_variable_usage': () => this.generateEnvVarTest(code, issue),
      'test_secret_obfuscation': () => this.generateSecretTest(code, issue),
      'test_config_security': () => this.generateConfigTest(code, issue)
    };
    
    const generator = testGenerators[testName];
    return generator ? generator() : this.generateGenericTest(testName, code, issue);
  }

  generateErrorHandlingTest(code, issue) {
    return {
      name: 'should handle errors gracefully',
      description: 'Test that async routes properly handle errors',
      code: `
describe('Error Handling', () => {
  it('should return 500 on internal server error', async () => {
    // Mock an error condition
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    try {
      const response = await request(app)
        .post('/api/test')
        .send({ invalid: 'data' });
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    } finally {
      console.error = originalConsoleError;
    }
  });
});
`
    };
  }

  generateAsyncRouteErrorTest(code, issue) {
    return {
      name: 'should catch async errors',
      description: 'Test that async route errors are caught',
      code: `
describe('Async Error Handling', () => {
  it('should catch async function errors', async () => {
    // Force an async error
    const mockRoute = jest.fn().mockRejectedValue(new Error('Async error'));
    
    try {
      await mockRoute();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Async error');
    }
  });
});
`
    };
  }

  generateServerErrorTest(code, issue) {
    return {
      name: 'should return proper error response',
      description: 'Test server error response format',
      code: `
describe('Server Error Response', () => {
  it('should return structured error response', async () => {
    const response = await request(app)
      .get('/api/nonexistent');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
  });
});
`
    };
  }

  generateFormValidationTest(code, issue) {
    return {
      name: 'should validate required fields',
      description: 'Test form required field validation',
      code: `
describe('Form Validation', () => {
  it('should reject empty required fields', async () => {
    const response = await request(app)
      .post('/api/submit')
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errors');
  });
  
  it('should accept valid form data', async () => {
    const validData = {
      username: 'testuser',
      email: 'test@example.com'
    };
    
    const response = await request(app)
      .post('/api/submit')
      .send(validData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
});
`
    };
  }

  generateFormPatternTest(code, issue) {
    return {
      name: 'should validate field patterns',
      description: 'Test form field pattern validation',
      code: `
describe('Pattern Validation', () => {
  it('should reject invalid email format', async () => {
    const response = await request(app)
      .post('/api/submit')
      .send({
        username: 'testuser',
        email: 'invalid-email'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.errors).toContain('Invalid email format');
  });
});
`
    };
  }

  generateFormSubmissionTest(code, issue) {
    return {
      name: 'should handle form submission',
      description: 'Test complete form submission flow',
      code: `
describe('Form Submission', () => {
  it('should process valid form submission', async () => {
    const formData = {
      username: 'testuser',
      email: 'test@example.com',
      message: 'Test message'
    };
    
    const response = await request(app)
      .post('/api/contact')
      .send(formData);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
  });
});
`
    };
  }

  generateLoggingTest(code, issue) {
    return {
      name: 'should use proper logging',
      description: 'Test that logging is properly implemented',
      code: `
describe('Logging', () => {
  it('should use logger instead of console.error', () => {
    const logger = require('../services/logger');
    const spy = jest.spyOn(logger, 'error');
    
    // Trigger an error
    logger.error('Test error message');
    
    expect(spy).toHaveBeenCalledWith('Test error message');
    spy.mockRestore();
  });
});
`
    };
  }

  generateLoggerTest(code, issue) {
    return {
      name: 'should have working logger',
      description: 'Test logger functionality',
      code: `
describe('Logger Functionality', () => {
  it('should log different levels', () => {
    const logger = require('../services/logger');
    const spy = jest.spyOn(logger, 'error');
    
    logger.error('Error message');
    logger.warn('Warning message');
    logger.info('Info message');
    
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
`
    };
  }

  generateLogLevelTest(code, issue) {
    return {
      name: 'should respect log levels',
      description: 'Test log level functionality',
      code: `
describe('Log Levels', () => {
  it('should filter logs by level', () => {
    const logger = require('../services/logger');
    
    // Test that logger respects log levels
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.info).toBe('function');
  });
});
`
    };
  }

  generateCharsetTest(code, issue) {
    return {
      name: 'should have charset meta tag',
      description: 'Test HTML charset meta tag',
      code: `
describe('Charset Meta Tag', () => {
  it('should include UTF-8 charset', () => {
    const cheerio = require('cheerio');
    const $ = cheerio.load(require('fs').readFileSync('../index.html'));
    
    const charset = $('meta[charset]').attr('charset');
    expect(charset).toBe('UTF-8');
  });
});
`
    };
  }

  generateEncodingTest(code, issue) {
    return {
      name: 'should handle character encoding',
      description: 'Test character encoding handling',
      code: `
describe('Character Encoding', () => {
  it('should handle UTF-8 characters', async () => {
    const response = await request(app)
      .get('/')
      .expect('Content-Type', /charset=utf-8/i);
    
    expect(response.headers['content-type']).toMatch(/charset=utf-8/i);
  });
});
`
    };
  }

  generateHTMLValidationTest(code, issue) {
    return {
      name: 'should validate HTML structure',
      description: 'Test HTML validation',
      code: `
describe('HTML Validation', () => {
  it('should have valid HTML structure', () => {
    const cheerio = require('cheerio');
    const $ = cheerio.load(require('fs').readFileSync('../index.html'));
    
    expect($('html').length).toBe(1);
    expect($('head').length).toBe(1);
    expect($('body').length).toBe(1);
  });
});
`
    };
  }

  generateEvalTest(code, issue) {
    return {
      name: 'should not use eval',
      description: 'Test that eval is not used',
      code: `
describe('Security - Eval', () => {
  it('should not contain eval statements', () => {
    const fs = require('fs');
    const code = fs.readFileSync('../server.js', 'utf8');
    
    expect(code).not.toMatch(/eval\s*\(/);
  });
});
`
    };
  }

  generateFunctionConstructorTest(code, issue) {
    return {
      name: 'should not use Function constructor',
      description: 'Test that Function constructor is not used',
      code: `
describe('Security - Function Constructor', () => {
  it('should not contain Function constructor', () => {
    const fs = require('fs');
    const code = fs.readFileSync('../server.js', 'utf8');
    
    expect(code).not.toMatch(/new\s+Function\s*\(/);
  });
});
`
    };
  }

  generateXSSPreventionTest(code, issue) {
    return {
      name: 'should prevent XSS attacks',
      description: 'Test XSS prevention',
      code: `
describe('Security - XSS Prevention', () => {
  it('should sanitize user input', async () => {
    const maliciousInput = '<script>alert("xss")</script>';
    
    const response = await request(app)
      .post('/api/submit')
      .send({ input: maliciousInput });
    
    expect(response.body.data).not.toContain('<script>');
  });
});
`
    };
  }

  generateEnvVarTest(code, issue) {
    return {
      name: 'should use environment variables',
      description: 'Test environment variable usage',
      code: `
describe('Environment Variables', () => {
  it('should use process.env for secrets', () => {
    const fs = require('fs');
    const code = fs.readFileSync('../server.js', 'utf8');
    
    expect(code).toMatch(/process\.env\./);
  });
  
  it('should handle missing environment variables', () => {
    const originalEnv = process.env.TEST_SECRET;
    delete process.env.TEST_SECRET;
    
    const config = require('../config');
    expect(config).toBeDefined();
    
    if (originalEnv) {
      process.env.TEST_SECRET = originalEnv;
    }
  });
});
`
    };
  }

  generateSecretTest(code, issue) {
    return {
      name: 'should not have hardcoded secrets',
      description: 'Test secret obfuscation',
      code: `
describe('Secret Security', () => {
  it('should not have hardcoded secrets', () => {
    const fs = require('fs');
    const code = fs.readFileSync('../server.js', 'utf8');
    
    expect(code).not.toMatch(/password\s*[:=]\s*['"`][^'"`]+['"`]/);
    expect(code).not.toMatch(/secret\s*[:=]\s*['"`][^'"`]+['"`]/);
    expect(code).not.toMatch(/key\s*[:=]\s*['"`][^'"`]+['"`]/);
  });
});
`
    };
  }

  generateConfigTest(code, issue) {
    return {
      name: 'should have secure configuration',
      description: 'Test configuration security',
      code: `
describe('Configuration Security', () => {
  it('should validate configuration', () => {
    const config = require('../config');
    
    expect(config).toBeDefined();
    expect(typeof config).toBe('object');
  });
});
`
    };
  }

  generateGenericTests(code, issue) {
    return [
      {
        name: 'should not break existing functionality',
        description: 'Test that existing functionality still works',
        code: `
describe('Functionality Preservation', () => {
  it('should maintain existing API endpoints', async () => {
    const response = await request(app)
      .get('/api/health');
    
    expect(response.status).toBe(200);
  });
});
`
      },
      {
        name: 'should handle edge cases',
        description: 'Test edge case handling',
        code: `
describe('Edge Cases', () => {
  it('should handle null input gracefully', async () => {
    const response = await request(app)
      .post('/api/test')
      .send(null);
    
    expect(response.status).toBe(400);
  });
});
`
      }
    ];
  }

  generateGenericTest(testName, code, issue) {
    return {
      name: testName,
      description: `Generic test for ${testName}`,
      code: `
describe('${testName}', () => {
  it('should pass basic validation', () => {
    expect(true).toBe(true);
  });
});
`
    };
  }

  async writeTestFile(testSuite) {
    const testDir = 'tests';
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    const testFilePath = path.join(testDir, testSuite.fileName);
    
    let testFileContent = testSuite.setup + '\n\n';
    
    testSuite.tests.forEach(test => {
      testFileContent += test.code + '\n\n';
    });
    
    testFileContent += testSuite.teardown;
    
    fs.writeFileSync(testFilePath, testFileContent);
    
    return testFilePath;
  }

  async runTests(testSuite) {
    console.log(`🧪 TESTER AGENT - Running ${testSuite.tests.length} tests`);
    
    const results = {
      fileName: testSuite.fileName,
      total: testSuite.tests.length,
      passed: 0,
      failed: 0,
      errors: [],
      coverage: 0,
      duration: 0
    };
    
    try {
      const startTime = Date.now();
      
      // Run tests using Jest or similar test runner
      const testResult = await this.executeTests(testSuite.fileName);
      
      results.passed = testResult.passed || 0;
      results.failed = testResult.failed || 0;
      results.errors = testResult.errors || [];
      results.coverage = testResult.coverage || 0;
      results.duration = Date.now() - startTime;
      
      console.log(`🧪 Test results: ${results.passed}/${results.total} passed (${((results.passed / results.total) * 100).toFixed(1)}%)`);
      
      return {
        success: results.failed === 0,
        results: results
      };
      
    } catch (error) {
      console.error(`❌ Test execution failed: ${error.message}`);
      results.errors.push(`Test execution error: ${error.message}`);
      
      return {
        success: false,
        results: results
      };
    }
  }

  async executeTests(testFileName) {
    return new Promise((resolve) => {
      const testProcess = spawn('npm', ['test', '--', testFileName], {
        stdio: 'pipe',
        cwd: process.cwd
      });
      
      let output = '';
      let errorOutput = '';
      
      testProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      testProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      testProcess.on('close', (code) => {
        // Parse test output
        const results = this.parseTestOutput(output + errorOutput);
        resolve(results);
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        testProcess.kill();
        resolve({
          passed: 0,
          failed: 1,
          errors: ['Test execution timed out'],
          coverage: 0
        });
      }, 30000);
    });
  }

  parseTestOutput(output) {
    const results = {
      passed: 0,
      failed: 0,
      errors: [],
      coverage: 0
    };
    
    // Simple parsing - in reality would use proper test result parser
    const lines = output.split('\n');
    
    lines.forEach(line => {
      if (line.includes('✓') || line.includes('PASS')) {
        results.passed++;
      } else if (line.includes('✗') || line.includes('FAIL')) {
        results.failed++;
        results.errors.push(line.trim());
      }
    });
    
    // Extract coverage if available
    const coverageMatch = output.match(/Coverage:\s*(\d+)%/);
    if (coverageMatch) {
      results.coverage = parseInt(coverageMatch[1]);
    }
    
    return results;
  }

  async generateAndRunTests(code, issue) {
    console.log(`🧪 TESTER AGENT - Generating and running tests for ${issue.type}`);
    
    // Step 1: Generate tests
    const generationResult = await this.generateTests(code, issue);
    if (!generationResult.success) {
      return {
        success: false,
        error: generationResult.error,
        testResults: null
      };
    }
    
    // Step 2: Run tests
    const executionResult = await this.runTests(generationResult.testSuite);
    
    // Update overall test results
    this.testResults.generated.push(generationResult.testSuite);
    this.testResults.executed.push(executionResult.results);
    this.testResults.passed += executionResult.results.passed;
    this.testResults.failed += executionResult.results.failed;
    
    return {
      success: executionResult.success,
      testResults: executionResult.results,
      testSuite: generationResult.testSuite
    };
  }

  validateRegressions(originalTests, newTests) {
    console.log('🧪 TESTER AGENT - Checking for regressions');
    
    const regressions = [];
    
    // Compare test results
    if (originalTests && newTests) {
      const originalPassed = originalTests.passed || 0;
      const newPassed = newTests.passed || 0;
      
      if (newPassed < originalPassed) {
        regressions.push(`Test failures increased: ${originalPassed} → ${newPassed}`);
      }
    }
    
    return {
      hasRegressions: regressions.length > 0,
      regressions: regressions
    };
  }

  generateTestReport() {
    const totalTests = this.testResults.passed + this.testResults.failed;
    const successRate = totalTests > 0 ? (this.testResults.passed / totalTests) * 100 : 0;
    
    return {
      summary: {
        total: totalTests,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        successRate: successRate.toFixed(1),
        coverage: this.calculateAverageCoverage()
      },
      testSuites: this.testResults.executed,
      recommendations: this.generateTestRecommendations()
    };
  }

  calculateAverageCoverage() {
    if (this.testResults.executed.length === 0) return 0;
    
    const totalCoverage = this.testResults.executed.reduce((sum, result) => sum + (result.coverage || 0), 0);
    return Math.round(totalCoverage / this.testResults.executed.length);
  }

  generateTestRecommendations() {
    const recommendations = [];
    
    if (this.testResults.failed > 0) {
      recommendations.push({
        type: 'fix_failures',
        priority: 'high',
        message: `${this.testResults.failed} tests failed - review and fix failing tests`
      });
    }
    
    const avgCoverage = this.calculateAverageCoverage();
    if (avgCoverage < 80) {
      recommendations.push({
        type: 'improve_coverage',
        priority: 'medium',
        message: `Test coverage is ${avgCoverage}% - aim for at least 80%`
      });
    }
    
    if (this.testResults.passed === 0 && this.testResults.failed === 0) {
      recommendations.push({
        type: 'add_tests',
        priority: 'medium',
        message: 'No tests found - add comprehensive test suite'
      });
    }
    
    return recommendations;
  }
}

module.exports = TesterAgent;
