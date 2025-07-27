#!/usr/bin/env node

/**
 * Script de build cross-platform pour Next.js 15 + Stack Auth
 * Compatible Windows, macOS, Linux
 */

const { spawn } = require('child_process');
const os = require('os');

// Configuration selon la plateforme
const isWindows = os.platform() === 'win32';
const shell = isWindows ? 'cmd' : 'bash';
const shellFlag = isWindows ? '/c' : '-c';

// Variables d'environnement optimisées
const env = {
  ...process.env,
  NODE_OPTIONS: '--max-old-space-size=4096',
  NEXT_TELEMETRY_DISABLED: '1',
  SKIP_ENV_VALIDATION: 'true',
};

console.log('Demarrage du build optimise Next.js 15...');
console.log(`Plateforme detectee: ${os.platform()}`);
console.log(`Memoire allouee: 4GB\n`);

// Commandes selon la plateforme
const commands = {
  prisma: 'npx prisma generate',
  build: 'npx next build'
};

async function runCommand(command, description) {
  console.log(`${description}...`);
  
  return new Promise((resolve, reject) => {
    const process = spawn(shell, [shellFlag, command], {
      stdio: 'inherit',
      env: env
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`${description} termine avec succes\n`);
        resolve();
      } else {
        reject(new Error(`${description} echoue avec le code ${code}`));
      }
    });
  });
}

async function optimizedBuild() {
  try {
    // Étape 1: Prisma
    await runCommand(commands.prisma, 'Generation du client Prisma');
    
    // Étape 2: Next.js build
    await runCommand(commands.build, 'Build Next.js');
    
    console.log('Build optimise termine avec succes !');
    
  } catch (error) {
    console.error('Erreur lors du build:', error.message);
    process.exit(1);
  }
}

optimizedBuild();