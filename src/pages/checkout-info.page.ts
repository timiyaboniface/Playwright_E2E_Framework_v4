/**
 * CheckoutInfoPage — Page Object Model (OOP: Encapsulation / Inheritance)
 * Encapsulates the SauceDemo Checkout Information form.
 */

import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ScreenshotHelper } from '../utils/screenshot.helper';

export class CheckoutInfoPage extends BasePage {

  // ── Locators ──────────────────────────────────────────────────────────────
  private readonly SEL_FIRST_NAME  = '#first-name';
  private readonly SEL_LAST_NAME   = '#last-name';
  private readonly SEL_POSTAL_CODE = '#postal-code';
  private readonly SEL_BTN_CONTINUE = '#continue';
  private readonly SEL_BTN_CANCEL   = '#cancel';
  private readonly SEL_ERROR        = "[data-test='error']";

  constructor(page: Page, screenshots: ScreenshotHelper) {
    super(page, screenshots);
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  public async waitUntilLoaded(): Promise<void> {
    await this.waitFor(this.SEL_FIRST_NAME);
    await this.snap('Checkout_Info_Page_Loaded');
    this.logger.info('Checkout info page loaded');
  }

  /**
   * Fill all fields of the checkout information form.
   * All values come from TestDataRow (Excel-driven).
   */
  public async fillForm(firstName: string, lastName: string, postalCode: string): Promise<void> {
    this.logger.info(`Filling checkout info: ${firstName} ${lastName}, ZIP: ${postalCode}`);

    await this.page.fill(this.SEL_FIRST_NAME,  firstName);
    await this.snap('Enter_First_Name');

    await this.page.fill(this.SEL_LAST_NAME,   lastName);
    await this.snap('Enter_Last_Name');

    await this.page.fill(this.SEL_POSTAL_CODE, postalCode);
    await this.snap('Enter_Postal_Code');
  }

  public async continueToOverview(): Promise<void> {
    await this.page.click(this.SEL_BTN_CONTINUE);
    await this.page.waitForLoadState('networkidle');
    await this.snap('Continue_To_Overview');
    this.logger.info('Continued to checkout overview');
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  public async getErrorMessage(): Promise<string> {
    if (!(await this.isVisible(this.SEL_ERROR))) return '';
    return this.getText(this.SEL_ERROR);
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  public async assertIsLoaded(): Promise<void> {
    await this.assertVisible(this.SEL_FIRST_NAME, 'Checkout info form should be visible');
  }
}
