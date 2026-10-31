// WebAudio 程序化合成音效：无外部音频文件，无版权素材
export class AudioManager {
  constructor(save) {
    this.save = save;
    this.ctx = null;
    this.master = null;
  }

  get muted() {
    return this.save.isMuted();
  }

  // 浏览器要求用户手势后才能启动音频
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  toggleMute() {
    this.save.setMuted(!this.muted);
  }

  tone(freq, duration, type = 'sine', gainValue = 0.15, delay = 0) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.freq.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(gainValue, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + duration);
  }

  slide(f1, f2, duration, type = 'sine', gainValue = 0.15) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.freq.setValueAtTime(f1, t0);
    osc.freq.exponentialRampToValueAtTime(Math.max(20, f2), t0 + duration);
    gain.gain.setValueAtTime(gainValue, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + duration);
  }

  noise(duration, filterType = 'lowpass', filterFreq = 800, gainValue = 0.2) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    const length = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.freq.value = filterFreq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainValue, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(t0);
  }

  play(name) {
    if (this.muted || !this.ctx) return;
    switch (name) {
      case 'shoot':
        this.tone(320, 0.08, 'square', 0.07);
        break;
      case 'produce':
      case 'sun':
        this.tone(520, 0.1, 'sine', 0.12);
        this.tone(780, 0.12, 'sine', 0.12, 0.08);
        break;
      case 'explosion':
        this.noise(0.5, 'lowpass', 420, 0.3);
        this.tone(80, 0.4, 'sine', 0.2);
        break;
      case 'chomp':
        this.tone(180, 0.06, 'sine', 0.08);
        break;
      case 'vault':
        this.slide(300, 620, 0.18, 'triangle', 0.1);
        break;
      case 'groan':
        this.slide(150, 90, 0.28, 'sawtooth', 0.08);
        break;
      case 'roar':
        this.slide(90, 48, 0.9, 'sawtooth', 0.22);
        this.noise(0.7, 'lowpass', 200, 0.12);
        break;
      case 'summon':
        this.slide(240, 150, 0.4, 'triangle', 0.12);
        break;
      case 'iceball':
        this.slide(900, 480, 0.4, 'sine', 0.12);
        break;
      case 'fireball':
        this.noise(0.4, 'bandpass', 700, 0.18);
        break;
      case 'smash':
        this.noise(0.35, 'lowpass', 260, 0.3);
        break;
      case 'charge':
        this.slide(130, 70, 0.6, 'sawtooth', 0.18);
        break;
      case 'mower':
        this.noise(0.7, 'highpass', 900, 0.16);
        break;
      case 'button':
        this.tone(600, 0.05, 'square', 0.08);
        break;
      default:
        break;
    }
  }
}
