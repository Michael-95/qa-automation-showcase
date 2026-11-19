import { defineConfig, devices } from '@playwright/test';
import { STORAGE_STATE } from './tests/support/constants';

const BASE_URL = process.env.BASE_URL ?? 'https://www.saucedemo.com';
const API_URL = process.env.API_URL ?? 'https://restful-booker.herokuapp.com';
const isCI = !!process.env.CI;

/**
 * Projects mirror how the suite is split in CI: one job per project,
 * so a failure points straight at the layer that broke.
 *
 *   setup      logs in once and saves the session for the projects that need it
 *   anonymous  login and access-control checks, no session
 *   chromium   authenticated shopping flows (Desktop Chrome)
 *   firefox    same flows, second engine
 *   mobile     same flows on a Pixel 7 viewport
 *   a11y       axe-core WCAG 2.x A/AA scans
 *   api        REST contract tests, no browser
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }], ['junit', { outputFile: 'results/junit.xml' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    {
      name: 'anonymous',
      testMatch: /e2e\/login\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium',
      testMatch: /e2e\/(inventory|checkout)\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
    },
    {
      name: 'firefox',
      testMatch: /e2e\/(inventory|checkout)\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Firefox'], storageState: STORAGE_STATE },
    },
    {
      name: 'mobile',
      testMatch: /e2e\/(inventory|checkout)\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Pixel 7'], storageState: STORAGE_STATE },
    },
    {
      name: 'a11y',
      testMatch: /a11y\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
    },
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.ts/,
      use: {
        baseURL: API_URL,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],
});
