# Test report

Executed 2026-11-21 on Windows, Node 22.19.0, npm 10.9.3, installed Chromium build 1254.

## Current operation — Portal Ascension

26 unit tests, strict TypeScript, ESLint and production export pass. Full browser acceptance includes actual MediaPipe worker/main inference on synthetic video, original synthetic landmark trajectories through the full calibration/portal/export UI, camera device/error/cleanup substitutes, context loss/recovery, audio lifecycle, 720p/1080p decode/audio checks, modal/reduced motion, four viewports and measured framebuffer restoration. Executed outcomes follow.

Final complete run: **23/23 passed in 2.5 minutes**, with AETHER_MODEL_SMOKE=1 and AETHER_BENCHMARK=1. A subsequent cleanup review added a 24th distinct case: granted camera stream plus rejected video.play. It initially failed, the shared stop path was applied on initialization failure, then **all 3 camera cases passed in 18.0 seconds**. Final static/unit/build gates passed again after correction. Default hosted CI now runs 22 deterministic cases and skips the two explicit network-dependent ones.

Hosted acceptance initially failed two tests because the Linux runner's native fake-camera device returned NotSupported before the intended test behavior. Public GitHub annotations identified both. Deterministic journey/startup cases now use an explicit animated CanvasCaptureMediaStreamTrack fixture; the actual MediaPipe smoke/benchmark evidence remains separate. The three camera and two journey/context cases pass locally after this fixture correction (5/5, 50.0 s). CI now emits the GitHub reporter so future failure details are available through public check annotations without protected-log credentials.

An initial full run passed 21/23 cases. The model-smoke locator was ambiguous after the performance panel added a second `dl`; it now targets tracking diagnostics. An exact framebuffer hash differed by a single channel-level value despite visually identical restoration. The test now records mean absolute channel difference (<0.25/255) and fraction differing by >8 (<0.5%), while aperture/outside/back-facing alpha remains exact. A focused rerun passed both corrected cases; measured mean difference was 0.000000227 with no >8 changes. This is a quantified GPU image comparison rather than a claim of byte-identical cross-driver output.

Runtime MediaPipe emits upstream informational/warning messages about OpenGL checking, feedback signatures and normalized ROI projection; no application exception is inferred from those messages. Physical lighting/hand accuracy, consented recorded-human fixtures, long-running VRAM/thermal behavior and hands-on Edge validation remain pending. Synthetic footage does not satisfy those hardware gates.

Details and phase commits/results are in docs/ASCENSION_REPORT.md. The foundation reports below are historical results, not current missing-feature lists.

## Final foundation increment

- `npm run typecheck`: passed.
- `npm run lint`: passed, zero errors/warnings.
- `npm test`: 3/3 passed (879 ms total runner duration in final run).
- `npm run build`: passed; static `/` and not-found routes exported.
- Playwright: 6/6 passed, 19.7 seconds. Explicit hydration readiness; native GPU selection with software fallback allowed. Used `AETHER_BROWSER_PATH` to select installed Chromium.
- Browser flow: enter studio without camera, change destination, save preset, mutate destination/scale, reload preset, collapse/open, record and download WebM. No uncaught page errors in this flow.
- Recording: real MediaRecorder output at 720p, 600,433 bytes. Codec selection prefers VP8. No webcam or microphone in the test recording. 1080p export is available but not validated by the passing test.
- Quality setting survives reload. Mocked MediaDevices permission denial produces recoverable error and re-enables camera control.
- Screenshots and horizontal overflow checks passed at 1920×1080, 1440×900, 1366×768, 390×844. Desktop and mobile screenshots visually inspected; mobile panels now start collapsed and are mutually exclusive.

Representative screenshots are in `docs/screenshots/`. Transient recordings and test artifacts remain ignored.

First dependency installation failed in npm 10.9.3's peer resolver (`Cannot read properties of null (reading edgesOut)`). Retrying with legacy peer resolution, recorded in `.npmrc` for reproducibility.

First TypeScript attempt identified an unclosed JSX handler, corrected before subsequent validation. Lint/test/build could not run before dependencies were installed.

Other resolved verification failures: React ref updates moved into effects; unit discovery scoped away from Playwright; missing default Chromium build handled by explicit installed executable; test clicked a deliberately non-interactive heading (changed to interaction surface); external font import removed; UI test now waits for hydration before clicking server-rendered controls. Forced software rendering with 1080p recording stalled the stop click; native GPU selection with 720p passed. Do not infer 1080p recording performance from the passing 720p test.

At the foundation checkpoint, these were unverified: physical webcam, prerecorded tracking fixtures, hand gesture accuracy, camera disconnection, two-hand scaling, encoder errors, context loss, long-running memory behavior, internet multiplayer. Ascension now covers synthetic two-hand scaling, disconnection, encoder errors and context recovery; physical/human-video and sustained-memory acceptance remain pending. Multiplayer is outside this operation.

## Tracking follow-up

- `npm run typecheck`: passed.
- `npm test`: 8/8 passed, 455 ms runner duration. Five additional synthetic landmark tests cover open palm/pinch/fist stabilization, one-frame rejection, tracking-loss reset, pinch hysteresis, malformed/stale evidence and mirror/crop coordinates. These are synthetic fixtures, not recorded-camera acceptance.
- `npm run lint`: passed with zero errors/warnings. `npm run build`: passed. Browser regression: 6/6 passed in 18.7 seconds, including another real local WebM export.

CI installs Chromium and runs deterministic browser cases with managed server startup. Hosted runs through `2545dbe` were inspected and completed successfully; its run is https://github.com/Siddhanth17/AETHER/actions/runs/44917380255. Explicit model-smoke and benchmark flags are exercised locally and disabled by default in CI to avoid depending on third-party model availability.
