import type { Page } from "@playwright/test";
/** A real CanvasCaptureMediaStreamTrack; no native/physical camera device is needed. */
export async function installSyntheticCamera(
  page: Page,
  rejectPlayback = false,
) {
  await page.addInitScript(
    ({ rejectPlayback }) => {
      Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
        value: async () => {
          const canvas = document.createElement("canvas");
          canvas.width = 960;
          canvas.height = 540;
          const context = canvas.getContext("2d")!;
          const stream = canvas.captureStream(30);
          (window as unknown as { grantedStream: MediaStream }).grantedStream =
            stream;
          let frame = 0;
          const paint = () => {
            if (stream.getVideoTracks()[0].readyState === "ended") return;
            context.fillStyle = "#28384a";
            context.fillRect(0, 0, 960, 540);
            context.fillStyle = "#bda986";
            context.fillRect(frame++ % 400, 250, 80, 30);
            requestAnimationFrame(paint);
          };
          paint();
          return stream;
        },
      });
      if (rejectPlayback)
        HTMLMediaElement.prototype.play = () =>
          Promise.reject(
            new DOMException("Playback unavailable", "NotSupportedError"),
          );
    },
    { rejectPlayback },
  );
}
