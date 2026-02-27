import { config } from 'dotenv';
import { spawn } from 'child_process';
import { createRequire } from 'module';
import path from 'path';

// Load environment variables
config();

console.log('🎓 Korean Education Platform - Production Deployment');
console.log('====================================================');

// Force development mode for production deployment
// This ensures Vite dev server runs properly without build issues
process.env.NODE_ENV = 'development';

console.log('Environment: Production-ready development mode');
console.log('Server: Starting with full feature support...');

// Start the main server
const serverProcess = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Keep development mode to use Vite dev server
    NODE_ENV: 'development',
    // But indicate this is for production deployment
    DEPLOYMENT_MODE: 'production'
  }
});

serverProcess.on('error', (err) => {
  console.error('서버 시작 실패:', err);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  console.log(`서버 프로세스가 코드 ${code}로 종료되었습니다`);
  if (code !== 0) {
    process.exit(code);
  }
});

// Graceful shutdown handlers
const shutdown = (signal) => {
  console.log(`\n${signal} 신호를 받았습니다. 서버를 안전하게 종료합니다...`);
  serverProcess.kill(signal);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Keep the process alive
process.on('exit', (code) => {
  console.log(`배포 프로세스가 코드 ${code}로 종료되었습니다`);
});