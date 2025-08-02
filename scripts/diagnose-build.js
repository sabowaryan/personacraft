#!/usr/bin/env node

/**
 * Build diagnostics script for PersonaCraft
 * Helps identify common build issues and provides solutions
 */

const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');

console.log('🔍 PersonaCraft Build Diagnostics\n');

// System info
console.log('📊 System Information:');
console.log(`Platform: ${os.platform()}`);
console.log(`Architecture: ${os.arch()}`);
console.log(`Node.js: ${process.version}`);
console.log(`Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB total\n`);

// Check npm configuration
console.log('📦 NPM Configuration:');
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`NPM Version: ${npmVersion}`);
  
  const registry = execSync('npm config get registry', { encoding: 'utf8' }).trim();
  console.log(`Registry: ${registry}`);
  
  const timeout = execSync('npm config get timeout', { encoding: 'utf8' }).trim();
  console.log(`Timeout: ${timeout}ms\n`);
} catch (error) {
  console.log('❌ NPM configuration check failed\n');
}

// Check dependencies
console.log('🔗 Dependency Status:');
const criticalDeps = [
  '@google/generative-ai',
  '@stackframe/stack',
  'next',
  'prisma',
  '@prisma/client'
];

criticalDeps.forEach(dep => {
  try {
    const packagePath = `node_modules/${dep}/package.json`;
    if (fs.existsSync(packagePath)) {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      console.log(`✅ ${dep}: ${pkg.version}`);
    } else {
      console.log(`❌ ${dep}: Not installed`);
    }
  } catch (error) {
    console.log(`❌ ${dep}: Error checking version`);
  }
});

// Check environment
console.log('\n🌍 Environment Variables:');
const requiredEnvs = [
  'GEMINI_API_KEY',
  'QLOO_API_KEY',
  'DATABASE_URL'
];

requiredEnvs.forEach(env => {
  const value = process.env[env];
  if (value) {
    console.log(`✅ ${env}: Set (${value.substring(0, 10)}...)`);
  } else {
    console.log(`❌ ${env}: Not set`);
  }
});

// Check file system
console.log('\n📁 File System:');
const criticalFiles = [
  'next.config.js',
  'prisma/schema.prisma',
  '.env',
  'package.json'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}: Exists`);
  } else {
    console.log(`❌ ${file}: Missing`);
  }
});

// Recommendations
console.log('\n💡 Recommendations:');
console.log('1. If build fails with ETIMEDOUT:');
console.log('   - Run: npm run reset');
console.log('   - Check internet connection');
console.log('   - Try: npm run build:fast');

console.log('\n2. If memory issues occur:');
console.log('   - Close other applications');
console.log('   - Use: npm run build:optimized');

console.log('\n3. If Prisma issues:');
console.log('   - Run: npx prisma generate');
console.log('   - Check DATABASE_URL in .env');

console.log('\n4. For persistent issues:');
console.log('   - Delete .next folder');
console.log('   - Run: npm run clean && npm install');