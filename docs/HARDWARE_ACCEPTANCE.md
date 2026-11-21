# Physical camera acceptance — pending

Automated/synthetic fixtures do not establish camera accuracy. No personal recordings are included. An operator must run these checks on the target i5-13450HX / RTX 3050 laptop using current Chrome and Edge at 1920×1080 Balanced.

1. `npm ci`, `npm run dev`, open localhost. Confirm camera is off before explicit Enable camera. Deny permission once, then enable. Confirm stop extinguishes the device indicator. Unplug/reconnect an external camera; verify recovery and no remaining live track.
2. In settings select the correct device, input resolution and mirror setting. Restart camera after changes. Confirm wrist and all fingertips align at the center and edges, including portrait/cropped viewport. Record the browser/device model and actual stream dimensions.
3. Calibrate: detect hand; explicitly confirm Left/Right preference; hold open palm, comfortable pinch and fist; draw a circle; sweep comfortable reach horizontally/vertically; show both open hands and separate/compress. Save, reload, and confirm profile persists. Test cancellation and no-hand timeout behavior.
4. Repeat normal indoor light, dim light and strong backlight. For each: ten intended palm/pinch/fist/circle actions, ten deliberately incomplete circles, ten rapid movements and ten slow movements. Record successes, missed actions and false activations; do not substitute handedness score for tracking accuracy.
5. Occlude each hand for 0.5–2 s, cross/overlap wrists, leave/reenter frame. Confirm no stale pinch or scaling jump. Confirm left/right selection and mirrored coordinates match the operator.
6. Compare Prefer worker on/off after restart. Collect at least 30 s of inference latency, reported dispatch/main blocking, rendering frame trend and long tasks. Worker dispatch time excludes asynchronous ImageBitmap creation and is not total main-thread CPU usage. Record model-load failure/fallback behavior.
7. Open/resize/move/change destination/collapse a portal with real gestures. Confirm crop and position match the display. Enable audio explicitly; test positioning/mute/volume. Record 720p and 1080p with camera and optional synthesized audio. Play exports and check dimensions/aspect/duration.

Prerecorded webcam fixtures require user-provided recordings and redistribution consent. Current checked-in fixtures are synthetic landmark trajectories; no recorded-camera validation is claimed. Do not mark hardware acceptance complete until results are entered in TEST_REPORT.md.
