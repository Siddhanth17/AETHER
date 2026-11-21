import { describe, it, expect } from "vitest";
import { clamp, isCircle } from "./portal";
describe("portal interaction", () => {
  it("bounds scale", () => {
    expect(clamp(8, 0.4, 1.8)).toBe(1.8);
    expect(clamp(-1, 0.4, 1.8)).toBe(0.4);
  });
  it("recognizes a deliberately closed circle", () => {
    expect(
      isCircle(
        Array.from({ length: 65 }, (_, i) => ({
          x: 0.5 + 0.2 * Math.cos((i / 64) * Math.PI * 2),
          y: 0.5 + 0.2 * Math.sin((i / 64) * Math.PI * 2),
        })),
      ),
    ).toBe(true);
  });
  it("rejects lines, tiny motion and incomplete arcs", () => {
    expect(
      isCircle(Array.from({ length: 40 }, (_, i) => ({ x: i / 40, y: 0.5 }))),
    ).toBe(false);
    expect(
      isCircle(
        Array.from({ length: 40 }, (_, i) => ({
          x: 0.5 + 0.01 * Math.cos(i),
          y: 0.5 + 0.01 * Math.sin(i),
        })),
      ),
    ).toBe(false);
    expect(isCircle([])).toBe(false);
  });
});
