#!/usr/bin/env node

/**
 * Script d'optimisation des builds Next.js 15 avec Stack Auth
 * Surveille la mémoire et optimise les performances
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Demarrage de l\'optimiseur de build Next.js 15...\n');

// Configuration des optimisations
const optimizations = {
  nodeOptions: '--max-old-space-size=4096 --optimize-for-size',
  env: {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=4096 --optimize-for-size',
    NEXT_TELEMETRY_DISABLED: '1',
    SKIP_ENV_VALIDATION: 'true',
  }
};

// Fonction pour surveiller la mémoire
function monitorMemory() {
  const used = process.memoryUsage();
  const formatMB = (bytes) => Math.round(bytes / 1024 / 1024 * 100) / 100;
  
  console.log(`Memoire utilisee: ${formatMB(used.heapUsed)} MB / ${formatMB(used.heapTotal)} MB`);
  console.log(`RSS: ${formatMB(used.rss)} MB, External: ${formatMB(used.external)} MB\n`);
}

// Fonction principale de build
async function optimizedBuild() {
  console.log('Configuration des optimisations memoire...');
  monitorMemory();
  
  // Etape 1: Generation Prisma
  console.log('Generation du client Prisma...');
  const prismaProcess = spawn('npx', ['prisma', 'generate'], {
    stdio: 'inherit',
    env: optimizations.env
  });
  
  await new Promise((resolve, reject) => {
    prismaProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Client Prisma genere avec succes\n');
        resolve();
      } else {
        reject(new Error(`Erreur Prisma: code ${code}`));
      }
    });
  });
  
  // Etape 2: Build Next.js optimise
  console.log('Demarrage du build Next.js optimise...');
  monitorMemory();
  
  const buildProcess = spawn('npx', ['next', 'build'], {
    stdio: 'inherit',
    env: optimizations.env
  });
  
  // Surveillance de la mémoire pendant le build
  const memoryInterval = setInterval(monitorMemory, 30000); // Toutes les 30 secondes
  
  await new Promise((resolve, reject) => {
    buildProcess.on('close', (code) => {
      clearInterval(memoryInterval);
      if (code === 0) {
        console.log('\nBuild termine avec succes !');
        monitorMemory();
        resolve();
      } else {
        reject(new Error(`Erreur de build: code ${code}`));
      }
    });
  });
}

// Exécution
optimizedBuild().catch((error) => {
  console.error('Erreur lors du build optimise:', error.message);
  process.exit(1);
});