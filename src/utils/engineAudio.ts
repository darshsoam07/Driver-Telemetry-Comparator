/**
 * Web Audio API F1 Hybrid Engine Sound Synthesizer
 * Safe client-side procedural audio - no external audio files required.
 */
class F1EngineAudio {
  private ctx: AudioContext | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isMuted: boolean = true;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    } catch {
      console.warn('Web Audio not supported');
    }
  }

  public start() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.osc1) return; // already started

    // V6 Engine fundamental frequency harmonics
    this.osc1 = this.ctx.createOscillator();
    this.osc2 = this.ctx.createOscillator();
    this.osc1.type = 'sawtooth';
    this.osc2.type = 'triangle';

    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(1400, this.ctx.currentTime);

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);

    this.osc1.connect(this.filterNode);
    this.osc2.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    this.osc1.start();
    this.osc2.start();
  }

  public updateRPM(rpm: number, throttle: number) {
    if (!this.ctx || !this.osc1 || !this.osc2 || !this.gainNode || !this.filterNode) return;
    const now = this.ctx.currentTime;
    
    // Formula 1 V6 cylinder firing rate: 3 firings per revolution -> (rpm / 60) * 3 Hz
    const freq = Math.max(60, (rpm / 60) * 2.5);
    this.osc1.frequency.setTargetAtTime(freq, now, 0.05);
    this.osc2.frequency.setTargetAtTime(freq * 1.5, now, 0.05);

    // Throttle opens up air intake and filter resonance
    const filterFreq = 800 + (throttle / 100) * 2400;
    this.filterNode.frequency.setTargetAtTime(filterFreq, now, 0.05);

    if (!this.isMuted) {
      const targetGain = 0.03 + (throttle / 100) * 0.07;
      this.gainNode.gain.setTargetAtTime(targetGain, now, 0.05);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(muted ? 0 : 0.08, this.ctx.currentTime, 0.05);
    }
  }

  public stop() {
    try {
      this.osc1?.stop();
      this.osc2?.stop();
      this.osc1?.disconnect();
      this.osc2?.disconnect();
    } catch {
      // ignore already stopped
    }
    this.osc1 = null;
    this.osc2 = null;
  }
}

export const engineAudio = new F1EngineAudio();
