# Progress

## Implemented in initial slice

Repository bootstrap; Next.js/React/TypeScript application; original procedural island renderer; render-to-texture portal; landing and studio UI; mouse drag, wheel/keyboard resizing, collapse/open; three destination palettes; energy color/intensity; quality persistence; camera permission and cleanup; MediaPipe integration; pinch, fist, circle and two-hand scaling; tracking diagnostics; local preset save/load; explicit WebM composite recording; simple optional ambient tone; responsive panels.

## Active / unverified

Foundation quality gates pass: strict types, lint, production build, and six browser tests. Unit coverage increased from three to eight tests in the tracking follow-up. 720p WebM export validated. Milestone 0 is complete and pushed to canonical `origin/main` (`9016b9b`); tracking follow-up is pushed as `1d9d080`.

Milestones 1–3 are partial. Camera and real hand tracking require hardware acceptance before milestones 2–3 can be declared complete. No live-camera success is claimed from synthetic tests. Exact intro, calibration, spatial audio, true portal clipping and adaptive quality remain open.

Tracking follow-up adds a pure gesture engine, 180 ms activation, pinch hysteresis, missing/stale frame reset, both-hand landmark overlays and mirror/crop mapping. Eight unit tests now cover geometry recognition and synthetic landmark behavior. Handedness classification score is explicitly labeled as such, not tracking confidence.

## Next

Finish Portal Ritual acceptance, add calibration and landmark fixtures, move inference off the render thread where compatible, add real spatial audio and portal clipping. Only then expand to spells/world editing.

CI runs types, lint, unit tests, production build and Playwright with an automatically managed preview server. Hosted GitHub Actions results have not been inspected from this session; local gates are verified.
