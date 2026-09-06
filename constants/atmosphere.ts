/**
 * Non-color Atmospheric Glass metrics: grain, fog placement, LED pitch,
 * dotted strokes, progress-arc geometry. Colors live in `colors.ts`.
 *
 * PURE module — no React. Safe under bun.
 */

export const atmosphere = {
  grainOpacity: { light: 0.22, dark: 0.28 },
  grainOpacityHero: { light: 0.14, dark: 0.18 },
  grainOpacityReduced: 0,
  fog: {
    /** Mask intrinsic size (px). */
    maskPx: 1024,
    /** Width of the fog image as a fraction of window width. */
    widthRatio: 2.8,
    /** Aspect copied from ClarityMark viewBox 873×812. */
    aspect: 873 / 812,
    /** Vertical center of the mask, fraction of window height. */
    centerY: 0.4,
    /** Cyan bleed View scale vs the mask. */
    bleedScale: 1.15,
  },
  dottedDash: [1.5, 3] as const,
  dottedWidth: 1,
  /** Circle diameter (cell), gap between cells, extra diameter of the glow copy. */
  led: {
    sm: { cell: 2, gap: 1, glow: 2 },
    md: { cell: 3, gap: 1.5, glow: 3 },
    hero: { cell: 5, gap: 2, glow: 5 },
  },
  /**
   * Digit bbox excluding glow:
   *   width  = 5 * cell + 4 * gap
   *   height = 7 * cell + 6 * gap
   * Worked hero: 5*5+4*2 = 33 × 7*5+6*2 = 47.
   */
  ledHeight: { sm: 20, md: 30, hero: 47 },
  ledWidth: { sm: 14, md: 21, hero: 33 },
  cursorSize: 28,
  /** Home / Analytics day-letter chip diameter. */
  dayChipSize: 28,
  /** Progress Path stroke on Daily Goal and Results. */
  progressStroke: 3,
  /** Bottom band behind Daily Goal's frost CTA. */
  heroCtaScrim: 72,
  cursorDotSize: 6,
  pressScale: 0.98,
  progress: {
    dailyGoal: { startDeg: 180, sweepDeg: -180, r: 96, durationMs: 900 },
    results: { startDeg: 135, sweepDeg: 270, r: 110, delayMs: 350, durationMs: 1100 },
  },
} as const;

export type LedSize = keyof typeof atmosphere.led;
