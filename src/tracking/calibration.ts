import { clamp, type Point } from "../core/portal";
export interface Calibration {
  version: 1;
  hand: "Left" | "Right";
  reach: { minX: number; maxX: number; minY: number; maxY: number };
  pinchEnter: number;
  pinchExit: number;
  scaleMin: number;
  scaleMax: number;
  completed: string;
}
export function validCalibration(value: unknown): value is Calibration {
  if (!value || typeof value !== "object") return false;
  const p = value as Calibration;
  return (
    p.version === 1 &&
    ["Left", "Right"].includes(p.hand) &&
    typeof p.completed === "string" &&
    !!p.reach &&
    [
      p.reach.minX,
      p.reach.maxX,
      p.reach.minY,
      p.reach.maxY,
      p.pinchEnter,
      p.pinchExit,
      p.scaleMin,
      p.scaleMax,
    ].every(Number.isFinite) &&
    p.reach.minX >= 0 &&
    p.reach.maxX <= 1 &&
    p.reach.minY >= 0 &&
    p.reach.maxY <= 1 &&
    p.reach.maxX - p.reach.minX >= 0.15 &&
    p.reach.maxY - p.reach.minY >= 0.15 &&
    p.pinchEnter >= 0.15 &&
    p.pinchEnter <= 0.5 &&
    p.pinchExit > p.pinchEnter &&
    p.pinchExit <= 0.7 &&
    p.scaleMin >= 0.1 &&
    p.scaleMax - p.scaleMin >= 0.2 &&
    p.scaleMax <= 1.8
  );
}
export function calibratedPoint(point: Point, c: Calibration): Point {
  return {
    x: clamp((point.x - c.reach.minX) / (c.reach.maxX - c.reach.minX), 0, 1),
    y: clamp((point.y - c.reach.minY) / (c.reach.maxY - c.reach.minY), 0, 1),
  };
}
export const calibrationInstructions = [
  "Show one hand inside the camera view.",
  "Confirm your preferred hand below.",
  "Hold an open palm steadily.",
  "Hold a comfortable pinch.",
  "Hold a closed fist.",
  "Draw one deliberate circle.",
  "Move your index finger around your comfortable reach.",
  "Show two open hands; move them together and apart.",
  "Calibration complete.",
];

export class CalibrationSession {
  step = 0;
  private since: number | null = null;
  private reach = { minX: 1, maxX: 0, minY: 1, maxY: 0 };
  private pinch: number[] = [];
  private scales: number[] = [];
  confirmHand() {
    if (this.step === 1) this.step++;
  }
  update(
    sample: {
      gesture: string;
      point: Point | null;
      span: number | null;
      circle: boolean;
      landmarks?: Point[][];
    },
    now: number,
  ) {
    if (this.step === 1 || this.step === 8) return;
    const expected =
      this.step === 0
        ? !!sample.point
        : this.step === 2
          ? sample.gesture === "Open palm"
          : this.step === 3
            ? sample.gesture === "Pinch"
            : this.step === 4
              ? sample.gesture === "Fist"
              : this.step === 5
                ? sample.circle
                : !!sample.point;
    if (!expected) {
      this.since = null;
      return;
    }
    if (this.since === null) this.since = now;
    if (this.step === 3 && sample.landmarks?.[0]) {
      const h = sample.landmarks[0];
      this.pinch.push(
        Math.hypot(h[4].x - h[8].x, h[4].y - h[8].y) /
          Math.max(0.02, Math.hypot(h[0].x - h[9].x, h[0].y - h[9].y)),
      );
    }
    if (this.step === 6 && sample.point) {
      this.reach.minX = Math.min(this.reach.minX, clamp(sample.point.x, 0, 1));
      this.reach.maxX = Math.max(this.reach.maxX, clamp(sample.point.x, 0, 1));
      this.reach.minY = Math.min(this.reach.minY, clamp(sample.point.y, 0, 1));
      this.reach.maxY = Math.max(this.reach.maxY, clamp(sample.point.y, 0, 1));
      if (
        now - this.since < 3000 ||
        this.reach.maxX - this.reach.minX < 0.15 ||
        this.reach.maxY - this.reach.minY < 0.15
      )
        return;
    } else if (this.step === 7) {
      if (sample.span === null) {
        this.since = null;
        return;
      }
      this.scales.push(sample.span);
      if (
        now - this.since < 2000 ||
        Math.max(...this.scales) - Math.min(...this.scales) < 0.2
      )
        return;
    } else if (this.step !== 5 && now - this.since < 650) return;
    this.step++;
    this.since = null;
  }
  result(hand: "Left" | "Right"): Calibration | null {
    if (this.step !== 8) return null;
    const sorted = this.pinch.sort((a, b) => a - b);
    const enter = clamp(
      (sorted[Math.floor(sorted.length / 2)] ?? 0.22) + 0.08,
      0.15,
      0.5,
    );
    const result: Calibration = {
      version: 1,
      hand,
      reach: this.reach,
      pinchEnter: enter,
      pinchExit: Math.min(0.7, enter + 0.15),
      scaleMin: Math.min(...this.scales),
      scaleMax: Math.max(...this.scales),
      completed: new Date().toISOString(),
    };
    return validCalibration(result) ? result : null;
  }
}
