import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/e2e/specs",

  fullyParallel: false,
  workers: 1,
  retries: 0,

  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: false, 
    trace: "on",
    video: "off",
    screenshot: "off",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],

  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
