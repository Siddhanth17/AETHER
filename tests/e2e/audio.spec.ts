import { test, expect } from "@playwright/test";
test("audio is opt-in, reusable, muted and closed on workspace exit", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const state = window as unknown as Window & { __audioContexts: AudioContext[] };
    state.__audioContexts = [];
    const Native = AudioContext;
    window.AudioContext = class extends Native {
      constructor(options?: AudioContextOptions) {
        super(options);
        state.__audioContexts.push(this);
      }
    };
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-aether-ready",
    "true",
  );
  await page.getByRole("button", { name: "Enter AETHER", exact: true }).click();
  const contexts = () =>
    page.evaluate(() =>
      (
        window as unknown as Window & { __audioContexts: AudioContext[] }
      ).__audioContexts.map((c) => c.state),
    );
  expect(await contexts()).toEqual([]);
  await page
    .getByRole("button", { name: "Enable portal audio", exact: true })
    .click();
  await expect(page.locator("main")).toHaveAttribute("data-audio", "enabled");
  expect(await contexts()).toEqual(["running"]);
  await page.getByRole("button", { name: /Collapse portal/ }).click();
  await page.getByRole("button", { name: /Open portal/ }).click();
  await page
    .getByRole("button", { name: "Mute portal audio", exact: true })
    .click();
  await expect(page.locator("main")).toHaveAttribute("data-audio", "muted");
  await page
    .getByRole("button", { name: "Enable portal audio", exact: true })
    .click();
  expect(await contexts()).toHaveLength(1);
  await page.getByRole("link", { name: "AETHER", exact: true }).click();
  await expect.poll(contexts).toEqual(["closed"]);
});
test("unsupported audio reports a recoverable error", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "AudioContext", { value: undefined });
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-aether-ready",
    "true",
  );
  await page.getByRole("button", { name: "Enter AETHER", exact: true }).click();
  await page
    .getByRole("button", { name: "Enable portal audio", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    "Audio could not start in this browser.",
  );
  await expect(page.locator("main")).toHaveAttribute("data-audio", "muted");
});

