import type { RenderMetrics } from "../renderer/performance";
export default function PerformancePanel({
  metrics,
  quality,
  latency,
  recording,
}: {
  metrics: RenderMetrics | null;
  quality: string;
  latency: number;
  recording: boolean;
}) {
  if (!metrics) return <p>Waiting for rendered frames.</p>;
  return (
    <details className="performance-panel">
      <summary>Performance · {metrics.frameMs.toFixed(1)} ms</summary>
      <svg
        viewBox="0 0 240 48"
        role="img"
        aria-label="Recent rendered frame intervals"
      >
        <polyline
          fill="none"
          stroke="#c3a5f4"
          strokeWidth="1.5"
          points={metrics.trend
            .map(
              (v, i) =>
                `${(i * 240) / Math.max(1, metrics.trend.length - 1)},${48 - Math.min(48, v * 0.75)}`,
            )
            .join(" ")}
        />
      </svg>
      <dl data-perf={JSON.stringify(metrics)}>
        <dt>Resolution</dt>
        <dd>
          {metrics.width}×{metrics.height}
        </dd>
        <dt>Preset</dt>
        <dd>{quality}</dd>
        <dt>Backend</dt>
        <dd>{metrics.backend}</dd>
        <dt>Particles</dt>
        <dd>{metrics.particles}</dd>
        <dt>Draw calls (all passes)</dt>
        <dd>{metrics.calls}</dd>
        <dt>Triangles</dt>
        <dd>{metrics.triangles}</dd>
        <dt>Textures / geometries</dt>
        <dd>
          {metrics.textures} / {metrics.geometries}
        </dd>
        <dt>Destination target</dt>
        <dd>
          {metrics.targetWidth}×{metrics.targetHeight}
        </dd>
        <dt>Inference</dt>
        <dd>{latency.toFixed(1)} ms</dd>
        <dt>Recording</dt>
        <dd>{recording ? "Active" : "Off"}</dd>
      </dl>
    </details>
  );
}
