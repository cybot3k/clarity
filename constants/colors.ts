/**
 * Every color in the app, keyed by color scheme. One map, no exceptions — if a
 * screen or component needs a color, it names one of these tokens.
 *
 * The product is a near-black canvas in both schemes. Depth comes from layered
 * surfaces and hairline borders, not from fog, grain, or mesh gradients. The
 * signal accent is reserved for live speech, selection, and progress.
 *
 * Marketing tokens stay light: the Paper site does not follow the app canvas.
 *
 * Read colors through `useTheme()` (`hooks/use-theme.ts`). This module stays
 * pure (no React) so token files, `lib/`, and the bun test scripts can import it.
 */

const product = {
  // --- Surfaces ---
  /** Screen background. Painted by the navigation theme, so screens don't set it. */
  background: '#050506',
  /** An opaque raised surface. */
  card: '#141416',
  /** Tint layered over `GlassView` so glass reads as a card, not a smear. */
  glassTint: 'rgba(12,12,14,0.72)',
  /** Heavier glass tint for controls that sit over live content. */
  glassTintStrong: 'rgba(22,22,26,0.82)',
  /** Stand-in for glass where liquid glass is unavailable. */
  glassFallback: '#161618',

  // --- Fills ---
  /** Opaque bed behind an icon or chip. */
  fill: '#1C1C20',
  /** A step darker than `fill`, for circle buttons that need to read as pressable. */
  fillStrong: '#26262C',
  /** Translucent bed, for use over glass where an opaque fill would block it. */
  fillTranslucent: 'rgba(255,255,255,0.08)',

  // --- Inverse ---
  /** Primary button and badge surface: near-white on the black canvas. */
  inverseSurface: '#F4F4F6',
  /** Label on `inverseSurface`. */
  inverseLabel: '#111114',
  /** `inverseSurface` with the contrast dropped, for a disabled primary button. */
  inverseSurfaceMuted: 'rgba(255,255,255,0.22)',

  // --- Text ---
  /** Primary ink. Every value and title. Never colored by how good it is. */
  foreground: '#F5F5F7',
  /** Labels, captions, supporting copy. */
  secondary: '#A3A3AB',
  /** Units, timestamps, and the "flat or declining" delta. */
  tertiary: '#6E6E78',
  /** Text deliberately pushed back, e.g. teleprompter words not yet spoken. */
  dimmed: '#4C4C54',

  // --- Lines ---
  divider: 'rgba(255,255,255,0.10)',
  /** Unfilled portion of a tick meter or ring. */
  track: 'rgba(255,255,255,0.12)',
  /** A border meant to be seen as a border. */
  outline: 'rgba(255,255,255,0.18)',
  /** A filled bar for a day other than today. */
  bar: '#3A3A42',
  /** Stub bar for a day with no data. */
  barEmpty: 'rgba(255,255,255,0.08)',

  // --- Status ---
  /** Live speech, selection, and progress. One accent. */
  accent: '#D6FF4A',
  /** Muted signal, for words already spoken in the current sentence. */
  accentFaded: '#8AAA45',
  /** Tinted bed behind an accent glyph or the active word. */
  accentBg: 'rgba(214,255,74,0.16)',
  /** Only for an improving delta. */
  positive: '#3DDC97',
  positiveBg: 'rgba(61,220,151,0.14)',
  /** Live in-session "drifting", never a score. */
  warn: '#FFB020',
  /** Only the single FOCUS pill on the weakest skill. */
  focus: '#F0B458',
  focusBg: 'rgba(240,180,88,0.16)',
  /** Form validation and destructive account actions. Never a metric. */
  danger: '#FF5A52',

  // --- Marketing site ---
  marketingCanvas: '#FFFFFF',
  marketingInk: '#111114',
  marketingMuted: '#77777E',
  marketingLine: '#E6E6EB',
  marketingInverse: '#1C1C21',
  marketingOnInverse: '#FFFFFF',
  marketingAccent: '#3478F6',

  // --- On artwork ---
  // Passage cards are dark surfaces. These stay light so title ink is stable.
  onArtwork: '#F5F5F7',
  onArtworkMuted: 'rgba(245,245,247,0.68)',
  artworkFill: 'rgba(255,255,255,0.10)',
  artworkScrim: 'rgba(0,0,0,0.28)',
  artworkScrimStrong: 'rgba(0,0,0,0.55)',

  // --- Canvas ---
  // Same near-black as `background`. Fog and grain tokens stay in the map so
  // older call sites compile, and they resolve to nothing.
  atmosphereCanvas: '#050506',
  canvasFog: 'rgba(5,5,6,0)',
  canvasFogCore: 'rgba(5,5,6,0)',
  onAtmosphere: '#F5F5F7',
  onAtmosphereMuted: 'rgba(245,245,247,0.64)',
  atmosphereScrim: 'rgba(5,5,6,0.55)',

  heroStopTop: '#141416',
  heroStopMid: '#141416',
  heroStopBottom: '#141416',
  heroStopAccent: '#141416',

  ledOn: '#F5F5F7',
  ledOff: 'rgba(255,255,255,0.12)',
  ledGlow: 'rgba(0,0,0,0)',

  dottedStrokeOnAtmosphere: 'rgba(255,255,255,0.16)',
  dottedStrokeOnFrost: 'rgba(255,255,255,0.16)',
  chartLine: 'rgba(245,245,247,0.92)',
  chartGrid: 'rgba(255,255,255,0.10)',
  cursorRing: 'rgba(214,255,74,0.45)',
  cursorDot: '#D6FF4A',
  /** Letter on a selected axis chip. Dark, because the chip fill is the accent. */
  axisChipInk: '#111114',
  chartPartial: 'rgba(245,245,247,0.35)',

  // Identity meshes are retired. These keys remain so the type stays stable;
  // surfaces paint `card`, and skill marks use `accent`.
  metricMinutesFrom: '#141416',
  metricMinutesVia: '#141416',
  metricMinutesTo: '#1C1C20',
  metricSessionsFrom: '#141416',
  metricSessionsVia: '#141416',
  metricSessionsTo: '#1C1C20',
  metricStreakFrom: '#141416',
  metricStreakVia: '#141416',
  metricStreakTo: '#1C1C20',
  metricMasteredFrom: '#141416',
  metricMasteredVia: '#141416',
  metricMasteredTo: '#1C1C20',

  skillAccuracyFrom: '#D6FF4A',
  skillAccuracyVia: '#141416',
  skillAccuracyTo: '#1C1C20',
  skillFluencyFrom: '#D6FF4A',
  skillFluencyVia: '#141416',
  skillFluencyTo: '#1C1C20',
  skillPaceFrom: '#D6FF4A',
  skillPaceVia: '#141416',
  skillPaceTo: '#1C1C20',
  skillFillersFrom: '#D6FF4A',
  skillFillersVia: '#141416',
  skillFillersTo: '#1C1C20',
  skillIntonationFrom: '#D6FF4A',
  skillIntonationVia: '#141416',
  skillIntonationTo: '#1C1C20',

  artworkGlass: 'rgba(8,8,10,0.55)',
  artworkFallback: '#141416',

  addLeak: 'rgba(214,255,74,0)',
  addLeakHot: 'rgba(214,255,74,0)',

  frostFallback: '#1C1C20',
  /** Peak stop of the fade under floating chrome (tab bar, session bars). */
  chromeScrim: 'rgba(5,5,6,0.92)',

  atmosphereAccent: '#D6FF4A',
  atmosphereAccentFaded: '#8AAA45',
  atmosphereAccentBg: 'rgba(214,255,74,0.16)',

  streakFlame: '#FF9F0A',
  proGold: '#E2B657',
  splashBackdrop: '#050506',
} as const;

const light = product;

const dark: Record<keyof typeof light, string> = { ...product };

export const colors = { light, dark } as const;

/** One scheme's colors. Widened to `string` so the two maps are interchangeable —
 * `as const` alone would pin each key to its own literal and split the types. */
export type ThemeColors = { readonly [K in keyof typeof light]: string };

export type ColorSchemeName = keyof typeof colors;
