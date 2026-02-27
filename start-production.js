#!/usr/bin/env node

// Production starter that bypasses all Vite host restrictions
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const productionServerPath = join(__dirname, 'dist/production-server.js');

console.log('🎓 Starting Korean Education Platform (Production Mode)');

// Check if production server exists
if (!existsSync(productionServerPath)) {
  console.error('Production server not found. Building now...');
  
  // Build the production server
  const buildProcess = spawn('node', ['build-production.js'], {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  buildProcess.on('close', (code) => {
    if (code === 0) {
      startProductionServer();
    } else {
      console.error('Build failed with exit code:', code);
      process.exit(1);
    }
  });
} else {
  startProductionServer();
}

function startProductionServer() {
  console.log('Starting production server...');
  
  const serverProcess = spawn('node', [productionServerPath], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production'
    },
    cwd: __dirname
  });
  
  serverProcess.on('error', (err) => {
    console.error('Failed to start production server:', err);
    process.exit(1);
  });
  
  serverProcess.on('close', (code) => {
    console.log(`Production server exited with code ${code}`);
    if (code !== 0) {
      process.exit(code);
    }
  });
  
  // Handle graceful shutdown
  const shutdown = (signal) => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    serverProcess.kill(signal);
  };
  
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}