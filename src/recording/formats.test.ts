import { it, expect } from "vitest";
import { selectRecordingFormat, recordingDimensions } from "./formats";
it("negotiates an actual supported WebM encoder without promising MP4", () => {
  expect(selectRecordingFormat((m) => m.includes("vp9"))).toBe(
    "video/webm;codecs=vp9",
  );
  expect(selectRecordingFormat(() => false)).toBeNull();
});
it("uses exact HD dimensions and rejects unsupported capture sizes", () => {
  expect(recordingDimensions(1080)).toEqual({ width: 1920, height: 1080 });
  expect(recordingDimensions(720)).toEqual({ width: 1280, height: 720 });
  expect(() => recordingDimensions(2160)).toThrow();
});
