/**
 * PageFactory — Factory class (OOP: Factory Pattern)
 * Centralises creation of all page objects.
 * Steps never call `new PageXxx()` directly — they always use PageFactory.
 * This ensures consistent injection of page + screenshotHelper.
 *
 * TestNG equivalent: PageFactory.initElements() in Selenium
 */

import { Page } from '@playwright/test';
import { ScreenshotHelper } from '../utils/screenshot.helper';
import { LoginPage }            from './login.page';
import { InventoryPage }        from './inventory.page';
import { CartPage }             from './cart.page';
import { CheckoutInfoPage }     from './checkout-info.page';
import { CheckoutOverviewPage } from './checkout-overview.page';
import { CheckoutCompletePage } from './checkout-complete.page';

export class PageFactory {
  private readonly page: Page;
  private readonly screenshots: ScreenshotHelper;

  // Lazily-initialised page caches (one instance per scenario)
  private _login?:            LoginPage;
  private _inventory?:        InventoryPage;
  private _cart?:             CartPage;
  private _checkoutInfo?:     CheckoutInfoPage;
  private _checkoutOverview?: CheckoutOverviewPage;
  private _checkoutComplete?: CheckoutCompletePage;

  constructor(page: Page, screenshots: ScreenshotHelper) {
    this.page        = page;
    this.screenshots = screenshots;
  }

  public get login(): LoginPage {
    if (!this._login) this._login = new LoginPage(this.page, this.screenshots);
    return this._login;
  }

  public get inventory(): InventoryPage {
    if (!this._inventory) this._inventory = new InventoryPage(this.page, this.screenshots);
    return this._inventory;
  }

  public get cart(): CartPage {
    if (!this._cart) this._cart = new CartPage(this.page, this.screenshots);
    return this._cart;
  }

  public get checkoutInfo(): CheckoutInfoPage {
    if (!this._checkoutInfo) this._checkoutInfo = new CheckoutInfoPage(this.page, this.screenshots);
    return this._checkoutInfo;
  }

  public get checkoutOverview(): CheckoutOverviewPage {
    if (!this._checkoutOverview) this._checkoutOverview = new CheckoutOverviewPage(this.page, this.screenshots);
    return this._checkoutOverview;
  }

  public get checkoutComplete(): CheckoutCompletePage {
    if (!this._checkoutComplete) this._checkoutComplete = new CheckoutCompletePage(this.page, this.screenshots);
    return this._checkoutComplete;
  }
}
