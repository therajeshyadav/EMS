#!/usr/bin/env node
// scripts/build-production.js - Production build with environment verification

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Building EMS for Production...\n');

// Verify environment files
const envProdPath = path.join(__dirname, '../.env.production');
if (!fs.existsSync(envProdPath)) {
  console.error('❌ .env.production not found!');
  process.exit(1);
}

// Read and verify production environment
const envContent = fs.readFileSync(envProdPath, 'utf8');
console.log('📋 Production Environment:');
console.log(envContent);

// Check for localhost references
if (envContent.includes('localhost')) {
  console.error('❌ Found localhost in production environment!');
  console.error('   Update .env.production with your deployed backend URL');
  process.exit(1);
}

// Set NODE_ENV and build
process.env.NODE_ENV = 'production';

try {
  console.log('\n🔨 Running production build...');
  
  // Check if environment variables are set
  const requiredEnvVars = ['VITE_API_BASE_URL', 'VITE_SOCKET_URL'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️  Missing environment variables:', missingVars);
    console.log('📝 Using values from .env.production file');
  }
  
  execSync('npm run build', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_ENV: 'production'
      // Environment variables will be loaded from .env.production automatically
    }
  });
  
  console.log('\n✅ Production build completed!');
  console.log('\n📁 Deploy the dist/ folder to your hosting platform');
  console.log('🔗 Vercel: drag dist/ folder to vercel.com');
  console.log('🔗 Netlify: drag dist/ folder to netlify.com');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}