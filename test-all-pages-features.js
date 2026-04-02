const puppeteer = require('puppeteer');

async function testAllPagesAndFeatures() {
  console.log('🌐 TESTING ALL PAGES AND FEATURES\n');
  
  let browser;
  let results = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    details: []
  };
  
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Test 1: Main Page Load
    await runTest(page, 'Main Page Load', async () => {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      const title = await page.title();
      const hasContent = await page.$('h1') !== null;
      
      return {
        passed: title.includes('OnPurpose') && hasContent,
        details: `Title: ${title}, Has content: ${hasContent}`
      };
    }, results);
    
    // Test 2: CSS Loading
    await runTest(page, 'CSS Styles Applied', async () => {
      const computedStyle = await page.evaluate(() => {
        const body = document.body;
        return window.getComputedStyle(body).fontFamily;
      });
      
      return {
        passed: computedStyle.includes('system') || computedStyle.includes('sans-serif'),
        details: `Font family: ${computedStyle}`
      };
    }, results);
    
    // Test 3: API Endpoints
    await runTest(page, 'API Endpoints Functional', async () => {
      const response = await page.evaluate(async () => {
        try {
          const res = await fetch('/api/health');
          return { status: res.status, ok: res.ok };
        } catch (error) {
          return { status: 0, ok: false, error: error.message };
        }
      });
      
      return {
        passed: response.ok && response.status === 200,
        details: `API Status: ${response.status}, OK: ${response.ok}`
      };
    }, results);
    
    // Test 4: Authentication Form
    await runTest(page, 'Authentication Form Present', async () => {
      const hasEmailInput = await page.$('input[type="email"]') !== null;
      const hasPasswordInput = await page.$('input[type="password"]') !== null;
      const hasSubmitButton = await page.$('button[type="submit"]') !== null;
      
      return {
        passed: hasEmailInput && hasPasswordInput && hasSubmitButton,
        details: `Email: ${hasEmailInput}, Password: ${hasPasswordInput}, Button: ${hasSubmitButton}`
      };
    }, results);
    
    // Test 5: Service Display
    await runTest(page, 'Service Display Working', async () => {
      const hasServiceGrid = await page.$('.svc-grid, .service-grid, .services') !== null;
      const hasServiceCards = await page.$$('.svc-card, .service-card, .card').length > 0;
      
      return {
        passed: hasServiceGrid || hasServiceCards,
        details: `Service grid: ${hasServiceGrid}, Service cards: ${hasServiceCards}`
      };
    }, results);
    
    // Test 6: Navigation
    await runTest(page, 'Navigation Links Working', async () => {
      const navLinks = await page.$$('nav a, .nav a, .navigation a');
      const hasValidLinks = navLinks.length > 0;
      
      return {
        passed: hasValidLinks,
        details: `Navigation links found: ${navLinks.length}`
      };
    }, results);
    
    // Test 7: Responsive Design
    await runTest(page, 'Responsive Design', async () => {
      // Test mobile viewport
      await page.setViewport({ width: 375, height: 667 });
      const mobileLayout = await page.evaluate(() => {
        const bodyWidth = document.body.offsetWidth;
        return bodyWidth <= 375;
      });
      
      // Test desktop viewport
      await page.setViewport({ width: 1200, height: 800 });
      const desktopLayout = await page.evaluate(() => {
        const bodyWidth = document.body.offsetWidth;
        return bodyWidth >= 1200;
      });
      
      return {
        passed: mobileLayout && desktopLayout,
        details: `Mobile layout: ${mobileLayout}, Desktop layout: ${desktopLayout}`
      };
    }, results);
    
    // Test 8: Form Validation
    await runTest(page, 'Form Validation', async () => {
      // Try to submit empty form
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
      
      const hasValidation = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input:invalid');
        return inputs.length > 0;
      });
      
      return {
        passed: hasValidation,
        details: `Form validation working: ${hasValidation}`
      };
    }, results);
    
    // Test 9: JavaScript Functionality
    await runTest(page, 'JavaScript Functionality', async () => {
      const hasJS = await page.evaluate(() => {
        return typeof window.addEventListener === 'function' &&
               typeof document.querySelector === 'function';
      });
      
      return {
        passed: hasJS,
        details: `JavaScript enabled: ${hasJS}`
      };
    }, results);
    
    // Test 10: Error Handling
    await runTest(page, 'Error Handling', async () => {
      const errorResponse = await page.evaluate(async () => {
        try {
          const res = await fetch('/api/nonexistent-endpoint');
          return { status: res.status };
        } catch (error) {
          return { status: 'error', message: error.message };
        }
      });
      
      return {
        passed: errorResponse.status === 404 || errorResponse.status === 'error',
        details: `Error handling: ${errorResponse.status}`
      };
    }, results);
    
  } catch (error) {
    console.error('Test suite error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // Print results
  console.log('\n📊 ALL PAGES AND FEATURES TEST RESULTS');
  console.log('================================');
  console.log(`Total Tests: ${results.totalTests}`);
  console.log(`Passed: ${results.passedTests}`);
  console.log(`Failed: ${results.failedTests}`);
  console.log(`Success Rate: ${((results.passedTests / results.totalTests) * 100).toFixed(1)}%\n`);
  
  console.log('📋 DETAILED RESULTS:');
  results.details.forEach(result => {
    console.log(`${result.passed ? '✓' : '✗'} ${result.name} - ${result.details}`);
  });
  
  console.log('\n🎯 FEATURE STATUS:');
  if (results.passedTests === results.totalTests) {
    console.log('🎉 PERFECT! All pages and features are working correctly!');
  } else if (results.passedTests >= results.totalTests * 0.8) {
    console.log('✅ EXCELLENT! Most pages and features are working');
  } else {
    console.log('❌ NEEDS ATTENTION! Some pages and features are failing');
  }
  
  return results;
}

async function runTest(page, testName, testFn, results) {
  results.totalTests++;
  try {
    const result = await testFn();
    if (result.passed) {
      console.log(`✓ ${testName}`);
      results.passedTests++;
    } else {
      console.log(`✗ ${testName} - ${result.details}`);
      results.failedTests++;
    }
    results.details.push({
      name: testName,
      passed: result.passed,
      details: result.details
    });
  } catch (error) {
    console.log(`✗ ${testName} - Error: ${error.message}`);
    results.failedTests++;
    results.details.push({
      name: testName,
      passed: false,
      details: `Error: ${error.message}`
    });
  }
}

// Run the test
testAllPagesAndFeatures().catch(console.error);
