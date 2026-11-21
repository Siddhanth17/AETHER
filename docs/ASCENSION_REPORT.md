# Ascension phase record

## Phase 1 — audit

Clean main at b084f8a; canonical GitHub origin confirmed. Read implementation, test suite, dependencies and project status. Actual gaps and execution order are in ASCENSION_PLAN.md. No existing work discarded.

## Phase 2 — dimensional perspective

Linked rigid source/exit/viewer transforms, shared perspective projection, screen-space projective destination sampling, world-space exit clipping, front-face rejection and aspect-preserving target budgets. Added viewer-parallax and portal-angle controls for inspection. Existing lifecycle disposal retained.

Executed: TypeScript, 12 unit tests and production build passed. Seven browser scenarios passed initially, including perspective/back-facing images and repeated portal toggles. Lint initially collided with Playwright deleting transient test-results; that directory is now excluded. Final lint rerun passed. Visual review exposed a missing output colorspace conversion and a screenshot taken before the parallax state reached the renderer; both corrected and rechecked before commit.

Limits: single portal, rigid transform mapping; no physical camera pose estimation. Geometry count bounds during open/close are not a driver-level VRAM leak measurement. Physical scene occlusion is not supplied by RGB video.

## Phase 3 — formation and collapse

Timed detection, formation, charging, reveal, stabilization and collapse; smooth interruption-safe envelopes; luminous seed point; original line-stroke runes; GPU vertex swirl and soft particle sprites. Destination aperture reveals independently of the energy ring. Reduced motion resolves directly to stable/closed.

Types, lint, 14 unit tests, production build and all seven browser scenarios pass (30.1 s browser suite). No added effects library or full-screen bloom pass. Art uses a bounded additive edge aura; target-device GPU performance is not yet measured. Phase snapshots and comprehensive lifecycle acceptance are expanded in the final gate.

## Phase 4 — calibration and worker tracking

Added guided detection, explicit hand preference, palm/pinch/fist holds, motion-circle test, measured reach and two-hand scale ranges, schema-validated local profiles, adaptive pinch thresholds, dominant-hand selection, overlap suppression and calibration-paused actions. Public classic worker uses the actual MediaPipe runtime, CPU model and transferable ImageBitmap; one frame in flight. Diagnostics identify worker versus main-thread fallback and show inference and dispatch/main blocking separately. Worker initialization allows 45 seconds for cold asset downloads; cancellation remains immediate.

Actual runtime smoke: first worker attempt fell back; a retry processed synthetic camera frames in the worker. The subsequent twelve-result-per-backend comparison passed in 20.1 seconds with real model inference. Measurements are in tracking-timing.json. Synthetic browser camera and pure landmark fixtures are not physical-camera validation. No main-thread dispatch measurement includes asynchronous bitmap creation or total CPU utilization.

Types/lint pass; browser regression 7/7 (37.9 s) plus the explicit real-runtime smoke passes. Production build initially failed twice on generated `.next` directory EPERM; the same build succeeded with filesystem permission escalation. Manual lighting/occlusion/device procedure is in HARDWARE_ACCEPTANCE.md; physical validation and consented recorded-camera fixtures remain pending.

## Phase 5 — positional audio

Extracted original synthesized layered hum, charging/opening frequency sweep, collapse sweep, gesture confirmation and UI tones. Actual PannerNode position follows portal state with inverse-distance attenuation. Explicit opt-in, global mute, separate master/effects volume, source tracking and context shutdown on workspace exit. A MediaStreamAudioDestinationNode supports optional recording later.

Two real Web Audio browser cases pass (14.0 s): no context before opt-in, running context after activation, reuse through mute, closed context on exit; unsupported AudioContext fallback. Types/lint/build pass. No recorded listening evaluation or audio loudness benchmark is claimed. Test-only Window casting was corrected after strict type checking flagged it.

## Phase 6 — camera-plane compositing

Mouse/hand placement now intersects the actual perspective camera ray with the portal plane; exponential position/scale stabilization reduces jumps. Camera and export share cover/contain rectangle math, mirroring and artistic tint. Export letterboxes where needed instead of stretching the viewport. Neutral/Moonlight/Warm presets alter camera treatment and destination lighting.

Types/lint and 21 unit tests pass, including portrait/desktop/parallax projection round-trips and aspect-ratio checks. Browser regression includes nine cases with audio and actual recording export. This is a screen-relative plane anchor, not world SLAM or reliable room depth. MediaPipe ImageSegmenter was considered but not adopted: a person matte alone would not establish portal depth order, and no additional segmentation inference budget has been validated. The baseline works without segmentation; physical occlusion is not claimed.

## Phase 7 — adaptive rendering and instrumentation

Four explicit GPU budgets, optional adaptation capped at the selected preset, five sustained slow windows before downgrade, fifteen fast windows before recovery, twelve-second cooldown and startup/spike suppression. Adaptation freezes during recording. Quality rebuild retains the portal lifecycle; disposed renderers release their contexts. Corrected high-refresh scheduling is unit-tested.

Dashboard reports measured render intervals/trend, actual internal dimensions, particles, all-pass draw calls, triangles, textures/geometries, render-target dimensions, WebGL2, inference and recording state. No GPU-time, VRAM or CPU-utilization estimates are presented as measurements.

24 unit tests pass. Browser preset/instrumentation test passes (18.2 s). In this short 1440×900 Chromium run (canvas 1440×764), measured moving-window frame means were 27.82 ms initial open, 16.61 ms enlarged portal, 18.44 ms Cinematic; 75 all-pass calls each. Startup is included in the first sample. Full raw intervals/methodology are in render-metrics.json. These are not a 1080p target-laptop benchmark or sustained 60 FPS qualification.

## Phase 8 — cinematic UI

Added a 2.3-second point/ring/wordmark intro, explicit Skip intro, reduced-motion bypass, native modal semantics with explicit focus wrapping and Escape/focus return, and more readable panel text. Responsive landing/studio screenshots still render at all four sizes.

Nine of ten initial UI/audio/portal cases passed; reverse Tab exposed browser-chrome focus escape. An explicit wrap corrected it; both keyboard/reduced-motion tests then passed (10.9 s). Existing eight audio/portal/layout tests also passed in the initial run. Types/lint/build pass. UI and recording are staged separately so history preserves the two changes.

A later combined run exposed an intermittent initial-focus race. Modal startup now explicitly focuses its first control and handles focus on the dialog root; the test awaits initial focus. Three repeated keyboard/reduced-motion runs pass (6/6, 23.3 s).
