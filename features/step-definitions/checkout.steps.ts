/**
 * checkout.steps.ts — Step definitions for Checkout & Purchase scenarios
 */

import { When, Then } from '@cucumber/cucumber';
import { CustomWorld }  from '../support/world';

// ── When ─────────────────────────────────────────────────────────────────────

When('I fill in the checkout form with details from test data', async function (this: CustomWorld) {
  this.logger.step('When I fill in the checkout form with details from test data');
  const data = this.scenarioCtx.testData;
  if (!data) throw new Error('Test data not loaded');

  await this.pages.checkoutInfo.fillForm(
    data.firstName,
    data.lastName,
    data.postalCode
  );
  await this.pages.checkoutInfo.continueToOverview();
  await this.pages.checkoutOverview.waitUntilLoaded();
  await this.pages.checkoutOverview.assertIsLoaded();
});

When(
  'I fill in the checkout form with first name {string}, last name {string} and postal code {string}',
  async function (this: CustomWorld, firstName: string, lastName: string, postalCode: string) {
    this.logger.step('When I fill in the checkout form with parameterized values');

    const resolvedFirstName = this.resolveParam(firstName);
    const resolvedLastName = this.resolveParam(lastName);
    const resolvedPostalCode = this.resolveParam(postalCode);

    await this.pages.checkoutInfo.fillForm(
      resolvedFirstName,
      resolvedLastName,
      resolvedPostalCode
    );
    await this.pages.checkoutInfo.continueToOverview();
    await this.pages.checkoutOverview.waitUntilLoaded();
    await this.pages.checkoutOverview.assertIsLoaded();
  }
);

When('I confirm the order on the overview page', async function (this: CustomWorld) {
  this.logger.step('When I confirm the order on the overview page');

  // Capture order summary before completing purchase
  const summary = await this.pages.checkoutOverview.getOrderSummary();
  this.scenarioCtx.orderSummary = summary;

  this.logger.info(`Order summary — Subtotal: ${summary.subtotal} | Tax: ${summary.tax} | Total: ${summary.total}`);
  this.logger.info(`Items in order: ${summary.items.map((i) => i.name).join(', ')}`);

  await this.pages.checkoutOverview.completePurchase();
  await this.pages.checkoutComplete.waitUntilLoaded();
});

When('I submit the checkout form without filling any fields', async function (this: CustomWorld) {
  this.logger.step('When I submit the checkout form without filling any fields');
  await this.pages.checkoutInfo.waitUntilLoaded();
  await this.pages.checkoutInfo.continueToOverview();
});

// ── Then ─────────────────────────────────────────────────────────────────────

Then('the purchase should be confirmed with a thank you message', async function (this: CustomWorld) {
  this.logger.step('Then the purchase should be confirmed with a thank you message');
  await this.pages.checkoutComplete.assertOrderConfirmed();

  const header = await this.pages.checkoutComplete.getConfirmationHeader();
  const text   = await this.pages.checkoutComplete.getConfirmationText();
  this.logger.info(`Confirmation header : "${header}"`);
  this.logger.info(`Confirmation message: "${text}"`);

  // Attach order summary to report for traceability
  if (this.scenarioCtx.orderSummary) {
    const s = this.scenarioCtx.orderSummary;
    const summary = `Order Summary:\n${s.items.map((i) => `  • ${i.name}: ${i.price}`).join('\n')}\n  ${s.subtotal}\n  ${s.tax}\n  ${s.total}`;
    await this.attach(summary, 'text/plain');
  }
});

Then('the checkout form should show a validation error', async function (this: CustomWorld) {
  this.logger.step('Then the checkout form should show a validation error');
  const error = await this.pages.checkoutInfo.getErrorMessage();
  if (!error || error.trim() === '') {
    throw new Error('Expected a validation error message on checkout form, but none was shown');
  }
  this.logger.info(`Validation error displayed: "${error}" ✅`);
});
