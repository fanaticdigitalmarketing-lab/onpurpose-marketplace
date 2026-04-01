const { validateBeforeDeploy, comprehensiveValidation } = require('./deployValidator');

// Test data for deployment validation
const testResults = {
  fixResults: [
    {
      success: true,
      file: 'server.js',
      error: { type: 'api_error_handling', severity: 'medium' }
    },
    {
      success: true,
      file: 'index.html',
      error: { type: 'missing_charset', severity: 'medium' }
    },
    {
      success: false,
      file: 'package.json',
      error: { type: 'dependency_conflict', severity: 'high' }
    }
  ],
  evolutionReport: {
    successRate: 85,
    totalFixes: 100,
    learnedRules: 116
  },
  systemHealth: 72,
  learnedRules: 116,
  fixHistory: [
    { timestamp: '2026-04-01T09:31:22.256Z', success: true },
    { timestamp: '2026-04-01T09:35:15.123Z', success: true }
  ]
};

console.log('🚀 Testing Deployment Validation System');
console.log('=====================================\n');

// Test 1: Basic validation (should fail due to failed fix)
console.log('📋 Test 1: Basic Validation with Failed Fix');
try {
  validateBeforeDeploy(testResults);
  console.log('❌ Expected validation to fail, but it passed');
} catch (error) {
  console.log('✅ Validation correctly failed:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 2: Comprehensive validation
console.log('📋 Test 2: Comprehensive Validation');
const report = comprehensiveValidation(testResults);
console.log('📊 Validation Report:', JSON.stringify(report, null, 2));

console.log('\n' + '='.repeat(50) + '\n');

// Test 3: Successful validation scenario
console.log('📋 Test 3: Successful Validation Scenario');
const successfulResults = {
  fixResults: [
    {
      success: true,
      file: 'server.js',
      error: { type: 'api_error_handling', severity: 'medium' }
    },
    {
      success: true,
      file: 'index.html',
      error: { type: 'missing_charset', severity: 'medium' }
    }
  ],
  evolutionReport: {
    successRate: 95,
    totalFixes: 100,
    learnedRules: 116
  },
  systemHealth: 85,
  learnedRules: 116,
  fixHistory: Array(100).fill({ success: true })
};

try {
  const isValid = validateBeforeDeploy(successfulResults);
  console.log('✅ Successful validation passed:', isValid);
} catch (error) {
  console.log('❌ Unexpected validation failure:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// Test 4: Low success rate scenario
console.log('📋 Test 4: Low Success Rate Scenario');
const lowSuccessResults = {
  ...successfulResults,
  evolutionReport: {
    successRate: 75,
    totalFixes: 100,
    learnedRules: 116
  }
};

try {
  validateBeforeDeploy(lowSuccessResults);
  console.log('❌ Expected validation to fail due to low success rate');
} catch (error) {
  console.log('✅ Validation correctly failed for low success rate:', error.message);
}

console.log('\n🎯 Deployment Validation Testing Complete!');
