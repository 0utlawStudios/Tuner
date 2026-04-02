import { useMemo } from 'react';
import { GAUGE_MIN_CENTS, GAUGE_MAX_CENTS, IN_TUNE_THRESHOLD, CLOSE_THRESHOLD } from '../../utils/constants';
import { theme } from '../../theme/theme';
import styles from './TunerGauge.module.css';

interface Props {
  cents: number;
}

const SIZE = 280;
const CX = SIZE / 2;
const CY = SIZE / 2 + 20;
const RADIUS = 110;
const TICK_OUTER = RADIUS + 12;
const TICK_INNER = RADIUS - 4;
const NEEDLE_LEN = RADIUS - 10;
const START_ANGLE = 180;
const END_ANGLE = 360;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function centsToAngle(cents: number): number {
  const clamped = Math.max(GAUGE_MIN_CENTS, Math.min(GAUGE_MAX_CENTS, cents));
  const ratio = (clamped - GAUGE_MIN_CENTS) / (GAUGE_MAX_CENTS - GAUGE_MIN_CENTS);
  return START_ANGLE + ratio * (END_ANGLE - START_ANGLE);
}

export function TunerGauge({ cents }: Props) {
  const needleAngle = centsToAngle(cents);
  const needleEnd = polarToCartesian(CX, CY, NEEDLE_LEN, needleAngle);

  const needleColor = useMemo(() => {
    const absCents = Math.abs(cents);
    if (absCents <= IN_TUNE_THRESHOLD) return theme.colors.inTune;
    if (absCents <= CLOSE_THRESHOLD) return theme.colors.close;
    return theme.colors.sharp;
  }, [cents]);

  const ticks = useMemo(() => {
    const result = [];
    for (let c = GAUGE_MIN_CENTS; c <= GAUGE_MAX_CENTS; c += 10) {
      const angle = centsToAngle(c);
      const isMajor = c === 0;
      const outer = polarToCartesian(CX, CY, TICK_OUTER, angle);
      const inner = polarToCartesian(CX, CY, isMajor ? TICK_INNER - 6 : TICK_INNER, angle);
      result.push(
        <line
          key={c}
          x1={outer.x} y1={outer.y}
          x2={inner.x} y2={inner.y}
          stroke={isMajor ? theme.colors.textSecondary : theme.colors.gaugeTick}
          strokeWidth={isMajor ? 2 : 1}
          strokeLinecap="round"
        />
      );
    }
    return result;
  }, []);

  return (
    <div className={styles.container}>
      <svg width={SIZE} height={SIZE / 2 + 40} viewBox={`0 0 ${SIZE} ${SIZE / 2 + 40}`}>
        {/* Arc track */}
        <path
          d={describeArc(CX, CY, RADIUS, START_ANGLE, END_ANGLE)}
          fill="none"
          stroke={theme.colors.gaugeTrack}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Tick marks */}
        {ticks}

        {/* Labels */}
        <text x={CX - RADIUS - 20} y={CY + 20} fill={theme.colors.textDim} fontSize="11" textAnchor="middle"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif">FLAT</text>
        <text x={CX + RADIUS + 20} y={CY + 20} fill={theme.colors.textDim} fontSize="11" textAnchor="middle"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif">SHARP</text>

        {/* Needle */}
        <line
          x1={CX} y1={CY}
          x2={needleEnd.x} y2={needleEnd.y}
          stroke={needleColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          className={styles.needle}
        />

        {/* Center dot */}
        <circle cx={CX} cy={CY} r={5} fill={theme.colors.surface} stroke={theme.colors.textSecondary} strokeWidth={1.5} />
      </svg>
    </div>
  );
}
