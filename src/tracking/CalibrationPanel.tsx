"use client";
import { useEffect, useRef, useState } from "react";
import {
  CalibrationSession,
  calibrationInstructions,
  type Calibration,
} from "./calibration";
import type { TrackingSample } from "./useCamera";
export default function CalibrationPanel({
  sample,
  onComplete,
  onCancel,
}: {
  sample: TrackingSample;
  onComplete: (c: Calibration) => void;
  onCancel: () => void;
}) {
  const session = useRef(new CalibrationSession());
  const [step, setStep] = useState(0),
    [hand, setHand] = useState<"Left" | "Right">("Right");
  useEffect(() => {
    session.current.update(sample, performance.now());
    const frame = requestAnimationFrame(() => setStep(session.current.step));
    return () => cancelAnimationFrame(frame);
  }, [sample]);
  return (
    <div
      className="calibration panel"
      role="region"
      aria-label="Hand calibration"
    >
      <div className="panel-heading">Hand calibration · {step + 1}/9</div>
      <h2>{calibrationInstructions[step]}</h2>
      <p>
        Use comfortable movements. Actions are paused during calibration. Keep
        your hand inside the camera frame.
      </p>
      {step === 1 && (
        <>
          <label htmlFor="preferred-hand">
            Preferred hand (confirm what you see)
          </label>
          <select
            id="preferred-hand"
            value={hand}
            onChange={(e) => setHand(e.target.value as "Left" | "Right")}
          >
            <option>Left</option>
            <option>Right</option>
          </select>
          <button
            onClick={() => {
              session.current.confirmHand();
              setStep(session.current.step);
            }}
          >
            Confirm hand
          </button>
        </>
      )}
      {step === 8 ? (
        <button
          className="primary"
          onClick={() => {
            const c = session.current.result(hand);
            if (c) onComplete(c);
          }}
        >
          Save calibration
        </button>
      ) : (
        <p role="status">
          {sample.gesture} · {sample.backend ?? "waiting for inference"}
          {step === 6
            ? " · sweep both horizontally and vertically"
            : step === 7
              ? " · use both open hands"
              : ""}
        </p>
      )}
      <button onClick={onCancel}>Cancel calibration</button>
    </div>
  );
}
