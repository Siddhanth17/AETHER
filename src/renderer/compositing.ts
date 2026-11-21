import * as T from "three";
import type { Point } from "../core/portal";
export function containRect(sw: number, sh: number, dw: number, dh: number) {
  const scale = Math.min(dw / sw, dh / sh);
  return {
    x: (dw - sw * scale) / 2,
    y: (dh - sh * scale) / 2,
    width: sw * scale,
    height: sh * scale,
  };
}
export function coverRect(sw: number, sh: number, dw: number, dh: number) {
  const scale = Math.max(dw / sw, dh / sh);
  return {
    x: (dw - sw * scale) / 2,
    y: (dh - sh * scale) / 2,
    width: sw * scale,
    height: sh * scale,
  };
}
export function screenToPortalPlane(point: Point, aspect: number, viewX = 0) {
  const camera = new T.PerspectiveCamera(40, aspect, 0.1, 100);
  camera.position.set(viewX, 0, 8.4);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  const ray = new T.Raycaster();
  ray.setFromCamera(new T.Vector2(point.x * 2 - 1, 1 - point.y * 2), camera);
  const hit = ray.ray.intersectPlane(
    new T.Plane(new T.Vector3(0, 0, 1), 0),
    new T.Vector3(),
  );
  return hit ?? new T.Vector3();
}
