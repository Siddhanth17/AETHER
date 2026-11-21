import { test, expect } from "@playwright/test";
import { gestureFixture } from "../fixtures/landmarks";
import { installSyntheticCamera } from "../fixtures/camera";
test("synthetic camera journey calibrates, opens, scales, changes world and exports", async ({
  page,
  context,
}) => {
  test.setTimeout(90000);
  await installSyntheticCamera(page);
  await context.grantPermissions(["camera"]);
  let stage = "empty",
    index = 0;
  const setStage = (value: string) => {
    stage = value;
    index = 0;
  };
  await context.route("**/__gestureFixture", (r) =>
    r.fulfill({
      contentType: "application/json",
      body: JSON.stringify(gestureFixture(stage, index++)),
    }),
  );
  await context.route("**/tracking-worker.js", (r) =>
    r.fulfill({
      contentType: "text/javascript",
      body: `self.onmessage=async({data})=>{if(data.type==='init')self.postMessage({type:'ready'});else{try{const result=await(await fetch('/__gestureFixture')).json();self.postMessage({type:'result',result,inferenceMs:1});}finally{data.bitmap.close();}}}`,
    }),
  );
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-aether-ready",
    "true",
  );
  await page.getByRole("button", { name: "Enter AETHER", exact: true }).click();
  await page
    .getByRole("button", { name: "Enable camera", exact: true })
    .click();
  await expect(page.locator("dl[data-backend]")).toHaveAttribute(
    "data-backend",
    "Worker",
  );
  setStage("palm");
  await page
    .getByRole("button", { name: "Calibrate hands", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Confirm your preferred hand below.",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Confirm hand", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Hold a comfortable pinch.",
      exact: true,
    }),
  ).toBeVisible();
  setStage("pinch");
  await expect(
    page.getByRole("heading", { name: "Hold a closed fist.", exact: true }),
  ).toBeVisible();
  setStage("fist");
  await expect(
    page.getByRole("heading", {
      name: "Draw one deliberate circle.",
      exact: true,
    }),
  ).toBeVisible();
  setStage("circle");
  await expect(
    page.getByRole("heading", {
      name: "Move your index finger around your comfortable reach.",
      exact: true,
    }),
  ).toBeVisible({ timeout: 12000 });
  setStage("reach");
  await expect(
    page.getByRole("heading", {
      name: "Show two open hands; move them together and apart.",
      exact: true,
    }),
  ).toBeVisible({ timeout: 10000 });
  setStage("scale");
  await expect(
    page.getByRole("button", { name: "Save calibration", exact: true }),
  ).toBeVisible({ timeout: 10000 });
  await page
    .getByRole("button", { name: "Save calibration", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("aether-calibration") ?? "null")
            ?.version,
      ),
    )
    .toBe(1);
  setStage("empty");
  await expect(page.locator("dl").first()).toContainText("No hands");
  await page.getByRole("button", { name: /Collapse portal/ }).click();
  await expect(page.locator("canvas")).toHaveAttribute("data-phase", "closed");
  setStage("circle");
  await expect(page.locator("canvas")).toHaveAttribute("data-phase", "stable", {
    timeout: 12000,
  });
  setStage("far");
  await expect
    .poll(async () => Number(await page.locator("#scale").inputValue()))
    .toBeGreaterThan(1.2);
  await page.getByRole("button", { name: "Glacier", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Glacier", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  setStage("fist");
  await expect(page.locator("canvas")).toHaveAttribute("data-phase", "closed");
  await page
    .getByRole("button", { name: "Open settings", exact: true })
    .click();
  await page
    .getByLabel("Recording resolution", { exact: true })
    .selectOption("720");
  await page
    .getByRole("button", { name: "Apply settings", exact: true })
    .click();
  await page.getByRole("button", { name: "Record scene", exact: true }).click();
  await page.waitForTimeout(1200);
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Stop & export", exact: true })
    .click();
  expect((await download).suggestedFilename()).toMatch(/720p.webm$/);
  await page.getByRole("button", { name: "Stop camera", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute(
    "data-aether-ready",
    "true",
  );
  await page.getByRole("button", { name: "Enter AETHER", exact: true }).click();
  await expect(
    page.getByText("Calibration saved", { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("WebGL context loss is recoverable without duplicate canvases", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-aether-ready",
    "true",
  );
  await page.getByRole("button", { name: "Enter AETHER", exact: true }).click();
  await expect(page.locator("canvas")).toHaveAttribute("data-phase", "stable");
  await page
    .locator("canvas")
    .evaluate((c: HTMLCanvasElement) =>
      c.getContext("webgl2")!.getExtension("WEBGL_lose_context")!.loseContext(),
    );
  await page
    .getByRole("button", { name: "Restore graphics", exact: true })
    .click();
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.locator("canvas")).toHaveAttribute("data-phase", "stable");
});
