/**
 * Corner radii.
 *
 * Home mapping: stage → `hero` (36), card → `xl` (28), tile → `md` (20),
 * thumb → `sm` (12). Pair every non-`full` corner with `borderCurve: 'continuous'`.
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
  /** Cards: score, daily goal shelf, skill detail. */
  xl: 28,
  /** Stage. Still a squircle, not a stadium. */
  hero: 36,
  /** Capsules and circles. */
  full: 9999,
} as const;
