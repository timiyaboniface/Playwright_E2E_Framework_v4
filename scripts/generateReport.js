/**
 * generateReport.js
 * Generates a rich HTML report using multiple-cucumber-html-reporter.
 * Run after test execution: npm run report
 *
 * TestNG equivalent: TestNG HTML Reporter / ExtentReports
 */

'use strict';

const reporter = require('multiple-cucumber-html-reporter');
const path     = require('path');
const fs       = require('fs');
require('dotenv').config();

// ── Resolve paths ──────────────────────────────────────────────────────────
const jsonDir    = path.resolve(process.cwd(), 'reports');
const outputDir  = path.resolve(process.cwd(), 'reports', 'html');
const jsonReport = path.resolve(jsonDir, 'cucumber-report.json');

// Guard: ensure the JSON report exists before trying to parse it
if (!fs.existsSync(jsonReport)) {
  console.error('❌  cucumber-report.json not found. Run tests first: npm test');
  process.exit(1);
}

// ── Read runtime config from .env ──────────────────────────────────────────
const browser     = process.env.BROWSER     || 'chromium';
const environment = process.env.ENV         || 'dev';
const projectName = process.env.PROJECT_NAME || 'SauceDemo E2E Suite';
const reportTitle = process.env.REPORT_TITLE || 'Playwright BDD E2E Report';

// ── Generate report ────────────────────────────────────────────────────────
reporter.generate({
  jsonDir,
  reportPath: outputDir,

  // ── Report metadata ──────────────────────────────────────────────────────
  metadata: {
    browser: {
      name: browser,
      version: 'latest',
    },
    device: 'CI / Local',
    platform: {
      name: process.platform,
      version: process.version,
    },
  },

  customData: {
    title: 'Run Info',
    data: [
      { label: 'Project',     value: projectName },
      { label: 'Environment', value: environment.toUpperCase() },
      { label: 'Browser',     value: browser.charAt(0).toUpperCase() + browser.slice(1) },
      { label: 'Executed',    value: new Date().toLocaleString() },
      { label: 'Node',        value: process.version },
      { label: 'Framework',   value: 'Playwright + Cucumber + TypeScript' },
    ],
  },

  // ── Display options ──────────────────────────────────────────────────────
  pageTitle:         reportTitle,
  reportName:        reportTitle,
  displayDuration:   true,
  durationInMS:      true,
  displayReportTime: true,
  useCDN:            true,              // uses CDN for CSS/JS (no local assets needed)
  openReportInBrowser: false,           // set true to auto-open after generation

  // ── Screenshot embedding ─────────────────────────────────────────────────
  // Screenshots are attached via hooks.ts using this.attach(img, 'image/png')
  // multiple-cucumber-html-reporter embeds them automatically from the JSON
});

console.log('');
console.log('✅  Report generated successfully!');
console.log(`📂  Open: ${path.join(outputDir, 'index.html')}`);
console.log('');
