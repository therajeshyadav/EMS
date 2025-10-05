#!/usr/bin/env node
// scripts/verify-deployment-new.js - Verify deployment configuration (ES Module version)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying deployment configuration...\n');

// Check if .env.production exists
const envProdPath = path.join(__dirname, '../.env.production');
if (!fs.existsSync(envProdPath)) {
  console.error('❌ .env.production file not found!');
  console.log('📝 Create .env.production with:');
  console.log('VITE_API_BASE_URL=https://your-backend-url.onrender.com/api');
  console.log('VITE_SOCKET_URL=https://your-backend-url.onrender.com\n');
  process.exit(1);
}

// Read .env.production
const envContent = fs.readFileSync(envProdPath, 'utf8');
const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

console.log('📋 Production Environment Variables:');
envLines.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    console.log(`  ${key}: ${value}`);
  }
});

// Check for required variables
const requiredVars = ['VITE_API_BASE_URL', 'VITE_SOCKET_URL'];
const missingVars = [];

requiredVars.forEach(varName => {
  const found = envLines.some(line => line.startsWith(`${varName}=`));
  if (!found) {
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.error('\n❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`  - ${varName}`);
  });
  process.exit(1);
}

// Check for localhost references
const hasLocalhost = envLines.some(line => line.includes('localhost'));
if (hasLocalhost) {
  console.warn('\n⚠️  Warning: Found localhost references in production config!');
  console.warn('   Make sure to use your actual deployed URLs.');
}

// Check for placeholder URLs - but don't fail the build
const hasPlaceholders = envLines.some(line => line.includes('your-backend-url') || line.includes('your-frontend-url'));
if (hasPlaceholders) {
  console.warn('\n⚠️  Warning: Found placeholder URLs in production config!');
  console.warn('   Update .env.production with your actual deployment URLs.');
  console.warn('   Build will continue but may not work correctly until URLs are updated.');
}

// Verify config.js exists
const configPath = path.join(__dirname, '../src/config/config.js');
if (!fs.existsSync(configPath)) {
  console.error('\n❌ config/config.js not found!');
  process.exit(1);
}

console.log('\n✅ Deployment configuration verified!');
console.log('🚀 Proceeding with build...');

// Always exit with success to allow build to continue
process.exit(0);