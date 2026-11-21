import { it, expect } from "vitest";
import { AdaptiveQuality, budgets,nextFrameDeadline } from "./performance";
it('schedules at most one render per target interval on high-refresh displays',()=>{let next=0,count=0;for(let i=0;i<144;i++){const now=i*1000/144;if(now>=next){count++;next=nextFrameDeadline(now);}}expect(count).toBeGreaterThanOrEqual(59);expect(count).toBeLessThanOrEqual(61)});
it("does not react to short spikes or compilation stalls", () => {
  const c = new AdaptiveQuality();
  for (let i = 0; i < 8; i++)
    expect(c.update(i % 2 ? 200 : 16, 20000 + i * 1000, "High", "High")).toBe(
      "High",
    );
});
it("degrades after sustained slow windows and obeys a recovery cooldown", () => {
  const c = new AdaptiveQuality();
  let q: "Low" | "Balanced" | "High" | "Cinematic" = "High";
  for (let i = 0; i < 10; i++) q = c.update(32, 20000 + i * 1000, q, "High");
  expect(q).toBe("Balanced");
  for (let i = 0; i < 5; i++)
    expect(c.update(16, 30000 + i * 1000, q, "High")).toBe("Balanced");
  expect(budgets.Cinematic.particles).toBeGreaterThan(budgets.High.particles);
});
