"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { type Point } from "@/core/portal";
import { GestureEngine } from "./gestures";
export interface TrackingSample {
  gesture: string;
  confidence: number;
  latency: number;
  point: Point | null;
  span: number | null;
  circle: boolean;
  landmarks?: Point[][];
  source?: { width: number; height: number };
}
export function useCamera(onSample: (sample: TrackingSample) => void) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const tracker = useRef<HandLandmarker | null>(null);
  const frame = useRef(0);
  const generation = useRef(0);
  const callback = useRef(onSample);
  useEffect(() => {
    callback.current = onSample;
  }, [onSample]);
  const [active, setActive] = useState(false),
    [error, setError] = useState(""),
    [devices, setDevices] = useState<MediaDeviceInfo[]>([]),
    [loading, setLoading] = useState(false);
  const stop = useCallback(() => {
    generation.current++;
    cancelAnimationFrame(frame.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    tracker.current?.close();
    tracker.current = null;
    if (video.current) video.current.srcObject = null;
    setActive(false);
    setLoading(false);
  }, []);
  useEffect(
    () => () => {
      generation.current++;
      cancelAnimationFrame(frame.current);
      stream.current?.getTracks().forEach((t) => t.stop());
      tracker.current?.close();
    },
    [],
  );
  const start = useCallback(
    async (deviceId: string, resolution: number) => {
      stop();
      const ticket = generation.current;
      setError("");
      setLoading(true);
      try {
        if (!navigator.mediaDevices?.getUserMedia)
          throw new Error(
            "Camera access requires localhost or HTTPS and a supported browser.",
          );
        const media = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: resolution },
            height: { ideal: (resolution * 9) / 16 },
            ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
          },
          audio: false,
        });
        if (ticket !== generation.current) {
          media.getTracks().forEach((t) => t.stop());
          return;
        }
        stream.current = media;
        if (video.current) {
          video.current.srcObject = media;
          await video.current.play();
        }
        if (ticket !== generation.current) return;
        setActive(true);
        setDevices(
          (await navigator.mediaDevices.enumerateDevices()).filter(
            (d) => d.kind === "videoinput",
          ),
        );
        media.getVideoTracks()[0].addEventListener("ended", () => {
          stop();
          setError(
            "Camera disconnected. Reconnect it and enable the camera again.",
          );
        });
        const files = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm",
        );
        if (ticket !== generation.current) return;
        const model = await HandLandmarker.createFromOptions(files, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.65,
          minTrackingConfidence: 0.65,
        });
        if (ticket !== generation.current) {
          model.close();
          return;
        }
        tracker.current = model;
        setLoading(false);
        let previous = -1,
          lastInference = 0;
        const engine = new GestureEngine();
        const tick = (now: number) => {
          frame.current = requestAnimationFrame(tick);
          const v = video.current;
          if (
            !v ||
            v.readyState < 2 ||
            v.currentTime === previous ||
            now - lastInference < 66
          )
            return;
          previous = v.currentTime;
          lastInference = now;
          try {
            const began = performance.now();
            const result = model.detectForVideo(v, now);
            const interpreted = engine.update(result.landmarks, now);
            callback.current({
              ...interpreted,
              confidence: result.handedness[0]?.[0]?.score ?? 0,
              latency: performance.now() - began,
              landmarks: result.landmarks,
              source: { width: v.videoWidth, height: v.videoHeight },
            });
          } catch {
            cancelAnimationFrame(frame.current);
            setError("Hand tracking stopped. Restart the camera to retry.");
          }
        };
        frame.current = requestAnimationFrame(tick);
      } catch (e) {
        if (ticket !== generation.current) return;
        setLoading(false);
        setError(
          e instanceof Error
            ? e.message
            : "Camera or tracking initialization failed.",
        );
      }
    },
    [stop],
  );
  return { video, active, error, devices, loading, start, stop };
}
