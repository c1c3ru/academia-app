#!/usr/bin/env node

/**
 * Test Runner Script for Academia App
 * Provides convenient commands to run different types of tests
 */

const { spawn } = require('child_process');
const path = require('path');

const commands = {
  unit: 'npm run test:unit',
  integration: 'npm run test:integration',
  e2e: 'npm run test:e2e',
  coverage: 'npm run test:coverage',
  watch: 'npm run test:watch',
  ci: 'npm run test:ci',
  all: 'npm run test:unit && npm run test:integration && npm run test:e2e'
};

function runCommand(command) {
  console.log(`🚀 Running: ${command}`);
  
  const [cmd, ...args] = command.split(' ');
  const child = spawn(cmd, args, {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  child.on('close', (code) => {
    if (code === 0) {
      console.log(`✅ Command completed successfully`);
    } else {
      console.log(`❌ Command failed with code ${code}`);
      process.exit(code);
    }
  });

  child.on('error', (error) => {
    console.error(`❌ Error running command: ${error.message}`);
    process.exit(1);
  });
}

function showHelp() {
  console.log(`
📋 Academia App Test Runner

Usage: node scripts/test-runner.js [command]

Available commands:
  unit        - Run unit tests only
  integration - Run integration tests only
  e2e         - Run end-to-end tests
  coverage    - Run tests with coverage report
  watch       - Run tests in watch mode
  ci          - Run tests for CI environment
  all         - Run all test suites
  help        - Show this help message

Examples:
  node scripts/test-runner.js unit
  node scripts/test-runner.js coverage
  node scripts/test-runner.js e2e
  `);
}

const testType = process.argv[2];

if (!testType || testType === 'help') {
  showHelp();
  process.exit(0);
}

if (!commands[testType]) {
  console.error(`❌ Unknown test type: ${testType}`);
  showHelp();
  process.exit(1);
}

runCommand(commands[testType]);
