import { containRect, coverRect } from "../renderer/compositing";
import { recordingDimensions, selectRecordingFormat } from "./formats";
export interface CaptureStats {
  seconds: number;
  frames: number;
  lateSlots: number;
  active: boolean;
  format: string;
}
export class CompositeRecorder {
  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private frame = 0;
  private disposed = false;
  private failed = false;
  private chunks: Blob[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  constructor(
    private source: () => HTMLCanvasElement | null,
    private video: () => HTMLVideoElement | null,
    private onStats: (stats: CaptureStats) => void,
    private onNotice: (message: string) => void,
  ) {}
  start(height: number, audio?: MediaStream) {
    if (this.disposed || this.recorder)
      throw new Error("Recording session is not available.");
    if (
      typeof MediaRecorder === "undefined" ||
      !HTMLCanvasElement.prototype.captureStream
    )
      throw new Error("Canvas recording is unsupported in this browser.");
    const mime = selectRecordingFormat((m) => MediaRecorder.isTypeSupported(m));
    if (!mime) throw new Error("No supported WebM encoder.");
    const dimensions = recordingDimensions(height),
      canvas = document.createElement("canvas");
    Object.assign(canvas, dimensions);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Recording compositor could not initialize.");
    if (!this.source()) throw new Error("The renderer is not ready.");
    let frames = 0,
      lateSlots = 0,
      last = 0,
      lastReport = 0;
    const began = performance.now();
    const report = (active: boolean) =>
      this.onStats({
        seconds: (performance.now() - began) / 1000,
        frames,
        lateSlots,
        active,
        format: mime,
      });
    const composite = (now: number) => {
      if (this.disposed || this.failed) return;
      this.frame = requestAnimationFrame(composite);
      if (now - last < 1000 / 30) return;
      if (last && now - last > 1000 / 15)
        lateSlots += Math.max(0, Math.floor((now - last) / (1000 / 30)) - 1);
      last = now;
      try {
        const source = this.source();
        if (!source) throw new Error("Renderer unavailable during recording.");
        context.fillStyle = "#090a10";
        context.fillRect(0, 0, canvas.width, canvas.height);
        const viewport = containRect(
          source.width,
          source.height,
          canvas.width,
          canvas.height,
        );
        const video = this.video();
        if (video?.srcObject && video.readyState >= 2) {
          context.save();
          context.beginPath();
          context.rect(viewport.x, viewport.y, viewport.width, viewport.height);
          context.clip();
          context.translate(viewport.x, viewport.y);
          context.globalAlpha = 0.75;
          context.filter = video.style.filter || "none";
          if (video.classList.contains("mirrored")) {
            context.translate(viewport.width, 0);
            context.scale(-1, 1);
          }
          const camera = coverRect(
            video.videoWidth,
            video.videoHeight,
            viewport.width,
            viewport.height,
          );
          context.drawImage(
            video,
            camera.x,
            camera.y,
            camera.width,
            camera.height,
          );
          context.restore();
        }
        context.drawImage(
          source,
          viewport.x,
          viewport.y,
          viewport.width,
          viewport.height,
        );
        frames++;
        if (now - lastReport > 500) {
          lastReport = now;
          report(true);
        }
      } catch (e) {
        this.failed = true;
        this.onNotice(e instanceof Error ? e.message : "Compositing failed.");
        this.stop();
      }
    };
    try {
      this.stream = canvas.captureStream(30);
      if (audio)
        for (const track of audio.getAudioTracks())
          this.stream.addTrack(track.clone());
      const mr = (this.recorder = new MediaRecorder(this.stream, {
        mimeType: mime,
        videoBitsPerSecond: height === 1080 ? 8_000_000 : 5_000_000,
      }));
      mr.ondataavailable = (e) => {
        if (e.data.size && !this.disposed) this.chunks.push(e.data);
      };
      mr.onerror = () => {
        this.failed = true;
        this.onNotice("Video encoder failed. Try a lower resolution.");
        if (mr.state !== "inactive") mr.stop();
        else {
          this.cleanup();
          report(false);
        }
      };
      mr.onstop = () => {
        this.cleanup();
        if (this.disposed) return;
        report(false);
        if (this.failed) {
          this.chunks = [];
          return;
        }
        if (!this.chunks.length) {
          this.onNotice(
            "The encoder produced no video. Try recording for longer.",
          );
          return;
        }
        const blob = new Blob(this.chunks, { type: mime });
        this.chunks = [];
        const url = URL.createObjectURL(blob),
          a = document.createElement("a");
        a.href = url;
        a.download = `aether-${Date.now()}-${height}p.webm`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        this.onNotice(
          `Recording exported · ${dimensions.width}×${height} WebM`,
        );
      };
      mr.start(250);
      report(true);
      this.frame = requestAnimationFrame(composite);
      this.timer = setTimeout(() => {
        this.onNotice("Three-minute local recording limit reached. Exporting.");
        this.stop();
      }, 180000);
    } catch (e) {
      this.cleanup();
      this.recorder = null;
      throw e;
    }
  }
  stop() {
    if (this.recorder && this.recorder.state !== "inactive")
      this.recorder.stop();
  }
  private cleanup() {
    cancelAnimationFrame(this.frame);
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }
  dispose() {
    this.disposed = true;
    if (this.recorder) {
      this.recorder.onstop = null;
      this.recorder.ondataavailable = null;
      this.recorder.onerror = null;
      this.stop();
    }
    this.cleanup();
    this.chunks = [];
    this.recorder = null;
  }
}
