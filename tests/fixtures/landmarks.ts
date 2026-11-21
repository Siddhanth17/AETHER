/** Original synthetic trajectories, not prerecorded webcam evidence. */
export function fixtureHand(
  pose: "palm" | "pinch" | "fist",
  x = 0.5,
  y = 0.45,
) {
  const h = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.6, z: 0 }));
  h[0] = { x: 0.5, y: 0.9, z: 0 };
  h[9] = { x: 0.5, y: 0.65, z: 0 };
  for (const i of [8, 12, 16, 20]) {
    h[i - 2] = { x: 0.5 + (i - 8) * 0.01, y: 0.6, z: 0 };
    h[i] = { x: 0.5 + (i - 8) * 0.01, y: pose === "fist" ? 0.72 : 0.3, z: 0 };
  }
  h[4] = {
    x: pose === "pinch" ? h[8].x + 0.03 : 0.2,
    y: pose === "pinch" ? h[8].y : 0.6,
    z: 0,
  };
  const original = h[8];
  return h.map((p) => ({
    x: x + (p.x - original.x) * 0.65,
    y: y + (p.y - original.y) * 0.65,
    z: 0,
  }));
}
export function gestureFixture(stage: string, index: number) {
  let landmarks: ReturnType<typeof fixtureHand>[] = [];
  if (stage === "palm" || stage === "pinch" || stage === "fist")
    landmarks = [fixtureHand(stage === "palm" ? "palm" : stage)];
  if (stage === "circle") {
    const a = (Math.min(index, 64) / 64) * Math.PI * 2;
    landmarks = [
      fixtureHand("palm", 0.5 + 0.12 * Math.cos(a), 0.4 + 0.12 * Math.sin(a)),
    ];
  }
  if (stage === "reach")
    landmarks = [
      fixtureHand(
        "palm",
        index % 20 < 10 ? 0.3 : 0.7,
        Math.floor(index / 10) % 2 ? 0.3 : 0.55,
      ),
    ];
  if (stage === "scale" || stage === "far") {
    const d = stage === "far" ? 0.3 : index % 20 < 10 ? 0.15 : 0.3;
    landmarks = [
      fixtureHand("palm", 0.5 - d, 0.4),
      fixtureHand("palm", 0.5 + d, 0.4),
    ];
  }
  return {
    landmarks,
    handedness: landmarks.map((_, i) => [
      {
        categoryName: i === 0 ? "Right" : "Left",
        score: 0.99,
        index: i,
        displayName: i === 0 ? "Right" : "Left",
      },
    ]),
  };
}
