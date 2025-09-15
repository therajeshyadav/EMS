// scripts/setup.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up EMS Performance Optimizations...\n');

// 1. Install new dependencies
console.log('📦 Installing new dependencies...');
try {
  execSync('npm install compression redis', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// 2. Create indexes
console.log('🔍 Creating MongoDB indexes...');
try {
  execSync('node scripts/createIndexes.js', { stdio: 'inherit' });
  console.log('✅ Indexes created successfully\n');
} catch (error) {
  console.error('❌ Failed to create indexes:', error.message);
  console.log('⚠️ You can run "node scripts/createIndexes.js" manually later\n');
}

// 3. Check .env file
console.log('⚙️ Checking environment configuration...');
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from example...');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created. Please update with your configuration\n');
} else {
  console.log('✅ .env file exists\n');
}

console.log('🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update your .env file with Redis configuration (optional)');
console.log('2. Restart your server: npm run dev');
console.log('3. Test the optimized endpoints');
console.log('\n💡 Performance improvements include:');
console.log('- MongoDB query optimization with indexes');
console.log('- Response compression');
console.log('- Redis caching (if configured)');
console.log('- Cursor-based pagination');
console.log('- Optimized aggregation queries');
console.log('- Frontend virtualization components');