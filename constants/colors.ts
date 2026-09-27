/**
 * Every color in the app, keyed by color scheme. One map, no exceptions — if a
 * screen or component needs a color, it names one of these tokens.
 *
 * Light is a neutral pearl: a cool grey canvas with a faint warm edge, pure
 * near-black ink, and white cards, sampled from the `destination/` references
 * (see `docs/destination-1to1-plan.md` §5.1). Dark is deep plum until its own
 * pass. The two maps are written out separately; `dark` is never a spread of
 * `light`. Depth comes from canvas fog, grain, and chromatic meshes, plus frost
 * and solid cards.
 *
 * The `mesh*` families are self-lit artwork, so they carry the same values in
 * both schemes. White ink sits only in a mesh's Deep and Base regions; Glow and
 * Bloom are too light for it.
 *
 * There is one lime, `#D6FF4A`. `accent` is the fill, `onAccent` is the ink on
 * that fill, and `accentText` is lime read as text or stroke. The tab bar uses
 * `tabHighlight` and `onTabHighlight`, never lime.
 *
 * Marketing tokens stay light: the Paper site does not follow the app canvas.
 * Legacy keys stay so the type is stable; nothing new should read them.
 *
 * Read colors through `useTheme()` (`hooks/use-theme.ts`). This module stays
 * pure (no React) so token files, `lib/`, and the bun test scripts can import it.
 */

