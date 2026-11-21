# Architecture

Next.js App Router provides the application shell and a static export. The studio runs entirely in the browser.

- `src/core/portal.ts`: typed portal state, bounded parameters and circle-path recognition. Independent of camera and graphics APIs.
- `src/components/PortalCanvas.tsx`: Three.js scene ownership and cleanup. A separate perspective camera renders a procedural destination into a quality-dependent framebuffer, sampled by the portal disk. Rings, symbols and point sprites share the portal transform.
- `src/tracking/useCamera.ts`: explicit MediaDevices lifecycle, cancellation tokens, model ownership, smoothed cursor, deliberate gesture stabilization and circle cooldown. Camera frames stay in browser memory.
- `src/components/Studio.tsx`: shared state for mouse, keyboard and camera input, inspector, local presets, settings, audio and recording.

Rendering uses requestAnimationFrame and ResizeObserver. Quality selects pixel ratio, render-target resolution and particle count. No physics or application backend is currently necessary. Tracking is throttled to about 15 Hz but currently executes synchronously on the main thread; a worker migration needs browser compatibility testing.

The current portal is an artistic circular render-to-texture view. It is not yet a physically correct oblique-clipped portal. Mouse/hand movement produces limited camera parallax. All geometry is original procedural code, not generated artwork.
