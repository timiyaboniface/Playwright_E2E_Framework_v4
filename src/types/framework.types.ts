/**
 * framework.types.ts
 * Central TypeScript type & interface definitions for the entire framework.
 * Every module imports from here — single source of truth.
 */

// ── Browser & Environment ────────────────────────────────────────────────────
export type BrowserType      = 'chromium' | 'firefox' | 'webkit';
export type EnvironmentType  = 'dev' | 'staging' | 'prod';
export type ScreenshotMode   = 'always' | 'on-failure' | 'never';

// ── Framework Configuration ──────────────────────────────────────────────────
export interface FrameworkConfig {
  env: EnvironmentType;
  browser: BrowserType;
  headless: boolean;
  baseUrl: string;
  username: string;
  password: string;
  defaultTimeout: number;
  navigationTimeout: number;
  screenshotMode: ScreenshotMode;
  reportDir: string;
  reportTitle: string;
  projectName: string;
  parallelWorkers: number;
  retryCount: number;
}

// ── Excel Test Data Row ──────────────────────────────────────────────────────
// Mirrors the columns of the Excel sheet exactly (case-sensitive header names)
export interface TestDataRow {
  testId: string;
  description: string;
  browser: BrowserType;
  environment: EnvironmentType;
  headless: string;          // "true" | "false"
  baseUrl: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  postalCode: string;
  productName: string;       // partial name match; blank = use first product
  parallelWorkers: string;   // numeric string
  retryCount: string;        // numeric string
  active: string;            // "yes" | "no"  — rows with "no" are skipped
}

// ── Page Object Data Transfer Objects ────────────────────────────────────────
export interface ProductInfo {
  name: string;
  price: string;
}

export interface CartItem {
  name: string;
  price: string;
  quantity?: string;
}

export interface OrderSummary {
  items: CartItem[];
  subtotal: string;
  tax: string;
  total: string;
}

// ── Scenario Context (shared state across steps) ──────────────────────────────
export interface ScenarioContext {
  testData: TestDataRow | null;
  addedProduct: ProductInfo | null;
  orderSummary: OrderSummary | null;
  screenshotPaths: string[];
  errors: string[];
}
