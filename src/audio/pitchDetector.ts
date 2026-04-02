export class PitchDetectorEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private rafId: number | null = null;
  private buffer: Float32Array<ArrayBuffer> = new Float32Array(0);
  private onPitch: (pitch: number) => void;

  constructor(onPitch: (pitch: number) => void) {
    this.onPitch = onPitch;
  }

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(this.stream);

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 4096;
    source.connect(this.analyser);

    this.buffer = new Float32Array(this.analyser.fftSize);
    this.loop();
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
  }

  private loop = (): void => {
    if (!this.analyser || !this.audioContext) return;

    this.analyser.getFloatTimeDomainData(this.buffer);
    const pitch = autoCorrelate(this.buffer, this.audioContext.sampleRate);
    if (pitch > 0) {
      this.onPitch(pitch);
    }

    this.rafId = requestAnimationFrame(this.loop);
  };
}

function autoCorrelate(buffer: Float32Array<ArrayBuffer>, sampleRate: number): number {
  const SIZE = buffer.length;

  // Check RMS volume — skip if too quiet
  let rms = 0;
  for (let i = 0; i < SIZE; i++) {
    rms += buffer[i]! * buffer[i]!;
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  // Trim silence from edges
  let r1 = 0;
  let r2 = SIZE - 1;
  const threshold = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buffer[i]!) < threshold) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buffer[SIZE - i]!) < threshold) {
      r2 = SIZE - i;
      break;
    }
  }

  const trimmed = buffer.slice(r1, r2);
  const len = trimmed.length;
  if (len < 2) return -1;

  // Autocorrelation
  const c = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    let sum = 0;
    for (let j = 0; j < len - i; j++) {
      sum += trimmed[j]! * trimmed[j + i]!;
    }
    c[i] = sum;
  }

  // Find first dip
  let d = 0;
  while (d < len - 1 && c[d]! > c[d + 1]!) d++;

  // Find peak after dip
  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < len; i++) {
    if (c[i]! > maxval) {
      maxval = c[i]!;
      maxpos = i;
    }
  }

  if (maxpos < 1 || maxpos >= len - 1) return -1;

  // Parabolic interpolation for sub-sample accuracy
  const x1 = c[maxpos - 1]!;
  const x2 = c[maxpos]!;
  const x3 = c[maxpos + 1]!;
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  const shift = a !== 0 ? -b / (2 * a) : 0;

  return sampleRate / (maxpos + shift);
}
