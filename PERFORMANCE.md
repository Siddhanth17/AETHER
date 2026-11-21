# Performance

No target-device benchmark is claimed. The app reports observed requestAnimationFrame rate and final scene draw calls. This is not GPU timing or end-to-end latency. Destination render passes are additional to the displayed final-pass draw calls.

Quality budgets: Low = 180 points / 384² destination target / DPR 1; Balanced = 550 points / 640² / DPR up to 1.5; High = 1200 points / 1024² / DPR up to 2. Camera inference is throttled to ~15 Hz on the main thread. These are configuration budgets, not benchmark results.

Record device, browser, viewport, quality and camera state for any measured results. Headless/software rendering does not establish RTX 3050 performance. Dynamic quality adaptation and inference worker profiling remain planned.
