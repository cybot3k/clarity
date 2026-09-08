/**
 * Every color in the app, keyed by color scheme. One map, no exceptions — if a
 * screen or component needs a color, it names one of these tokens.
 *
 * Read it through `useTheme()` (`hooks/use-theme.ts`) rather than indexing by
 * scheme at each call site. This module stays pure (no React) so token files,
 * `lib/`, and the bun test scripts can import it.
 *
 * Groups, in the order a screen is built:
 *   surfaces  — what sits behind content (background, card, glass)
 *   fills     — tinted beds inside a surface (icon tiles, chips, circle buttons)
 *   inverse   — the near-black button/badge that flips in dark mode
 *   text      — the four-step ink ramp
 *   lines     — dividers and meter tracks
 *   status    — accent, and the delta/focus semantics from the metrics spec
 */

const light = {
  // --- Surfaces ---
  /** Screen background. Painted by the navigation theme, so screens don't set it. */
  background: '#F4F4F6',
  /** An opaque raised surface. */
  card: '#FFFFFF',
  /** Tint layered over `GlassView` so glass reads as a card, not a smear. */
  glassTint: 'rgba(255,255,255,0.45)',
  /** Heavier glass tint for controls that sit over live content. */
  glassTintStrong: 'rgba(255,255,255,0.72)',
  /** Stand-in for glass where liquid glass is unavailable. */
  glassFallback: 'rgba(255,255,255,0.96)',

  // --- Fills ---
  /** Opaque bed behind an icon or chip. */
  fill: '#F1F1F4',
  /** A step darker than `fill`, for circle buttons that need to read as pressable. */
  fillStrong: '#EDEDF0',
  /** Translucent bed, for use over glass where an opaque fill would block it. */
  fillTranslucent: 'rgba(17,17,20,0.08)',

  // --- Inverse ---
  /** Primary button and badge surface: near-black on light, near-white on dark. */
  inverseSurface: '#1C1C21',
  /** Label on `inverseSurface`. */
  inverseLabel: '#FFFFFF',
  /** `inverseSurface` with the contrast dropped, for a disabled primary button. */
  inverseSurfaceMuted: 'rgba(17,17,20,0.18)',

  // --- Text ---
  /** Primary ink. Every value and title. Never colored by how good it is. */
  foreground: '#111114',
  /** Labels, captions, supporting copy. */
  secondary: '#77777E',
  /** Units, timestamps, and the "flat or declining" delta. */
  tertiary: '#9A9AA0',
  /** Text deliberately pushed back, e.g. teleprompter words not yet spoken. */
  dimmed: '#B9B9BE',

  // --- Lines ---
  divider: 'rgba(17,17,20,0.08)',
  /** Unfilled portion of a tick meter or ring. */
  track: 'rgba(17,17,20,0.12)',
  /** A border meant to be seen as a border — the dashed "add your own" row.
   * Heavier than `divider`, which only has to separate two things. */
  outline: 'rgba(17,17,20,0.25)',
  /** A filled bar for a day other than today. */
  bar: '#C4C4CC',
  /** Stub bar for a day with no data. */
  barEmpty: '#E6E6EB',

  // --- Status ---
  accent: '#3478F6',
  /** Accent at reading-ahead strength, behind the spoken word in a passage. */
  accentFaded: '#AECBFA',
  /** Tinted bed behind an accent glyph or an accent-labelled button. */
  accentBg: 'rgba(52,120,246,0.12)',
  /** Only for an improving delta, and for live in-session "on target". */
  positive: '#23A55A',
  positiveBg: '#E7F6EC',
  /** Live in-session "drifting", never a score. */
  warn: '#FF9F0A',
  /** Only the single FOCUS pill on the weakest skill. */
  focus: '#A96400',
  focusBg: '#FDEFDC',
  /** Form validation and destructive account actions (sign out, delete). Never
   * a metric — no metric may render red. */
  danger: '#FF3B30',

  // --- Marketing site ---
  // The Paper landing page is intentionally light-only. These tokens stay
  // fixed across schemes so a browser preference cannot invert the brand page.
  marketingCanvas: '#FFFFFF',
  marketingInk: '#111114',
  marketingMuted: '#77777E',
  marketingLine: '#E6E6EB',
  marketingInverse: '#1C1C21',
  marketingOnInverse: '#FFFFFF',
  marketingAccent: '#3478F6',

  // --- On artwork ---
  // Deliberately fixed in both schemes: a passage card is its own dark artwork
  // surface, so its text does not follow the app's ink ramp.
  onArtwork: '#FFFFFF',
  onArtworkMuted: 'rgba(255,255,255,0.75)',
  /** Translucent white bed for a control sitting on artwork. */
  artworkFill: 'rgba(255,255,255,0.22)',
  /** Mid stop of the artwork-card text-legibility scrim. Scheme-invariant. */
  artworkScrim: 'rgba(0,0,0,0.38)',
  /** Bottom stop of the artwork-card text-legibility scrim. Scheme-invariant. */
  artworkScrimStrong: 'rgba(0,0,0,0.68)',

  // --- Atmospheric Glass (additive; existing keys above are unchanged) ---
  atmosphereCanvas: '#EEF2F7',
  canvasFog: 'rgba(62,200,216,0.22)',
  canvasFogCore: 'rgba(8,12,22,0.50)',
  onAtmosphere: '#FFFFFF',
  onAtmosphereMuted: 'rgba(255,255,255,0.78)',
  atmosphereScrim: 'rgba(8,14,28,0.55)',

  heroStopTop: '#0E1A3A',
  heroStopMid: '#165A68',
  heroStopBottom: '#8FB8C8',
  heroStopAccent: '#6B5A8A',

  ledOn: '#FFF8E8',
  ledOff: 'rgba(255,255,255,0.14)',
  ledGlow: 'rgba(255,248,230,0.40)',

  dottedStrokeOnAtmosphere: 'rgba(255,255,255,0.45)',
  dottedStrokeOnFrost: 'rgba(17,17,20,0.22)',
  chartLine: 'rgba(255,255,255,0.92)',
  chartGrid: 'rgba(255,255,255,0.22)',
  cursorRing: 'rgba(255,255,255,0.55)',
  cursorDot: '#FFFFFF',
  /** Letter on a selected axis DayChip (`cursorDot` fill). Always dark — `foreground` goes white in dark. */
  axisChipInk: '#111114',
  chartPartial: 'rgba(255,255,255,0.40)',

  metricMinutesFrom: '#7A3A12',
  metricMinutesVia: '#D4782A',
  metricMinutesTo: '#E8B878',
  metricSessionsFrom: '#1A2A6B',
  metricSessionsVia: '#3D5CB0',
  metricSessionsTo: '#8EB4F0',
  metricStreakFrom: '#0E4A52',
  metricStreakVia: '#1A8A9A',
  metricStreakTo: '#7ED4DE',
  metricMasteredFrom: '#3A2060',
  metricMasteredVia: '#8A6AC0',
  metricMasteredTo: '#D4B8F0',

  skillAccuracyFrom: '#6B2238',
  skillAccuracyVia: '#C44A62',
  skillAccuracyTo: '#E8A0B8',
  skillFluencyFrom: '#1A3060',
  skillFluencyVia: '#3A62B8',
  skillFluencyTo: '#90B8F0',
  skillPaceFrom: '#0E4850',
  skillPaceVia: '#1A8894',
  skillPaceTo: '#70D0D8',
  skillFillersFrom: '#7A4810',
  skillFillersVia: '#D49020',
  skillFillersTo: '#E8C878',
  skillIntonationFrom: '#3A2460',
  skillIntonationVia: '#7A5AB0',
  skillIntonationTo: '#C8B0E8',

  artworkGlass: 'rgba(14,14,22,0.60)',
  artworkFallback: 'rgba(20,20,28,0.98)',

  addLeak: 'rgba(200,232,240,0.90)',
  addLeakHot: 'rgba(245,230,200,0.85)',

  frostFallback: 'rgba(247,250,253,0.92)',
  /** Peak stop of the fade under floating chrome (tab bar, session bars). */
  chromeScrim: 'rgba(255,255,255,0.70)',

  atmosphereAccent: '#1A8A9A',
  atmosphereAccentFaded: '#A9E4EC',
  atmosphereAccentBg: 'rgba(26,138,154,0.14)',

  streakFlame: '#FF9500',
  proGold: '#FFB000',
  splashBackdrop: '#000000',
} as const;

