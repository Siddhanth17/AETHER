"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { type Point } from "@/core/portal";
import { GestureEngine } from "./gestures";
import { WorkerTracker } from "./workerClient";
import type { Calibration } from "./calibration";
export interface TrackingSample {
  gesture: string;
  confidence: number;
  latency: number;
  point: Point | null;
  span: number | null;
  circle: boolean;
  landmarks?: Point[][];
  source?: { width: number; height: number };
  backend?: string;
  blockingMs?: number;
  workerError?: string;
  sampleTime?: number;
}
export function useCamera(
  onSample: (sample: TrackingSample) => void,
  calibration: Calibration | null = null,
) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const tracker = useRef<HandLandmarker | null>(null);
  const worker = useRef<WorkerTracker | null>(null);
  const workerInit = useRef<AbortController | null>(null);
  const profile = useRef(calibration);
  useEffect(() => {
    profile.current = calibration;
  }, [calibration]);
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
    workerInit.current?.abort();
    workerInit.current = null;
    cancelAnimationFrame(frame.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    tracker.current?.close();
    tracker.current = null;
    worker.current?.close();
    worker.current = null;
    if (video.current) video.current.srcObject = null;
    setActive(false);
    setLoading(false);
  }, []);
  useEffect(
    () => () => {
      generation.current++;
      workerInit.current?.abort();
      cancelAnimationFrame(frame.current);
      stream.current?.getTracks().forEach((t) => t.stop());
      tracker.current?.close();
      worker.current?.close();
    },
    [],
  );
  const start = useCallback(
    async (deviceId: string, resolution: number, preferWorker = true) => {
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
        if (ticket !== generation.current) return;
        media.getVideoTracks()[0].addEventListener("ended", () => {
          stop();
          setError(
            "Camera disconnected. Reconnect it and enable the camera again.",
          );
        });
        let workerModel: WorkerTracker | null = null;
        let workerError = "";
        const init = new AbortController();
        workerInit.current = init;
        if (preferWorker)
          try {
            workerModel = await WorkerTracker.create(init.signal);
          } catch (e) {
            workerError = e instanceof Error ? e.message : "Worker unavailable";
          }
        if (ticket !== generation.current) {
          workerModel?.close();
          return;
        }
        worker.current = workerModel;
        let model: HandLandmarker | null = null;
        if (!workerModel) {
          const files = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm",
          );
          if (ticket !== generation.current) return;
          model = await HandLandmarker.createFromOptions(files, {
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
        }
        if (ticket !== generation.current) {
          model?.close();
          workerModel?.close();
          return;
        }
        tracker.current = model;
        setLoading(false);
        let previous = -1,
          lastInference = 0;
        let busy = false;
        const engine = new GestureEngine();
        const tick = async (now: number) => {
          frame.current = requestAnimationFrame(tick);
          const v = video.current;
          if (
            !v ||
            v.readyState < 2 ||
            v.currentTime === previous ||
            now - lastInference < 66 ||
            busy
          )
            return;
          previous = v.currentTime;
          lastInference = now;
          busy = true;
          try {
            const began = performance.now();
            const inferred = workerModel
              ? await workerModel.predict(v, now)
              : null;
            const result = inferred?.result ?? model!.detectForVideo(v, now);
            if (ticket !== generation.current) return;
            if (profile.current)
              engine.configure(
                profile.current.pinchEnter,
                profile.current.pinchExit,
              );
            const preferred = profile.current
              ? result.handedness.findIndex(
                  (h) => h[0]?.categoryName === profile.current!.hand,
                )
              : 0;
            const primary = preferred >= 0 ? preferred : 0;
            const hands =
              primary === 0
                ? result.landmarks
                : [
                    result.landmarks[primary],
                    ...result.landmarks.filter((_, i) => i !== primary),
                  ];
            const interpreted = engine.update(hands, now);
            callback.current({
              ...interpreted,
              confidence: result.handedness[primary]?.[0]?.score ?? 0,
              latency: inferred?.inferenceMs ?? performance.now() - began,
              blockingMs: inferred?.blockingMs ?? performance.now() - began,
              backend: workerModel ? "Worker" : "Main thread fallback",
              workerError,
              sampleTime: now,
              landmarks: result.landmarks,
              source: { width: v.videoWidth, height: v.videoHeight },
            });
          } catch {
            if (ticket !== generation.current) return;
            cancelAnimationFrame(frame.current);
            setError("Hand tracking stopped. Restart the camera to retry.");
          } finally {
            busy = false;
          }
        };
        frame.current = requestAnimationFrame(tick);
      } catch (e) {
        if (ticket !== generation.current) return;
        stop();
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
