/**
 * login.steps.ts — Step definitions for Login scenarios
 * Maps Gherkin steps to page object actions.
 *
 * TestNG equivalent: @Test methods calling page object methods
 */

import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld }       from '../support/world';

// ── Given ────────────────────────────────────────────────────────────────────

Given('the SauceDemo login page is displayed', async function (this: CustomWorld) {
  this.logger.step('Given the SauceDemo login page is displayed');
  await this.pages.login.navigate();
  await this.pages.login.assertLoginPageVisible();
});

// ── When ─────────────────────────────────────────────────────────────────────

When(
  'I log in with username {string} and password {string}',
  async function (this: CustomWorld, username: string, password: string) {
    const resolvedUsername = this.resolveParam(username);
    const resolvedPassword = this.resolveParam(password);

    this.logger.step(`When I log in with username "${resolvedUsername}"`);
    await this.pages.login.login(resolvedUsername, resolvedPassword);
  }
);

When('I log in using credentials from test data', async function (this: CustomWorld) {
  const data = this.scenarioCtx.testData;
  if (!data) throw new Error('Test data not loaded — call "Given I load test data" step first');

  this.logger.step(`When I log in using test data credentials (user: ${data.username})`);
  await this.pages.login.login(data.username, data.password);
});

// ── Then ─────────────────────────────────────────────────────────────────────

Then('I should see the product inventory page', async function (this: CustomWorld) {
  this.logger.step('Then I should see the product inventory page');
  await this.pages.inventory.waitUntilLoaded();
  await this.pages.inventory.assertIsLoaded();
});

Then('I should see an error message on the login page', async function (this: CustomWorld) {
  this.logger.step('Then I should see an error message on the login page');
  const errorMessage = await this.pages.login.getErrorMessage();
  if (!errorMessage || errorMessage.trim() === '') {
    throw new Error('Expected an error message but none was displayed');
  }
  this.logger.info(`Error message displayed: "${errorMessage}"`);
});

Then('I log out of the application', async function (this: CustomWorld) {
  this.logger.step('Then I log out of the application');
  await this.pages.inventory.logout();
  await this.pages.login.assertLoginPageVisible();
  this.logger.info('Logout verified — login page displayed');
});
