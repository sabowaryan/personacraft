#!/usr/bin/env node

/**
 * Script de build cross-platform pour Next.js 15 + Stack Auth
 * Compatible Windows, macOS, Linux avec gestion des timeouts
 */

const { spawn } = require('child_process');
const os = require('os');

// Configuration selon la plateforme
const isWindows = os.platform() === 'win32';
const shell = isWindows ? 'cmd' : 'bash';
const shellFlag = isWindows ? '/c' : '-c';

// Variables d'environnement optimisées avec timeouts réseau
const env = {
  ...process.env,
  NODE_OPTIONS: '--max-old-space-size=6144 --max-semi-space-size=1024',
  NEXT_TELEMETRY_DISABLED: '1',
  SKIP_ENV_VALIDATION: 'true',
  // Network timeout configurations
  npm_config_timeout: '300000', // 5 minutes
  npm_config_registry_timeout: '300000',
  npm_config_fetch_timeout: '300000',
  npm_config_fetch_retry_mintimeout: '10000',
  npm_config_fetch_retry_maxtimeout: '60000',
  npm_config_fetch_retries: '5',
};

console.log('🚀 Starting optimized Next.js 15 build...');
console.log(`📱 Platform: ${os.platform()}`);
console.log(`💾 Memory allocated: 6GB`);
console.log(`🌐 Network timeouts: 5 minutes\n`);

// Commandes selon la plateforme avec retry logic
const commands = {
  prisma: 'npx prisma generate',
  build: 'npx next build'
};

async function runCommandWithRetry(command, description, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`${description}... (Attempt ${attempt}/${maxRetries})`);
    
    try {
      await runCommand(command, description);
      return; // Success, exit retry loop
    } catch (error) {
      console.log(`❌ ${description} failed on attempt ${attempt}`);
      
      if (attempt === maxRetries) {
        throw error; // Final attempt failed
      }
      
      // Wait before retry (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Waiting ${waitTime/1000}s before retry...\n`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

async function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(shell, [shellFlag, command], {
      stdio: 'inherit',
      env: env,
      timeout: 600000, // 10 minutes timeout per command
    });
    
    // Handle timeout
    const timeoutId = setTimeout(() => {
      childProcess.kill('SIGTERM');
      reject(new Error(`${description} timed out after 10 minutes`));
    }, 600000);
    
    childProcess.on('close', (code) => {
      clearTimeout(timeoutId);
      if (code === 0) {
        console.log(`✅ ${description} completed successfully\n`);
        resolve();
      } else {
        reject(new Error(`${description} failed with code ${code}`));
      }
    });
    
    childProcess.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(new Error(`${description} process error: ${error.message}`));
    });
  });
}

async function optimizedBuild() {
  try {
    // Étape 1: Prisma avec retry
    await runCommandWithRetry(commands.prisma, '🔧 Generating Prisma client');
    
    // Étape 2: Next.js build avec retry
    await runCommandWithRetry(commands.build, '🏗️ Building Next.js application');
    
    console.log('🎉 Optimized build completed successfully!');
    
  } catch (error) {
    console.error('💥 Build failed:', error.message);
    console.error('\n🔍 Troubleshooting tips:');
    console.error('1. Check your internet connection');
    console.error('2. Clear npm cache: npm cache clean --force');
    console.error('3. Delete node_modules and reinstall');
    console.error('4. Try building with: npm run build:fast');
    process.exit(1);
  }
}

optimizedBuild();