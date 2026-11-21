import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";
test("records instrumented portal scenarios and supports quality presets", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-aether-ready",
    "true",
  );
  await page.getByRole("button", { name: "Enter AETHER", exact: true }).click();
  await page.getByText("Performance ·", { exact: false }).click();
  const metrics = page.locator("dl[data-perf]");
  await expect(metrics).toHaveAttribute("data-perf", /WebGL2/);
  const runs = [];
  for (const [name, scale] of [
    ["portal-open", "1"],
    ["portal-large", "1.8"],
  ] as const) {
    await page.locator("#scale").fill(scale);
    await page.waitForTimeout(1500);
    runs.push({
      name,
      metrics: JSON.parse((await metrics.getAttribute("data-perf"))!),
    });
  }
  await page
    .getByRole("button", { name: "Open settings", exact: true })
    .click();
  await page
    .getByLabel("Render quality", { exact: true })
    .selectOption("Cinematic");
  await page.getByLabel("Adaptive quality (capped at selected preset)").check();
  await page
    .getByRole("button", { name: "Apply settings", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Cinematic quality", exact: true }),
  ).toBeVisible();
  await page.waitForTimeout(1500);
  runs.push({
    name: "cinematic",
    metrics: JSON.parse((await metrics.getAttribute("data-perf"))!),
  });
  expect(runs.at(-1)!.metrics.particles).toBe(1800);
  await writeFile(
    "test-results/render-metrics.json",
    JSON.stringify(
      {
        viewport: { width: 1440, height: 900 },
        browser:
          "Installed Chromium build 1254, local automated browser. Not a target-laptop 1080p qualification.",
        runs,
      },
      null,
      2,
    ),
  );
});
