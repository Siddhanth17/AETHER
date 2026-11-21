import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";
test("portal mask and backface pixels are exact; restored image stays within tolerance", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-aether-ready",
    "true",
  );
  await page.getByRole("button", { name: "Enter AETHER", exact: true }).click();
  const canvas = page.locator("canvas");
  await expect(canvas).toHaveAttribute("data-phase", "stable");
  await expect(canvas).toHaveJSProperty("width", 1440);
  await expect(canvas).toHaveJSProperty("height", 764);
  const settle = () =>
    page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
  const alpha = (center: boolean) =>
    canvas.evaluate((el: HTMLCanvasElement, center) => {
      const gl = el.getContext("webgl2")!,
        pixel = new Uint8Array(4);
      gl.readPixels(
        center ? Math.floor(el.width / 2) : 4,
        center ? Math.floor(el.height / 2) : 4,
        1,
        1,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        pixel,
      );
      return pixel[3];
    }, center);
  await expect.poll(() => alpha(true)).toBe(255);
  expect(await alpha(false)).toBe(0);
  await settle();
  await canvas.evaluate((el: HTMLCanvasElement) => {
    const gl = el.getContext("webgl2")!,
      pixels = new Uint8Array(el.width * el.height * 4);
    gl.readPixels(0, 0, el.width, el.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    (el as HTMLCanvasElement & { __reference: Uint8Array }).__reference =
      pixels;
  });
  await canvas.screenshot({ path: "test-results/visual-before.png" });
  await page.locator("#portal-yaw").fill("3.14");
  await expect(canvas).toHaveAttribute("data-portal-front", "false");
  await expect.poll(() => alpha(true)).toBe(0);
  await page.getByRole("button", { name: "Reset ritual", exact: true }).click();
  await expect(canvas).toHaveAttribute("data-yaw", "0");
  await expect.poll(() => alpha(true)).toBe(255);
  await settle();
  const difference = await canvas.evaluate((el: HTMLCanvasElement) => {
    const old = (el as HTMLCanvasElement & { __reference: Uint8Array })
        .__reference,
      gl = el.getContext("webgl2")!,
      pixels = new Uint8Array(el.width * el.height * 4);
    gl.readPixels(0, 0, el.width, el.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    let total = 0,
      large = 0;
    for (let i = 0; i < pixels.length; i++) {
      const delta = Math.abs(pixels[i] - old[i]);
      total += delta;
      if (delta > 8) large++;
    }
    return {
      sameDimensions: old.length === pixels.length,
      meanAbsoluteChannelDifference: total / pixels.length,
      largeChangeFraction: large / pixels.length,
    };
  });
  console.log("visual difference", difference);
  await writeFile(
    "test-results/visual-difference.json",
    JSON.stringify(difference, null, 2),
  );
  expect(difference.sameDimensions).toBe(true);
  expect(difference.meanAbsoluteChannelDifference).toBeLessThan(0.25);
  expect(difference.largeChangeFraction).toBeLessThan(0.005);
  await canvas.screenshot({ path: "test-results/portal-reduced-motion.png" });
});
