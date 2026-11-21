import type { HandLandmarkerResult } from "@mediapipe/tasks-vision";
export interface InferenceResult {
  result: HandLandmarkerResult;
  inferenceMs: number;
  blockingMs: number;
}
export class WorkerTracker {
  private pending: {
    resolve: (v: InferenceResult) => void;
    reject: (e: Error) => void;
    blockingMs: number;
  } | null = null;
  private closed = false;
  private constructor(private worker: Worker) {
    worker.onmessage = ({ data }) => {
      if (!this.pending) return;
      const p = this.pending;
      this.pending = null;
      if (data.type === "result")
        p.resolve({
          result: data.result,
          inferenceMs: data.inferenceMs,
          blockingMs: p.blockingMs,
        });
      else p.reject(new Error(data.message ?? "Tracking worker failed"));
    };
    worker.onerror = () => {
      this.pending?.reject(new Error("Tracking worker crashed"));
      this.pending = null;
    };
  }
  static create(): Promise<WorkerTracker> {
    return new Promise((resolve, reject) => {
      if (
        typeof Worker === "undefined" ||
        typeof OffscreenCanvas === "undefined" ||
        typeof createImageBitmap === "undefined"
      ) {
        reject(new Error("Worker image inference is unsupported"));
        return;
      }
      const worker = new Worker("/tracking-worker.js");
      const timer = setTimeout(() => {
        worker.terminate();
        reject(new Error("Worker initialization timed out"));
      }, 45000);
      worker.onmessage = ({ data }) => {
        clearTimeout(timer);
        if (data.type === "ready") resolve(new WorkerTracker(worker));
        else {
          worker.terminate();
          reject(new Error(data.message ?? "Worker initialization failed"));
        }
      };
      worker.onerror = () => {
        clearTimeout(timer);
        worker.terminate();
        reject(new Error("Worker is incompatible with this runtime"));
      };
      worker.postMessage({ type: "init" });
    });
  }
  async predict(
    video: HTMLVideoElement,
    time: number,
  ): Promise<InferenceResult> {
    if (this.closed || this.pending)
      throw new Error("Tracking worker is closed or busy");
    const bitmap = await createImageBitmap(video, {
      resizeWidth: 640,
      resizeHeight: Math.round((640 * video.videoHeight) / video.videoWidth),
    });
    if (this.closed) {
      bitmap.close();
      throw new Error("Tracking cancelled");
    }
    return new Promise((resolve, reject) => {
      const began = performance.now();
      this.pending = { resolve, reject, blockingMs: 0 };
      try {
        this.worker.postMessage({ type: "frame", bitmap, time }, [bitmap]);
        this.pending.blockingMs = performance.now() - began;
      } catch (e) {
        bitmap.close();
        this.pending = null;
        reject(e);
      }
    });
  }
  close() {
    this.closed = true;
    this.worker.terminate();
    this.pending?.reject(new Error("Tracking cancelled"));
    this.pending = null;
  }
}
