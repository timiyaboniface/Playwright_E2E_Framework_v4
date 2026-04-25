/**
 * ConfigManager — Singleton class (OOP: Singleton Pattern)
 *
 * Responsibility: Single source of truth for all runtime configuration.
 * Priority (highest → lowest):
 *   1. Excel test data row (per-scenario overrides)
 *   2. CLI environment variables
 *   3. .env file defaults
 *
 * TestNG equivalent: Configuration XML / testng.xml suite parameters
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import {
  FrameworkConfig,
  BrowserType,
  EnvironmentType,
  ScreenshotMode,
  TestDataRow,
} from '../types/framework.types';

// Load .env once at module level
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export class ConfigManager {
  private static instance: ConfigManager;
  private config: FrameworkConfig;

  private parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
    if (value === undefined || value === null) return defaultValue;
    const normalized = String(value).trim().toLowerCase();
    if (['false', '0', 'no', 'n', 'off'].includes(normalized)) return false;
    if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
    return defaultValue;
  }

  // Private constructor — enforces Singleton
  private constructor() {
    this.config = this.loadFromEnv();
  }

  /** Returns the single instance */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /** Build config from process.env / .env values */
  private loadFromEnv(): FrameworkConfig {
    return {
      env:               (process.env.ENV as EnvironmentType)         ?? 'dev',
      browser:           (process.env.BROWSER as BrowserType)         ?? 'chromium',
      headless:          this.parseBoolean(process.env.HEADLESS, true),
      baseUrl:           process.env.BASE_URL                         ?? 'https://www.saucedemo.com',
      username:          process.env.USERNAME                         ?? 'standard_user',
      password:          process.env.PASSWORD                         ?? 'secret_sauce',
      defaultTimeout:    parseInt(process.env.DEFAULT_TIMEOUT         ?? '30000', 10),
      navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT      ?? '30000', 10),
      screenshotMode:    (process.env.SCREENSHOT_MODE as ScreenshotMode) ?? 'always',
      reportDir:         process.env.REPORT_DIR                       ?? 'reports/html',
      reportTitle:       process.env.REPORT_TITLE                     ?? 'Playwright E2E BDD Report',
      projectName:       process.env.PROJECT_NAME                     ?? 'SauceDemo E2E Suite',
      parallelWorkers:   parseInt(process.env.PARALLEL_WORKERS        ?? '1', 10),
      retryCount:        parseInt(process.env.RETRY_COUNT             ?? '1', 10),
    };
  }

  /**
   * Apply per-scenario overrides from an Excel test data row.
   * Only non-blank Excel values override the config.
   * Called by the World object before each scenario.
   *
   * TestNG equivalent: @DataProvider feeding test parameters
   */
  public applyTestDataOverrides(row: TestDataRow): void {
    if (row.browser)           this.config.browser           = row.browser;
    if (row.environment)       this.config.env               = row.environment;
    if (row.headless)          this.config.headless          = this.parseBoolean(row.headless, this.config.headless);
    if (row.baseUrl)           this.config.baseUrl           = row.baseUrl;
    if (row.username)          this.config.username          = row.username;
    if (row.password)          this.config.password          = row.password;
    if (row.parallelWorkers)   this.config.parallelWorkers   = parseInt(row.parallelWorkers, 10);
    if (row.retryCount)        this.config.retryCount        = parseInt(row.retryCount, 10);
  }

  /**
   * Reset config back to env defaults.
   * Called after each scenario to prevent state bleed between tests.
   *
   * TestNG equivalent: @AfterMethod cleanup
   */
  public reset(): void {
    this.config = this.loadFromEnv();
  }

  // ── Getters ──────────────────────────────────────────────────────────────
  public getConfig(): FrameworkConfig    { return { ...this.config }; }
  public getBrowser(): BrowserType       { return this.config.browser; }
  public isHeadless(): boolean           { return this.config.headless; }
  public getBaseUrl(): string            { return this.config.baseUrl; }
  public getUsername(): string           { return this.config.username; }
  public getPassword(): string           { return this.config.password; }
  public getDefaultTimeout(): number     { return this.config.defaultTimeout; }
  public getNavigationTimeout(): number  { return this.config.navigationTimeout; }
  public getScreenshotMode(): ScreenshotMode { return this.config.screenshotMode; }
  public getReportDir(): string          { return this.config.reportDir; }
  public getReportTitle(): string        { return this.config.reportTitle; }
  public getProjectName(): string        { return this.config.projectName; }
  public getParallelWorkers(): number    { return this.config.parallelWorkers; }
  public getRetryCount(): number         { return this.config.retryCount; }
  public getEnv(): EnvironmentType       { return this.config.env; }
}
