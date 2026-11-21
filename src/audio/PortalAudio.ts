import type { PortalState } from "../core/portal";
export class PortalAudio {
  readonly context: AudioContext;
  readonly capture: MediaStreamAudioDestinationNode;
  private master: GainNode;
  private effects: GainNode;
  private hum: GainNode;
  private panner: PannerNode;
  private sources = new Set<AudioScheduledSourceNode>();
  private open = false;
  private destroyed = false;
  constructor() {
    if (typeof AudioContext === "undefined")
      throw new Error("Web Audio is unavailable.");
    const c = (this.context = new AudioContext());
    this.capture = c.createMediaStreamDestination();
    this.master = c.createGain();
    this.master.gain.value = 0.5;
    this.effects = c.createGain();
    this.effects.gain.value = 0.7;
    this.hum = c.createGain();
    this.hum.gain.value = 0;
    this.panner = c.createPanner();
    this.panner.panningModel = "equalpower";
    this.panner.distanceModel = "inverse";
    this.panner.refDistance = 2;
    this.panner.maxDistance = 20;
    this.panner.rolloffFactor = 1;
    this.hum.connect(this.panner);
    this.panner.connect(this.effects);
    this.effects.connect(this.master);
    this.master.connect(c.destination);
    this.master.connect(this.capture);
    for (const frequency of [82.4, 123.6, 164.8]) {
      const osc = c.createOscillator();
      osc.type = "sine";
      osc.frequency.value = frequency;
      osc.connect(this.hum);
      this.track(osc);
      osc.start();
    }
  }
  private track(source: AudioScheduledSourceNode) {
    this.sources.add(source);
    source.onended = () => {
      source.disconnect();
      this.sources.delete(source);
    };
  }
  async enable() {
    if (this.destroyed) return;
    await this.context.resume();
  }
  volumes(master: number, effects: number, muted: boolean) {
    if (this.destroyed) return;
    const t = this.context.currentTime;
    this.master.gain.setTargetAtTime(muted ? 0 : master, t, 0.04);
    this.effects.gain.setTargetAtTime(effects, t, 0.04);
  }
  update(s: PortalState) {
    if (this.destroyed) return;
    const t = this.context.currentTime;
    this.panner.positionX.setTargetAtTime(s.x, t, 0.12);
    this.panner.positionY.setTargetAtTime(s.y, t, 0.12);
    this.panner.positionZ.setTargetAtTime(-3, t, 0.12);
    this.hum.gain.setTargetAtTime(
      s.open ? 0.025 * (0.7 + s.intensity * 0.3) : 0,
      t,
      s.open ? 0.55 : 0.2,
    );
    if (s.open !== this.open) {
      this.open = s.open;
      this.burst(s.open ? "open" : "close");
    }
  }
  burst(kind: "open" | "close" | "gesture" | "ui") {
    if (this.destroyed || this.context.state !== "running") return;
    const c = this.context,
      t = c.currentTime,
      duration = kind === "open" ? 1.25 : kind === "close" ? 0.75 : 0.12;
    const osc = c.createOscillator(),
      envelope = c.createGain();
    osc.type = kind === "ui" ? "sine" : "triangle";
    osc.frequency.setValueAtTime(
      kind === "open" ? 65 : kind === "close" ? 340 : 620,
      t,
    );
    osc.frequency.exponentialRampToValueAtTime(
      kind === "open" ? 280 : kind === "close" ? 45 : 420,
      t + duration,
    );
    envelope.gain.setValueAtTime(0, t);
    envelope.gain.linearRampToValueAtTime(
      kind === "open" ? 0.06 : 0.025,
      t + 0.03,
    );
    envelope.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(envelope);
    envelope.connect(this.panner);
    this.track(osc);
    osc.onended = () => {
      osc.disconnect();
      envelope.disconnect();
      this.sources.delete(osc);
    };
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }
  async close() {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const source of this.sources) {
      try {
        source.stop();
      } catch {}
      source.disconnect();
    }
    this.sources.clear();
    this.master.disconnect();
    this.effects.disconnect();
    this.hum.disconnect();
    this.panner.disconnect();
    this.capture.disconnect();
    this.capture.stream.getTracks().forEach((t) => t.stop());
    await this.context.close();
  }
  get sourceCount() {
    return this.sources.size;
  }
}
