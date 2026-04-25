'use strict';

const { spawnSync } = require('child_process');

const rawArgs = process.argv.slice(2);
const cucumberArgs = [];
const envOverrides = {};
const knownTagTokens = new Set(['smoke', 'regression', 'sanity']);
const knownEnvKeys = new Set([
  'ENV',
  'BROWSER',
  'HEADLESS',
  'BASE_URL',
  'USERNAME',
  'PASSWORD',
  'DEFAULT_TIMEOUT',
  'NAVIGATION_TIMEOUT',
  'SCREENSHOT_MODE',
  'REPORT_DIR',
  'REPORT_TITLE',
  'PROJECT_NAME',
  'PARALLEL_WORKERS',
  'RETRY_COUNT',
]);

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];

  // Support: npm test @regression
  if (arg.startsWith('@')) {
    const normalizedTag = `@${arg.slice(1).trim().toLowerCase()}`;
    cucumberArgs.push('--tags', normalizedTag);
    continue;
  }

  // PowerShell-safe shorthand: npm test -- regression
  if (knownTagTokens.has(arg.toLowerCase())) {
    cucumberArgs.push('--tags', `@${arg.toLowerCase()}`);
    continue;
  }

  // Support: npm test --HEADLESS=false (or any --ENV_VAR=value)
  if (arg.startsWith('--') && arg.includes('=')) {
    const [keyPart, ...valueParts] = arg.slice(2).split('=');
    const key = keyPart.trim();
    const normalizedKey = key.toUpperCase();
    const value = valueParts.join('=').trim();
    if (normalizedKey && knownEnvKeys.has(normalizedKey)) {
      envOverrides[normalizedKey] = value;
      continue;
    }
  }

  // Support: npm test HEADLESS=false (or any ENV_VAR=value)
  if (arg.includes('=')) {
    const [key, ...valueParts] = arg.split('=');
    const normalizedKey = key.trim().toUpperCase();
    if (knownEnvKeys.has(normalizedKey)) {
      envOverrides[normalizedKey] = valueParts.join('=').trim();
      continue;
    }
  }

  cucumberArgs.push(arg);
}

const finalArgs = ['cucumber-js', ...cucumberArgs];

console.log('Running:', ['npx', ...finalArgs].join(' '));
if (Object.keys(envOverrides).length > 0) {
  console.log('Env overrides:', envOverrides);
}

const result = spawnSync('npx', finalArgs, {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, ...envOverrides },
});

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);
