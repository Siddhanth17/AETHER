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
