import { test, expect } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
for (const height of [720, 1080])
  test(`real ${height}p composite export has correct dimensions and plays`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.addInitScript(() => {
      Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
        value: async () => {
          const c = document.createElement("canvas");
          c.width = 960;
          c.height = 540;
          const ctx = c.getContext("2d")!;
          ctx.fillStyle = "#384966";
          ctx.fillRect(0, 0, 960, 540);
          ctx.fillStyle = "#efc88b";
          ctx.fillRect(80, 200, 120, 100);
          const stream = c.captureStream(15);
          (window as unknown as { __camera: MediaStream }).__camera = stream;
          return stream;
        },
      });
    });
    await page.route("**/tracking-worker.js", (r) =>
      r.fulfill({
        contentType: "text/javascript",
        body: `self.onmessage=({data})=>{if(data.type==='init')self.postMessage({type:'ready'});else{data.bitmap.close();self.postMessage({type:'result',result:{landmarks:[],handedness:[]},inferenceMs:1});}}`,
      }),
    );
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute(
      "data-aether-ready",
      "true",
    );
    await page
      .getByRole("button", { name: "Enter AETHER", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Enable camera", exact: true })
      .click();
    await expect(page.locator("dl[data-backend]")).toHaveAttribute(
      "data-backend",
      "Worker",
    );
    await page
      .getByRole("button", { name: "Enable portal audio", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Open settings", exact: true })
      .click();
    await page
      .getByLabel("Recording resolution", { exact: true })
      .selectOption(String(height));
    if (height === 1080)
      await page
        .getByLabel("Include synthesized portal audio (no microphone)")
        .check();
    await page
      .getByRole("button", { name: "Apply settings", exact: true })
      .click();
    await expect(page.locator("canvas")).toHaveAttribute(
      "data-phase",
      "stable",
    );
    await page
      .getByRole("button", { name: "Record scene", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Stop & export", exact: true }),
    ).toBeVisible();
    await page.waitForTimeout(2200);
    const downloaded = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Stop & export", exact: true })
      .click();
    const file = await downloaded;
    const path = `test-results/export-${height}.webm`;
    await file.saveAs(path);
    const bytes = await readFile(path);
    const hasAudio = bytes.includes(Buffer.from("A_OPUS"));
    expect(hasAudio).toBe(height === 1080);
    expect(bytes.length).toBeGreaterThan(1000);
    await page
      .getByRole("button", { name: "Stop camera", exact: true })
      .click();
    expect(
      await page.evaluate(() =>
        (window as unknown as { __camera: MediaStream }).__camera
          .getTracks()
          .every((t) => t.readyState === "ended"),
      ),
    ).toBe(true);
    await page.route("**/__test_export.webm", (r) =>
      r.fulfill({ path, contentType: "video/webm" }),
    );
    const playback = await page.evaluate(async () => {
      const video = document.createElement("video");
      video.muted = true;
      video.controls = true;
      video.style.cssText =
        "position:fixed;inset:0;width:100%;height:100%;z-index:999;background:black";
      document.body.appendChild(video);
      video.src = "/__test_export.webm";
      await new Promise<void>((resolve, reject) => {
        video.onloadeddata = () => resolve();
        video.onerror = () => reject(new Error("Export playback failed"));
      });
      await video.play();
      await new Promise<void>((resolve) =>
        video.requestVideoFrameCallback(() =>
          video.requestVideoFrameCallback(() => resolve()),
        ),
      );
      return {
        width: video.videoWidth,
        height: video.videoHeight,
        time: video.currentTime,
        decoded: video.getVideoPlaybackQuality().totalVideoFrames,
      };
    });
    expect(playback.width).toBe((height * 16) / 9);
    expect(playback.height).toBe(height);
    expect(playback.decoded).toBeGreaterThan(0);
    await page.screenshot({ path: `test-results/playback-${height}.png` });
    await writeFile(
      `test-results/playback-${height}.json`,
      JSON.stringify(
        {
          bytes: bytes.length,
          ...playback,
          camera: "Synthetic canvas stream",
          audioRequested: height === 1080,
          audioTrackEncoded: hasAudio,
        },
        null,
        2,
      ),
    );
    expect(errors).toEqual([]);
  });
test("unsupported encoder is reported and recording remains stopped", async ({
  page,
}) => {
  await page.addInitScript(() => {
    MediaRecorder.isTypeSupported = () => false;
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-aether-ready",
    "true",
  );
  await page.getByRole("button", { name: "Enter AETHER", exact: true }).click();
  await page.getByRole("button", { name: "Record scene", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText(
    "No supported WebM encoder.",
  );
  await expect(
    page.getByRole("button", { name: "Record scene", exact: true }),
  ).toBeVisible();
});
test("encoder runtime error cleans up and returns to stopped state", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const Native = MediaRecorder;
    window.MediaRecorder = class extends Native {
      start(timeslice?: number) {
        super.start(timeslice);
        setTimeout(() => this.dispatchEvent(new Event("error")), 50);
      }
    };
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-aether-ready",
    "true",
  );
  await page.getByRole("button", { name: "Enter AETHER", exact: true }).click();
  await page.getByRole("button", { name: "Record scene", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText(
    "Video encoder failed. Try a lower resolution.",
  );
  await expect(
    page.getByRole("button", { name: "Record scene", exact: true }),
  ).toBeVisible();
});
