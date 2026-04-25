/**
 * RetryHelper — Utility class (OOP: Strategy Pattern)
 * Provides configurable retry logic for flaky steps or scenarios.
 *
 * TestNG equivalent: IRetryAnalyzer
 *
 * Usage:
 *   const result = await RetryHelper.retry(() => someAsyncAction(), 2, 1000);
 */

import { Logger } from './logger';

const logger = new Logger('RetryHelper');

export class RetryHelper {
  /**
   * Execute an async function with retry logic.
   *
   * @param fn         — async function to execute
   * @param retries    — number of retries (from config.retryCount)
   * @param delayMs    — delay between retries in milliseconds
   * @returns result of fn on success
   * @throws last error if all retries exhausted
   *
   * TestNG equivalent: RetryAnalyzer.retry() returning true/false
   */
  public static async retry<T>(
    fn: () => Promise<T>,
    retries: number,
    delayMs = 1000
  ): Promise<T> {
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        if (attempt > 1) {
          logger.warn(`Retry attempt ${attempt - 1} of ${retries}...`);
          await RetryHelper.sleep(delayMs);
        }
        return await fn();
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        logger.error(`Attempt ${attempt} failed: ${lastError.message}`);
      }
    }

    logger.error(`All ${retries + 1} attempts failed. Throwing last error.`);
    throw lastError;
  }

  /** Simple promise-based sleep */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
