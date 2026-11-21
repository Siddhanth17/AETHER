# AETHER

[![Quality gates](https://github.com/Siddhanth17/AETHER/actions/workflows/ci.yml/badge.svg)](https://github.com/Siddhanth17/AETHER/actions/workflows/ci.yml)

Reality is yours to rewrite.

A local-first browser studio for interactive portals, calibrated gestures and cinematic capture. Operation Portal Ascension extends the existing Portal Ritual slice. Physical-camera acceptance remains pending; no milestone release is tagged yet.

![AETHER studio](docs/screenshots/studio.png)

## Run locally

Node.js 22.19 or later is required.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. Enter the studio without granting camera permission. Drag the portal to move it, scroll or use + / - to resize, and press Space to open or collapse it. The inspector changes the rendered destination, energy color and particles. Save/load stores a portal preset locally.

Camera access starts only when **Enable camera** is clicked. MediaPipe runtime/model downloads require internet. Use Calibrate hands in the inspector to confirm your hand, hold palm/pinch/fist, draw a circle, measure comfortable reach and set two-hand scaling. Draw a circle to open at its center, pinch to move, separate open hands to scale and close a fist to collapse. Worker inference is preferred, with bounded scheduling and an explicitly identified main-thread fallback. Physical-camera accuracy remains unverified.

Record scene explicitly captures camera/graphics at 720p or 1080p; both have passed real WebM playback and dimension checks using a synthetic camera. Stop exports locally. Optional synthesized portal audio is opt-in; microphone capture is never requested. Aspect ratio is preserved with letterboxing where needed. Capture stops/exports after three minutes to bound local memory. Nothing is uploaded. Late capture slots are scheduling diagnostics, not measured encoder drops.

Audio is separately opt-in, positional and controlled by master/effects volume and global mute. Low/Balanced/High/Cinematic budgets and optional adaptive quality are available. The performance panel reports measured frame intervals and renderer counters. See the [walkthrough](docs/PORTAL_RITUAL.md) and [hardware checklist](docs/HARDWARE_ACCEPTANCE.md).

## Commands

- `npm run typecheck` — strict TypeScript
- `npm run lint` — Next.js and TypeScript ESLint rules
- `npm test` — deterministic interaction tests
- `npm run test:e2e` — Playwright browser suite (starts the dev server automatically; install Chromium with `npx playwright install chromium`). `AETHER_BROWSER_PATH` can select an existing Chromium executable.
- `npm run build` — production static export in `out/`
- `npm run format` — Prettier

See [PROGRESS.md](PROGRESS.md), [TEST_REPORT.md](TEST_REPORT.md), and [ARCHITECTURE.md](ARCHITECTURE.md) for actual scope and verification. No AI provider, creature system or multiplayer service is implemented yet.

The default browser suite uses synthetic camera/landmark fixtures. Set `AETHER_MODEL_SMOKE=1` for actual MediaPipe inference on synthetic video, and `AETHER_BENCHMARK=1` for eight network-dependent profiling scenarios. Set both to run every case. CI runs deterministic cases; hosted CI status must be checked separately. Portal destinations are original procedural geometry with three palette variants. Camera anchoring is screen-plane based, with artistic lighting matching and no room SLAM or physical-depth occlusion.

## Deploy

Run `npm run build` and serve the `out/` directory using any static HTTPS host. There are no server-side secrets or services in this increment. Camera access requires HTTPS except on localhost. Do not use `next start` with this static-export configuration.
