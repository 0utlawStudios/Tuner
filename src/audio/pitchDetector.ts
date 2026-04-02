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
    this.analyser.smoothingTimeConstant = 0;
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
    const pitch = detectPitch(this.buffer, this.audioContext.sampleRate);
    if (pitch > 0) {
      this.onPitch(pitch);
    }

    this.rafId = requestAnimationFrame(this.loop);
  };
}

/**
 * Pitch detection using normalized autocorrelation (NSDF).
 *
 * Unlike raw autocorrelation, NSDF normalizes by the energy at each lag
 * so the peak values are always between -1 and +1. This makes the
 * confidence threshold meaningful regardless of signal amplitude.
 */
function detectPitch(buf: Float32Array<ArrayBuffer>, sampleRate: number): number {
  const N = buf.length;

  // Volume gate — RMS check
  let rms = 0;
  for (let i = 0; i < N; i++) {
    rms += buf[i]! * buf[i]!;
  }
  rms = Math.sqrt(rms / N);
  if (rms < 0.005) return -1;

  // Compute NSDF (Normalized Square Difference Function) as
  //   nsdf(tau) = 2 * r(tau) / m(tau)
  // where r(tau) is autocorrelation and m(tau) is the normalization term.
  //
  // The key insight: dividing by m(tau) means peaks are always in [-1, 1]
  // so we can use a fixed threshold (0.3) for confidence.

  // We only need lags up to half the buffer (Nyquist-like limit for periods)
  const maxLag = Math.floor(N / 2);
  const nsdf = new Float32Array(maxLag);

  for (let tau = 0; tau < maxLag; tau++) {
    let acf = 0;   // autocorrelation at lag tau
    let m = 0;     // normalization: sum of squared energies in overlapping windows

    for (let j = 0; j < N - tau; j++) {
      acf += buf[j]! * buf[j + tau]!;
      m += buf[j]! * buf[j]! + buf[j + tau]! * buf[j + tau]!;
    }

    nsdf[tau] = m > 0 ? (2 * acf) / m : 0;
  }

  // Find peaks in the NSDF using "peak picking":
  // 1. Walk past the initial positive region (lag 0 is always ~1.0)
  // 2. Find when NSDF first goes negative (or dips below 0)
  // 3. Then find all positive peaks after that
  // 4. Choose the first peak above a confidence threshold

  // Step 1: skip the initial positive region
  let tau = 1;
  while (tau < maxLag && nsdf[tau]! > 0) tau++;
  if (tau >= maxLag) return -1;

  // Step 2: find positive peaks after the first zero crossing
  let bestTau = -1;
  let bestVal = -1;
  const CONFIDENCE = 0.25;

  while (tau < maxLag - 1) {
    // Walk through negative region
    while (tau < maxLag - 1 && nsdf[tau]! <= 0) tau++;

    // Now in a positive region — find the peak
    let peakTau = tau;
    let peakVal = nsdf[tau]!;
    while (tau < maxLag - 1 && nsdf[tau]! >= 0) {
      if (nsdf[tau]! > peakVal) {
        peakVal = nsdf[tau]!;
        peakTau = tau;
      }
      tau++;
    }

    // Is this peak good enough?
    if (peakVal >= CONFIDENCE) {
      // Take the first sufficiently confident peak (fundamental, not harmonic)
      if (bestTau === -1 || peakVal > bestVal * 0.85) {
        // Accept this peak if it's the first, or significantly better
        if (bestTau === -1) {
          bestTau = peakTau;
          bestVal = peakVal;
          // For fundamental detection: first good peak is usually correct
          // Don't break — check if next peak is clearly better (octave error fix)
        } else if (peakVal > bestVal) {
          bestTau = peakTau;
          bestVal = peakVal;
        }
      }
      // Once we have a confident peak, only continue if we haven't found one yet
      if (bestVal >= 0.5) break;
    }
  }

  if (bestTau < 1 || bestTau >= maxLag - 1) return -1;

  // Parabolic interpolation for sub-sample accuracy
  const y1 = nsdf[bestTau - 1]!;
  const y2 = nsdf[bestTau]!;
  const y3 = nsdf[bestTau + 1]!;
  const a = (y1 + y3 - 2 * y2) / 2;
  const b = (y3 - y1) / 2;
  const refinedTau = bestTau + (a !== 0 ? -b / (2 * a) : 0);

  if (refinedTau <= 0) return -1;

  const freq = sampleRate / refinedTau;

  // Sanity: reject frequencies outside instrument range (25 Hz to 5000 Hz)
  if (freq < 25 || freq > 5000) return -1;

  return freq;
}
