"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { clamp, isCircle, type Point } from "@/core/portal";
export interface TrackingSample {
  gesture: string;
  confidence: number;
  latency: number;
  point: Point | null;
  span: number | null;
  circle: boolean;
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
          lastInference = 0,
          candidate = "",
          stable = 0,
          lastCircle = 0;
        let history: Point[] = [];
        let smooth: Point | null = null;
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
            const hand = result.landmarks[0];
            if (!hand) {
              history = [];
              stable = 0;
              smooth = null;
              callback.current({
                gesture: "No hands",
                confidence: 0,
                latency: performance.now() - began,
                point: null,
                span: null,
                circle: false,
              });
              return;
            }
            const distance = (a: number, b: number) =>
              Math.hypot(hand[a].x - hand[b].x, hand[a].y - hand[b].y);
            const palm = Math.max(0.02, distance(0, 9));
            const pinch = distance(4, 8) / palm;
            const extended = [8, 12, 16, 20].filter(
              (i) => distance(i, 0) > distance(i - 2, 0) * 1.15,
            ).length;
            const gesture =
              pinch < 0.35
                ? "Pinch"
                : extended >= 4
                  ? "Open palm"
                  : extended === 0
                    ? "Fist"
                    : "Move";
            if (gesture === candidate) stable++;
            else {
              candidate = gesture;
              stable = 1;
            }
            const raw = { x: 1 - hand[8].x, y: hand[8].y };
            smooth = smooth
              ? {
                  x: smooth.x * 0.65 + raw.x * 0.35,
                  y: smooth.y * 0.65 + raw.y * 0.35,
                }
              : raw;
            history.push(raw);
            if (history.length > 70) history.shift();
            let circle = false;
            if (
              history.length >= 24 &&
              now - lastCircle > 2500 &&
              isCircle(history)
            ) {
              circle = true;
              lastCircle = now;
              history = [];
            }
            const second = result.landmarks[1];
            const span = second
              ? clamp(
                  Math.hypot(hand[0].x - second[0].x, hand[0].y - second[0].y) *
                    3,
                  0.4,
                  1.8,
                )
              : null;
            callback.current({
              gesture: stable >= 3 ? gesture : "Move",
              confidence: result.handedness[0]?.[0]?.score ?? 0,
              latency: performance.now() - began,
              point: smooth,
              span,
              circle,
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
