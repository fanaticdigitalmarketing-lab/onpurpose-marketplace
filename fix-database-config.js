#!/usr/bin/env node

/**
 * Quick fix for Railway database configuration
 * Run this in Railway console or as a one-off script
 */

const fs = require('fs');
const path = require('path');

// Read current config
const configPath = path.join(__dirname, 'config', 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Fix production config
config.production = {
  "use_env_variable": "DATABASE_URL",
  "dialect": "postgres"
};

// Write fixed config
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log('✅ Database configuration fixed for Railway deployment');
console.log('📊 Production config now uses DATABASE_URL environment variable');
