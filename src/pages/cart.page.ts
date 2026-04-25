/**
 * CartPage — Page Object Model (OOP: Encapsulation / Inheritance)
 * Encapsulates the SauceDemo Shopping Cart page.
 */

import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ScreenshotHelper } from '../utils/screenshot.helper';
import { CartItem } from '../types/framework.types';

export class CartPage extends BasePage {
//GIT edit to check
  // ── Locators ──────────────────────────────────────────────────────────────
  private readonly SEL_CART_ITEM   = '.cart_item';
  private readonly SEL_ITEM_NAME   = '.inventory_item_name';
  private readonly SEL_ITEM_PRICE  = '.inventory_item_price';
  private readonly SEL_ITEM_QTY    = '.cart_quantity';
  private readonly SEL_BTN_CHECKOUT = '#checkout';
  private readonly SEL_BTN_CONTINUE = '#continue-shopping';

  constructor(page: Page, screenshots: ScreenshotHelper) {
    super(page, screenshots);
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  public async waitUntilLoaded(): Promise<void> {
    await this.waitFor(this.SEL_BTN_CHECKOUT);
    await this.snap('Cart_Page_Loaded');
    this.logger.info('Cart page loaded');
  }

  public async proceedToCheckout(): Promise<void> {
    await this.page.click(this.SEL_BTN_CHECKOUT);
    await this.page.waitForLoadState('networkidle');
    await this.snap('Clicked_Checkout_Button');
    this.logger.info('Navigated to checkout');
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  public async getCartItems(): Promise<CartItem[]> {
    const items: CartItem[] = [];
    const rows = this.page.locator(this.SEL_CART_ITEM);
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const name  = ((await rows.nth(i).locator(this.SEL_ITEM_NAME ).textContent()) ?? '').trim();
      const price = ((await rows.nth(i).locator(this.SEL_ITEM_PRICE).textContent()) ?? '').trim();
      const qty   = ((await rows.nth(i).locator(this.SEL_ITEM_QTY  ).textContent()) ?? '').trim();
      items.push({ name, price, quantity: qty });
    }
    return items;
  }

  public async getItemCount(): Promise<number> {
    return this.page.locator(this.SEL_CART_ITEM).count();
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  public async assertIsLoaded(): Promise<void> {
    await this.assertVisible(this.SEL_BTN_CHECKOUT, 'Checkout button should be visible on cart page');
  }

  public async assertItemInCart(productName: string): Promise<void> {
    const items = await this.getCartItems();
    const found = items.some((i) => i.name.toLowerCase().includes(productName.toLowerCase()));
    if (!found) {
      throw new Error(`Expected product "${productName}" to be in cart but it was not found`);
    }
  }
}
