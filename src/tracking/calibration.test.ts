import { it, expect } from "vitest";
import {
  CalibrationSession,
  validCalibration,
  calibratedPoint,
  type Calibration,
} from "./calibration";
const profile: Calibration = {
  version: 1,
  hand: "Right",
  reach: { minX: 0.2, maxX: 0.8, minY: 0.2, maxY: 0.8 },
  pinchEnter: 0.3,
  pinchExit: 0.45,
  scaleMin: 0.4,
  scaleMax: 1.4,
  completed: "2026-11-21",
};
it("validates persisted calibration and rejects malformed or inverted ranges", () => {
  expect(validCalibration(profile)).toBe(true);
  expect(validCalibration({ ...profile, pinchExit: 0.1 })).toBe(false);
  expect(
    validCalibration({
      ...profile,
      reach: { minX: 0.8, maxX: 0.2, minY: 0, maxY: 1 },
    }),
  ).toBe(false);
  expect(validCalibration(null)).toBe(false);
  expect(calibratedPoint({ x: 0.5, y: 0.2 }, profile).x).toBeCloseTo(0.5);
});
it("requires detected hands, deliberate dwell and explicit hand confirmation", () => {
  const c = new CalibrationSession();
  const s = {
    gesture: "Open palm",
    point: { x: 0.5, y: 0.5 },
    span: null,
    circle: false,
  };
  c.update({ ...s, point: null }, 0);
  expect(c.step).toBe(0);
  c.update(s, 100);
  c.update(s, 800);
  expect(c.step).toBe(1);
  c.update(s, 2000);
  expect(c.step).toBe(1);
  c.confirmHand();
  c.update(s, 2100);
  c.update(s, 2800);
  expect(c.step).toBe(3);
  expect(c.result("Right")).toBeNull();
});
it("completes all measured stages and returns a bounded serializable profile", () => {
  const c = new CalibrationSession();
  let time = 100;
  const s = {
    gesture: "Open palm",
    point: { x: 0.5, y: 0.5 },
    span: null as number | null,
    circle: false,
  };
  const hold = (gesture: string) => {
    c.update({ ...s, gesture }, time);
    c.update({ ...s, gesture }, time + 700);
    time += 1000;
  };
  hold("Move");
  c.confirmHand();
  hold("Open palm");
  hold("Pinch");
  hold("Fist");
  c.update({ ...s, circle: true }, time);
  time += 1000;
  c.update({ ...s, point: { x: 0.2, y: 0.2 } }, time);
  c.update({ ...s, point: { x: 0.8, y: 0.8 } }, time + 3100);
  time += 4000;
  c.update({ ...s, span: 0.5 }, time);
  c.update({ ...s, span: 1.5 }, time + 2100);
  const result = c.result("Left");
  expect(result).not.toBeNull();
  expect(validCalibration(JSON.parse(JSON.stringify(result)))).toBe(true);
  expect(result!.hand).toBe("Left");
});
