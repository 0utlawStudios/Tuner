export const theme = {
  colors: {
    background: '#0A0A0F',
    backgroundSecondary: '#12121A',
    surface: '#1A1A25',
    surfaceLight: '#252535',

    // Accent colors
    primary: '#00FFB2',
    primaryDim: '#00CC8E',
    primaryGlow: 'rgba(0, 255, 178, 0.3)',

    // Status colors
    inTune: '#00FFB2',
    close: '#FFD700',
    flat: '#FF4466',
    sharp: '#FF4466',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#8888AA',
    textDim: '#555566',

    // Gauge
    gaugeTrack: '#2A2A3A',
    gaugeTick: '#444466',
    needle: '#FFFFFF',

    // Waveform
    waveformStroke: '#00FFB2',
    waveformGlow: 'rgba(0, 255, 178, 0.15)',
  },

  fonts: {
    noteName: {
      fontSize: 72,
      fontWeight: '700' as const,
      letterSpacing: 2,
    },
    octave: {
      fontSize: 28,
      fontWeight: '400' as const,
    },
    cents: {
      fontSize: 24,
      fontWeight: '500' as const,
      letterSpacing: 1,
    },
    label: {
      fontSize: 14,
      fontWeight: '500' as const,
      letterSpacing: 1.5,
      textTransform: 'uppercase' as const,
    },
    instrumentChip: {
      fontSize: 13,
      fontWeight: '600' as const,
      letterSpacing: 0.5,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 20,
    full: 999,
  },
} as const;

export type Theme = typeof theme;
