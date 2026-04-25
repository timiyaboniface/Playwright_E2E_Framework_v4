/**
 * cart.steps.ts — Step definitions for Cart & Inventory scenarios
 */

import { When, Then } from '@cucumber/cucumber';
import { CustomWorld }  from '../support/world';

// ── When ─────────────────────────────────────────────────────────────────────

When('I add the first available product to the cart', async function (this: CustomWorld) {
  this.logger.step('When I add the first available product to the cart');
  const product = await this.pages.inventory.addFirstProductToCart();
  this.scenarioCtx.addedProduct = product;
  this.logger.info(`Product stored in context: "${product.name}" ${product.price}`);
});

When('I add the product from test data to the cart', async function (this: CustomWorld) {
  this.logger.step('When I add the product from test data to the cart');
  const data = this.scenarioCtx.testData;

  let product;
  if (data?.productName && data.productName.trim() !== '') {
    product = await this.pages.inventory.addProductByName(data.productName);
  } else {
    product = await this.pages.inventory.addFirstProductToCart();
  }

  this.scenarioCtx.addedProduct = product;
  this.logger.info(`Product added: "${product.name}" ${product.price}`);
});

When('I add the product {string} to the cart', async function (this: CustomWorld, productName: string) {
  this.logger.step(`When I add the product parameter "${productName}" to the cart`);

  const resolvedProductName = this.resolveOptionalParam(productName);
  const product = resolvedProductName
    ? await this.pages.inventory.addProductByName(resolvedProductName)
    : await this.pages.inventory.addFirstProductToCart();

  this.scenarioCtx.addedProduct = product;
  this.logger.info(`Product added: "${product.name}" ${product.price}`);
});

When('I proceed to the shopping cart', async function (this: CustomWorld) {
  this.logger.step('When I proceed to the shopping cart');
  await this.pages.inventory.goToCart();
  await this.pages.cart.waitUntilLoaded();
  await this.pages.cart.assertIsLoaded();
});

When('I proceed to checkout', async function (this: CustomWorld) {
  this.logger.step('When I proceed to checkout');
  await this.pages.cart.proceedToCheckout();
  await this.pages.checkoutInfo.waitUntilLoaded();
  await this.pages.checkoutInfo.assertIsLoaded();
});

// ── Then ─────────────────────────────────────────────────────────────────────

Then('the cart badge should show {int} item', async function (this: CustomWorld, expectedCount: number) {
  this.logger.step(`Then the cart badge should show ${expectedCount} item`);
  await this.pages.inventory.assertCartCount(expectedCount);
  this.logger.info(`Cart count verified: ${expectedCount}`);
});

Then('the cart should contain the added product', async function (this: CustomWorld) {
  this.logger.step('Then the cart should contain the added product');
  const addedProduct = this.scenarioCtx.addedProduct;
  if (!addedProduct) throw new Error('No product was stored in scenario context');
  await this.pages.cart.assertItemInCart(addedProduct.name);
  this.logger.info(`Cart contains: "${addedProduct.name}" ✅`);
});
