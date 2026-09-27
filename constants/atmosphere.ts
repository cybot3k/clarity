/**
 * Non-color Atmospheric Glass metrics: grain, fog placement, LED pitch,
 * dotted strokes, progress-arc geometry. Colors live in `colors.ts`.
 *
 * PURE module — no React. Safe under bun.
 */

export const atmosphere = {
  /**
   * Grain is on. `canvas` is the screen wash; `mesh` is every chromatic
   * surface, including the splash. Reduced transparency unmounts grain.
   */
  grain: {
    canvas: { light: 0.06, dark: 0.09 },
    mesh: { light: 0.10, dark: 0.12 },
  },
  /** Mirrors `grain.canvas` so a leftover overlay does not paint nothing. */
  grainOpacity: { light: 0.06, dark: 0.09 },
  /** Mirrors `grain.mesh`. */
  grainOpacityHero: { light: 0.10, dark: 0.12 },
  /** Kill switch. Reduced transparency unmounts grain. */
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
  /** Isolated scored-point diameter on the Analytics polyline. */
  chartVertexSize: 6,
  /** Practiced-but-unscored mark diameter; hollow so it is not a score. */
  chartUnscoredSize: 5,
  /** Home / Analytics day-letter chip diameter. */
  dayChipSize: 28,
  /** Progress Path stroke on skill tracks. */
  progressStroke: 4,
  /** Heavier arc kept for callers that have not moved to `resultsArc`. */
  heroStroke: 8,
  /** Bottom band behind Daily Goal's frost CTA. */
  heroCtaScrim: 72,
  cursorDotSize: 6,
  pressScale: 0.98,
  /** Home stat tiles are square. */
  statTileAspect: 1,
  /** Daily Goal ring. Replaces the dead semicircle (`progress.dailyGoal`). */
  goalRing: { size: 112, stroke: 2, durationMs: 900 },
  /** Results ring hairline. The gauge SVG box is `2 * progress.results.r + cursorSize`. */
  resultsArc: { stroke: 3, dotPitch: 8 },
  /** Filled head dot on the goal ring and the score meter. */
  meterHead: 8,
  /** Hollow origin dot diameter. */
  meterOrigin: 7,
  meterOriginStroke: 1.5,
  /** Frost shelf overlap across the stage edge. */
  shelfOverlap: 48,
  /** Drill card height / width. */
  drillAspect: 0.86,
  /** Skill dot meter. */
  skillMeter: { dots: 20, dot: 4 },
  /** Identity dot diameter. */
  identityPip: 8,
  /** Analytics polyline stroke. */
  chartStroke: 1.5,
  /**
   * Pool placement for a card mesh (`AtmosphereSurface mesh="teal"` etc.), as
   * fractions of the card: center `cx`/`cy`, radii `rx`/`ry`. Painted over the
   * Base fill in this order, so Deep lands last and owns the top-left text zone.
   * Glow lights the lower right behind the dot row, the one band with no text
   * (S2's cards brighten toward that corner). Bloom is centered past the
   * top-right corner, so only its soft falloff enters.
   */
  cardMesh: {
    glow: { cx: 0.8, cy: 0.85, rx: 0.8, ry: 0.55 },
    bloom: { cx: 1.1, cy: -0.1, rx: 0.65, ry: 0.55 },
    deep: { cx: 0, cy: 0, rx: 1.1, ry: 0.95 },
  },
  progress: {
    // stroke and dotPitch mirror resultsArc so existing results reads keep working.
    results: {
      startDeg: 135,
      sweepDeg: 270,
      r: 124,
      delayMs: 350,
      durationMs: 1100,
      stroke: 3,
      dotPitch: 8,
    },
  },
} as const;

export type LedSize = keyof typeof atmosphere.led;

/** The card meshes, one per destination reference palette (`mesh*` in `colors.ts`). */
export const MESH_NAMES = ['teal', 'olive', 'dusk', 'rose', 'blue'] as const;
export type MeshName = (typeof MESH_NAMES)[number];
