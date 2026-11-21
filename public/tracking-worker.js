/* Classic worker: MediaPipe 1.2.3's loader uses importScripts for its WASM glue. */
let model;
self.onmessage = async ({ data }) => {
  try {
    if (data.type === "init") {
      importScripts(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/vision_bundle.js",
      );
      const files = await Vision.FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm",
      );
      model = await Vision.HandLandmarker.createFromOptions(files, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "CPU",
        },
        canvas: new OffscreenCanvas(640, 360),
        runningMode: "VIDEO",
        numHands: 2,
        minHandDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65,
      });
      self.postMessage({ type: "ready" });
    } else if (data.type === "frame" && model) {
      try {
        const began = performance.now();
        const result = model.detectForVideo(data.bitmap, data.time);
        self.postMessage({
          type: "result",
          result,
          inferenceMs: performance.now() - began,
        });
      } finally {
        data.bitmap.close();
      }
    }
  } catch (error) {
    self.postMessage({
      type: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
