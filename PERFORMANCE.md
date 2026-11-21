# Performance

The dashboard reports actual rendered-frame intervals/trends, internal and target dimensions, particles, all-pass draw/triangle counts, texture/geometry counts, backend, inference and capture state. It does not measure GPU time, VRAM, CPU utilization or end-to-end camera latency. Hidden-tab samples reset; compilation/startup spikes are rejected by adaptation, not relabeled as GPU measurements.

| Preset    | Particles | Target longest edge | DPR cap |
| --------- | --------: | ------------------: | ------: |
| Low       |       180 |                 512 |       1 |
| Balanced  |       550 |                1024 |     1.5 |
| High      |      1200 |                1536 |       2 |
| Cinematic |      1800 |                1920 |       2 |

Targets preserve viewport aspect. Renderer scheduling targets 60 Hz; tracking is throttled near 15 Hz with one worker bitmap in flight. Adaptive quality requires sustained slow/fast windows, warmup and a twelve-second cooldown; capture freezes adaptation. These are budgets/targets, not achieved-performance claims.

## Executed measurements

Windows, Node 22.19, installed Chromium build 1254. Short 1440×900 automated run (internal canvas 1440×764): initial open mean 27.82 ms, enlarged Balanced portal 16.61 ms, Cinematic 18.44 ms; each reported 75 all-pass draw calls. The initial sample includes startup. Raw intervals are in docs/render-metrics.json. These short overlapping windows do not qualify sustained 1080p target-laptop performance.

Actual MediaPipe CPU inference on a synthetic camera, twelve fresh results per backend: worker mean 52.51 ms with 0.033 ms measured main dispatch; main-thread mean 42.62 ms including synchronous blocking. Worker dispatch excludes asynchronous bitmap creation and total main-thread CPU cost. The worker moved inference off the render thread but was slower in inference time in this sample. Raw values: docs/tracking-timing.json.

Both 1280×720 and 1920×1080 WebM exports were decoded and visually inspected with a synthetic camera. Optional Opus audio presence was checked. Late capture slots describe compositor scheduling, not encoder drops. Physical-camera recording load and hands-on Edge/target-laptop measurements remain pending. The explicit eight-scenario profiling run records landing, idle, webcam, opening/open, scaling, recording and combined tracking with actual MediaPipe on synthetic video; results are recorded separately after execution.

## Eight-scenario RTX 3050 run

Executed at a 1920×1080 browser viewport, Balanced, actual MediaPipe CPU worker and Chromium synthetic camera. WebGL reported `ANGLE (NVIDIA, NVIDIA GeForce RTX 3050 6GB Laptop GPU, Direct3D11)`. Internal studio canvas was 1920×944; landing canvas was 1536×1038. These are short overlapping moving windows, not a long-duration thermal/battery benchmark. CPU utilization and VRAM were not measured.

| Scenario                               | Mean frame interval | All-pass draw calls |
| -------------------------------------- | ------------------: | ------------------: |
| Landing                                |            16.67 ms |                  75 |
| Studio closed                          |            17.19 ms |                   0 |
| Synthetic webcam + real worker, closed |            17.07 ms |                   0 |
| Portal + tracking                      |            16.72 ms |                  75 |
| Opening reveal + tracking              |            16.84 ms |                  43 |
| Scaling + tracking                     |            16.78 ms |                  75 |
| 1080p recording + tracking             |            17.65 ms |                  75 |
| Portal + tracking after recording      |            16.66 ms |                  75 |

Raw renderer/worker values and GPU identification are in docs/scenario-benchmark.json. Startup, scenario transitions and 1.1–2.2-second collection delays overlap the rolling frame window; do not interpret them as isolated GPU-cost deltas. The final benchmark case passed in 24.3 seconds; an earlier pass took 23.1 seconds. Sustained 60 FPS and physical-camera acceptance are still not declared. The final runtime smoke sample set is separately preserved in docs/tracking-timing-final.json.
