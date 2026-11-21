import { describe, it, expect } from "vitest";
import * as T from "three";
import { linkPortalCamera, targetSize } from "./portalCamera";
describe("linked portal perspective", () => {
  const setup = () => {
    const viewer = new T.PerspectiveCamera(40, 16 / 9, 0.1, 100);
    viewer.position.z = 8;
    const source = new T.Object3D(),
      exit = new T.Object3D();
    exit.rotation.y = Math.PI;
    exit.position.z = 3;
    const target = new T.PerspectiveCamera();
    return { viewer, source, exit, target };
  };
  it("matches projection and preserves viewer translation across the opening", () => {
    const s = setup();
    s.viewer.position.x = 1;
    linkPortalCamera(s.viewer, s.source, s.exit, s.target);
    expect(s.target.position.x).toBeCloseTo(1);
    expect(s.target.position.z).toBeCloseTo(11);
    expect(s.target.projectionMatrix.elements).toEqual(
      s.viewer.projectionMatrix.elements,
    );
  });
  it("aperture scaling does not distort destination perspective", () => {
    const s = setup();
    linkPortalCamera(s.viewer, s.source, s.exit, s.target);
    const before = s.target.matrixWorld.clone();
    s.source.scale.setScalar(1.8);
    linkPortalCamera(s.viewer, s.source, s.exit, s.target);
    s.target.matrixWorld.elements.forEach((v, i) =>
      expect(v).toBeCloseTo(before.elements[i]),
    );
  });
  it("rejects back-facing and coplanar viewers and clips the entrance side", () => {
    const s = setup();
    let result = linkPortalCamera(s.viewer, s.source, s.exit, s.target);
    expect(result.front).toBe(true);
    expect(
      result.plane.distanceToPoint(new T.Vector3(0, 0, 0)),
    ).toBeGreaterThan(0);
    expect(result.plane.distanceToPoint(new T.Vector3(0, 0, 4))).toBeLessThan(
      0,
    );
    s.viewer.position.z = -1;
    result = linkPortalCamera(s.viewer, s.source, s.exit, s.target);
    expect(result.front).toBe(false);
    s.viewer.position.z = 0;
    expect(linkPortalCamera(s.viewer, s.source, s.exit, s.target).front).toBe(
      false,
    );
  });
  it("preserves target aspect within rounding at portrait and desktop sizes", () => {
    for (const [w, h] of [
      [1920, 1080],
      [390, 844],
    ]) {
      const size = targetSize(w, h, 1024);
      expect(Math.max(size.width, size.height)).toBe(1024);
      expect(size.width / size.height).toBeCloseTo(w / h, 2);
    }
  });
});
