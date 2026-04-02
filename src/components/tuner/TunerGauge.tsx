import { useMemo } from 'react';
import { GAUGE_MIN_CENTS, GAUGE_MAX_CENTS, IN_TUNE_THRESHOLD, CLOSE_THRESHOLD } from '../../utils/constants';
import styles from './TunerGauge.module.css';

interface Props {
  cents: number;
}

const VB_W = 300;
const VB_H = 170;
const CX = VB_W / 2;
const CY = VB_H - 20;
const RADIUS = 120;
const NEEDLE_LEN = RADIUS - 14;
const START_ANGLE = 180;
const END_ANGLE = 360;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arc(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polar(cx, cy, r, end);
  const e = polar(cx, cy, r, start);
  const large = end - start > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

function centsToAngle(cents: number): number {
  const clamped = Math.max(GAUGE_MIN_CENTS, Math.min(GAUGE_MAX_CENTS, cents));
  const ratio = (clamped - GAUGE_MIN_CENTS) / (GAUGE_MAX_CENTS - GAUGE_MIN_CENTS);
  return START_ANGLE + ratio * (END_ANGLE - START_ANGLE);
}

export function TunerGauge({ cents }: Props) {
  const angle = centsToAngle(cents);
  const tip = polar(CX, CY, NEEDLE_LEN, angle);

  const status = useMemo(() => {
    const a = Math.abs(cents);
    if (a <= IN_TUNE_THRESHOLD) return 'inTune' as const;
    if (a <= CLOSE_THRESHOLD) return 'close' as const;
    return 'off' as const;
  }, [cents]);

  const needleColor = status === 'inTune' ? '#00FFB2' : status === 'close' ? '#FFD700' : '#FF4466';
  const glowColor = status === 'inTune' ? 'rgba(0,255,178,0.5)' : status === 'close' ? 'rgba(255,215,0,0.4)' : 'rgba(255,68,102,0.35)';

  const ticks = useMemo(() => {
    const result = [];
    for (let c = GAUGE_MIN_CENTS; c <= GAUGE_MAX_CENTS; c += 5) {
      const a = centsToAngle(c);
      const isMajor = c % 10 === 0;
      const isCenter = c === 0;
      const outerR = RADIUS + (isCenter ? 10 : isMajor ? 8 : 4);
      const innerR = RADIUS + 1;
      const o = polar(CX, CY, outerR, a);
      const i = polar(CX, CY, innerR, a);
      result.push(
        <line key={c} x1={o.x} y1={o.y} x2={i.x} y2={i.y}
          stroke={isCenter ? 'rgba(255,255,255,0.35)' : isMajor ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'}
          strokeWidth={isCenter ? 2 : 1} strokeLinecap="round" />
      );
    }
    return result;
  }, []);

  return (
    <div className={styles.container}>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className={styles.svg}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Arc track */}
        <path d={arc(CX, CY, RADIUS, START_ANGLE, END_ANGLE)}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={2} strokeLinecap="round" />

        {/* Ticks */}
        {ticks}

        {/* Labels */}
        <text x={CX - RADIUS - 12} y={CY + 4} fill="rgba(255,255,255,0.18)" fontSize="9"
          textAnchor="middle" fontFamily="inherit" fontWeight="500" letterSpacing="1">FLAT</text>
        <text x={CX + RADIUS + 12} y={CY + 4} fill="rgba(255,255,255,0.18)" fontSize="9"
          textAnchor="middle" fontFamily="inherit" fontWeight="500" letterSpacing="1">SHARP</text>

        {/* Needle glow */}
        <line x1={CX} y1={CY} x2={tip.x} y2={tip.y}
          stroke={glowColor} strokeWidth={6} strokeLinecap="round"
          filter="url(#glow)" className={styles.needle} />

        {/* Needle */}
        <line x1={CX} y1={CY} x2={tip.x} y2={tip.y}
          stroke={needleColor} strokeWidth={2} strokeLinecap="round"
          className={styles.needle} />

        {/* Center hub */}
        <circle cx={CX} cy={CY} r={6} fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
        <circle cx={CX} cy={CY} r={2.5} fill={needleColor} opacity={0.8} />
      </svg>
    </div>
  );
}