const dark: Record<keyof typeof light, string> = {
  background: '#0B0B0D',
  card: '#1A1A1E',
  glassTint: 'rgba(10,10,12,0.55)',
  glassTintStrong: 'rgba(30,30,34,0.72)',
  glassFallback: 'rgba(26,26,30,0.96)',

  fill: 'rgba(255,255,255,0.08)',
  fillStrong: '#2A2A2F',
  fillTranslucent: 'rgba(255,255,255,0.10)',

  inverseSurface: '#F2F2F5',
  inverseLabel: '#111114',
  inverseSurfaceMuted: 'rgba(255,255,255,0.22)',

  foreground: '#FFFFFF',
  secondary: '#9E9EA6',
  tertiary: '#7C7C84',
  dimmed: '#5A5A62',

  divider: 'rgba(255,255,255,0.10)',
  track: 'rgba(255,255,255,0.16)',
  outline: 'rgba(255,255,255,0.28)',
  bar: '#4A4A52',
  barEmpty: 'rgba(255,255,255,0.10)',

  accent: '#4C8DFF',
  accentFaded: '#2E4A79',
  accentBg: 'rgba(76,141,255,0.18)',
  positive: '#2ECC71',
  positiveBg: 'rgba(46,204,113,0.16)',
  warn: '#FF9F0A',
  focus: '#F0B458',
  focusBg: 'rgba(240,180,88,0.16)',
  danger: '#FF453A',

  marketingCanvas: '#FFFFFF',
  marketingInk: '#111114',
  marketingMuted: '#77777E',
  marketingLine: '#E6E6EB',
  marketingInverse: '#1C1C21',
  marketingOnInverse: '#FFFFFF',
  marketingAccent: '#3478F6',

  onArtwork: '#FFFFFF',
  onArtworkMuted: 'rgba(255,255,255,0.75)',
  artworkFill: 'rgba(255,255,255,0.22)',
  artworkScrim: 'rgba(0,0,0,0.38)',
  artworkScrimStrong: 'rgba(0,0,0,0.68)',

  atmosphereCanvas: '#071018',
  canvasFog: 'rgba(90,212,228,0.18)',
  canvasFogCore: 'rgba(4,8,14,0.78)',
  onAtmosphere: '#FFFFFF',
  onAtmosphereMuted: 'rgba(255,255,255,0.70)',
  atmosphereScrim: 'rgba(0,0,0,0.50)',

  heroStopTop: '#070E1C',
  heroStopMid: '#0F3D4A',
  heroStopBottom: '#1A4A5C',
  heroStopAccent: '#3A2A55',

  ledOn: '#FFF8E8',
  ledOff: 'rgba(255,255,255,0.10)',
  ledGlow: 'rgba(255,248,230,0.35)',

  dottedStrokeOnAtmosphere: 'rgba(255,255,255,0.40)',
  dottedStrokeOnFrost: 'rgba(255,255,255,0.28)',
  chartLine: 'rgba(255,255,255,0.90)',
  chartGrid: 'rgba(255,255,255,0.18)',
  cursorRing: 'rgba(255,255,255,0.50)',
  cursorDot: '#FFFFFF',
  axisChipInk: '#111114',
  chartPartial: 'rgba(255,255,255,0.35)',

  metricMinutesFrom: '#4A220A',
  metricMinutesVia: '#B86820',
  metricMinutesTo: '#8A6030',
  metricSessionsFrom: '#101A44',
  metricSessionsVia: '#2A4080',
  metricSessionsTo: '#4A68A0',
  metricStreakFrom: '#083038',
  metricStreakVia: '#147080',
  metricStreakTo: '#3A8088',
  metricMasteredFrom: '#241440',
  metricMasteredVia: '#6A50A0',
  metricMasteredTo: '#6A5890',

  skillAccuracyFrom: '#401428',
  skillAccuracyVia: '#A03850',
  skillAccuracyTo: '#804858',
  skillFluencyFrom: '#101C40',
  skillFluencyVia: '#2A4A90',
  skillFluencyTo: '#4868A0',
  skillPaceFrom: '#083038',
  skillPaceVia: '#147078',
  skillPaceTo: '#3A7880',
  skillFillersFrom: '#4A2C0A',
  skillFillersVia: '#B07818',
  skillFillersTo: '#8A7030',
  skillIntonationFrom: '#241848',
  skillIntonationVia: '#5A4088',
  skillIntonationTo: '#685888',

  artworkGlass: 'rgba(10,10,16,0.45)',
  artworkFallback: 'rgba(18,18,24,0.98)',

  addLeak: 'rgba(80,140,160,0.55)',
  addLeakHot: 'rgba(180,150,100,0.40)',

  frostFallback: 'rgba(14,24,34,0.94)',
  chromeScrim: 'rgba(0,0,0,0.70)',

  atmosphereAccent: '#5AD4E4',
  atmosphereAccentFaded: '#1A4A55',
  atmosphereAccentBg: 'rgba(90,212,228,0.18)',

  streakFlame: '#FF9500',
  proGold: '#FFB000',
  splashBackdrop: '#FFFFFF',
};

export const colors = { light, dark } as const;

/** One scheme's colors. Widened to `string` so the two maps are interchangeable —
 * `as const` alone would pin each key to its own literal and split the types. */
export type ThemeColors = { readonly [K in keyof typeof light]: string };

export type ColorSchemeName = keyof typeof colors;
