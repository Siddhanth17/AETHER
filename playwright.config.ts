import { defineConfig } from "@playwright/test";
export default defineConfig({
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
  testDir: "tests/e2e",
  timeout: 30000,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3000",
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      executablePath: process.env.AETHER_BROWSER_PATH,
      args: [
        "--enable-unsafe-swiftshader",
        "--use-fake-device-for-media-stream",
      ],
    },
  },
  reporter: "list",
});
