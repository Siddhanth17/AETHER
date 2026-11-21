import type { Quality } from "../core/portal";
export function nextFrameDeadline(now: number, hz = 60) {
  const interval = 1000 / hz;
  return (Math.floor(now / interval) + 1) * interval;
}
export const qualities: Quality[] = ["Low", "Balanced", "High", "Cinematic"];
export const budgets: Record<
  Quality,
  { dpr: number; target: number; particles: number }
> = {
  Low: { dpr: 1, target: 512, particles: 180 },
  Balanced: { dpr: 1.5, target: 1024, particles: 550 },
  High: { dpr: 2, target: 1536, particles: 1200 },
  Cinematic: { dpr: 2, target: 1920, particles: 1800 },
};
export interface RenderMetrics {
  frameMs: number;
  trend: number[];
  width: number;
  height: number;
  particles: number;
  calls: number;
  triangles: number;
  geometries: number;
  textures: number;
  targetWidth: number;
  targetHeight: number;
  backend: "WebGL2";
}
export class AdaptiveQuality {
  private slow = 0;
  private fast = 0;
  private changed = 0;
  private samples = 0;
  update(
    frameMs: number,
    now: number,
    current: Quality,
    ceiling: Quality,
  ): Quality {
    const level = qualities.indexOf(current),
      max = qualities.indexOf(ceiling);
    if (level > max) return ceiling;
    this.samples++;
    if (this.samples < 5 || now - this.changed < 12000 || frameMs > 150)
      return current;
    this.slow = frameMs > 25 ? this.slow + 1 : 0;
    this.fast = frameMs < 18 ? this.fast + 1 : 0;
    if (this.slow >= 5 && level > 0) {
      this.slow = 0;
      this.fast = 0;
      this.changed = now;
      return qualities[level - 1];
    }
    if (this.fast >= 15 && level < max) {
      this.slow = 0;
      this.fast = 0;
      this.changed = now;
      return qualities[level + 1];
    }
    return current;
  }
}
