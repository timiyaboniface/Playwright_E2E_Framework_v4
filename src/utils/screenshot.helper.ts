/**
 * ScreenshotHelper — Utility class (OOP: Encapsulation)
 * Per-scenario screenshot manager:
 *  - Creates a uniquely named subfolder per scenario run
 *  - Captures numbered step screenshots
 *  - Captures failure screenshots
 *  - Returns paths for embedding in HTML reports
 *
 * TestNG equivalent: ITestListener.onTestFailure screenshot capture
 */

import * as fs from 'fs';
import * as path from 'path';
import { Page } from '@playwright/test';

export class ScreenshotHelper {
  private readonly scenarioDir: string;
  private stepCounter: number = 0;

  /**
   * @param scenarioName — human-readable scenario name (sanitised for filesystem)
   */
  constructor(scenarioName: string) {
    const safe = scenarioName
      .replace(/[^a-zA-Z0-9 _-]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 70);

    const ts = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .substring(0, 19);

    this.scenarioDir = path.resolve(
      process.cwd(),
      'reports',
      'screenshots',
      `${ts}_${safe}`
    );

    fs.mkdirSync(this.scenarioDir, { recursive: true });
  }

  /**
   * Take a numbered step screenshot.
   * @param page     — active Playwright page
   * @param stepName — short description used in filename
   * @returns absolute path to the saved PNG
   */
  public async capture(page: Page, stepName: string): Promise<string> {
    this.stepCounter++;
    const safe = stepName
      .replace(/[^a-zA-Z0-9 _-]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 60);

    const fileName = `${String(this.stepCounter).padStart(3, '0')}_${safe}.png`;
    const filePath = path.join(this.scenarioDir, fileName);

    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`  📸 Screenshot saved: ${fileName}`);
    return filePath;
  }

  /**
   * Take a failure screenshot (always saved regardless of screenshot mode).
   */
  public async captureFailure(page: Page): Promise<string> {
    const fileName = `FAILURE_${Date.now()}.png`;
    const filePath = path.join(this.scenarioDir, fileName);
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`  ❌ Failure screenshot: ${fileName}`);
    return filePath;
  }

  /** Returns all screenshot paths for this scenario (for report embedding) */
  public getAllPaths(): string[] {
    if (!fs.existsSync(this.scenarioDir)) return [];
    return fs
      .readdirSync(this.scenarioDir)
      .filter((f) => f.endsWith('.png'))
      .sort()
      .map((f) => path.join(this.scenarioDir, f));
  }

  public getScenarioDir(): string {
    return this.scenarioDir;
  }
}
