import type { Point } from "../core/portal";
const fingers = [
  [0, 1, 2, 3, 4],
  [0, 5, 6, 7, 8],
  [5, 9, 10, 11, 12],
  [9, 13, 14, 15, 16],
  [13, 17, 18, 19, 20],
  [0, 17],
];
export default function HandOverlay({ hands }: { hands: Point[][] }) {
  return (
    <svg
      className="hand-overlay"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
      aria-label={`${hands.length} tracked hands`}
      role="img"
    >
      {hands.map((hand, h) => (
        <g key={h}>
          {fingers.map((indices, i) => (
            <polyline
              key={i}
              points={indices
                .map(
                  (index) => `${hand[index].x * 1000},${hand[index].y * 1000}`,
                )
                .join(" ")}
              fill="none"
              stroke="#dec9ff"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {hand.map((p, i) => (
            <circle
              key={i}
              cx={p.x * 1000}
              cy={p.y * 1000}
              r={i === 8 ? 7 : 3}
              fill={i === 8 ? "#f8dfb3" : "#d7beff"}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
