/**
 * runParallel.js
 * Parallel test runner — reads PARALLEL_WORKERS from .env and spawns
 * multiple Cucumber processes (one per feature file or tag group).
 *
 * TestNG equivalent: <suite parallel="methods" thread-count="4">
 *
 * Usage:
 *   npm run test:parallel
 *   PARALLEL_WORKERS=3 npm run test:parallel
 */

'use strict';

const { execSync, spawn } = require('child_process');
const path  = require('path');
const fs    = require('fs');
const glob  = require('fs');
require('dotenv').config();

const workers = parseInt(process.env.PARALLEL_WORKERS || '1', 10);

if (workers <= 1) {
  console.log('ℹ️  PARALLEL_WORKERS=1 — running sequentially via: npm test');
  try {
    execSync('npx cucumber-js', { stdio: 'inherit' });
  } catch {
    process.exit(1);
  }
  process.exit(0);
}

console.log(`🚀  Parallel execution: ${workers} workers`);

// Find all feature files
const featureDir = path.resolve(process.cwd(), 'features');
const featureFiles = fs
  .readdirSync(featureDir)
  .filter((f) => f.endsWith('.feature'))
  .map((f) => path.join('features', f));

if (featureFiles.length === 0) {
  console.error('❌  No feature files found in /features/');
  process.exit(1);
}

console.log(`📋  Feature files found: ${featureFiles.length}`);
featureFiles.forEach((f) => console.log(`    • ${f}`));
console.log('');

// Split feature files across workers
const chunks = [];
for (let i = 0; i < workers; i++) {
  chunks.push([]);
}
featureFiles.forEach((f, idx) => chunks[idx % workers].push(f));

// Spawn a Cucumber process per chunk
const processes = chunks
  .filter((chunk) => chunk.length > 0)
  .map((chunk, idx) => {
    const reportPath = `reports/cucumber-report-${idx + 1}.json`;
    const args = [
      'cucumber-js',
      ...chunk,
      '--require', 'features/support/world.ts',
      '--require', 'features/support/hooks.ts',
      '--require', 'features/step-definitions/**/*.ts',
      '--require-module', 'ts-node/register',
      '--format', `json:${reportPath}`,
      '--format', 'progress-bar',
      '--publish-quiet',
    ];

    console.log(`⚙️   Worker ${idx + 1} → ${chunk.join(', ')}`);

    return new Promise((resolve, reject) => {
      const proc = spawn('npx', args, {
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, WORKER_ID: String(idx + 1) },
      });
      proc.on('close', (code) => {
        if (code === 0) resolve(code);
        else reject(new Error(`Worker ${idx + 1} exited with code ${code}`));
      });
    });
  });

// Wait for all workers
Promise.allSettled(processes).then((results) => {
  const failed = results.filter((r) => r.status === 'rejected');

  // Merge JSON reports
  mergeReports(workers);

  if (failed.length > 0) {
    console.error(`\n❌  ${failed.length} worker(s) failed`);
    failed.forEach((r) => console.error('  ', r.reason?.message));
    process.exit(1);
  } else {
    console.log('\n✅  All parallel workers completed successfully');
    process.exit(0);
  }
});

function mergeReports(count) {
  const merged = [];
  for (let i = 1; i <= count; i++) {
    const reportPath = path.resolve(process.cwd(), `reports/cucumber-report-${i}.json`);
    if (fs.existsSync(reportPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        merged.push(...data);
      } catch {
        // skip malformed
      }
    }
  }
  const mergedPath = path.resolve(process.cwd(), 'reports/cucumber-report.json');
  fs.writeFileSync(mergedPath, JSON.stringify(merged, null, 2));
  console.log(`📦  Merged ${count} report(s) → reports/cucumber-report.json`);
}
