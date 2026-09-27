/**
 * The type ramp. Named steps, mirroring the Apple text-style sizes so the app
 * feels native, rendered in SF Pro Rounded.
 *
 * Each step carries a size, a default face, and its optical tracking. Nothing
 * carries color: `colors` is keyed by scheme and resolves at render time, so a
 * static style object can't hold ink. Components apply color from `useTheme()`.
 *
 * Weight comes from `fontFamily`, never `fontWeight` — each SF Pro Rounded file
 * is a single face, and pairing one with a mismatched `fontWeight` makes iOS
 * synthesize the weight or fall back to the system font.
 *
 * Render these through `<ThemedText variant="..." />` so screens never touch
 * `fontSize`. Pass `weight` to override the default face at the same size.
 *
 * `lineHeight` is set on the display steps that need it, and on the `prose`
 * steps. A single-line label doesn't carry it, and setting it there shifts
 * the text in its box. Faint ink is legal only at 24pt and above.
 *
 * Numeral steps do not carry `fontVariant`. `ScoreValue` applies tabular nums.
 */

import type { TextStyle } from 'react-native';

import { fonts } from './fonts';

export const type = {
  /** Onboarding titles. Sign-in uses `sectionTitle`; paywall uses `largeTitle`. */
  display: { fontSize: 44, fontFamily: fonts.regular, letterSpacing: -1.4, lineHeight: 46 },
  /** Score hero. Faint and bold halves share this size inside `ScoreValue`. */
  numeralHero: { fontSize: 80, fontFamily: fonts.regular, letterSpacing: -3.2 },
  /** Large score. */
  numeralLarge: { fontSize: 56, fontFamily: fonts.regular, letterSpacing: -2 },
  /** Unit beside a hero or large numeral. */
  numeralUnit: { fontSize: 28, fontFamily: fonts.regular, letterSpacing: -0.6 },
  /** Fact and record tile numeral. */
  numeralTile: { fontSize: 28, fontFamily: fonts.medium, letterSpacing: -0.8 },
  /** Section heading. Also the sign-in statement. */
  sectionTitle: { fontSize: 24, fontFamily: fonts.medium, letterSpacing: -0.6 },
  /** Screen-level heading outside a navigation header. Paywall headline. */
  largeTitle: { fontSize: 34, fontFamily: fonts.medium, letterSpacing: -0.8, lineHeight: 40 },
  /** Section hero. */
  title: { fontSize: 22, fontFamily: fonts.semibold, letterSpacing: -0.4, lineHeight: 28 },
  title3: { fontSize: 20, fontFamily: fonts.semibold, letterSpacing: -0.3 },
  /** The default for anything that names something: card titles, row labels. */
  headline: { fontSize: 17, fontFamily: fonts.semibold, letterSpacing: -0.2 },
  body: { fontSize: 17, fontFamily: fonts.regular },
  callout: { fontSize: 16, fontFamily: fonts.semibold, letterSpacing: -0.2 },
  subhead: { fontSize: 15, fontFamily: fonts.semibold },
  /** Captions, units, meta rows. The most-used step in the app. */
  footnote: { fontSize: 13, fontFamily: fonts.medium },
  caption: { fontSize: 12, fontFamily: fonts.medium },
  /** All-caps label above a value. Tracking is wide because it is uppercase. */
  eyebrow: { fontSize: 12, fontFamily: fonts.semibold, letterSpacing: 0.8, lineHeight: 16 },
  /** Smallest readable step: day letters, tiny pills. */
  micro: { fontSize: 10, fontFamily: fonts.semibold, letterSpacing: 0.5 },
  /** Floating tab-bar labels. Below `micro` on purpose so an 80pt item fits. */
  tabLabel: { fontSize: 9.5, fontFamily: fonts.semibold },

  // --- Marketing site ---
  // These mirror the desktop and mobile ramps in the Paper landing page.
  marketingWordmark: {
    fontSize: 20,
    fontFamily: fonts.bold,
    letterSpacing: -0.6,
    lineHeight: 24,
  },
  marketingWordmarkMobile: {
    fontSize: 18,
    fontFamily: fonts.bold,
    letterSpacing: -0.54,
    lineHeight: 20,
  },
  marketingDisplay: {
    fontSize: 84,
    fontFamily: fonts.semibold,
    letterSpacing: -2.94,
    lineHeight: 84,
  },
  marketingDisplayMobile: {
    fontSize: 48,
    fontFamily: fonts.semibold,
    letterSpacing: -1.68,
    lineHeight: 48,
  },
  marketingSection: {
    fontSize: 52,
    fontFamily: fonts.semibold,
    letterSpacing: -1.82,
    lineHeight: 56,
  },
  marketingSectionMobile: {
    fontSize: 36,
    fontFamily: fonts.semibold,
    letterSpacing: -1.26,
    lineHeight: 40,
  },
  marketingFeature: { fontSize: 22, fontFamily: fonts.semibold, lineHeight: 28 },
  marketingFeatureMobile: { fontSize: 20, fontFamily: fonts.semibold, lineHeight: 24 },
  marketingBody: { fontSize: 18, fontFamily: fonts.regular, lineHeight: 28 },
  marketingBodyMobile: { fontSize: 16, fontFamily: fonts.regular, lineHeight: 24 },
  marketingHeroBodyMobile: { fontSize: 17, fontFamily: fonts.regular, lineHeight: 24 },
  marketingEyebrow: { fontSize: 18, fontFamily: fonts.semibold, lineHeight: 24 },
  marketingEyebrowMobile: { fontSize: 16, fontFamily: fonts.semibold, lineHeight: 24 },
  marketingNav: { fontSize: 14, fontFamily: fonts.medium, lineHeight: 18 },
  marketingNavStrong: { fontSize: 14, fontFamily: fonts.semibold, lineHeight: 18 },
  marketingButton: { fontSize: 14, fontFamily: fonts.semibold, lineHeight: 20 },
  marketingButtonMobile: { fontSize: 16, fontFamily: fonts.semibold, lineHeight: 20 },
  marketingKickerMobile: { fontSize: 14, fontFamily: fonts.semibold, lineHeight: 20 },
  marketingMeta: { fontSize: 12, fontFamily: fonts.medium, lineHeight: 20 },
  marketingMetaMobile: { fontSize: 13, fontFamily: fonts.medium, lineHeight: 20 },

  // --- Prose: multi-line copy, so these carry leading ---
  bodyProse: { fontSize: 17, fontFamily: fonts.regular, lineHeight: 24 },
  subheadProse: { fontSize: 15, fontFamily: fonts.regular, lineHeight: 21 },
  footnoteProse: { fontSize: 13, fontFamily: fonts.regular, lineHeight: 19 },
} as const satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;
