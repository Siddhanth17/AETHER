import { it, expect } from "vitest";
import { PortalLifecycle } from "./lifecycle";
it("runs each formation stage and collapses without discontinuity", () => {
  const e = new PortalLifecycle();
  expect(e.update(true, 100).phase).toBe("detection");
  expect(e.update(true, 400).phase).toBe("formation");
  expect(e.update(true, 800).phase).toBe("charging");
  expect(e.update(true, 1300).phase).toBe("reveal");
  expect(e.update(true, 1800).amount).toBe(1);
  expect(e.update(false, 1900).amount).toBe(1);
  expect(e.update(false, 2700).phase).toBe("closed");
});
it("respects reduced motion and handles interrupted opening", () => {
  const e = new PortalLifecycle();
  expect(e.update(true, 0, true).phase).toBe("stable");
  expect(e.update(false, 100, true).phase).toBe("closed");
  e.update(true, 200);
  const before = e.update(true, 800).amount;
  expect(e.update(false, 800).amount).toBe(before);
  expect(e.update(true, 900).amount).toBeGreaterThanOrEqual(0);
});
