# Portal Ritual walkthrough

1. Open localhost and watch or skip the short intro. Enter studio. Mouse/keyboard work without camera or audio permission.
2. Select a destination palette. Angle/parallax controls inspect the opening; Reset ritual restores defaults.
3. Enable camera explicitly. Settings list devices after permission; select resolution and restart to apply. Mirror changes immediately. Stop camera releases tracks and pending worker initialization.
4. Select Calibrate hands. Keep one hand detected; explicitly confirm preferred model hand label. Hold palm, pinch and fist, draw a full circle, sweep comfortable reach, then separate/compress both open hands. Actions pause during calibration. Save after all stages; Cancel returns to normal controls.
5. Circle opens at its center, pinch repositions, separated open hands scale and fist collapses. Tracking loss preserves the current portal anchor and clears gesture evidence. Mouse drag, wheel, +/− and Space remain available.
6. Enable audio explicitly. Adjust master/effects volumes. Portal state and position drive sound. Global mute also silences the capture bus.
7. Choose recording resolution and optional synthesized audio. Enable audio first if capture should include it. Record scene shows an active control/timer; Stop exports WebM locally. Capture stops/exports after three minutes. Play the downloaded file before sharing.
8. Performance shows actual frame intervals, internal/target dimensions, particle/draw/triangle counts, backend and inference. Select fixed quality or cap adaptive quality. See HARDWARE_ACCEPTANCE.md for physical testing.

## Compatibility and limits

Primary target: Windows Chrome/Edge with WebGL2, MediaDevices, Web Audio and MediaRecorder. Chromium automation is executed; a separate hands-on Edge acceptance pass remains. No WebGPU or guaranteed MP4 support is claimed.

Webcam placement is camera-plane anchored rather than room tracking. Lighting matching is artistic; no true physical occlusion or room depth is inferred. MediaPipe ImageSegmenter was considered, but a person matte would not establish portal depth order and its additional inference budget has not been validated. The baseline works without segmentation.

Hand accuracy requires physical lighting/occlusion validation. Public model downloads may fail; diagnostics identify fallback and mouse input remains available. Current automated video is synthetic and landmark trajectories are original generated fixtures. Consented prerecorded human footage has not been supplied; no recorded-camera acceptance is claimed.
