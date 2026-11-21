import { it, expect } from "vitest";
import * as T from "three";
import { coverRect, containRect, screenToPortalPlane } from "./compositing";
it("preserves both camera cover and export contain aspect ratios", () => {
  expect(coverRect(1920, 1080, 400, 800).height).toBe(800);
  const r = containRect(1440, 764, 1920, 1080);
  expect(r.width / r.height).toBeCloseTo(1440 / 764);
  expect(r.y).toBeGreaterThan(0);
});
it("round-trips screen anchors through the actual viewer projection", () => {
  for (const aspect of [16 / 9, 390 / 844])
    for (const viewX of [0, 2]) {
      const camera = new T.PerspectiveCamera(40, aspect, 0.1, 100);
      camera.position.set(viewX, 0, 8.4);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
      for (const p of [
        { x: 0.2, y: 0.3 },
        { x: 0.8, y: 0.75 },
      ]) {
        const world = screenToPortalPlane(p, aspect, viewX).project(camera);
        expect((world.x + 1) / 2).toBeCloseTo(p.x);
        expect((1 - world.y) / 2).toBeCloseTo(p.y);
      }
    }
});
