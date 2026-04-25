/**
 * common.steps.ts — Shared step definitions used across multiple features
 * Covers: test data loading, configuration steps
 *
 * TestNG equivalent: @BeforeMethod data setup with @DataProvider
 */

import { Given } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';

Given(
  'I load test data from sheet {string} with id {string}',
  async function (this: CustomWorld, sheetName: string, testId: string) {
    this.logger.step(`Given I load test data from sheet "${sheetName}" with id "${testId}"`);

    const row = await this.loadTestData(sheetName, testId);

    if (row) {
      this.logger.info(`Test data loaded for "${testId}": browser=${row.browser}, env=${row.environment}`);
      this.logger.info(`  User: ${row.username} | Product: ${row.productName || '(first)'}`);
      this.logger.info(`  Checkout: ${row.firstName} ${row.lastName}, ZIP: ${row.postalCode}`);
    } else {
      this.logger.warn(`No test data found for testId="${testId}" — using .env defaults`);
    }
  }
);
