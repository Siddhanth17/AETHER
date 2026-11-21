import { test, expect } from "@playwright/test";
test("camera selection, mirroring, disconnection and cleanup are recoverable", async ({
  page,
  context,
}) => {
  await page.addInitScript(() => {
    const state = window as unknown as {
      streams: MediaStream[];
      requests: string[];
    };
    state.streams = [];
    state.requests = [];
    Object.defineProperty(navigator.mediaDevices, "enumerateDevices", {
      value: async () => [
        { kind: "videoinput", deviceId: "a", label: "Fixture A" },
        { kind: "videoinput", deviceId: "b", label: "Fixture B" },
      ],
    });
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      value: async (constraints: MediaStreamConstraints) => {
        const id =
          (
            (constraints.video as MediaTrackConstraints).deviceId as
              ConstrainDOMStringParameters | undefined
          )?.exact ?? "a";
        state.requests.push(String(id));
        const c = document.createElement("canvas");
        c.width = 640;
        c.height = 360;
        c.getContext("2d")!.fillRect(0, 0, 640, 360);
        const stream = c.captureStream(15);
        state.streams.push(stream);
        return stream;
      },
    });
  });
  await context.route("**/tracking-worker.js", (r) =>
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
  expect(
    await page.evaluate(
      () => (window as unknown as { requests: string[] }).requests,
    ),
  ).toEqual([]);
  await page.getByRole("button", { name: "Enter AETHER", exact: true }).click();
  await page
    .getByRole("button", { name: "Enable camera", exact: true })
    .click();
  await expect(page.locator("dl[data-backend]")).toHaveAttribute(
    "data-backend",
    "Worker",
  );
  await page
    .getByRole("button", { name: "Open settings", exact: true })
    .click();
  await page.getByLabel("Camera", { exact: true }).selectOption("b");
  await page.getByLabel("Mirror camera", { exact: true }).uncheck();
  await page
    .getByRole("button", { name: "Apply settings", exact: true })
    .click();
  await expect(page.locator("video")).not.toHaveClass(/mirrored/);
  await page.getByRole("button", { name: "Stop camera", exact: true }).click();
  await page
    .getByRole("button", { name: "Enable camera", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { requests: string[] }).requests,
      ),
    )
    .toEqual(["a", "b"]);
  expect(
    await page.evaluate(() =>
      (window as unknown as { streams: MediaStream[] }).streams[0]
        .getTracks()
        .every((t) => t.readyState === "ended"),
    ),
  ).toBe(true);
  await page.evaluate(() =>
    (window as unknown as { streams: MediaStream[] }).streams[1]
      .getVideoTracks()[0]
      .dispatchEvent(new Event("ended")),
  );
  await expect(
    page.getByRole("button", { name: "Enable camera", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Camera disconnected");
  expect(
    await page.locator("video").evaluate((v: HTMLVideoElement) => v.srcObject),
  ).toBeNull();
});
test("unavailable camera does not leave an active stream or disabled control", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      value: () =>
        Promise.reject(
          new DOMException("No camera available", "NotFoundError"),
        ),
    }),
  );
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-aether-ready",
    "true",
  );
  await page.getByRole("button", { name: "Enter AETHER", exact: true }).click();
  await page
    .getByRole("button", { name: "Enable camera", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("No camera available");
  await expect(
    page.getByRole("button", { name: "Enable camera", exact: true }),
  ).toBeEnabled();
});
test("playback startup failure releases the granted camera stream", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["camera"]);
  await page.addInitScript(() => {
    const original = navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices,
    );
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      const stream = await original(constraints);
      (window as unknown as { grantedStream: MediaStream }).grantedStream =
        stream;
      return stream;
    };
    HTMLMediaElement.prototype.play = () =>
      Promise.reject(
        new DOMException("Playback unavailable", "NotSupportedError"),
      );
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-aether-ready",
    "true",
  );
  await page.getByRole("button", { name: "Enter AETHER", exact: true }).click();
  await page
    .getByRole("button", { name: "Enable camera", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Playback unavailable");
  expect(
    await page.evaluate(() =>
      (window as unknown as { grantedStream: MediaStream }).grantedStream
        .getTracks()
        .every((t) => t.readyState === "ended"),
    ),
  ).toBe(true);
  expect(
    await page.locator("video").evaluate((v: HTMLVideoElement) => v.srcObject),
  ).toBeNull();
});
