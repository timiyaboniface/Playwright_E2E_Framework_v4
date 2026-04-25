/**
 * hooks.ts — Cucumber Lifecycle Hooks
 *
 * TestNG equivalents:
 *   Before      → @BeforeMethod  (browser setup per scenario)
 *   After       → @AfterMethod   (screenshot on failure, browser teardown)
 *   BeforeAll   → @BeforeSuite   (one-time setup)
 *   AfterAll    → @AfterSuite    (report generation, log close)
 *
 * All hooks receive the CustomWorld instance via `this`.
 */

import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  Status,
  ITestCaseHookParameter,
} from '@cucumber/cucumber';
import * as fs from 'fs';
import * as path from 'path';
import { CustomWorld }  from './world';
import { Logger }       from '../../src/utils/logger';

const suiteLogger = new Logger('Hooks');

// ── BeforeAll — runs once before the entire test suite ──────────────────────
BeforeAll(async function () {
  suiteLogger.info('═══════════════════════════════════════════════════');
  suiteLogger.info('  PLAYWRIGHT BDD E2E FRAMEWORK — TEST SUITE START  ');
  suiteLogger.info('═══════════════════════════════════════════════════');

  // Ensure report output directories exist
  ['reports/html', 'reports/screenshots'].forEach((dir) => {
    fs.mkdirSync(path.resolve(process.cwd(), dir), { recursive: true });
  });
});

// ── Before — runs before each scenario ──────────────────────────────────────
Before(async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  this.scenarioName = scenario.pickle.name;
  this.logger.info(`──────────────────────────────────────────`);
  this.logger.info(`SCENARIO START: "${this.scenarioName}"`);
  this.logger.info(`Tags: ${scenario.pickle.tags.map((t) => t.name).join(', ') || 'none'}`);

  // Launch browser (type driven by ConfigManager — default or Excel override)
  await this.initBrowser();
});

// ── After — runs after each scenario ────────────────────────────────────────
After(async function (this: CustomWorld, scenario: ITestCaseHookParameter) {
  const status = scenario.result?.status;
  const passed = status === Status.PASSED;

  this.logger.info(`SCENARIO END: "${this.scenarioName}" → ${passed ? '✅ PASSED' : '❌ FAILED'}`);

  // ── Screenshot on failure (always capture regardless of SCREENSHOT_MODE) ──
  if (!passed && this.page) {
    try {
      const failPath = await this.screenshots.captureFailure(this.page);
      this.scenarioCtx.screenshotPaths.push(failPath);

      // Attach failure screenshot to Cucumber report
      const img = fs.readFileSync(failPath);
      await this.attach(img, 'image/png');
      this.logger.error(`Failure screenshot attached: ${path.basename(failPath)}`);
    } catch (e) {
      this.logger.error(`Could not take failure screenshot: ${e}`);
    }
  }

  // ── Attach all step screenshots to Cucumber report ────────────────────────
  const allScreenshots = this.screenshots.getAllPaths();
  for (const screenshotPath of allScreenshots) {
    if (!screenshotPath.includes('FAILURE')) {
      try {
        const img = fs.readFileSync(screenshotPath);
        await this.attach(img, 'image/png');
      } catch {
        // Non-critical — continue
      }
    }
  }

  // ── Error summary ─────────────────────────────────────────────────────────
  if (this.scenarioCtx.errors.length > 0) {
    this.logger.error('Scenario errors recorded:');
    this.scenarioCtx.errors.forEach((e, i) => this.logger.error(`  [${i + 1}] ${e}`));
  }

  // ── Teardown browser ──────────────────────────────────────────────────────
  await this.teardown();
  this.logger.info(`──────────────────────────────────────────`);
});

// ── AfterAll — runs once after the entire suite ──────────────────────────────
AfterAll(async function () {
  suiteLogger.info('═══════════════════════════════════════════════════');
  suiteLogger.info('  TEST SUITE COMPLETE                               ');
  suiteLogger.info('  Run: npm run report  →  open reports/html/        ');
  suiteLogger.info('═══════════════════════════════════════════════════');
  Logger.closeStream();
});