const light = {
  // --- Surfaces, fills, inverse, CTA, tab ---
  /** Nav theme background. Same value as `atmosphereCanvas`. */
  background: '#E8EAEE',
  /** Solid reading card. */
  card: '#FFFFFF',
  /** `GlassSurface tint="standard"`, tab pill. */
  glassTint: 'rgba(255,255,255,0.38)',
  /** `GlassSurface tint="strong"`, `PrimaryButton variant="frost"`. */
  glassTintStrong: 'rgba(255,255,255,0.60)',
  /** Legacy. Mirrors `frostFallback`. */
  glassFallback: 'rgba(255,255,255,0.58)',
  /** Translucent non-glass frost. Mesh and fog must show through. */
  frostFallback: 'rgba(255,255,255,0.72)',
  /** Hairline on every non-native frost surface and its fallback. */
  frostRim: 'rgba(255,255,255,0.90)',
  /** Opaque bed (syllable chip normal, failed knob). */
  fill: '#E3E1EA',
  /** Stronger opaque bed. */
  fillStrong: '#D6D3DF',
  /** Ghost buttons and beds over color. */
  fillTranslucent: 'rgba(13,13,13,0.05)',
  /** Solid pill, completed goal DayChip, save badge. */
  inverseSurface: '#0D0D0D',
  /** Ink on `inverseSurface`. */
  inverseLabel: '#FFFFFF',
  /** Disabled solid or knob. */
  inverseSurfaceMuted: 'rgba(23,20,31,0.24)',
  /** Knob pill track. At least 3:1 against `accent`. */
  ctaTrack: '#0D0D0D',
  /** Knob pill label. */
  ctaLabel: '#FFFFFF',
  /** Tab bar active capsule or circle. Never lime. */
  tabHighlight: '#0D0D0D',
  /** Active tab glyph and label. */
  onTabHighlight: '#FFFFFF',

  // --- Ink ---
  /** Primary ink. */
  foreground: '#0D0D0D',
  /** Support copy. */
  secondary: '#63676C',
  /** Units and quiet halves below 24pt. */
  tertiary: '#7A7E83',
  /** Teleprompter past text. */
  dimmed: '#868292',
  /** Faint half at 24pt and above, on canvas, card, or frost. */
  numeralFaint: 'rgba(13,13,13,0.28)',
  /** Strong ink on the canvas and on every chromatic mesh except artwork. */
  onAtmosphere: '#0D0D0D',
  /** Labels on mesh or canvas; quiet half below 24pt on mesh. */
  onAtmosphereMuted: 'rgba(13,13,13,0.60)',
  /** Faint half at 24pt and above on mesh; dotted ring track. */
  onAtmosphereFaint: 'rgba(13,13,13,0.28)',
  /** Ink on artwork. Mid-dark artwork, so this matches dark. */
  onArtwork: '#FBF8FF',
  /** Muted ink on artwork. */
  onArtworkMuted: 'rgba(251,248,255,0.74)',

  // --- Lines ---
  divider: 'rgba(13,13,13,0.07)',
  /** Unfilled portion of a tick meter or ring. */
  track: 'rgba(13,13,13,0.12)',
  /** A border meant to be seen as a border. */
  outline: 'rgba(13,16,24,0.14)',
  /** A filled bar for a day other than today. */
  bar: '#C9C5D2',
  /** Stub bar for a day with no data. */
  barEmpty: 'rgba(22,19,29,0.06)',

  // --- Accent and status ---
  /** Lime fill only: knob, selected axis chip, SelectionMark, cursorDot. */
  accent: '#D6FF4A',
  /** Ink on `accent`. */
  onAccent: '#141A00',
  /** Accent as text or stroke. Olive in light. */
  accentText: '#4E6600',
  /** Spoken words in the current sentence. */
  accentFaded: '#5A7030',
  /** Live-word bed, tip badge, weak syllable. */
  accentBg: 'rgba(214,255,74,0.45)',
  /** Improving delta only. */
  positive: '#0B8453',
  positiveBg: 'rgba(11,132,83,0.12)',
  /** Live drift, mispronounced verdict. */
  warn: '#A86400',
  /** FOCUS pill ink and dotted stroke. */
  focus: '#A15F0A',
  focusBg: 'rgba(214,140,30,0.14)',
  /** Validation, destructive actions, omitted verdict. */
  danger: '#D12F28',
  /** Legacy. Mirrors `accentText`. */
  atmosphereAccent: '#4E6600',
  /** Legacy. Mirrors `accentFaded`. */
  atmosphereAccentFaded: '#5A7030',
  /** Legacy. Mirrors `accentBg`. */
  atmosphereAccentBg: 'rgba(214,255,74,0.45)',
  /** Legacy. Mirrors `onAccent`. */
  axisChipInk: '#141A00',

  // --- Canvas, scrims, splash ---
  /** Canvas base, native underlay, sheet background. */
  atmosphereCanvas: '#E8EAEE',
  /** Top pool: rose. */
  canvasFog: 'rgba(214,224,236,0.60)',
  /** Ambient mid-left core and orb tint. */
  canvasFogCore: 'rgba(236,235,242,0.70)',
  /** Bottom bloom; the stage's lower pool. */
  canvasFogLow: 'rgba(240,228,218,0.60)',
  atmosphereScrim: 'rgba(232,234,238,0.60)',
  /** ProgressiveBlur peak. Canvas hue, never black. */
  chromeScrim: 'rgba(232,234,238,0.92)',
  /** Plum, for the white Lottie. */
  splashBackdrop: '#2A1838',
  streakFlame: '#E8710A',
  proGold: '#B8891F',

  // --- Hero mesh ---
  /** Top-left pool. */
  heroStopTop: '#C9BEF0',
  /** Base fill. */
  heroStopMid: '#F2C6B4',
  /** Bottom-right pool. */
  heroStopBottom: '#D9D7A0',
  /** Bottom-centre bloom. */
  heroStopAccent: '#F4A9C0',

  // --- LED, chart, cursor, dotted strokes ---
  /** Lit LED dots; results ring fill. */
  ledOn: '#16131D',
  /** Unlit LED dots; results ring dotted track. */
  ledOff: 'rgba(22,19,29,0.14)',
  /** Legacy. No glow, no shadow. */
  ledGlow: 'rgba(0,0,0,0)',
  chartLine: 'rgba(22,19,29,0.88)',
  chartGrid: 'rgba(22,19,29,0.14)',
  chartPartial: 'rgba(22,19,29,0.36)',
  /** Lens ring. */
  cursorRing: 'rgba(78,102,0,0.55)',
  /** Lens dot. */
  cursorDot: '#D6FF4A',
  dottedStrokeOnAtmosphere: 'rgba(22,19,29,0.22)',
  dottedStrokeOnFrost: 'rgba(22,19,29,0.18)',

  // --- Identity families. From = top-left, Via = bottom-right, To = base. ---
  metricMinutesFrom: '#9FDCD0',
  metricMinutesVia: '#CFE9C6',
  metricMinutesTo: '#E4F1EC',
  metricSessionsFrom: '#B9B8F2',
  metricSessionsVia: '#D8C8F0',
  metricSessionsTo: '#ECE8F8',
  metricStreakFrom: '#F6B99A',
  metricStreakVia: '#F3D5B5',
  metricStreakTo: '#F8ECE2',
  metricMasteredFrom: '#CFE08A',
  metricMasteredVia: '#E6E7B8',
  metricMasteredTo: '#F1F2E4',
  skillAccuracyFrom: '#4C6FE0',
  skillAccuracyVia: '#A9B9F2',
  skillAccuracyTo: '#E6EBFB',
  skillFluencyFrom: '#1E9E8C',
  skillFluencyVia: '#9AD9CD',
  skillFluencyTo: '#E2F4F0',
  skillPaceFrom: '#D9683C',
  skillPaceVia: '#F2B79C',
  skillPaceTo: '#FBEAE2',
  skillFillersFrom: '#D8527E',
  skillFillersVia: '#F0AFC5',
  skillFillersTo: '#FBE6EE',
  skillIntonationFrom: '#8A5CD6',
  skillIntonationVia: '#C9B2F0',
  skillIntonationTo: '#F0E9FB',

  // --- Artwork, add, marketing ---
  /** Icon well and rim on artwork. */
  artworkFill: 'rgba(255,255,255,0.22)',
  /** Bottom legibility gradient stop. */
  artworkScrim: 'rgba(28,16,40,0.30)',
  artworkScrimStrong: 'rgba(28,16,40,0.55)',
  artworkGlass: 'rgba(255,255,255,0.28)',
  artworkFallback: '#8F7FB0',
  // --- Card meshes (destination references). Same values in dark. ---
  // Deep = the text zone, Base = the fill, Glow = the luminous pool, Bloom =
  // the second hue. Teal is S4, olive and rose are S2's two cards, dusk is S3,
  // blue is S6.
  meshTealDeep: '#024A5C',
  meshTealBase: '#1A8F96',
  meshTealGlow: '#45DAC8',
  meshTealBloom: '#DFA0A1',
  meshOliveDeep: '#2B3505',
  meshOliveBase: '#5A682A',
  meshOliveGlow: '#C4DD68',
  meshOliveBloom: '#91A83D',
  meshDuskDeep: '#504621',
  meshDuskBase: '#8A6236',
  meshDuskGlow: '#AE7556',
  meshDuskBloom: '#A0685F',
  meshRoseDeep: '#7E5452',
  meshRoseBase: '#A2806E',
  meshRoseGlow: '#C1A57E',
  meshRoseBloom: '#B17C79',
  meshBlueDeep: '#153351',
  meshBlueBase: '#3E6D8E',
  meshBlueGlow: '#8EB6C9',
  meshBlueBloom: '#52A5C9',
  /** Legacy, dead. */
  addLeak: 'rgba(214,255,74,0)',
  /** Legacy, dead. */
  addLeakHot: 'rgba(214,255,74,0)',
  marketingCanvas: '#FFFFFF',
  marketingInk: '#111114',
  marketingMuted: '#77777E',
  marketingLine: '#E6E6EB',
  marketingInverse: '#1C1C21',
  marketingOnInverse: '#FFFFFF',
  marketingAccent: '#3478F6',
} as const;

