import { test, expect } from "@playwright/test";
test("portal parallax, edge-on/back rejection and rebuild stay bounded", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-aether-ready",
    "true",
  );
  await page.getByRole("button", { name: "Enter AETHER", exact: true }).click();
  const canvas = page.locator("canvas");
  await expect(canvas).toHaveAttribute('data-phase','stable');
  await expect(canvas).toHaveAttribute("data-portal-front", "true");
  await page.locator("#view-x").fill("2");
  await expect(canvas).toHaveAttribute("data-view-x", "2");
  await page.screenshot({ path: "test-results/portal-parallax.png" });
  await page.locator("#portal-yaw").fill("1.3");
  await expect(canvas).toHaveAttribute("data-yaw", "1.31");
  await page.screenshot({ path: "test-results/portal-steep.png" });
  await page.locator("#portal-yaw").fill("3.14");
  await expect(canvas).toHaveAttribute("data-portal-front", "false");
  await page.screenshot({ path: "test-results/portal-back.png" });
  await page.locator("#portal-yaw").fill("0");
  await page.locator("#scale").fill("1.8");
  await expect(canvas).toHaveAttribute("data-portal-front", "true");
  await page.screenshot({ path: "test-results/portal-large.png" });
  const baseline = +(await canvas.getAttribute("data-geometries"))!;
  for (let i = 0; i < 4; i++) {
    await page.getByRole("button", { name: /Collapse portal/ }).click();
    await page.getByRole("button", { name: /Open portal/ }).click();
  }
  expect(+(await canvas.getAttribute("data-geometries"))!).toBeLessThanOrEqual(
    baseline + 1,
  );
  expect(errors).toEqual([]);
});
