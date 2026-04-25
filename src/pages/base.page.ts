/**
 * BasePage — Abstract Base Class (OOP: Abstraction / Inheritance)
 *
 * All page objects extend BasePage.
 * Provides shared:
 *  - Playwright Page reference
 *  - ScreenshotHelper (per-scenario)
 *  - Logger (per-class name)
 *  - ConfigManager access
 *  - Common wait/assertion utilities
 *
 * TestNG equivalent: BaseTest class with @BeforeMethod setup
 */

import { Page, expect } from '@playwright/test';
import { ScreenshotHelper } from '../utils/screenshot.helper';
import { Logger } from '../utils/logger';
import { ConfigManager } from '../config/config.manager';

export abstract class BasePage {
  protected readonly page: Page;
  protected readonly screenshots: ScreenshotHelper;
  protected readonly logger: Logger;
  protected readonly config: ConfigManager;

  constructor(page: Page, screenshots: ScreenshotHelper) {
    this.page        = page;
    this.screenshots = screenshots;
    this.logger      = new Logger(this.constructor.name);
    this.config      = ConfigManager.getInstance();
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  protected async goto(url: string): Promise<void> {
    this.logger.info(`Navigating → ${url}`);
    await this.page.goto(url, {
      waitUntil: 'networkidle',
      timeout: this.config.getNavigationTimeout(),
    });
  }

  // ── Waits ─────────────────────────────────────────────────────────────────

  protected async waitFor(selector: string, timeout?: number): Promise<void> {
    await this.page.waitForSelector(selector, {
      state: 'visible',
      timeout: timeout ?? this.config.getDefaultTimeout(),
    });
  }

  protected async isVisible(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout: 4000 });
      return true;
    } catch {
      return false;
    }
  }

  // ── Screenshots ───────────────────────────────────────────────────────────

  /**
   * Capture a step screenshot based on the configured screenshot mode.
   * Mode "always"     → always capture
   * Mode "on-failure" → only captured on failure (handled in hooks)
   * Mode "never"      → skip
   */
  protected async snap(stepName: string): Promise<void> {
    const mode = this.config.getScreenshotMode();
    if (mode === 'never') return;
    if (mode === 'always') {
      await this.screenshots.capture(this.page, stepName);
    }
    this.logger.step(stepName);
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  protected async assertVisible(selector: string, message?: string): Promise<void> {
    await expect(
      this.page.locator(selector),
      message ?? `Expected "${selector}" to be visible`
    ).toBeVisible({ timeout: this.config.getDefaultTimeout() });
  }

  protected async assertText(selector: string, expectedText: string): Promise<void> {
    await expect(
      this.page.locator(selector)
    ).toContainText(expectedText, { timeout: this.config.getDefaultTimeout() });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  public getCurrentUrl(): string { return this.page.url(); }
  public async getTitle(): Promise<string> { return this.page.title(); }

  protected async getText(selector: string): Promise<string> {
    return (await this.page.locator(selector).textContent()) ?? '';
  }
}
