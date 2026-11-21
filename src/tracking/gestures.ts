import { clamp, isCircle, type Point } from "../core/portal";
export type Gesture = "No hands" | "Move" | "Open palm" | "Pinch" | "Fist";
export interface GestureResult {
  gesture: Gesture;
  point: Point | null;
  span: number | null;
  circle: boolean;
}
export class GestureEngine {
  private active: Gesture = "Move";
  private candidate: Gesture = "Move";
  private since = 0;
  private last = 0;
  private lastCircle = -Infinity;
  private history: Point[] = [];
  private smooth: Point | null = null;
  update(hands: Point[][], now: number): GestureResult {
    const hand = hands[0];
    if (
      !hand ||
      hand.length !== 21 ||
      hands.some(
        (h) =>
          h.length !== 21 ||
          h.some((p) => !Number.isFinite(p.x) || !Number.isFinite(p.y)),
      )
    ) {
      this.reset();
      return { gesture: "No hands", point: null, span: null, circle: false };
    }
    if (now - this.last > 500) {
      this.reset();
    }
    this.last = now;
    const distance = (a: number, b: number) =>
      Math.hypot(hand[a].x - hand[b].x, hand[a].y - hand[b].y);
    const palm = Math.max(0.02, distance(0, 9));
    const pinch = distance(4, 8) / palm;
    const extended = [8, 12, 16, 20].filter(
      (i) => distance(i, 0) > distance(i - 2, 0) * 1.15,
    ).length;
    const proposed: Gesture =
      pinch < (this.active === "Pinch" ? 0.48 : 0.32)
        ? "Pinch"
        : extended === 4
          ? "Open palm"
          : extended === 0
            ? "Fist"
            : "Move";
    if (proposed !== this.candidate) {
      this.candidate = proposed;
      this.since = now;
    }
    if (now - this.since >= 180) this.active = this.candidate;
    const raw = { x: hand[8].x, y: hand[8].y };
    this.smooth = this.smooth
      ? {
          x: this.smooth.x * 0.65 + raw.x * 0.35,
          y: this.smooth.y * 0.65 + raw.y * 0.35,
        }
      : raw;
    this.history.push(raw);
    if (this.history.length > 70) this.history.shift();
    let circle = false;
    if (
      this.active !== "Pinch" &&
      now - this.lastCircle > 2500 &&
      isCircle(this.history)
    ) {
      circle = true;
      this.lastCircle = now;
      this.history = [];
    }
    const second = hands[1];
    const secondOpen =
      second &&
      [8, 12, 16, 20].every(
        (i) =>
          Math.hypot(second[i].x - second[0].x, second[i].y - second[0].y) >
          Math.hypot(
            second[i - 2].x - second[0].x,
            second[i - 2].y - second[0].y,
          ) *
            1.15,
      );
    return {
      gesture: proposed === this.active ? this.active : "Move",
      point: this.smooth,
      span:
        secondOpen && this.active === "Open palm"
          ? clamp(
              Math.hypot(hand[0].x - second[0].x, hand[0].y - second[0].y) * 3,
              0.4,
              1.8,
            )
          : null,
      circle,
    };
  }
  reset() {
    this.active = "Move";
    this.candidate = "Move";
    this.since = 0;
    this.last = 0;
    this.history = [];
    this.smooth = null;
  }
}
export function cameraToScreen(
  p: Point,
  source: { width: number; height: number },
  viewport: { width: number; height: number },
  mirror: boolean,
): Point {
  const ratio = Math.max(
    viewport.width / source.width,
    viewport.height / source.height,
  );
  const w = source.width * ratio,
    h = source.height * ratio;
  return {
    x:
      ((mirror ? 1 - p.x : p.x) * w - (w - viewport.width) / 2) /
      viewport.width,
    y: (p.y * h - (h - viewport.height) / 2) / viewport.height,
  };
}
