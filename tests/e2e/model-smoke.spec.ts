import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";
test("real MediaPipe runtime processes a synthetic camera stream in a worker", async ({
  page,
  context,
}, testInfo) => {
  test.skip(
    process.env.AETHER_MODEL_SMOKE !== "1",
    "Requires public model/runtime downloads; run explicitly.",
  );
  test.setTimeout(90000);
  await context.grantPermissions(["camera"]);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-aether-ready",
    "true",
  );
  await page.getByRole("button", { name: "Enter AETHER", exact: true }).click();
  await page
    .getByRole("button", { name: "Enable camera", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Stop camera", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator("dd")
      .filter({ hasText: /Worker|Main thread fallback/ })
      .first(),
  ).toBeVisible({ timeout: 65000 });
  console.log(await page.locator("dl[data-backend]").innerText());
  await expect(page.locator("dd").filter({ hasText: /^Worker$/ })).toBeVisible({
    timeout: 1000,
  });
  await expect(
    page.getByRole("img", { name: "0 tracked hands" }),
  ).toBeVisible();
  const collect = async () => {
    const values = [];
    let previous = "";
    for (let i = 0; i < 12; i++) {
      await expect
        .poll(() =>
          page.locator("dl[data-backend]").getAttribute("data-sample-at"),
        )
        .not.toBe(previous);
      previous = (await page
        .locator("dl[data-backend]")
        .getAttribute("data-sample-at"))!;
      values.push(
        await page.locator("dl[data-backend]").evaluate((el) => ({
          inferenceMs: Number(el.dataset.inferenceMs),
          blockingMs: Number(el.dataset.blockingMs),
        })),
      );
    }
    return values;
  };
  const worker = await collect();
  await page.getByRole("button", { name: "Stop camera", exact: true }).click();
  await page
    .getByRole("button", { name: "Open settings", exact: true })
    .click();
  await page.getByLabel("Prefer worker tracking (restart camera)").uncheck();
  await page
    .getByRole("button", { name: "Apply settings", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Enable camera", exact: true })
    .click();
  await expect(page.locator("dl[data-backend]")).toHaveAttribute(
    "data-backend",
    "Main thread fallback",
    { timeout: 30000 },
  );
  const main = await collect();
  const result = {
    scenario:
      "Chromium synthetic camera, 1280x720 request; twelve fresh inference results per backend. Not physical camera acceptance.",
    worker,
    main,
  };
  await writeFile(
    "test-results/tracking-timing.json",
    JSON.stringify(result, null, 2),
  );
  await testInfo.attach("tracking-timing", {
    body: JSON.stringify(result),
    contentType: "application/json",
  });
  await page.getByRole("button", { name: "Stop camera", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Enable camera", exact: true }),
  ).toBeVisible();
  expect(
    await page.locator("video").evaluate((v: HTMLVideoElement) => v.srcObject),
  ).toBeNull();
});
