#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

class DeploymentWizard {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.config = {};
  }

  async start() {
    console.log('🚀 OnPurpose Deployment Wizard');
    console.log('=====================================\n');

    try {
      await this.gatherConfiguration();
      await this.validateConfiguration();
      await this.chooseDeploymentMethod();
      await this.executeDeployment();
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }

  async gatherConfiguration() {
    console.log('📝 Step 1: API Keys Configuration\n');

    // Stripe Configuration
    console.log('🔑 Stripe Configuration:');
    this.config.stripePublishableKey = await this.question('Enter Stripe Publishable Key (pk_live_...): ');
    this.config.stripeSecretKey = await this.question('Enter Stripe Secret Key (sk_live_...): ');
    this.config.stripeWebhookSecret = await this.question('Enter Stripe Webhook Secret (whsec_...): ');

    // Email Configuration
    console.log('\n📧 Email Configuration:');
    const emailProvider = await this.question('Choose email provider (1: SendGrid, 2: Gmail, 3: AWS SES): ');
    
    switch(emailProvider) {
      case '1':
        this.config.emailHost = 'smtp.sendgrid.net';
        this.config.emailPort = '587';
        this.config.emailUser = 'apikey';
        this.config.emailPass = await this.question('Enter SendGrid API Key: ');
        break;
      case '2':
        this.config.emailHost = 'smtp.gmail.com';
        this.config.emailPort = '587';
        this.config.emailUser = await this.question('Enter Gmail address: ');
        this.config.emailPass = await this.question('Enter Gmail App Password (16 characters): ');
        break;
      case '3':
        this.config.emailHost = await this.question('Enter AWS SES SMTP host: ');
        this.config.emailPort = '587';
        this.config.emailUser = await this.question('Enter AWS SMTP username: ');
        this.config.emailPass = await this.question('Enter AWS SMTP password: ');
        break;
      default:
        throw new Error('Invalid email provider selection');
    }

    this.config.emailFrom = await this.question('Enter "From" email address: ');

    // Security Configuration
    console.log('\n🔐 Security Configuration:');
    this.config.jwtSecret = this.generateSecureSecret();
    console.log(`Generated JWT Secret: ${this.config.jwtSecret.substring(0, 10)}...`);

    // Domain Configuration
    console.log('\n🌐 Domain Configuration:');
    this.config.domain = await this.question('Enter your domain (e.g., onpurpose.app): ');
  }

  async validateConfiguration() {
    console.log('\n✅ Step 2: Validating Configuration\n');

    // Validate Stripe keys
    if (!this.config.stripePublishableKey.startsWith('pk_live_')) {
      throw new Error('Invalid Stripe publishable key format');
    }
    if (!this.config.stripeSecretKey.startsWith('sk_live_')) {
      throw new Error('Invalid Stripe secret key format');
    }
    if (!this.config.stripeWebhookSecret.startsWith('whsec_')) {
      throw new Error('Invalid Stripe webhook secret format');
    }

    // Validate email configuration
    if (!this.config.emailFrom.includes('@')) {
      throw new Error('Invalid email format');
    }

    console.log('✅ All configurations validated successfully!');
  }

  async chooseDeploymentMethod() {
    console.log('\n🚀 Step 3: Choose Deployment Method\n');
    console.log('1. Heroku (Recommended - Easy setup with managed services)');
    console.log('2. Docker (Self-hosted with containers)');
    console.log('3. AWS (Enterprise - Full infrastructure control)');

    const choice = await this.question('\nSelect deployment method (1-3): ');
    
    switch(choice) {
      case '1':
        this.config.deploymentMethod = 'heroku';
        break;
      case '2':
        this.config.deploymentMethod = 'docker';
        break;
      case '3':
        this.config.deploymentMethod = 'aws';
        break;
      default:
        throw new Error('Invalid deployment method selection');
    }

    console.log(`✅ Selected: ${this.config.deploymentMethod.toUpperCase()}`);
  }

  async executeDeployment() {
    console.log('\n🔧 Step 4: Executing Deployment\n');

    // Create environment file
    await this.createEnvironmentFile();

    switch(this.config.deploymentMethod) {
      case 'heroku':
        await this.deployToHeroku();
        break;
      case 'docker':
        await this.deployWithDocker();
        break;
      case 'aws':
        await this.deployToAWS();
        break;
    }
  }

  async createEnvironmentFile() {
    const envContent = `# Production Environment Configuration
NODE_ENV=production
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/onpurpose_production

# Authentication
JWT_SECRET=${this.config.jwtSecret}

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=${this.config.stripePublishableKey}
STRIPE_SECRET_KEY=${this.config.stripeSecretKey}
STRIPE_WEBHOOK_SECRET=${this.config.stripeWebhookSecret}

# Email Configuration
EMAIL_HOST=${this.config.emailHost}
EMAIL_PORT=${this.config.emailPort}
EMAIL_USER=${this.config.emailUser}
EMAIL_PASS=${this.config.emailPass}
EMAIL_FROM=${this.config.emailFrom}

# App Configuration
APP_URL=https://${this.config.domain}
CORS_ORIGIN=https://${this.config.domain}
RATE_LIMIT_MAX=50
LOG_LEVEL=warn

# Monitoring
SENTRY_DSN=your_sentry_dsn_here
`;

    fs.writeFileSync('.env.production', envContent);
    console.log('✅ Environment file created: .env.production');
  }

  async deployToHeroku() {
    console.log('🚀 Deploying to Heroku...\n');

    const appName = await this.question('Enter Heroku app name (or press Enter for auto-generated): ');
    const finalAppName = appName || `onpurpose-${Date.now()}`;

    console.log('📦 Running Heroku deployment script...');
    
    return new Promise((resolve, reject) => {
      exec(`chmod +x deploy/heroku-deploy.sh && ./deploy/heroku-deploy.sh ${finalAppName}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        console.log(stdout);
        console.log('\n🎉 Heroku deployment completed!');
        console.log(`📱 App URL: https://${finalAppName}.herokuapp.com`);
        console.log(`⚙️ Configure webhook URL in Stripe: https://${finalAppName}.herokuapp.com/api/payment/webhook`);
        resolve();
      });
    });
  }

  async deployWithDocker() {
    console.log('🐳 Deploying with Docker...\n');

    console.log('📦 Building and starting containers...');
    
    return new Promise((resolve, reject) => {
      exec('docker-compose -f docker-compose.yml up -d --build', (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        console.log(stdout);
        console.log('\n🎉 Docker deployment completed!');
        console.log('📱 App URL: https://localhost (configure your domain)');
        console.log('⚙️ Configure webhook URL in Stripe: https://yourdomain.com/api/payment/webhook');
        resolve();
      });
    });
  }

  async deployToAWS() {
    console.log('☁️ Deploying to AWS...\n');

    const dbPassword = await this.question('Enter database password for AWS RDS: ');

    console.log('📦 Deploying AWS infrastructure...');
    
    return new Promise((resolve, reject) => {
      const command = `aws cloudformation create-stack --stack-name onpurpose-production --template-body file://deploy/aws-deploy.yml --parameters ParameterKey=DBPassword,ParameterValue=${dbPassword}`;
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        console.log(stdout);
        console.log('\n🎉 AWS deployment initiated!');
        console.log('⏳ Infrastructure creation will take 10-15 minutes');
        console.log('📊 Monitor progress in AWS CloudFormation console');
        resolve();
      });
    });
  }

  generateSecureSecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }
}

// Run the wizard
if (require.main === module) {
  const wizard = new DeploymentWizard();
  wizard.start().catch(console.error);
}

module.exports = DeploymentWizard;
