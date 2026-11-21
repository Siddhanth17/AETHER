# Progress

## Implemented

Repository bootstrap; Next.js/React/TypeScript application; original procedural island renderer; render-to-texture portal; landing and studio UI; mouse drag, wheel/keyboard resizing, collapse/open; three destination palettes; energy color/intensity; quality persistence; camera permission and cleanup; MediaPipe integration; pinch, fist, circle and two-hand scaling; tracking diagnostics; local preset save/load; local composite recording; responsive panels.

Ascension adds linked perspective and world-plane clipping, front-face masking, staged formation/reveal/collapse, GPU swirl and original runes, guided calibration, preferred-hand/overlap handling, abortable bounded worker inference, positional sound and volumes, camera-plane mapping/tint/stabilization, aspect-correct compositing, four budgets/adaptation/profiling, skippable intro, modal keyboard handling and an extracted HD recording controller with optional synthesized audio and error recovery.

## Active / unverified

Current gates pass: strict types, lint, 26 unit tests and production export. A full 23-case browser run including real-runtime smoke and profiling passed; an additional camera-playback failure regression was then reproduced/fixed and all three camera cases passed. There are 24 distinct browser cases, two explicitly network-dependent. Both HD export sizes are decoded/inspected. Source acceptance is pushed as `bae7abc`; phase history is in docs/ASCENSION_REPORT.md.

Portal Ritual software is a release candidate. Physical-camera gesture accuracy, lighting/occlusion testing, consented recorded-human fixtures, hands-on Edge compatibility and target-laptop sustained performance acceptance remain pending. No live-camera success is inferred from synthetic tests, and no milestone-3 release tag is created while these gates remain open.

Tracking includes a pure gesture engine, 180 ms activation, pinch hysteresis, missing/stale frame reset, both-hand overlays, calibrated mirror/crop mapping and worker cancellation. Handedness score is explicitly labeled as such rather than tracking confidence. Synthetic fixtures and real-runtime inference are distinguished from pending physical hand accuracy.

## Next

Complete the physical procedure in docs/HARDWARE_ACCEPTANCE.md, attach measured outcomes and consented human fixtures, inspect hosted CI, then decide release readiness. Operation Arcane Genesis remains scoped to typed future spell interfaces; no new spell, world, creature or multiplayer mode is started.

CI runs types, lint, unit tests, production build and deterministic Playwright cases with a managed preview server. Hosted runs through recording commit `2545dbe` were inspected and succeeded, including [recording CI](https://github.com/Siddhanth17/AETHER/actions/runs/44917380255). Final Ascension acceptance and documentation commits are tracked separately below.

The hosted acceptance run exposed an OS-native fake-camera dependency in two test setups. Correction `9d1796a` uses explicit canvas streams for deterministic cases; real-runtime smoke remains separate. The README status badge links the latest hosted result. CI failure details are public check annotations; no protected-log credential access is used.
