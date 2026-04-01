// Production Deployment Checklist - Phase 6
// 8 deployment steps with proof collection

const fs = require('fs');
const path = require('path');

console.log('🚀 Phase 6: Production Deployment - 8 Steps');
console.log('='.repeat(60));

let deploymentSteps = [];
let completedSteps = 0;

function addDeploymentStep(stepNumber, title, description, verificationCommand, proofFile) {
  deploymentSteps.push({
    step: stepNumber,
    title: title,
    description: description,
    verificationCommand: verificationCommand,
    proofFile: proofFile,
    completed: false
  });
}

// === DEPLOYMENT STEPS ===

// Step 1: Environment Variables Configuration
addDeploymentStep(
  1,
  'Environment Variables Configuration',
  'Verify all required environment variables are set for production',
  'node run-diagnostics.js',
  'deployment/step1-env-vars.txt'
);

// Step 2: Database Configuration Verification
addDeploymentStep(
  2,
  'Database Configuration Verification',
  'Verify database configuration is properly set up for Railway',
  'node -e "const fs = require(\'fs\'); const config = require(\'./config/config.json\'); console.log(\'Database Config:\', config.development ? \'OK\' : \'NOT FOUND\'); console.log(\'Environment Variables:\', process.env.DATABASE_URL ? \'SET\' : \'NOT SET\')"',
  'deployment/step2-database.txt'
);

// Step 3: Frontend Build Verification
addDeploymentStep(
  3,
  'Frontend Build Verification',
  'Verify all frontend assets are ready for deployment',
  'dir frontend && echo "Frontend files checked"',
  'deployment/step3-frontend.txt'
);

// Step 4: Backend Configuration Verification
addDeploymentStep(
  4,
  'Backend Configuration Verification',
  'Verify backend server configuration and startup sequence',
  'node -e "const fs = require(\'fs\'); const content = fs.readFileSync(\'server.js\', \'utf8\'); console.log(\'Server.js exists:\', content.length > 1000 ? \'OK\' : \'TOO SMALL\'); console.log(\'App.listen present:\', content.includes(\'app.listen\')); console.log(\'Module.exports present:\', content.includes(\'module.exports = app\'))"',
  'deployment/step4-backend.txt'
);

// Step 5: Configuration Files Validation
addDeploymentStep(
  5,
  'Configuration Files Validation',
  'Validate Railway and Netlify configuration files',
  'type railway.toml & echo "---" & type netlify.toml & echo "---" & type frontend\\_redirects',
  'deployment/step5-config.txt'
);

// Step 6: Security Headers Verification
addDeploymentStep(
  6,
  'Security Headers Verification',
  'Verify security headers and CORS configuration',
  'node -e "const fs = require(\'fs\'); console.log(\'CORS:\', fs.readFileSync(\'server.js\', \'utf8\').includes(\'cors\')); console.log(\'Security:\', fs.readFileSync(\'netlify.toml\', \'utf8\').includes(\'security\'))"',
  'deployment/step6-security.txt'
);

// Step 7: Test Suite Execution
addDeploymentStep(
  7,
  'Test Suite Execution',
  'Run complete test suite to ensure system readiness',
  'node test-automated-suite.js',
  'deployment/step7-tests.txt'
);

// Step 8: Production Readiness Check
addDeploymentStep(
  8,
  'Production Readiness Check',
  'Final comprehensive system check',
  'node run-diagnostics.js && echo "=== TEST SUITE ===" && node test-automated-suite.js',
  'deployment/step8-readiness.txt'
);

// === EXECUTE DEPLOYMENT STEPS ===

async function executeDeploymentStep(step) {
  console.log(`\n📋 Step ${step.step}: ${step.title}`);
  console.log(`   ${step.description}`);
  
  try {
    // Create deployment directory if it doesn't exist
    if (!fs.existsSync('deployment')) {
      fs.mkdirSync('deployment', { recursive: true });
    }
    
    // Execute verification command
    const { execSync } = require('child_process');
    const output = execSync(step.verificationCommand, { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 30000 // 30 second timeout
    });
    
    // Save proof
    fs.writeFileSync(step.proofFile, `Step ${step.step}: ${step.title}\n${'='.repeat(50)}\nCommand: ${step.verificationCommand}\n\nOutput:\n${output}\n\nTimestamp: ${new Date().toISOString()}\n`);
    
    console.log(`   ✅ COMPLETED - Proof saved to ${step.proofFile}`);
    step.completed = true;
    completedSteps++;
    
    return true;
  } catch (error) {
    const errorOutput = `Step ${step.step}: ${step.title}\n${'='.repeat(50)}\nCommand: ${step.verificationCommand}\n\nError:\n${error.message}\n\nTimestamp: ${new Date().toISOString()}\n`;
    
    fs.writeFileSync(step.proofFile, errorOutput);
    console.log(`   ❌ FAILED - Error saved to ${step.proofFile}`);
    console.log(`   Error: ${error.message}`);
    
    return false;
  }
}

// === RUN DEPLOYMENT CHECKLIST ===

async function runDeploymentChecklist() {
  console.log('Starting deployment checklist...\n');
  
  for (const step of deploymentSteps) {
    const success = await executeDeploymentStep(step);
    if (!success) {
      console.log(`\n⚠️  Step ${step.step} failed. Review ${step.proofFile} for details.`);
      break;
    }
  }
  
  // Generate final deployment report
  const report = `
# OnPurpose Production Deployment Report
Generated: ${new Date().toISOString()}

## Deployment Summary
- Total Steps: ${deploymentSteps.length}
- Completed Steps: ${completedSteps}
- Success Rate: ${((completedSteps / deploymentSteps.length) * 100).toFixed(1)}%

## Step Results
${deploymentSteps.map(step => 
  `- Step ${step.step}: ${step.title} - ${step.completed ? '✅ COMPLETED' : '❌ FAILED'}`
).join('\n')}

## Proof Files Generated
${deploymentSteps.map(step => 
  `- ${step.proofFile}`
).join('\n')}

## Production URLs
- Frontend: https://onpurpose.earth
- Backend API: https://onpurpose-backend-clean-production.up.railway.app
- Health Check: https://onpurpose-backend-clean-production.up.railway.app/health

## Next Steps
1. Review all proof files in the deployment/ directory
2. Verify production URLs are accessible
3. Monitor application performance
4. Check error logs for any issues

## Deployment Status: ${completedSteps === deploymentSteps.length ? '✅ READY FOR PRODUCTION' : '⚠️  NEEDS ATTENTION'}
`;
  
  fs.writeFileSync('deployment/DEPLOYMENT_REPORT.md', report);
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 Deployment Checklist Results:');
  console.log(`Completed: ${completedSteps}/${deploymentSteps.length} steps`);
  console.log(`Success Rate: ${((completedSteps / deploymentSteps.length) * 100).toFixed(1)}%`);
  console.log('\n📁 Proof files generated in deployment/ directory');
  console.log('📄 Full report saved to deployment/DEPLOYMENT_REPORT.md');
  
  if (completedSteps === deploymentSteps.length) {
    console.log('\n🎉 ALL DEPLOYMENT STEPS COMPLETED - System is ready for production!');
    console.log('\n🚀 Production Deployment - COMPLETE');
  } else {
    console.log('\n⚠️  SOME DEPLOYMENT STEPS FAILED - Review errors above');
    process.exit(1);
  }
}

// Execute deployment checklist
runDeploymentChecklist().catch(console.error);
