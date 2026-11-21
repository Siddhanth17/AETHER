# Test report

Executed 2026-11-21 on Windows, Node 22.19.0, npm 10.9.3, installed Chromium build 1254.

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

Not yet verified: physical webcam, prerecorded tracking fixtures, hand gesture accuracy, camera disconnection, two-hand scaling, encoder errors, context loss, long-running memory behavior, internet multiplayer (not implemented).
