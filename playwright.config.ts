import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30000,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3000",
    viewport: { width: 1440, height: 900 },
    launchOptions: {
      executablePath: process.env.AETHER_BROWSER_PATH,
      args: ["--enable-unsafe-swiftshader"],
    },
  },
  reporter: "list",
});
