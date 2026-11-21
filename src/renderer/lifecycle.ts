import { clamp } from "../core/portal";
export type PortalPhase =
  | "closed"
  | "detection"
  | "formation"
  | "charging"
  | "reveal"
  | "stable"
  | "collapse";
const smooth = (v: number) => {
  const x = clamp(v, 0, 1);
  return x * x * (3 - 2 * x);
};
export class PortalLifecycle {
  private desired = false;
  private changed = 0;
  private from = 0;
  private amount = 0;
  private aperture = 0;
  private fromAperture = 0;
  update(open: boolean, now: number, reduced = false) {
    if (open !== this.desired) {
      this.from = this.amount;
      this.fromAperture = this.aperture;
      this.desired = open;
      this.changed = now;
    }
    const age = Math.max(0, now - this.changed);
    const duration = open ? 1600 : 750;
    this.amount = reduced
      ? open
        ? 1
        : 0
      : this.from + ((open ? 1 : 0) - this.from) * smooth(age / duration);
    const phase: PortalPhase = reduced
      ? open
        ? "stable"
        : "closed"
      : !open
        ? this.amount < 0.001
          ? "closed"
          : "collapse"
        : age < 180
          ? "detection"
          : age < 600
            ? "formation"
            : age < 1000
              ? "charging"
              : age < 1600
                ? "reveal"
                : "stable";
    this.aperture = reduced
      ? open
        ? 1
        : 0
      : open
        ? this.fromAperture +
          (1 - this.fromAperture) * smooth((age - 800) / 800)
        : this.fromAperture * (1 - smooth(age / 750));
    return {
      phase,
      amount: this.amount,
      aperture: this.aperture,
      energy: reduced
        ? open
          ? 1
          : 0
        : open
          ? 0.6 + 0.4 * smooth(age / 1000)
          : this.amount,
    };
  }
}
