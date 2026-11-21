import { describe, it, expect } from "vitest";
import { GestureEngine, cameraToScreen } from "./gestures";
import type { Point } from "../core/portal";
function hand(pinch = false, fist = false): Point[] {
  const h = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.6 }));
  h[0] = { x: 0.5, y: 0.9 };
  h[9] = { x: 0.5, y: 0.65 };
  for (const i of [8, 12, 16, 20]) {
    h[i - 2] = { x: 0.5 + (i - 8) * 0.01, y: 0.6 };
    h[i] = { x: 0.5 + (i - 8) * 0.01, y: fist ? 0.72 : 0.3 };
  }
  h[4] = { x: pinch ? h[8].x + 0.03 : 0.2, y: pinch ? h[8].y : 0.6 };
  return h;
}
describe("gesture engine synthetic landmark fixtures", () => {
  it("requires a stable open palm, pinch and fist", () => {
    for (const [fixture, expected] of [
      [hand(), "Open palm"],
      [hand(true), "Pinch"],
      [hand(false, true), "Fist"],
    ] as const) {
      const engine = new GestureEngine();
      expect(engine.update([fixture], 100).gesture).toBe("Move");
      expect(engine.update([fixture], 300).gesture).toBe(expected);
    }
  });
  it("rejects a one-frame pinch and resets after tracking loss", () => {
    const engine = new GestureEngine();
    engine.update([hand()], 100);
    engine.update([hand()], 300);
    expect(engine.update([hand(true)], 350).gesture).toBe("Move");
    expect(engine.update([], 400).gesture).toBe("No hands");
    expect(engine.update([hand(true)], 450).gesture).toBe("Move");
    expect(engine.update([hand(true)], 650).gesture).toBe("Pinch");
  });
  it("uses separate pinch entry and release thresholds", () => {
    const engine = new GestureEngine();
    engine.update([hand(true)], 100);
    engine.update([hand(true)], 300);
    const h = hand(true);
    h[4].x = h[8].x + 0.1;
    expect(engine.update([h], 400).gesture).toBe("Pinch");
    h[4].x = h[8].x + 0.14;
    expect(engine.update([h], 500).gesture).toBe("Move");
  });
  it("rejects malformed landmarks and clears old temporal evidence", () => {
    const engine = new GestureEngine();
    expect(engine.update([[{ x: NaN, y: 0 }]], 100).gesture).toBe("No hands");
    engine.update([hand()], 100);
    engine.update([hand()], 300);
    expect(engine.update([hand(true)], 1000).gesture).toBe("Move");
  });
  it("maps mirrored and cropped camera coordinates independently", () => {
    expect(
      cameraToScreen(
        { x: 0.2, y: 0.5 },
        { width: 1920, height: 1080 },
        { width: 1920, height: 1080 },
        true,
      ),
    ).toEqual({ x: 0.8, y: 0.5 });
    expect(
      cameraToScreen(
        { x: 0.5, y: 0.5 },
        { width: 1920, height: 1080 },
        { width: 400, height: 800 },
        false,
      ),
    ).toEqual({ x: 0.5, y: 0.5 });
    expect(
      cameraToScreen(
        { x: 0, y: 0.5 },
        { width: 1920, height: 1080 },
        { width: 400, height: 800 },
        false,
      ).x,
    ).toBeLessThan(0);
  });
});
