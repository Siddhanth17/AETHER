# Operation Portal Ascension

Audit: clean `main` at b084f8a, canonical origin confirmed. Existing eight unit and six browser tests retained. Versions remain locked; no new rendering libraries are needed.

1. Rendering: replace disk UV camera illusion with a rigid portal transform, viewer-matched projection, projective texture lookup, destination world-plane clipping, front-face rejection and aspect-preserving targets. Add view controls and mathematical/browser checks.
2. VFX: timed detection/formation/charge/reveal/stable/collapse lifecycle, procedural runes and animated particle shader; respect reduced motion.
3. Vision: guided calibration, validated persistence, fixed coordinate mapping, bounded worker inference with an explicit main-thread fallback. Physical hardware remains an independent acceptance gate.
4. Audio: opt-in Web Audio engine with lifecycle envelopes, real positional panning/attenuation, volumes and cleanup.
5. Compositing: consistent display/export aspect ratio, stable mapping and camera tint presets; no unsupported depth/occlusion claims.
6. Performance: measured frame windows and quality hysteresis, budgets and instrumentation. Benchmark locally without claiming target-device qualification.
7. UI/recording: short skippable intro, accessible settings, timer and HD playback/dimension validation.
8. Acceptance/docs: execute all gates, inspect screenshots/recorded playback, document pending hardware checks. Push each tested increment; no milestone release while acceptance remains open.

Architectural risks: Studio currently owns too many subsystems; preserve its API while extracting lifecycle services. Current rendering has no physically linked portal camera or clipping; current diagnostics measure handedness confidence, not tracking quality. Inference queues must never accumulate. Camera frames and test recordings must never be committed.
