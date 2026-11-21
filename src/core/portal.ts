export type Destination = "Sanctuary" | "Glacier" | "Ember";
export type Quality = "Low" | "Balanced" | "High";
export interface PortalState {
  open: boolean;
  scale: number;
  destination: Destination;
  color: string;
  intensity: number;
  x: number;
  y: number;
  viewX?: number;
  yaw?: number;
}
export const initialPortal: PortalState = {
  open: true,
  scale: 1,
  destination: "Sanctuary",
  color: "#b6a1ff",
  intensity: 1,
  x: 0,
  y: 0,
};
export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
export type Point = { x: number; y: number };
export function isCircle(points: Point[]): boolean {
  if (points.length < 24) return false;
  const center = points.reduce(
    (c, p) => ({ x: c.x + p.x / points.length, y: c.y + p.y / points.length }),
    { x: 0, y: 0 },
  );
  const radii = points.map((p) => Math.hypot(p.x - center.x, p.y - center.y));
  const mean = radii.reduce((a, b) => a + b, 0) / radii.length;
  if (
    mean < 0.06 ||
    Math.hypot(points[0].x - points.at(-1)!.x, points[0].y - points.at(-1)!.y) >
      mean * 0.65
  )
    return false;
  const variance =
    radii.reduce((a, r) => a + (r - mean) ** 2, 0) / radii.length;
  let turn = 0;
  for (let i = 1; i < points.length; i++) {
    const a = Math.atan2(
      points[i - 1].y - center.y,
      points[i - 1].x - center.x,
    );
    const b = Math.atan2(points[i].y - center.y, points[i].x - center.x);
    turn += Math.atan2(Math.sin(b - a), Math.cos(b - a));
  }
  return Math.sqrt(variance) / mean < 0.28 && Math.abs(turn) > 5.1;
}
