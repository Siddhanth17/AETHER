export const recordingFormats = [
  "video/webm;codecs=vp8",
  "video/webm;codecs=vp9",
  "video/webm",
] as const;
export function selectRecordingFormat(supported: (mime: string) => boolean) {
  return recordingFormats.find(supported) ?? null;
}
export function recordingDimensions(height: number) {
  if (height !== 720 && height !== 1080)
    throw new Error("Recording resolution must be 720p or 1080p.");
  return { width: (height * 16) / 9, height };
}
