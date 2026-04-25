/**
 * InventoryPage — Page Object Model (OOP: Encapsulation / Inheritance)
 * Encapsulates the SauceDemo Products/Inventory page.
 */

import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ScreenshotHelper } from '../utils/screenshot.helper';
import { ProductInfo } from '../types/framework.types';

export class InventoryPage extends BasePage {

  // ── Locators ──────────────────────────────────────────────────────────────
  private readonly SEL_TITLE         = '.title';
  private readonly SEL_PRODUCT       = '.inventory_item';
  private readonly SEL_PRODUCT_NAME  = '.inventory_item_name';
  private readonly SEL_PRODUCT_PRICE = '.inventory_item_price';
  private readonly SEL_ADD_BTN       = "button[data-test^='add-to-cart']";
  private readonly SEL_CART_BADGE    = '.shopping_cart_badge';
  private readonly SEL_CART_LINK     = '.shopping_cart_link';
  private readonly SEL_BURGER_MENU   = '#react-burger-menu-btn';
  private readonly SEL_LOGOUT        = '#logout_sidebar_link';

  constructor(page: Page, screenshots: ScreenshotHelper) {
    super(page, screenshots);
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Wait for inventory page to be fully loaded */
  public async waitUntilLoaded(): Promise<void> {
    await this.waitFor(this.SEL_TITLE);
    await this.waitFor(this.SEL_PRODUCT);
    await this.snap('Inventory_Page_Loaded');
    this.logger.info('Inventory page loaded');
  }

  /**
   * Add the first product on the page to the cart.
   * @returns product name and price
   */
  public async addFirstProductToCart(): Promise<ProductInfo> {
    const products = this.page.locator(this.SEL_PRODUCT);
    const first    = products.first();

    const name  = ((await first.locator(this.SEL_PRODUCT_NAME ).textContent()) ?? '').trim();
    const price = ((await first.locator(this.SEL_PRODUCT_PRICE).textContent()) ?? '').trim();

    await first.locator(this.SEL_ADD_BTN).click();
    await this.snap(`Add_To_Cart_${name.replace(/\s+/g, '_').substring(0, 25)}`);

    this.logger.info(`Added to cart: "${name}" ${price}`);
    return { name, price };
  }

  /**
   * Add a product by name (case-insensitive partial match).
   * Throws if not found.
   */
  public async addProductByName(productName: string): Promise<ProductInfo> {
    const products = this.page.locator(this.SEL_PRODUCT);
    const count    = await products.count();

    for (let i = 0; i < count; i++) {
      const name = ((await products.nth(i).locator(this.SEL_PRODUCT_NAME).textContent()) ?? '').trim();
      if (name.toLowerCase().includes(productName.toLowerCase())) {
        const price = ((await products.nth(i).locator(this.SEL_PRODUCT_PRICE).textContent()) ?? '').trim();
        await products.nth(i).locator(this.SEL_ADD_BTN).click();
        await this.snap(`Add_To_Cart_${name.replace(/\s+/g, '_').substring(0, 25)}`);
        this.logger.info(`Added to cart: "${name}" ${price}`);
        return { name, price };
      }
    }
    throw new Error(`Product matching "${productName}" not found on inventory page`);
  }

  /** Navigate to the shopping cart */
  public async goToCart(): Promise<void> {
    await this.page.click(this.SEL_CART_LINK);
    await this.page.waitForLoadState('networkidle');
    await this.snap('Navigate_To_Cart');
  }

  /** Logout via burger menu */
  public async logout(): Promise<void> {
    this.logger.info('Logging out via burger menu');
    await this.page.click(this.SEL_BURGER_MENU);
    await this.waitFor(this.SEL_LOGOUT);
    await this.snap('Burger_Menu_Open');
    await this.page.click(this.SEL_LOGOUT);
    await this.page.waitForLoadState('networkidle');
    await this.snap('Logged_Out');
    this.logger.info('Logout successful');
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  public async getCartCount(): Promise<number> {
    if (!(await this.isVisible(this.SEL_CART_BADGE))) return 0;
    return parseInt((await this.getText(this.SEL_CART_BADGE)) ?? '0', 10);
  }

  public async getProductCount(): Promise<number> {
    return this.page.locator(this.SEL_PRODUCT).count();
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  public async assertIsLoaded(): Promise<void> {
    await this.assertVisible(this.SEL_TITLE, 'Inventory page title should be visible');
    await this.assertText(this.SEL_TITLE, 'Products');
  }

  public async assertCartCount(expected: number): Promise<void> {
    const actual = await this.getCartCount();
    if (actual !== expected) {
      throw new Error(`Cart count: expected ${expected}, got ${actual}`);
    }
  }
}
