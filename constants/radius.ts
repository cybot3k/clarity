/**
 * Corner radii.
 *
 * Home mapping: sheet → `hero` (44), square card → `xxl` (40), compact card →
 * `xl` (28), tile → `md` (20), thumb → `sm` (12). Pair every non-`full` corner
 * with `borderCurve: 'continuous'`.
 *
 * `xxl` and `hero` are measured from the `destination/` references: a ≈275pt
 * square card there turns its corner over ≈58pt, which a continuous curve draws
 * at radius ≈40. The sheet holds those cards 12 in, so 44 keeps it concentric.
 *
 * Use `full` for anything circular (avatars, circle buttons, pills) instead of
 * half the element's height: a hardcoded half breaks silently when the size
 * changes.
 */
export const radius = {
  /** Chips, focus pills, thin bars. */
  xs: 6,
  /** Text inputs, small tiles, thumbs. */
  sm: 12,
  /** Icon beds and square tiles. */
  md: 20,
  /** Compact cards. */
  lg: 24,
  /** Cards: score, skill detail, compact stat tiles. */
  xl: 28,
  /** Square cards: Home's passage and progress cards. */
  xxl: 40,
  /** Sheet and stage. Still a squircle, not a stadium. */
  hero: 44,
  /** Capsules and circles. */
  full: 9999,
} as const;
