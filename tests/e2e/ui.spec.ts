import { test, expect } from "@playwright/test";
test("intro can be skipped and settings trap focus and close with Escape", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-aether-ready",
    "true",
  );
  const skip = page.getByRole("button", { name: "Skip intro", exact: true });
  if (await skip.isVisible()) await skip.click();
  await expect(page.locator("[data-intro]")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Open settings", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Shift+Tab");
  expect(
    await page.evaluate(() =>
      document.querySelector("dialog")!.contains(document.activeElement),
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Open settings", exact: true }),
  ).toBeFocused();
});
test("reduced motion bypasses intro and portal transitional animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-aether-ready",
    "true",
  );
  await expect(page.locator("[data-intro]")).toHaveCount(0);
  await page.getByRole("button", { name: "Enter AETHER", exact: true }).click();
  await expect(page.locator("canvas")).toHaveAttribute("data-phase", "stable");
  await page.getByRole("button", { name: /Collapse portal/ }).click();
  await expect(page.locator("canvas")).toHaveAttribute("data-phase", "closed");
});
