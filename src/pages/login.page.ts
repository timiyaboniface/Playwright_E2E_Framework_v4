/**
 * LoginPage — Page Object Model (OOP: Encapsulation / Inheritance)
 * Encapsulates all locators and actions on the SauceDemo Login page.
 * Extends BasePage.
 */

import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ScreenshotHelper } from '../utils/screenshot.helper';

export class LoginPage extends BasePage {

  // ── Locators (private — encapsulated) ─────────────────────────────────────
  private readonly SEL_USERNAME  = '#user-name';
  private readonly SEL_PASSWORD  = '#password';
  private readonly SEL_BTN_LOGIN = '#login-button';
  private readonly SEL_ERROR     = "[data-test='error']";
  private readonly SEL_LOGO      = '.login_logo';

  constructor(page: Page, screenshots: ScreenshotHelper) {
    super(page, screenshots);
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Navigate to the SauceDemo home / login page */
  public async navigate(): Promise<void> {
    await this.goto(this.config.getBaseUrl());
    await this.waitFor(this.SEL_LOGO);
    await this.snap('Navigate_To_Login_Page');
  }

  /**
   * Fill credentials and submit the login form.
   * @param username — SauceDemo username
   * @param password — SauceDemo password
   */
  public async login(username: string, password: string): Promise<void> {
    this.logger.info(`Login with user: "${username}"`);

    await this.waitFor(this.SEL_USERNAME);
    await this.page.fill(this.SEL_USERNAME, username);
    await this.snap('Enter_Username');

    await this.page.fill(this.SEL_PASSWORD, password);
    await this.snap('Enter_Password');

    await this.page.click(this.SEL_BTN_LOGIN);
    await this.page.waitForLoadState('networkidle');
    await this.snap('Click_Login_Button');

    this.logger.info('Login form submitted');
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  public async getErrorMessage(): Promise<string> {
    const visible = await this.isVisible(this.SEL_ERROR);
    if (!visible) return '';
    return this.getText(this.SEL_ERROR);
  }

  public async isDisplayed(): Promise<boolean> {
    return this.isVisible(this.SEL_LOGO);
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  public async assertLoginPageVisible(): Promise<void> {
    await this.assertVisible(this.SEL_LOGO, 'Login page logo should be visible');
  }
}
