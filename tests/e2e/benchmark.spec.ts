import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";
test("profiles eight portal scenarios with real inference on a synthetic camera", async ({
  page,
  context,
}) => {
  test.skip(
    process.env.AETHER_BENCHMARK !== "1",
    "Explicit network-dependent local profiling run.",
  );
  test.setTimeout(180000);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await context.grantPermissions(["camera"]);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-aether-ready",
    "true",
  );
  const canvas = page.locator("canvas");
  const runs: Record<string, unknown>[] = [];
  const snapshot = async (name: string, wait = 1200) => {
    await page.waitForTimeout(wait);
    await expect(canvas).toHaveAttribute("data-metrics", /WebGL2/);
    runs.push({
      name,
      phase: await canvas.getAttribute("data-phase"),
      metrics: JSON.parse((await canvas.getAttribute("data-metrics"))!),
      tracking: (await page.locator("dl[data-backend]").count())
        ? {
            backend: await page
              .locator("dl[data-backend]")
              .getAttribute("data-backend"),
            inferenceMs: await page
              .locator("dl[data-backend]")
              .getAttribute("data-inference-ms"),
            blockingMs: await page
              .locator("dl[data-backend]")
              .getAttribute("data-blocking-ms"),
          }
        : null,
    });
  };
  await expect(page.locator("[data-intro]")).toHaveCount(0);
  await snapshot("landing");
  await page.getByRole("button", { name: "Enter AETHER", exact: true }).click();
  await page.getByRole("button", { name: /Collapse portal/ }).click();
  await expect(canvas).toHaveAttribute("data-phase", "closed");
  await snapshot("studio-idle-closed");
  await page
    .getByRole("button", { name: "Enable camera", exact: true })
    .click();
  await expect(page.locator("dl[data-backend]")).toHaveAttribute(
    "data-backend",
    "Worker",
    { timeout: 65000 },
  );
  await snapshot("synthetic-webcam-real-worker");
  await page.getByRole("button", { name: /Open portal/ }).click();
  await expect(canvas).toHaveAttribute("data-phase", "stable");
  await snapshot("portal-open-with-tracking");
  await page.getByRole("button", { name: /Collapse portal/ }).click();
  await expect(canvas).toHaveAttribute("data-phase", "closed");
  await page.getByRole("button", { name: /Open portal/ }).click();
  await snapshot("portal-opening-with-tracking", 1100);
  await expect(canvas).toHaveAttribute("data-phase", "stable");
  await page.locator("#scale").fill("1.5");
  await snapshot("portal-scaling-with-tracking");
  await page
    .getByRole("button", { name: "Open settings", exact: true })
    .click();
  await page
    .getByLabel("Recording resolution", { exact: true })
    .selectOption("1080");
  await page
    .getByRole("button", { name: "Apply settings", exact: true })
    .click();
  await page.getByRole("button", { name: "Record scene", exact: true }).click();
  await snapshot("1080p-recording-with-tracking", 2200);
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Stop & export", exact: true })
    .click();
  await downloaded;
  await snapshot("tracking-and-portal-after-recording");
  const device = await canvas.evaluate((c: HTMLCanvasElement) => {
    const gl = c.getContext("webgl2")!,
      ext = gl.getExtension("WEBGL_debug_renderer_info");
    return ext
      ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
      : "Renderer name not exposed";
  });
  await page.getByRole("button", { name: "Stop camera", exact: true }).click();
  await writeFile(
    "test-results/scenario-benchmark.json",
    JSON.stringify(
      {
        viewport: { width: 1920, height: 1080 },
        device,
        browser:
          "Installed Chromium build 1254, Windows, Balanced; synthetic camera, actual MediaPipe CPU worker. Short overlapping render windows, not sustained target-device acceptance.",
        runs,
      },
      null,
      2,
    ),
  );
});
