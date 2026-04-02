import React, {useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import Svg, {Path, Circle, Line, G} from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
  useDerivedValue,
} from 'react-native-reanimated';
import {theme} from '../../theme/theme';
import {GAUGE_MIN_CENTS, GAUGE_MAX_CENTS, IN_TUNE_THRESHOLD, CLOSE_THRESHOLD} from '../../utils/constants';

const AnimatedLine = Animated.createAnimatedComponent(Line);

const SIZE = 280;
const CENTER_X = SIZE / 2;
const CENTER_Y = SIZE / 2 + 20;
const RADIUS = 110;
const NEEDLE_LENGTH = 95;
const START_ANGLE = -180; // degrees (left)
const END_ANGLE = 0; // degrees (right)

interface TunerGaugeProps {
  cents: number;
  isActive: boolean;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function centsToAngle(cents: number): number {
  const clamped = Math.max(GAUGE_MIN_CENTS, Math.min(GAUGE_MAX_CENTS, cents));
  const normalized = (clamped - GAUGE_MIN_CENTS) / (GAUGE_MAX_CENTS - GAUGE_MIN_CENTS);
  return START_ANGLE + normalized * (END_ANGLE - START_ANGLE);
}

// Generate tick marks — static, computed once outside the component
const STATIC_TICKS = (() => {
  const ticks = [];
  for (let cents = GAUGE_MIN_CENTS; cents <= GAUGE_MAX_CENTS; cents += 5) {
    const angle = centsToAngle(cents);
    const isMajor = cents % 10 === 0;
    const isCenter = cents === 0;
    const innerR = RADIUS - (isCenter ? 18 : isMajor ? 14 : 8);
    const outerR = RADIUS;
    const inner = polarToCartesian(CENTER_X, CENTER_Y, innerR, angle);
    const outer = polarToCartesian(CENTER_X, CENTER_Y, outerR, angle);

    const color: string = isCenter ? theme.colors.primary : theme.colors.gaugeTick;

    ticks.push(
      <Line
        key={cents}
        x1={inner.x}
        y1={inner.y}
        x2={outer.x}
        y2={outer.y}
        stroke={color}
        strokeWidth={isCenter ? 2.5 : isMajor ? 1.5 : 1}
        strokeLinecap="round"
      />,
    );
  }
  return ticks;
})();

// Static arc path — computed once
const ARC_PATH = describeArc(CENTER_X, CENTER_Y, RADIUS, START_ANGLE, END_ANGLE);

export const TunerGauge = React.memo(function TunerGauge({cents, isActive}: TunerGaugeProps) {
  const targetAngle = useSharedValue(-90); // Start at center (top)

  useDerivedValue(() => {
    targetAngle.value = withSpring(isActive ? centsToAngle(cents) : -90, {
      damping: 20,
      stiffness: 150,
      mass: 0.8,
    });
  }, [cents, isActive]);

  const needleProps = useAnimatedProps(() => {
    const angleRad = (targetAngle.value * Math.PI) / 180;
    return {
      x2: CENTER_X + NEEDLE_LENGTH * Math.cos(angleRad),
      y2: CENTER_Y + NEEDLE_LENGTH * Math.sin(angleRad),
    };
  });

  // Derive needle color on the UI thread via useDerivedValue
  const needleColorSv = useDerivedValue(() => {
    if (!isActive) return theme.colors.textDim;
    const absCents = Math.abs(cents);
    if (absCents <= IN_TUNE_THRESHOLD) return theme.colors.inTune;
    if (absCents <= CLOSE_THRESHOLD) return theme.colors.close;
    return theme.colors.sharp;
  }, [isActive, cents]);

  // For SVG elements that need a JS string color we still derive it on JS
  // but memoize it to avoid creating new values each render
  const needleColor = useMemo(() => {
    if (!isActive) return theme.colors.textDim;
    const absCents = Math.abs(cents);
    if (absCents <= IN_TUNE_THRESHOLD) return theme.colors.inTune;
    if (absCents <= CLOSE_THRESHOLD) return theme.colors.close;
    return theme.colors.sharp;
  }, [isActive, cents]);

  const needleStrokeProps = useAnimatedProps(() => {
    const angleRad = (targetAngle.value * Math.PI) / 180;
    return {
      x2: CENTER_X + NEEDLE_LENGTH * Math.cos(angleRad),
      y2: CENTER_Y + NEEDLE_LENGTH * Math.sin(angleRad),
      stroke: needleColorSv.value,
    };
  });

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE / 2 + 40} viewBox={`0 0 ${SIZE} ${SIZE / 2 + 40}`}>
        {/* Arc track */}
        <Path
          d={ARC_PATH}
          stroke={theme.colors.gaugeTrack}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />

        {/* Tick marks — static, no recompute */}
        <G>{STATIC_TICKS}</G>

        {/* Needle */}
        <AnimatedLine
          x1={CENTER_X}
          y1={CENTER_Y}
          animatedProps={needleStrokeProps}
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Center dot */}
        <Circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={6}
          fill={theme.colors.surface}
          stroke={needleColor}
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
