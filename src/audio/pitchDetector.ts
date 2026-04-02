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
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(this.stream);

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 4096;
    this.analyser.smoothingTimeConstant = 0; // No smoothing — we want raw frames
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

/**
 * ACF2+ autocorrelation pitch detection.
 * Returns detected frequency in Hz, or -1 if no pitch found.
 */
function autoCorrelate(buf: Float32Array<ArrayBuffer>, sampleRate: number): number {
  const SIZE = buf.length;

  // RMS volume gate
  let rms = 0;
  for (let i = 0; i < SIZE; i++) {
    rms += buf[i]! * buf[i]!;
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.008) return -1;

  // Find the meaningful signal window by trimming quiet edges.
  // Walk inward from both ends until we hit a sample above the threshold.
  const threshold = 0.15;
  let start = 0;
  let end = SIZE - 1;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]!) >= threshold) { start = i; break; }
  }
  for (let i = SIZE - 1; i >= SIZE / 2; i--) {
    if (Math.abs(buf[i]!) >= threshold) { end = i; break; }
  }

  // Need a reasonable window for autocorrelation
  if (end - start < 128) {
    start = 0;
    end = SIZE - 1;
  }

  const len = end - start + 1;

  // Autocorrelation
  const corr = new Float32Array(len);
  for (let lag = 0; lag < len; lag++) {
    let sum = 0;
    for (let j = 0; j < len - lag; j++) {
      sum += buf[start + j]! * buf[start + j + lag]!;
    }
    corr[lag] = sum;
  }

  // Find the first dip after lag 0 (correlation decreasing from self-correlation)
  let d = 1;
  while (d < len - 1 && corr[d]! >= corr[d - 1]!) d++;
  if (d >= len - 1) return -1;

  // Find the highest peak after the dip — this is the fundamental period
  let bestLag = d;
  let bestVal = corr[d]!;
  for (let i = d + 1; i < len; i++) {
    if (corr[i]! > bestVal) {
      bestVal = corr[i]!;
      bestLag = i;
    }
  }

  // Confidence check: peak should be a significant fraction of self-correlation
  if (corr[0]! > 0 && bestVal / corr[0]! < 0.3) return -1;

  // Guard: bestLag must be interior for parabolic interpolation
  if (bestLag < 1 || bestLag >= len - 1) return -1;

  // Parabolic interpolation for sub-sample accuracy
  const y1 = corr[bestLag - 1]!;
  const y2 = corr[bestLag]!;
  const y3 = corr[bestLag + 1]!;
  const a = (y1 + y3 - 2 * y2) / 2;
  const b = (y3 - y1) / 2;
  const refinedLag = bestLag + (a !== 0 ? -b / (2 * a) : 0);

  if (refinedLag <= 0) return -1;

  return sampleRate / refinedLag;
}
