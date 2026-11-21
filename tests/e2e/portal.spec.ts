import { test, expect } from "@playwright/test";
test("portal controls, preset round-trip and explicit recording export", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute(
    "data-aether-ready",
    "true",
  );
  await expect(
    page.getByRole("heading", { name: "Reality is yours to rewrite." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Enter AETHER", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Enable camera", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Glacier", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Glacier", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Save preset", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("aether-portal")!).destination,
      ),
    )
    .toBe("Glacier");
  await page.getByRole("button", { name: "Ember", exact: true }).click();
  await page.locator("#scale").fill("1.5");
  await page.getByRole("button", { name: "Load preset", exact: true }).click();
  await expect(page.locator("#scale")).toHaveValue("1");
  await expect(
    page.getByRole("button", { name: "Glacier", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /Collapse portal/ }).click();
  await expect(page.getByRole("button", { name: /Open portal/ })).toBeVisible();
  await page.locator(".interaction").click({ position: { x: 500, y: 500 } });
  await page.keyboard.press("Space");
  await expect(
    page.getByRole("button", { name: /Collapse portal/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Open settings", exact: true })
    .click();
  await page.getByLabel("Recording resolution").selectOption("720");
  await page
    .getByRole("button", { name: "Apply settings", exact: true })
    .click();
  await page.getByRole("button", { name: "Record scene", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Stop & export", exact: true }),
  ).toBeVisible();
  await page.waitForTimeout(1500);
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Stop & export", exact: true })
    .click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/\.webm$/);
  await file.saveAs("test-results/recording.webm");
  expect(await file.failure()).toBeNull();
  expect(errors).toEqual([]);
});
test("quality persists and camera denial stays recoverable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      value: () =>
        Promise.reject(
          new DOMException("Permission denied by test", "NotAllowedError"),
        ),
    });
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute(
    "data-aether-ready",
    "true",
  );
  await page
    .getByRole("button", { name: "Open settings", exact: true })
    .click();
  await page.getByLabel("Render quality").selectOption("Low");
  await page
    .getByRole("button", { name: "Apply settings", exact: true })
    .click();
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute(
    "data-aether-ready",
    "true",
  );
  await page
    .getByRole("button", { name: "Open settings", exact: true })
    .click();
  await expect(page.getByLabel("Render quality")).toHaveValue("Low");
  await page
    .getByRole("button", { name: "Apply settings", exact: true })
    .click();
  await page.getByRole("button", { name: "Enter AETHER", exact: true }).click();
  await page
    .getByRole("button", { name: "Enable camera", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    "Permission denied by test",
  );
  await expect(
    page.getByRole("button", { name: "Enable camera", exact: true }),
  ).toBeEnabled();
});
for (const size of [
  { width: 1920, height: 1080 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 390, height: 844 },
])
  test(`layout ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute(
      "data-aether-ready",
      "true",
    );
    await expect(page.locator("canvas")).toBeVisible();
    await expect(page.locator("[data-intro]")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/landing-${size.width}.png`,
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Enter AETHER", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Portal ritual", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/studio-${size.width}.png`,
      fullPage: true,
    });
  });
