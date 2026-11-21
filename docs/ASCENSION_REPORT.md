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
