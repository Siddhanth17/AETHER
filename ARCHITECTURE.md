# Architecture

Next.js App Router provides the application shell and a static export. The studio runs entirely in the browser.

- `src/core/portal.ts`: typed portal state, bounded parameters and circle-path recognition. Independent of camera and graphics APIs.
- `src/components/PortalCanvas.tsx`: Three.js scene ownership and cleanup. A separate perspective camera renders a procedural destination into a quality-dependent framebuffer, sampled by the portal disk. Rings, symbols and point sprites share the portal transform.
- `src/tracking/useCamera.ts`: explicit MediaDevices lifecycle, cancellation tokens and model ownership. Camera frames stay in browser memory.
- `src/tracking/gestures.ts`: renderer-independent landmark interpretation, 180 ms deliberate activation, separate pinch entry/release thresholds, bounded motion history, circle cooldown and recovery after missing/invalid/stale tracking. `cameraToScreen` independently accounts for mirrored display and object-cover cropping.
- `src/tracking/HandOverlay.tsx`: both hands' landmark skeletons. Model coordinates are mapped into display coordinates before they reach the overlay or portal controls.
- `src/components/Studio.tsx`: shared state for mouse, keyboard and camera input, inspector, local presets, settings, audio and recording.

Rendering uses requestAnimationFrame and ResizeObserver. Quality selects pixel ratio, aspect-preserving target budgets and particle count. No physics or application backend is currently necessary. Tracking defaults to bounded worker inference near 15 Hz, with an identified synchronous fallback. Actual worker/main runtime comparison and synthetic integration tests are executed; physical compatibility acceptance remains separate.

The portal now uses rigid source/exit/viewer transforms, a shared perspective projection and projective texture lookup. Aperture scale is excluded from camera mapping. A circular front-facing surface masks the destination; a world-space exit plane clips destination geometry. This is world-plane clipping rather than oblique near-plane projection. All geometry is original procedural code.

## Ascension modules

- `renderer/portalCamera.ts`: linked cameras, front-face classification and aspect-preserving target budgets.
- `renderer/lifecycle.ts`: detection/formation/charging/reveal/stable/collapse, interruption-safe envelopes and reduced-motion resolution. GPU shaders animate swirl/edge energy; original line geometry forms runes. Closed targets are released; quality rebuilds retain lifecycle state.
- `renderer/compositing.ts`: screen-ray/portal-plane intersection and shared camera-cover/export-contain math. Movement uses exponential damping. Lighting matching is artistic; no room pose, depth reconstruction or physical occlusion is claimed.
- `renderer/performance.ts`: four budgets, warmup/spike rejection, sustained frame windows, hysteresis and cooldowns. Metrics include all passes; hidden-tab samples reset. Adaptation freezes during recording. GPU time/VRAM/CPU usage are not inferred from these counters.
- `tracking/calibration.ts`: staged evidence collection, explicit hand confirmation, reach/pinch/scale calibration and validated local profiles. Portal actions pause during calibration.
- `tracking/workerClient.ts` and `public/tracking-worker.js`: actual MediaPipe in a classic worker because the installed WASM loader uses importScripts; one transferable bitmap in flight, abortable initialization and identified main-thread fallback. Dispatch timing excludes asynchronous bitmap creation and total CPU time.
- `audio/PortalAudio.ts`: opt-in original synthesis, envelopes, positional attenuation, master/effects buses, transient cleanup and optional capture stream. Workspace exit closes the context.
- `recording/CompositeRecorder.ts`: codec negotiation, exact HD dimensions, current-canvas lookup, aspect-correct composition, timer, optional cloned synthesized audio tracks, encoder errors, bounded duration, export and disposal. No microphone or server storage.
- `Intro` and `Modal`: short skippable intro, reduced-motion bypass and native dialog with explicit focus wrapping/return.

Studio remains the shared orchestrator. Future AI secrets and signaling require server boundaries. Synthetic fixtures, actual runtime smoke tests and physical-camera acceptance are reported separately.
