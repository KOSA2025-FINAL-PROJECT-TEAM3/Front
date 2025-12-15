import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const DEFAULT_BROWSER_CHANNEL = process.env.PLAYWRIGHT_BROWSER_CHANNEL || 'msedge'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Edge'], channel: DEFAULT_BROWSER_CHANNEL },
    },
  ],
  webServer: {
    command: `node ./node_modules/vite/bin/vite.js --port ${PORT} --strictPort --host 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
