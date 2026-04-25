/**
 * CustomWorld — Cucumber World class (OOP: Encapsulation)
 *
 * The World object is created fresh for EVERY scenario.
 * It holds all shared state that flows between step definitions:
 *  - Browser / Page / BrowserContext
 *  - PageFactory (access to all page objects)
 *  - ScreenshotHelper (per-scenario)
 *  - ScenarioContext (test data, results, errors)
 *  - ConfigManager access
 *
 * TestNG equivalent: @BeforeMethod / @AfterMethod + ThreadLocal for parallel
 */

import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium, firefox, webkit } from '@playwright/test';
import { ConfigManager }    from '../../src/config/config.manager';
import { ScreenshotHelper } from '../../src/utils/screenshot.helper';
import { ExcelReader }      from '../../src/utils/excel.reader';
import { Logger }           from '../../src/utils/logger';
import { PageFactory }      from '../../src/pages/page.factory';
import { ScenarioContext, TestDataRow } from '../../src/types/framework.types';

export class CustomWorld extends World {
  // ── Infrastructure ────────────────────────────────────────────────────────
  public browser!: Browser;
  public context!: BrowserContext;
  public page!: Page;
  public pages!: PageFactory;
  public screenshots!: ScreenshotHelper;

  // ── Shared scenario state ─────────────────────────────────────────────────
  public scenarioCtx: ScenarioContext = {
    testData:      null,
    addedProduct:  null,
    orderSummary:  null,
    screenshotPaths: [],
    errors: [],
  };

  // ── Utilities ─────────────────────────────────────────────────────────────
  public readonly config  = ConfigManager.getInstance();
  public readonly excel   = new ExcelReader('test-data.xlsx');
  public readonly logger  = new Logger('CustomWorld');

  // Scenario name — set by hooks.ts after scenario starts
  public scenarioName: string = 'Unknown Scenario';

  constructor(options: IWorldOptions) {
    super(options);
  }

  // ── Browser Lifecycle ─────────────────────────────────────────────────────

  /**
   * Launch browser, create context and page.
   * Called from Before hook in hooks.ts.
   * Browser type comes from ConfigManager (which may have been overridden by Excel row).
   */
  public async initBrowser(): Promise<void> {
    const browserType = this.config.getBrowser();
    const headless    = this.config.isHeadless();

    this.logger.info(`Launching ${browserType} (headless=${headless})`);

    switch (browserType) {
      case 'firefox': this.browser = await firefox.launch({ headless }); break;
      case 'webkit':  this.browser = await webkit.launch({ headless });  break;
      default:        this.browser = await chromium.launch({ headless }); break;
    }

    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      ignoreHTTPSErrors: true,
    });

    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(this.config.getDefaultTimeout());

    // Initialise screenshot helper AFTER scenario name is known
    this.screenshots = new ScreenshotHelper(this.scenarioName);

    // Initialise page factory — single point of page object creation
    this.pages = new PageFactory(this.page, this.screenshots);

    this.logger.info('Browser, context and page initialised');
  }

  /**
   * Load Excel test data for the given testId and apply to config.
   * Call this from a step or hook when you want Excel-driven config.
   */
  public async loadTestData(sheetName: string, testId: string): Promise<TestDataRow | null> {
    try {
      const row = await this.excel.getRowById(sheetName, testId);
      if (row) {
        this.scenarioCtx.testData = row;
        this.config.applyTestDataOverrides(row);
        this.logger.info(`Test data loaded: testId="${testId}" from sheet="${sheetName}"`);
      } else {
        this.logger.warn(`No active test data row found for testId="${testId}"`);
      }
      return row;
    } catch (err) {
      this.logger.warn(`Excel read failed (using .env defaults): ${err}`);
      return null;
    }
  }

  /**
   * Resolve a step parameter token from loaded Excel test data.
   * Supported token formats:
   *   - "$columnName"
   *   - "${columnName}"
   * Returns the original input when no token format is detected.
   */
  public resolveParam(input: string): string {
    const data = this.scenarioCtx.testData as Record<string, string> | null;
    if (!data) return input;

    const trimmed = input.trim();
    const braceMatch = trimmed.match(/^\$\{(.+)\}$/);
    const dollarMatch = trimmed.match(/^\$(.+)$/);
    const key = (braceMatch?.[1] ?? dollarMatch?.[1] ?? '').trim();

    if (!key) return input;

    const value = data[key];
    if (value === undefined || value === null || String(value).trim() === '') {
      throw new Error(`Spreadsheet parameter "${key}" is missing or empty in loaded test data`);
    }

    return String(value).trim();
  }

  /**
   * Resolve a parameter token from spreadsheet data but allow empty values.
   * Returns original input if no token syntax is used.
   */
  public resolveOptionalParam(input: string): string {
    const data = this.scenarioCtx.testData as Record<string, string> | null;
    if (!data) return input;

    const trimmed = input.trim();
    const braceMatch = trimmed.match(/^\$\{(.+)\}$/);
    const dollarMatch = trimmed.match(/^\$(.+)$/);
    const key = (braceMatch?.[1] ?? dollarMatch?.[1] ?? '').trim();

    if (!key) return input;
    const value = data[key];
    return value === undefined || value === null ? '' : String(value).trim();
  }

  /**
   * Close browser and reset config.
   * Called from After hook in hooks.ts.
   */
  public async teardown(): Promise<void> {
    try {
      await this.browser?.close();
      this.config.reset();
      this.logger.info('Browser closed, config reset');
    } catch (err) {
      this.logger.error(`Teardown error: ${err}`);
    }
  }
}

// Register CustomWorld as the Cucumber World
setWorldConstructor(CustomWorld);
