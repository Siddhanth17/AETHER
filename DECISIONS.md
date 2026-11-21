# Engineering decisions

1. Build the Portal Ritual slice before creating other modes. No inactive mode buttons masquerade as working features.
2. Next.js static export is sufficient for the current local-only app. Future AI secrets and authenticated signaling require separately designed server boundaries.
3. Three.js directly owns the renderer to keep explicit control over framebuffer passes, resource disposal and recording. React owns UI and validated portal state. React Three Fiber can be adopted when scene complexity justifies it.
4. Original procedural assets keep the first slice reproducible without large binaries or uncertain asset licenses.
5. Camera frames never leave browser memory. Runtime/model downloads are public asset requests, not frame uploads. External font loading was removed after a browser test exposed blocking network requests.
6. Prefer classic-worker MediaPipe CPU inference because its WASM loader uses importScripts. Keep one transferable bitmap in flight, abort initialization on stop, expose failures, and retain an explicitly identified synchronous fallback. Actual runtime smoke succeeded on synthetic video; that is distinct from physical hand accuracy.
7. Recording exports WebM with supported codec detection. No MP4 promise, microphone capture or server storage.
8. Violet/obsidian/champagne follow the user's explicit art direction, overriding the design skill's default palette restriction.
9. npm 10's resolver crashed on optional peer dependency traversal; use the consistent legacy peer resolver and verify actual installed packages through compilation and tests.
10. Use rigid linked portal cameras plus projective lookup and Three.js world-plane clipping. Aperture scale changes the opening, not camera/world scale. No physical-depth or oblique-projection claim is made.
11. Share cover/contain geometry between preview and export. Letterbox rather than stretch; use screen-plane anchors and artistic lighting with an explicit no-segmentation fallback.
12. Capture synthesized audio only after explicit opt-in, cloning tracks so recording cleanup does not terminate the audio engine. Bound recording memory at three minutes. No microphone capture.
13. Release readiness remains separate from implementation: no milestone tag before physical lighting/occlusion, recorded-human fixtures, hands-on Edge and target-device gates are evidenced.
