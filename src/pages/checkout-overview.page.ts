/**
 * CheckoutOverviewPage — Page Object Model (OOP: Encapsulation / Inheritance)
 * Encapsulates the SauceDemo Checkout Overview (order summary) page.
 */

import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ScreenshotHelper } from '../utils/screenshot.helper';
import { OrderSummary, CartItem } from '../types/framework.types';

export class CheckoutOverviewPage extends BasePage {

  // ── Locators ──────────────────────────────────────────────────────────────
  private readonly SEL_CART_ITEM   = '.cart_item';
  private readonly SEL_ITEM_NAME   = '.inventory_item_name';
  private readonly SEL_ITEM_PRICE  = '.inventory_item_price';
  private readonly SEL_SUBTOTAL    = '.summary_subtotal_label';
  private readonly SEL_TAX         = '.summary_tax_label';
  private readonly SEL_TOTAL       = '.summary_total_label';
  private readonly SEL_BTN_FINISH  = '#finish';
  private readonly SEL_BTN_CANCEL  = '#cancel';

  constructor(page: Page, screenshots: ScreenshotHelper) {
    super(page, screenshots);
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  public async waitUntilLoaded(): Promise<void> {
    await this.waitFor(this.SEL_BTN_FINISH);
    await this.snap('Checkout_Overview_Loaded');
    this.logger.info('Checkout overview page loaded');
  }

  public async completePurchase(): Promise<void> {
    this.logger.info('Clicking Finish to complete purchase');
    await this.page.click(this.SEL_BTN_FINISH);
    await this.page.waitForLoadState('networkidle');
    await this.snap('Clicked_Finish_Button');
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  public async getOrderSummary(): Promise<OrderSummary> {
    const items: CartItem[] = [];
    const rows = this.page.locator(this.SEL_CART_ITEM);
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const name  = ((await rows.nth(i).locator(this.SEL_ITEM_NAME ).textContent()) ?? '').trim();
      const price = ((await rows.nth(i).locator(this.SEL_ITEM_PRICE).textContent()) ?? '').trim();
      items.push({ name, price });
    }

    return {
      items,
      subtotal: ((await this.page.locator(this.SEL_SUBTOTAL).textContent()) ?? '').trim(),
      tax:      ((await this.page.locator(this.SEL_TAX     ).textContent()) ?? '').trim(),
      total:    ((await this.page.locator(this.SEL_TOTAL   ).textContent()) ?? '').trim(),
    };
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  public async assertIsLoaded(): Promise<void> {
    await this.assertVisible(this.SEL_BTN_FINISH, 'Finish button should be visible on overview page');
  }
}
