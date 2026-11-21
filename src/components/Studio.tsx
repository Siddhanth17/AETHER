"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Aperture,
  Camera,
  ChevronRight,
  Circle,
  Expand,
  Hand,
  Layers,
  Maximize2,
  MousePointer2,
  PanelLeftClose,
  PanelRightClose,
  Play,
  RotateCcw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import PortalCanvas from "./PortalCanvas";
import {
  clamp,
  initialPortal,
  type Destination,
  type PortalState,
  type Quality,
} from "@/core/portal";
import { useCamera, type TrackingSample } from "@/tracking/useCamera";
import { cameraToScreen } from "@/tracking/gestures";
import HandOverlay from "@/tracking/HandOverlay";
import CalibrationPanel from "@/tracking/CalibrationPanel";
import {
  validCalibration,
  calibratedPoint,
  type Calibration,
} from "@/tracking/calibration";
export default function Studio() {
  useEffect(() => {
    document.documentElement.dataset.aetherReady = "true";
    return () => {
      delete document.documentElement.dataset.aetherReady;
    };
  }, []);
  const [studio, setStudio] = useState(false),
    [calibration, setCalibration] = useState<Calibration | null>(null),
    [calibrating, setCalibrating] = useState(false),
    [rawSample, setRawSample] = useState<TrackingSample | null>(null),
    [preferWorker, setPreferWorker] = useState(true),
    [portal, setPortal] = useState<PortalState>(initialPortal),
    [quality, setQuality] = useState<Quality>("Balanced"),
    [settings, setSettings] = useState(false),
    [left, setLeft] = useState(true),
    [right, setRight] = useState(true),
    [fps, setFps] = useState(0),
    [calls, setCalls] = useState(0),
    [notice, setNotice] = useState(""),
    [graphicsError, setGraphicsError] = useState(""),
    [renderKey, setRenderKey] = useState(0),
    [mirror, setMirror] = useState(true),
    [device, setDevice] = useState(""),
    [resolution, setResolution] = useState(1280),
    [sound, setSound] = useState(false),
    [recording, setRecording] = useState(false),
    [recordSize, setRecordSize] = useState(1080),
    [draw, setDraw] = useState(false),
    [diagnostics, setDiagnostics] = useState<TrackingSample>({
      gesture: "Mouse input",
      confidence: 0,
      latency: 0,
      point: null,
      span: null,
      circle: false,
    });
  const canvasHost = useRef<HTMLDivElement>(null),
    recorder = useRef<MediaRecorder | null>(null),
    recordStream = useRef<MediaStream | null>(null),
    recordFrame = useRef(0),
    audio = useRef<AudioContext | null>(null),
    gain = useRef<GainNode | null>(null),
    drag = useRef(false),
    points = useRef<{ x: number; y: number }[]>([]),
    lastGesture = useRef(0);
  const patch = useCallback(
    (value: Partial<PortalState>) => setPortal((p) => ({ ...p, ...value })),
    [],
  );
  const sample = useCallback(
    (s: TrackingSample) => {
      setRawSample(s);
      const calibrated =
        s.point && calibration ? calibratedPoint(s.point, calibration) : null;
      const bounds = canvasHost.current?.getBoundingClientRect();
      if (s.source && bounds) {
        const map = (p: { x: number; y: number }) =>
          cameraToScreen(p, s.source!, bounds, mirror);
        s = {
          ...s,
          point: s.point ? map(s.point) : null,
          landmarks: s.landmarks?.map((hand) => hand.map(map)),
        };
      }
      setDiagnostics(s);
      if (calibrating) return;
      if (calibrated)
        s = {
          ...s,
          point: {
            x: mirror ? 1 - calibrated.x : calibrated.x,
            y: calibrated.y,
          },
        };
      const now = performance.now();
      if (s.circle) {
        patch({
          open: true,
          ...(s.point
            ? {
                x: clamp((s.point.x - 0.5) * 4, -2, 2),
                y: clamp((0.5 - s.point.y) * 3, -1.5, 1.5),
              }
            : {}),
        });
        setNotice("Circle recognized · portal opened");
      }
      if (s.gesture === "Pinch" && s.point)
        patch({ x: (s.point.x - 0.5) * 4, y: (0.5 - s.point.y) * 3 });
      if (s.span !== null && s.gesture === "Open palm")
        patch({
          scale: calibration
            ? clamp(
                0.4 +
                  ((s.span - calibration.scaleMin) /
                    (calibration.scaleMax - calibration.scaleMin)) *
                    1.4,
                0.4,
                1.8,
              )
            : s.span,
        });
      if (s.gesture === "Fist" && now - lastGesture.current > 2000) {
        patch({ open: false });
        lastGesture.current = now;
      }
    },
    [patch, mirror, calibrating, calibration],
  );
  const { video: videoRef, ...camera } = useCamera(sample, calibration);
  const metrics = useCallback((f: number, c: number) => {
      setFps(f);
      setCalls(c);
    }, []),
    error = useCallback((m: string) => setGraphicsError(m), []);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const q = localStorage.getItem("aether-quality");
        const c = JSON.parse(
          localStorage.getItem("aether-calibration") ?? "null",
        );
        if (validCalibration(c)) setCalibration(c);
        if (q === "Low" || q === "Balanced" || q === "High") setQuality(q);
      } catch {}
    });
    return () => cancelAnimationFrame(id);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    const keyboard = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).matches("input,select,textarea,button") ||
        calibrating ||
        settings
      )
        return;
      if (e.code === "Space" && studio) {
        e.preventDefault();
        setPortal((p) => ({ ...p, open: !p.open }));
      }
      if (e.key === "Escape") {
        setSettings(false);
        setDraw(false);
      }
      if (e.key === "+" || e.key === "=")
        setPortal((p) => ({ ...p, scale: clamp(p.scale + 0.1, 0.4, 1.8) }));
      if (e.key === "-")
        setPortal((p) => ({ ...p, scale: clamp(p.scale - 0.1, 0.4, 1.8) }));
    };
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  }, [studio, calibrating, settings]);
  useEffect(
    () => () => {
      if (recorder.current?.state === "recording") recorder.current.stop();
      cancelAnimationFrame(recordFrame.current);
      recordStream.current?.getTracks().forEach((t) => t.stop());
      void audio.current?.close();
    },
    [],
  );
  const toggleSound = async () => {
    try {
      if (!audio.current) {
        audio.current = new AudioContext();
        const osc = audio.current.createOscillator();
        gain.current = audio.current.createGain();
        const pan = audio.current.createStereoPanner();
        osc.type = "sine";
        osc.frequency.value = 110;
        gain.current.gain.value = 0;
        pan.pan.value = clamp(portal.x / 2, -1, 1);
        osc
          .connect(gain.current)
          .connect(pan)
          .connect(audio.current.destination);
        osc.start();
      }
      await audio.current.resume();
      gain.current!.gain.setTargetAtTime(
        sound ? 0 : 0.035,
        audio.current.currentTime,
        0.3,
      );
      setSound(!sound);
    } catch {
      setNotice("Audio could not start in this browser.");
    }
  };
  const record = () => {
    if (recording) {
      recorder.current?.stop();
      return;
    }
    try {
      if (!window.MediaRecorder)
        throw new Error("Recording is unsupported in this browser.");
      const source = canvasHost.current?.querySelector("canvas");
      if (!source) throw new Error("The renderer is not ready.");
      const output = document.createElement("canvas");
      output.width = Math.round((recordSize * 16) / 9);
      output.height = recordSize;
      const ctx = output.getContext("2d")!;
      const composite = () => {
        ctx.fillStyle = "#090a10";
        ctx.fillRect(0, 0, output.width, output.height);
        const v = videoRef.current;
        if (camera.active && v && v.readyState >= 2) {
          ctx.save();
          if (mirror) {
            ctx.translate(output.width, 0);
            ctx.scale(-1, 1);
          }
          const ratio = Math.max(
            output.width / v.videoWidth,
            output.height / v.videoHeight,
          );
          const w = v.videoWidth * ratio,
            h = v.videoHeight * ratio;
          ctx.drawImage(
            v,
            (output.width - w) / 2,
            (output.height - h) / 2,
            w,
            h,
          );
          ctx.restore();
        }
        ctx.drawImage(source, 0, 0, output.width, output.height);
        recordFrame.current = requestAnimationFrame(composite);
      };
      composite();
      const stream = output.captureStream(30);
      recordStream.current = stream;
      const mime = [
        "video/webm;codecs=vp8",
        "video/webm;codecs=vp9",
        "video/webm",
      ].find((m) => MediaRecorder.isTypeSupported(m));
      if (!mime) throw new Error("No supported WebM encoder.");
      const mr = new MediaRecorder(stream, {
        mimeType: mime,
        videoBitsPerSecond: 6_000_000,
      });
      recorder.current = mr;
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      mr.onstop = () => {
        cancelAnimationFrame(recordFrame.current);
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        if (chunks.length) {
          const url = URL.createObjectURL(new Blob(chunks, { type: mime }));
          const a = document.createElement("a");
          a.href = url;
          a.download = `aether-${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 10000);
          setNotice("Recording exported · saved locally as WebM");
        } else
          setNotice(
            "The encoder produced no video. Try 720p and record for longer.",
          );
      };
      mr.onerror = () => {
        setNotice("The video encoder failed.");
        mr.stop();
      };
      mr.start(250);
      setRecording(true);
    } catch (e) {
      cancelAnimationFrame(recordFrame.current);
      recordStream.current?.getTracks().forEach((t) => t.stop());
      setNotice(e instanceof Error ? e.message : "Recording failed.");
    }
  };
  const enter = () => {
    if (window.innerWidth < 760) {
      setLeft(false);
      setRight(false);
    }
    setStudio(true);
    setNotice("Studio ready · camera stays off until you enable it");
  };
  const save = () => {
    try {
      localStorage.setItem("aether-portal", JSON.stringify(portal));
      setNotice("Portal preset saved on this device");
    } catch {
      setNotice("Local storage is unavailable.");
    }
  };
  const load = () => {
    try {
      const p = JSON.parse(localStorage.getItem("aether-portal") ?? "null");
      if (
        !p ||
        !["Sanctuary", "Glacier", "Ember"].includes(p.destination) ||
        typeof p.open !== "boolean" ||
        typeof p.color !== "string" ||
        !/^#[0-9a-f]{6}$/i.test(p.color) ||
        !["scale", "intensity", "x", "y"].every(
          (k) => typeof p[k] === "number" && Number.isFinite(p[k]),
        )
      )
        throw new Error();
      setPortal({
        ...p,
        scale: clamp(p.scale, 0.4, 1.8),
        intensity: clamp(p.intensity, 0, 2),
        x: clamp(p.x, -2, 2),
        y: clamp(p.y, -1.5, 1.5),
      });
      setNotice("Portal preset restored");
    } catch {
      setNotice("No valid saved preset was found.");
    }
  };
  return (
    <main className={studio ? "app studio" : "app landing"} id="top">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header>
        <a
          className="brand"
          href="#top"
          onClick={() => {
            if (!recording) {
              setStudio(false);
              camera.stop();
            }
          }}
        >
          <Aperture size={27} />
          <span>AETHER</span>
          <small>EXPERIMENTAL STUDIO</small>
        </a>
        <nav aria-label="Main navigation">
          {!studio ? (
            <>
              <button onClick={enter}>The studio</button>
              <button
                onClick={() => {
                  enter();
                  setRight(true);
                }}
              >
                Explore worlds
              </button>
              <a
                href="https://github.com/Siddhanth17/AETHER"
                target="_blank"
                rel="noreferrer"
              >
                The project <span>↗</span>
              </a>
            </>
          ) : (
            <span className="project-name">
              Untitled ritual <span>/</span> Local workspace
            </span>
          )}
        </nav>
        <div className="header-actions">
          {studio ? (
            <button
              className={camera.active ? "camera live" : "camera"}
              onClick={() =>
                camera.active || camera.loading
                  ? camera.stop()
                  : void camera.start(device, resolution, preferWorker)
              }
            >
              <Camera size={16} />
              {camera.active
                ? "Stop camera"
                : camera.loading
                  ? "Cancel camera"
                  : "Enable camera"}
            </button>
          ) : (
            <span className="local-label">
              <ShieldCheck size={14} /> Local by default
            </span>
          )}
          <button
            className="icon-button"
            aria-label="Open settings"
            onClick={() => setSettings(true)}
          >
            <Settings2 size={18} />
          </button>
          {!studio && (
            <button className="small-primary" onClick={enter}>
              Enter studio <ChevronRight size={15} />
            </button>
          )}
        </div>
      </header>
      <div className="scene" ref={canvasHost}>
        <video
          ref={videoRef}
          className={`camera-feed ${mirror ? "mirrored" : ""}`}
          autoPlay
          muted
          playsInline
          hidden={!camera.active}
        />
        <PortalCanvas
          key={renderKey}
          state={portal}
          quality={quality}
          onMetrics={metrics}
          onError={error}
        />
        {camera.active && diagnostics.landmarks && (
          <HandOverlay hands={diagnostics.landmarks} />
        )}
        {studio && (
          <div
            className={`interaction ${draw ? "drawing" : ""}`}
            aria-label="Portal interaction surface"
            onPointerDown={(e) => {
              drag.current = true;
              points.current = [
                {
                  x: e.nativeEvent.offsetX / e.currentTarget.clientWidth,
                  y: e.nativeEvent.offsetY / e.currentTarget.clientHeight,
                },
              ];
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!drag.current) return;
              const x = e.nativeEvent.offsetX / e.currentTarget.clientWidth,
                y = e.nativeEvent.offsetY / e.currentTarget.clientHeight;
              if (draw) points.current.push({ x, y });
              else patch({ x: (x - 0.5) * 4, y: (0.5 - y) * 3 });
            }}
            onPointerUp={async () => {
              drag.current = false;
              if (draw) {
                const { isCircle } = await import("@/core/portal");
                if (isCircle(points.current)) {
                  patch({ open: true });
                  setNotice("Circle recognized · portal opened");
                } else
                  setNotice("Draw a full circle, ending where you started.");
                points.current = [];
              }
            }}
            onWheel={(e) =>
              patch({ scale: clamp(portal.scale - e.deltaY * 0.001, 0.4, 1.8) })
            }
          />
        )}
      </div>
      {!studio ? (
        <>
          <section className="hero" id="main-content">
            <div className="eyebrow">
              <span /> A NEW DIMENSION OF CREATION
            </div>
            <h1>
              Reality is yours
              <br />
              to <em>rewrite.</em>
            </h1>
            <p>
              Open a portal. Shape another world.
              <br />
              Create something that shouldn’t be possible.
            </p>
            <div className="hero-actions">
              <button className="primary" onClick={enter}>
                <Sparkles size={17} /> Enter AETHER <ChevronRight size={17} />
              </button>
              <button
                className="text-button"
                onClick={() => {
                  enter();
                  setDraw(true);
                }}
              >
                <Play size={15} /> Try the portal ritual
              </button>
            </div>
            <div className="hero-note">
              <MousePointer2 size={13} /> Start with your mouse. Add a little
              hand magic.
            </div>
          </section>
          <div className="scene-label">
            <span className="crosshair">+</span>
            <div>
              THE SANCTUARY<small>Procedural world · rendered live</small>
            </div>
            <span className="line" />
          </div>
          <footer className="landing-footer">
            <div>
              <span className="status-dot" /> REAL-TIME 3D{" "}
              <span className="divider">/</span> BUILT FOR YOUR BROWSER
            </div>
            <button
              onClick={() => {
                enter();
                setRight(true);
              }}
            >
              A world on the other side <ChevronRight size={14} />
            </button>
            <span>EARLY ACCESS · v0.1</span>
          </footer>
        </>
      ) : (
        <>
          <div className="studio-title" id="main-content">
            <span className="eyebrow">REALITY MAGIC</span>
            <h1>Portal ritual</h1>
            <p>
              {draw
                ? "Draw a circle to open your portal."
                : "Drag to position. Scroll to change scale."}
            </p>
          </div>
          <button
            className="panel-toggle left-toggle icon-button"
            aria-label="Toggle tools panel"
            aria-expanded={left}
            onClick={() => {
              setLeft(!left);
              if (window.innerWidth < 760) setRight(false);
            }}
          >
            <PanelLeftClose size={18} />
          </button>
          {left && (
            <aside className="tools panel">
              <div className="panel-heading">
                Workspace <Layers size={15} />
              </div>
              <button className="tool selected" onClick={() => setDraw(false)}>
                <Aperture size={18} />
                <span>
                  Portal ritual<small>Reality magic</small>
                </span>
              </button>
              <div className="panel-heading separated">INTERACTION</div>
              <button
                className={`tool ${!draw ? "active" : ""}`}
                onClick={() => setDraw(false)}
              >
                <MousePointer2 size={17} /> Move portal
              </button>
              <button
                className={`tool ${draw ? "active" : ""}`}
                onClick={() => setDraw(true)}
              >
                <Circle size={17} /> Draw circle
              </button>
              <button
                className="tool"
                onClick={() => patch({ open: !portal.open })}
              >
                <Expand size={17} />
                {portal.open ? "Collapse portal" : "Open portal"}
                <kbd>␣</kbd>
              </button>
              <div className="tool-guide">
                <Hand size={22} />
                <strong>Your hands, your tools.</strong>
                <p>
                  Enable your camera to draw a circle, pinch to move, or close a
                  fist to collapse.
                </p>
                <span>Camera stays on your device.</span>
              </div>
              <button
                className="tool"
                onClick={() => {
                  patch(initialPortal);
                  setNotice("Portal reset");
                }}
              >
                <RotateCcw size={15} /> Reset ritual
              </button>
            </aside>
          )}
          <button
            className="panel-toggle right-toggle icon-button"
            aria-label="Toggle inspector"
            aria-expanded={right}
            onClick={() => {
              setRight(!right);
              if (window.innerWidth < 760) setLeft(false);
            }}
          >
            <PanelRightClose size={18} />
          </button>
          {right && (
            <aside className="inspector panel">
              <div className="panel-heading">
                Portal properties <Aperture size={15} />
              </div>
              <label>Destination</label>
              <div className="destinations">
                {(["Sanctuary", "Glacier", "Ember"] as Destination[]).map(
                  (d, i) => (
                    <button
                      key={d}
                      aria-pressed={portal.destination === d}
                      className={`destination world-${i} ${portal.destination === d ? "selected" : ""}`}
                      onClick={() => patch({ destination: d })}
                    >
                      <span className="mini-world" />
                      <span>{d}</span>
                      {portal.destination === d && (
                        <span className="selected-dot" />
                      )}
                    </button>
                  ),
                )}
              </div>
              <div className="inspector-section">
                <label htmlFor="view-x">Viewer parallax</label>
                <input
                  id="view-x"
                  type="range"
                  min="-3"
                  max="3"
                  step=".05"
                  value={portal.viewX ?? 0}
                  onChange={(e) => patch({ viewX: +e.target.value })}
                />
                <label htmlFor="portal-yaw">Portal angle</label>
                <input
                  id="portal-yaw"
                  type="range"
                  min="-3.14"
                  max="3.14"
                  step=".05"
                  value={portal.yaw ?? 0}
                  onChange={(e) => patch({ yaw: +e.target.value })}
                />
                <label htmlFor="scale">
                  Portal scale <span>{portal.scale.toFixed(2)}×</span>
                </label>
                <input
                  id="scale"
                  type="range"
                  min=".4"
                  max="1.8"
                  step=".01"
                  value={portal.scale}
                  onChange={(e) => patch({ scale: +e.target.value })}
                />
                <label htmlFor="intensity">
                  Particle intensity{" "}
                  <span>{Math.round(portal.intensity * 100)}%</span>
                </label>
                <input
                  id="intensity"
                  type="range"
                  min="0"
                  max="2"
                  step=".05"
                  value={portal.intensity}
                  onChange={(e) => patch({ intensity: +e.target.value })}
                />
                <label htmlFor="color">
                  Energy color{" "}
                  <input
                    id="color"
                    type="color"
                    value={portal.color}
                    onChange={(e) => patch({ color: e.target.value })}
                  />
                </label>
              </div>
              <div className="inspector-section">
                <div className="panel-heading">Tracking diagnostics</div>
                <button
                  className="tool"
                  onClick={() => {
                    if (!camera.active) {
                      setNotice("Enable your camera before calibration.");
                      return;
                    }
                    setCalibrating(true);
                  }}
                >
                  Calibrate hands
                </button>
                <span>
                  {calibration ? "Calibration saved" : "Not calibrated"}
                </span>
                <dl
                  data-inference-ms={diagnostics.latency}
                  data-blocking-ms={diagnostics.blockingMs ?? 0}
                  data-backend={diagnostics.backend ?? "Idle"}
                  data-sample-at={diagnostics.sampleTime ?? 0}
                >
                  <dt>Input</dt>
                  <dd>{camera.active ? "Camera" : "Mouse + keyboard"}</dd>
                  <dt>Gesture</dt>
                  <dd>{diagnostics.gesture}</dd>
                  <dt>Hand label score</dt>
                  <dd>{Math.round(diagnostics.confidence * 100)}%</dd>
                  <dt>Inference</dt>
                  <dd>{diagnostics.latency.toFixed(1)} ms</dd>
                  <dt>Backend</dt>
                  <dd>{diagnostics.backend ?? "Idle"}</dd>
                  {diagnostics.workerError && (
                    <>
                      <dt>Worker status</dt>
                      <dd>{diagnostics.workerError}</dd>
                    </>
                  )}
                  <dt>Main blocking</dt>
                  <dd>{(diagnostics.blockingMs ?? 0).toFixed(2)} ms</dd>
                </dl>
              </div>
              <div className="button-pair">
                <button onClick={save}>Save preset</button>
                <button onClick={load}>Load preset</button>
              </div>
            </aside>
          )}
          <div className="portal-caption">
            <span className="status-dot" />
            {portal.open
              ? `${portal.destination} · portal active`
              : "Portal collapsed · press Space to open"}
          </div>
          <footer className="studio-footer">
            <div>
              <span className="status-dot" />
              {fps} FPS <span className="divider">/</span>
              {calls} draw calls <span className="divider">/</span>
              <button onClick={() => setSettings(true)}>
                {quality} quality
              </button>
            </div>
            <div className="record-controls">
              <button
                className={recording ? "record active" : "record"}
                onClick={record}
              >
                <span />
                {recording ? "Stop & export" : "Record scene"}
              </button>
              <span>WebM · {recordSize}p</span>
            </div>
            <div>
              <button
                className="icon-button"
                aria-label={sound ? "Mute portal audio" : "Enable portal audio"}
                onClick={() => void toggleSound()}
              >
                {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
              </button>
              <button
                className="icon-button"
                aria-label="Toggle fullscreen"
                onClick={() => {
                  void (
                    document.fullscreenElement
                      ? document.exitFullscreen()
                      : document.documentElement.requestFullscreen()
                  ).catch(() => setNotice("Fullscreen is unavailable."));
                }}
              >
                <Maximize2 size={16} />
              </button>
              <span className={camera.active ? "privacy live" : "privacy"}>
                <ShieldCheck size={13} />
                {camera.active ? "Camera active · local" : "Camera off"}
              </span>
            </div>
          </footer>
        </>
      )}
      {(notice || camera.error || graphicsError) && (
        <div className="toast" role="status">
          {graphicsError || camera.error || notice}
          {graphicsError && (
            <button
              onClick={() => {
                setGraphicsError("");
                setRenderKey((k) => k + 1);
              }}
            >
              Restore graphics
            </button>
          )}
        </div>
      )}
      {settings && (
        <div className="modal-backdrop">
          <section
            className="settings panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
          >
            <div className="panel-heading">
              <h2 id="settings-title">Studio settings</h2>
              <button
                className="icon-button"
                aria-label="Close settings"
                autoFocus
                onClick={() => setSettings(false)}
              >
                <X size={20} />
              </button>
            </div>
            <label htmlFor="quality">Render quality</label>
            <select
              id="quality"
              value={quality}
              onChange={(e) => {
                const q = e.target.value as Quality;
                setQuality(q);
                try {
                  localStorage.setItem("aether-quality", q);
                } catch {
                  setNotice("Quality changed; storage is unavailable.");
                }
              }}
            >
              <option>Low</option>
              <option>Balanced</option>
              <option>High</option>
            </select>
            <label htmlFor="device">Camera</label>
            <select
              id="device"
              value={device}
              onChange={(e) => setDevice(e.target.value)}
            >
              <option value="">System default</option>
              {camera.devices.map((d, i) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Camera ${i + 1}`}
                </option>
              ))}
            </select>
            <label htmlFor="resolution">Camera input</label>
            <select
              id="resolution"
              value={resolution}
              onChange={(e) => setResolution(+e.target.value)}
            >
              <option value={640}>640 × 360</option>
              <option value={1280}>1280 × 720</option>
              <option value={1920}>1920 × 1080</option>
            </select>
            <label className="check">
              <input
                type="checkbox"
                checked={preferWorker}
                onChange={(e) => setPreferWorker(e.target.checked)}
              />{" "}
              Prefer worker tracking (restart camera)
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={mirror}
                onChange={(e) => setMirror(e.target.checked)}
              />{" "}
              Mirror camera
            </label>
            <label htmlFor="record-size">Recording resolution</label>
            <select
              id="record-size"
              value={recordSize}
              disabled={recording}
              onChange={(e) => setRecordSize(+e.target.value)}
            >
              <option value={720}>720p</option>
              <option value={1080}>1080p</option>
            </select>
            <p>
              Camera changes apply when you restart the camera. Video and
              recordings stay local. Hand tracking downloads the MediaPipe
              runtime and model; it does not upload frames.
            </p>
            <button className="primary" onClick={() => setSettings(false)}>
              Apply settings
            </button>
          </section>
        </div>
      )}
      {calibrating && rawSample && (
        <CalibrationPanel
          sample={rawSample}
          onCancel={() => setCalibrating(false)}
          onComplete={(c) => {
            try {
              localStorage.setItem("aether-calibration", JSON.stringify(c));
              setCalibration(c);
              setCalibrating(false);
              setNotice("Calibration saved on this device.");
            } catch {
              setNotice("Could not save calibration.");
            }
          }}
        />
      )}
    </main>
  );
}