const dark: Record<keyof typeof light, string> = {
  background: '#1A1122',
  card: '#2A2233',
  glassTint: 'rgba(42,30,56,0.40)',
  glassTintStrong: 'rgba(42,30,56,0.62)',
  glassFallback: 'rgba(52,40,66,0.62)',
  frostFallback: 'rgba(52,40,66,0.62)',
  frostRim: 'rgba(255,255,255,0.14)',
  fill: '#30283A',
  fillStrong: '#3B3246',
  fillTranslucent: 'rgba(255,255,255,0.08)',
  inverseSurface: '#F4F1F8',
  inverseLabel: '#1A1422',
  inverseSurfaceMuted: 'rgba(244,241,248,0.24)',
  ctaTrack: '#0F0B15',
  ctaLabel: '#F4F1F8',
  tabHighlight: '#F4F1F8',
  onTabHighlight: '#17101F',

  foreground: '#F6F2FA',
  secondary: '#B9B1C4',
  tertiary: '#8A8098',
  dimmed: '#6E6478',
  numeralFaint: 'rgba(246,242,250,0.30)',
  onAtmosphere: '#F6F2FA',
  onAtmosphereMuted: 'rgba(246,242,250,0.66)',
  onAtmosphereFaint: 'rgba(246,242,250,0.32)',
  onArtwork: '#FBF8FF',
  onArtworkMuted: 'rgba(251,248,255,0.70)',

  divider: 'rgba(255,255,255,0.10)',
  track: 'rgba(255,255,255,0.14)',
  outline: 'rgba(255,255,255,0.20)',
  bar: '#4A4056',
  barEmpty: 'rgba(255,255,255,0.07)',

  accent: '#D6FF4A',
  onAccent: '#141A00',
  accentText: '#D6FF4A',
  accentFaded: '#9DB85A',
  accentBg: 'rgba(214,255,74,0.18)',
  positive: '#46DE9C',
  positiveBg: 'rgba(70,222,156,0.16)',
  warn: '#FFB020',
  focus: '#F0B458',
  focusBg: 'rgba(240,180,88,0.16)',
  danger: '#FF6159',
  atmosphereAccent: '#D6FF4A',
  atmosphereAccentFaded: '#9DB85A',
  atmosphereAccentBg: 'rgba(214,255,74,0.18)',
  axisChipInk: '#141A00',

  atmosphereCanvas: '#1A1122',
  canvasFog: 'rgba(150,60,140,0.42)',
  canvasFogCore: 'rgba(118,86,210,0.40)',
  canvasFogLow: 'rgba(96,58,160,0.45)',
  atmosphereScrim: 'rgba(26,17,34,0.60)',
  chromeScrim: 'rgba(26,17,34,0.92)',
  splashBackdrop: '#1A1122',
  streakFlame: '#FF9F0A',
  proGold: '#E2B657',

  heroStopTop: '#3A2358',
  heroStopMid: '#6B3F86',
  heroStopBottom: '#2A1838',
  heroStopAccent: '#B06FC8',

  ledOn: '#F6F2FA',
  ledOff: 'rgba(246,242,250,0.16)',
  ledGlow: 'rgba(0,0,0,0)',
  chartLine: 'rgba(246,242,250,0.92)',
  chartGrid: 'rgba(246,242,250,0.16)',
  chartPartial: 'rgba(246,242,250,0.38)',
  cursorRing: 'rgba(214,255,74,0.50)',
  cursorDot: '#D6FF4A',
  dottedStrokeOnAtmosphere: 'rgba(246,242,250,0.22)',
  dottedStrokeOnFrost: 'rgba(246,242,250,0.18)',

  metricMinutesFrom: '#1F6B66',
  metricMinutesVia: '#2D5A4A',
  metricMinutesTo: '#16242A',
  metricSessionsFrom: '#3E3D9A',
  metricSessionsVia: '#5A3A88',
  metricSessionsTo: '#1C1832',
  metricStreakFrom: '#A34E34',
  metricStreakVia: '#7A3F52',
  metricStreakTo: '#2A1720',
  metricMasteredFrom: '#5F7424',
  metricMasteredVia: '#3F5A3A',
  metricMasteredTo: '#1C2218',
  skillAccuracyFrom: '#7C98FF',
  skillAccuracyVia: '#34457E',
  skillAccuracyTo: '#1C1F38',
  skillFluencyFrom: '#4FD1BE',
  skillFluencyVia: '#1F5A55',
  skillFluencyTo: '#132826',
  skillPaceFrom: '#FF9468',
  skillPaceVia: '#6E3524',
  skillPaceTo: '#2A1712',
  skillFillersFrom: '#FF86AE',
  skillFillersVia: '#6A2A45',
  skillFillersTo: '#2A1420',
  skillIntonationFrom: '#B996FF',
  skillIntonationVia: '#4A3380',
  skillIntonationTo: '#1F1734',

  artworkFill: 'rgba(255,255,255,0.14)',
  artworkScrim: 'rgba(14,8,20,0.42)',
  artworkScrimStrong: 'rgba(14,8,20,0.66)',
  artworkGlass: 'rgba(26,17,34,0.50)',
  artworkFallback: '#3A2C4A',
  meshTealDeep: '#024A5C',
  meshTealBase: '#1A8F96',
  meshTealGlow: '#45DAC8',
  meshTealBloom: '#DFA0A1',
  meshOliveDeep: '#2B3505',
  meshOliveBase: '#5A682A',
  meshOliveGlow: '#C4DD68',
  meshOliveBloom: '#91A83D',
  meshDuskDeep: '#504621',
  meshDuskBase: '#8A6236',
  meshDuskGlow: '#AE7556',
  meshDuskBloom: '#A0685F',
  meshRoseDeep: '#7E5452',
  meshRoseBase: '#A2806E',
  meshRoseGlow: '#C1A57E',
  meshRoseBloom: '#B17C79',
  meshBlueDeep: '#153351',
  meshBlueBase: '#3E6D8E',
  meshBlueGlow: '#8EB6C9',
  meshBlueBloom: '#52A5C9',
  addLeak: 'rgba(214,255,74,0)',
  addLeakHot: 'rgba(214,255,74,0)',
  marketingCanvas: '#FFFFFF',
  marketingInk: '#111114',
  marketingMuted: '#77777E',
  marketingLine: '#E6E6EB',
  marketingInverse: '#1C1C21',
  marketingOnInverse: '#FFFFFF',
  marketingAccent: '#3478F6',
};

export const colors = { light, dark } as const;

/** One scheme's colors. Widened to `string` so the two maps are interchangeable —
 * `as const` alone would pin each key to its own literal and split the types. */
export type ThemeColors = { readonly [K in keyof typeof light]: string };

export type ColorSchemeName = keyof typeof colors;
