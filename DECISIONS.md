# Engineering decisions

1. Build the Portal Ritual slice before creating other modes. No inactive mode buttons masquerade as working features.
2. Next.js static export is sufficient for the current local-only app. Future AI secrets and authenticated signaling require separately designed server boundaries.
3. Three.js directly owns the renderer to keep explicit control over framebuffer passes, resource disposal and recording. React owns UI and validated portal state. React Three Fiber can be adopted when scene complexity justifies it.
4. Original procedural assets keep the first slice reproducible without large binaries or uncertain asset licenses.
5. Camera frames never leave browser memory. Runtime/model downloads are public asset requests, not frame uploads. External font loading was removed after a browser test exposed blocking network requests.
6. MediaPipe CPU inference is initially throttled on the main thread. Worker execution remains an explicit unfinished performance task.
7. Recording exports WebM with supported codec detection. No MP4 promise, microphone capture or server storage.
8. Violet/obsidian/champagne follow the user's explicit art direction, overriding the design skill's default palette restriction.
9. npm 10's resolver crashed on optional peer dependency traversal; use the consistent legacy peer resolver and verify actual installed packages through compilation and tests.
