/**
 * CheckoutCompletePage — Page Object Model (OOP: Encapsulation / Inheritance)
 * Encapsulates the SauceDemo Order Confirmation page.
 */

import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ScreenshotHelper } from '../utils/screenshot.helper';

export class CheckoutCompletePage extends BasePage {

  // ── Locators ──────────────────────────────────────────────────────────────
  private readonly SEL_HEADER          = '.complete-header';
  private readonly SEL_DESCRIPTION     = '.complete-text';
  private readonly SEL_BACK_TO_PRODUCTS = '#back-to-products';
  private readonly SEL_PONY_EXPRESS    = '.pony_express';

  constructor(page: Page, screenshots: ScreenshotHelper) {
    super(page, screenshots);
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  public async waitUntilLoaded(): Promise<void> {
    await this.waitFor(this.SEL_HEADER);
    await this.snap('Order_Confirmation_Page_Loaded');
    this.logger.info('Order confirmation page loaded');
  }

  public async backToProducts(): Promise<void> {
    await this.page.click(this.SEL_BACK_TO_PRODUCTS);
    await this.page.waitForLoadState('networkidle');
    await this.snap('Back_To_Products');
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  public async getConfirmationHeader(): Promise<string> {
    return ((await this.getText(this.SEL_HEADER)) ?? '').trim();
  }

  public async getConfirmationText(): Promise<string> {
    return ((await this.getText(this.SEL_DESCRIPTION)) ?? '').trim();
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  public async assertOrderConfirmed(): Promise<void> {
    await this.assertVisible(this.SEL_HEADER, 'Confirmation header should be visible');
    const header = await this.getConfirmationHeader();
    if (!header.toLowerCase().includes('thank you')) {
      throw new Error(`Expected "Thank you" confirmation, but got: "${header}"`);
    }
    this.logger.info(`Order confirmed: "${header}"`);
    await this.snap('Order_Confirmed_Assertion_Passed');
  }

  public async assertIsLoaded(): Promise<void> {
    await this.assertVisible(this.SEL_HEADER, 'Completion page header should be visible');
  }
}
