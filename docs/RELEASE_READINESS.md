# Portal Ritual release readiness

## Verified software

- Linked perspective, exit-plane clipping, circular masking and back-face hiding.
- Staged formation/reveal/collapse, reduced motion and reusable/disposed graphics resources.
- Camera permission/error/device/mirror/cleanup cases, calibrated synthetic gestures and complete browser journey.
- Actual MediaPipe worker/main inference on synthetic video with timing samples.
- Opt-in positional synthesis, volume/mute/context lifecycle and optional capture.
- Decoded/inspected 720p/1080p WebM, audio-track presence, encoder failure recovery and cleanup.
- Four quality budgets, bounded adaptation, renderer counters and eight short RTX 3050 profiling scenarios.
- Types/lint, 26 unit tests, production export, full 23-case browser run plus added startup-cleanup regression.

## Still required for milestone 3 acceptance

1. Physical camera gesture/lighting/occlusion/reacquisition trials using HARDWARE_ACCEPTANCE.md.
2. Consented prerecorded human fixtures; current checked-in trajectories and video are synthetic.
3. Hands-on Windows Edge compatibility and listening evaluation.
4. Sustained target-laptop thermal/battery/recording/inference sessions and long-running GPU-memory behavior; short GPU-reported measurements do not establish these.

No versioned milestone release/tag is created while these remain open. Source is a tested release candidate. No new World Forge, dragon or multiplayer mode is started. After acceptance, Arcane Genesis can extend the existing typed portal/interaction state and extracted renderer/audio/capture boundaries; backend secrets and asset licensing must be designed before external providers are introduced.

## Commit trail

- 6820290 — linked perspective and destination clipping.
- 1648c21 — formation/collapse lifecycle and GPU effects.
- 92eedbc — calibration and bounded worker inference.
- d9e21cb — positional audio.
- 2be8a25 — camera-plane compositing.
- fc58a1e — adaptive quality/profiling.
- 8b0bd4f / 7e2cb4e — cinematic UI and focus correction.
- 2545dbe — inspected HD recording and encoder errors.
- bae7abc — complete synthetic acceptance, reduced-motion/target cleanup and camera startup correction.
- 690a034 / 9d1796a — public failure annotations and OS-independent deterministic camera fixtures.

Every listed commit was pushed successfully to canonical origin/main. Final documentation handoff follows this source history. See ASCENSION_REPORT.md and TEST_REPORT.md for actual results, including resolved failures and verification limits.
