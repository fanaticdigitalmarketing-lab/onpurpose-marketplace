#!/usr/bin/env node

/**
 * Railway Database Configuration Fix
 * Run this in Railway console or as a one-off script
 * This fixes the production database config to use DATABASE_URL
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Railway database configuration...');

try {
  // Path to config file
  const configPath = path.join(process.cwd(), 'config', 'config.json');
  
  // Check if config exists
  if (!fs.existsSync(configPath)) {
    console.error('❌ config.json not found at:', configPath);
    process.exit(1);
  }

  // Read current config
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // Update production config to use DATABASE_URL
  config.production = {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres"
  };

  // Write the fixed config
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log('✅ Database configuration fixed successfully!');
  console.log('📊 Production config now uses DATABASE_URL environment variable');
  console.log('🚀 Ready for Railway deployment');
  
  // Verify the fix
  const updatedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log('🔍 Verification:', updatedConfig.production);
  
} catch (error) {
  console.error('❌ Error fixing database config:', error.message);
  process.exit(1);
}
