type SfxType = 'move' | 'rotate' | 'land' | 'pop' | 'chain' | 'gameover';

class PuyoAudio {
  private ctx: AudioContext | null = null;
  private bgmNodes: AudioNode[] = [];
  private bgmTimeout: ReturnType<typeof setTimeout> | null = null;
  muted = false;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    type: OscillatorType,
    startTime: number,
    duration: number,
    gainPeak: number,
    freqEnd?: number,
  ): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (freqEnd !== undefined) {
      osc.frequency.linearRampToValueAtTime(freqEnd, startTime + duration);
    }

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  }

  playSfx(type: SfxType, chainCount = 1): void {
    if (this.muted) return;
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    switch (type) {
      case 'move':
        this.playTone(220, 'sine', now, 0.04, 0.15);
        break;
      case 'rotate':
        this.playTone(330, 'triangle', now, 0.05, 0.12);
        break;
      case 'land':
        this.playTone(120, 'sine', now, 0.08, 0.3, 60);
        break;
      case 'pop':
        this.playTone(600, 'triangle', now, 0.12, 0.25, 300);
        this.playTone(800, 'triangle', now + 0.03, 0.1, 0.2, 400);
        break;
      case 'chain': {
        const baseFreqs = [523, 659, 784, 1047, 1319];
        const steps = Math.min(chainCount, 5);
        for (let i = 0; i < steps; i++) {
          this.playTone(baseFreqs[i], 'triangle', now + i * 0.08, 0.15, 0.3);
        }
        break;
      }
      case 'gameover': {
        const melody = [494, 440, 392, 349, 330, 294, 262];
        melody.forEach((f, i) => {
          this.playTone(f, 'sine', now + i * 0.18, 0.2, 0.25);
        });
        break;
      }
    }
  }

  // Simple BGM: repeating arpeggiated chord loop
  playBgm(): void {
    if (this.muted) return;
    this.stopBgm();
    const ctx = this.getCtx();

    const notes = [523, 659, 784, 659, 523, 392, 330, 392];
    const beatMs = 180;
    let step = 0;

    const scheduleNext = () => {
      if (this.muted) return;
      const now = ctx.currentTime;
      this.playTone(notes[step % notes.length], 'triangle', now, (beatMs / 1000) * 0.8, 0.08);
      step++;
      this.bgmTimeout = setTimeout(scheduleNext, beatMs);
    };
    scheduleNext();
  }

  stopBgm(): void {
    if (this.bgmTimeout !== null) {
      clearTimeout(this.bgmTimeout);
      this.bgmTimeout = null;
    }
    this.bgmNodes.forEach((n) => {
      try { (n as AudioScheduledSourceNode).stop(); } catch { /* already stopped */ }
    });
    this.bgmNodes = [];
  }

  unlock(): void {
    const ctx = this.getCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  setMuted(v: boolean): void {
    this.muted = v;
    if (v) this.stopBgm();
    else this.playBgm();
  }
}

export const puyoAudio = new PuyoAudio();
