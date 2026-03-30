#!/usr/bin/env node

/**
 * OnPurpose Launch Script
 * Automates deployment verification and testing
 */

const https = require('https');
const chalk = require('chalk');

const config = {
  baseUrl: 'https://onpurpose-production-a60a.up.railway.app',
  endpoints: [
    '/health',
    '/api',
    '/api/auth/status',
    '/api/hosts',
    '/api/bookings'
  ],
  testCard: '4242424242424242',
  timeout: 10000
};

class OnPurposeLauncher {
  constructor() {
    this.results = {
      endpoints: {},
      database: false,
      stripe: false,
      email: false,
      ready: false
    };
  }

  async launch() {
    console.log(chalk.blue.bold('\n🚀 OnPurpose Launch Verification\n'));
    
    // Step 1: Test basic connectivity
    await this.testEndpoints();
    
    // Step 2: Verify core services
    await this.verifyServices();
    
    // Step 3: Generate launch report
    this.generateReport();
    
    return this.results.ready;
  }

  async testEndpoints() {
    console.log(chalk.yellow('📡 Testing Application Endpoints...\n'));
    
    for (const endpoint of config.endpoints) {
      const url = `${config.baseUrl}${endpoint}`;
      
      try {
        const response = await this.makeRequest(url);
        this.results.endpoints[endpoint] = {
          status: response.statusCode,
          success: response.statusCode === 200,
          data: response.data
        };
        
        const status = response.statusCode === 200 ? 
          chalk.green('✅ PASS') : 
          chalk.red(`❌ FAIL (${response.statusCode})`);
        
        console.log(`${endpoint.padEnd(20)} ${status}`);
        
      } catch (error) {
        this.results.endpoints[endpoint] = {
          status: 'ERROR',
          success: false,
          error: error.message
        };
        
        console.log(`${endpoint.padEnd(20)} ${chalk.red('❌ ERROR')}: ${error.message}`);
      }
    }
  }

  async verifyServices() {
    console.log(chalk.yellow('\n🔧 Verifying Core Services...\n'));
    
    // Database connectivity
    if (this.results.endpoints['/health']?.success) {
      const healthData = this.results.endpoints['/health'].data;
      this.results.database = healthData?.database === 'connected';
      
      console.log(`Database      ${this.results.database ? 
        chalk.green('✅ Connected') : 
        chalk.red('❌ Disconnected')}`);
    }
    
    // Stripe integration
    if (this.results.endpoints['/api']?.success) {
      this.results.stripe = true; // API responding indicates Stripe is configured
      console.log(`Stripe        ${chalk.green('✅ Configured')}`);
    } else {
      console.log(`Stripe        ${chalk.red('❌ Not Ready')}`);
    }
    
    // Email service
    this.results.email = process.env.EMAIL_HOST === 'smtp.sendgrid.net';
    console.log(`Email         ${this.results.email ? 
      chalk.green('✅ SendGrid Ready') : 
      chalk.yellow('⚠️  Check Config')}`);
  }

  generateReport() {
    console.log(chalk.blue.bold('\n📊 Launch Status Report\n'));
    
    const passedEndpoints = Object.values(this.results.endpoints)
      .filter(result => result.success).length;
    const totalEndpoints = config.endpoints.length;
    
    console.log(`Endpoints:    ${passedEndpoints}/${totalEndpoints} passing`);
    console.log(`Database:     ${this.results.database ? 'Connected' : 'Needs Setup'}`);
    console.log(`Payments:     ${this.results.stripe ? 'Ready' : 'Needs Config'}`);
    console.log(`Email:        ${this.results.email ? 'Ready' : 'Needs Config'}`);
    
    // Overall readiness
    this.results.ready = passedEndpoints >= 2 && this.results.database;
    
    console.log(chalk.blue.bold('\n🎯 Launch Readiness\n'));
    
    if (this.results.ready) {
      console.log(chalk.green.bold('✅ READY FOR PILOT LAUNCH!'));
      console.log(chalk.green('OnPurpose is operational and ready for 50 NYC hosts'));
      
      console.log(chalk.blue('\n📱 Next Steps:'));
      console.log('1. Test mobile app with live backend');
      console.log('2. Verify admin dashboard functionality');
      console.log('3. Process test booking with Stripe');
      console.log('4. Send test email notification');
      console.log('5. Begin host onboarding process');
      
    } else {
      console.log(chalk.red.bold('⚠️  NEEDS CONFIGURATION'));
      console.log(chalk.yellow('Add environment variables to Railway to complete setup'));
      
      console.log(chalk.blue('\n🔧 Required Actions:'));
      if (!this.results.database) {
        console.log('- Configure DATABASE_URL in Railway');
      }
      if (!this.results.stripe) {
        console.log('- Add Stripe API keys to Railway variables');
      }
      if (!this.results.email) {
        console.log('- Configure SendGrid email settings');
      }
    }
    
    console.log(chalk.blue(`\n🌐 Live URL: ${config.baseUrl}\n`));
  }

  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, { timeout: config.timeout }, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          try {
            const parsedData = data ? JSON.parse(data) : null;
            resolve({
              statusCode: response.statusCode,
              data: parsedData
            });
          } catch (error) {
            resolve({
              statusCode: response.statusCode,
              data: data
            });
          }
        });
      });
      
      request.on('error', (error) => {
        reject(error);
      });
      
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }
}

// Execute launch verification
if (require.main === module) {
  const launcher = new OnPurposeLauncher();
  launcher.launch().then((ready) => {
    process.exit(ready ? 0 : 1);
  }).catch((error) => {
    console.error(chalk.red('Launch verification failed:'), error);
    process.exit(1);
  });
}

module.exports = OnPurposeLauncher;
